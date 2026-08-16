# Lote 13 — Integrações Externas

> Auditoria de estado. Autor: sessão de auditoria (lote próprio, não delegado).
> Método: código lido diretamente + consulta ao banco de produção `rapjswienfhkobhlamxb` (somente `SELECT`).
> Data da medição: 2026-08-16.

---

## Veredito do lote

**Nenhuma integração externa está configurada em produção.** As 18 tabelas que
sustentam integrações, credenciais de canal e webhooks têm **exatamente 0 linhas**. O código
existe, em vários casos é sólido e completo, mas **nenhum fio chega até um terceiro real**.

Contagem do lote: **0 ✅ / 11 🟨 / 5 🟦 / 0 ⬛** de 16 integrações identificadas.

---

## Evidência de runtime — a base de todas as classificações abaixo

`VERIFICADO` em 2026-08-16 via `SELECT count(*)`:

| Tabela | Linhas | Significado |
|---|---:|---|
| `integration_connections` | **0** | nenhuma conexão de terceiro cadastrada |
| `channel_credentials` | **0** | nenhuma credencial de canal (Twilio/Meta/Z-API/MessageBird) |
| `channel_interactions` | **0** | nenhuma mensagem multicanal enviada ou recebida |
| `twilio_call_sessions` | **0** | nenhuma ligação realizada |
| `bitrix24_sync_logs` | **0** | Bitrix24 nunca sincronizou |
| `integration_health_checks` | **0** | health check nunca executou |
| `integration_logs` | **0** | nenhum log de integração |
| `integration_autotest_jobs` | **0** | autoteste de integração nunca rodou |
| `webhooks` | **0** | nenhum webhook de saída cadastrado |
| `webhook_events` | **0** | nenhum evento gerado |
| `webhook_deliveries` | **0** | nenhuma entrega tentada |
| `webhook_logs` | **0** | — |
| `webhook_inbound_log` | **0** | nenhum webhook recebido |
| `winloss_webhook_subscriptions` | **0** | nenhuma assinatura |
| `winloss_webhook_deliveries` | **0** | nenhuma entrega |
| `winloss_webhook_dead_letters` | **0** | — |
| `winloss_webhook_dispatch_metrics` | **0** | — |
| `webauthn_credentials` | **0** | nenhuma chave de segurança registrada |
| `push_subscriptions` | **0** | nenhum dispositivo inscrito em push |
| `quote_sync_inbound_log` | **1** | **único sinal de tráfego externo de todo o sistema** |

Complementos `VERIFICADO`:

- `net._http_response`: **12 respostas HTTP** em todo o histórico do `pg_net`. O banco
  praticamente não fala com o mundo externo.
- `vault.secrets`: **0 segredos**.
  **Ressalva honesta:** isto **não prova** que os segredos das Edge Functions estão ausentes —
  o Supabase guarda segredos de Edge Function em um cofre distinto do `vault` do Postgres, ao
  qual esta auditoria **não tem acesso**. O estado dos segredos de Edge Function é
  **`NAO_VERIFICADO`**. O que está provado é que o `vault` do banco está vazio.
- `auth.users`: **2 usuários**.

---

## Tabela de estado por integração

