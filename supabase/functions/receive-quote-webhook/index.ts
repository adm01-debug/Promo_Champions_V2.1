import { createClient } from "npm:@supabase/supabase-js@2.49.4";
import { corsHeaders } from "../_shared/cors.ts";

const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
const syncApiKey = Deno.env.get("QUOTE_SYNC_API_KEY")!;

// ── Types matching GIFT STORE's QuoteData ──────────────────────────────
interface IncomingQuote {
  id: string; // external quote id from GIFT STORE
  quote_number: string;
  client_id?: string;
  client_name?: string;
  client_email?: string;
  client_phone?: string;
  seller_id?: string;
  seller_name?: string;
  status: string;
  subtotal: number;
  discount_percent: number;
  discount_amount: number;
  total: number;
  notes?: string;
  valid_until?: string;
  items: IncomingQuoteItem[];
  created_at: string;
  pdf_base64?: string; // PDF file as base64 string
}

interface IncomingQuoteItem {
  product_id: string;
  product_name: string;
  product_sku?: string;
  quantity: number;
  unit_price: number;
  subtotal: number;
  color_name?: string;
  personalizations: {
    technique_name: string;
    colors_count: number;
    positions_count: number;
    total_cost: number;
  }[];
}

// ── Status mapping: GIFT STORE → PROMO CHAMPIONS ──────────────────────────────
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

