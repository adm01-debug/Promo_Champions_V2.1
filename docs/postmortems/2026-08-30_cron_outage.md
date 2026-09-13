# Post-mortem — automação agendada parada (2026-08-30 → em curso)

**Severidade:** P1 (P0 se houvesse usuários; o sistema está em pré-lançamento — ver
`docs/estado/IDENTIDADE_BANCO_2026-09-13.md`).
**Detecção:** 2026-09-02, por auditoria manual — **não** por monitoramento.
**Status em 2026-09-13:** 12 jobs SQL com migration pronta (PR #144, aguardando
aplicação); 10 jobs HTTP e 3 jobs quebrados aguardando etapas 2, 10 e 29 do
plano de 50 etapas.
**Sem culpados nominais.** Este documento aponta lacunas de sistema.

## Linha do tempo (UTC)

| Quando               | O quê                                                                                                                                                                                                                       | Fonte                    |
| -------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ------------------------ |
| 2026-05-18           | Primeiras execuções de cron no banco `usyxfpqlsspldubptrdl`                                                                                                                                                                 | `cron.job_run_details`   |
| 2026-07-06 → 07-26   | 25 jobs no total; 10 deles `net.http_post` para `rapjswienfhkobhlamxb.supabase.co` (projeto antigo)                                                                                                                         | idem, `command`          |
| até 2026-08-30       | jobid 11 falha 49/49 (coluna ambígua); jobid 20 falha 84% (violação de unique); jobid 2 falha 10/15 (função inexistente). Alertas gravados em `cron_failure_alerts` (2.163 linhas), **sem escalação**                       | idem                     |
| **2026-08-30 14:44** | Última execução de qualquer job. `cron.job` esvaziado — desagendamento manual, sem registro                                                                                                                                 | idem                     |
| 2026-08-31           | Migrations `…163000_secure_churn_and_task_crons` e `…170000_secure_operational_edge_crons` commitadas: reagendam 7 dos 25 jobs com segredos em `_internal_secrets`. **Nunca aplicadas** (ledger parado em `20260802150910`) | git, `schema_migrations` |
| 2026-09-02           | Auditoria encontra `cron.job = 0`                                                                                                                                                                                           | relatório de auditoria   |
| 2026-09-03           | PR #103 adiciona `…000002_fix_cron_project_ref` (`UPDATE cron.job … replace(ref antigo)`) — tabela já vazia; não aplicada                                                                                                   | git                      |
| 2026-09-10           | PR #126 reconcilia 6 jobs via `trigger_internal_edge_job` — exige chaves ausentes em `_internal_secrets` e functions republicadas; em hold                                                                                  | git                      |
| 2026-09-13           | Identidade provada; catálogo dos 25 jobs reconstruído do histórico; PR #144 com os 12 SQL                                                                                                                                   | este documento           |

## Impacto

- **Em `usyxfpqlsspldubptrdl` (canônico):** 12 jobs de manutenção parados — retenção
  de telemetria, purga de dedupe/logs, snapshots de rollback (última em 30/08),
  detecção de slow query, reset semanal de liga. Tabelas de telemetria crescem
  sem poda; não há snapshot de rollback recente.
- **Jobs HTTP:** chamavam functions do projeto **antigo** (`rapjs`), que operavam no
  banco antigo. Para o canônico, esses jobs nunca produziram efeito — a "parada"
  não removeu nada que ele tivesse. Isso é um achado próprio (§ causa 4).
- **Usuários:** nenhum. 2 contas em `auth.users`, último login real em 2026-07-23;
  100% do tráfego dos últimos 14 dias é o E2E do CI.

## Causas-raiz

1. **Desagendamento manual sem trilha.** Nenhuma migration jamais desagendou tudo;
   alguém executou `cron.unschedule` (ou equivalente) diretamente. A regra 1 do
   `CLAUDE.md` da época instruía DDL direto via MCP — o incidente é o custo dessa
   regra.
