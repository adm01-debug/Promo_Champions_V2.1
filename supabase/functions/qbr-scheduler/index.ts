import { corsHeaders } from "../_shared/cors.ts";
import { createClient } from "npm:@supabase/supabase-js@2.49.4";

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

  try {
    const supabase = createClient(Deno.env.get("SUPABASE_URL")!, Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!);
    const body = await req.json().catch(() => ({}));
    const action = body.action ?? "schedule_and_create_events";

    // 1) Recompute next_qbr_at for all active schedules
    const { data: rolled, error: rollErr } = await supabase.rpc("schedule_next_qbrs");
    if (rollErr) throw rollErr;

    if (action === "schedule_only") {
      return new Response(JSON.stringify({ ok: true, schedules_updated: rolled }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // 2) Find QBRs scheduled within the next 30 days that don't have an agenda event yet
    const horizon = new Date(Date.now() + 30 * 86400000).toISOString().split("T")[0];
    const { data: schedules } = await supabase
      .from("qbr_schedule")
      .select("id, account_id, owner_salesperson_id, next_qbr_at, frequency")
      .eq("is_active", true)
      .eq("auto_generate", true)
      .not("next_qbr_at", "is", null)
      .lte("next_qbr_at", horizon)
      .gte("next_qbr_at", new Date().toISOString().split("T")[0]);

    let eventsCreated = 0;
    let notificationsCreated = 0;

    for (const s of schedules ?? []) {
      if (!s.owner_salesperson_id) continue;

      const { data: acc } = await supabase
        .from("accounts").select("name").eq("id", s.account_id).single();
      const accountName = acc?.name ?? "Conta";

      // dedup: existe agenda_event QBR para esta conta nesse mês?
      const monthStart = new Date(s.next_qbr_at as string);
      monthStart.setDate(1);
      const { data: existing } = await supabase
        .from("agenda_events")
        .select("id")
        .eq("salesperson_id", s.owner_salesperson_id)
        .eq("event_type", "qbr")
        .gte("scheduled_at", monthStart.toISOString())
        .limit(1);
      if (existing && existing.length > 0) continue;

      const scheduledAt = new Date(`${s.next_qbr_at}T14:00:00Z`).toISOString();
      const { error: evErr } = await supabase.from("agenda_events").insert({
        salesperson_id: s.owner_salesperson_id,
        event_type: "qbr",
        title: `QBR ${s.frequency} — ${accountName}`,
        description: `Quarterly Business Review com ${accountName}. Revisar métricas, ROI, roadmap e expansão.`,
        scheduled_at: scheduledAt,
        priority: "high",
        status: "scheduled",
        reminder_minutes_before: 1440,
      });
      if (!evErr) eventsCreated++;

      // Get auth_user_id of owner to send notification
      const { data: sp } = await supabase
        .from("salespeople").select("auth_user_id").eq("id", s.owner_salesperson_id).single();
      if (sp?.auth_user_id) {
        const { error: nErr } = await supabase.from("notifications").insert({
          user_id: sp.auth_user_id,
          type: "qbr_scheduled",
          title: `QBR agendada: ${accountName}`,
          message: `Próxima revisão executiva em ${s.next_qbr_at}. Prepare deck e métricas.`,
          category: "customer_success",
          priority: "medium",
          metadata: { account_id: s.account_id, qbr_date: s.next_qbr_at },
        });
        if (!nErr) notificationsCreated++;
      }
    }

    return new Response(
      JSON.stringify({
        ok: true,
        schedules_updated: rolled,
        upcoming_qbrs: schedules?.length ?? 0,
        events_created: eventsCreated,
        notifications_created: notificationsCreated,
      }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } },
    );
  } catch (err) {
    return new Response(JSON.stringify({ error: err instanceof Error ? err.message : "unknown" }), {
      status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