| # | Integração | Onde está no código | Estado no banco | Classificação | O que falta |
|---|---|---|---|---|---|
| 1 | **Twilio — voz (click-to-call)** | `supabase/functions/twilio-click-to-call/index.ts:98` (chama `api.twilio.com/2010-04-01/Accounts/{sid}/Calls.json`); `twilio-call-twiml/index.ts:11`; `twilio-call-status/index.ts:27`; UI em `src/components/dialer/ClickToCallButton.tsx`; hook `src/hooks/dialer/useClickToCall.ts` | `twilio_call_sessions` = **0** | 🟨 | Credencial. O código lê o SID/token de `integration_connections` (`twilio-click-to-call/index.ts:54`, `.eq('provider','twilio')`), tabela vazia → a função retorna erro antes de chamar a Twilio. Fio completo, nunca executado. |
| 2 | **Twilio / Meta Cloud / Z-API / MessageBird — WhatsApp e SMS** | Catálogo declarado em `src/components/multichannel/multichannelHelpers.ts:9-15` (4 provedores) e schema de campos em `:46+`; envio em `supabase/functions/send-multichannel-message/`; status em `multichannel-status-webhook/` | `channel_credentials` = **0**, `channel_interactions` = **0** | 🟨 | Nenhum provedor conectado. UI de conexão existe (`ProviderConnectionDialog.tsx`); ninguém a usou. |
| 3 | **Bitrix24 (CRM)** | `supabase/functions/bitrix24-oauth/`, `bitrix24-sync/`; UI `src/pages/Bitrix24.tsx`, `src/components/admin/connections/Bitrix24Tab.tsx`, `src/components/bitrix/BitrixSyncHistory.tsx`; hook `src/hooks/useBitrix24.ts` | `bitrix24_sync_logs` = **0** | 🟨 | Depende de `BITRIX24_DOMAIN`, `BITRIX24_CLIENT_ID`, `BITRIX24_CLIENT_SECRET` (3 vars). Nunca sincronizou. |
| 4 | **Helpdesk — Zendesk** | `supabase/functions/helpdesk-sync/index.ts:16` (`{domain}.zendesk.com/api/v2/tickets/recent.json`); lê `ZENDESK_DOMAIN`, `ZENDESK_EMAIL`, `ZENDESK_API_TOKEN`; UI `src/components/customer-success/HelpdeskConnectorPanel.tsx` | `integration_connections` = **0** | 🟨 | Nunca conectado. |
| 5 | **Helpdesk — Intercom** | `supabase/functions/helpdesk-sync/index.ts:33` (`api.intercom.io/conversations`); lê `INTERCOM_ACCESS_TOKEN` | idem | 🟨 | Nunca conectado. |
| 6 | **Helpdesk — Freshdesk** | `supabase/functions/helpdesk-sync/index.ts:52` (`{domain}.freshdesk.com/api/v2/tickets`); lê `FRESHDESK_DOMAIN`, `FRESHDESK_API_KEY` | idem | 🟨 | Nunca conectado. |
| 7 | **Resend (e-mail transacional e em massa)** | `RESEND_API_KEY` lido em **10 pontos** das Edge Functions; `email-bulk-send/`, `email-bulk-retry/`, `send-churn-alert-email/`, `send-password-reset/`, `process-scheduled-sends/` | `notifications` = 6; tabelas de campanha vazias | 🟨 | Provedor real e código completo, mas sem evidência de envio. Depende também de `BULK_EMAIL_FROM`. |
| 8 | **ElevenLabs (voz / STT / TTS)** | `elevenlabs-stt/`, `elevenlabs-tts/`, `elevenlabs-voice/`; lê `ELEVENLABS_API_KEY` (3 pontos); hook `src/hooks/useElevenLabsVoice.ts` | sem tabela de sessão populada | 🟨 | Nenhuma transcrição/áudio processado. |
| 9 | **Lovable AI Gateway (motor de IA do sistema)** | `LOVABLE_API_KEY` lido em **47 pontos** — é o provedor de IA de fato do sistema, não OpenAI/Anthropic diretos | ver Lote 06 | 🟨 | É a dependência de IA mais difundida do repositório. Estado do segredo `NAO_VERIFICADO`. |
| 10 | **Slack (alertas operacionais)** | `SLACK_WEBHOOK_URL` em `wal-health-alert/`, `edge-retry-threshold-alert/`, `notify-quote-conversion/`; `SLACK_DIGEST_WEBHOOK_URL` em `deal-risk-digest/` | — | 🟨 | 4 alertas dependem de webhook Slack não comprovadamente configurado. Se o webhook não existir, **os alertas falham em silêncio** — padrão clássico de falha invisível. |
| 11 | **Web Push (VAPID)** | `push-subscribe/index.ts:32` lê `VAPID_PUBLIC_KEY`; `send-push-notification/index.ts` com checagem de escopo por `user_id` (`:111-116`) | `push_subscriptions` = **0** | 🟨 | Nenhum dispositivo inscrito. Boa notícia: a proteção anti-*push-phishing* está implementada (`:53-54`). |
| 12 | **V4 / PromoGifts — sincronização de orçamentos (entrada)** | `receive-quote-sync/index.ts:99` (`QUOTE_SYNC_WEBHOOK_SECRET`) e `:230` (`PROMOGIFTS_WEBHOOK_SECRET`); `receive-quote-webhook/index.ts:93` (`QUOTE_SYNC_API_KEY`) | `quote_sync_inbound_log` = **1** | 🟨 | **Única integração com qualquer sinal de tráfego real** (1 registro). Publicamente exposta: `verify_jwt = false` em `supabase/config.toml` — mitigada por segredo compartilhado validado no código (`:99-104`), o que é aceitável. |
| 13 | **V4 — callback de status (saída)** | `notify-v4-quote-status/index.ts:7-10`, com `throw` no *top-level* se `V4_CALLBACK_URL`/`V4_CALLBACK_API_KEY` faltarem | — | 🟨 | ⚠️ **Risco:** o `throw` está fora do handler (`:9-10`). Sem os segredos, a função **falha ao inicializar**, não apenas ao ser chamada. |
| 14 | **Ponte para banco externo** | `external-db-bridge/index.ts:149-150` lê `EXTERNAL_SUPABASE_URL` e `EXTERNAL_SUPABASE_ANON_KEY` | — | 🟦 | Ponte genérica para um segundo Supabase; sem consumidor comprovado. |
| 15 | **Webhooks de saída (genéricos)** | `dispatch-webhook/`; tabelas `webhooks`, `webhook_events`, `webhook_deliveries` | todas = **0** | 🟦 | Infraestrutura montada, nenhuma assinatura cadastrada. |
| 16 | **Webhooks Win/Loss (observabilidade dedicada)** | 6 Edge Functions (`winloss-webhook-dispatcher`, `-health-monitor`, `-replay`, `-replay-batch`, `-timeline`) + 7 tabelas + doc próprio em `.lovable/memory/features/winloss-webhook-observability.md` | **7 de 7 tabelas = 0** | 🟦 | Subsistema completo — *dispatcher*, *dead-letter*, *replay*, métricas, alertas — **com zero assinantes e zero entregas**. É o exemplo mais caro de infraestrutura dormente do repositório. |

