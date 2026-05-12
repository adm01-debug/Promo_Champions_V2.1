import { createClient } from "npm:@supabase/supabase-js@2.49.4";
import { corsHeaders } from "../_shared/cors.ts";

type EntityType =
  | "client" | "lead" | "deal" | "activity" | "call_recording"
  | "note" | "email_message" | "whatsapp_message" | "proposal" | "task" | "playbook" | "product";

interface IndexRequest {
  entity_type: EntityType;
  entity_id: string;
  force?: boolean;
}

const TABLE_BY_TYPE: Record<EntityType, { table: string; ownerCol: string | null }> = {
  client: { table: "clients", ownerCol: null },
  lead: { table: "sales", ownerCol: "salesperson_id" },
  deal: { table: "sales", ownerCol: "salesperson_id" },
  activity: { table: "activities", ownerCol: "salesperson_id" },
  call_recording: { table: "call_recordings", ownerCol: "salesperson_id" },
  note: { table: "notes", ownerCol: "user_id" },
  email_message: { table: "email_messages", ownerCol: "salesperson_id" },
  whatsapp_message: { table: "whatsapp_messages", ownerCol: "salesperson_id" },
  proposal: { table: "proposals", ownerCol: "salesperson_id" },
  task: { table: "tasks", ownerCol: "salesperson_id" },
  playbook: { table: "playbooks", ownerCol: null },
};

function buildContent(type: EntityType, row: Record<string, unknown>): string {
  const j = (xs: unknown[]) => xs.filter(Boolean).join(" • ");
  switch (type) {
    case "client":
      return j([row.name, row.email, row.phone, row.company, row.notes, row.industry, row.address]);
    case "lead":
    case "deal":
      return j([row.client_name, row.product_name, row.category, row.source, row.notes, row.email, row.phone, row.amount ? `R$${row.amount}` : null, row.status]);
    case "activity":
      return j([row.activity_type, row.contact_name, row.notes, row.outcome]);
    case "call_recording":
      return j([row.title, row.summary, row.transcript, (row.key_topics as string[] | undefined)?.join(", ")]);
    case "note":
      return j([row.title, row.content, row.body]);
    case "email_message":
      return j([row.subject, row.from_email, row.to_email, row.body_text, row.snippet]);
    case "whatsapp_message":
      return j([row.from_number, row.to_number, row.body, row.message_text]);
    case "proposal":
      return j([row.title, row.client_name, row.summary, row.content, row.notes, row.amount ? `R$${row.amount}` : null]);
    case "task":
      return j([row.title, row.description, row.status, row.priority]);
    case "playbook":
      return j([row.name, row.title, row.description, row.content, row.stage]);
    default:
      return "";
  }
}

async function sha256Hex(text: string): Promise<string> {
  const buf = new TextEncoder().encode(text);
  const hash = await crypto.subtle.digest("SHA-256", buf);
  return Array.from(new Uint8Array(hash)).map((b) => b.toString(16).padStart(2, "0")).join("");
}

async function generateEmbedding(text: string, apiKey: string): Promise<number[]> {
  const res = await fetch("https://ai.gateway.lovable.dev/v1/embeddings", {
    method: "POST",
    headers: { Authorization: `Bearer ${apiKey}`, "Content-Type": "application/json" },
    body: JSON.stringify({ model: "google/text-embedding-004", input: text.slice(0, 8000) }),
  });
  if (!res.ok) throw new Error(`Embedding error ${res.status}: ${await res.text()}`);
  const json = await res.json();
  const emb = json?.data?.[0]?.embedding;
  if (!Array.isArray(emb)) throw new Error("Invalid embedding response");
  return emb;
}

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

  try {
    const { entity_type, entity_id, force = false } = (await req.json()) as IndexRequest;
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

    const contentHash = await sha256Hex(content);
    const sourceUpdatedAt = (row.updated_at as string | undefined) ?? (row.created_at as string | undefined) ?? null;

    // Skip if hash unchanged (and not forced)
    if (!force) {
      const { data: existing } = await supabase
        .from("semantic_index")
        .select("content_hash, source_updated_at")
        .eq("entity_type", entity_type)
        .eq("entity_id", entity_id)
        .maybeSingle();
      if (existing && existing.content_hash === contentHash) {
        return new Response(JSON.stringify({ skipped: true, reason: "unchanged", content_hash: contentHash }), {
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
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

    // Update freshness columns separately (RPC doesn't accept them)
    await supabase.from("semantic_index").update({
      content_hash: contentHash,
      source_updated_at: sourceUpdatedAt,
    }).eq("entity_type", entity_type).eq("entity_id", entity_id);

    return new Response(JSON.stringify({ ok: true, id: upsertId, content_preview: content.slice(0, 120), content_hash: contentHash }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (e) {
    console.error("semantic-index-entity error:", e);
    return new Response(JSON.stringify({ error: e instanceof Error ? e.message : "Unknown" }), {
      status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
