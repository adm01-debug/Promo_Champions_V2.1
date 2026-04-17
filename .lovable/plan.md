
Próxima melhoria atômica da fila Sales Engagement: **4/7 — Send Time Optimization**.

## Melhoria 4/7 — Send Time Optimization (STO)

### Estado atual
- 1/7 ✅ Sequences Engine, 2/7 ✅ AI Composer, 3/7 ✅ A/B Testing entregues.
- O `sequence-runner` dispara passos assim que `next_action_at <= now()`, sem considerar o melhor horário/dia para o contato.
- Não há histórico de engagement por janela horária para alimentar uma escolha inteligente.

### Mudanças

**1. Migration**
- Tabela `contact_send_time_profile`:
  - `id`, `contact_id`, `contact_type` ('lead'|'client'), `hour_of_day` (0-23), `day_of_week` (0-6), `opens` int, `clicks` int, `replies` int, `score` numeric (gerado), `updated_at`
  - Unique (contact_id, contact_type, hour_of_day, day_of_week)
- Coluna em `sequences`: `send_time_optimization` boolean default true
- Coluna em `sequence_enrollments`: `optimized_for_at timestamptz` (próxima janela ótima calculada)
- View `contact_best_send_window` agregando top 3 janelas por contato
- RPC `compute_optimal_send_time(_contact_id uuid, _contact_type text, _earliest timestamptz)`:
  - SECURITY DEFINER, retorna `timestamptz` da próxima janela ótima ≥ `_earliest`
  - Fallback: dia útil 10h horário local se sem dados
- RPC `record_engagement_signal(_contact_id, _contact_type, _signal text, _occurred_at timestamptz)`:
  - Incrementa contadores no perfil para a hora/dia do sinal
- RLS: leitura para owner/manager via has_role

**2. Edge function `sequence-runner` (update)**
- Quando enrollment.sequence.send_time_optimization = true e canal ∈ {email, linkedin}:
  - Antes do dispatch, chama `compute_optimal_send_time`
  - Se janela ótima > now() + 5min e ≤ now() + 24h: adia (`next_action_at = janela`), grava `optimized_for_at`, não envia agora
  - Caso contrário: envia normalmente
- Após gravar execução com `replied_at`/`opened_at`: chama `record_engagement_signal`

**3. Edge function `sequence-record-reply` (update)**
- Após registrar reply: chama `record_engagement_signal` com signal='reply'
- Garante alimentação contínua do perfil

**4. Hooks**
- `useContactSendProfile(contactId, contactType)` — top janelas
- `useToggleSendTimeOptimization()` — liga/desliga STO na sequência

**5. Componentes UI (≤250L cada)**
- `SendTimeOptimizationToggle.tsx`: switch no header do `SequenceBuilder` com tooltip explicando STO
- `BestSendWindowCard.tsx`: mini-card mostrando top 3 janelas do contato (usado no drawer de enrollments)
- `sendTimeHelpers.ts`: formatação `Seg 14:00`, cálculo de score normalizado

**6. Integração**
- `SequenceBuilder.tsx`: adiciona toggle no topo
- `SequenceEnrollmentsDrawer.tsx`: badge "⏰ Otimizado para Ter 10:00" quando `optimized_for_at` está setado

**7. Validação**
- Smoke RLS via `read_query` na nova tabela + view
- Inserir sinais sintéticos para 1 contato (3 opens em Ter 10h) → `compute_optimal_send_time` retorna terça 10h
- Criar sequence com STO ON → enroll → runner adia para janela ótima
- Verificar `optimized_for_at` populado e badge no drawer
- Linter Supabase: zero novos warnings; console limpo

### Arquivos
- Criar: migration nova (1 tabela + 2 colunas + 1 view + 2 RPCs + RLS)
- Criar: `src/hooks/sequences/useSendTimeOptimization.ts`
- Criar: `src/components/sequences/SendTimeOptimizationToggle.tsx`, `BestSendWindowCard.tsx`, `sendTimeHelpers.ts`
- Editar: `supabase/functions/sequence-runner/index.ts`, `supabase/functions/sequence-record-reply/index.ts`, `src/components/sequences/SequenceBuilder.tsx`, `src/components/sequences/SequenceEnrollmentsDrawer.tsx`, `src/hooks/sequences/useSequences.ts` (expor toggle)

Após esta, sigo automaticamente para 5/7 (Email Engagement Scoring).
