import { createClient } from "npm:@supabase/supabase-js@2.49.4";
import { corsHeaders } from "../_shared/cors.ts";
import { withRequestId } from "../_shared/request-id.ts";
import { readUtf8BodyWithinLimit } from "../_shared/request-body.ts";
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
}

const ALLOWED_METRICS = new Set(["LCP", "INP", "CLS", "FCP", "TTFB"]);
const ALLOWED_RATINGS = new Set(["good", "needs-improvement", "poor"]);
const ALLOWED_NAVIGATION_TYPES = new Set(["navigate", "reload", "back-forward", "prerender"]);
const ALLOWED_CONNECTION_TYPES = new Set(["slow-2g", "2g", "3g", "4g"]);
const MAX_BODY_BYTES = 32 * 1024;
const SAFE_SESSION_ID = /^[A-Za-z0-9_-]{8,64}$/;

function sanitize(raw: unknown): Sample | null {
  if (!raw || typeof raw !== "object") return null;
  const o = raw as Record<string, unknown>;
  const route = typeof o.route === "string" ? o.route.trim() : null;
  const metric = typeof o.metric === "string" ? o.metric : null;
  const value = typeof o.value === "number" && Number.isFinite(o.value) ? o.value : null;
  const rating = typeof o.rating === "string" ? o.rating : null;
  if (!route || route.length > 200 || !route.startsWith("/") || !metric || value === null || !rating) {
    return null;
  }
  if (!ALLOWED_METRICS.has(metric) || !ALLOWED_RATINGS.has(rating)) return null;
  if (value < 0 || value > 600000) return null;

  const viewportWidth = typeof o.viewport_width === "number" &&
      Number.isFinite(o.viewport_width) && o.viewport_width >= 0 && o.viewport_width <= 20_000
    ? Math.round(o.viewport_width)
    : null;

  return {
    route,
    metric: metric as Sample["metric"],
    value,
    rating: rating as Sample["rating"],
    navigation_type: typeof o.navigation_type === "string" && ALLOWED_NAVIGATION_TYPES.has(o.navigation_type)
      ? o.navigation_type
      : null,
    session_id: typeof o.session_id === "string" && SAFE_SESSION_ID.test(o.session_id)
      ? o.session_id
      : null,
    viewport_width: viewportWidth,
    connection_type: typeof o.connection_type === "string" && ALLOWED_CONNECTION_TYPES.has(o.connection_type)
      ? o.connection_type
      : null,
  };
}

Deno.serve(
  withRequestId("log-web-vitals", async (req, ctx) => {
    if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });
    if (req.method !== "POST") {
      return new Response("Method not allowed", { status: 405, headers: corsHeaders });
    }

    // Telemetria pública não deve aceitar um Bearer sintático como bypass de limite.
    const rl = enforceRateLimit(req, {
      name: "log-web-vitals",
      limit: 120,
      windowSeconds: 60,
      bypassAuthenticated: false,
    });
    if (rl) return rl;

    try {
      const ua = req.headers.get("user-agent");
      const rawBody = await readUtf8BodyWithinLimit(req, MAX_BODY_BYTES);
      if (rawBody === null) {
        return new Response(JSON.stringify({ error: "payload_too_large", request_id: ctx.requestId }), {
          status: 413,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      const body = JSON.parse(rawBody);
      const samples: unknown[] = Array.isArray(body) ? body : Array.isArray(body?.samples) ? body.samples : [body];
      const clean = samples
        .slice(0, 20)
        .map(sanitize)
        .filter((s): s is Sample => s !== null)
        .map((s) => ({ ...s, user_agent: ua?.slice(0, 300) ?? null }));

      if (clean.length === 0) {
        return new Response(JSON.stringify({ inserted: 0, request_id: ctx.requestId }), {
          status: 200,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }

      const supabaseUrl = Deno.env.get("SUPABASE_URL");
      const serviceRoleKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");
      if (!supabaseUrl || !serviceRoleKey) {
        ctx.log("error", "server_misconfigured");
        return new Response(JSON.stringify({ error: "server_misconfigured", request_id: ctx.requestId }), {
          status: 500,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      const supabase = createClient(supabaseUrl, serviceRoleKey);

      const { error } = await supabase.from("web_vitals_samples").insert(clean);
      if (error) {
        ctx.log("error", "insert_failed", { error: error.message });
        return new Response(JSON.stringify({ error: "insert_failed", request_id: ctx.requestId }), {
          status: 500,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }

      return new Response(JSON.stringify({ inserted: clean.length, request_id: ctx.requestId }), {
        status: 200,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    } catch (e) {
      ctx.log("error", "bad_request", { error: e instanceof Error ? e.message : String(e) });
      return new Response(JSON.stringify({ error: "bad_request", request_id: ctx.requestId }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }
  }),
);
