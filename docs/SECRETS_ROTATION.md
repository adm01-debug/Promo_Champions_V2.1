# Rotação de Secrets — Inventário e Política

> Criado na auditoria técnica de 2026-10 (item 16). Este documento é o
> inventário oficial de credenciais do Promo Champions V2.1: o que cada
> segredo autoriza, onde está armazenado, quem é o dono e quando foi girado
> pela última vez. **Atualize a coluna "Última rotação" a cada giro.**

## 1. Inventário

### 1.1 Supabase (projeto `usyxfpqlsspldubptrdl`)

| Secret                                           | Para que serve                                                | Onde está armazenado                                                                        | Dono            | Escopo        | Última rotação                                                |
| ------------------------------------------------ | ------------------------------------------------------------- | ------------------------------------------------------------------------------------------- | --------------- | ------------- | ------------------------------------------------------------- |
| `SUPABASE_SERVICE_ROLE_KEY`                      | Bypass total de RLS — edge functions admin                    | Supabase → Edge Functions → Secrets **e** GitHub → Settings → Secrets (CI: cron-monitoring) | Adm. do projeto | Produção + CI | **Pendente — chave atual inválida no CI (auditoria 2026-10)** |
| `VITE_SUPABASE_PUBLISHABLE_KEY` (anon)           | Chave pública do client + auth nos testes de integração       | GitHub → Settings → Secrets (CI) — no frontend é bundle público                             | Adm. do projeto | CI            | **Pendente — mesma rotação**                                  |
| `VITE_SUPABASE_URL` / `VITE_SUPABASE_PROJECT_ID` | Identifica o projeto (não é segredo real, mas trava os gates) | GitHub → Settings → Secrets                                                                 | Adm. do projeto | CI            | n/a                                                           |
| `SUPABASE_ACCESS_TOKEN`                          | CLI: `gen types` no job Supabase Types Drift                  | GitHub → Settings → Secrets                                                                 | Adm. do projeto | CI            | Desconhecida                                                  |

### 1.2 Integrações externas (Edge Function secrets)

| Secret                                                                                               | Para que serve                                          | Onde está armazenado                                      | Dono               | Escopo   | Última rotação      |
| ---------------------------------------------------------------------------------------------------- | ------------------------------------------------------- | --------------------------------------------------------- | ------------------ | -------- | ------------------- |
| `TWILIO_AUTH_TOKEN`                                                                                  | Assinatura de webhooks de voz (`verifyTwilioSignature`) | Supabase → Edge Functions → Secrets                       | Resp. telefonia    | Produção | Desconhecida        |
| `TWILIO_ACCOUNT_SID`                                                                                 | Conta Twilio                                            | Supabase → Edge Functions → Secrets                       | Resp. telefonia    | Produção | Desconhecida        |
| `ELEVENLABS_API_KEY`                                                                                 | STT/TTS/voice (11 functions)                            | Supabase → Edge Functions → Secrets                       | Resp. IA de voz    | Produção | Desconhecida        |
| `BITRIX24_CLIENT_ID` / `BITRIX24_CLIENT_SECRET`                                                      | OAuth + sync do CRM legado                              | Supabase → Edge Functions → Secrets                       | Resp. integrações  | Produção | Desconhecida        |
| `BITRIX24_DOMAIN`                                                                                    | Domínio da instância                                    | Supabase → Edge Functions → Secrets                       | Resp. integrações  | Produção | n/a (não é segredo) |
| `RESEND_API_KEY`                                                                                     | Email transacional (12 functions)                       | Supabase → Edge Functions → Secrets                       | Resp. email        | Produção | Desconhecida        |
| `RESEND_WEBHOOK_SECRET`                                                                              | Verificação Svix de webhooks Resend                     | Supabase → Edge Functions → Secrets                       | Resp. email        | Produção | Desconhecida        |
| `SENDGRID_WEBHOOK_PUBLIC_KEY` / `SENDGRID_WEBHOOK_VERIFICATION_KEY`                                  | Assinatura de webhooks SendGrid                         | Supabase → Edge Functions → Secrets                       | Resp. email        | Produção | Desconhecida        |
| `META_APP_SECRET` / `META_WEBHOOK_APP_SECRET`                                                        | Assinatura de webhooks Meta/WhatsApp                    | Supabase → Edge Functions → Secrets                       | Resp. multichannel | Produção | Desconhecida        |
| `META_WEBHOOK_VERIFY_TOKEN`                                                                          | Handshake do webhook Meta                               | Supabase → Edge Functions → Secrets + Meta App Dashboard  | Resp. multichannel | Produção | Desconhecida        |
| `MULTICHANNEL_WEBHOOK_SECRET`                                                                        | Auth do webhook de status multichannel                  | Supabase → Edge Functions → Secrets + provedor Evolution  | Resp. multichannel | Produção | Desconhecida        |
| `INBOUND_EMAIL_WEBHOOK_SECRET`                                                                       | Auth do webhook de email de entrada                     | Supabase → Edge Functions → Secrets + provedor de inbound | Resp. email        | Produção | Desconhecida        |
| `QUOTE_SYNC_WEBHOOK_SECRET` / `QUOTE_SYNC_API_KEY`                                                   | Webhooks de sincronização de cotações                   | Supabase → Edge Functions → Secrets + sistema emissor     | Resp. integrações  | Produção | Desconhecida        |
| `PROMOGIFTS_WEBHOOK_SECRET`                                                                          | Webhook Promogifts                                      | Supabase → Edge Functions → Secrets                       | Resp. integrações  | Produção | Desconhecida        |
| `VAPID_PUBLIC_KEY` / `VAPID_PRIVATE_KEY`                                                             | Web Push (VAPID)                                        | Supabase → Edge Functions → Secrets                       | Resp. notificações | Produção | Desconhecida        |
| `LOVABLE_API_KEY`                                                                                    | Gateway de IA Lovable (47 functions)                    | Supabase → Edge Functions → Secrets                       | Adm. do projeto    | Produção | Desconhecida        |
| `INTERCOM_ACCESS_TOKEN`, `ZENDESK_*`, `FRESHDESK_*`, `SLACK_WEBHOOK_URL`, `SLACK_DIGEST_WEBHOOK_URL` | Helpdesk e alertas                                      | Supabase → Edge Functions → Secrets                       | Resp. CS/ops       | Produção | Desconhecida        |

