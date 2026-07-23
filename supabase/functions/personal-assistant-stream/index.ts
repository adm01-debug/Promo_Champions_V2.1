// Personal Assistant Stream — Secretário Executivo + Coach por vendedor.
//
// Modos (body.mode):
//   • 'briefing'         → gera briefing narrativo do dia (streaming SSE).
//   • 'chat'             → conversa livre com histórico (SSE).
//   • 'proactive_nudge'  → nudge curto se houver algo relevante (SSE curto).
//
// O contexto (meta, MTD, deals críticos, tarefas atrasadas, oportunidades de
// coaching) é montado server-side com RLS do próprio vendedor (getUserClient).
// Sem service-role — respeita o mesmo escopo do usuário logado.

import { withRequestId } from "../_shared/request-id.ts";
import { getUserClient, UnauthorizedError } from "../_shared/auth-client.ts";
import { corsHeaders } from "../_shared/cors.ts";
import { fetchWithTimeout } from "../_shared/fetch-with-timeout.ts";
import {
  validateString,
  validateUUID,
  validateArray,
  collectErrors,
  validationErrorResponse,
} from "../_shared/validation.ts";

type Mode = "briefing" | "chat" | "proactive_nudge";

interface HistoryMsg {
  role: "user" | "assistant";
  content: string;
}

interface PersonalContext {
  salespersonName: string;
  role: string;
  goal: number;
  mtdRevenue: number;
  progressPercent: number;
  daysElapsed: number;
  daysInMonth: number;
  paceDaily: number;
  projectedEOM: number;
  criticalDeals: Array<{
    id: string;
    client_name: string;
    product_name: string;
    amount: number;
    status: string;
    days_stagnant: number;
  }>;
  overdueTasks: Array<{ title: string; due_date: string; task_type: string }>;
  todayTasks: Array<{ title: string; due_time: string | null; task_type: string }>;
  coachingTips: Array<{ tip: string; category: string; severity: string }>;
}

