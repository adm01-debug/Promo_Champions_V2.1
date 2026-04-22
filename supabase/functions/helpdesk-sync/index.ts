import { corsHeaders } from "../_shared/cors.ts";
import { createClient } from "npm:@supabase/supabase-js@2.49.4";

type Provider = "zendesk" | "intercom" | "freshdesk";

interface SyncRequest {
  provider: Provider;
  account_id?: string;
  account_email_domain?: string;
}

async function fetchZendesk(domain: string, email: string, token: string) {
  const auth = btoa(`${email}/token:${token}`);
  const url = `https://${domain}.zendesk.com/api/v2/tickets/recent.json?per_page=50`;
  const r = await fetch(url, { headers: { Authorization: `Basic ${auth}` } });
  if (!r.ok) throw new Error(`Zendesk ${r.status}`);
  const j = await r.json();
  return (j.tickets ?? []).map((t: Record<string, unknown>) => ({
    external_id: String(t.id),
    subject: String(t.subject ?? "(sem assunto)"),
    description: String(t.description ?? ""),
    status: ["new", "open"].includes(String(t.status)) ? "open" : String(t.status) === "pending" ? "pending" : String(t.status) === "solved" ? "resolved" : "closed",
    priority: String(t.priority ?? "normal"),
    requester_email: (t.requester as { email?: string } | undefined)?.email ?? null,
    created_at: t.created_at,
    resolved_at: ["solved", "closed"].includes(String(t.status)) ? t.updated_at : null,
  }));
}

async function fetchIntercom(token: string) {
  const r = await fetch("https://api.intercom.io/conversations?per_page=50", {
    headers: { Authorization: `Bearer ${token}`, Accept: "application/json", "Intercom-Version": "2.11" },
  });
  if (!r.ok) throw new Error(`Intercom ${r.status}`);
  const j = await r.json();
  return (j.conversations ?? []).map((c: Record<string, unknown>) => ({
    external_id: String(c.id),
    subject: String((c.source as { subject?: string } | undefined)?.subject ?? "Conversa Intercom"),
    description: String((c.source as { body?: string } | undefined)?.body ?? "").replace(/<[^>]+>/g, "").slice(0, 500),
    status: c.state === "open" ? "open" : c.state === "snoozed" ? "pending" : "closed",
    priority: c.priority === "priority" ? "high" : "normal",
    requester_email: ((c.contacts as { contacts?: Array<{ email?: string }> } | undefined)?.contacts?.[0]?.email) ?? null,
    created_at: new Date(((c.created_at as number) ?? 0) * 1000).toISOString(),
    resolved_at: c.state === "closed" ? new Date(((c.updated_at as number) ?? 0) * 1000).toISOString() : null,
  }));
}

async function fetchFreshdesk(domain: string, apiKey: string) {
  const auth = btoa(`${apiKey}:X`);
  const r = await fetch(`https://${domain}.freshdesk.com/api/v2/tickets?per_page=50&order_by=updated_at&order_type=desc`, {
    headers: { Authorization: `Basic ${auth}` },
  });
  if (!r.ok) throw new Error(`Freshdesk ${r.status}`);
  const arr = await r.json();
  const statusMap: Record<number, string> = { 2: "open", 3: "pending", 4: "resolved", 5: "closed" };
  const prioMap: Record<number, string> = { 1: "low", 2: "normal", 3: "high", 4: "urgent" };
  return (arr ?? []).map((t: Record<string, unknown>) => ({
    external_id: String(t.id),
    subject: String(t.subject ?? "(sem assunto)"),
    description: String(t.description_text ?? "").slice(0, 500),
    status: statusMap[t.status as number] ?? "open",
    priority: prioMap[t.priority as number] ?? "normal",
    requester_email: null,
    created_at: t.created_at,
    resolved_at: [4, 5].includes(t.status as number) ? t.updated_at : null,
  }));
}

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

  try {
    const supabase = createClient(Deno.env.get("SUPABASE_URL")!, Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!);
    const body = (await req.json().catch(() => ({}))) as SyncRequest;
    const { provider, account_id } = body;
    if (!provider) return new Response(JSON.stringify({ error: "provider required" }), { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } });

    let tickets: Array<Record<string, unknown>> = [];
    if (provider === "zendesk") {
      const domain = Deno.env.get("ZENDESK_DOMAIN");
      const email = Deno.env.get("ZENDESK_EMAIL");
      const token = Deno.env.get("ZENDESK_API_TOKEN");
      if (!domain || !email || !token) throw new Error("Zendesk não configurado (ZENDESK_DOMAIN/EMAIL/API_TOKEN)");
      tickets = await fetchZendesk(domain, email, token);
    } else if (provider === "intercom") {
      const token = Deno.env.get("INTERCOM_ACCESS_TOKEN");
      if (!token) throw new Error("Intercom não configurado (INTERCOM_ACCESS_TOKEN)");
      tickets = await fetchIntercom(token);
    } else if (provider === "freshdesk") {
      const domain = Deno.env.get("FRESHDESK_DOMAIN");
      const apiKey = Deno.env.get("FRESHDESK_API_KEY");
      if (!domain || !apiKey) throw new Error("Freshdesk não configurado (FRESHDESK_DOMAIN/API_KEY)");
      tickets = await fetchFreshdesk(domain, apiKey);
    }

    // Resolver account_id padrão (primeira conta) caso não informado
    let targetAccountId = account_id ?? null;
    if (!targetAccountId) {
      const { data: a } = await supabase.from("accounts").select("id").limit(1).maybeSingle();
      targetAccountId = a?.id ?? null;
    }
    if (!targetAccountId) throw new Error("Nenhuma conta disponível para vincular tickets");

    let upserted = 0;
    for (const t of tickets) {
      const { error } = await supabase.from("support_tickets").upsert({
        account_id: targetAccountId,
        external_id: t.external_id,
        source: provider,
        subject: t.subject,
        description: t.description,
        status: t.status,
        priority: t.priority,
        requester_email: t.requester_email,
        created_at: t.created_at,
        resolved_at: t.resolved_at,
      }, { onConflict: "source,external_id" });
      if (!error) upserted++;
    }

    return new Response(JSON.stringify({ ok: true, provider, fetched: tickets.length, upserted }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (err) {
    return new Response(JSON.stringify({ error: err instanceof Error ? err.message : "unknown" }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
