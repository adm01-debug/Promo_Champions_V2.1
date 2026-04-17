
User wants Natural Language Queries (NLQ) — ask "Quanto vendi em março?" and get an answer based on real CRM data.

Codebase recon:
- Existing AI infra: `sales-assistant-chat` (SSE streaming Copilot), `ai-copilot`, Lovable AI Gateway pattern with tool calling.
- Tables: sales, deals, activities, leads, clients, salespeople — RLS scoped per salesperson.
- Pattern: edge function uses LOVABLE_API_KEY + tool calling for structured output (já visto em `diarize-call-recording`).
- Memória: respostas devem usar tokens semânticos, Sora/Inter, framer motion, ≤400L.

Approach: function-calling NLQ. LLM traduz pergunta PT-BR → chama tool `query_sales_metric` com {metric, period_start, period_end, group_by, filters} → edge executa SELECT seguro pré-aprovado contra `sales`/`deals`/`activities` respeitando RLS do usuário → devolve resultado + LLM redige resposta natural com números reais. Sem SQL livre (segurança).

Mostro como widget no Dashboard + página dedicada `/perguntar`.

## Plano — Natural Language Queries (AI Generativo)

### Backend
**Edge function `nlq-query`** (`verify_jwt = true`):
- Input: `{ question: string, conversation?: Msg[] }`
- 1ª chamada Lovable AI (`google/gemini-2.5-flash`) com tool calling. Tools whitelisted:
  - `query_sales_metric({ metric: 'revenue'|'count'|'avg_ticket'|'won_count'|'lost_count'|'conversion_rate', period_start, period_end, group_by?: 'day'|'week'|'month'|'salesperson'|'category', filters?: { salesperson_id?, status?, category? } })`
  - `query_pipeline_snapshot({ stage?, owner_scope: 'me'|'team' })`
  - `query_activities({ type?, period_start, period_end })`
  - `query_top_clients({ period_start, period_end, limit })`
- Edge resolve cada tool via Supabase client com JWT do usuário (RLS aplicado automaticamente) — query parametrizada, zero SQL livre.
- 2ª chamada Lovable AI passa resultado da tool → modelo redige resposta PT-BR com números formatados (R$, datas).
- Retorna `{ answer, data, tool_calls, period }` para UI poder renderizar gráfico opcional.
- Trata 429/402 com mensagens específicas.

**Helpers**: `supabase/functions/nlq-query/queryResolvers.ts` — uma função pura por tool, retornando `{ rows, summary }`.

### Frontend
- Hook `useNLQ()` — mutation que chama edge + cache de últimas perguntas (sessionStorage).
- Página `src/pages/AskAnything.tsx` (rota `/perguntar`, lazy):
  - Input grande estilo Copilot + sugestões clicáveis ("Quanto vendi em março?", "Meus 5 maiores clientes", "Taxa de conversão essa semana", "Atividades pendentes").
  - Resposta em card com markdown (react-markdown já instalado), bloco de dados estruturados (mini-tabela ou Recharts bar/line) quando `data.length > 1`.
  - Histórico da sessão ao lado (últimas 10 perguntas).
- Componentes ≤300L:
  - `NLQInput.tsx` — input + sugestões + voice (reaproveita VoiceControls existente)
  - `NLQAnswerCard.tsx` — answer markdown + meta (período, tool usada)
  - `NLQDataChart.tsx` — auto-render Recharts (bar p/ group_by categórico, line p/ temporal)
  - `nlqHelpers.ts` — formatação BRL, datas PT-BR, decisão de chart
- Widget no Dashboard: `DashboardNLQWidget.tsx` (botão "Pergunte qualquer coisa" → abre dialog com NLQInput).
- Sidebar: novo item "Perguntar à IA" no grupo BI/Analytics.
- Rota lazy em `AppRoutes.tsx` + Helmet SEO.

### Validação
- Smoke 4 perguntas: "Quanto vendi em março?", "Quantas atividades fiz essa semana?", "Top 5 clientes do trimestre", "Minha taxa de conversão hoje".
- `supabase--curl_edge_functions` para validar payload + RLS.
- Console limpo; zero erros TS; linter Supabase sem novos warnings.

### Arquivos
- Criar: `supabase/functions/nlq-query/index.ts`, `supabase/functions/nlq-query/queryResolvers.ts`
- Criar: `src/hooks/nlq/useNLQ.ts`
- Criar: `src/pages/AskAnything.tsx`, `src/components/nlq/NLQInput.tsx`, `NLQAnswerCard.tsx`, `NLQDataChart.tsx`, `nlqHelpers.ts`, `DashboardNLQWidget.tsx`
- Editar: `src/routes/AppRoutes.tsx`, `src/components/layout/AppSidebar.tsx` (ou equivalente), `supabase/config.toml`, `src/pages/Index.tsx` (widget no dashboard)
