import { corsHeaders } from "../_shared/cors.ts";
import { createClient } from "npm:@supabase/supabase-js@2.49.4";
import { withRequestId } from "../_shared/request-id.ts";
import { chunkedIn } from "../_shared/chunked-in.ts";
import { partitionNotificationBatch } from "../_shared/notification-categories.ts";


Deno.serve(withRequestId("qbr-scheduler", async (req, _ctx) => {
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
    const today = new Date().toISOString().split("T")[0];
    const horizon = new Date(Date.now() + 30 * 86400000).toISOString().split("T")[0];
    const { data: schedules } = await supabase
      .from("qbr_schedule")
      .select("id, account_id, owner_salesperson_id, next_qbr_at, frequency")
      .eq("is_active", true)
      .eq("auto_generate", true)
      .not("next_qbr_at", "is", null)
      .lte("next_qbr_at", horizon)
      .gte("next_qbr_at", today)
      .limit(200);

    let eventsCreated = 0;
    let notificationsCreated = 0;

    const active = (schedules ?? []).filter((s) => s.owner_salesperson_id);
    if (active.length === 0) {
      return new Response(
        JSON.stringify({ ok: true, schedules_updated: rolled, upcoming_qbrs: 0, events_created: 0, notifications_created: 0 }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" } },
      );
    }

    // Pre-fetch accounts and salespeople in parallel — eliminates 2 DB calls per schedule row
    const accountIds = [...new Set(active.map((s) => s.account_id))];
    const spIds = [...new Set(active.map((s) => s.owner_salesperson_id))];
    const [accountRows, spRows, existingEvents] = await Promise.all([
      chunkedIn<{ id: string; name: string }>(
        accountIds,
        (chunk) => supabase.from("accounts").select("id, name").in("id", chunk),
        { parallel: true, label: "qbr-scheduler.accounts" },
      ),
      chunkedIn<{ id: string; auth_user_id: string | null }>(
        spIds,
        (chunk) => supabase.from("salespeople").select("id, auth_user_id").in("id", chunk),
        { parallel: true, label: "qbr-scheduler.salespeople" },
      ),
      chunkedIn<{ salesperson_id: string; scheduled_at: string }>(
        spIds,
        (chunk) => supabase
          .from("agenda_events")
          .select("salesperson_id, scheduled_at")
          .in("salesperson_id", chunk)
          .eq("event_type", "qbr")
          .gte("scheduled_at", `${today}T00:00:00Z`)
          .lte("scheduled_at", `${horizon}T23:59:59Z`)
          .limit(active.length * 3),
        { parallel: true, label: "qbr-scheduler.existing-events" },
      ),
    ]);

    const accountNameById = new Map(accountRows.map((a) => [a.id, a.name]));
    const authUserById = new Map(spRows.map((sp) => [sp.id, sp.auth_user_id]));

    // Build dedup set: "salesperson_id:YYYY-MM" — one QBR per salesperson per calendar month
    const existingQbrKeys = new Set(
      existingEvents.map((e) => {
        const month = e.scheduled_at.slice(0, 7); // "YYYY-MM"
        return `${e.salesperson_id}:${month}`;
      })
    );

    const eventRows: Array<Record<string, unknown>> = [];
    const notifRows: Array<Record<string, unknown>> = [];

    for (const s of active) {
      const accountName = accountNameById.get(s.account_id) ?? "Conta";
      const month = (s.next_qbr_at as string).slice(0, 7);
      const dedupKey = `${s.owner_salesperson_id}:${month}`;
      if (existingQbrKeys.has(dedupKey)) continue;
      existingQbrKeys.add(dedupKey); // prevent duplicates within same run

      const scheduledAt = new Date(`${s.next_qbr_at}T14:00:00Z`).toISOString();
      eventRows.push({
        salesperson_id: s.owner_salesperson_id,
        event_type: "qbr",
        title: `QBR ${s.frequency} — ${accountName}`,
        description: `Quarterly Business Review com ${accountName}. Revisar métricas, ROI, roadmap e expansão.`,
        scheduled_at: scheduledAt,
        priority: "high",
        status: "scheduled",
        reminder_minutes_before: 1440,
      });

      const authUserId = authUserById.get(s.owner_salesperson_id);
      if (authUserId) {
        notifRows.push({
          user_id: authUserId,
          type: "qbr_scheduled",
          title: `QBR agendada: ${accountName}`,
          message: `Próxima revisão executiva em ${s.next_qbr_at}. Prepare deck e métricas.`,
          category: "customer_success",
          priority: "medium",
          metadata: { account_id: s.account_id, qbr_date: s.next_qbr_at },
        });
      }
    }

    // Batch insert events and notifications in parallel — 2 DB calls regardless of schedule count
    const [evResult, notifResult] = await Promise.all([
      eventRows.length > 0 ? supabase.from("agenda_events").insert(eventRows) : Promise.resolve({ error: null }),
      notifRows.length > 0 ? supabase.from("notifications").insert(notifRows) : Promise.resolve({ error: null }),
    ]);
    if (!evResult.error) eventsCreated = eventRows.length;
    if (!notifResult.error) notificationsCreated = notifRows.length;

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
    console.error('qbr-scheduler error:', err);
    return new Response(JSON.stringify({ error: err instanceof Error ? err.message : "unknown" }), {
      status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
}));
