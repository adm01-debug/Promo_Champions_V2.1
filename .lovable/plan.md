
Próxima melhoria atômica da fila Sales Engagement: **2/7 — AI Email Composer**.

## Melhoria 2/7 — AI Email Composer

### Estado atual
- Sequences Engine v2 entregue (1/7 ✅) com passos de e-mail tendo `subject`/`body` digitados manualmente.
- `SequenceStepDialog` exige redação manual; sem variáveis dinâmicas, sem geração assistida, sem ajuste de tom.
- Já existe Lovable AI Gateway disponível (`google/gemini-2.5-flash`) para geração sem API key extra.

### Mudanças

**1. Edge function `ai-email-composer` (verify_jwt = true)**
- Input: `{ contact_context: { name, company, role, industry, last_interaction }, goal: 'intro'|'follow_up'|'meeting'|'reactivation'|'breakup', tone: 'formal'|'casual'|'consultivo'|'direto', language: 'pt-BR'|'en', length: 'short'|'medium'|'long', custom_instructions?: string }`
- Chama `https://ai.gateway.lovable.dev/v1/chat/completions` com `google/gemini-2.5-flash`
- System prompt: especialista em copywriting B2B, PT-BR padrão, retorna JSON `{ subject, body, variables_used: string[] }`
- Suporta variáveis Liquid-like: `{{nome}}`, `{{empresa}}`, `{{cargo}}`, `{{ultima_interacao}}`
- Trata 429 (rate limit) e 402 (créditos) com mensagens claras
- Logs estruturados, CORS via `_shared/cors.ts`

**2. Hook `useAIEmailComposer.ts`**
- `useGenerateEmail()` mutation invocando a edge function
- Loading/error states, toast de feedback

**3. Componente `AIEmailComposerPanel.tsx`** (≤250L)
- Painel lateral expansível dentro do `SequenceStepDialog`
- Inputs: select de objetivo (5 opções), tom (4 opções), idioma, tamanho, textarea de instruções customizadas
- Botão "Gerar com IA" → preenche `subject` e `body` do passo
- Preview com highlight de variáveis detectadas
- Botão "Regenerar" + "Aceitar"
- Animação de skeleton durante geração

**4. Variable picker (`EmailVariablesHelper.tsx`)**
- Chips clicáveis abaixo do textarea de body para inserir `{{nome}}`, `{{empresa}}`, etc. no cursor
- Lista compacta das 6 variáveis padrão suportadas

**5. Integração no `SequenceStepDialog`**
- Quando `channel === "email" || channel === "linkedin"`: mostra botão "✨ Compor com IA" ao lado do textarea
- Abre o painel `AIEmailComposerPanel`
- Variáveis disponíveis no body via `EmailVariablesHelper`

**6. Resolução de variáveis no runner**
- Ajustar `sequence-runner` para fazer lookup do contato (lead/client) antes do dispatch e substituir `{{nome}}`, `{{empresa}}`, `{{cargo}}` no `subject`/`body` antes de registrar a execução
- Helper `resolveTemplateVariables()` no edge function

**7. Validação**
- Smoke test `ai-email-composer` via `curl_edge_functions` (3 tons, 2 objetivos)
- Criar passo de e-mail via UI e gerar conteúdo IA
- Verificar substituição de variáveis em uma execução manual do runner
- Console limpo, zero erros

### Arquivos
- Criar: `supabase/functions/ai-email-composer/index.ts`
- Criar: `src/hooks/sequences/useAIEmailComposer.ts`
- Criar: `src/components/sequences/AIEmailComposerPanel.tsx`, `EmailVariablesHelper.tsx`, `emailComposerHelpers.ts`
- Editar: `src/components/sequences/SequenceStepDialog.tsx`, `supabase/functions/sequence-runner/index.ts`, `supabase/config.toml` (registrar nova função)

Após esta, sigo automaticamente para 3/7 (A/B Testing de Steps).