async function buildContext(
  client: ReturnType<typeof getUserClient> extends Promise<infer T> ? (T extends { client: infer C } ? C : never) : never,
  salespersonId: string,
): Promise<PersonalContext> {
  const now = new Date();
  const monthStart = new Date(now.getFullYear(), now.getMonth(), 1);
  const monthEnd = new Date(now.getFullYear(), now.getMonth() + 1, 0, 23, 59, 59);
  const currentMonth = `${monthStart.getFullYear()}-${String(monthStart.getMonth() + 1).padStart(2, "0")}-01`;
  const todayISO = now.toISOString().slice(0, 10);
  const msPerDay = 86_400_000;
  const daysElapsed = Math.max(1, Math.floor((now.getTime() - monthStart.getTime()) / msPerDay) + 1);
  const daysInMonth = Math.floor((monthEnd.getTime() - monthStart.getTime()) / msPerDay) + 1;

  const [spRes, goalRes, salesRes, tasksRes, coachRes] = await Promise.all([
    client.from("salespeople").select("name, role").eq("id", salespersonId).maybeSingle(),
    client.from("sales_goals").select("goal_amount").eq("salesperson_id", salespersonId).eq("month", currentMonth).maybeSingle(),
    client
      .from("sales")
      .select("id, client_name, product_name, amount, status, created_at, updated_at")
      .or(`salesperson_id.eq.${salespersonId},sdr_id.eq.${salespersonId},closer_id.eq.${salespersonId}`)
      .gte("created_at", monthStart.toISOString())
      .lte("created_at", monthEnd.toISOString())
      .limit(500),
    client
      .from("tasks")
      .select("title, due_date, due_time, task_type, status")
      .eq("salesperson_id", salespersonId)
      .neq("status", "completed")
      .lte("due_date", todayISO)
      .order("due_date", { ascending: true })
      .limit(20),
    client
      .from("coaching_actions")
      .select("tip, category, severity, status, created_at")
      .eq("salesperson_id", salespersonId)
      .eq("status", "pending")
      .order("created_at", { ascending: false })
      .limit(3),
  ]);

  const sales = salesRes.data ?? [];
  const won = sales.filter((s) => ["won", "completed", "closed"].includes(String(s.status)));
  const mtdRevenue = won.reduce((sum, s) => sum + Number(s.amount ?? 0), 0);
  const goal = Number(goalRes.data?.goal_amount ?? 0);
  const paceDaily = mtdRevenue / daysElapsed;
  const projectedEOM = mtdRevenue + paceDaily * Math.max(0, daysInMonth - daysElapsed);

  const criticalDeals = sales
    .filter((s) => !["won", "completed", "closed", "lost", "cancelled"].includes(String(s.status)))
    .map((s) => {
      const updated = s.updated_at ? new Date(String(s.updated_at)).getTime() : new Date(String(s.created_at)).getTime();
      const days_stagnant = Math.floor((now.getTime() - updated) / msPerDay);
      return {
        id: String(s.id),
        client_name: String(s.client_name ?? ""),
        product_name: String(s.product_name ?? ""),
        amount: Number(s.amount ?? 0),
        status: String(s.status ?? ""),
        days_stagnant,
      };
    })
    .filter((d) => d.days_stagnant >= 5 || d.amount >= 10000)
    .sort((a, b) => b.amount - a.amount)
    .slice(0, 5);

  const tasks = tasksRes.data ?? [];
  const overdueTasks = tasks
    .filter((t) => String(t.due_date) < todayISO)
    .slice(0, 5)
    .map((t) => ({ title: String(t.title), due_date: String(t.due_date), task_type: String(t.task_type) }));
  const todayTasks = tasks
    .filter((t) => String(t.due_date) === todayISO)
    .slice(0, 8)
    .map((t) => ({ title: String(t.title), due_time: t.due_time as string | null, task_type: String(t.task_type) }));

  const coachingTips = (coachRes.data ?? []).map((c) => ({
    tip: String(c.tip),
    category: String(c.category),
    severity: String(c.severity),
  }));

  return {
    salespersonName: String(spRes.data?.name ?? "Vendedor"),
    role: String(spRes.data?.role ?? "closer"),
    goal,
    mtdRevenue,
    progressPercent: goal > 0 ? Math.round((mtdRevenue / goal) * 100) : 0,
    daysElapsed,
    daysInMonth,
    paceDaily,
    projectedEOM,
    criticalDeals,
    overdueTasks,
    todayTasks,
    coachingTips,
  };
}

function fmtBRL(v: number): string {
  return `R$ ${v.toLocaleString("pt-BR", { minimumFractionDigits: 0, maximumFractionDigits: 0 })}`;
}

