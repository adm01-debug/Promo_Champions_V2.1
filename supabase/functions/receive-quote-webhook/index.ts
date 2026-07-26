import { createClient } from "npm:@supabase/supabase-js@2.49.4";
import { getCorsHeaders } from "../_shared/cors.ts";
import { validateWebhookPayload, WebhookContracts, createValidationErrorResponse } from "../_shared/webhook-validator.ts";
import { withRequestId } from "../_shared/request-id.ts";

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
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: getCorsHeaders(req) });
  }

  if (req.method !== "POST") {
    return new Response(JSON.stringify({ error: "Method not allowed" }), {
      status: 405,
      headers: { ...getCorsHeaders(req), "Content-Type": "application/json" },
    });
  }

  // ── Auth obrigatória ─────────────────────────────────────────────
  if (!syncApiKey) {
    console.error("[receive-quote-webhook] QUOTE_SYNC_API_KEY não configurada");
    return new Response(
      JSON.stringify({ error: "Server misconfigured: missing QUOTE_SYNC_API_KEY" }),
      { status: 500, headers: { ...getCorsHeaders(req), "Content-Type": "application/json" } }
    );
  }

  const apiKey = req.headers.get("x-api-key") ?? "";
  if (!apiKey || !safeEqual(apiKey, syncApiKey)) {
    console.warn("[receive-quote-webhook] unauthorized request (missing/invalid x-api-key)");
    return new Response(
      JSON.stringify({ error: "Unauthorized: invalid or missing x-api-key" }),
      { status: 401, headers: { ...getCorsHeaders(req), "Content-Type": "application/json" } }
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
        { status: 400, headers: { ...getCorsHeaders(req), "Content-Type": "application/json" } }
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
          getCorsHeaders(req)
        );
      }
      return new Response(
        JSON.stringify({ error: validation.error, contract_version: validation.contract_version }),
        { status: validation.statusCode, headers: { ...getCorsHeaders(req), "Content-Type": "application/json" } }
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

      // ── Upsert de cliente ─────────────────────────────────────
      let clientId: string | null = null;
      if (quote.client_email || quote.client_phone) {
        const { data: rpcData, error: rpcErr } = await supabase.rpc("upsert_client_from_quote", {
          p_name: quote.client_name,
          p_email: quote.client_email ?? null,
          p_phone: quote.client_phone ?? null,
          p_company: null,
        });
        if (rpcErr) {
          console.error("[receive-quote-webhook] upsert_client_from_quote failed:", rpcErr);
        } else {
          clientId = rpcData as string;
        }
      }

      // ── Mapeamento vendedor externo → salesperson ────────────
      let salespersonId: string | null = null;
      if (quote.seller_id) {
        const { data: mapRow } = await supabase
          .from("external_seller_map")
          .select("salesperson_id")
          .eq("external_source", "gift_store")
          .eq("external_id", quote.seller_id)
          .maybeSingle();
        salespersonId = mapRow?.salesperson_id ?? null;
      }

      // ── Verificar quote existente ────────────────────────────
      const { data: existingQuote } = await supabase
        .from("quotes")
        .select("id, sale_id")
        .eq("external_quote_id", quote.id)
        .maybeSingle();

      const quoteRecord: Record<string, unknown> = {
        client_name: quote.client_name,
        client_email: quote.client_email ?? null,
        client_phone: quote.client_phone ?? null,
        seller_name: quote.seller_name ?? null,
        external_seller_id: quote.seller_id ?? null,
        client_id: clientId,
        created_by: salespersonId,
        title: `Orçamento ${quote.quote_number}`,
        description: quote.notes ?? null,
        total_value: quote.total,
        status: mappedStatus,
        external_reference: quote.quote_number,
        external_quote_id: quote.id,
        quote_number: quote.quote_number,
        subtotal: quote.subtotal ?? quote.total,
        discount_percent: quote.discount_percent ?? 0,
        discount_amount: quote.discount_amount ?? 0,
        items: quote.items, // JSONB nativo
        valid_until: quote.valid_until ?? null,
        notes: quote.notes ?? null,
        source: "gift_store",
        synced_from_external: true,
        sync_status: "synced",
        last_synced_at: now,
        updated_at: now,
      };

      if (mappedStatus === "sent") quoteRecord.sent_at = now;
      if (mappedStatus === "approved") quoteRecord.approved_at = now;
      if (mappedStatus === "rejected") quoteRecord.rejected_at = now;

      let quoteId: string;
      let saleId: string | null = existingQuote?.sale_id || null;

      if (existingQuote) {
        const { error: updateErr } = await supabase
          .from("quotes")
          .update(quoteRecord)
          .eq("id", existingQuote.id);
        if (updateErr) throw updateErr;
        quoteId = existingQuote.id;
        console.info(`[receive-quote-webhook] updated quote ${quoteId}`);
      } else {
        quoteRecord.created_at = quote.created_at ?? now;
        const { data: newQuote, error: insertErr } = await supabase
          .from("quotes")
          .insert(quoteRecord)
          .select("id")
          .single();
        if (insertErr) throw insertErr;
        quoteId = newQuote.id;
        console.info(`[receive-quote-webhook] created quote ${quoteId}`);
      }

      // ── Sync quote_items (structured rows) ───────────────────
      // The quotes.items JSONB column is kept for backwards compat, but
      // quote_items must also be populated so downstream RPCs (quote→order
      // conversion) can read normalized rows (HIGH #5 fix).
      if (quote.items && quote.items.length > 0) {
        // Replace all items for this quote atomically.
        await supabase.from("quote_items").delete().eq("quote_id", quoteId);

        const itemRows = quote.items.map((item) => ({
          quote_id: quoteId,
          product_id: item.product_id ?? null,
          product_name: item.product_name,
          quantity: item.quantity,
          unit_price: item.unit_price,
          discount_amount: 0,
          total_price: item.subtotal ?? item.quantity * item.unit_price,
        }));

        const { error: itemsErr } = await supabase.from("quote_items").insert(itemRows);
        if (itemsErr) {
          console.error("[receive-quote-webhook] quote_items sync error:", itemsErr);
        } else {
          console.info(`[receive-quote-webhook] synced ${itemRows.length} item(s) to quote_items for ${quoteId}`);
        }
      }

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
        } catch (pdfErr) {
          console.error("[receive-quote-webhook] PDF processing error:", pdfErr);
        }
      }

      // ── Pipeline (sales) ──────────────────────────────────────
      const productSummary = quote.items
        .slice(0, 3)
        .map((i) => `${i.product_name} (x${i.quantity})`)
        .join(", ");
      const productName =
        quote.items.length > 3
          ? `${productSummary} +${quote.items.length - 3} itens`
          : productSummary || `Orçamento ${quote.quote_number}`;

      if (saleId) {
        await supabase
          .from("sales")
          .update({
            client_name: quote.client_name,
            product_name: productName,
            amount: quote.total,
            status: pipelineStatus,
            client_id: clientId,
            salesperson_id: salespersonId,
            updated_at: now,
          })
          .eq("id", saleId);
      } else {
        const { data: newSale, error: saleInsertErr } = await supabase
          .from("sales")
          .insert({
            client_name: quote.client_name,
            product_name: productName,
            amount: quote.total,
            status: pipelineStatus,
            category: "brindes",
            client_id: clientId,
            salesperson_id: salespersonId,
            source: "gift_store",
            created_at: quote.created_at ?? now,
          })
          .select("id")
          .single();
        if (saleInsertErr) {
          console.error("[receive-quote-webhook] sale insert error:", saleInsertErr);
        } else if (newSale) {
          saleId = newSale.id;
          await supabase.from("quotes").update({ sale_id: saleId }).eq("id", quoteId);
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
        { status: 200, headers: { ...getCorsHeaders(req), "Content-Type": "application/json" } }
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
        { status: 500, headers: { ...getCorsHeaders(req), "Content-Type": "application/json" } }
      );
    }
  } catch (error) {
    const errMsg = error instanceof Error ? error.message : "Unknown error";
    console.error("[receive-quote-webhook] fatal error:", error);
    return new Response(
      JSON.stringify({ error: errMsg }),
      { status: 500, headers: { ...getCorsHeaders(req), "Content-Type": "application/json" } }
    );
  }
}));
