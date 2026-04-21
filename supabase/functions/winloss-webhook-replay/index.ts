import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient, SupabaseClient } from "https://esm.sh/@supabase/supabase-js@2.49.4";
import { z } from "https://esm.sh/zod@3.23.8";
import { describeError } from "../winloss-webhook-dispatcher/retry.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

function jlog(level: "info" | "warn" | "error", data: Record<string, unknown>) {
  const line = JSON.stringify({ fn: "winloss-webhook-replay", level, ts: new Date().toISOString(), ...data });
  if (level === "error") console.error(line);
  else if (level === "warn") console.warn(line);
  else console.log(line);
}

function jsonResponse(body: unknown, status = 200): Response {
  return new Response(JSON.stringify(body), {
    status,
    headers: { ...corsHeaders, "Content-Type": "application/json" },
  });
}

// --- Zod schema (accepts dead_letter_ids OR delivery_ids; also singular forms) ---
const idArray = z.array(z.string().uuid()).min(1).max(50);

const RawBodySchema = z.object({
  dead_letter_ids: z.array(z.string()).optional(),
  dead_letter_id: z.string().optional(),
  delivery_ids: z.array(z.string()).optional(),
  delivery_id: z.string().optional(),
});

const BodySchema = z.preprocess((raw) => {
  const parsed = RawBodySchema.safeParse(raw ?? {});
  if (!parsed.success) return raw;
  const v = parsed.data;
  const dlq = v.dead_letter_ids ?? (v.dead_letter_id ? [v.dead_letter_id] : undefined);
  const del = v.delivery_ids ?? (v.delivery_id ? [v.delivery_id] : undefined);
  return { dead_letter_ids: dlq, delivery_ids: del };
}, z.union([
  z.object({ dead_letter_ids: idArray, delivery_ids: z.undefined() }),
  z.object({ dead_letter_ids: z.undefined(), delivery_ids: idArray }),
]));

interface SourceRow {
  id: string;
  subscription_id: string;
  event: string;
  payload: Record<string, unknown>;
  replay_count: number;
  dlq?: boolean;
  succeeded?: boolean;
}

type StatusLabel = "succeeded" | "failed" | "skipped";

interface ReplayResult {
  id: string;
  succeeded: boolean;
  status: number;
  status_label: StatusLabel;
  error: string | null;
  attempts?: number;
  skipped?: boolean;
}

async function assertAdmin(
  supabase: SupabaseClient,
  userId: string,
  requestId: string,
): Promise<Response | null> {
  const { data, error } = await supabase
    .from("user_roles")
    .select("role")
    .eq("user_id", userId)
    .eq("role", "admin")
    .maybeSingle();
  if (error) {
    jlog("error", { msg: "auth_role_lookup_failed", requestId, userId, ...describeError(error) });
    return jsonResponse({ error: "Forbidden", requestId }, 403);
  }
  if (!data) {
    jlog("warn", { msg: "auth_forbidden", requestId, userId });
    return jsonResponse({ error: "Forbidden", requestId }, 403);
  }
  return null;
}

async function persistDlqOutcome(
  supabase: SupabaseClient,
  row: SourceRow,
  result: { succeeded: boolean; status: number; error: string | null },
): Promise<void> {
  const update: Record<string, unknown> = {
    status: result.succeeded ? "replayed" : "pending",
    replay_count: row.replay_count + 1,
    last_replay_at: new Date().toISOString(),
    last_replay_status: result.status,
    last_replay_error: result.succeeded ? null : result.error,
  };
  const { error } = await supabase
    .from("winloss_webhook_dead_letters")
    .update(update)
    .eq("id", row.id);
  if (error) {
    jlog("error", { msg: "dlq_outcome_persist_failed", id: row.id, ...describeError(error) });
  }
}

serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });
  const requestId = crypto.randomUUID();

  try {
    // --- Auth ---
    const authHeader = req.headers.get("Authorization");
    if (!authHeader?.startsWith("Bearer ")) {
      return jsonResponse({ error: "Unauthorized", requestId }, 401);
    }
    const token = authHeader.replace("Bearer ", "");

    const supabaseAuth = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_ANON_KEY")!,
      { global: { headers: { Authorization: authHeader } } },
    );
    const { data: claimsData, error: claimsErr } = await supabaseAuth.auth.getClaims(token);
    if (claimsErr || !claimsData?.claims?.sub) {
      jlog("warn", { msg: "auth_invalid_token", requestId, ...(claimsErr ? describeError(claimsErr) : {}) });
      return jsonResponse({ error: "Unauthorized", requestId }, 401);
    }
    const userId = claimsData.claims.sub as string;

    const supabase = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!,
    );

    // --- Admin check ---
    const denied = await assertAdmin(supabase, userId, requestId);
    if (denied) return denied;

    // --- Zod input validation ---
    const rawBody = await req.json().catch(() => ({}));
    const parsed = BodySchema.safeParse(rawBody);
    if (!parsed.success) {
      jlog("warn", { msg: "invalid_input", requestId, details: parsed.error.flatten() });
      return jsonResponse({
        error: "invalid_input",
        message: "Provide exactly one of dead_letter_ids or delivery_ids (1–50 valid UUIDs).",
        details: parsed.error.flatten(),
        requestId,
      }, 400);
    }

    const source: "dlq" | "delivery" = parsed.data.dead_letter_ids ? "dlq" : "delivery";
    const ids: string[] = (parsed.data.dead_letter_ids ?? parsed.data.delivery_ids) as string[];

    // --- Load source rows ---
    let rows: SourceRow[] = [];

    if (source === "dlq") {
      const { data, error } = await supabase
        .from("winloss_webhook_dead_letters")
        .select("id, subscription_id, event, payload, replay_count")
        .in("id", ids);
      if (error) throw error;
      rows = (data ?? []).map((r) => ({
        id: r.id as string,
        subscription_id: r.subscription_id as string,
        event: r.event as string,
        payload: (r.payload ?? {}) as Record<string, unknown>,
        replay_count: (r.replay_count ?? 0) as number,
        dlq: true,
      }));

      // Mark replaying (best-effort)
      if (rows.length) {
        const { error: markErr } = await supabase
          .from("winloss_webhook_dead_letters")
          .update({ status: "replaying" })
          .in("id", rows.map((r) => r.id));
        if (markErr) jlog("warn", { msg: "dlq_mark_replaying_failed", requestId, ...describeError(markErr) });
      }
    } else {
      const { data, error } = await supabase
        .from("winloss_webhook_deliveries")
        .select("id, subscription_id, event, payload, succeeded")
        .in("id", ids);
      if (error) throw error;
      rows = (data ?? []).map((r) => ({
        id: r.id as string,
        subscription_id: r.subscription_id as string,
        event: r.event as string,
        payload: (r.payload ?? {}) as Record<string, unknown>,
        succeeded: r.succeeded as boolean,
        replay_count: 0,
      }));
    }

    jlog("info", { msg: "replay_start", requestId, source, count: rows.length, ids });

    const results: ReplayResult[] = [];

    // --- Process each id ---
    for (const row of rows) {
      // Skip already-succeeded deliveries (no-op for DLQ source)
      if (source === "delivery" && row.succeeded) {
        results.push({
          id: row.id,
          succeeded: false,
          status: 0,
          status_label: "skipped",
          error: "already_succeeded",
          skipped: true,
        });
        continue;
      }

      try {
        const dispatchBody: Record<string, unknown> = {
          ...row.payload,
          event: row.event,
          __target_subscription_id: row.subscription_id,
        };
        if (source === "dlq") dispatchBody.__replay_of = row.id;

        const { data, error } = await supabase.functions.invoke("winloss-webhook-dispatcher", {
          body: dispatchBody,
        });
        if (error) throw error;

        const r = (data?.results?.[0] ?? {}) as {
          succeeded?: boolean;
          status?: number;
          error?: string | null;
          attempts?: number;
        };
        const succeeded = !!r.succeeded;
        const outcome: ReplayResult = {
          id: row.id,
          succeeded,
          status: r.status ?? 0,
          status_label: succeeded ? "succeeded" : "failed",
          error: r.error ?? null,
          attempts: typeof r.attempts === "number" ? r.attempts : undefined,
        };
        results.push(outcome);

        if (source === "dlq") {
          await persistDlqOutcome(supabase, row, {
            succeeded,
            status: outcome.status,
            error: outcome.error,
          });
        }
      } catch (e) {
        const d = describeError(e);
        const errMsg = `${d.error_name}: ${d.error}`;
        jlog("error", { msg: "replay_item_failed", requestId, id: row.id, source, ...d });

        if (source === "dlq") {
          await persistDlqOutcome(supabase, row, {
            succeeded: false,
            status: 0,
            error: errMsg,
          });
        }

        results.push({
          id: row.id,
          succeeded: false,
          status: 0,
          status_label: "failed",
          error: errMsg,
        });
      }
    }

    const summary = {
      total: results.length,
      succeeded: results.filter((r) => r.status_label === "succeeded").length,
      failed: results.filter((r) => r.status_label === "failed").length,
      skipped: results.filter((r) => r.status_label === "skipped").length,
    };

    jlog("info", { msg: "replay_complete", requestId, source, summary });

    return jsonResponse({ requestId, source, summary, results });
  } catch (e) {
    jlog("error", { msg: "replay_fatal", requestId, ...describeError(e) });
    return jsonResponse({
      error: e instanceof Error ? e.message : "unknown",
      requestId,
    }, 500);
  }
});
