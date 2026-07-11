// SEC-07 — CORS allowlist.
//
// Estratégia:
//  • `ALLOWED_ORIGINS` (env, opcional): lista separada por vírgula com origens
//     permitidas. Aceita curingas de subdomínio (`*.lovable.app`,
//     `https://*.example.com`).
//  • Sem `ALLOWED_ORIGINS` → fallback `*` (mantém compat. com dev / server-to-
//     server / integrações externas que hoje dependem do wildcard).
//  • Se o request enviar `Origin` que casa com a allowlist → devolve aquela
//     origem exata e `Vary: Origin` (correto para caches).
//  • Se enviar `Origin` fora da allowlist → responde com a primeira origem
//     configurada (ou `*` quando fallback). Isso NÃO abre a porta: o browser
//     rejeita o preflight se o Origin recebido não bate com o enviado.
//
// Todas as edge functions devem importar `getCorsHeaders(req)` para o CORS
// dinâmico. `corsHeaders` continua exportado como valor estático para calls
// server-to-server (webhooks pg_cron, health probes, testes Deno).

const STATIC_HEADERS: Record<string, string> = {
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, x-request-id, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
  "Access-Control-Allow-Methods": "GET, POST, PUT, PATCH, DELETE, OPTIONS",
  "Access-Control-Max-Age": "86400",
};

function parseAllowlist(): string[] {
  const raw = (globalThis as unknown as { Deno?: { env?: { get(k: string): string | undefined } } })
    .Deno?.env?.get?.("ALLOWED_ORIGINS");
  if (!raw) return [];
  return raw
    .split(",")
    .map((s) => s.trim())
    .filter(Boolean);
}

function matchOrigin(origin: string, pattern: string): boolean {
  if (pattern === "*") return true;
  if (pattern === origin) return true;
  if (!pattern.includes("*")) return false;
  // Wildcard subdomain: convert `*.lovable.app` → regex `^https?://[^/]+\.lovable\.app$`
  const escaped = pattern
    .replace(/[.+?^${}()|[\]\\]/g, "\\$&")
    .replace(/\\\*/g, "[^/]*");
  return new RegExp(`^${escaped}$`).test(origin);
}

/** Compute CORS headers scoped to the incoming request. */
export function getCorsHeaders(req: Request): Record<string, string> {
  const origin = req.headers.get("Origin") ?? "";
  const allowlist = parseAllowlist();

  let allowOrigin: string;
  if (allowlist.length === 0) {
    allowOrigin = "*";
  } else if (origin && allowlist.some((p) => matchOrigin(origin, p))) {
    allowOrigin = origin;
  } else {
    // Server-to-server (no Origin) or unlisted origin → fall back to the first
    // configured allowed origin. Browsers with a mismatching Origin reject the
    // preflight response, so this remains safe.
    allowOrigin = allowlist[0];
  }

  const headers: Record<string, string> = {
    ...STATIC_HEADERS,
    "Access-Control-Allow-Origin": allowOrigin,
  };
  if (allowOrigin !== "*") {
    headers["Vary"] = "Origin";
  }
  return headers;
}

/**
 * Static CORS headers preserved for backward compatibility. New code should
 * prefer `getCorsHeaders(req)` for a per-request allowlist match.
 */
export const corsHeaders: Record<string, string> = {
  ...STATIC_HEADERS,
  "Access-Control-Allow-Origin": "*",
};