---

## Integrações mencionadas em documentação/configuração mas **inexistentes no código**

Verificado por busca no repositório inteiro:

| Mencionada em | Item | Situação real |
|---|---|---|
| `.env.example:31` | `VITE_SENTRY_DSN` (Sentry) | Nenhuma dependência Sentry em `package.json`; nenhum `import` no código. **🟦 apenas sugerido.** |
| `.env.example:34-35` | `VITE_POSTHOG_KEY` / `VITE_POSTHOG_HOST` | Nenhuma dependência PostHog. **🟦 apenas sugerido.** |
| `.env.example:22-24` | `VITE_FEATURE_AI_COACHING`, `VITE_FEATURE_GAMIFICATION`, `VITE_FEATURE_ANALYTICS` | Flags de build sugeridas; o sistema usa *feature flags* em banco (ver Lote 08). **🟦 sugerido.** |
| `.env.example:44` | `VITE_USE_MOCK_DATA` | **🟦 sugerido**; não implementado. |

Observação relevante: **não há OpenAI nem Anthropic como provedor direto**. Toda a IA passa
pelo `LOVABLE_API_KEY`. Qualquer documento que afirme integração direta com OpenAI está errado.

---

## Riscos ordenados por gravidade

1. **Alertas que falham em silêncio.** 4 Edge Functions dependem de webhook Slack. Se o
   segredo não estiver configurado, ninguém é avisado — inclusive `wal-health-alert`, que
   monitora a saúde do WAL do banco. Alerta que não alerta é pior que alerta ausente, porque
   gera falsa sensação de cobertura.
2. **`notify-v4-quote-status` quebra na inicialização** sem segredos (`index.ts:9-10`, `throw`
   no escopo de módulo). Falha diferente — e mais difícil de diagnosticar — de um erro de
   execução.
3. **Superfície de integração muito acima do uso.** 16 integrações codificadas, 1 com sinal de
   tráfego. Cada uma é código a manter, atualizar e proteger sem retorno.

## O que este lote **não** cobriu

- Segredos de Edge Function: **`NAO_VERIFICADO`** (cofre inacessível a esta auditoria).
- Logs de execução das Edge Functions: **`NAO_VERIFICADO`** (sem acesso).
- Nenhuma chamada real a terceiro foi disparada para testar conectividade — seria alteração de
  estado externo, proibida pelos guard-rails.
