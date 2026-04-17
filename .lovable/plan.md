
Próxima atômica do **Sales Engagement Avançado** (item 2/8): **AI Email Composer 1-to-many** — gerar emails personalizados em massa com IA, mantendo tom único por destinatário, sem cair em spam de template.

## Estado atual
- Existe `email-composer` edge function que gera 1 email a partir de prompt + contexto de 1 lead.
- Sequences já fazem envio em massa, mas usam **template idêntico** com variáveis simples ({{nome}}, {{empresa}}).
- Não existe geração 1-to-many: hoje, para personalizar 50 leads, o usuário precisaria gerar 50 vezes manualmente.
- Sem preview/edição em massa, sem aprovação por lote, sem tracking de qual lead recebeu qual variação.

## Mudanças

### 1. Migration
- Tabela `email_bulk_jobs`: `id`, `owner_id`, `prompt text` (briefing do usuário), `tone text` (consultivo/direto/casual), `target_count int`, `status text` (`draft|generating|ready|sending|completed|failed`), `created_at`, `completed_at`.
- Tabela `email_bulk_drafts`: `id`, `job_id`, `sale_id` (lead alvo), `subject text`, `body text`, `personalization_notes text` (o que IA usou para personalizar), `approved boolean default false`, `sent_at timestamptz`, `error text`.
- RLS: owner vê os próprios; admin vê tudo.
- RPC `get_bulk_job_summary(_job_id)` → contadores aggregados (drafts, approved, sent, failed).

### 2. Edge function `email-composer-bulk` (`verify_jwt=true`)
- Input: `{ prompt, tone, sale_ids: [...] }` (até 50).
- Cria `email_bulk_jobs` com status=generating.
- Para cada `sale_id`: carrega contexto rico (cliente, último deal, atividades recentes, score) → gera subject+body via Gemini 2.5 Flash com instrução explícita de personalização individual + `personalization_notes` (1 frase explicando o gancho usado).
- Concorrência limitada (5 paralelos), tratamento 429/402 com retry exponencial e fallback determinístico (template + variáveis).
- Persiste em `email_bulk_drafts`, atualiza job para `ready`.

### 3. Edge function `email-bulk-send` (`verify_jwt=true`)
- Input: `{ job_id }`. Filtra drafts `approved=true AND sent_at IS NULL`.
- Despacha via `send-multichannel-message` (email channel) ou Resend direto.
- Atualiza `sent_at`/`error` por draft, status do job.

### 4. Hooks
- `useCreateBulkJob()` — invoca `email-composer-bulk`.
- `useBulkJob(jobId)` — busca job + drafts em realtime (subscribe em `email_bulk_drafts`).
- `useApproveDraft(draftId, approved)` / `useUpdateDraft(draftId, {subject,body})`.
- `useSendBulkJob(jobId)` — invoca `email-bulk-send`.

### 5. UI (≤300L cada)
- `src/components/engagement/BulkComposer/BulkComposerWizard.tsx`: 3 passos
  - **Step 1**: seleção de leads (lista + checkboxes; aproveita filtros existentes da página `/leads`).
  - **Step 2**: prompt + tom + botão "Gerar com IA". Mostra progresso (X/Y gerados).
  - **Step 3**: tabela de drafts com preview (subject + 3 linhas de body), badge de personalization_notes, checkbox de aprovação, edição inline, botão "Enviar aprovados".
- `BulkDraftRow.tsx` — linha da tabela com toggle approve + popover de edição.
- `bulkComposerHelpers.ts` — formatação, contadores, validação.

### 6. Integração
- Página `/leads`: novo botão "Composer IA em massa" no header (visível com ≥1 lead selecionado).
- Página dedicada `/engagement/bulk-composer` listando jobs anteriores (histórico).
- Sidebar: item "Composer IA" sob "Engajamento".

### 7. Validação
- `supabase--curl_edge_functions email-composer-bulk` com 3 sale_ids reais → confere drafts gerados com `personalization_notes` distintos.
- `supabase--read_query` confere RLS + status transitions.
- `supabase--linter` zero novos warnings.

### Arquivos
- **Migration**: 1 (2 tabelas + 1 RPC + RLS)
- **Criar**: `supabase/functions/email-composer-bulk/index.ts`, `email-bulk-send/index.ts`
- **Criar**: `src/hooks/engagement/useBulkComposer.ts` (todos os 4 hooks)
- **Criar**: `src/components/engagement/BulkComposer/BulkComposerWizard.tsx`, `BulkDraftRow.tsx`, `bulkComposerHelpers.ts`
- **Criar**: `src/pages/BulkComposer.tsx`
- **Editar**: `src/pages/LeadsPage.tsx` (botão), `src/routes/AppRoutes.tsx`, `src/routes/lazyPages.ts`, `src/components/layout/sidebar/sidebarMenuData.ts`, `supabase/config.toml`

Após esta entrega, sigo automaticamente para: **Send Time Optimization** → **Email Engagement Scoring** → **Account-Based Engagement** → **Power Dialer** → **Click-to-call Twilio** → fechando Sales Engagement em 10/10.
