# Runbook — Twilio Voz/Dialer (twilio-call-twiml, twilio-call-status, twilio-click-to-call)

## O que faz

- `twilio-call-twiml`: gera o TwiML de resposta para chamadas iniciadas pelo
  click-to-call (rate limit 240/min, allowlist de prefixos).
- `twilio-call-status`: webhook de status callbacks da Twilio — atualiza o
  estado da chamada e encadeia gravação/ingest (`process-call-recording-ingest`).
- `twilio-click-to-call`: inicia chamada via API REST da Twilio usando as
  credenciais do tenant.

## Configuração

| Item | Onde |
|------|------|
| `TWILIO_AUTH_TOKEN` (verificação de assinatura global) | Secret das edge functions |
| `TWILIO_TWIML_URL`, `TWILIO_CALL_STATUS_URL` | Secrets — URLs públicas que a Twilio deve chamar |
| `TWILIO_ALLOWED_DIAL_PREFIXES` | Secret — prefixos autorizados a discar |
| Credenciais por tenant (Account SID/token) | Tabela de credenciais de provider (ver `/admin/conexoes`) |

## Sinais de falha

- Click-to-call falha com `401`/assinatura → `TWILIO_AUTH_TOKEN` divergente
  do token real da conta.
- Chamadas disparam mas nunca atualizam status → status callback
  (`TWILIO_CALL_STATUS_URL`) inacessível/URL errada.
- `twilio-call-twiml` respondendo 429 (rate limit) ou 403 (prefixo não
  permitido).
- Chamadas sem gravação/transcrição → falha no `process-call-recording-ingest`
  ou no pipeline de análise (`transcribe-call-recording`, `diarize-call-recording`).

## Onde olhar

1. Twilio Console → Monitor → Logs de chamada/erros (mostra resposta do
   webhook: 4xx/5xx, timeouts).
2. Supabase → Edge Functions → Logs das três functions.
3. `call_recordings`/`calls` — a chamada foi registrada? status travado?
4. `/admin/platform-slo` — SLO de webhooks caindo.

## Mitigação / rollback

- **Assinatura inválida (401 em massa)**: confirmar `TWILIO_AUTH_TOKEN` =
  Auth Token atual da conta no Twilio Console; corrigir secret e não
  publicar `verify_jwt=false` sem a verificação no handler.
- **Webhook de status indisponível**: Twilio Console → Phone Numbers →
  reconfigurar Status Callback URL; enquanto indisponível, chamadas
  funcionam mas sem atualização de status/encadeamento.
- **Prefixos bloqueados**: atualizar `TWILIO_ALLOWED_DIAL_PREFIXES` (ou o
  allowlist do tenant) — não remover a restrição para "resolver".
- **Pipeline de gravação parado**: re-executar `process-call-recording-ingest`
  para as chamadas afetadas; checar credenciais de IA (`LOVABLE_API_KEY`)
  para transcrição/diarização.
- **Rollback**: redeploy da function anterior via git.