### 1.3 Segredos dentro do banco

| Secret                 | Para que serve                                                                                        | Onde está armazenado                          | Dono            | Escopo   | Última rotação |
| ---------------------- | ----------------------------------------------------------------------------------------------------- | --------------------------------------------- | --------------- | -------- | -------------- |
| `coaching_cron_secret` | Header `X-Cron-Secret` que autoriza chamadas do pg_cron às edge functions (`isAuthorizedCronRequest`) | Tabela `public._internal_secrets` (key/value) | Adm. do projeto | Produção | Desconhecida   |

> **Por que não migrar `coaching_cron_secret` para env de edge function:**
> quem envia o header é o pg_cron, que roda **dentro do Postgres** e não lê
> variáveis de ambiente do Deno — ele precisa buscar o segredo em alguma
> store acessível via SQL (a tabela `_internal_secrets`, ou futuramente o
> Supabase Vault). Migrar para env quebraria o lado emissor. A recomendação
> é manter em banco, garantir RLS/REVOKE na tabela e avaliar migração para
> `vault.secrets` (criptografia em repouso nativa) em vez de coluna texto.

### 1.4 Chaves de CI (GitHub → Settings → Secrets and variables → Actions)

| Secret                                                                            | Usado por                                                                | Última rotação                                                 |
| --------------------------------------------------------------------------------- | ------------------------------------------------------------------------ | -------------------------------------------------------------- |
| `VITE_SUPABASE_URL`, `VITE_SUPABASE_PUBLISHABLE_KEY`, `SUPABASE_SERVICE_ROLE_KEY` | pr-checks (e2e), quote-to-sale-e2e, cron-monitoring                      | **Pendente — inválidas ("Invalid API key") desde ≥2026-09-28** |
| `E2E_TEST_EMAIL`, `E2E_TEST_PASSWORD`                                             | Login da conta de teste Playwright                                       | **Pendente — mesma rotação**                                   |
| `VITE_SUPABASE_PROJECT_ID`                                                        | E2E quote-to-sale                                                        | n/a                                                            |
| `SUPABASE_ACCESS_TOKEN`                                                           | Types drift                                                              | Desconhecida                                                   |
| `SLACK_CI_WEBHOOK_URL`                                                            | Job `notify-failure` (pr-checks, cron-monitoring, qa-exhaustive, codeql) | **Pendente — ainda não criado**                                |

