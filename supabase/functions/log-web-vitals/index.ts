import { createClient } from "npm:@supabase/supabase-js@2.49.4";
import { getCorsHeaders } from "../_shared/cors.ts";
import { withRequestId } from "../_shared/request-id.ts";
import { enforceRateLimit } from "../_shared/rate-limit.ts";

interface Sample {
  route: string;
  metric: "LCP" | "INP" | "CLS" | "FCP" | "TTFB";
  value: number;
  rating: "good" | "needs-improvement" | "poor";
  navigation_type?: string | null;
  session_id?: string | null;
  viewport_width?: number | null;
  connection_type?: string | null;
  user_id?: string | null;
}

const ALLOWED_METRICS = new Set(["LCP", "INP", "CLS", "FCP", "TTFB"]);
const ALLOWED_RATINGS = new Set(["good", "needs-improvement", "poor"]);

function sanitize(raw: unknown, ua: string | null): Sample | null {
  if (!raw || typeof raw !== "object") return null;
  const o = raw as Record<string, unknown>;
  const route = typeof o.route === "string" ? o.route.slice(0, 200) : null;
  const metric = typeof o.metric === "string" ? o.metric : null;
  const value = typeof o.value === "number" && Number.isFinite(o.value) ? o.value : null;
  const rating = typeof o.rating === "string" ? o.rating : null;
  if (!route || !metric || value === null || !rating) return null;
  if (!ALLOWED_METRICS.has(metric) || !ALLOWED_RATINGS.has(rating)) return null;
  if (value < 0 || value > 600000) return null;
  return {
    route,
    metric: metric as Sample["metric"],
    value,
    rating: rating as Sample["rating"],
    navigation_type: typeof o.navigation_type === "string" ? o.navigation_type.slice(0, 40) : null,
    session_id: typeof o.session_id === "string" ? o.session_id.slice(0, 64) : null,
    viewport_width: typeof o.viewport_width === "number" ? Math.round(o.viewport_width) : null,
    connection_type: typeof o.connection_type === "string" ? o.connection_type.slice(0, 20) : null,
    user_id: typeof o.user_id === "string" && /^[0-9a-f-]{36}$/i.test(o.user_id) ? o.user_id : null,
  };
}

Deno.serve(
  withRequestId("log-web-vitals", async (req, ctx) => {
    if (req.method === "OPTIONS") return new Response(null, { headers: getCorsHeaders(req) });
    if (req.method !== "POST") {
      return new Response("Method not allowed", { status: 405, headers: getCorsHeaders(req) });
    }

    // S1: rate-limit por IP — 120 req / 60s por isolate (bypass p/ requisições autenticadas)
    const rl = enforceRateLimit(req, { name: "log-web-vitals", limit: 120, windowSeconds: 60 });
    if (rl) return rl;

    try {
      const ua = req.headers.get("user-agent");
      const body = await req.json();
      const samples: unknown[] = Array.isArray(body) ? body : Array.isArray(body?.samples) ? body.samples : [body];
      const clean = samples
        .slice(0, 20)
        .map((s) => sanitize(s, ua))
        .filter((s): s is Sample => s !== null)
        .map((s) => ({ ...s, user_agent: ua?.slice(0, 300) ?? null }));

      if (clean.length === 0) {
        return new Response(JSON.stringify({ inserted: 0, request_id: ctx.requestId }), {
          status: 200,
          headers: { ...getCorsHeaders(req), "Content-Type": "application/json" },
        });
      }

      const supabase = createClient(
        Deno.env.get("SUPABASE_URL")!,
        Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!,
      );

      const { error } = await supabase.from("web_vitals_samples").insert(clean);
      if (error) {
        ctx.log("error", "insert_failed", { error: error.message });
        return new Response(JSON.stringify({ error: error.message, request_id: ctx.requestId }), {
          status: 500,
          headers: { ...getCorsHeaders(req), "Content-Type": "application/json" },
        });
      }

      return new Response(JSON.stringify({ inserted: clean.length, request_id: ctx.requestId }), {
        status: 200,
        headers: { ...getCorsHeaders(req), "Content-Type": "application/json" },
      });
    } catch (e) {
      ctx.log("error", "bad_request", { error: e instanceof Error ? e.message : String(e) });
      return new Response(JSON.stringify({ error: "bad_request", request_id: ctx.requestId }), {
        status: 400,
        headers: { ...getCorsHeaders(req), "Content-Type": "application/json" },
      });
    }
  }),
);
