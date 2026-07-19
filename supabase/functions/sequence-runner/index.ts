import { createClient } from "npm:@supabase/supabase-js@2.49.4";
import { corsHeaders } from "../_shared/cors.ts";
import { withRequestId } from "../_shared/request-id.ts";

interface Enrollment {
  id: string;
  sequence_id: string;
  contact_id: string;
  contact_type: string;
  current_step: number;
  status: string;
  send_time_optimization?: boolean;
  owner_id?: string;
}

interface Step {
  id: string;
  sequence_id: string;
  step_order: number;
  channel: string;
  delay_days: number;
  delay_hours: number;
  subject: string | null;
  body: string | null;
  whatsapp_template_id?: string | null;
}

function resolveTemplateVariables(
  template: string | null,
  ctx: { nome?: string; empresa?: string; cargo?: string; ultima_interacao?: string },
): string | null {
  if (!template) return template;
  return template.replace(/\{\{\s*([a-zA-Z0-9_.]+)\s*\}\}/g, (_, key: string) => {
    const k = key.trim().toLowerCase();
    if (k === "nome" || k === "cliente.nome") return ctx.nome ?? `{{${key}}}`;
    if (k === "empresa" || k === "cliente.empresa") return ctx.empresa ?? `{{${key}}}`;
    if (k === "cargo" || k === "cliente.cargo") return ctx.cargo ?? `{{${key}}}`;
    if (k === "ultima_interacao") return ctx.ultima_interacao ?? `{{${key}}}`;
    if (k === "data.hoje") return new Date().toLocaleDateString("pt-BR");
    return `{{${key}}}`;
  });
}

async function fetchContactContext(
  supabase: ReturnType<typeof createClient>,
  contactId: string,
  contactType: string,
): Promise<{ nome?: string; empresa?: string; cargo?: string; phone?: string }> {
  try {
    if (contactType === "client") {
      const { data } = await supabase
        .from("clients")
        .select("name, company, phone")
        .eq("id", contactId)
        .maybeSingle();
      return {
        nome: (data as { name?: string } | null)?.name ?? undefined,
        empresa: (data as { company?: string } | null)?.company ?? undefined,
        phone: (data as { phone?: string } | null)?.phone ?? undefined,
      };
    }
    if (contactType === "lead") {
      const { data } = await supabase
        .from("leads")
        .select("name, company, position, phone")
        .eq("id", contactId)
        .maybeSingle();
      return {
        nome: (data as { name?: string } | null)?.name ?? undefined,
        empresa: (data as { company?: string } | null)?.company ?? undefined,
        cargo: (data as { position?: string } | null)?.position ?? undefined,
        phone: (data as { phone?: string } | null)?.phone ?? undefined,
      };
    }
  } catch (_) {
    // soft-fail
  }
  return {};
}

