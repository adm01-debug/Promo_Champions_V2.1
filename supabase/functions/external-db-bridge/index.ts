import { createClient } from "npm:@supabase/supabase-js@2.49.4";
import { corsHeaders } from "../_shared/cors.ts";

const SLOW_QUERY_THRESHOLD_MS = 3000;
const VERY_SLOW_QUERY_THRESHOLD_MS = 8000;

function emitTelemetry(meta: {
  operation: string;
  table?: string;
  rpcName?: string;
  limit?: number;
  offset?: number;
  countMode?: string;
  durationMs: number;
  recordCount?: number;
  status: "ok" | "error" | "slow" | "very_slow";
  error?: string;
  userId?: string | null;
}) {
  const icon = meta.status === "very_slow" ? "🔴"
    : meta.status === "slow" ? "🟡"
    : meta.status === "error" ? "❌"
    : "✅";

  const target = meta.rpcName || meta.table || "unknown";
  const line = `${icon} [telemetry] ${meta.operation}:${target} ${meta.durationMs}ms` +
    ` | records=${meta.recordCount ?? "-"}` +
    ` limit=${meta.limit ?? "-"}` +
    ` offset=${meta.offset ?? "-"}` +
    ` count=${meta.countMode ?? "-"}`;

  if (meta.status === "very_slow") {
    console.warn(`⚠️ VERY SLOW QUERY: ${line}`);
  } else if (meta.status === "slow") {
    console.warn(`⚠️ SLOW QUERY: ${line}`);
  } else if (meta.status === "error") {
    console.error(line + ` error=${meta.error}`);
  } else {
    console.info(line);
  }

  // Persist to local DB (fire-and-forget) — only for non-ok statuses
  if (meta.status !== "ok") {
    try {
      const localUrl = Deno.env.get("SUPABASE_URL");
      const serviceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");
      if (localUrl && serviceKey) {
        const localClient = createClient(localUrl, serviceKey);
        localClient.from("query_telemetry").insert({
          operation: meta.operation,
          table_name: meta.table || null,
          rpc_name: meta.rpcName || null,
          duration_ms: meta.durationMs,
          record_count: meta.recordCount ?? null,
          query_limit: meta.limit ?? null,
          query_offset: meta.offset ?? null,
          count_mode: meta.countMode || null,
          severity: meta.status,
          error_message: meta.error || null,
          user_id: meta.userId || null,
        }).then(({ error: insertErr }) => {
          if (insertErr) console.warn("[telemetry-persist] Insert failed:", insertErr.message);
        });
      }
    } catch (_e) {
      // Fire-and-forget: NEVER block main response
    }
  }
}

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  try {
    const { operation, table, rpcName, columns, filters, data: bodyData, limit, offset, countMode } = await req.json();

    // Get user from auth header
    const authHeader = req.headers.get("Authorization");
    let userId: string | null = null;
    if (authHeader) {
      const localUrl = Deno.env.get("SUPABASE_URL")!;
      const localAnon = Deno.env.get("SUPABASE_ANON_KEY")!;
      const localClient = createClient(localUrl, localAnon, {
        global: { headers: { Authorization: authHeader } },
      });
      const { data: { user } } = await localClient.auth.getUser();
      userId = user?.id || null;
    }

    // Connect to external DB
    const externalUrl = Deno.env.get("EXTERNAL_SUPABASE_URL");
    const externalKey = Deno.env.get("EXTERNAL_SUPABASE_ANON_KEY");

    if (!externalUrl || !externalKey) {
      return new Response(
        JSON.stringify({ error: "External database not configured" }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const externalClient = createClient(externalUrl, externalKey);

    const selectColumns = columns || "*";
    const queryLimit = limit || 100;
    const queryOffset = offset || 0;
    const queryCountMode = countMode || "none";

    if (operation === "select") {
      const startTime = performance.now();
      let query = externalClient
        .from(table)
        .select(selectColumns, { count: queryCountMode === "none" ? undefined : queryCountMode as any });

      // Apply filters
      if (filters) {
        for (const f of filters) {
          if (f.type === "eq") query = query.eq(f.column, f.value);
          else if (f.type === "neq") query = query.neq(f.column, f.value);
          else if (f.type === "gt") query = query.gt(f.column, f.value);
          else if (f.type === "gte") query = query.gte(f.column, f.value);
          else if (f.type === "lt") query = query.lt(f.column, f.value);
          else if (f.type === "lte") query = query.lte(f.column, f.value);
          else if (f.type === "like") query = query.like(f.column, f.value);
          else if (f.type === "ilike") query = query.ilike(f.column, f.value);
          else if (f.type === "in") query = query.in(f.column, f.value);
          else if (f.type === "order") query = query.order(f.column, { ascending: f.ascending ?? true });
        }
      }

      query = query.range(queryOffset, queryOffset + queryLimit - 1);

      const { data: selectData, error: selectError, count } = await query;
      const durationMs = Math.round(performance.now() - startTime);

      const status = selectError ? "error"
        : durationMs >= VERY_SLOW_QUERY_THRESHOLD_MS ? "very_slow"
        : durationMs >= SLOW_QUERY_THRESHOLD_MS ? "slow"
        : "ok";

      emitTelemetry({
        operation: "select", table, limit: queryLimit, offset: queryOffset,
        countMode: queryCountMode, durationMs, status,
        recordCount: selectData?.length ?? 0,
        error: selectError?.message, userId,
      });

      if (selectError) {
        return new Response(JSON.stringify({ error: selectError.message }), {
          status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }

      return new Response(JSON.stringify({ data: selectData, count, duration_ms: durationMs }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    if (operation === "rpc") {
      const startTime = performance.now();
      const { data: rpcData, error: rpcError } = await externalClient.rpc(rpcName, bodyData || {});
      const durationMs = Math.round(performance.now() - startTime);

      const status = rpcError ? "error"
        : durationMs >= VERY_SLOW_QUERY_THRESHOLD_MS ? "very_slow"
        : durationMs >= SLOW_QUERY_THRESHOLD_MS ? "slow"
        : "ok";

      emitTelemetry({
        operation: "rpc", rpcName, durationMs, status,
        recordCount: Array.isArray(rpcData) ? rpcData.length : undefined,
        error: rpcError?.message, userId,
      });

      if (rpcError) {
        return new Response(JSON.stringify({ error: rpcError.message }), {
          status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }

      return new Response(JSON.stringify({ data: rpcData, duration_ms: durationMs }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // insert/update/delete
    if (["insert", "update", "delete"].includes(operation)) {
      const startTime = performance.now();
      let result;

      if (operation === "insert") {
        result = await externalClient.from(table).insert(bodyData).select();
      } else if (operation === "update") {
        let q = externalClient.from(table).update(bodyData);
        if (filters) {
          for (const f of filters) {
            if (f.type === "eq") q = q.eq(f.column, f.value);
          }
        }
        result = await q.select();
      } else {
        let q = externalClient.from(table).delete();
        if (filters) {
          for (const f of filters) {
            if (f.type === "eq") q = q.eq(f.column, f.value);
          }
        }
        result = await q.select();
      }

      const durationMs = Math.round(performance.now() - startTime);
      const status = result.error ? "error"
        : durationMs >= VERY_SLOW_QUERY_THRESHOLD_MS ? "very_slow"
        : durationMs >= SLOW_QUERY_THRESHOLD_MS ? "slow"
        : "ok";

      emitTelemetry({
        operation, table, durationMs, status,
        recordCount: result.data?.length ?? 0,
        error: result.error?.message, userId,
      });

      if (result.error) {
        return new Response(JSON.stringify({ error: result.error.message }), {
          status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }

      return new Response(JSON.stringify({ data: result.data, duration_ms: durationMs }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    return new Response(JSON.stringify({ error: `Unknown operation: ${operation}` }), {
      status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (err) {
    console.error("Bridge error:", err);
    return new Response(JSON.stringify({ error: err.message }), {
      status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