## 2. Política de rotação

| Classe                                                                                                                                    | Cadência       | Gatilho extra                                        |
| ----------------------------------------------------------------------------------------------------------------------------------------- | -------------- | ---------------------------------------------------- |
| `SUPABASE_SERVICE_ROLE_KEY`, `coaching_cron_secret`, `LOVABLE_API_KEY`                                                                    | **Trimestral** | Imediata pós-incidente ou saída de pessoa com acesso |
| Segredos de webhook (`TWILIO_AUTH_TOKEN`, `META_*`, `SENDGRID_*`, `RESEND_WEBHOOK_SECRET`, `MULTICHANNEL_*`, `INBOUND_*`, `QUOTE_SYNC_*`) | **Trimestral** | Imediata ao trocar de conta/app no provedor          |
| Chaves de CI (`E2E_TEST_*`, `SUPABASE_ACCESS_TOKEN`)                                                                                      | **Semestral**  | Imediata quando um run loga `Invalid API key`        |
| `VAPID_*`                                                                                                                                 | **Semestral**  | —                                                    |

Rotação pós-incidente é **sempre imediata**, independente da tabela.

## 3. Procedimento sem downtime

### 3.1 Edge Function secrets (Supabase)

1. Gere o novo valor no provedor (ou `openssl rand -hex 32` para segredos internos).
2. **Webhooks com assinatura** (Twilio/Meta/SendGrid/Resend): cadastre o novo
   segredo no provedor e atualize o secret no Supabase na mesma janela de
   manutenção — a verificação de assinatura rejeita o valor antigo assim que
   o provedor troca. Alguns provedores (Meta, SendGrid) aceitam dois segredos
   ativos durante a transição: prefira isso para janela de dupla validação.
3. Atualize em Supabase → Edge Functions → Secrets. A próxima invocação já
   usa o valor novo (sem redeploy).
4. Smoke test: invoque a function afetada ou aguarde o próximo webhook real.

### 3.2 `coaching_cron_secret` (janela de dupla validação)

O segredo é validado por igualdade exata — não há como aceitar dois valores
sem deploy. Procedimento:

1. Gere novo valor: `openssl rand -hex 32`.
2. Janela de baixo tráfego (madrugada BRT):
   a. `UPDATE public._internal_secrets SET value='<novo>' WHERE key='coaching_cron_secret';`
   b. Atualize o mesmo valor em todo pg_cron job que envia `X-Cron-Secret`
   (os jobs leem a própria tabela → o update já propaga).
3. Observe `cron-failure-alerter` no ciclo seguinte — um 401 em qualquer
   function indica um emissor que ficou com o valor antigo.
4. Registre a data na tabela §1.3.

### 3.3 Secrets do GitHub (CI)

1. Supabase → Project Settings → API → **Generate new API keys**
   (anon/publishable e service_role).
2. GitHub → repo → Settings → Secrets and variables → Actions → atualizar:
   `VITE_SUPABASE_PUBLISHABLE_KEY`, `SUPABASE_SERVICE_ROLE_KEY`,
   `E2E_TEST_EMAIL`, `E2E_TEST_PASSWORD` (se a senha da conta E2E mudar,
   atualize o usuário no Supabase Auth primeiro).
3. Valide com `workflow_dispatch` em `PR Checks` e `Cron Monitoring
Regression` — o step "Verificar validade das credenciais Supabase" falha
   (vermelho, não skip) se alguma chave estiver errada.
4. Registre a data na tabela §1.4.

### 3.4 `SLACK_CI_WEBHOOK_URL`

1. Slack → canal de CI → Apps → Incoming Webhooks → Add → copie a URL.
2. Salve como secret `SLACK_CI_WEBHOOK_URL` no GitHub.
3. Teste: dispare um `workflow_dispatch` e induza falha (ou use
   `curl -X POST -d '{"text":"teste"}' <url>` direto na URL).

## 4. Histórico de rotações

| Data | Secret | Motivo                                                                | Downtime |
| ---- | ------ | --------------------------------------------------------------------- | -------- |
| —    | —      | Nenhuma rotação registrada até a criação deste documento (2026-10-01) | —        |

> Critério de aceite da auditoria pendente: preencher a 1ª linha após a
> rotação dos secrets de CI Supabase/E2E (item 17), que exige acesso ao
> dashboard Supabase e ao GitHub — fora do alcance deste PR.
