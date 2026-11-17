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

---

## Censo das edge functions — 2026-11-17 16:45Z (corrige o número que publiquei antes)

Medido pela Management API (`GET /v1/projects/usyxfpqlsspldubptrdl/functions`) cruzado
com `supabase/functions/` da main, com as referências do código (`src`, `supabase`,
`.github`) e com as referências de dentro do banco (corpo das funções de
`public` + `cron.job`, procurando `functions/v1/<slug>` e
`trigger_internal_edge_job('<slug>')`).

| medida                                               | valor                     |
| ---------------------------------------------------- | ------------------------- |
| functions no repositório                             | 172                       |
| deployadas                                           | **100 — o teto do plano** |
| deployadas que não existem no repositório            | **0**                     |
| deployadas sem nenhuma menção no código nem no banco | **0**                     |
| referenciadas (código ou banco) e **não** deployadas | 71                        |
| referenciadas pelo `src/` (front) e não deployadas   | **47**                    |

**A conclusão que importa: não existe vaga para liberar.** Nenhuma das 100
deployadas é órfã — todas existem no repositório e todas são citadas em algum
lugar. Apagar qualquer uma seria apostar que ninguém (incluindo provedor externo,
como a Resend no `inbound-email-webhook` e a Twilio nos `twilio-*`) a chama. Então
as 47 que o front chama e que estão fora do ar só voltam **subindo o plano** ou
desligando o spend cap. Resposta literal do Supabase na tentativa de deploy de
uma 101ª function:

```
HTTP 402 Max number of functions reached for project, please upgrade Plan or disable spend cap
error.code = entitlement_required · feature = function.max_count
```

**Correção:** eu havia escrito "22 functions não deployadas". Aquele número veio de
um regex que só pegava `invoke('slug')` na mesma linha e perdia a forma
multilinha. O número certo é 71 referenciadas, das quais **47 são chamadas pelo
front**. As 47:

ai-agent-orchestrator, calculate-committee-coverage, calibrate-win-probability, challenge-expiration-alerts, check-lead-sla, coaching-impact-summary, compute-forecast-accuracy, extract-deal-stakeholders, generate-revenue-forecast, geocode-proxy, health, lead-scoring, nlq-query, predict-quota-attainment, process-call-recording-ingest, purchase-intelligence-forecast, push-subscribe, qbr-generator, qbr-scheduler, recompute-stage-baselines, renewal-automation, report-builder-execute, rotate-daily-challenges, run-retry-tests, salesperson-coaching, schedule-optimal-send, scheduled-report-trigger, sdr-consecutive-alerts, semantic-coverage, semantic-index-entity, semantic-reindex-batch, semantic-search-universal, send-alert-notifications, send-password-reset, send-quote-to-client, send-time-optimizer, sequence-ab-promote, sequence-enroll, snapshot-forecast, stress-test-contracts, summarize-call-recording, test-integration-connection, transcribe-call-recording, twilio-click-to-call, winloss-webhook-replay, winloss-webhook-timeline, workflow-executor

Entre elas estão as três que aparecem como erro no console do usuário hoje:
`geocode-proxy` (mapa sem marcador), `lead-scoring` (falha de CORS, que é o 404 do
gateway na function ausente) e `health`.

### Outros pendentes medidos nesta passada

- `public.match_reply_to_enrollment` consulta `sales.email`, **coluna que não existe
  no banco**: toda resposta de e-mail recebida pelo `inbound-email-webhook` estoura
  `42703`. Não corrigido — fora do escopo da tarefa em curso.
- 3 policies liam `auth.users` e devolviam 403 (`lead_detailed_logs`,
  `webhook_logs`, `audit_log`): migration `20261117190000` pronta e testada em
  `BEGIN … ROLLBACK`, aguardando o dono (DDL em produção, regra 8).
- `inbound-email-webhook` está na **versão 5**, com o registro de clique/abertura.
  Falta ligar, no painel da Resend, o tracking de clique do domínio e a assinatura
  dos eventos `email.clicked`/`email.opened` — não há MCP nem API pública para isso.

### Branches, segunda verificação (main em `2a3a8ca1d`)

`computador_local` reapareceu depois de eu apagá-la, apontando para `da0c2a116` —
um commit da própria main. Reverificada byte a byte (ancestral de main, 0 commits
à frente, 0 arquivos exclusivos) e apagada de novo. As outras quatro
(`contexto`, `automation/types-sync`, `automation/inventario-estado`,
`release-please--…`) seguem o veredicto da tabela acima: nenhuma tem trabalho
exclusivo não incorporado. `automation/types-sync` tem o blob de `types.ts`
**idêntico** ao da main (`2074f052b`).

