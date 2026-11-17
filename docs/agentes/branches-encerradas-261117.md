# Encerramento de branches — 2026-11-17

Registro da auditoria que precedeu o encerramento das branches de agentes de IA.
Serve a um propósito só: **tornar qualquer exclusão reversível**. Com o SHA abaixo,
qualquer branch volta com `git branch <nome> <sha>` e `git push origin <nome>`.

## Método

A `main` foi recriada como história órfã em 2026-11-13, então `git merge-base` com as
branches antigas é vazio e as contagens ahead/behind não valem nada. A única verdade é
a comparação de árvore. Para cada uma das 43 branches remotas eu listei os arquivos
ausentes da `main` e contei em quantas branches cada arquivo aparece:

- arquivo em 5+ branches = árvore pré-rewrite que a `main` substituiu de propósito;
- arquivo em **uma só** branch = trabalho próprio daquele agente, que se perderia.

Resultado: de 1355 arquivos ausentes da `main`, **9 branches** têm algo exclusivo.
As outras 34 não têm **nada** próprio — o conteúdo delas está na `main` ou repetido
em várias branches.

Cada veredito de banco foi conferido **contra o banco de produção**
(`usyxfpqlsspldubptrdl`), por query ou por chamada real da função — não por leitura
de código.

## Branches com conteúdo exclusivo

### `claude/auditoria-tecnica-sistema-t98xtr`

- tip: `36b2fa5e0db939a5e844dd242dc9fde1746abceb` (2026-09-04)
- veredito: **ENCERRADA** — nada se perde.
- Exclusivos: 20260904000001*fix_broadcast_sale_completed.sql e 20260904000002_recreate_performance_indexes.sql. O 1º JÁ ESTÁ APLICADO em produção (pg_get_functiondef de broadcast_sale_completed não cita o projeto antigo rapjswienfhkobhlamxb, lê de \_internal_secrets, sem JWT embutido). O 2º é OBSOLETO: cria idx_deals*_ em public.deals, tabela que não existe (produção tem sales); os 4 idx*clients*_ que ele também cria já existem.

### `claude/chore-ci-runner-test-261106-0320`

- tip: `3058d851efdc3fb96cc1f86e5f62b98f57c3a200` (2026-11-06)
- veredito: **ENCERRADA** — nada se perde.
- Exclusivo: .github/runner-test.md, arquivo de teste de runner de CI. Descartável.

### `fix/hermes-420603-sec-agent-runs`

- tip: `d2338ab6e6a853783ce5e428b5b30e66f67da10f` (2026-10-27)
- veredito: **ENCERRADA** — nada se perde.
- Exclusivo: 20261019150000_agent_run_owner_check.sql. JÁ APLICADO: append_agent_step e complete_agent_run em produção usam auth.uid() e checam dono.

### `fix/hermes-420605-integracoes-r2`

- tip: `71e5f24a5d7d09fa0361f5593ebbacf832bbc760` (2026-10-19)
- veredito: **ENCERRADA** — nada se perde.
- Exclusivo: 20261019120000_bitrix24_sync_run_lock.sql. SUPERADO: a main tem lock genérico com TTL (edge_job_locks + try_edge_job_lock/release_edge_job_lock, confirmados em produção) chamado em bitrix24-sync/index.ts:1006 e :1171, mais claim por linha antes de cada chamada ao Bitrix (icp_data.bitrix_id e sales.external_deal_id, linhas 701-729 e 871-881). Granularidade melhor que o lock de run da branch.

### `fix/hermes-420639-sales-status-canon`

- tip: `a94b4c38889beb7b298e9def4cedebf7ddbe0463` (2026-10-19)
- veredito: **ENCERRADA** — nada se perde.
- Exclusivo: 20261019151000_sales_status_canon_r2.sql (1239 linhas). JÁ APLICADO/SUPERADO: 10 das 11 funções citadas já citam 'closed' em produção; as 2 aparentes lacunas são produção estando À FRENTE — broadcast_sale_completed usa a coluna gerada deal_status (que mapeia completed/won/closed -> completed, mais robusto que a lista literal da branch) e auto_assign_lead foi refatorada e não usa mais date_trunc. Aplicar hoje seria regressão.

