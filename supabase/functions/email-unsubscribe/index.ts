import { createClient } from "npm:@supabase/supabase-js@2.49.4";
import { corsHeaders } from "../_shared/cors.ts";
import { withRequestId } from "../_shared/request-id.ts";
import { escapeHtml } from "../_shared/html-escape.ts";
import { normalizeEmail, verifyUnsubscribeToken } from "../_shared/unsubscribe.ts";

const SUPABASE_URL = Deno.env.get("SUPABASE_URL")!;
const SERVICE_ROLE = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;

function page(title: string, message: string, status = 200): Response {
  const html = `<!doctype html><html lang="pt-BR"><head><meta charset="utf-8" />
<meta name="viewport" content="width=device-width,initial-scale=1" />
<title>${escapeHtml(title)}</title></head>
<body style="font-family:system-ui,-apple-system,Segoe UI,sans-serif;background:#0b1020;color:#e5e7eb;display:flex;align-items:center;justify-content:center;min-height:100vh;margin:0">
<main style="max-width:480px;padding:32px;background:#111827;border-radius:16px;text-align:center">
<h1 style="font-size:20px;margin:0 0 12px">${escapeHtml(title)}</h1>
<p style="font-size:14px;color:#9ca3af;margin:0">${escapeHtml(message)}</p>
</main></body></html>`;
  return new Response(html, {
    status,
    headers: { ...corsHeaders, "Content-Type": "text/html; charset=utf-8", "Cache-Control": "no-store" },
  });
}

Deno.serve(withRequestId("email-unsubscribe", async (req, _ctx) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

  if (req.method !== "GET" && req.method !== "POST") {
    return page("Método não suportado", "Use o link recebido no e-mail.", 405);
  }

  const url = new URL(req.url);
  const email = normalizeEmail(url.searchParams.get("e"));
  const token = (url.searchParams.get("t") ?? "").trim();

  if (!email || !email.includes("@")) {
    return page("Link inválido", "O endereço de e-mail não foi informado corretamente.", 400);
  }
  if (!(await verifyUnsubscribeToken(email, token))) {
    return page("Link inválido ou expirado", "Não foi possível validar este pedido de descadastro.", 403);
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
