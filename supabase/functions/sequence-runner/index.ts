import {
  createClient,
  type SupabaseClient,
} from "npm:@supabase/supabase-js@2.49.4";
import { getCorsHeaders } from "../_shared/cors.ts";
import { withRequestId } from "../_shared/request-id.ts";
import { chunkedIn } from "../_shared/chunked-in.ts";
import { getUserClient, UnauthorizedError } from "../_shared/auth-client.ts";
import { isInternalServiceRequest } from "../_shared/internal-service-auth.ts";

type ServiceClient = SupabaseClient;

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

interface ContactContext {
  nome?: string;
  empresa?: string;
  cargo?: string;
  phone?: string;
  email?: string;
}

function contactContextKey(contactType: string, contactId: string): string {
  return `${contactType}:${contactId}`;
}

function resolveTemplateVariables(
  template: string | null,
  ctx: ContactContext & { ultima_interacao?: string },
): string | null {
  if (!template) return template;
  return template.replace(
    /\{\{\s*([a-zA-Z0-9_.]+)\s*\}\}/g,
    (_, key: string) => {
      const k = key.trim().toLowerCase();
      if (k === "nome" || k === "cliente.nome") return ctx.nome ?? `{{${key}}}`;
      if (k === "empresa" || k === "cliente.empresa") {
        return ctx.empresa ??
          `{{${key}}}`;
      }
      if (k === "cargo" || k === "cliente.cargo") {
        return ctx.cargo ?? `{{${key}}}`;
      }
      if (k === "ultima_interacao") return ctx.ultima_interacao ?? `{{${key}}}`;
      if (k === "data.hoje") return new Date().toLocaleDateString("pt-BR");
      return `{{${key}}}`;
    },
  );
}