### `v2/hidden-features-26101409158c38`

- tip: `10af30e45c48257a1e7045adfc79e049be727cd7` (2026-10-18)
- veredito: **ENCERRADA** — nada se perde.
- Exclusivo: 20261018152917_lost_deals_benchmark.sql. RESGATADO na PR #509 como 20261116220000_lost_deals_benchmark.sql — SQL byte a byte idêntico, só com cabeçalho de resgate de 8 linhas somado. Todo o resto de valor dela foi mergeado: comboService/useCombo/ComboIndicator (#521), useUpsellSuggestions/UpsellSuggestionCard (#522), useCoachingProgress/CoachingProgressCard (#523), useUserDashboardLayout/DashboardLayoutEditor (#524). PermissionGate.tsx fica de fora por decisão de produto (qual tela gatear) e existe em outras 12 branches, logo não se perde.

## Branches retidas

- **`audit/rlx-security-fix`** — tip `08c2134079b475f06121e6fc5e81aa1798effae7` (2026-07-27) — **ENCERRADA** depois do resgate. Era a única retida por conteúdo. O motivo da retenção não se sustentou: eu afirmei que a allowlist derrubaria "a assinatura ativa", mas ao conferir o dado a única linha de `winloss_webhook_subscriptions` tem host `test.invalid` e `active = false` — não havia integração viva. Resgatado em duas PRs, as duas aplicadas e verificadas em produção: #529 (3 CHECKs + 4 UNIQUE parciais + 2 FKs de passkey) e #530 (SSRF e rate-limit de webhook, reescritos). O SQL original NÃO foi portado como estava porque é inseguro e não roda: allowlist e blocklist na mesma tabela sem coluna que as separe (logo `169.254.169.254` ficava cadastrado como permitido), alias duplicado que lança exceção, `::INET` sobre `'localhost'` com `EXCEPTION WHEN others` engolindo o erro (blocklist pulada inteira), wildcard que nunca casa e allowlist vazia permitindo tudo (fail-open). A reescrita passa 23/23 casos adversariais. O que ficou de fora é obsoleto, já aplicado ou código morto, item por item, nos corpos de #529 e #530.
- **`automation/inventario-estado`** — tip `660347cb567abe6b434b4f14eb28a2bfa0be921d` (2026-11-12) — RETER: automação de inventário/estado; operacional
- **`claude/fix-permissoes-admin-261117-0110`** — tip `edef650e420224434156ad63616fa6163d4822c0` (2026-11-17) — RETER: minha, PR #526 aberta
- **`contexto`** — tip `06acff090ddbb3b81788e56729e6cc6a2584e780` (2026-11-14) — RETER: contexto gerado; AGENTS.md §8 proíbe PR dela. 1154 arquivos exclusivos, todos gerados.
- **`release-please--branches--main--components--promo-champions-v2`** — tip `1dd74f91f299f7ed6ce8d8438b7891e2418cc96f` (2026-11-17) — RETER: branch do bot release-please; ele a regenera

## Branches sem conteúdo exclusivo

Nenhum arquivo destas está ausente da `main` sem também estar em várias outras
branches. Tip registrado para reversão:

