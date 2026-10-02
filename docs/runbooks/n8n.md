# Runbook — N8N (automações externas)

## O que faz

Não existe edge function dedicada "n8n". A integração é uma **conexão
configurável** em `/admin/conexoes` (aba N8N), persistida em
`integration_connections` com `kind='n8n'` (`base_url` + `api_key`), e
testada pela function `test-integration-connection`, que faz `GET
{base_url}/healthz` com header `X-N8N-API-KEY`. Fallback: env
`N8N_API_KEY` quando a conexão não traz `api_key`.

Automações N8N chamam o produto via webhooks públicos das edge functions
(ex.: `receive-quote-sync`, `multichannel-status-webhook`) — cada um com
sua própria verificação de assinatura.

## Configuração

| Item                                    | Onde                                                           |
| --------------------------------------- | -------------------------------------------------------------- |
| `base_url` + `api_key` da instância n8n | `/admin/conexoes` → `integration_connections` (`kind='n8n'`)   |
| `N8N_API_KEY` (fallback)                | Secret das edge functions                                      |
| Webhooks N8N → produto                  | URLs das functions `verify_jwt=false` + segredo correspondente |

## Sinais de falha

- Teste de conexão falha em `/admin/conexoes` → `base_url` errado,
  `healthz` indisponível ou API key revogada.
- Workflows N8N param de disparar eventos no produto → webhook de origem
  falhando (assinatura, URL, function fora do ar).

## Onde olhar

1. `/admin/conexoes` → testar conexão novamente (`test-integration-connection`
   mostra o erro do `healthz`).
2. Logs do n8n (Execuções do workflow) — o workflow rodou? qual node falhou?
3. Supabase → Edge Functions → Logs da function receptora do webhook.
4. `/admin/webhooks-timeline` / `/admin/webhooks-dead-letters` — entregas
   recebidas/falhas.

## Mitigação / rollback

- **healthz falhando**: confirmar `base_url` (sem path extra), API key com
  escopo correto e que a instância n8n está no ar; recriar a conexão.
- **Webhook N8N → produto falhando**: o fix é no workflow do n8n (URL,
  headers de assinatura) — corrigir lá e re-executar a execução falha.
- **Rollback**: não há deploy próprio; rollbacks de configuração são em
  `/admin/conexoes` (regravar credenciais anteriores).
