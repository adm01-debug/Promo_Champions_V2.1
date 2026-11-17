# Veredicto das branches vivas — 2026-11-17

Objetivo: nenhuma branch é fechada sem prova de que todo byte de trabalho que ela
contém já está na `main` ou é obsoleto por decisão registrada. Medido com
`git rev-list --count`, `git merge-base --is-ancestor`, `git ls-tree` e comparação de
blob (SHA do conteúdo), contra `origin/main` em `da0c2a116`.

## As 9 branches remotas (fora da `main`)

| branch                                                           | commits à frente da main  | arquivos só dela                 | veredicto                                                                                                                                                                                                                                                                 |
| ---------------------------------------------------------------- | ------------------------- | -------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `computador_local`                                               | **0**                     | 0                                | **INCORPORADA** — `git merge-base --is-ancestor` confirma que todo commit dela está na `main`. Zero bytes únicos. Pode ser apagada.                                                                                                                                       |
| `automation/types-sync`                                          | 1                         | **0**                            | **INCORPORADA** — o commit único é um sync de `types.ts`, e o blob de `src/integrations/supabase/types.ts` é **idêntico** ao da `main` (`c9b2d8c884217dd687f72b316953a50263f6571a` nas duas). Branch de trabalho do `types-sync.yml`: **não apagar**, o workflow a reusa. |
| `automation/inventario-estado`                                   | 12 769 (história própria) | **2**                            | **OBSOLETA por decisão registrada** — ver abaixo. Branch de trabalho do `inventario-estado-semanal.yml`: **não apagar**.                                                                                                                                                  |
| `contexto`                                                       | 222                       | 1 154, todos em `docs/contexto/` | **EM USO, não apagar** — contexto gerado pelo `contexto.yml`; AGENTS.md §8 proíbe abrir PR dela. Nada a recuperar: é saída de gerador.                                                                                                                                    |
| `release-please--branches--main--components--promo-champions-v2` | 1                         | 0                                | **DE OUTRO AGENTE/BOT** (PR #485, release 1.5.0). Somente leitura por AGENTS.md §5.2.                                                                                                                                                                                     |
| `claude/fix-auditoria-webhooks-261117-1355`                      | 1                         | 1                                | PR #551 **aberta aguardando o dono** (DDL em produção, §5.8).                                                                                                                                                                                                             |
| `claude/fix-403-webhooks-rls-261117-1425`                        | 1                         | 1                                | PR #552 **aberta aguardando o dono** (DDL em produção).                                                                                                                                                                                                                   |
| `claude/fix-500-cadencias-261117-1529`                           | 1                         | 1                                | PR #553 **aberta aguardando o dono** (DDL em produção).                                                                                                                                                                                                                   |
| `claude/fix-403-error-logs-261117-1536`                          | 1                         | 1                                | PR #554 **aberta aguardando o dono** (DDL em produção).                                                                                                                                                                                                                   |

## Os 2 únicos arquivos que existem numa branch e não na `main`

`automation/inventario-estado` é um retrato semanal do repo (último commit
`660347cb5 chore: inventario do estado real [auto]`, 2026-11-12), não uma branch de
feature. Os dois arquivos que ela tem e a `main` não:

| arquivo                                               | por que não está na `main`                                                                                    |
| ----------------------------------------------------- | ------------------------------------------------------------------------------------------------------------- |
| `src/components/clients/Client360PredictiveCards.tsx` | removido pela PR mergeada `0915aab85` — **"fix: remove ações e previsões falsas do Cliente 360 (#441)"**      |
| `src/components/analytics/ABCMatrixShift.tsx`         | removido pela PR mergeada `64382cb94` — **"fix: remover dados e automações fictícios da análise ABC (#446)"** |

Conferido no conteúdo, não só no título do commit: nenhum dos dois tem fonte de dado
(zero `import` de `supabase` e zero hook `useXxx`); o primeiro renderiza previsão
preditiva com valor fixo no JSX e o segundo recebe `shifts` por prop, mas a `main`
não tem nada que produza esse dado (`grep -n "shift" src/hooks/bi/useABCAnalysis.ts`
não acha nada). São telas de dado fictício que o projeto decidiu remover — e remover
dado falso é melhoria, não perda. **Nada a recuperar.**

## Achado do caminho de engajamento (trabalho completo que nunca foi ligado)

Rastreando a edge function `engagement-score-recompute`, que está **deployada em
produção e sem nenhum chamador** (nenhum `invoke` em `src/`, nenhum dos 45 cron jobs,
nenhuma referência em workflow):

```
sinal:     multichannel-status-webhook (deployada)  ─┐
           sequence-record-reply      (NÃO deployada) ┴→ record_engagement_signal()
perfil:    contact_send_time_profile                    → 0 linhas em produção
recálculo: bulk_recompute_engagement(_owner_id)          → só alcançável pela edge
                                                            function órfã
leitura:   get_account_engagement_summary() ← useAccountEngagement.ts:67 (tela ABM)
```

Estado real das 4 tabelas em produção: `contact_engagement_score` **0**,
`engagement_score_history` **0**, `email_engagement_scores` **0**,
`email_engagement_score_history` **0**. `contact_send_time_profile` também **0**.

Conclusão honesta: **não é trabalho parcial à espera de um botão.** O código existe
inteiro (RPCs, edge function, hooks, componentes de UI); o que nunca aconteceu foi a
alimentação em produção — nenhum sinal foi registrado. Um botão "recalcular" hoje
rodaria sobre 0 perfis e devolveria `updated: 0`. O elo que falta é a montante, e um
dos dois produtores de sinal (`sequence-record-reply`) **não está deployado**.

## Contexto que explica vários destes casos: o teto de 100 edge functions

O repo tem 171 edge functions e o plano permite 100 deployadas — e há exatamente 100
deployadas. **22 funções que o front chama não existem em produção** e devolvem
`404 NOT_FOUND`, o que o navegador reporta como falha de CORS no preflight:

`coaching-impact-summary`, `geocode-proxy`, `nlq-query`, `push-subscribe`,
`qbr-generator`, `qbr-scheduler`, `renewal-automation`, `report-builder-execute`,
`rotate-daily-challenges`, `salesperson-coaching`, `schedule-optimal-send`,
`sdr-consecutive-alerts`, `send-quote-to-client`, `send-time-optimizer`,
`sequence-ab-promote`, `sequence-enroll`, `snapshot-forecast`,
`stress-test-contracts`, `summarize-call-recording`, `twilio-click-to-call`,
`winloss-webhook-replay`, `workflow-executor`.

Das 100 deployadas, apenas **uma** não tem nenhuma referência no repo nem em cron:
`engagement-score-recompute` (o caso acima). Ou seja, abrir 22 vagas não é
redistribuir: exige decisão de plano (custo) do dono.