| branch                                                    | tip                                        | último commit |
| --------------------------------------------------------- | ------------------------------------------ | ------------- |
| `audit/hermes-h770179-analise-100-etapas`                 | `94de175b9f13905da5b76379aa44fe69d776ca62` | 2026-08-26    |
| `claude/chore-ci-ping-261106-0315`                        | `de8ad3e512d4e47c11a9acd7da07c2c005aba8c7` | 2026-11-06    |
| `claude/fix-db-allowlist-concurrently-261016-1520`        | `333bce60ca93abeb3c641c09e68895ade6fe42f4` | 2026-10-15    |
| `claude/fix-db-crons-maquina-vendas-261112-2245`          | `12a051fd4d55d2bae27ce759e28ef0c68e5ff9b7` | 2026-11-12    |
| `claude/fix-db-feed-batalha-duplicado-261112-1900`        | `96e8a9fa96052039c76d22121fdebb6d8a770dd9` | 2026-11-12    |
| `claude/fix-db-funcoes-activities-deleted-at-261112-1900` | `f23917a3fc242e084984fc61715b5ef1a181b679` | 2026-11-12    |
| `claude/fix-deno-lock-eslint-refresh-261106-0225`         | `86bcf2011638f183852c755b759dd8c5f13276c5` | 2026-11-06    |
| `claude/fix-eslint-ts7-compat-261106-1430`                | `78d4119b117dacf54468eb419b3643ba90a43cca` | 2026-11-05    |
| `claude/fix-gen-migration-probes-261016-1540`             | `b95cb2d870bb130d79d2cfee62371968cf23ba74` | 2026-10-16    |
| `claude/fix-migration-scripts-261016-1700`                | `acbc048300ee74c0bd3f308325134360dba0c544` | 2026-10-16    |
| `claude/infra-contexto-1h-261114-1342`                    | `d59d0ba54cac4a79dc611954f8b5c714deffee04` | 2026-11-14    |
| `claude/resolver-prs-conflito-lzrz0o`                     | `d5b984d8b9c41111b0f75986e28168e911c24b85` | 2026-07-20    |
| `claude/system-status-roadmap-ej7pa2`                     | `1309366ed0c0176451c2efe2285d3371b7e57fff` | 2026-08-16    |
| `claude_06/compassionate-bardeen-5nrjpw`                  | `2a331335fba2be93c73c8920c7f36bfa6de7fdb9` | 2026-11-09    |
| `computador_local`                                        | `0c33752785984dad4efaaadefeab6e092d572fc3` | 2026-11-16    |
| `dependabot/github_actions/actions-core-4af230c318`       | `0c64b10e9fc7eaea7a0c114c9edc27692d1efd1e` | 2026-11-09    |
| `dependabot/npm_and_yarn/commitlint/cli-21.2.4`           | `0f53127782f073918e9a9a36cc35c63f94793b2a` | 2026-11-16    |
| `dependabot/npm_and_yarn/dependency-cruiser-18.7.2`       | `2f344487b782f785d86ab8a943d60c2698a66796` | 2026-11-16    |
| `dependabot/npm_and_yarn/jsdom-30.1.3`                    | `998574534fd9c7c8e4a56d016c46a9b48212dbf9` | 2026-11-05    |
| `dependabot/npm_and_yarn/lint-staged-17.6.0`              | `9758301f5ba0e525011c644d82a4063e9279e187` | 2026-11-05    |
| `dependabot/npm_and_yarn/lovable.dev/cloud-auth-js-1.2.3` | `dbe06acd0eef71bf0b64e03e577606416a36a008` | 2026-11-13    |
| `dependabot/npm_and_yarn/react-hook-form-7.92.0`          | `89e395f0e7cb51a584ae3b4f6490650198610b77` | 2026-11-16    |
| `dependabot/npm_and_yarn/testing-6d4b891857`              | `943f42f8b4d2a307a9dac107a81b1e21d4895a59` | 2026-11-12    |
| `feat/hermes-graphify-fundacao`                           | `a90a0523bb51fe4fb0f450f7e77bf2e2f2b9d863` | 2026-09-11    |
| `feat/sync-promogifts-webhook-secret`                     | `96d3751501d46596aaca5d672d2a8c737fe382bc` | 2026-07-09    |
| `fix/hermes-420604-remediacao-r2`                         | `72093a8803fd86207e8aa99a2edb2c4bce25d74c` | 2026-10-19    |
| `fix/hermes-graphify-p0-correcoes-20260911`               | `e497d1c00ea6c2e162c51db7638f336115f72f11` | 2026-09-20    |
| `fix/hermes-h102707-auditoria-exaustiva`                  | `c3e73adc92e3ec37d17542d13d2edabdc7bf2ccf` | 2026-08-30    |
| `fix/hermes-h773557-onda0-simulacao-estabilizacao`        | `c59a4f21a80f733fc54780b1dfedd30a9b439b3a` | 2026-08-28    |
| `fix/hermes-h774001-onda1-correcoes-seguras`              | `abe8c41dd5638bcc17070f3a5105c6725518d493` | 2026-08-28    |
| `hermes/corrigir-migration-deals-26102014011fe8`          | `4cc974462e60d46de8a62de6ea70d41c94b80f4a` | 2026-10-20    |

Total: 31 branches.

