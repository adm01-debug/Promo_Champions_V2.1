export type AssistantFallbackMode = "briefing" | "chat" | "proactive_nudge";

export interface AssistantFallbackContext {
  salespersonName: string;
  goal: number;
  mtdRevenue: number;
  progressPercent: number;
  projectedEOM: number;
  criticalDeals: Array<{
    client_name: string;
    amount: number;
    days_stagnant: number;
  }>;
  overdueTasks: Array<{ title: string; due_date: string }>;
  todayTasks: Array<{ title: string; due_time: string | null }>;
  coachingTips: Array<{ tip: string }>;
}

function formatBRL(value: number): string {
  return `R$ ${value.toLocaleString("pt-BR", { maximumFractionDigits: 0 })}`;
}

function firstName(name: string): string {
  return name.trim().split(/\s+/)[0] || "Vendedor";
}

export function isAiDisabledError(status: number, responseBody: string): boolean {
  if (status !== 403) return false;

  try {
    const parsed = JSON.parse(responseBody) as { type?: unknown; title?: unknown; message?: unknown };
    const text = `${String(parsed.title ?? "")} ${String(parsed.message ?? "")}`.toLowerCase();
    return parsed.type === "forbidden" && text.includes("lovable ai is disabled");
  } catch {
    return responseBody.toLowerCase().includes("lovable ai is disabled");
  }
}

export function buildFallbackContent(
  mode: AssistantFallbackMode,
  context: AssistantFallbackContext,
): string {
  if (mode === "proactive_nudge") return "NO_NUDGE";

  const name = firstName(context.salespersonName);
  const topDeal = context.criticalDeals[0];
  const topTask = context.overdueTasks[0] ?? context.todayTasks[0];
  const coachTip = context.coachingTips[0]?.tip;

  if (mode === "chat") {
    const priorities = [
      topTask ? `concluir **${topTask.title}**` : null,
      topDeal
        ? `retomar **${topDeal.client_name}** (${formatBRL(topDeal.amount)}, ${topDeal.days_stagnant} dias sem avanço)`
        : null,
    ].filter((item): item is string => Boolean(item));

    return ` ${name}, o modo inteligente está temporariamente indisponível, mas seus dados continuam acessíveis. ${
      priorities.length > 0
        ? `Priorize agora: ${priorities.join("; ")}.`
        : "Você não possui pendências críticas registradas neste momento."
    }${coachTip ? `\n\n**Dica prática:** ${coachTip}` : ""}`.trim();
  }

  const goalText = context.goal > 0
    ? `${context.progressPercent}% da meta de ${formatBRL(context.goal)}`
    : "meta mensal ainda não definida";
  const taskLines = [
    ...context.overdueTasks.slice(0, 3).map((task) => `- Resolver **${task.title}** (atrasada desde ${task.due_date}).`),
    ...context.criticalDeals.slice(0, 3).map(
      (deal) => `- Retomar **${deal.client_name}** — ${formatBRL(deal.amount)}, parado há ${deal.days_stagnant} dias.`,
    ),
    ...context.todayTasks.slice(0, 2).map(
      (task) => `- ${task.due_time ?? "Hoje"}: **${task.title}**.`,
    ),
  ];

  return `**Situação**\n${name}, você realizou ${formatBRL(context.mtdRevenue)} no mês, está em ${goalText} e mantém projeção de ${formatBRL(context.projectedEOM)} até o fechamento.\n\n**Prioridades de hoje**\n${
    taskLines.length > 0 ? taskLines.join("\n") : "- Nenhuma pendência crítica registrada. Revise o pipeline e avance a próxima oportunidade."
  }\n\n**Dica do Coach**\n${coachTip ?? "Faça um contato objetivo com o próximo passo e prazo claramente combinados."}\n\nQual prioridade você quer atacar primeiro?`;
}

export function createSseResponse(content: string, headers: Record<string, string>): Response {
  const encoder = new TextEncoder();
  const stream = new ReadableStream<Uint8Array>({
    start(controller) {
      const chunk = { choices: [{ delta: { content } }] };
      controller.enqueue(encoder.encode(`data: ${JSON.stringify(chunk)}\n\n`));
      controller.enqueue(encoder.encode("data: [DONE]\n\n"));
      controller.close();
    },
  });

  return new Response(stream, {
    status: 200,
    headers: {
      ...headers,
      "Content-Type": "text/event-stream",
      "Cache-Control": "no-cache",
      Connection: "keep-alive",
      "X-AI-Fallback": "workspace-disabled",
    },
  });
}