Deno.serve(withRequestId('sequence-runner', async (req, _ctx) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  const supabase = createClient(
    Deno.env.get("SUPABASE_URL")!,
    Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!,
  );

  const startedAt = Date.now();
  let processed = 0;
  let succeeded = 0;
  let failed = 0;
  const errors: string[] = [];

  try {
    const { data: due, error: dueErr } = await supabase
      .from("sequence_enrollments")
      .select("id, sequence_id, contact_id, contact_type, current_step, status, auto_paused_at, sequences!inner(send_time_optimization, owner_id)")
      .eq("status", "active")
      .is("auto_paused_at", null)
      .lte("next_action_at", new Date().toISOString())
      .limit(50);

    if (dueErr) throw dueErr;

    type DueRow = Enrollment & { sequences?: { send_time_optimization?: boolean; owner_id?: string } };
    const dueRows = (due ?? []) as DueRow[];

    // ── Pre-fetch all required data in parallel before the loop ──────────────
    const allEnrIds = dueRows.map((r) => r.id);
    const uniqueSeqIds = [...new Set(dueRows.map((r) => r.sequence_id))];
    const uniqueOwnerIds = [...new Set(dueRows.map((r) => r.sequences?.owner_id).filter((x): x is string => !!x))];
    const clientIds = dueRows.filter((r) => r.contact_type === "client").map((r) => r.contact_id);
    const leadIds = dueRows.filter((r) => r.contact_type === "lead").map((r) => r.contact_id);

    const [stepsRes, assignmentsRes, clientsRes, leadsRes, salespeopleRes] = await Promise.all([
      supabase.from("sequence_steps")
        .select("id, sequence_id, step_order, channel, delay_days, delay_hours, subject, body, whatsapp_template_id")
        .in("sequence_id", uniqueSeqIds)
        .order("step_order", { ascending: true }),
      allEnrIds.length > 0
        ? supabase.from("sequence_step_assignments")
            .select("enrollment_id, step_id, variant_id, variant_label")
            .in("enrollment_id", allEnrIds)
        : Promise.resolve({ data: [] as Array<{ enrollment_id: string; step_id: string; variant_id: string; variant_label: string | null }>, error: null }),
      clientIds.length > 0
        ? supabase.from("clients").select("id, name, company, phone").in("id", clientIds)
        : Promise.resolve({ data: [] as Array<{ id: string; name?: string; company?: string; phone?: string }>, error: null }),
      leadIds.length > 0
        ? supabase.from("leads").select("id, name, company, position, phone").in("id", leadIds)
        : Promise.resolve({ data: [] as Array<{ id: string; name?: string; company?: string; position?: string; phone?: string }>, error: null }),
      uniqueOwnerIds.length > 0
        ? supabase.from("salespeople").select("id, user_id").in("user_id", uniqueOwnerIds)
        : Promise.resolve({ data: [] as Array<{ id: string; user_id: string }>, error: null }),
    ]);

    // Build lookup maps
    const stepsBySeqId = new Map<string, Step[]>();
    for (const s of stepsRes.data ?? []) {
      const bucket = stepsBySeqId.get(s.sequence_id) ?? [];
      bucket.push(s as Step);
      stepsBySeqId.set(s.sequence_id, bucket);
    }

    const assignmentByKey = new Map<string, { variant_id: string; variant_label: string | null }>();
    for (const a of assignmentsRes.data ?? []) {
      assignmentByKey.set(`${a.enrollment_id}:${a.step_id}`, { variant_id: a.variant_id, variant_label: a.variant_label });
    }

    // Pre-fetch all variant content for known variant_ids (was N queries inside loop)
    const knownVariantIds = [...new Set((assignmentsRes.data ?? []).map((a) => a.variant_id).filter(Boolean))];
    const variantById = new Map<string, { subject?: string | null; body?: string | null }>();
    if (knownVariantIds.length > 0) {
      const { data: variants } = await supabase.from("sequence_step_variants").select("id, subject, body").in("id", knownVariantIds);
      for (const v of variants ?? []) variantById.set(v.id, { subject: v.subject, body: v.body });
    }

    const contactCtxById = new Map<string, { nome?: string; empresa?: string; cargo?: string; phone?: string }>();
    for (const c of clientsRes.data ?? []) contactCtxById.set(c.id, { nome: c.name, empresa: c.company, phone: c.phone });
    for (const l of leadsRes.data ?? []) contactCtxById.set(l.id, { nome: l.name, empresa: l.company, cargo: l.position, phone: l.phone });

    const spIdByUserId = new Map<string, string>();
    for (const sp of salespeopleRes.data ?? []) spIdByUserId.set(sp.user_id, sp.id);
    // ────────────────────────────────────────────────────────────────────────

    for (const row of dueRows) {
      const enr: Enrollment = {
        ...row,
        send_time_optimization: row.sequences?.send_time_optimization ?? true,
        owner_id: row.sequences?.owner_id,
      };
      processed++;
      try {
        // Use pre-fetched steps — no DB call
        const stepList = stepsBySeqId.get(enr.sequence_id) ?? [];

        const nextStep = stepList[enr.current_step];

        if (!nextStep) {
          await supabase
            .from("sequence_enrollments")
            .update({
              status: "completed",
              completed_at: new Date().toISOString(),
              next_action_at: null,
            })
            .eq("id", enr.id);
          succeeded++;
          continue;
        }

        // STO defer for email/linkedin only
        const stoChannels = new Set(["email", "linkedin"]);
        if (enr.send_time_optimization && stoChannels.has(nextStep.channel)) {
          try {
            const earliest = new Date(Date.now() + 5 * 60 * 1000).toISOString();
            const { data: optimal } = await supabase.rpc("compute_optimal_send_time", {
              _contact_id: enr.contact_id,
              _contact_type: enr.contact_type,
              _earliest: earliest,
            });
            if (optimal) {
              const optimalDate = new Date(optimal as string);
              const maxDefer = Date.now() + 24 * 3600 * 1000;
              if (optimalDate.getTime() > Date.now() + 5 * 60 * 1000 && optimalDate.getTime() <= maxDefer) {
                await supabase
                  .from("sequence_enrollments")
                  .update({
                    next_action_at: optimalDate.toISOString(),
                    optimized_for_at: optimalDate.toISOString(),
                  })
                  .eq("id", enr.id);
                succeeded++;
                continue;
              }
            }
          } catch (_) { /* soft-fail */ }
        }

        // A/B variant — sticky per (enrollment, step); use pre-fetched maps
        let variantId: string | null = null;
        let variantLabel: string | null = null;
        let useSubject = nextStep.subject;
        let useBody = nextStep.body;
        try {
          const existing = assignmentByKey.get(`${enr.id}:${nextStep.id}`);
          if (existing?.variant_id) {
            variantId = existing.variant_id;
            variantLabel = existing.variant_label ?? null;
            // Use pre-fetched variant content (was 1 DB query per enrolled step)
            const vv = variantById.get(variantId);
            if (vv) { useSubject = vv.subject ?? useSubject; useBody = vv.body ?? useBody; }
          } else {
            const { data: picked } = await supabase.rpc("pick_step_variant", { _step_id: nextStep.id });
            const pick = Array.isArray(picked) ? picked[0] : picked;
            if (pick?.variant_id) {
              variantId = pick.variant_id;
              variantLabel = pick.label;
              useSubject = pick.subject;
              useBody = pick.body;
              await supabase.from("sequence_step_assignments").insert({
                enrollment_id: enr.id,
                step_id: nextStep.id,
                variant_id: variantId,
                variant_label: variantLabel,
              });
            }
          }
        } catch (_) { /* soft-fail */ }

        // Use pre-fetched contact context — no DB call
        const ctx = contactCtxById.get(enr.contact_id) ?? {};
        const resolvedSubject = resolveTemplateVariables(useSubject, ctx);
        const resolvedBody = resolveTemplateVariables(useBody, ctx);

        // Multichannel native send for whatsapp/sms; task creation for linkedin/call/task
        const messaging = new Set(["whatsapp", "sms"]);
        const taskChannels = new Set(["linkedin", "call", "task"]);
        let executionStatus: "sent" | "failed" | "skipped" = "sent";
        const engagement: Record<string, unknown> = {
          auto: true,
          dispatched_at: new Date().toISOString(),
          resolved_subject: resolvedSubject,
          resolved_body: resolvedBody,
          variant_label: variantLabel,
        };

        if (messaging.has(nextStep.channel) && enr.owner_id && ctx.phone) {
          try {
            const { data: sendResult } = await supabase.functions.invoke(
              "send-multichannel-message",
              {
                body: {
                  ownerId: enr.owner_id,
                  channel: nextStep.channel,
                  to: ctx.phone,
                  body: resolvedBody ?? "",
                  templateId: nextStep.whatsapp_template_id ?? undefined,
                  enrollmentId: enr.id,
                  stepId: nextStep.id,
                },
              },
            );
            const r = sendResult as { ok?: boolean; error?: string; skipped?: boolean } | null;
            if (r?.skipped || r?.error === "no_credentials") {
              executionStatus = "skipped";
              engagement.skipped_no_channel = true;
            } else if (!r?.ok) {
              executionStatus = "failed";
              engagement.send_error = r?.error ?? "unknown";
            }
          } catch (e) {
            executionStatus = "failed";
            engagement.send_error = e instanceof Error ? e.message : String(e);
          }
        } else if (messaging.has(nextStep.channel)) {
          executionStatus = "skipped";
          engagement.skipped_no_channel = true;
          engagement.reason = !ctx.phone ? "no_phone" : "no_owner";
        } else if (taskChannels.has(nextStep.channel) && enr.owner_id) {
          try {
            // Use pre-fetched salesperson id — no DB call
            const spId = spIdByUserId.get(enr.owner_id);
            if (spId) {
              const titleMap: Record<string, string> = {
                linkedin: `LinkedIn: ${ctx.nome ?? "contato"}`,
                call: `Ligar para ${ctx.nome ?? "contato"}`,
                task: `Sequência: ${resolvedSubject ?? ctx.nome ?? "ação"}`,
              };
              await supabase.from("agenda_events").insert({
                salesperson_id: spId,
                title: titleMap[nextStep.channel] ?? "Sequência",
                description: resolvedBody ?? null,
                event_type: nextStep.channel === "call" ? "call" : "task",
                scheduled_at: new Date().toISOString(),
                priority: "medium",
                status: "pending",
              });
              engagement.task_created = true;
            } else {
              executionStatus = "skipped";
              engagement.reason = "no_salesperson";
            }
          } catch (e) {
            executionStatus = "failed";
            engagement.send_error = e instanceof Error ? e.message : String(e);
          }
        }

        await supabase.from("sequence_step_executions").insert({
          enrollment_id: enr.id,
          step_id: nextStep.id,
          status: executionStatus,
          channel: nextStep.channel,
          variant_id: variantId,
          engagement,
        });

        const upcomingIdx = enr.current_step + 1;
        const upcoming = stepList[upcomingIdx];
        let nextActionAt: string | null = null;
        let newStatus = enr.status;
        let completedAt: string | null = null;

        if (upcoming) {
          const delayMs = (upcoming.delay_days * 24 + upcoming.delay_hours) * 3600 * 1000;
          nextActionAt = new Date(Date.now() + delayMs).toISOString();
        } else {
          newStatus = "completed";
          completedAt = new Date().toISOString();
        }

        await supabase
          .from("sequence_enrollments")
          .update({
            current_step: upcomingIdx,
            last_executed_at: new Date().toISOString(),
            next_action_at: nextActionAt,
            status: newStatus,
            completed_at: completedAt,
            optimized_for_at: null,
          })
          .eq("id", enr.id);

        succeeded++;
      } catch (e) {
        failed++;
        const msg = e instanceof Error ? e.message : String(e);
        errors.push(`enrollment ${enr.id}: ${msg}`);
      }
    }

    return new Response(
      JSON.stringify({
        ok: true,
        processed,
        succeeded,
        failed,
        duration_ms: Date.now() - startedAt,
        errors: errors.slice(0, 10),
      }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } },
    );
  } catch (error) {
    console.error('sequence-runner error:', error);
    const msg = error instanceof Error ? error.message : String(error);
    return new Response(
      JSON.stringify({ ok: false, error: msg }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } },
    );
  }
}));
