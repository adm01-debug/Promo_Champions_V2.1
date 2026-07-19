import { createClient } from "npm:@supabase/supabase-js@2.49.4";
import { corsHeaders } from "../_shared/cors.ts";
import { withRequestId } from "../_shared/request-id.ts";
import { escapeHtml } from "../_shared/html-escape.ts";

const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;

interface SendQuoteRequest {
  quote_id: string;
  channels?: Array<"email" | "whatsapp">;
  custom_message?: string;
}

Deno.serve(withRequestId("send-quote-to-client", async (req, _ctx) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });
  if (req.method !== "POST") {
    return new Response(JSON.stringify({ error: "Method not allowed" }), {
      status: 405,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }

  // Auth: exige JWT válido (usuário logado do CRM)
  const authHeader = req.headers.get("Authorization");
  if (!authHeader?.startsWith("Bearer ")) {
    return new Response(JSON.stringify({ error: "Unauthorized" }), {
      status: 401,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }

  const supabase = createClient(supabaseUrl, supabaseServiceKey, {
    global: { headers: { Authorization: authHeader } },
  });

  const token = authHeader.replace("Bearer ", "");
  const { data: claimsData, error: claimsErr } = await supabase.auth.getClaims(token);
  if (claimsErr || !claimsData?.claims) {
    return new Response(JSON.stringify({ error: "Unauthorized" }), {
      status: 401,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }

  const userId = claimsData.claims.sub as string;

  let body: SendQuoteRequest;
  try {
    body = await req.json();
  } catch {
    return new Response(JSON.stringify({ error: "Invalid JSON" }), {
      status: 400,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }

  if (!body.quote_id) {
    return new Response(JSON.stringify({ error: "quote_id é obrigatório" }), {
      status: 400,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }

  const channels = body.channels && body.channels.length > 0 ? body.channels : ["email"];

  // Cliente de serviço para bypassar RLS na leitura completa do quote
  const svcSupabase = createClient(supabaseUrl, supabaseServiceKey);

  const { data: quote, error: quoteErr } = await svcSupabase
    .from("quotes")
    .select("id, quote_number, client_name, client_email, client_phone, total_value, valid_until, pdf_url, client_id, notes")
    .eq("id", body.quote_id)
    .maybeSingle();

  if (quoteErr || !quote) {
    return new Response(JSON.stringify({ error: "Quote não encontrado" }), {
      status: 404,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }

  const results: Record<string, unknown> = {};

  // Gerar signed URL (30 dias) se houver PDF
  let signedPdfUrl: string | null = null;
  if (quote.pdf_url) {
    try {
      // Extrair path do public url
      const match = quote.pdf_url.match(/\/quote-pdfs\/(.+)$/);
      const pdfPath = match ? decodeURIComponent(match[1]) : null;
      if (pdfPath) {
        const { data: signed } = await svcSupabase.storage
          .from("quote-pdfs")
          .createSignedUrl(pdfPath, 60 * 60 * 24 * 30);
        signedPdfUrl = signed?.signedUrl ?? quote.pdf_url;
      } else {
        signedPdfUrl = quote.pdf_url;
      }
    } catch (e) {
      console.warn("[send-quote-to-client] signed url falhou, usando public:", e);
      signedPdfUrl = quote.pdf_url;
    }
  }

  const pdfLine = signedPdfUrl ? `\n\nAcesse a proposta: ${signedPdfUrl}` : "";
  const customLine = body.custom_message ? `\n\n${body.custom_message}` : "";

  // ── Email ──
  if (channels.includes("email") && quote.client_email) {
    try {
      const emailPayload = {
        to: quote.client_email,
        subject: `Sua proposta ${quote.quote_number}`,
        html: `<p>Olá ${escapeHtml(quote.client_name) || "cliente"},</p>
               <p>Segue sua proposta no valor de <strong>R$ ${Number(quote.total_value).toFixed(2)}</strong>.</p>
               ${quote.valid_until ? `<p>Válida até ${new Date(quote.valid_until).toLocaleDateString("pt-BR")}.</p>` : ""}
               ${signedPdfUrl ? `<p><a href="${escapeHtml(signedPdfUrl)}">Acessar proposta em PDF</a></p>` : ""}
               ${body.custom_message ? `<p>${escapeHtml(body.custom_message)}</p>` : ""}`,
      };

      const { data, error } = await svcSupabase.functions.invoke("send-transactional-email", {
        body: emailPayload,
      });
      results.email = error ? { error: error.message } : { ok: true, data };
    } catch (e) {
      results.email = { error: e instanceof Error ? e.message : String(e) };
    }
  } else if (channels.includes("email")) {
    results.email = { skipped: "sem client_email" };
  }

  // ── WhatsApp ──
  if (channels.includes("whatsapp") && quote.client_phone) {
    try {
      const msg = `Olá ${quote.client_name || "cliente"}! Sua proposta ${quote.quote_number} está pronta.\nValor: R$ ${Number(quote.total_value).toFixed(2)}${pdfLine}${customLine}`;
      const { data, error } = await svcSupabase.functions.invoke("send-multichannel-message", {
        body: { channel: "whatsapp", to: quote.client_phone, message: msg, quote_id: quote.id },
      });
      results.whatsapp = error ? { error: error.message } : { ok: true, data };
    } catch (e) {
      results.whatsapp = { error: e instanceof Error ? e.message : String(e) };
    }
  } else if (channels.includes("whatsapp")) {
    results.whatsapp = { skipped: "sem client_phone" };
  }

  // ── Marcar como enviado ──
  const anySuccess = Object.values(results).some(
    (r) => typeof r === "object" && r !== null && "ok" in (r as object)
  );

  if (anySuccess) {
    await svcSupabase
      .from("quotes")
      .update({ status: "sent", sent_at: new Date().toISOString() })
      .eq("id", body.quote_id);

    // Log em client_interactions (se cliente existir)
    if (quote.client_id) {
      await svcSupabase.from("client_interactions").insert({
        client_id: quote.client_id,
        interaction_type: "quote_sent",
        notes: `Proposta ${quote.quote_number} enviada via ${channels.join(", ")}`,
        user_id: userId,
      });
    }
  }

  return new Response(
    JSON.stringify({ success: anySuccess, channels: results, pdf_url: signedPdfUrl }),
    { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
  );
}));