async function fetchContactContext(
  supabase: ServiceClient,
  contactId: string,
  contactType: string,
): Promise<ContactContext> {
  try {
    if (contactType === "client") {
      const { data } = await supabase
        .from("clients")
        .select("name, company, phone, email")
        .eq("id", contactId)
        .maybeSingle();
      return {
        nome: (data as { name?: string } | null)?.name ?? undefined,
        empresa: (data as { company?: string } | null)?.company ?? undefined,
        phone: (data as { phone?: string } | null)?.phone ?? undefined,
        email: (data as { email?: string } | null)?.email ?? undefined,
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

// Hoisted channel sets — immutable, no reason to rebuild per-iteration
const MESSAGING_CHANNELS = new Set(["whatsapp", "sms"]);
const TASK_CHANNELS = new Set(["linkedin", "call", "task"]);
const STO_CHANNELS = new Set(["email", "linkedin"]);
const CLAIM_LEASE_MS = 5 * 60 * 1000;
const DELIVERY_RETRY_MS = 15 * 60 * 1000;
const SKIPPED_RETRY_MS = 24 * 60 * 60 * 1000;
const DELIVERY_CONFIRMATION = { sequence_runner_delivery_confirmed: true };

/**
 * Reserva otimista: somente quem trocar o next_action_at vencido pela lease
 * pode executar o passo. Isso impede que dois runners ativos processem a
 * mesma inscrição em paralelo sem introduzir status/DDL novos.
 */
async function claimDueEnrollment(
  supabase: ServiceClient,
  enrollment: Enrollment,
): Promise<string | null> {
  const now = new Date();
  const leaseUntil = new Date(now.getTime() + CLAIM_LEASE_MS).toISOString();
  const { data, error } = await supabase
    .from("sequence_enrollments")
    .update({ next_action_at: leaseUntil })
    .eq("id", enrollment.id)
    .eq("status", "active")
    .is("auto_paused_at", null)
    .eq("current_step", enrollment.current_step)
    .lte("next_action_at", now.toISOString())
    .select("id")
    .maybeSingle();

  if (error) throw error;
  return data ? leaseUntil : null;
}

/** Atualiza apenas a inscrição ainda detida pela lease deste runner. */
async function updateClaimedEnrollment(
  supabase: ServiceClient,
  enrollment: Enrollment,
  leaseUntil: string,
  updates: Record<string, unknown>,
): Promise<boolean> {
  const { data, error } = await supabase
    .from("sequence_enrollments")
    .update(updates)
    .eq("id", enrollment.id)
    .eq("status", "active")
    .is("auto_paused_at", null)
    .eq("current_step", enrollment.current_step)
    .eq("next_action_at", leaseUntil)
    .select("id")
    .maybeSingle();

  if (error) throw error;
  return Boolean(data);
}

/**
 * Se a entrega confirmada foi gravada e a atualização final caiu, a próxima
 * lease pode avançar o estado sem reenviar. O marcador evita confiar nas
 * execuções históricas produzidas antes deste endurecimento.
 */
async function hasConfirmedExecution(
  supabase: ServiceClient,
  enrollmentId: string,
  stepId: string,
): Promise<boolean> {
  const { data, error } = await supabase
    .from("sequence_step_executions")
    .select("id")
    .eq("enrollment_id", enrollmentId)
    .eq("step_id", stepId)
    .contains("engagement", DELIVERY_CONFIRMATION)
    .limit(1)
    .maybeSingle();

  if (error) throw error;
  return Boolean(data);
}

function advanceEnrollmentUpdates(
  enrollment: Enrollment,
  stepList: Step[],
): Record<string, unknown> {
  const now = new Date();
  const upcomingIdx = enrollment.current_step + 1;
  const upcoming = stepList[upcomingIdx];
  return {
    current_step: upcomingIdx,
    last_executed_at: now.toISOString(),
    next_action_at: upcoming
      ? new Date(
        now.getTime() +
          (upcoming.delay_days * 24 + upcoming.delay_hours) * 3600 * 1000,
      ).toISOString()
      : null,
    status: upcoming ? enrollment.status : "completed",
    completed_at: upcoming ? null : now.toISOString(),
    optimized_for_at: null,
  };
}

Deno.serve(withRequestId("sequence-runner", async (req, ctx) => {
  const responseCorsHeaders = getCorsHeaders(req);
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: responseCorsHeaders });
  }
  if (req.method !== "POST") {
    return new Response(
      JSON.stringify({ ok: false, error: "method_not_allowed" }),
      {
        status: 405,
        headers: { ...responseCorsHeaders, "Content-Type": "application/json" },
      },
    );
  }

  const supabaseUrl = Deno.env.get("SUPABASE_URL");
  const serviceRoleKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");
  if (!supabaseUrl || !serviceRoleKey) {
    ctx.log("error", "environment_not_configured");
    return new Response(
      JSON.stringify({ ok: false, error: "service_not_configured" }),
      {
        status: 503,
        headers: { ...responseCorsHeaders, "Content-Type": "application/json" },
      },
    );
  }

  let callerUserId: string | null = null;
  if (!isInternalServiceRequest(req)) {
    try {
      callerUserId = (await getUserClient(req)).userId;
    } catch (error) {
      if (error instanceof UnauthorizedError) {
        return new Response(
          JSON.stringify({ ok: false, error: "unauthorized" }),
          {
            status: 401,
            headers: {
              ...responseCorsHeaders,
              "Content-Type": "application/json",
            },
          },
        );
      }
      ctx.log("error", "authorization_failed", {
        error: error instanceof Error ? error.message : String(error),
      });
      return new Response(
        JSON.stringify({ ok: false, error: "authorization_unavailable" }),
        {
          status: 503,
          headers: {
            ...responseCorsHeaders,
            "Content-Type": "application/json",
          },
        },
      );
    }
  }

  const supabase = createClient(
    supabaseUrl,
    serviceRoleKey,
  );

  const startedAt = Date.now();
  let processed = 0;
  let succeeded = 0;
  let failed = 0;
  let skipped = 0;
  const errors: string[] = [];

  try {
    const dueQuery = supabase
      .from("sequence_enrollments")
      .select(
        "id, sequence_id, contact_id, contact_type, current_step, status, auto_paused_at, sequences!inner(send_time_optimization, owner_id)",
      )
      .eq("status", "active")
      .is("auto_paused_at", null)
      .lte("next_action_at", new Date().toISOString())
      .limit(50);
    if (callerUserId) dueQuery.eq("sequences.owner_id", callerUserId);
    const { data: due, error: dueErr } = await dueQuery;

    if (dueErr) throw dueErr;

    type DueRow = Enrollment & {
      sequences?: { send_time_optimization?: boolean; owner_id?: string };
    };
    const dueRows = (due ?? []) as DueRow[];

    // ── Pre-fetch all required data in parallel before the loop ──────────────
    const allEnrIds = dueRows.map((r) => r.id);
    const uniqueSeqIds = [...new Set(dueRows.map((r) => r.sequence_id))];
    const uniqueOwnerIds = [
      ...new Set(
        dueRows.map((r) => r.sequences?.owner_id).filter((x): x is string =>
          !!x
        ),
      ),
    ];
    const clientIds = dueRows.filter((r) => r.contact_type === "client").map((
      r,
    ) => r.contact_id);
    const leadIds = dueRows.filter((r) => r.contact_type === "lead").map((r) =>
      r.contact_id
    );
    const contactIds = dueRows.filter((r) => r.contact_type === "contact").map((
      r,
    ) => r.contact_id);

    type StepRow = {
      id: string;
      sequence_id: string;
      step_order: number;
      channel: string;
      delay_days: number;
      delay_hours: number;
      subject: string | null;
      body: string | null;
      whatsapp_template_id?: string | null;
    };
    type AssignmentRow = {
      enrollment_id: string;
      step_id: string;
      variant_id: string;
      variant_label: string | null;
    };
    type ClientRow = {
      id: string;
      name?: string;
      company?: string;
      phone?: string;
      email?: string;
    };
    type LeadRow = {
      id: string;
      name?: string;
      company?: string;
      position?: string;
      phone?: string;
    };
    type AccountContactRow = {
      id: string;
      name?: string;
      job_title?: string;
      phone?: string;
      email?: string;
    };
    type SalespersonRow = { id: string; auth_user_id: string | null };

    const [
      stepsData,
      assignmentsData,
      clientsData,
      leadsData,
      accountContactsData,
      salespeopleData,
    ] = await Promise.all([
      chunkedIn<StepRow>(
        uniqueSeqIds,
        (chunk) =>
          supabase.from("sequence_steps")
            .select(
              "id, sequence_id, step_order, channel, delay_days, delay_hours, subject, body, whatsapp_template_id",
            )
            .in("sequence_id", chunk)
            .order("step_order", { ascending: true }),
        { parallel: true, label: "sequence-runner.steps" },
      ),
      chunkedIn<AssignmentRow>(
        allEnrIds,
        (chunk) =>
          supabase.from("sequence_step_assignments")
            .select("enrollment_id, step_id, variant_id, variant_label")
            .in("enrollment_id", chunk),
        { parallel: true, label: "sequence-runner.assignments" },
      ),
      chunkedIn<ClientRow>(
        clientIds,
        (chunk) =>
          supabase.from("clients").select("id, name, company, phone, email").in(
            "id",
            chunk,
          ),
        { parallel: true, label: "sequence-runner.clients" },
      ),
      chunkedIn<LeadRow>(
        leadIds,
        (chunk) =>
          supabase.from("leads").select("id, name, company, position, phone")
            .in("id", chunk),
        { parallel: true, label: "sequence-runner.leads" },
      ),
      chunkedIn<AccountContactRow>(
        contactIds,
        (chunk) =>
          supabase.from("account_contacts").select(
            "id, name, job_title, phone, email",
          ).in("id", chunk),
        { parallel: true, label: "sequence-runner.account-contacts" },
      ),
      chunkedIn<SalespersonRow>(
        uniqueOwnerIds,
        (chunk) =>
          supabase.from("salespeople").select("id, auth_user_id").in(
            "auth_user_id",
            chunk,
          ),
        { parallel: true, label: "sequence-runner.salespeople" },
      ),
    ]);

    // Build lookup maps
    const stepsBySeqId = new Map<string, Step[]>();
    for (const s of stepsData) {
      const bucket = stepsBySeqId.get(s.sequence_id) ?? [];
      bucket.push(s as Step);
      stepsBySeqId.set(s.sequence_id, bucket);
    }

    const assignmentByKey = new Map<
      string,
      { variant_id: string; variant_label: string | null }
    >();
    for (const a of assignmentsData) {
      assignmentByKey.set(`${a.enrollment_id}:${a.step_id}`, {
        variant_id: a.variant_id,
        variant_label: a.variant_label,
      });
    }

    // Pre-fetch all variant content for known variant_ids (was N queries inside loop)
    const knownVariantIds = [
      ...new Set(assignmentsData.map((a) => a.variant_id).filter(Boolean)),
    ];
    const variantById = new Map<
      string,
      { subject?: string | null; body?: string | null }
    >();
    if (knownVariantIds.length > 0) {
      const variants = await chunkedIn<
        { id: string; subject: string | null; body: string | null }
      >(
        knownVariantIds,
        (chunk) =>
          supabase.from("sequence_step_variants").select("id, subject, body")
            .in("id", chunk),
        { parallel: true, label: "sequence-runner.variants" },
      );
      for (const v of variants) {
        variantById.set(v.id, { subject: v.subject, body: v.body });
      }
    }

    const contactCtxByKey = new Map<string, ContactContext>();
    for (const client of clientsData) {
      contactCtxByKey.set(contactContextKey("client", client.id), {
        nome: client.name,
        empresa: client.company,
        phone: client.phone,
        email: client.email,
      });
    }
    for (const lead of leadsData) {
      contactCtxByKey.set(contactContextKey("lead", lead.id), {
        nome: lead.name,
        empresa: lead.company,
        cargo: lead.position,
        phone: lead.phone,
      });
    }
    for (const contact of accountContactsData) {
      contactCtxByKey.set(contactContextKey("contact", contact.id), {
        nome: contact.name,
        cargo: contact.job_title,
        phone: contact.phone,
        email: contact.email,
      });
    }

    const spIdByUserId = new Map<string, string>();
    for (const sp of salespeopleData) {
      if (sp.auth_user_id) spIdByUserId.set(sp.auth_user_id, sp.id);
    }
    // ────────────────────────────────────────────────────────────────────────

    for (const row of dueRows) {
      const enr: Enrollment = {
        ...row,
        send_time_optimization: row.sequences?.send_time_optimization ?? true,
        owner_id: row.sequences?.owner_id,
      };
      let leaseUntil: string | null = null;
      try {
        leaseUntil = await claimDueEnrollment(supabase, enr);
        if (!leaseUntil) continue;
        processed++;

        // Use pre-fetched steps — no DB call
        const stepList = stepsBySeqId.get(enr.sequence_id) ?? [];
        const nextStep = stepList[enr.current_step];

        if (!nextStep) {
          const completed = await updateClaimedEnrollment(
            supabase,
            enr,
            leaseUntil,
            {
              status: "completed",
              completed_at: new Date().toISOString(),
              next_action_at: null,
              optimized_for_at: null,
            },
          );
          if (completed) succeeded++;
          else {ctx.log("warn", "claim_lost_before_completion", {
              enrollment_id: enr.id,
            });}
          continue;
        }

        // Uma confirmação gravada pelo runner endurecido permite recuperar uma
        // queda entre a persistência da execução e o avanço do enrollment sem
        // repetir a entrega no provedor.
        if (await hasConfirmedExecution(supabase, enr.id, nextStep.id)) {
          const advanced = await updateClaimedEnrollment(
            supabase,
            enr,
            leaseUntil,
            advanceEnrollmentUpdates(enr, stepList),
          );
          if (advanced) succeeded++;
          else {ctx.log("warn", "claim_lost_before_recovery", {
              enrollment_id: enr.id,
            });}
          continue;
        }

        const contactCtx = contactCtxByKey.get(
          contactContextKey(enr.contact_type, enr.contact_id),
        ) ?? {};

        // STO defer for email/linkedin only. Não adia e-mail sem destinatário:
        // ele precisa ficar explícito como skipped, nunca como sent implícito.
        if (
          enr.send_time_optimization &&
          STO_CHANNELS.has(nextStep.channel) &&
          (nextStep.channel !== "email" || Boolean(contactCtx.email?.trim()))
        ) {
          try {
            const earliest = new Date(Date.now() + 5 * 60 * 1000).toISOString();
            const { data: optimal } = await supabase.rpc(
              "compute_optimal_send_time",
              {
                _contact_id: enr.contact_id,
                _contact_type: enr.contact_type,
                _earliest: earliest,
              },
            );
            if (optimal) {
              const optimalDate = new Date(optimal as string);
              const maxDefer = Date.now() + 24 * 3600 * 1000;
              if (
                optimalDate.getTime() > Date.now() + 5 * 60 * 1000 &&
                optimalDate.getTime() <= maxDefer
              ) {
                const deferred = await updateClaimedEnrollment(
                  supabase,
                  enr,
                  leaseUntil,
                  {
                    next_action_at: optimalDate.toISOString(),
                    optimized_for_at: optimalDate.toISOString(),
                  },
                );
                if (deferred) succeeded++;
                else {ctx.log("warn", "claim_lost_before_sto_defer", {
                    enrollment_id: enr.id,
                  });}
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
            if (vv) {
              useSubject = vv.subject ?? useSubject;
              useBody = vv.body ?? useBody;
            }
          } else {
            const { data: picked } = await supabase.rpc("pick_step_variant", {
              _step_id: nextStep.id,
            });
            const pick = Array.isArray(picked) ? picked[0] : picked;
            if (pick?.variant_id) {
              variantId = pick.variant_id;
              variantLabel = pick.label;
              useSubject = pick.subject;
              useBody = pick.body;
              // Keep assignment insert immediate to prevent variant-selection races
              await supabase.from("sequence_step_assignments").insert({
                enrollment_id: enr.id,
                step_id: nextStep.id,
                variant_id: variantId,
                variant_label: variantLabel,
              });
            }
          }
        } catch (_) { /* soft-fail */ }

        const resolvedSubject = resolveTemplateVariables(
          useSubject,
          contactCtx,
        );
        const resolvedBody = resolveTemplateVariables(useBody, contactCtx);

        let executionStatus: "sent" | "failed" | "skipped" | "queued" =
          "failed";
        let shouldAdvance = false;
        let outcomeReason: string | null = null;
        const engagement: Record<string, unknown> = {
          auto: true,
          dispatched_at: new Date().toISOString(),
          resolved_subject: resolvedSubject,
          resolved_body: resolvedBody,
          variant_label: variantLabel,
          request_id: ctx.requestId,
        };

        if (nextStep.channel === "email") {
          const email = contactCtx.email?.trim();
          if (!email) {
            executionStatus = "skipped";
            outcomeReason = "missing_email";
          } else if (!resolvedSubject?.trim() || !resolvedBody?.trim()) {
            executionStatus = "skipped";
            outcomeReason = "missing_email_content";
          } else {
            try {
              const { data: sendResult, error: sendError } = await supabase
                .functions.invoke(
                  "send-transactional-email",
                  {
                    body: {
                      to: email,
                      subject: resolvedSubject,
                      text: resolvedBody,
                      purpose: "outreach",
                    },
                    headers: {
                      Authorization: `Bearer ${serviceRoleKey}`,
                      "X-Request-Id": ctx.requestId,
                    },
                  },
                );
              const result = sendResult as {
                ok?: boolean;
                error?: string;
                provider_message_id?: string | null;
              } | null;
              if (!sendError && result?.ok) {
                executionStatus = "sent";
                shouldAdvance = true;
                engagement.provider_message_id = result.provider_message_id ??
                  null;
              } else {
                outcomeReason = sendError?.message ?? result?.error ??
                  "transactional_email_failed";
              }
            } catch (error) {
              outcomeReason = error instanceof Error
                ? error.message
                : String(error);
            }
          }
        } else if (
          MESSAGING_CHANNELS.has(nextStep.channel) && enr.owner_id &&
          contactCtx.phone
        ) {
          try {
            const { data: sendResult, error: sendError } = await supabase
              .functions.invoke(
                "send-multichannel-message",
                {
                  body: {
                    ownerId: enr.owner_id,
                    channel: nextStep.channel,
                    to: contactCtx.phone,
                    body: resolvedBody ?? "",
                    templateId: nextStep.whatsapp_template_id ?? undefined,
                    enrollmentId: enr.id,
                    stepId: nextStep.id,
                  },
                  headers: {
                    Authorization: `Bearer ${serviceRoleKey}`,
                    "X-Request-Id": ctx.requestId,
                  },
                },
              );
            const r = sendResult as {
              ok?: boolean;
              error?: string;
              skipped?: boolean;
              providerMessageId?: string;
            } | null;
            if (r?.skipped || r?.error === "no_credentials") {
              executionStatus = "skipped";
              engagement.skipped_no_channel = true;
              outcomeReason = r.error ?? "no_credentials";
            } else if (!sendError && r?.ok) {
              executionStatus = "sent";
              shouldAdvance = true;
              engagement.provider_message_id = r.providerMessageId ?? null;
            } else {
              outcomeReason = sendError?.message ?? r?.error ??
                "multichannel_send_failed";
            }
          } catch (error) {
            outcomeReason = error instanceof Error
              ? error.message
              : String(error);
          }
        } else if (MESSAGING_CHANNELS.has(nextStep.channel)) {
          executionStatus = "skipped";
          engagement.skipped_no_channel = true;
          outcomeReason = !contactCtx.phone ? "no_phone" : "no_owner";
        } else if (TASK_CHANNELS.has(nextStep.channel) && enr.owner_id) {
          try {
            // Use pre-fetched salesperson id — no DB call
            const spId = spIdByUserId.get(enr.owner_id);
            if (spId) {
              const titleMap: Record<string, string> = {
                linkedin: `LinkedIn: ${contactCtx.nome ?? "contato"}`,
                call: `Ligar para ${contactCtx.nome ?? "contato"}`,
                task: `Sequência: ${
                  resolvedSubject ?? contactCtx.nome ?? "ação"
                }`,
              };
              const { error: agendaError } = await supabase.from(
                "agenda_events",
              ).insert({
                salesperson_id: spId,
                title: titleMap[nextStep.channel] ?? "Sequência",
                description: resolvedBody ?? null,
                event_type: nextStep.channel === "call" ? "call" : "task",
                scheduled_at: new Date().toISOString(),
                priority: "medium",
                status: "pending",
              });
              if (agendaError) {
                outcomeReason = "agenda_enqueue_failed";
                engagement.send_error = agendaError.message;
              } else {
                executionStatus = "queued";
                shouldAdvance = true;
                engagement.task_created = true;
              }
            } else {
              executionStatus = "skipped";
              outcomeReason = "no_salesperson";
            }
          } catch (error) {
            outcomeReason = error instanceof Error
              ? error.message
              : String(error);
          }
        } else if (TASK_CHANNELS.has(nextStep.channel)) {
          executionStatus = "skipped";
          outcomeReason = "no_owner";
        } else {
          outcomeReason = "unsupported_channel";
        }

        if (shouldAdvance) {
          Object.assign(engagement, DELIVERY_CONFIRMATION);
        }
        if (outcomeReason) engagement.reason = outcomeReason;

        const { error: executionError } = await supabase.from(
          "sequence_step_executions",
        ).insert({
          enrollment_id: enr.id,
          step_id: nextStep.id,
          status: executionStatus,
          channel: nextStep.channel,
          variant_id: variantId,
          error_message: executionStatus === "failed" ? outcomeReason : null,
          engagement,
        });
        if (executionError) throw executionError;

        if (shouldAdvance) {
          const advanced = await updateClaimedEnrollment(
            supabase,
            enr,
            leaseUntil,
            advanceEnrollmentUpdates(enr, stepList),
          );
          if (advanced) succeeded++;
          else {ctx.log("warn", "claim_lost_after_execution", {
              enrollment_id: enr.id,
            });}
          continue;
        }

        const retryMs = executionStatus === "skipped"
          ? SKIPPED_RETRY_MS
          : DELIVERY_RETRY_MS;
        const released = await updateClaimedEnrollment(
          supabase,
          enr,
          leaseUntil,
          {
            next_action_at: new Date(Date.now() + retryMs).toISOString(),
            last_executed_at: new Date().toISOString(),
            optimized_for_at: null,
          },
        );
        if (!released) {
          ctx.log("warn", "claim_lost_before_retry", { enrollment_id: enr.id });
        }

        if (executionStatus === "failed") {
          failed++;
          errors.push(
            `enrollment ${enr.id}: ${outcomeReason ?? "delivery_failed"}`,
          );
        } else {
          skipped++;
        }
      } catch (error) {
        if (leaseUntil) {
          try {
            await updateClaimedEnrollment(supabase, enr, leaseUntil, {
              next_action_at: new Date(Date.now() + DELIVERY_RETRY_MS)
                .toISOString(),
              last_executed_at: new Date().toISOString(),
              optimized_for_at: null,
            });
          } catch (releaseError) {
            ctx.log("error", "claim_release_failed", {
              enrollment_id: enr.id,
              error: releaseError instanceof Error
                ? releaseError.message
                : String(releaseError),
            });
          }
        }
        failed++;
        const msg = error instanceof Error ? error.message : String(error);
        errors.push(`enrollment ${enr.id}: ${msg}`);
      }
    }

    return new Response(
      JSON.stringify({
        ok: true,
        processed,
        succeeded,
        failed,
        skipped,
        duration_ms: Date.now() - startedAt,
        errors: errors.slice(0, 10),
      }),
      {
        headers: { ...responseCorsHeaders, "Content-Type": "application/json" },
      },
    );
  } catch (error) {
    console.error("sequence-runner error:", error);
    const msg = error instanceof Error ? error.message : String(error);
    return new Response(
      JSON.stringify({ ok: false, error: msg }),
      {
        status: 500,
        headers: { ...responseCorsHeaders, "Content-Type": "application/json" },
      },
    );
  }
}));
