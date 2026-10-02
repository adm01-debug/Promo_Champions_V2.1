import { createClient } from "npm:@supabase/supabase-js@2.49.4";
import { getCorsHeaders } from "../_shared/cors.ts";
import { validateWebhookPayload, WebhookContracts, createValidationErrorResponse } from "../_shared/webhook-validator.ts";
import { withRequestId } from "../_shared/request-id.ts";
import { detectFileSignature } from "../_shared/file-signature.ts";

const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
const syncApiKey = Deno.env.get("QUOTE_SYNC_API_KEY") ?? "";

const MAX_PDF_BYTES = 10 * 1024 * 1024; // 10 MB

// ── Types ─────────────────────────────────────────────────────────────
interface IncomingQuoteItem {
  product_id?: string;
  product_name: string;
  product_sku?: string;
  quantity: number;
  unit_price: number;
  subtotal?: number;
  color_name?: string;
  personalizations?: Record<string, unknown>[];
}

interface IncomingQuote {
  id: string;
  quote_number: string;
  client_id?: string | null;
  client_name: string;
  client_email?: string | null;
  client_phone?: string | null;
  seller_id?: string | null;
  seller_name?: string | null;
  status: string;
  subtotal?: number;
  discount_percent?: number;
  discount_amount?: number;
  total: number;
  notes?: string | null;
  valid_until?: string | null;
  items: IncomingQuoteItem[];
  created_at?: string;
}

// ── Status mapping ──────────────────────────────────────────────────
function mapQuoteStatus(externalStatus: string): string {
  const mapping: Record<string, string> = {
    draft: "draft",
    sent: "sent",
    pending: "sent",
    approved: "approved",
    accepted: "approved",
    rejected: "rejected",
    declined: "rejected",
    expired: "expired",
    cancelled: "rejected",
  };
  return mapping[externalStatus.toLowerCase()] || "draft";
}

function mapToPipelineStatus(quoteStatus: string): string {
  const mapping: Record<string, string> = {
    draft: "lead",
    sent: "proposal",
    approved: "won",
    rejected: "lost",
    expired: "closed",
  };
  return mapping[quoteStatus] || "lead";
}

// ── Helper: constant-time-ish string compare ──────────────────────
function safeEqual(a: string, b: string): boolean {
  if (a.length !== b.length) return false;
  let diff = 0;
  for (let i = 0; i < a.length; i++) diff |= a.charCodeAt(i) ^ b.charCodeAt(i);
  return diff === 0;
}