2. **Reagendamento vivia só no Git.** As migrations de 31/08 estavam corretas e
   nunca chegaram ao banco: não há pipeline (`deploy-db`, etapa 13), o ledger
   não é fonte de verdade (etapa 12), e "mesclado" foi tratado como "aplicado".
3. **Alarme circular.** `cron-failure-alerter` era um cron job. Sem agendador,
   sem alarme. 14 dias de silêncio.
4. **Cruzamento entre projetos.** O banco novo herdou comandos com URL e JWT do
   projeto antigo. Automação "funcionando" por meses agia no banco errado. Três
   projetos Supabase coexistiam sem que nenhum documento mapeasse quem era quem.
5. **Documentos afirmando estado não verificado.** Ao menos três (hardening de
   31/08, nota de 02/09 no `CLAUDE.md`, migration de 03/09 sobre tabela `leads`
   inexistente) descreveram um banco que não corresponde ao real, e sessões
   seguintes construíram sobre eles.

## O que funcionou

- `cron.job_run_details` preservou 140.713 execuções com `command` — o catálogo
  inteiro foi reconstruível sem depender de memória ou documento.
- A auditoria de 02/09 detectou o problema em 3 dias; sem ela, a descoberta
  dependeria de alguém notar tabelas crescendo.
- `_internal_secrets`, `trigger_*` e o padrão `X-Cron-Secret` (PRs #84/#85/#126)
  são o desenho certo — só nunca foram publicados.

## O que não funcionou

- Monitoramento dentro do sistema monitorado.
- Ausência de "definition of done" com evidência viva (corrigido: template de PR
  em #137, regra 0 do plano).
- Falta de verificação de identidade antes de qualquer escrita (corrigido: PR #146).

## Ações

| #   | Ação                                                                                                                                                            | Etapa do plano | Estado                                                                                              |
| --- | --------------------------------------------------------------------------------------------------------------------------------------------------------------- | -------------- | --------------------------------------------------------------------------------------------------- |
| 1   | Restaurar 12 jobs SQL                                                                                                                                           | 7 (parte 1)    | PR #144 — **aplicar no SQL Editor de usyxf e colar evidência**                                      |
| 2   | Heartbeat de cron fora do banco (GitHub Actions, 15 min)                                                                                                        | 9              | pendente — exige `SUPABASE_DB_URL` read-only como secret                                            |
| 3   | Token de Management API para usyxf                                                                                                                              | 2              | **bloqueia 10, 7-parte-2, 13, 14** — ação do operador                                               |
| 4   | Publicar as 170 functions em usyxf                                                                                                                              | 10             | após 3                                                                                              |
| 5   | Reagendar 10 jobs HTTP apontando para usyxf, via `trigger_internal_edge_job`, com `functions_base_url` + `anon_key` em `_internal_secrets` (ou Vault, etapa 21) | 7 (parte 2)    | após 4                                                                                              |
| 6   | Corrigir jobs 2, 11, 20 (função ausente, coluna ambígua, `ON CONFLICT DO NOTHING`)                                                                              | 29             | migrations existem no repo (`20260831130000-2`), nunca aplicadas — revalidar e aplicar via pipeline |
| 7   | Corrigir 4 funções SQL com ref antigo (`broadcast_sale_completed` etc.)                                                                                         | 7              | após 5                                                                                              |
| 8   | `deploy-db` com approval; revogar DDL manual                                                                                                                    | 13, 16         | pendente                                                                                            |
| 9   | Snapshot vivo semanal por script                                                                                                                                | 3              | pendente                                                                                            |

## Como saber que fechou

`SELECT count(*) FROM cron.job WHERE active` = 25 (ou o número do catálogo
revisado), zero `command` contendo `rapjswienfhkobhlamxb`, taxa de falha < 1% em
7 dias, e um alerta de teste chegando a um humano em ≤ 15 min com o agendador
desligado em staging.