// ── Pipeline stage mapping based on quote status ───────────────────────
function mapToPipelineStatus(quoteStatus: string): string {
  const mapping: Record<string, string> = {
    draft: "lead",
    sent: "proposal",
    approved: "closed",
    rejected: "cancelled",
    expired: "cancelled",
  };
  return mapping[quoteStatus] || "lead";
}

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  // ── Auth: validate API key ───────────────────────────────────────────
  const apiKey = req.headers.get("x-api-key");
  if (!apiKey || apiKey !== syncApiKey) {
    console.error("Unauthorized: invalid or missing API key");
    return new Response(
      JSON.stringify({ error: "Unauthorized" }),
      { status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }

  const supabase = createClient(supabaseUrl, supabaseServiceKey);

  try {
    const body = await req.json();
    const { action, quote, timestamp } = body as {
      action: string;
      quote: IncomingQuote;
      timestamp?: string;
    };

    console.log(`[receive-quote-webhook] action=${action} quote_number=${quote?.quote_number} ts=${timestamp}`);

    if (action !== "create_or_update_quote" || !quote) {
      return new Response(
        JSON.stringify({ error: "Invalid action or missing quote data" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // ── Log the sync attempt ─────────────────────────────────────────
    const logEntry = {
      source: "gift_store",
      external_quote_id: quote.id,
      action,
      payload: JSON.stringify(quote),
      status: "processing" as string,
      error_message: null as string | null,
    };

    const { data: logData } = await supabase
      .from("quote_sync_logs")
      .insert(logEntry)
      .select("id")
      .single();

    const logId = logData?.id;

    try {
      const mappedStatus = mapQuoteStatus(quote.status);
      const pipelineStatus = mapToPipelineStatus(mappedStatus);
      const now = new Date().toISOString();

      // ── Upsert quote ────────────────────────────────────────────────
      // Check if quote already exists by external_quote_id
      const { data: existingQuote } = await supabase
        .from("quotes")
        .select("id, sale_id")
        .eq("external_quote_id", quote.id)
        .maybeSingle();

      const quoteRecord: Record<string, unknown> = {
        client_name: quote.client_name || "Cliente não identificado",
        title: `Orçamento ${quote.quote_number}`,
        description: quote.notes || null,
        total_value: quote.total,
        status: mappedStatus,
        external_reference: quote.quote_number,
        external_quote_id: quote.id,
        quote_number: quote.quote_number,
        subtotal: quote.subtotal,
        discount_amount: quote.discount_amount,
        items: JSON.stringify(quote.items),
        valid_until: quote.valid_until || null,
        notes: quote.notes || null,
        sync_status: "synced",
        updated_at: now,
      };

      // Set timestamp fields based on status
      if (mappedStatus === "sent") quoteRecord.sent_at = now;
      if (mappedStatus === "approved") quoteRecord.approved_at = now;
      if (mappedStatus === "rejected") quoteRecord.rejected_at = now;

      let quoteId: string;
      let saleId: string | null = existingQuote?.sale_id || null;

      if (existingQuote) {
        // Update existing quote
        const { error: updateErr } = await supabase
          .from("quotes")
          .update(quoteRecord)
          .eq("id", existingQuote.id);

        if (updateErr) throw updateErr;
        quoteId = existingQuote.id;
        console.log(`[receive-quote-webhook] Updated existing quote ${quoteId}`);
      } else {
        // Insert new quote
        quoteRecord.created_at = quote.created_at || now;
        const { data: newQuote, error: insertErr } = await supabase
          .from("quotes")
          .insert(quoteRecord)
          .select("id")
          .single();

        if (insertErr) throw insertErr;
        quoteId = newQuote.id;
        console.log(`[receive-quote-webhook] Created new quote ${quoteId}`);
      }

      // ── Upload PDF if provided ──────────────────────────────────────
      if (quote.pdf_base64) {
        try {
          const binaryStr = atob(quote.pdf_base64);
          const bytes = new Uint8Array(binaryStr.length);
          for (let i = 0; i < binaryStr.length; i++) {
            bytes[i] = binaryStr.charCodeAt(i);
          }

          const pdfPath = `proposta-${quote.quote_number.replace(/\//g, "-")}.pdf`;

          const { error: uploadErr } = await supabase.storage
            .from("quote-pdfs")
            .upload(pdfPath, bytes, {
              contentType: "application/pdf",
              upsert: true,
            });

          if (uploadErr) {
            console.error("[receive-quote-webhook] PDF upload error:", uploadErr);
          } else {
            const { data: urlData } = supabase.storage
              .from("quote-pdfs")
              .getPublicUrl(pdfPath);

            if (urlData?.publicUrl) {
              await supabase
                .from("quotes")
                .update({ pdf_url: urlData.publicUrl })
                .eq("id", quoteId);
              console.log(`[receive-quote-webhook] PDF saved: ${urlData.publicUrl}`);
            }
          }
        } catch (pdfErr) {
          console.error("[receive-quote-webhook] PDF processing error:", pdfErr);
        }
      }

      // ── Upsert pipeline entry (sales table) ────────────────────────
      // Build product name from items for the pipeline card
      const productSummary = quote.items
        .slice(0, 3)
        .map((i) => `${i.product_name} (x${i.quantity})`)
        .join(", ");
      const productName =
        quote.items.length > 3
          ? `${productSummary} +${quote.items.length - 3} itens`
          : productSummary || `Orçamento ${quote.quote_number}`;

      if (saleId) {
        // Update existing pipeline entry
        const { error: saleUpdateErr } = await supabase
          .from("sales")
          .update({
            client_name: quote.client_name || "Cliente não identificado",
            product_name: productName,
            amount: quote.total,
            status: pipelineStatus,
            updated_at: now,
          })
          .eq("id", saleId);

        if (saleUpdateErr) {
          console.error("[receive-quote-webhook] Error updating sale:", saleUpdateErr);
        } else {
          console.log(`[receive-quote-webhook] Updated pipeline sale ${saleId}`);
        }
      } else {
        // Create new pipeline entry
        const { data: newSale, error: saleInsertErr } = await supabase
          .from("sales")
          .insert({
            client_name: quote.client_name || "Cliente não identificado",
            product_name: productName,
            amount: quote.total,
            status: pipelineStatus,
            category: "brindes",
            created_at: quote.created_at || now,
          })
          .select("id")
          .single();

        if (saleInsertErr) {
          console.error("[receive-quote-webhook] Error creating sale:", saleInsertErr);
        } else if (newSale) {
          saleId = newSale.id;
          // Link quote to the sale
          await supabase
            .from("quotes")
            .update({ sale_id: saleId })
            .eq("id", quoteId);
          console.log(`[receive-quote-webhook] Created pipeline sale ${saleId} linked to quote ${quoteId}`);
        }
      }

      // ── Update sync log to success ─────────────────────────────────
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
          status: mappedStatus,
          pipeline_status: pipelineStatus,
        }),
        { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    } catch (processingError) {
      const errMsg = processingError instanceof Error ? processingError.message : "Unknown error";
      console.error("[receive-quote-webhook] Processing error:", processingError);

      // Update sync log to failed
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
    console.error("[receive-quote-webhook] Fatal error:", error);
    return new Response(
      JSON.stringify({ error: errMsg }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