function buildSystemPrompt(mode: Mode, ctx: PersonalContext): string {
  const dealsBlock = ctx.criticalDeals.length
    ? ctx.criticalDeals
        .map((d) => `  - ${d.client_name} · ${d.product_name} · ${fmtBRL(d.amount)} · ${d.days_stagnant}d parado · ${d.status}`)
        .join("\n")
    : "  (nenhum deal crítico no momento)";
  const overdueBlock = ctx.overdueTasks.length
    ? ctx.overdueTasks.map((t) => `  - [${t.task_type}] ${t.title} (venceu em ${t.due_date})`).join("\n")
    : "  (nenhuma tarefa atrasada)";
  const todayBlock = ctx.todayTasks.length
    ? ctx.todayTasks.map((t) => `  - ${t.due_time ?? "--:--"} · [${t.task_type}] ${t.title}`).join("\n")
    : "  (nenhuma tarefa para hoje)";
  const coachBlock = ctx.coachingTips.length
    ? ctx.coachingTips.map((c) => `  - [${c.severity}/${c.category}] ${c.tip}`).join("\n")
    : "  (sem oportunidades pendentes de coaching)";

  const base = `Você é o ASSISTENTE PESSOAL de ${ctx.salespersonName} — combinando duas personalidades:

1. SECRETÁRIO EXECUTIVO: organiza a agenda, prioriza follow-ups, alerta sobre deals críticos, projeta ritmo vs meta.
2. COACH DE VENDAS: dá dicas curtas e acionáveis baseadas em gaps reais (usar as oportunidades de coaching abaixo).

Sempre chame ${ctx.salespersonName} pelo primeiro nome. Português brasileiro, direto, motivador e prático.

CONTEXTO ATUAL (${new Date().toLocaleDateString("pt-BR")}):
- Função: ${ctx.role}
- Meta do mês: ${ctx.goal > 0 ? fmtBRL(ctx.goal) : "não definida"}
- Vendas fechadas MTD: ${fmtBRL(ctx.mtdRevenue)} (${ctx.progressPercent}%)
- Dia ${ctx.daysElapsed}/${ctx.daysInMonth} · ritmo diário: ${fmtBRL(ctx.paceDaily)}
- Projeção fim do mês: ${fmtBRL(ctx.projectedEOM)}

DEALS CRÍTICOS (top 5 por valor / estagnação):
${dealsBlock}

TAREFAS ATRASADAS:
${overdueBlock}

TAREFAS DE HOJE:
${todayBlock}

OPORTUNIDADES DE COACHING PENDENTES:
${coachBlock}
`;

  if (mode === "briefing") {
    return (
      base +
      `\nTAREFA: gere um BRIEFING DO DIA em 3 parágrafos curtos (máx 6 linhas cada), em markdown:
1. **Situação** — cumprimento personalizado + ritmo vs meta em 1 frase quantificada.
2. **Prioridades de hoje** — bullet list ordenada (tarefas atrasadas → deals críticos → tarefas do dia).
3. **Dica do Coach** — 1 dica acionável baseada nas oportunidades de coaching (ou princípio genérico se vazio).

Termine sempre com uma pergunta convidando a ação. Sem introduções tipo "Aqui está…".`
    );
  }
  if (mode === "proactive_nudge") {
    return (
      base +
      `\nTAREFA: se houver algo genuinamente urgente (tarefa atrasada de alto valor, deal crítico > 10d parado, ritmo < 50% na segunda metade do mês), emita UM nudge curto (máx 2 frases) no formato:
"🔔 <mensagem específica e acionável>"
Se não houver nada realmente urgente, responda EXATAMENTE a string: NO_NUDGE`
    );
  }
  return (
    base +
    `\nTAREFA: responda à mensagem do vendedor usando o contexto acima. Seja conciso (máx 3 parágrafos). Quando fizer sentido, referencie dados concretos (nome de cliente, valor, dias parado).`
  );
}

