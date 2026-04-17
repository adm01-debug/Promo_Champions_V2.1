
NLQ (#168 da seção "AI Generativo Avançado") já foi entregue na mensagem anterior. A próxima atômica natural da fila AI Generativo Avançado é **AI Email Composition** (#165), mas precisa estar 100% integrado ao fluxo do CRM.

## Próxima Melhoria — AI Email Composition (linha #165)

### Estado atual
- `ai-email-composer` edge function: já existe mas só usada em sequences (1-to-many).
- Não há botão "Escrever com IA" nas telas de detalhes de Lead/Cliente/Deal.
- Composer manual de email único não existe — usuário só consegue mandar email via sequence.

### Mudanças

**Backend** (extensão da edge function existente)
- Edição mínima em `supabase/functions/ai-email-composer/index.ts`: aceitar modo `single` com `{ recipient_id, recipient_type: 'lead'|'client', goal, tone, language, context_extras? }`.
- Resolver contexto automático: nome, empresa, cargo, últimas 5 atividades, último deal/sale, tags. Sem expor PII desnecessária.
- Tool calling Gemini 2.5 Flash retorna `{ subject, body_html, body_text, suggested_send_time, follow_up_hint }`.
- Trata 429/402.

**Frontend** (≤300L cada)
- `useComposeEmail()` — mutation que chama edge + opcional `send-multichannel-message`.
- `AIEmailComposerDialog.tsx` — dialog com:
  - Form: objetivo (dropdown: Apresentação, Follow-up, Proposta, Reativação, Agradecimento), tom (Formal/Casual/Consultivo), idioma (PT-BR/EN), contexto extra (textarea opcional).
  - Botão "Gerar com IA" → preview de assunto + corpo (markdown render), botão "Regenerar", botão "Editar manualmente", botão "Enviar agora" (canal email do multichannel).
  - Indicador de horário sugerido + dica de follow-up.
- `AIEmailComposerButton.tsx` — botão pequeno com ícone Sparkles + "Escrever com IA" reutilizável.
- `aiEmailHelpers.ts` — defaults, mapeamento de tons e validação Zod.

**Integração**
- Inserir `AIEmailComposerButton` em:
  - `src/components/leads/LeadDetailDrawer.tsx`
  - `src/components/clients/ClientDetailDrawer.tsx`
  - `src/components/deals/DealDetailDrawer.tsx` (se existir)
- No multichannel hub, adicionar botão flutuante "Compor com IA".

**Validação**
- `supabase--curl_edge_functions` smoke com `mode=single` em lead real.
- Conferir RLS (vendedor só vê próprios leads).
- Linter Supabase, console limpo, zero erros TS.

### Arquivos
- Editar: `supabase/functions/ai-email-composer/index.ts`
- Criar: `src/hooks/email/useComposeEmail.ts`, `src/components/email/AIEmailComposerDialog.tsx`, `AIEmailComposerButton.tsx`, `aiEmailHelpers.ts`
- Editar: `LeadDetailDrawer.tsx`, `ClientDetailDrawer.tsx`, eventual `DealDetailDrawer.tsx`, `MultichannelHub.tsx`

Após esta entrega, sigo automaticamente para as próximas atômicas restantes da seção AI Generativo Avançado: Meeting Summary AI, Semantic Search expandida, AI Agents autônomos, Predictive Scoring com explainability — fechando AI Generativo em 10/10.
