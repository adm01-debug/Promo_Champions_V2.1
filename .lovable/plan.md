
**Bloco Deal Intelligence — item 4/4 (último): Stage Conversion Optimizer**

Próxima atômica: revelar **gargalos de conversão entre estágios do funil** com taxas reais (`stage A → B`), tempo médio de transição, motivos de perda agregados por estágio e **recomendações de IA** para destravar cada gargalo — fechando o bloco Deal Intelligence em 10/10.

## Estado atual
- `deal_stage_history` registra entradas/saídas mas nunca é cruzado para calcular conversão.
- `Analytics > Conversion Analysis` mostra funil estático sem comparação temporal nem benchmark por owner.
- `stage_velocity_baselines` (3/4) já tem tempo médio — falta cruzar com taxa de conversão.
- Sem "este estágio perde 60% dos deals — eis o motivo top + ação recomendada".

## Mudanças

### 1. Migration
- Tabela `stage_conversion_metrics`: `id`, `from_stage`, `to_stage`, `owner_id` (nullable=global), `entered_count int`, `converted_count int`, `lost_count int`, `conversion_rate numeric`, `avg_transition_days numeric`, `period_start date`, `period_end date`, `calculated_at`. Unique `(from_stage, to_stage, owner_id, period_start)`.
- Tabela `stage_bottleneck_insights`: `id`, `stage`, `owner_id` (nullable), `severity` (`low|medium|high|critical`), `conversion_rate numeric`, `top_loss_reasons jsonb`, `recommendations jsonb`, `ai_summary text`, `calculated_at`. Unique `(stage, owner_id)`.
- RLS padrão + realtime.

### 2. Edge function `analyze-stage-conversion` (`verify_jwt = true`)
- Input: `{ owner_id?, days?: 90 }`.
- Calcula transições reais cruzando `deal_stage_history` (last 90d): para cada `from_stage`, conta deals que avançaram vs. perdidos.
- Lê `lost_reasons` em sales fechadas como lost para agrupar top motivos por estágio.
- Lovable AI (`google/gemini-2.5-flash`) com tool calling: retorna `severity`, `recommendations[]` (3-5 ações táticas), `ai_summary` curto.
- Upsert em ambas as tabelas; auto-chain após `refresh-stage-baselines`.

### 3. Hooks `src/hooks/deal-intelligence/`
- `useStageConversion(ownerId?)` — query funil completo + realtime.
- `useStageBottlenecks(ownerId?)` — insights por estágio.
- `useAnalyzeStageConversion()` — mutation (refresh).

### 4. UI — `src/components/deal-intelligence/`
- `ConversionFunnelChart.tsx` (≤180L) — funil visual Recharts horizontal com taxas e perdas por estágio (cores semânticas por severity).
- `StageBottleneckCard.tsx` (≤200L) — card por estágio: severity badge, taxa, top 3 loss reasons, recomendações IA acionáveis.
- `ConversionOptimizerPanel.tsx` (≤160L) — wrapper com header + botão "Recalcular" + grid de cards.
- `conversionHelpers.ts` — labels PT-BR, cores por severity, formatadores.
- **Integração**: nova aba "Otimizador de Conversão" em `/deal-intelligence` (4ª aba). Mini-link no `StageBaselinesPanel` para "ver gargalos".

### 5. Configuração
- `supabase/config.toml`: `[functions.analyze-stage-conversion] verify_jwt = true`.

### 6. Validação
- `supabase--deploy_edge_functions` + `curl_edge_functions /analyze-stage-conversion`.
- `supabase--linter` zero novos warnings.
- Aba renderiza funil + cards de gargalo com recomendações.

## Arquivos
- **Migration**: 1 (2 tabelas + RLS + realtime)
- **Criar**: `supabase/functions/analyze-stage-conversion/index.ts`
- **Criar**: `src/hooks/deal-intelligence/useStageConversion.ts`
- **Criar**: 4 componentes/helpers em `src/components/deal-intelligence/`
- **Editar**: `src/pages/DealIntelligence.tsx` (4ª aba), `StageBaselinesPanel.tsx` (link), `supabase/config.toml`

Após esta entrega, **Deal Intelligence fecha 4/4 (10/10)** e sigo automaticamente para o próximo bloco do `GAPS_CLASSE_MUNDIAL.md`.
