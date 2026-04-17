
Reporting & BI fechou em 7/7 ✅. Próxima fila prioritária do GAPS doc: **Sales Engagement Avançado (gap 🔴 #2)** — fundação do Q1 do roadmap. Vou propor uma fila atômica de 7 melhorias, e na aprovação executo **a 1ª**.

## Fila Sales Engagement 10/10 (7 melhorias)

| # | Melhoria | Impacto |
|---|----------|---------|
| 1 | **Sequences Engine v2** — multistep multicanal (email/whatsapp/call/linkedin), pause-on-reply, exit conditions | 🔴 Crítico |
| 2 | **AI Email Composer** — geração 1-to-many com variáveis de contexto + tom configurável | 🔴 Crítico |
| 3 | **A/B Testing de Steps** — 2 variantes por step, winner por reply rate | 🟠 Alto |
| 4 | **Send Time Optimization** — IA escolhe melhor horário/dia por contato com base em engagement histórico | 🟠 Alto |
| 5 | **Email Engagement Scoring** — open + click + reply + meeting booked → score consolidado por contato | 🟠 Alto |
| 6 | **Account-Based Engagement** — orquestração multi-contato por conta com "do not contact twice" | 🟠 Alto |
| 7 | **Reply Detection + Auto-Pause** — webhook inbound classifica reply (interessado/objeção/oof) e pausa cadência + E2E final | 🔴 Crítico |

### Próxima execução — Melhoria 1/7: Sequences Engine v2

**Estado atual:** Existe `/follow-up` com cadência básica por temperatura, mas sem motor de sequences multistep configurável, sem pause-on-reply, sem exit conditions declarativas.

**Mudanças:**
1. **Migration**:
   - `sequences` (id, owner, name, description, channel_mix text[], enabled, created_at)
   - `sequence_steps` (id, sequence_id, order, channel ['email'|'whatsapp'|'call'|'linkedin'], delay_days, delay_hours, template_id, conditions jsonb)
   - `sequence_enrollments` (id, sequence_id, contact_id, contact_type ['lead'|'client'], status ['active'|'paused'|'completed'|'exited'], current_step, started_at, last_executed_at, exit_reason)
   - `sequence_step_executions` (id, enrollment_id, step_id, executed_at, status ['sent'|'failed'|'skipped'], engagement jsonb)
   - RLS owner + manager
2. **Edge function `sequence-runner`** (cron 5min): busca enrollments com `next_action_at <= now()`, executa step (envia email via send-email, agenda call task, etc.), avança current_step, registra execution, marca completed se último step
3. **Edge function `sequence-enroll`**: enroll em massa (lista de contatos), valida não-duplicação
4. **UI `/sequences`**:
   - Lista de sequences com status/enrollments ativos
   - Builder visual: timeline vertical de steps (channel + delay + template), drag para reordenar
   - Drawer de enrollments por sequence com status e timeline de execuções
5. **Hooks**: `useSequences`, `useSequenceSteps`, `useSequenceEnrollments`, `useEnrollContacts`
6. **Validação**: smoke RLS via read_query, criar sequence 3-step, enroll 1 lead, executar manual, verificar execuções

**Arquivos:**
- Migration nova
- `supabase/functions/sequence-runner/index.ts`, `sequence-enroll/index.ts`
- `src/pages/SequencesPage.tsx`
- `src/components/sequences/SequenceBuilder.tsx`, `SequenceStepCard.tsx`, `SequenceEnrollmentsDrawer.tsx`, `sequenceHelpers.ts`
- `src/hooks/sequences/useSequences.ts`, `useSequenceSteps.ts`, `useSequenceEnrollments.ts`, `useEnrollContacts.ts`
- Editar: `src/routes/AppRoutes.tsx`, `src/routes/lazyPages.ts`, sidebar config

Após aprovação executo 1/7 e sigo automaticamente até 7/7 (modo autônomo já confirmado pelo usuário).