## Trabalho resgatado nesta sessão

| PR   | O que foi resgatado                                                          | Origem                                                |
| ---- | ---------------------------------------------------------------------------- | ----------------------------------------------------- |
| #509 | lost_deals no benchmark mensal + correção do Win Rate no HistoricalBenchmark | v2/hidden-features                                    |
| #510 | guards de isCurrentUser no useWebAuthn + win rate no usePipelineVelocity     | várias                                                |
| #513 | ACL de TRUNCATE por supabase_admin + 4 constraints reescritas                | feat/hermes-graphify-fundacao, audit/rlx-security-fix |
| #517 | exportação em Excel (.xlsx) no SDR Dashboard                                 | v2/hidden-features                                    |
| #518 | aba de Sessões Ativas no Security Dashboard                                  | várias                                                |
| #521 | combo diário: comboService + useCombo + ComboIndicator + trigger novo        | v2/hidden-features                                    |
| #522 | sugestões de upsell no expand do deal                                        | v2/hidden-features                                    |
| #523 | card de progresso de coaching IA na página do vendedor                       | v2/hidden-features                                    |
| #524 | editor de layout do dashboard Win/Loss, com largura por widget               | v2/hidden-features                                    |
| #525 | conserta get_client_seasonality e get_industry_seasonality                   | diagnóstico de audit/rlx-security-fix                 |

## Resultado final

De **43 branches remotas, 29 foram encerradas** — todas de agente de IA, todas
com tag `archive/<nome>` no remoto apontando para o mesmo SHA da branch.
**Nenhuma branch de agente de IA restou.**

As 14 que ficaram não são trabalho de agente:

| branch                              | por quê                                      |
| ----------------------------------- | -------------------------------------------- |
| `main`                              | branch principal                             |
| `contexto`                          | contexto gerado; AGENTS.md §8 proíbe PR dela |
| `automation/inventario-estado`      | automação operacional                        |
| `release-please--branches--main--…` | o bot a regenera                             |
| `computador_local`                  | máquina do dono                              |
| 8 × `dependabot/*`                  | do bot, não é trabalho de agente             |

Reversibilidade **testada, não prometida**: depois de apagar, recuperei
`src/components/auth/PermissionGate.tsx` (66 linhas) e
`canonical_hardening_contract_test.ts` (289 linhas) de dentro das tags de
branches já apagadas. Para trazer qualquer uma de volta:

    git branch <nome> archive/<nome>
    git push origin <nome>

## Conferência byte a byte (fecho da auditoria)

A primeira passagem comparou **presença** de arquivo. Esta compara **conteúdo**:
93.932 blobs das 29 tags `archive/*` contra `main`. 2.244 caminhos divergem,
mas 2.191 divergem em 3+ branches — é a árvore pré-rewrite que a `main`
substituiu, não trabalho perdido. Restaram **5 blobs distintos**, cada um em
1–2 tags, e todos foram abertos linha a linha:

| arquivo                                                  | tag                                   | veredito                                                                    |
| -------------------------------------------------------- | ------------------------------------- | --------------------------------------------------------------------------- |
| `src/lib/excelExporter.ts`                               | `feat/sync-promogifts-webhook-secret` | branch **não tem** o `sanitizeCsvCell` (CWE-1236) da `main`                 |
| `src/types/sales.ts`                                     | `claude/resolver-prs-conflito-lzrz0o` | branch **não tem** os 7 campos de rentabilidade da `main`                   |
| `…20260830000000_fix_race_leaderboard_status.sql`        | `audit/hermes-h770179-…`              | branch rankeia todo vendedor em toda temporada e não dá o `GRANT` ao `anon` |
| `supabase/functions/_shared/sale-statuses.ts`            | `v2/hidden-features-…`                | `isOpenSaleStatus` por allowlist dessincronizaria edge e front              |
| `supabase/functions/winloss-webhook-dispatcher/retry.ts` | `audit/rlx-security-fix`              | guarda SSRF interna, superada pelo portão em `index.ts`                     |

Evidência do caso da leaderboard, em produção: a view tem o filtro de papel
(`definition LIKE '%hybrid%'`), devolve **10 linhas** e não 16, com temporadas
ativas `closer,sdr` sobre carros de `closer,hybrid,sdr` — ou seja, um closer
**não** entra no ranking da temporada de SDR. A versão da branch rankearia os 16. `has_table_privilege('anon','race_spectator_view','SELECT')` = `true`.