---

## Varredura das 79 PRs fechadas sem merge — 17/11/2026

As branches vivas não eram o único lugar onde trabalho de outro agente podia ter
ficado para trás. Toda PR **fechada sem merge** também foi verificada, porque o
GitHub preserva o commit dela em `refs/pull/<N>/head` mesmo depois de a branch
desaparecer.

- **79** PRs fechadas sem merge. **59** são `dependabot` (bump de dependência — o
  que vale é o `package.json` atual) e **3** são ping de CI sem conteúdo
  (`#371`, `#372`, `#376`).
- **20 não-dependabot** analisadas uma por uma: `#65`, `#106`, `#132`, `#276`,
  `#280`, `#281`, `#302`, `#303`, `#304`, `#305`, `#310`, `#365`, `#369`, `#415`,
  `#459`, `#461`, `#464`, `#488` (e os três pings acima).

### Método

Para cada PR: `git fetch origin refs/pull/<N>/head`, comparação dos caminhos da
árvore da branch com `origin/main` e, para cada caminho que só existe na branch,
duas perguntas — existe arquivo de mesmo nome em outro lugar da main (movido)? a
main importa esse nome (consumidor vivo)?

Comparar commit por commit não serve aqui: a história da `main` foi reescrita, e
essas branches têm mais de 12.000 commits "fora da main" só por isso. A
comparação é de **conteúdo**, não de ancestralidade.

### Resultado

| medida                                                       | valor   |
| ------------------------------------------------------------ | ------- |
| caminhos exclusivos distintos nas 20 branches                | 173     |
| com arquivo de mesmo nome em outro caminho da main (movidos) | 19      |
| sem homônimo na main                                         | 154     |
| destes, **não importados por nada** na main                  | **153** |

- Os 19 movidos são reorganização de pasta, não perda: `RaceArena.tsx` está em
  `src/components/race/`, `CommandPalette.tsx` em `src/components/command/`,
  `goalsService`/`useGoals` aparecem em 9 arquivos da main.
- O único dos 154 cujo nome a main ainda cita é `src/components/ui/sonner.tsx`,
  e a citação é o **pacote** `sonner`: `src/App.tsx` importa
  `Toaster as SonnerComponent` direto dele, e a main tem seu próprio
  `src/components/ui/toaster.tsx`. O wrapper antigo está superado.
- Os outros 153 são componentes pré-reescrita que **ninguém importa** na main
  (13 em `gamification`, 12 em `ui`, 10 em `dashboard`, …). Restaurar qualquer um
  injetaria código morto, não funcionalidade — é o oposto do que o sistema precisa.
  Entre eles, três sem nenhum vestígio na main: `PermissionGate`, `SettingsPanel`
  e `password-strength` (permissão hoje é `useUserRoles` + RLS; as telas de
  configuração existem como rota própria).
- As 3 migrations exclusivas das PRs do Devin já tinham veredicto em
  `docs/agentes/migrations-arquivadas-veredicto-261117.md`:
  `20261019120000_bitrix24_sync_run_lock.sql` **SUPERADA**,
  `20261019150000_agent_run_owner_check.sql` **INCORPORADA** (6/6 objetos),
  `20261019151000_sales_status_canon_r2.sql` **INCORPORADA** (18/18).
- As PRs `#459`, `#461` e `#464` — regras de negócio (post único no feed de
  batalha, funções SQL ignorando soft delete, 12 crons da máquina de vendas) —
  têm seus 5 arquivos **byte a byte idênticos** na main; foram incorporadas por
  outro caminho antes de a PR ser fechada.
- `ABCMatrixShift.tsx` e `Client360PredictiveCards.tsx` aparecem como exclusivos
  em quase toda PR fechada recente: foram removidos **de propósito** pelas PRs
  mergeadas #441 e #446, o mesmo veredicto já dado para
  `automation/inventario-estado`.

**Conclusão: nenhuma das 79 PRs fechadas guarda trabalho recuperável.** O que era
bom foi incorporado (verificado byte a byte onde o arquivo existe na main), o
resto é conteúdo pré-reescrita sem consumidor.

## Prova por blob das 5 branches restantes — 17/11/2026

