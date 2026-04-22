import { createClient } from "npm:@supabase/supabase-js@2.49.4";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

const SUPABASE_URL = Deno.env.get("SUPABASE_URL")!;
const SUPABASE_ANON_KEY = Deno.env.get("SUPABASE_ANON_KEY")!;
const SERVICE_ROLE = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");

interface Body {
  prompt: string;
  tone?: string;
  language?: string;
  sale_ids: string[];
}

const TONE_HINT: Record<string, string> = {
  consultivo: "consultivo, orientado a valor, posicionando-se como parceiro estratégico",
  direto: "direto, objetivo, indo ao ponto em poucas linhas",
  casual: "casual, próximo, com linguagem coloquial e leve",
  formal: "formal e respeitoso, mantendo polidez corporativa",
};

async function loadContext(admin: any, saleId: string) {
  const { data: sale } = await admin
    .from("sales")
    .select("id, deal_name, value, stage, source, client_id, salesperson_id, score")
    .eq("id", saleId)
    .maybeSingle();
  if (!sale) return null;

  const [{ data: client }, { data: activities }] = await Promise.all([
    sale.client_id
      ? admin.from("clients").select("id, name, email, phone, company_name, segment, notes").eq("id", sale.client_id).maybeSingle()
      : Promise.resolve({ data: null }),
    admin
      .from("activities")
      .select("activity_type, outcome, notes, created_at")
      .eq("sale_id", saleId)
      .order("created_at", { ascending: false })
      .limit(3),
  ]);

  return { sale, client, activities: activities ?? [] };
}

async function generateOne(ctx: any, prompt: string, tone: string, language: string) {
  const toneHint = TONE_HINT[tone] ?? TONE_HINT.consultivo;
  const sys = `Você é um copywriter B2B de elite. Gere um e-mail individual e personalizado em ${language}, com tom ${toneHint}. NUNCA use placeholders genéricos como {{nome}} — sempre escreva o nome real do destinatário. Sempre retorne JSON válido.`;
  const userPrompt = `Briefing do remetente:\n${prompt}\n\nContexto do destinatário:\n${JSON.stringify(ctx, null, 2)}\n\nTarefa: gere um e-mail único, com gancho específico baseado no contexto acima. Forneça também uma frase explicando qual gancho de personalização foi usado.`;

  const resp = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${LOVABLE_API_KEY}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      model: "google/gemini-2.5-flash",
      messages: [
        { role: "system", content: sys },
        { role: "user", content: userPrompt },
      ],
      tools: [
        {
          type: "function",
          function: {
            name: "compose_email",
            description: "Retorna um e-mail personalizado",
            parameters: {
              type: "object",
              properties: {
                subject: { type: "string" },
                body: { type: "string" },
                personalization_notes: { type: "string", description: "1 frase explicando o gancho usado" },
              },
              required: ["subject", "body", "personalization_notes"],
              additionalProperties: false,
            },
          },
        },
      ],
      tool_choice: { type: "function", function: { name: "compose_email" } },
    }),
  });

  if (resp.status === 429) throw new Error("RATE_LIMIT");
  if (resp.status === 402) throw new Error("PAYMENT_REQUIRED");
  if (!resp.ok) throw new Error(`AI gateway ${resp.status}`);

  const json = await resp.json();
  const call = json.choices?.[0]?.message?.tool_calls?.[0];
  if (!call) throw new Error("NO_TOOL_CALL");
  const args = JSON.parse(call.function.arguments);
  return {
    subject: String(args.subject ?? "").slice(0, 200),
    body: String(args.body ?? "").slice(0, 4000),
    personalization_notes: String(args.personalization_notes ?? "").slice(0, 500),
  };
}

function fallback(ctx: any, prompt: string) {
  const name = ctx?.client?.name ?? "olá";
  const company = ctx?.client?.company_name ? ` da ${ctx.client.company_name}` : "";
  return {
    subject: `Conversa rápida sobre ${ctx?.sale?.deal_name ?? "uma oportunidade"}`,
    body: `Olá ${name}${company},\n\n${prompt}\n\nFaz sentido conversarmos esta semana?\n\nAbraço.`,
    personalization_notes: "Fallback determinístico (sem IA).",
  };
}

async function processInBatches<T, R>(items: T[], size: number, fn: (it: T) => Promise<R>): Promise<R[]> {
  const out: R[] = [];
  for (let i = 0; i < items.length; i += size) {
    const slice = items.slice(i, i + size);
    const res = await Promise.all(slice.map(fn));
    out.push(...res);
  }
  return out;
}

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

  try {
    if (!LOVABLE_API_KEY) throw new Error("LOVABLE_API_KEY missing");

    const authHeader = req.headers.get("Authorization") ?? "";
    const userClient = createClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
      global: { headers: { Authorization: authHeader } },
    });
    const { data: userData } = await userClient.auth.getUser();
    const user = userData?.user;
    if (!user) {
      return new Response(JSON.stringify({ error: "unauthorized" }), {
        status: 401,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const body = (await req.json()) as Body;
    if (!body?.prompt || !Array.isArray(body.sale_ids) || body.sale_ids.length === 0) {
      return new Response(JSON.stringify({ error: "prompt and sale_ids required" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }
    const saleIds = body.sale_ids.slice(0, 50);
    const tone = body.tone ?? "consultivo";
    const language = body.language ?? "pt-BR";

    const admin = createClient(SUPABASE_URL, SERVICE_ROLE);

    const { data: job, error: jobErr } = await admin
      .from("email_bulk_jobs")
      .insert({
        owner_id: user.id,
        prompt: body.prompt,
        tone,
        language,
        target_count: saleIds.length,
        status: "generating",
      })
      .select("id")
      .single();
    if (jobErr || !job) throw jobErr ?? new Error("could not create job");

    // generate
    const generations = await processInBatches(saleIds, 5, async (saleId) => {
      const ctx = await loadContext(admin, saleId);
      if (!ctx) {
        return { sale_id: saleId, error: "lead_not_found", draft: null as any };
      }
      try {
        const draft = await generateOne(ctx, body.prompt, tone, language);
        return { sale_id: saleId, draft, ctx, error: null };
      } catch (e) {
        const msg = (e as Error).message;
        if (msg === "RATE_LIMIT" || msg === "PAYMENT_REQUIRED") {
          // fallback determinístico
          return { sale_id: saleId, draft: fallback(ctx, body.prompt), ctx, error: msg };
        }
        return { sale_id: saleId, draft: fallback(ctx, body.prompt), ctx, error: msg };
      }
    });

    const rows = generations
      .filter((g) => g.draft)
      .map((g) => ({
        job_id: job.id,
        sale_id: g.sale_id,
        client_id: g.ctx?.client?.id ?? null,
        recipient_email: g.ctx?.client?.email ?? null,
        recipient_name: g.ctx?.client?.name ?? null,
        subject: g.draft!.subject,
        body: g.draft!.body,
        personalization_notes: g.draft!.personalization_notes,
        error: g.error && g.error !== "RATE_LIMIT" && g.error !== "PAYMENT_REQUIRED" ? g.error : null,
      }));

    if (rows.length) {
      await admin.from("email_bulk_drafts").insert(rows);
    }

    await admin
      .from("email_bulk_jobs")
      .update({ status: "ready", completed_at: new Date().toISOString() })
      .eq("id", job.id);

    return new Response(JSON.stringify({ job_id: job.id, generated: rows.length }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (e) {
    console.error("email-composer-bulk error:", e);
    return new Response(JSON.stringify({ error: (e as Error).message }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
