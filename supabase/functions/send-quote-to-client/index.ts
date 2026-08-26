import { getCorsHeaders } from "../_shared/cors.ts";
import { withRequestId } from "../_shared/request-id.ts";
import { escapeHtml } from "../_shared/html-escape.ts";
import { getServiceClient, getUserClient, UnauthorizedError } from "../_shared/auth-client.ts";

interface SendQuoteRequest {
  quote_id: string;
  channels?: Array<"email" | "whatsapp">;
  custom_message?: string;
}

const UUID_RE = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

Deno.serve(withRequestId("send-quote-to-client", async (req, _ctx) => {
  const responseCorsHeaders = getCorsHeaders(req);
  if (req.method === "OPTIONS") return new Response(null, { headers: responseCorsHeaders });
  if (req.method !== "POST") {
    return new Response(JSON.stringify({ error: "Method not allowed" }), {
      status: 405,
      headers: { ...responseCorsHeaders, "Content-Type": "application/json" },
    });
  }

  // JWT validado com a anon key; nunca use service_role para autenticar o chamador.
  let auth: Awaited<ReturnType<typeof getUserClient>>;
  try {
    auth = await getUserClient(req);
  } catch (error) {
    if (error instanceof UnauthorizedError) {
      return new Response(JSON.stringify({ error: "Unauthorized" }), {
        status: 401,
        headers: { ...responseCorsHeaders, "Content-Type": "application/json" },
      });
    }
    console.error("[send-quote-to-client] falha ao validar JWT:", error);
    return new Response(JSON.stringify({ error: "Falha ao validar autenticação" }), {
      status: 500,
      headers: { ...responseCorsHeaders, "Content-Type": "application/json" },
    });
  }

  let body: SendQuoteRequest;
  try {
    body = await req.json();
  } catch {
    return new Response(JSON.stringify({ error: "Invalid JSON" }), {
      status: 400,
      headers: { ...responseCorsHeaders, "Content-Type": "application/json" },
    });
  }

  if (!body.quote_id || typeof body.quote_id !== "string" || !UUID_RE.test(body.quote_id)) {
    return new Response(JSON.stringify({ error: "quote_id é obrigatório" }), {
      status: 400,
      headers: { ...responseCorsHeaders, "Content-Type": "application/json" },
    });
  }

  const channels = body.channels && body.channels.length > 0 ? body.channels : ["email"];

  // A primeira consulta respeita RLS e evita buscar um orçamento de terceiro
  // com service_role antes de saber se o chamador pode acessá-lo.
  const { data: authorizedQuote, error: authorizedQuoteErr } = await auth.client
    .from("quotes")
    .select("id, created_by")
    .eq("id", body.quote_id)
    .maybeSingle();

  if (authorizedQuoteErr) {
    console.error("[send-quote-to-client] falha ao autorizar orçamento:", authorizedQuoteErr);
    return new Response(JSON.stringify({ error: "Não foi possível confirmar as permissões" }), {
      status: 503,
      headers: { ...responseCorsHeaders, "Content-Type": "application/json" },
    });
  }

  if (!authorizedQuote) {
    return new Response(JSON.stringify({ error: "Orçamento não encontrado" }), {
      status: 404,
      headers: { ...responseCorsHeaders, "Content-Type": "application/json" },
    });
  }

  // Só cria o cliente privilegiado depois de validar JWT e autorização via RLS.
  const svcSupabase = getServiceClient(
    "send-quote-to-client lê o orçamento e registra os resultados de entrega",
  );

  const { data: quote, error: quoteErr } = await svcSupabase
    .from("quotes")
    .select("id, quote_number, client_name, client_email, client_phone, total_value, valid_until, pdf_url, client_id, notes, created_by")
    .eq("id", body.quote_id)
    .maybeSingle();

  if (quoteErr || !quote) {
    return new Response(JSON.stringify({ error: "Orçamento não encontrado" }), {
      status: 404,
      headers: { ...responseCorsHeaders, "Content-Type": "application/json" },
    });
  }

  // Alinhado às policies de quotes: dono (salesperson), admin ou manager.
  // A checagem é explícita porque as operações posteriores usam service_role.
  const { data: isAdminOrManager, error: roleErr } = await auth.client.rpc(
    "is_admin_or_manager" as never,
    { _user_id: auth.userId } as never,
  );
  if (roleErr) {
    console.error("[send-quote-to-client] falha ao verificar role:", roleErr);
    return new Response(JSON.stringify({ error: "Não foi possível confirmar as permissões" }), {
      status: 503,
      headers: { ...responseCorsHeaders, "Content-Type": "application/json" },
    });
  }

  if (!isAdminOrManager) {
    const { data: salesperson, error: salespersonErr } = await svcSupabase
      .from("salespeople")
      .select("id")
      .eq("auth_user_id", auth.userId)
      .eq("is_active", true)
      .maybeSingle();

    if (salespersonErr) {
      console.error("[send-quote-to-client] falha ao verificar dono do orçamento:", salespersonErr);
      return new Response(JSON.stringify({ error: "Não foi possível confirmar as permissões" }), {
        status: 503,
        headers: { ...responseCorsHeaders, "Content-Type": "application/json" },
      });
    }

    if (!salesperson || salesperson.id !== quote.created_by) {
      return new Response(JSON.stringify({ error: "Sem permissão para enviar este orçamento" }), {
        status: 403,
        headers: { ...responseCorsHeaders, "Content-Type": "application/json" },
      });
    }
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
        body: {
          ownerId: auth.userId,
          channel: "whatsapp",
          to: quote.client_phone,
          body: msg,
        },
      });
      const result = data as { ok?: boolean; error?: string } | null;
      results.whatsapp = error
        ? { error: error.message }
        : result?.ok
          ? { ok: true, data: result }
          : { error: result?.error ?? "multichannel_send_failed" };
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
        user_id: auth.userId,
      });
    }
  }

  return new Response(
    JSON.stringify({ success: anySuccess, channels: results, pdf_url: signedPdfUrl }),
    { status: 200, headers: { ...responseCorsHeaders, "Content-Type": "application/json" } }
  );
}));