A primeira varredura destas branches usou **ancestralidade** (commit contido na
`main`). Isso não prova nada aqui: a história da `main` foi reescrita. Esta
seção refaz o veredicto com comparação de **blob e de linha**.

Método, por branch: `git ls-tree -r` da branch e da `main` reduzidos a
`<sha-do-blob> <caminho>`; `comm` para separar o que é idêntico; e, para todo
caminho comum com blob diferente, `diff` entre as duas versões contando as
linhas que existem **só na branch** (`grep -c '^>'`). Linha exclusiva é o único
indício real de trabalho que a `main` não tem — blob diferente, por si, é quase
sempre versão velha de arquivo que a `main` já tem mais novo.

| branch                            | blobs | idênticos à main | caminhos ausentes na main | linhas só na branch |
| --------------------------------- | ----- | ---------------- | ------------------------- | ------------------- |
| `computador_local`                | 3620  | 3618             | 0                         | 16                  |
| `automation/types-sync`           | 3618  | 3611             | 0                         | 20                  |
| `automation/inventario-estado`    | 3484  | 3292             | 2                         | 4225                |
| `release-please--branches--main…` | 3620  | 3610             | 0                         | 55                  |
| `contexto`                        | 1158  | 2                | 1154                      | 5                   |

Veredicto de cada uma:

- **`computador_local`** — 0 caminho ausente. As 16 linhas são o corpo inline da
  busca de cliente por e-mail e o `if (matchError) throw matchError;`, ou seja
  exatamente o código que as PRs #561 e #563 extraíram para
  `resolveClientByEmail` / `recordReplyEngagement` e removeram de propósito. A
  `main` tem a versão posterior. **Nada a recuperar.** A branch é ponteiro
  automático da máquina local e reaparece sozinha apontando para um commit da
  própria `main` (hoje `beed1098a`) — apagá-la não resolve nada.
- **`automation/types-sync`** e **`release-please--branches--main…`** — 0 caminho
  ausente; as linhas exclusivas são versões anteriores dos mesmos arquivos que as
  PRs #558/#562/#563 alteraram, mais o `CHANGELOG.md` e o bump de versão que são
  o conteúdo próprio da PR de release. **Nada a recuperar.**
- **`contexto`** — os 1154 caminhos ausentes estão todos sob `docs/contexto/`
  (nenhum fora: verificado com `comm … | grep -v '^docs/contexto/'`, saída
  vazia), e as 5 linhas exclusivas são o `README.md` da própria branch avisando
  "não edite nem abra PR desta branch" e o `vercel.json` que desliga deploy dela.
  Branch gerada por design (AGENTS.md §8). **Manter, nunca mergear.**
- **`automation/inventario-estado`** — é um retrato semanal da `main` feito pelo
  bot em 12/11 (`660347cb5 chore: inventario do estado real [auto]`, e esse
  commit toca só `inventario/estado/*.json`); todos os commits abaixo dele são
  commits reais da `main` com número de PR. As 4225 linhas são, portanto, cinco
  dias de `main` andando para frente. **Nada a recuperar.**

### Os 2 caminhos que não existem na main

Só estes dois arquivos existiam numa branch e não existem na `main`:

| arquivo                                               | veredicto               |
| ----------------------------------------------------- | ----------------------- |
| `src/components/analytics/ABCMatrixShift.tsx`         | descartado de propósito |
| `src/components/clients/Client360PredictiveCards.tsx` | descartado de propósito |

Evidência de que é descarte deliberado, não perda:

- `ABCMatrixShift` recebia `data?.matrixShifts` de `useABCAnalysis()`. No
  retrato de 12/11 esse `matrixShifts` era um **array fixo no código** —
  `'Cliente VIP S/A'`, `'Distribuidora Beta'`, `'Tech Solutions'`. A `main` hoje
  tem um teste que proíbe o campo de voltar:
  `src/hooks/bi/useABCAnalysis.test.tsx` — *"não devolve insights, movimentações
  nem automações fictícias"*, com `expect(keys).not.toContain('matrixShifts')`.
  Restaurar o componente seria reintroduzir dado falso e quebrar esse teste.
- `Client360PredictiveCards` é mock inteiro no JSX ("Linha Industrial X", "92%
  Probabilidade" escritos à mão). A `main` cobre o mesmo espaço da tela com
  `Client360HealthNbaSection.tsx` e `Client360AffinityCard.tsx`, que leem dado
  real via `useClient360`.

**Conclusão: as 5 branches vivas não guardam trabalho recuperável, agora provado
por blob e por linha, não por ancestralidade.**