Deno.serve(
  withRequestId("personal-assistant-stream", async (req, _ctx) => {
    if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

    try {
      const auth = await getUserClient(req).catch((e) => {
        throw e instanceof UnauthorizedError ? e : new UnauthorizedError("unauthorized");
      });

      const body = await req.json().catch(() => ({}));
      const mode: Mode = (["briefing", "chat", "proactive_nudge"] as const).includes(body.mode)
        ? body.mode
        : "chat";
      const salespersonId: string | undefined = body.salespersonId;
      const message: string = mode === "chat" ? String(body.message ?? "") : "Gere agora.";
      const history: HistoryMsg[] = Array.isArray(body.conversationHistory) ? body.conversationHistory : [];

      const errors = collectErrors([
        validateUUID(salespersonId, "salespersonId"),
        mode === "chat"
          ? validateString(message, "message", { required: true, maxLength: 5000 })
          : null,
        validateArray(history, "conversationHistory", { maxLength: 30 }),
      ]);
      if (errors.length) return validationErrorResponse(errors, corsHeaders);

      const context = await buildContext(auth.client, salespersonId!);
      const systemPrompt = buildSystemPrompt(mode, context);

      // ── Cache do briefing do dia (idempotência por vendedor/dia) ────────────
      // Fuso America/Sao_Paulo → chave do dia estável.
      const today = new Date(new Date().toLocaleString("en-US", { timeZone: "America/Sao_Paulo" }));
      const todayKey = today.toISOString().slice(0, 10);

      if (mode === "briefing") {
        const { data: cached } = await auth.client
          .from("personal_assistant_briefings")
          .select("content")
          .eq("salesperson_id", salespersonId!)
          .eq("briefing_date", todayKey)
          .maybeSingle();

        if (cached?.content) {
          // Reproduz o formato SSE OpenAI-like para o cliente não precisar de branch novo.
          const enc = new TextEncoder();
          const stream = new ReadableStream({
            start(controller) {
              const chunk = { choices: [{ delta: { content: cached.content } }] };
              controller.enqueue(enc.encode(`data: ${JSON.stringify(chunk)}\n\n`));
              controller.enqueue(enc.encode("data: [DONE]\n\n"));
              controller.close();
            },
          });
          return new Response(stream, {
            headers: {
              ...corsHeaders,
              "Content-Type": "text/event-stream",
              "Cache-Control": "no-cache",
              Connection: "keep-alive",
              "X-Briefing-Cache": "hit",
            },
          });
        }
      }

      const messages = [
        { role: "system", content: systemPrompt },
        ...history.map((m) => ({ role: m.role, content: String(m.content ?? "") })),
        { role: "user", content: message },
      ];

      const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
      if (!LOVABLE_API_KEY) {
        return new Response(JSON.stringify({ error: "LOVABLE_API_KEY not configured" }), {
          status: 500,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }

      const MODEL = "google/gemini-2.5-flash";
      const upstream = await fetchWithTimeout("https://ai.gateway.lovable.dev/v1/chat/completions", {
        method: "POST",
        headers: { Authorization: `Bearer ${LOVABLE_API_KEY}`, "Content-Type": "application/json" },
        body: JSON.stringify({ model: MODEL, messages, stream: true }),
      });

      if (!upstream.ok) {
        const status = upstream.status === 429 || upstream.status === 402 ? upstream.status : 502;
        const text = await upstream.text().catch(() => "");
        return new Response(JSON.stringify({ error: "ai_gateway_error", status: upstream.status, details: text.slice(0, 500) }), {
          status,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }

      // Se for briefing, interceptamos o stream para persistir o conteúdo final.
      let responseBody: ReadableStream<Uint8Array> | null = upstream.body;
      if (mode === "briefing" && upstream.body) {
        const dec = new TextDecoder();
        let full = "";
        const tee = new TransformStream<Uint8Array, Uint8Array>({
          transform(chunk, controller) {
            const text = dec.decode(chunk, { stream: true });
            // Extrai delta.content dos frames SSE OpenAI-like.
            for (const line of text.split("\n")) {
              const m = line.match(/^data:\s*(\{.*\})\s*$/);
              if (!m) continue;
              try {
                const j = JSON.parse(m[1]);
                const delta = j?.choices?.[0]?.delta?.content;
                if (typeof delta === "string") full += delta;
              } catch { /* ignora frames não-JSON */ }
            }
            controller.enqueue(chunk);
          },
          async flush() {
            const content = full.trim();
            if (content.length > 0 && content.length < 60_000) {
              await auth.client
                .from("personal_assistant_briefings")
                .upsert(
                  {
                    salesperson_id: salespersonId!,
                    briefing_date: todayKey,
                    content,
                    model: MODEL,
                    token_count: content.length,
                    context_snapshot: {
                      goal: context.goal,
                      mtd: context.mtdRevenue,
                      progress: context.progressPercent,
                      critical_deals: context.criticalDeals.length,
                      overdue_tasks: context.overdueTasks.length,
                    },
                  },
                  { onConflict: "salesperson_id,briefing_date" },
                )
                .then(({ error }) => {
                  if (error) console.error("[personal-assistant] persist briefing failed:", error.message);
                });
            }
          },
        });
        responseBody = upstream.body.pipeThrough(tee);
      }

      return new Response(responseBody, {
        headers: { ...corsHeaders, "Content-Type": "text/event-stream", "Cache-Control": "no-cache", Connection: "keep-alive" },
      });
    } catch (err) {
      if (err instanceof UnauthorizedError) {
        return new Response(JSON.stringify({ error: err.message }), {
          status: 401,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      console.error("personal-assistant-stream error:", err);
      return new Response(JSON.stringify({ error: "internal_error" }), {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }
  }),
);
