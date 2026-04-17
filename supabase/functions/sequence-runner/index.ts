import { createClient } from "https://esm.sh/@supabase/supabase-js@2.57.4";
import { corsHeaders } from "../_shared/cors.ts";

interface Enrollment {
  id: string;
  sequence_id: string;
  contact_id: string;
  contact_type: string;
  current_step: number;
  status: string;
  send_time_optimization?: boolean;
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
): Promise<{ nome?: string; empresa?: string; cargo?: string; ultima_interacao?: string }> {
  try {
    if (contactType === "client") {
      const { data } = await supabase
        .from("clients")
        .select("name, company")
        .eq("id", contactId)
        .maybeSingle();
      return { nome: data?.name ?? undefined, empresa: data?.company ?? undefined };
    }
    if (contactType === "lead") {
      const { data } = await supabase
        .from("leads")
        .select("name, company, position")
        .eq("id", contactId)
        .maybeSingle();
      return {
        nome: (data as { name?: string } | null)?.name ?? undefined,
        empresa: (data as { company?: string } | null)?.company ?? undefined,
        cargo: (data as { position?: string } | null)?.position ?? undefined,
      };
    }
  } catch (_) {
    // soft-fail: no context = template stays raw
  }
  return {};
}

Deno.serve(async (req) => {
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
      .select("id, sequence_id, contact_id, contact_type, current_step, status, sequences!inner(send_time_optimization)")
      .eq("status", "active")
      .lte("next_action_at", new Date().toISOString())
      .limit(50);

    if (dueErr) throw dueErr;

    type DueRow = Enrollment & { sequences?: { send_time_optimization?: boolean } };
    for (const row of (due ?? []) as DueRow[]) {
      const enr: Enrollment = {
        ...row,
        send_time_optimization: row.sequences?.send_time_optimization ?? true,
      };
      processed++;
      try {
        const { data: steps, error: stepsErr } = await supabase
          .from("sequence_steps")
          .select("*")
          .eq("sequence_id", enr.sequence_id)
          .order("step_order", { ascending: true });

        if (stepsErr) throw stepsErr;
        const stepList = (steps ?? []) as Step[];

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

        // Send Time Optimization: defer to optimal window for email/linkedin
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
          } catch (_) {
            // soft-fail: STO not critical, fall through to immediate send
          }
        }

        // Pick A/B variant if any
        let variantId: string | null = null;
        let variantLabel: string | null = null;
        let useSubject = nextStep.subject;
        let useBody = nextStep.body;
        try {
          const { data: picked } = await supabase.rpc("pick_step_variant", {
            _step_id: nextStep.id,
          });
          const pick = Array.isArray(picked) ? picked[0] : picked;
          if (pick?.variant_id) {
            variantId = pick.variant_id;
            variantLabel = pick.label;
            useSubject = pick.subject;
            useBody = pick.body;
          }
        } catch (_) {
          // soft-fail: no variant = use base
        }

        // Resolve template variables with contact context
        const ctx = await fetchContactContext(supabase, enr.contact_id, enr.contact_type);
        const resolvedSubject = resolveTemplateVariables(useSubject, ctx);
        const resolvedBody = resolveTemplateVariables(useBody, ctx);

        // Record execution (channel-agnostic stub — real send wiring per channel happens in 2/7+)
        await supabase.from("sequence_step_executions").insert({
          enrollment_id: enr.id,
          step_id: nextStep.id,
          status: "sent",
          channel: nextStep.channel,
          variant_id: variantId,
          engagement: {
            auto: true,
            dispatched_at: new Date().toISOString(),
            resolved_subject: resolvedSubject,
            resolved_body: resolvedBody,
            variant_label: variantLabel,
          },
        });

        // Compute next step delay
        const upcomingIdx = enr.current_step + 1;
        const upcoming = stepList[upcomingIdx];
        let nextActionAt: string | null = null;
        let newStatus = enr.status;
        let completedAt: string | null = null;

        if (upcoming) {
          const delayMs =
            (upcoming.delay_days * 24 + upcoming.delay_hours) * 3600 * 1000;
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
        await supabase.from("sequence_step_executions").insert({
          enrollment_id: enr.id,
          step_id: "00000000-0000-0000-0000-000000000000",
          status: "failed",
          error_message: msg,
        }).select().maybeSingle().then(() => undefined).catch(() => undefined);
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
    const msg = error instanceof Error ? error.message : String(error);
    return new Response(
      JSON.stringify({ ok: false, error: msg }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } },
    );
  }
});
