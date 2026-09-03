import { createClient } from "npm:@supabase/supabase-js@2.49.4";
import { corsHeaders, getCorsHeaders } from "../_shared/cors.ts";
import { withRequestId } from "../_shared/request-id.ts";
import { escapeHtml } from "../_shared/html-escape.ts";
import { normalizeEmail, verifyUnsubscribeToken } from "../_shared/unsubscribe.ts";
import { enforceRateLimit } from "../_shared/rate-limit.ts";

const SUPABASE_URL = Deno.env.get("SUPABASE_URL");
const SERVICE_ROLE = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");

function layout(title: string, content: string, status = 200): Response {
  const html = `<!doctype html><html lang="pt-BR"><head><meta charset="utf-8" />
<meta name="viewport" content="width=device-width,initial-scale=1" />
<title>${escapeHtml(title)}</title></head>
<body style="font-family:system-ui,-apple-system,Segoe UI,sans-serif;background:#0b1020;color:#e5e7eb;display:flex;align-items:center;justify-content:center;min-height:100vh;margin:0">
<main style="max-width:480px;padding:32px;background:#111827;border-radius:16px;text-align:center">
<h1 style="font-size:20px;margin:0 0 12px">${escapeHtml(title)}</h1>
${content}
</main></body></html>`;
  return new Response(html, {
    status,
    headers: {
      ...corsHeaders,
      "Content-Type": "text/html; charset=utf-8",
      "Cache-Control": "no-store",
      "Referrer-Policy": "no-referrer",
      "X-Content-Type-Options": "nosniff",
      "Content-Security-Policy": "default-src 'none'; style-src 'unsafe-inline'; form-action 'self'; base-uri 'none'; frame-ancestors 'none'",
    },
  });
}

function page(title: string, message: string, status = 200): Response {
  return layout(
    title,
    `<p style="font-size:14px;color:#9ca3af;margin:0">${escapeHtml(message)}</p>`,
    status,
  );
}

function confirmationPage(email: string, action: string): Response {
  return layout(
    "Confirmar descadastro",
    `<p style="font-size:14px;color:#9ca3af;margin:0 0 20px">` +
      `Confirma que ${escapeHtml(email)} não deve mais receber e-mails de prospecção?</p>` +
      `<form method="post" action="${escapeHtml(action)}">` +
      `<input type="hidden" name="List-Unsubscribe" value="One-Click" />` +
      `<button type="submit" style="border:0;border-radius:8px;background:#2563eb;color:#fff;padding:10px 16px;cursor:pointer">` +
      `Confirmar descadastro</button></form>`,
  );
}

Deno.serve(withRequestId("email-unsubscribe", async (req, _ctx) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: getCorsHeaders(req) });

  if (req.method !== "GET" && req.method !== "POST") {
    return page("Método não suportado", "Use o link recebido no e-mail.", 405);
  }

  // O token limita o efeito, mas a rota ainda é pública e não deve permitir
  // bypass por um Authorization sintático.
  const rl = enforceRateLimit(req, {
    name: "email-unsubscribe",
    limit: 60,
    windowSeconds: 60,
    bypassAuthenticated: false,
  });
  if (rl) return rl;

  const url = new URL(req.url);
  const email = normalizeEmail(url.searchParams.get("e"));
  const token = (url.searchParams.get("t") ?? "").trim();

  if (!email || email.length > 254 || !/^[^\s@]+@[^\s@]+$/.test(email)) {
    return page("Link inválido", "O endereço de e-mail não foi informado corretamente.", 400);
  }
  if (!(await verifyUnsubscribeToken(email, token))) {
    return page("Link inválido ou expirado", "Não foi possível validar este pedido de descadastro.", 403);
  }

  // Scanners de e-mail frequentemente fazem GET preventivo em links. Ação só
  // ocorre por POST (RFC 8058 ou confirmação explícita da pessoa destinatária).
  if (req.method === "GET") {
    return confirmationPage(email, `${url.pathname}${url.search}`);
  }

  if (!SUPABASE_URL || !SERVICE_ROLE) {
    console.error("email-unsubscribe misconfigured: missing Supabase service credentials");
    return page("Erro ao processar", "Tente novamente em alguns instantes.", 500);
  }

  try {
    const admin = createClient(SUPABASE_URL, SERVICE_ROLE);
    const { error } = await admin.rpc("record_email_opt_out", {
      _email: email,
      _reason: url.searchParams.get("r"),
      _source: req.method === "POST" ? "one_click" : "unsubscribe_link",
      _owner_id: null,
      _metadata: { user_agent: req.headers.get("user-agent")?.slice(0, 200) ?? null },
    });
    if (error) throw new Error(error.message);
  } catch (e) {
    console.error("email-unsubscribe error:", e);
    return page("Erro ao processar", "Tente novamente em alguns instantes.", 500);
  }

  return page(
    "Descadastro confirmado",
    `${email} não receberá mais nossos e-mails de prospecção.`,
  );
}));
