
Próxima melhoria atômica da fila Sales Engagement: **3/7 — A/B Testing de Steps**.

## Melhoria 3/7 — A/B Testing de Steps

### Estado atual
- Sequences Engine v2 (1/7 ✅) e AI Email Composer (2/7 ✅) entregues.
- Cada `sequence_step` tem 1 versão única de `subject`/`body`. Não há como testar variantes nem identificar copy vencedora.
- `cadence_ab_tests` (hook `useABTests.ts`) existe para cadências antigas mas **não** está integrado ao motor novo de sequences.

### Mudanças

**1. Migration**
- Tabela `sequence_step_variants`:
  - `id`, `step_id` (FK → sequence_steps), `label` ('A'|'B'), `subject`, `body`, `traffic_weight` int default 50, `created_at`
  - Unique (step_id, label)
- Coluna em `sequence_step_executions`: `variant_id uuid null` + `replied_at timestamptz null`
- View `sequence_variant_performance`:
  - Agrega por `step_id`+`variant_id`: sent, replied, reply_rate
- RPC `pick_step_variant(_step_id uuid)`:
  - SECURITY DEFINER, retorna 1 variante ponderada por `traffic_weight`; fallback para o step base se não houver variantes
- RPC `declare_step_winner(_step_id uuid, _variant_label text)`:
  - Atualiza `subject`/`body` do step com o conteúdo da variante vencedora e remove as outras variantes
- RLS: owner/manager via has_role + ownership do sequence pai

**2. Edge function `sequence-runner` (update)**
- Antes do dispatch: chamar `pick_step_variant(step.id)`
- Se retornar variant: usar `subject`/`body` da variante e gravar `variant_id` na execução
- Adicionar telemetria: `variant_label` no `engagement` jsonb

**3. Edge function `sequence-record-reply` (nova, verify_jwt=true)**
- Input: `{ enrollment_id, occurred_at? }`
- Atualiza última `sequence_step_executions` ativa do enrollment com `replied_at = now()`
- Pausa enrollment (`status='paused'`, `next_action_at=null`) — base para 7/7
- Retorna `{ ok, execution_id, variant_id }`

**4. Hooks**
- `useStepVariants(stepId)` — lista variantes
- `useUpsertStepVariant()` — criar/editar A ou B
- `useDeleteStepVariant()`
- `useStepVariantPerformance(stepId)` — query da view
- `useDeclareStepWinner()` — chama RPC

**5. Componentes UI (≤300L cada)**
- `StepVariantsManager.tsx`:
  - Aba dentro do `SequenceStepDialog` (visível apenas para email/linkedin)
  - 2 cards lado a lado (Variante A / Variante B): subject + body editáveis, slider de traffic_weight (soma=100)
  - Botão "Compor com IA" reaproveita `AIEmailComposerPanel` por variante
  - Mostra performance ao vivo: sent, reply rate, badge "Vencedora" se uma já tem ≥30 sends e reply_rate ≥1.5x da outra
  - Botão "Declarar vencedora e promover" (chama RPC, fecha A/B)
- `StepVariantBadge.tsx`: chip "A/B" no `SequenceStepCard` quando há variantes ativas
- `abTestHelpers.ts`: cálculo de significância simples (z-test 2-prop, threshold 90%)

**6. Integração no `SequenceStepDialog`**
- Tabs: "Conteúdo único" | "Teste A/B"
- Ao alternar para A/B: cria 2 variantes seedadas com o `subject`/`body` atual
- Ao alternar de volta: confirma descarte das variantes

**7. Validação**
- RLS smoke via `read_query` nas 1 nova tabela + 1 nova view
- Criar step → ativar A/B → 2 variantes → executar runner manual 5x → verificar distribuição ~50/50 e variant_id gravado
- Chamar `sequence-record-reply` 2x para variante A → reply_rate sobe → declarar vencedora → step base atualizado, variantes removidas
- Linter Supabase: zero novos warnings
- Console limpo, zero erros TS

### Arquivos
- Criar: migration nova (tabela + view + 2 RPCs + RLS)
- Criar: `supabase/functions/sequence-record-reply/index.ts`
- Criar: `src/hooks/sequences/useStepVariants.ts`
- Criar: `src/components/sequences/StepVariantsManager.tsx`, `StepVariantBadge.tsx`, `abTestHelpers.ts`
- Editar: `supabase/functions/sequence-runner/index.ts`, `src/components/sequences/SequenceStepDialog.tsx`, `src/components/sequences/SequenceStepCard.tsx`, `supabase/config.toml`

Após esta, sigo automaticamente para 4/7 (Send Time Optimization).
