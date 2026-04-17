import { createClient } from "https://esm.sh/@supabase/supabase-js@2.57.4";
import { corsHeaders } from "../_shared/cors.ts";

interface IndexRequest {
  entity_type: "client" | "lead" | "deal" | "activity" | "call_recording";
  entity_id: string;
}

async function generateEmbedding(text: string, apiKey: string): Promise<number[]> {
  const res = await fetch("https://ai.gateway.lovable.dev/v1/embeddings", {
    method: "POST",
    headers: { Authorization: `Bearer ${apiKey}`, "Content-Type": "application/json" },
    body: JSON.stringify({ model: "google/text-embedding-004", input: text.slice(0, 8000) }),
  });
  if (!res.ok) {
    const t = await res.text();
    throw new Error(`Embedding error ${res.status}: ${t}`);
  }
  const json = await res.json();
  const emb = json?.data?.[0]?.embedding;
  if (!Array.isArray(emb)) throw new Error("Invalid embedding response");
  return emb;
}

function buildContent(type: string, row: Record<string, unknown>): string {
  switch (type) {
    case "client":
      return [row.name, row.email, row.phone, row.company, row.notes, row.industry, row.address]
        .filter(Boolean).join(" • ");
    case "lead":
    case "deal":
      return [row.client_name, row.product_name, row.category, row.source, row.notes, row.email, row.phone, `R$${row.amount ?? ""}`, row.status]
        .filter(Boolean).join(" • ");
    case "activity":
      return [row.activity_type, row.contact_name, row.notes, row.outcome].filter(Boolean).join(" • ");
    case "call_recording":
      return [row.title, row.summary, row.transcript, (row.key_topics as string[] | undefined)?.join(", ")]
        .filter(Boolean).join(" • ");
    default:
      return "";
  }
}

const TABLE_BY_TYPE: Record<string, { table: string; ownerCol: string | null }> = {
  client: { table: "clients", ownerCol: null },
  lead: { table: "sales", ownerCol: "salesperson_id" },
  deal: { table: "sales", ownerCol: "salesperson_id" },
  activity: { table: "activities", ownerCol: "salesperson_id" },
  call_recording: { table: "call_recordings", ownerCol: "salesperson_id" },
};

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

  try {
    const { entity_type, entity_id } = (await req.json()) as IndexRequest;
    if (!entity_type || !entity_id || !TABLE_BY_TYPE[entity_type]) {
      return new Response(JSON.stringify({ error: "invalid entity_type or entity_id" }), {
        status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const apiKey = Deno.env.get("LOVABLE_API_KEY");
    if (!apiKey) throw new Error("LOVABLE_API_KEY not configured");

    const supabase = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!,
    );

    const cfg = TABLE_BY_TYPE[entity_type];
    const { data: row, error: rowErr } = await supabase
      .from(cfg.table).select("*").eq("id", entity_id).maybeSingle();
    if (rowErr) throw rowErr;
    if (!row) {
      return new Response(JSON.stringify({ error: "entity not found" }), {
        status: 404, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const content = buildContent(entity_type, row).trim();
    if (!content) {
      return new Response(JSON.stringify({ skipped: true, reason: "empty content" }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    let salesperson_id: string | null = cfg.ownerCol ? (row[cfg.ownerCol] as string | null) ?? null : null;
    if (entity_type === "client" && !salesperson_id) {
      const { data: cp } = await supabase.from("client_portfolio")
        .select("salesperson_id").eq("client_id", entity_id).maybeSingle();
      salesperson_id = cp?.salesperson_id ?? null;
    }

    const embedding = await generateEmbedding(content, apiKey);

    const { data: upsertId, error: upErr } = await supabase.rpc("upsert_semantic_entry", {
      _entity_type: entity_type,
      _entity_id: entity_id,
      _salesperson_id: salesperson_id,
      _content: content,
      _embedding: embedding as unknown as string,
      _metadata: { indexed_at: new Date().toISOString() },
    });
    if (upErr) throw upErr;

    return new Response(JSON.stringify({ ok: true, id: upsertId, content_preview: content.slice(0, 120) }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (e) {
    console.error("semantic-index-entity error:", e);
    return new Response(JSON.stringify({ error: e instanceof Error ? e.message : "Unknown" }), {
      status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