Sobre o `retry.ts`: `dispatchOne` é chamado em um único ponto de produção,
`winloss-webhook-dispatcher/index.ts:369`, e já sobre a lista `allowed` que o
portão monta nas linhas 327–363 (esquema `https`, allowlist de host, rate
limit). A cópia em `run-retry-tests/retry.ts` não tem guarda, mas `fetchFn` é
obrigatório sem default (linha 63), só os 4 arquivos de teste a importam e três
injetam mock — nenhuma URL vinda do banco chega lá.

### As 14 branches que ficaram, conferidas por conteúdo

Não foram só justificadas: foram comparadas. Os 1.154 arquivos exclusivos da
`contexto` são todos `docs/contexto/**` (contexto gerado, lido em runtime).
Fora isso, 6 branches carregam os mesmos **3 componentes ausentes da `main`**:

- `src/components/analytics/ABCActionableAutomations.tsx`
- `src/components/analytics/ABCMatrixShift.tsx`
- `src/components/clients/Client360PredictiveCards.tsx`

São maquetes, não funcionalidade: `Client360PredictiveCards()` não recebe
props, não consulta nada e chumba `"Linha Industrial X" / "92% Probabilidade"`.
Vêm junto com um export falso (`setTimeout(2000)` → "Dossiê PDF gerado com
sucesso!") e um botão `Filtros` sem handler. As mesmas branches ainda usam
`bg-gradient-to-br`, de antes da migração para Tailwind v4 — prova de que a
`main` é a versão nova. Trazer isso de volta mostraria previsão inventada como
real; é regressão, não resgate.

**Resultado: nenhum trabalho perdido. As 29 exclusões estão provadas por
conteúdo, não por presença de arquivo.**

## As 8 branches do dependabot (encerradas em 17/11)

Nenhuma tinha PR aberta — só a #485 do release-please seguia aberta. Conferido
o que cada uma propunha contra o `package.json` da `main`: em **todos** os
casos a branch traz versão **menor** que a `main`, isto é, o bump já entrou ou
foi superado.

| pacote                       | `main`     | branch     |
| ---------------------------- | ---------- | ---------- |
| `@hookform/resolvers`        | `^7.0.6`   | `^5.9.1`   |
| `framer-motion`              | `^14.13.0` | `^13.2.0`  |
| `@simplewebauthn/server`     | `14.0.3`   | `14.0.2`   |
| `@xyflow/react`              | `^12.12.1` | `^12.12.0` |
| `@lovable.dev/cloud-auth-js` | `^1.2.3`   | `^1.2.1`   |
| `papaparse`                  | `^5.7.1`   | `^5.7.0`   |

A `cloud-auth-js-1.2.3` propunha 1.2.3 e a `main` já está em `^1.2.3`; a
`react-hook-form-7.92.0` nem aparece no diff de `package.json`, porque a `main`
já tem `^7.92.0`. Os pins de `actions/*` apontam para o mesmo SHA — a `main` só
tem o comentário mais preciso (`# v7.0.1` em vez de `# v7`). As branches ainda
carregam os 3 componentes-maquete e não têm os scripts `maintenance:*`,
`debt:report` e `automation:doctor` que a `main` tem.

As 8 foram arquivadas em `archive/<nome>` com SHA conferido (8/8 iguais) e só
então apagadas. Recuperação testada: extraí o `package.json` de dentro da tag
de uma branch já apagada.

**Total: 37 de 43 branches encerradas.** As 6 que ficam não são encerráveis:

| branch                              | por quê                                         |
| ----------------------------------- | ----------------------------------------------- |
| `main`                              | branch principal                                |
| `contexto`                          | contexto gerado, lido em runtime (AGENTS.md §8) |
| `automation/inventario-estado`      | idem — alimenta `inventario/estado/*.json`      |
| `automation/types-sync`             | idem — gera `types.ts`                          |
| `release-please--branches--main--…` | carrega a PR aberta #485; o bot a regenera      |
| `computador_local`                  | máquina do dono                                 |
