
Smart Lead Routing entregue (Fase 8/10). Próximo bloco rumo a 10/10: **Conversation Intelligence** — análise automática de transcrições de calls/reuniões com IA, extraindo objeções, próximos passos, sentimento e sinais de compra.

## Conversation Intelligence

### Conceito
Vendedor cola/upload transcrição de call (ou texto de e-mail longo) e a IA extrai estruturadamente: objeções levantadas, próximos passos prometidos, decisores mencionados, sentimento por trecho, sinais de compra/risco e sugestão de follow-up. Tudo vinculado ao deal e indexado para busca semântica futura.

### Backend
**Migration** — tabela `conversation_analyses`:
- `id`, `sale_id` (FK sales), `client_id` (nullable), `source` (`call`|`email`|`meeting`|`whatsapp`), `transcript` (text), `summary` (text), `sentiment` (`positive`|`neutral`|`negative`|`mixed`), `objections` (jsonb[]), `next_steps` (jsonb[]), `buying_signals` (text[]), `risk_signals` (text[]), `decision_makers` (text[]), `analyzed_by`, `created_at`
- Índices em `sale_id`, `sentiment`, `created_at`
- RLS: vendedor vê só conversas dos seus deals; gestor/admin vê tudo
- View `conversation_insights_summary`: agrega top objeções, sentimento médio, taxa de buying signals por vendedor

**Edge function `analyze-conversation`**:
- Aceita `{ sale_id, source, transcript }`
- Chama Lovable AI (gemini-2.5-flash) com prompt estruturado retornando JSON validado por Zod
- Persiste em `conversation_analyses` e atualiza `sales.last_interaction_summary`
- Trigger opcional: dispara `next-best-action` recompute

### Frontend (`src/components/conversation-intelligence/`)
- `ConversationHub.tsx` (≤300L): hub com lista de análises recentes + botão "Nova Análise"
- `TranscriptAnalyzerDialog.tsx`: modal com textarea + select de source + botão "Analisar com IA" (loading state)
- `AnalysisResultCard.tsx`: card visual com summary, sentimento (badge colorido), seções colapsáveis (objeções, próximos passos, signals)
- `ObjectionsTrendChart.tsx`: barras horizontais — top objeções recorrentes do time (recharts)
- `SentimentDistributionCard.tsx`: donut de sentimento agregado
- `conversationHelpers.ts`: enums labels, sentiment color tokens, formatters
- Hooks: `useConversationAnalyses.ts`, `useAnalyzeConversation.ts` (mutation), `useConversationInsights.ts`

### Integração
- Nova tab "Conversas IA" no `RevenueIntelligenceHub`
- Botão "Analisar Call" no detalhe do deal (`SaleDetailPage`)
- Card resumo "Última Conversa" inline no `KanbanCard` (sentimento + 1 objeção top)

### Arquivos
- Migration: tabela `conversation_analyses` + view + RLS + índices
- Edge: `supabase/functions/analyze-conversation/index.ts` (com Zod + shared utils)
- Hooks: 3 em `src/hooks/conversation-intelligence/`
- Componentes: 5 em `src/components/conversation-intelligence/`
- Helpers: `conversationHelpers.ts`
- Editar: `RevenueIntelligenceHub.tsx` (nova tab), `SaleDetailPage` (botão)

Padrões: semantic tokens, Sora/Inter, framer-motion, skeleton, ≤300L, strict TS, recharts tipado, RLS com `has_role`, edge function com `cors.ts` + `validation.ts` compartilhados.
