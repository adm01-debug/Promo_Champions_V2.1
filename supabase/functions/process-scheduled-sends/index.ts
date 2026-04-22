import { createClient } from "npm:@supabase/supabase-js@2.49.4";
import { corsHeaders } from "../_shared/cors.ts";

const SUPABASE_URL = Deno.env.get("SUPABASE_URL")!;
const SERVICE_ROLE = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;

interface Scheduled {
  id: string;
  owner_id: string;
  sale_id: string;
  channel: string;
  payload: Record<string, unknown>;
}

async function dispatchOne(admin: ReturnType<typeof createClient>, row: Scheduled) {
  try {
    const { error } = await admin.functions.invoke("send-multichannel-message", {
      body: { sale_id: row.sale_id, channel: row.channel, ...row.payload, owner_id: row.owner_id },
    });
    if (error) throw new Error(error.message);
    await admin.from("scheduled_sends").update({ status: "sent", sent_at: new Date().toISOString(), error: null }).eq("id", row.id);
  } catch (e) {
    await admin.from("scheduled_sends").update({ status: "failed", error: (e as Error).message }).eq("id", row.id);
  }
}

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });
  try {
    const admin = createClient(SUPABASE_URL, SERVICE_ROLE);
    const { data, error } = await admin
      .from("scheduled_sends")
      .select("id, owner_id, sale_id, channel, payload")
      .eq("status", "pending")
      .lte("scheduled_for", new Date().toISOString())
      .limit(50);
    if (error) throw error;
    const rows = (data ?? []) as Scheduled[];

    // concurrency 5
    const queue = [...rows];
    const workers = Array.from({ length: Math.min(5, queue.length) }, async () => {
      while (queue.length) {
        const row = queue.shift();
        if (row) await dispatchOne(admin, row);
      }
    });
    await Promise.all(workers);

    return new Response(JSON.stringify({ processed: rows.length }), {
      status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (e) {
    return new Response(JSON.stringify({ error: (e as Error).message }), {
      status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
