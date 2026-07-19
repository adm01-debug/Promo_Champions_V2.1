import { corsHeaders } from "../_shared/cors.ts";
import { createClient } from "npm:@supabase/supabase-js@2.49.4";
import { withRequestId } from "../_shared/request-id.ts";

interface RenewalRow {
  id: string;
  account_id: string;
  contract_value: number;
  renewal_date: string;
  status: string;
  auto_renew: boolean;
  owner_salesperson_id: string | null;
}

Deno.serve(withRequestId("renewal-automation", async (req, _ctx) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

  try {
    const supabase = createClient(Deno.env.get("SUPABASE_URL")!, Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!);

    // 1) Atualiza status via RPC
    const { data: riskUpdated } = await supabase.rpc("detect_renewal_risks");

    // 2) Carrega renovações nos próximos 90 dias
    const today = new Date();
    const horizon = new Date(today.getTime() + 90 * 86400000).toISOString().slice(0, 10);
    const { data: rows } = await supabase
      .from("renewals")
      .select("id, account_id, contract_value, renewal_date, status, auto_renew, owner_salesperson_id")
      .lte("renewal_date", horizon)
      .gte("renewal_date", today.toISOString().slice(0, 10))
      .in("status", ["upcoming", "at_risk"]);

    const renewals = (rows ?? []) as RenewalRow[];
    const buckets = { d90: 0, d60: 0, d30: 0, d7: 0 };
    let tasksCreated = 0;
    let notificationsCreated = 0;

    // Batch-load recent renewal tasks to avoid N+1 per renewal
    const cutoff5d = new Date(today.getTime() - 5 * 86400000).toISOString();
    const ownerIds = [...new Set(renewals.map(r => r.owner_salesperson_id).filter(Boolean))] as string[];
    const { data: recentTasks } = ownerIds.length
      ? await supabase
          .from("tasks")
          .select("salesperson_id, title")
          .in("salesperson_id", ownerIds)
          .ilike("title", "Renovação em%")
          .gte("created_at", cutoff5d)
      : { data: [] };

    // Index: "salesperson_id:bucket" → true if task already exists
    const existingTaskKeys = new Set(
      (recentTasks ?? []).map((t: { salesperson_id: string; title: string }) => {
        const m = t.title?.match(/^Renovação em (\d+)d/);
        return m ? `${t.salesperson_id}:${m[1]}` : null;
      }).filter(Boolean) as string[]
    );

    // Batch notifications
    const notifRows: Array<Record<string, unknown>> = [];

    for (const r of renewals) {
      const days = Math.floor((new Date(r.renewal_date).getTime() - today.getTime()) / 86400000);
      let bucket: 7 | 30 | 60 | 90 | null = null;
      if (days <= 7) { bucket = 7; buckets.d7++; }
      else if (days <= 30) { bucket = 30; buckets.d30++; }
      else if (days <= 60) { bucket = 60; buckets.d60++; }
      else if (days <= 90) { bucket = 90; buckets.d90++; }
      if (bucket === null || !r.owner_salesperson_id) continue;

      const dueDate = new Date(today.getTime() + Math.min(bucket, 7) * 86400000).toISOString().slice(0, 10);
      const title = `Renovação em ${bucket}d — ${r.contract_value > 0 ? `R$ ${Number(r.contract_value).toLocaleString("pt-BR")}` : "contrato"}`;
      const taskKey = `${r.owner_salesperson_id}:${bucket}`;

      if (!existingTaskKeys.has(taskKey)) {
        const { error: tErr } = await supabase.from("tasks").insert({
          salesperson_id: r.owner_salesperson_id,
          title,
          description: `Renovação automática (account: ${r.account_id}). Status: ${r.status}.`,
          priority: bucket <= 30 ? "high" : "medium",
          status: "pending",
          due_date: dueDate,
        });
        if (!tErr) {
          tasksCreated++;
          existingTaskKeys.add(taskKey); // prevent duplicates within same run
        }
      }

      notifRows.push({
        user_id: r.owner_salesperson_id,
        title: `Renovação ${bucket}d`,
        message: `Conta tem renovação em ${days} dias. Valor: R$ ${Number(r.contract_value).toLocaleString("pt-BR")}`,
        type: bucket <= 30 ? "warning" : "info",
        link: `/customer-success-360`,
      });
    }

    // Batch insert all notifications in one query
    if (notifRows.length > 0) {
      const { error: nErr } = await supabase.from("notifications").insert(notifRows);
      if (!nErr) notificationsCreated = notifRows.length;
    }

    return new Response(
      JSON.stringify({
        ok: true,
        risk_updated: riskUpdated ?? 0,
        renewals_inspected: renewals.length,
        buckets,
        tasks_created: tasksCreated,
        notifications_created: notificationsCreated,
      }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } },
    );
  } catch (err) {
    console.error('renewal-automation error:', err);
    return new Response(JSON.stringify({ error: err instanceof Error ? err.message : "unknown" }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
}));
