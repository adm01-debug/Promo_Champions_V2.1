import { corsHeaders } from "../_shared/cors.ts";
import { createClient } from "npm:@supabase/supabase-js@2.49.4";

interface StepTemplate {
  title: string;
  description: string;
  days_offset: number;
}

const TEMPLATES: Record<string, StepTemplate[]> = {
  standard: [
    { title: "Welcome Call (Kick-off)", description: "Apresentação da equipe, expectativas e próximos passos", days_offset: 1 },
    { title: "Discovery & Goals Setup", description: "Mapear objetivos, KPIs e critérios de sucesso", days_offset: 3 },
    { title: "Configuração Inicial", description: "Setup da conta, integrações e usuários", days_offset: 7 },
    { title: "Treinamento da Equipe", description: "Sessão de treinamento dos usuários-chave", days_offset: 14 },
    { title: "Go-Live", description: "Ativação completa em produção", days_offset: 21 },
    { title: "Check-in 30 dias", description: "Revisão de adoção e ajustes", days_offset: 30 },
  ],
  enterprise: [
    { title: "Executive Kick-off", description: "Alinhamento com stakeholders C-level", days_offset: 2 },
    { title: "Technical Discovery", description: "Levantamento técnico e arquitetura", days_offset: 5 },
    { title: "Integration Setup", description: "Conexão com sistemas internos (SSO, APIs)", days_offset: 10 },
    { title: "Pilot Group Training", description: "Treinamento do grupo piloto", days_offset: 17 },
    { title: "Pilot Launch", description: "Lançamento do piloto com métricas", days_offset: 25 },
    { title: "Full Rollout", description: "Expansão para toda a empresa", days_offset: 45 },
    { title: "QBR Inicial", description: "Primeiro Quarterly Business Review", days_offset: 75 },
  ],
  selfserve: [
    { title: "Welcome Email", description: "Email de boas-vindas com guia rápido", days_offset: 0 },
    { title: "First Value Milestone", description: "Cliente realiza primeira ação de valor", days_offset: 3 },
    { title: "Adoption Check", description: "Verificar adoção e oferecer suporte", days_offset: 14 },
    { title: "Feedback Survey", description: "Coletar feedback inicial", days_offset: 30 },
  ],
};

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

  try {
    const supabase = createClient(Deno.env.get("SUPABASE_URL")!, Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!);
    const body = await req.json().catch(() => ({}));
    const { account_id, template_key = "standard", owner_salesperson_id, action = "launch" } = body;

    if (action === "auto_launch_new_accounts") {
      // Identifica accounts novos (criados nos últimos 7 dias) sem journey
      const { data: accs } = await supabase
        .from("accounts")
        .select("id, tier, owner_id, created_at")
        .gte("created_at", new Date(Date.now() - 7 * 86400000).toISOString());

      let launched = 0;
      for (const a of accs ?? []) {
        const { data: existing } = await supabase
          .from("onboarding_journeys")
          .select("id").eq("account_id", a.id).limit(1);
        if (existing && existing.length > 0) continue;

        const tpl = a.tier === "enterprise" || a.tier === "strategic" ? "enterprise" : "standard";
        const result = await launchJourney(supabase, a.id, tpl, a.owner_id);
        if (result.ok) launched++;
      }
      return new Response(JSON.stringify({ ok: true, accounts_evaluated: accs?.length ?? 0, journeys_launched: launched }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    if (!account_id) {
      return new Response(JSON.stringify({ error: "account_id is required" }), {
        status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const result = await launchJourney(supabase, account_id, template_key, owner_salesperson_id);
    return new Response(JSON.stringify(result), {
      status: result.ok ? 200 : 400,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (err) {
    return new Response(JSON.stringify({ error: err instanceof Error ? err.message : "unknown" }), {
      status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});

async function launchJourney(supabase: ReturnType<typeof createClient>, accountId: string, templateKey: string, ownerId?: string) {
  const steps = TEMPLATES[templateKey] ?? TEMPLATES.standard;

  // Verifica duplicidade
  const { data: existing } = await supabase
    .from("onboarding_journeys")
    .select("id").eq("account_id", accountId).limit(1);
  if (existing && existing.length > 0) {
    return { ok: false, error: "Journey already exists for this account", existing_id: existing[0].id };
  }

  const { data: journey, error: jErr } = await supabase
    .from("onboarding_journeys")
    .insert({
      account_id: accountId,
      template_key: templateKey,
      status: "in_progress",
      total_steps: steps.length,
      current_step: 0,
      owner_salesperson_id: ownerId ?? null,
      started_at: new Date().toISOString(),
    })
    .select("id").single();

  if (jErr || !journey) return { ok: false, error: jErr?.message ?? "Failed to create journey" };

  const today = new Date();
  const stepRows = steps.map((s, idx) => ({
    journey_id: journey.id,
    title: s.title,
    description: s.description,
    order_index: idx,
    status: "pending",
    due_date: new Date(today.getTime() + s.days_offset * 86400000).toISOString().split("T")[0],
  }));

  const { error: sErr } = await supabase.from("onboarding_steps").insert(stepRows);
  if (sErr) return { ok: false, error: sErr.message, journey_id: journey.id };

  return { ok: true, journey_id: journey.id, template: templateKey, steps_created: steps.length };
}
