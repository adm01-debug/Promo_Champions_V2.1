# Runbook — Bitrix24 (bitrix24-oauth, bitrix24-sync)

## O que faz

- `bitrix24-oauth`: fluxo OAuth — troca `code` por tokens e grava em
  `portfolio_settings` (`setting_key='bitrix24_access_token'` etc.).
- `bitrix24-sync`: sincronização de clientes/deals entre o Bitrix24 e as
  tabelas internas (`icp_data`/`clients`/`sales`), registrando cada execução
  em `bitrix24_sync_logs`.

## Configuração

| Item | Onde |
|------|------|
| `BITRIX24_DOMAIN`, `BITRIX24_CLIENT_ID`, `BITRIX24_CLIENT_SECRET` | Secrets das edge functions (Supabase) |
| Token de acesso persistido | `portfolio_settings` (`setting_key='bitrix24_access_token'`) |
| UI de conexão | `/admin/conexoes` |
| Log de execuções | tabela `bitrix24_sync_logs` |

## Sinais de falha

- Sincronizações param de aparecer em `bitrix24_sync_logs` (última execução
  velha).
- Erros `401`/token expirado nos logs da function `bitrix24-sync`
  (Supabase → Edge Functions → Logs).
- Registros novos no Bitrix24 não aparecem no CRM (e vice-versa).

## Onde olhar

1. `/admin/conexoes` — estado da conexão e último teste.
2. `bitrix24_sync_logs` — última execução, contagem e erros.
3. Logs da function no dashboard Supabase.
4. `portfolio_settings` — se `bitrix24_access_token` existe e não expirou.

## Mitigação / rollback

- **Token expirado**: refazer o fluxo OAuth em `/admin/conexoes` (chama
  `bitrix24-oauth` e regrava o token). Se `CLIENT_ID`/`CLIENT_SECRET`
  mudaram no Bitrix, atualizar os secrets da function antes.
- **Bitrix fora do ar / 429**: o sync falha e registra em
  `bitrix24_sync_logs`; quando o Bitrix voltar, re-executar a
  sincronização (re-push) — não há fila persistente além do log.
- **Dados divergentes**: identificar a janela de falha pelo
  `bitrix24_sync_logs` e re-sincronizar o período; em divergência de
  cadastro, o CRM interno é a fonte de verdade para vendas.
- **Rollback de código**: redeploy da versão anterior da function a partir
  do git (ver `docs/DEPLOYMENT.md` §4).
