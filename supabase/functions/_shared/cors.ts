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
  let raw: string | undefined;
  try {
    raw = (globalThis as unknown as { Deno?: { env?: { get(k: string): string | undefined } } })
      .Deno?.env?.get?.("ALLOWED_ORIGINS");
  } catch {
    // Testes in-process e runtimes sem permissão de ambiente mantêm o
    // fallback compatível em vez de falhar ao construir uma resposta.
    return [];
  }
  if (!raw) return [];
  return raw
    .split(",")
    .map((s) => s.trim())
    .filter(Boolean);
}

export function matchOrigin(origin: string, pattern: string): boolean {
  if (pattern === "*") return true;
  if (pattern === origin) return true;
  if (!pattern.includes("*")) return false;

  // Para padrões sem esquema, `*.lovable.app` significa subdomínios HTTP(S).
  // Escapamos cada segmento antes de inserir o curinga; escapar o padrão
  // inteiro e só depois procurar `\\*` deixava o asterisco cru e causava
  // `SyntaxError: Nothing to repeat` em tempo de execução.
  const withScheme = /^(https?):\/\//i.exec(pattern);
  const protocol = withScheme ? withScheme[1].toLowerCase() : "https?";
  const hostPattern = withScheme ? pattern.slice(withScheme[0].length) : pattern;
  const escapedHost = hostPattern
    .split("*")
    .map((part) => part.replace(/[|\\{}()[\]^$+?.]/g, "\\$&"))
    .join("[^/]*");

  return new RegExp(`^${protocol}://${escapedHost}$`, "i").test(origin);
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
