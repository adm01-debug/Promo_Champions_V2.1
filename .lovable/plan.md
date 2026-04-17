
Próxima atômica — **Sequences Multicanal com A/B Testing** (Sales Engagement #2, item 1 dos 8).

## Estado atual
- Existe `sequences` + `sequence_steps` + `sequence_enrollments` + `inbound_reply_events` (auto-pause já implementado).
- Steps são lineares de canal único (email).
- Sem variantes A/B, sem tracking de winner, sem multicanal nativo (LinkedIn/WhatsApp/Call task).
- Sem métricas comparativas por variante (open/click/reply/meeting).

## Mudanças

### 1. Migration
- `sequence_steps`: adicionar `channel text` (`email|linkedin|whatsapp|call|task`), `variant_group text` (NULL = sem A/B; mesmo valor = grupo de variantes), `variant_label text` (`A|B|C`), `variant_weight int default 50`.
- `sequence_step_metrics` (nova): `step_id`, `variant_label`, `sent_count`, `opens`, `clicks`, `replies`, `meetings_booked`, `last_updated_at` — agregado materializado.
- RPC `pick_variant(_step_id uuid)` SECURITY DEFINER → seleciona variante por peso ponderado, registra escolha em `sequence_step_assignments` (sale_id ↔ variant).
- RPC `get_ab_winner(_variant_group text, _sequence_id uuid)` → retorna variante com maior reply_rate quando significância (n≥30 por braço).
- RPC `record_step_event(_enrollment_id, _event_type)` para somar métricas por variante.
- Trigger em `inbound_reply_events` incrementa `replies` da variante respondida.

### 2. Edge function `sequence-step-executor` (atualizar)
- Ao executar step com `variant_group`, chama `pick_variant` para escolher.
- Despacha conforme `channel`: email (já existe), LinkedIn (cria task `linkedin_message`), WhatsApp (cria task ou chama edge whatsapp se configurado), call (cria task de ligação), task (cria task genérica).
- Registra `sent` em `sequence_step_metrics`.

### 3. Edge function nova `sequence-ab-promote` (admin)
- Para cada `variant_group` de uma sequência, chama `get_ab_winner`; se houver winner, marca outras variantes como `is_paused=true` e amplia peso da winner para 100%.

### 4. Hooks
- `useSequenceStepVariants(stepId)` — lista variantes + métricas + reply rate.
- `useCreateVariant()` / `useUpdateVariant()` / `usePromoteWinner()`.
- `useStepMetrics(sequenceId)` — agregado por step+variant.

### 5. UI (≤300L cada)
- `StepChannelSelector.tsx` — chips de canal (email/linkedin/whatsapp/call/task) com ícones.
- `VariantEditor.tsx` — form para adicionar variante B/C com subject + body + peso (slider).
- `ABTestPanel.tsx` — tabela comparativa (variante, sent, open%, reply%, meeting%) com badge "Winner" e botão "Promover winner".
- `SequenceStepCard.tsx` (atualizar) — mostra canal, badges de variantes, mini-stats inline.
- `sequenceVariantHelpers.ts` — cálculo de reply_rate, formatação, threshold de significância.

### 6. Integração
- `SequenceBuilder` (página existente) — botão "Adicionar variante A/B" em cada step.
- `SequenceDetail` — nova aba "A/B Testing" com `ABTestPanel`.
- Lista de steps mostra ícone do canal + contador de variantes.

### 7. Validação
- `supabase--curl_edge_functions` em sequência real → confere métricas populando.
- `supabase--read_query`: confere distribuição de variantes ≈ pesos.
- `supabase--linter` zero novos warnings.

### Arquivos
- **Migration**: 1 (colunas + 1 tabela + 3 RPCs + trigger)
- **Editar**: `supabase/functions/sequence-step-executor/index.ts`
- **Criar**: `supabase/functions/sequence-ab-promote/index.ts`
- **Criar**: `src/hooks/sequences/useSequenceStepVariants.ts`, `usePromoteWinner.ts`, `useStepMetrics.ts`
- **Criar**: `src/components/sequences/StepChannelSelector.tsx`, `VariantEditor.tsx`, `ABTestPanel.tsx`, `sequenceVariantHelpers.ts`
- **Editar**: `src/components/sequences/SequenceStepCard.tsx`, `SequenceBuilder.tsx`, `SequenceDetail.tsx`, `supabase/config.toml`

Após esta entrega, sigo automaticamente para: **AI Email Composer 1-to-many** → **Send Time Optimization** → **Email Engagement Scoring** → **Account-Based Engagement** → **Power Dialer** → **Click-to-call Twilio** → fechando Sales Engagement em 10/10.
