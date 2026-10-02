# FAQ — Troubleshooting de integrações externas

> Sintoma → causa provável → onde olhar → mitigação rápida. Detalhes por
> integração nos runbooks de `docs/runbooks/`.

## Twilio (voz/dialer)

| Sintoma | Provável causa | Onde olhar |
|---------|----------------|------------|
| Click-to-call falha com 401 | `TWILIO_AUTH_TOKEN` divergente | Twilio Console → Auth Token vs secret da function |
| Chamada não atualiza status | Status callback URL errada | `TWILIO_CALL_STATUS_URL`; Twilio Console → Monitor |
| 403 na discagem | Prefixo fora do allowlist | `TWILIO_ALLOWED_DIAL_PREFIXES` |
| Sem gravação/transcrição | Pipeline `process-call-recording-ingest`/`transcribe-call-recording` ou `LOVABLE_API_KEY` | Logs das functions; `call_recordings` |

## WhatsApp / Multichannel (Meta Cloud, Twilio, Z-API)

| Sintoma | Provável causa | Onde olhar |
|---------|----------------|------------|
| `invalid_provider_credentials` (502) | Token Meta/Twilio/Z-API expirado | `/admin/conexoes` → testar credencial |
| Status nunca vira "delivered" | `multichannel-status-webhook` não registrado ou assinatura | Painel do provider; `/admin/webhooks-timeline` |
| Meta rejeita mensagem | Fora da janela 24h / template não aprovado | Meta Business → WhatsApp templates |

## Bitrix24

| Sintoma | Provável causa | Onde olhar |
|---------|----------------|------------|
| Sync não roda | Token OAuth expirado | `portfolio_settings` (`bitrix24_access_token`); refazer OAuth em `/admin/conexoes` |
| Dados divergentes | Janela de falha entre syncs | `bitrix24_sync_logs` — última execução OK |

## Email (Resend / SendGrid)

| Sintoma | Provável causa | Onde olhar |
|---------|----------------|------------|
| `email_infra_missing`/`needsEmailSetup` | Infra de fila (`enqueue_email`) indisponível | Logs `email-bulk-send`; `email_bulk_jobs` |
| `sender_not_configured` | Sem `BULK_EMAIL_FROM`/`email_from` | Secrets; `churn_alert_settings` |
| Emails não chegam | Domínio não verificado / bounce | Resend → Domains + Logs |
| Inbound não processa | Assinatura Svix/SendGrid falha | Logs `inbound-email-webhook` |

## ElevenLabs (voz da assistente)

| Sintoma | Provável causa | Onde olhar |
|---------|----------------|------------|
| "API key not configured" | `ELEVENLABS_API_KEY` ausente | Secrets da function |
| Erro de quota | Plano/cota ElevenLabs estourada | ElevenLabs → Usage |
| 404 na function | `elevenlabs-stt` não deployada | `curl` no endpoint; runbook elevenlabs |

## N8N

| Sintoma | Provável causa | Onde olhar |
|---------|----------------|------------|
| Teste de conexão falha | `base_url`/`api_key` errado ou instância fora | `/admin/conexoes` → `test-integration-connection` (`/healthz`) |
| Workflow não dispara | Webhook de origem no n8n falhando | Execuções do workflow no n8n |

## Supabase / plataforma

| Sintoma | Provável causa | Onde olhar |
|---------|----------------|------------|
| 401 em chamadas autenticadas | Sessão expirada / anon key errada | `VITE_SUPABASE_PUBLISHABLE_KEY` (Lovable) vs `.env` local |
| 404 em edge function | Function não deployada | `curl -i` no endpoint → runbook da integração |
| Tudo lento/timeout | Pooler saturado / query pesada | Supabase → Database → Query performance |
| App publicado fala com banco errado | Integração Lovable→Supabase apontando pro projeto antigo | `docs/estado/IDENTIDADE_BANCO_2026-09-13.md` |

## Regra geral

1. Primeiro o log da function (Supabase → Edge Functions → Logs) — erros
   de provider trazem o motivo real.
2. Depois o painel do provider (Twilio Monitor, Meta, Resend, ElevenLabs)
   — lá está o código de erro definitivo.
3. Recém-deploy? Confirmar que a function existe (`curl` no endpoint)
   antes de depurar lógica — ver `docs/DEPLOYMENT.md` §4.
