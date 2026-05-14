import { corsHeaders } from "../_shared/cors.ts";
import { createClient } from "npm:@supabase/supabase-js@2.49.4";
import {
  BatchBodySchema,
  DEFAULT_CHUNK_SIZE,
  MAX_BATCH_TOTAL,
  MAX_CHUNK_SIZE,
} from "./schema.ts";



function jlog(level: "info" | "warn" | "error", data: Record<string, unknown>) {
  const line = JSON.stringify({
    fn: "winloss-webhook-replay-batch",
    level,
    ts: new Date().toISOString(),
    ...data,
  });
  if (level === "error") console.error(line);
  else if (level === "warn") console.warn(line);
  else console.info(line);
}

function jsonResponse(body: unknown, status = 200, requestId?: string): Response {
  const headers: Record<string, string> = {
    ...corsHeaders,
    "Content-Type": "application/json",
  };
  if (requestId) headers["X-Request-Id"] = requestId;
  return new Response(JSON.stringify(body), { status, headers });
}

interface PerItemResult {
  id: string;
  succeeded: boolean;
  status: number;
  status_label?: "succeeded" | "failed" | "skipped";
  error: string | null;
}

interface BatchSummary {
  index: number;
  size: number;
  invoked: boolean;
  /** Set when the chunk invocation itself succeeded (HTTP-level). */
  request_id?: string;
  succeeded: number;
  failed: number;
  skipped: number;
  duration_ms: number;
  /** Transport-level error (function unreachable / 5xx). */
  error: string | null;
  results: PerItemResult[];
}

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

  const inboundReqId =
    req.headers.get("x-request-id") ?? req.headers.get("X-Request-Id") ?? crypto.randomUUID();

  if (req.method !== "POST") {
    return jsonResponse({ error: "method_not_allowed", requestId: inboundReqId }, 405, inboundReqId);
  }

  // Parse body
  let raw: unknown;
  try {
    raw = await req.json();
  } catch {
    return jsonResponse(
      { error: "invalid_json", requestId: inboundReqId },
      400,
      inboundReqId,
    );
  }

  const parsed = BatchBodySchema.safeParse(raw);
  if (!parsed.success) {
    return jsonResponse(
      {
        error: "invalid_body",
        details: parsed.error.flatten(),
        limits: { MAX_BATCH_TOTAL, MAX_CHUNK_SIZE, DEFAULT_CHUNK_SIZE },
        requestId: inboundReqId,
      },
      400,
      inboundReqId,
    );
  }

  const body = parsed.data;
  const ids = body.dead_letter_ids ?? body.delivery_ids ?? [];
  const sourceKey: "dead_letter_ids" | "delivery_ids" = body.dead_letter_ids
    ? "dead_letter_ids"
    : "delivery_ids";
  const chunkSize = body.chunk_size ?? DEFAULT_CHUNK_SIZE;
  const stopOnError = body.stop_on_error ?? false;

  // Auth: forward caller's JWT to the underlying replay function so its
  // existing admin check (assertAdmin) continues to enforce RBAC.
  const authHeader = req.headers.get("Authorization");
  if (!authHeader) {
    return jsonResponse(
      { error: "missing_authorization", requestId: inboundReqId },
      401,
      inboundReqId,
    );
  }

  const SUPABASE_URL = Deno.env.get("SUPABASE_URL");
  const ANON = Deno.env.get("SUPABASE_ANON_KEY");
  if (!SUPABASE_URL || !ANON) {
    jlog("error", { msg: "missing_env", requestId: inboundReqId });
    return jsonResponse(
      { error: "server_misconfigured", requestId: inboundReqId },
      500,
      inboundReqId,
    );
  }

  // Client used only to invoke the inner edge function with caller's JWT.
  const client = createClient(SUPABASE_URL, ANON, {
    global: { headers: { Authorization: authHeader } },
  });

  // Dedupe + chunk
  const unique = Array.from(new Set(ids));
  const chunks: string[][] = [];
  for (let i = 0; i < unique.length; i += chunkSize) {
    chunks.push(unique.slice(i, i + chunkSize));
  }

  jlog("info", {
    msg: "batch_started",
    requestId: inboundReqId,
    source: sourceKey,
    total: unique.length,
    chunk_size: chunkSize,
    chunks: chunks.length,
    stop_on_error: stopOnError,
  });

  const startedAt = Date.now();
  const batches: BatchSummary[] = [];
  let aborted = false;
  let abortReason: string | null = null;

  for (let i = 0; i < chunks.length; i++) {
    if (aborted) {
      batches.push({
        index: i,
        size: chunks[i].length,
        invoked: false,
        succeeded: 0,
        failed: 0,
        skipped: 0,
        duration_ms: 0,
        error: "aborted_after_previous_chunk_error",
        results: [],
      });
      continue;
    }

    const t0 = Date.now();
    const chunkReqId = crypto.randomUUID();
    try {
      const { data, error } = await client.functions.invoke<{
        requestId: string;
        results: PerItemResult[];
      }>("winloss-webhook-replay", {
        body: { [sourceKey]: chunks[i] },
        headers: { "X-Request-Id": chunkReqId },
      });

      if (error) {
        const dur = Date.now() - t0;
        const msg = error.message || "invoke_failed";
        jlog("warn", {
          msg: "chunk_invoke_error",
          requestId: inboundReqId,
          chunk_request_id: chunkReqId,
          chunk_index: i,
          chunk_size: chunks[i].length,
          duration_ms: dur,
          error: msg,
        });
        batches.push({
          index: i,
          size: chunks[i].length,
          invoked: false,
          request_id: chunkReqId,
          succeeded: 0,
          failed: chunks[i].length,
          skipped: 0,
          duration_ms: dur,
          error: msg,
          results: [],
        });
        if (stopOnError) {
          aborted = true;
          abortReason = `chunk_${i}_invoke_failed: ${msg}`;
        }
        continue;
      }

      const results = data?.results ?? [];
      const succeeded = results.filter((r) => r.succeeded).length;
      const skipped = results.filter((r) => r.status_label === "skipped").length;
      const failed = results.length - succeeded - skipped;
      const dur = Date.now() - t0;

      batches.push({
        index: i,
        size: chunks[i].length,
        invoked: true,
        request_id: data?.requestId ?? chunkReqId,
        succeeded,
        failed,
        skipped,
        duration_ms: dur,
        error: null,
        results,
      });
    } catch (e) {
      const dur = Date.now() - t0;
      const msg = e instanceof Error ? e.message : String(e);
      jlog("error", {
        msg: "chunk_threw",
        requestId: inboundReqId,
        chunk_request_id: chunkReqId,
        chunk_index: i,
        chunk_size: chunks[i].length,
        duration_ms: dur,
        error: msg,
      });
      batches.push({
        index: i,
        size: chunks[i].length,
        invoked: false,
        request_id: chunkReqId,
        succeeded: 0,
        failed: chunks[i].length,
        skipped: 0,
        duration_ms: dur,
        error: msg,
        results: [],
      });
      if (stopOnError) {
        aborted = true;
        abortReason = `chunk_${i}_threw: ${msg}`;
      }
    }
  }

  const totalDuration = Date.now() - startedAt;
  const aggregate = batches.reduce(
    (acc, b) => {
      acc.succeeded += b.succeeded;
      acc.failed += b.failed;
      acc.skipped += b.skipped;
      acc.invoked_chunks += b.invoked ? 1 : 0;
      return acc;
    },
    { succeeded: 0, failed: 0, skipped: 0, invoked_chunks: 0 },
  );

  jlog("info", {
    msg: "batch_finished",
    requestId: inboundReqId,
    total_ids: unique.length,
    chunks: chunks.length,
    invoked_chunks: aggregate.invoked_chunks,
    succeeded: aggregate.succeeded,
    failed: aggregate.failed,
    skipped: aggregate.skipped,
    duration_ms: totalDuration,
    aborted,
  });

  return jsonResponse(
    {
      requestId: inboundReqId,
      source: sourceKey,
      total: unique.length,
      chunk_size: chunkSize,
      chunks: chunks.length,
      aborted,
      abort_reason: abortReason,
      duration_ms: totalDuration,
      aggregate,
      batches,
      limits: { MAX_BATCH_TOTAL, MAX_CHUNK_SIZE, DEFAULT_CHUNK_SIZE },
    },
    200,
    inboundReqId,
  );
});