Deno.serve(withRequestId("receive-quote-webhook", async (req, _ctx) => {
  const corsHeaders = getCorsHeaders(req);
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  if (req.method !== "POST") {
    return new Response(JSON.stringify({ error: "Method not allowed" }), {
      status: 405,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }

  // ── Auth obrigatória ─────────────────────────────────────────────
  if (!syncApiKey) {
    console.error("[receive-quote-webhook] QUOTE_SYNC_API_KEY não configurada");
    return new Response(
      JSON.stringify({ error: "Server misconfigured: missing QUOTE_SYNC_API_KEY" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }

  const apiKey = req.headers.get("x-api-key") ?? "";
  if (!apiKey || !safeEqual(apiKey, syncApiKey)) {
    console.warn("[receive-quote-webhook] unauthorized request (missing/invalid x-api-key)");
    return new Response(
      JSON.stringify({ error: "Unauthorized: invalid or missing x-api-key" }),
      { status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }

  const supabase = createClient(supabaseUrl, supabaseServiceKey);
  let logId: string | undefined;

  try {
    let rawBody: unknown;
    try {
      rawBody = await req.json();
    } catch {
      return new Response(
        JSON.stringify({ error: "Invalid JSON body" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Contract validation
    const validation = validateWebhookPayload(WebhookContracts.quoteSync, rawBody, "1.3.0");
    if (!validation.success) {
      if (validation.statusCode === 422) {
        return createValidationErrorResponse(
          validation.error!,
          validation.details!,
          validation.contract_version,
          corsHeaders
        );
      }
      return new Response(
        JSON.stringify({ error: validation.error, contract_version: validation.contract_version }),
        { status: validation.statusCode, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const { action, quote, pdf_base64, timestamp } = validation.data as {
      action: string;
      quote: IncomingQuote;
      pdf_base64?: string;
      timestamp?: string;
    };

    console.info(`[receive-quote-webhook] action=${action} quote_number=${quote.quote_number} ts=${timestamp}`);

    // ── Log inicial ───────────────────────────────────────────────
    const { data: logData, error: logErr } = await supabase
      .from("quote_sync_logs")
      .insert({
        source: "gift_store",
        external_quote_id: quote.id,
        quote_number: quote.quote_number,
        action,
        details: quote as unknown as Record<string, unknown>,
        status: "processing",
      })
      .select("id")
      .single();

    if (logErr) {
      console.error("[receive-quote-webhook] log insert failed:", logErr);
    } else {
      logId = logData?.id;
    }

    try {
      const mappedStatus = mapQuoteStatus(quote.status);
      const pipelineStatus = mapToPipelineStatus(mappedStatus);
      const now = new Date().toISOString();

      // ── Resumo de produtos para sales.product_name ───────────
      const productSummary = quote.items
        .slice(0, 3)
        .map((i) => `${i.product_name} (x${i.quantity})`)
        .join(", ");
      const productName =
        quote.items.length > 3
          ? `${productSummary} +${quote.items.length - 3} itens`
          : productSummary || `Orçamento ${quote.quote_number}`;

      // ── Escrita atômica: cliente + quote + quote_items + sale ──
      // Toda a mutação roda em UMA transação dentro da RPC
      // sync_quote_from_webhook: falha em qualquer etapa faz rollback
      // completo, e o retry do emissor reaplica o payload inteiro.
      // quote_sync_logs fica fora da transação para registrar falhas.
      const { data: syncResult, error: syncErr } = await supabase.rpc(
        "sync_quote_from_webhook",
        {
          p_external_quote_id: quote.id,
          p_quote_number: quote.quote_number,
          p_title: `Orçamento ${quote.quote_number}`,
          p_description: quote.notes ?? null,
          p_client_name: quote.client_name,
          p_client_email: quote.client_email ?? null,
          p_client_phone: quote.client_phone ?? null,
          p_seller_name: quote.seller_name ?? null,
          p_external_seller_id: quote.seller_id ?? null,
          p_status: mappedStatus,
          p_pipeline_status: pipelineStatus,
          p_total_value: quote.total,
          p_subtotal: quote.subtotal ?? quote.total,
          p_discount_percent: quote.discount_percent ?? 0,
          p_discount_amount: quote.discount_amount ?? 0,
          p_items: quote.items ?? [],
          p_valid_until: quote.valid_until ?? null,
          p_notes: quote.notes ?? null,
          p_sent_at: mappedStatus === "sent" ? now : null,
          p_approved_at: mappedStatus === "approved" ? now : null,
          p_rejected_at: mappedStatus === "rejected" ? now : null,
          p_quote_created_at: quote.created_at ?? null,
          p_sale_product_name: productName,
        },
      );
      if (syncErr) throw syncErr;

      const quoteId = syncResult.quote_id as string;
      const saleId = (syncResult.sale_id ?? null) as string | null;
      const clientId = (syncResult.client_id ?? null) as string | null;
      const salespersonId = (syncResult.salesperson_id ?? null) as string | null;
      if ((syncResult.itens_sem_produto ?? 0) > 0) {
        console.warn(
          `[receive-quote-webhook] ${syncResult.itens_sem_produto} item(ns) com product_id sem match em products (quote ${quoteId})`,
        );
      }
      console.info(`[receive-quote-webhook] synced quote ${quoteId} (sale ${saleId ?? "—"})`);

      // ── Upload de PDF com limite ──────────────────────────────
      if (pdf_base64) {
        try {
          const approxBytes = Math.floor((pdf_base64.length * 3) / 4);
          if (approxBytes > MAX_PDF_BYTES) {
            console.warn(`[receive-quote-webhook] PDF excede limite (${approxBytes} bytes) — ignorando upload`);
          } else {
            const binaryStr = atob(pdf_base64);
            const bytes = new Uint8Array(binaryStr.length);
            for (let i = 0; i < binaryStr.length; i++) bytes[i] = binaryStr.charCodeAt(i);
            // Magic bytes: o bucket é público — só gravar se for PDF de verdade.
            if (detectFileSignature(bytes) !== 'pdf') {
              console.warn(`[receive-quote-webhook] pdf_base64 rejeitado — assinatura não é %PDF`);
            } else {
            const pdfPath = `proposta-${quote.quote_number.replace(/[^a-zA-Z0-9-_]/g, "-")}.pdf`;
            const { error: uploadErr } = await supabase.storage
              .from("quote-pdfs")
              .upload(pdfPath, bytes, { contentType: "application/pdf", upsert: true });
            if (uploadErr) {
              console.error("[receive-quote-webhook] PDF upload error:", uploadErr);
            } else {
              const { data: urlData } = supabase.storage.from("quote-pdfs").getPublicUrl(pdfPath);
              if (urlData?.publicUrl) {
                await supabase.from("quotes").update({ pdf_url: urlData.publicUrl }).eq("id", quoteId);
              }
            }
            }
          }
        } catch (pdfErr) {
          console.error("[receive-quote-webhook] PDF processing error:", pdfErr);
        }
      }

      // ── Sucesso ───────────────────────────────────────────────
      if (logId) {
        await supabase
          .from("quote_sync_logs")
          .update({ status: "success" })
          .eq("id", logId);
      }

      return new Response(
        JSON.stringify({
          success: true,
          quote_id: quoteId,
          sale_id: saleId,
          client_id: clientId,
          salesperson_id: salespersonId,
          status: mappedStatus,
          pipeline_status: pipelineStatus,
        }),
        { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    } catch (processingError) {
      const errMsg = processingError instanceof Error ? processingError.message : "Unknown error";
      console.error("[receive-quote-webhook] processing error:", processingError);

      if (logId) {
        await supabase
          .from("quote_sync_logs")
          .update({ status: "failed", error_message: errMsg })
          .eq("id", logId);
      }

      return new Response(
        JSON.stringify({ error: errMsg }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }
  } catch (error) {
    const errMsg = error instanceof Error ? error.message : "Unknown error";
    console.error("[receive-quote-webhook] fatal error:", error);
    return new Response(
      JSON.stringify({ error: errMsg }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
}));
