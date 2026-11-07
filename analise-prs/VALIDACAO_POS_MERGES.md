# VALIDACAO_POS_MERGES — Veredito consolidado pós-merges

> Data: 2026-11-07 · Repo: adm01-debug/Promo_Champions_V2.1 · Head do main na validação: `f6010c96`
> Método: 5 sessões especializadas (CI, Inventário, Probes, Auditoria Banco, Regressão Funcional), com simulações reais, execução de testes local e cruzamento com logs de CI e PRs mergeadas.

## Veredito por correção

| # | PR (sha main) | Objeto | Veredito | Evidência |
|---|---|---|---|---|
| #373 | mergeada | Docs: reconciliação de auditorias anteriores | ✅ APROVADO | 3 docs em `analise-prs/` |
| #375 | `82ee984f` | Geração de probes de migração | ✅ APROVADO | 17/17 testes; 71 migrations → 274 probes; contrato db-probe.yml 1:1; idempotência SHA256; net-state 51 drop-then-recreate legítimos sem falso-positivo |
| #370 | `ae24e8f0` | Bypass do check de contagem no inventário | ⚠️ PARCIAL — intenção correta, introduziu typo | typo `LEDGER_TOLERA8CIA` (8 no N) que causaria ReferenceError; corrigido pela #379 |
| #374 | `460622417` | Gate e2e em PRs | ✅ APROVADO | actionlint exit 0; e2e `if: workflow_dispatch` (L424); ci-gate L657-674 correto; run 42319605684 SUCCESS com e2e skipped |
| #377 | `713cb7f5` | Inventário do banco gravado | ✅ APROVADO | `inventario/estado/banco.json` real (306 registros, 405 tabelas, 1003 policies, 0 sem RLS) |
| #379 | `13d4b86` | Corrige typo E re-adiciona check de contagem | ✅ APROVADO | check de contagem presente + typo corrigido |
| #382 | `195e4fd` | Check de contagem condicional | ✅ APROVADO | `if (String(max) >= topo)` L139-146; simulação real passou |
| #383 | `f37cc9eb` | PR de ciclo do inventário (auto-merge) | ✅ APROVADO — ciclo completo funciona | run 5 → PR #383 → auto-merge → main |
| #384 | `f6010c96` | Parsers toleram CRLF | ✅ APROVADO | CI Gate SUCCESS; 4 arquivos `split(/\r?\n/)` / `.replace(/\r\n/g,'\n')` |
| #385 | aberta | .gitattributes normaliza LF | ⚠️ ABERTA — decisão do dono (regra 8) | config de repo; conflito difuso potencial |

## Run 3 do workflow de inventário (falha 42290390911)

**Causa raiz confirmada**: falha de permissão do GITHUB_TOKEN — `GitHub Actions is not permitted to create or approve pull requests`, **não** drift de banco. O script rodou integralmente (criou `banco.json`, commitou e pushou branch automation/inventario-estado) antes de falhar no passo 8. Run 4 (mesmo sha) SUCCESS. Pré-requisito documentado no header do workflow (Allow GitHub Actions to create and approve pull requests). Run 5 → PR #383 → auto-merge → main: **ciclo ponta a ponta comprovado**.

## Gap ledger 306 vs 910 — não é bug

`banco.sql` lê `supabase_migrations.schema_migrations` (= migrations **aplicadas**), não os arquivos do repo (910 versões únicas: 669 + 241 legadas). **Drift estrutural do Lovable**: gera migrations no repo não aplicadas no banco. O check condicional (#382) existe para não quebrar produção nesse cenário. **Conclusão**: inventário reflete o estado real do banco; métricas NÃO confrontadas com produção por falta de acesso (ver auditoria).

## Regressão funcional (código do front)

- 6 SHAs confirmados no main (460622417, 13d4b86, 713cb7f5, ae24e8f0, 82ee984f, 4385b7dc).
- `gen-migration-probes.test.mjs`: 17/17 PASS, exit 0.
- Reconciliação C1–C10 das auditorias anteriores: **todos CORRIGIDO E VERIFICADO** (migrations 20260718000001/2/3, webauthn L308-355, send-multichannel L230-279, toCSV, sanitizeCsvCell L75).
- #281: CLOSED sem merge, mas os 4 bugs estão corrigidos no código atual (regex g-flag `re.lastIndex=0` L186; stripComments L112; `lit()` SQL injection L256; table_type — #381 aberta que adicionará).
- **Confirmação via CI Linux** (run do pr-checks): o único fail histórico era o typo que a #379 corrigiu → **CI Gate SUCCESS, Unit Tests SUCCESS, Build SUCCESS, E2E skipped** no head `f6010c96` (63 check runs, zero falhas).

## Auditoria banco (PhD)

**NÃO VERIFICADO por limitação de acesso — não é falha de código.** Gateway MCP v21 → 401 Invalid access token; Management API `POST /v1/projects/usyxfpqlsspldubptrdl/database/query/read-only` → 403; gateway lovable → 530 (ref banido). Métricas do inventário NÃO confrontadas com o banco real enquanto não houver MCP Supabase do Champions configurado.

## Gaps encontrados (por severidade)

1. 🟠 **ALTO — Drift parcial <20 migrations invisível** (inventário). Limite deslizante: o check de versão só pega quando há ≥20 migrations do repo acima do ledger max; hoje há 8 (20261018200000), invisíveis. Simulação com migration nova 20261101000000 não aplicada provou o furo. · `scripts/inventario/gerar-banco.mjs`
2. 🟠 **ALTO — e2e nunca roda em PR → cobertura morta no gate** (CI). `if: workflow_dispatch` (L424) desativa e2e em TODOS os PRs; sem dispatch manual, cobertura de UI não existe. #374 trocou bloqueio por ausência de cobertura (degradação silenciosa). Proposta: opt-in por label `'e2e'`. · `.github/workflows/pr-checks.yml`
3. 🟡 **MÉDIO — `detect-changes` bugado em workflow_dispatch** (CI). Em dispatch `github.event.pull_request.base.sha` é vazio → `has_code=false` → lint/test/build/e2e/db todos SKIP. Todo dispatch manual não valida nada. · `.github/workflows/pr-checks.yml` L38-52
4. 🟡 **MÉDIO — Rollback (banco com versão > repo) não detectado** (inventário). `String(max) >= topo` roda o check de contagem, mas o de versão nunca falha (max > limite sempre). Banco "à frente" passa silenciosamente.
5. 🟡 **MÉDIO — GAP-1 probes** (probes): `ALTER PUBLICATION ... DROP TABLE` capturado como DROP de tabela → falsa supressão (3 ocorrências pré-since=20260901, **impacto zero hoje**). · `scripts/db-audit/gen-migration-probes.mjs`
6. ⚪ **BAIXO — Comparação lexicográfica de strings** (funciona por 14 dígitos fixos; quebraria com comprimento diferente). · `gerar-banco.mjs`
7. ⚪ **BAIXO — cron pattern case-sensitive** (0 ocorrências reais maiúsculas). · `gen-migration-probes.mjs`
8. ⚪ **BAIXO — menor privilégio**: `actions: write` global supérflua em pr-checks (nenhum job usa).
9. ⚪ **BAIXO — notify-failure** não inclui migrations-gate, gen-types-drift, k6-smoke (lighthouse excluído de propósito).
10. ⚪ **BAIXO — timeout 120s fixo** em gerar-banco.mjs; sem configuração.

## Backlog independente (fora do escopo desta rodada)

- Backlog probes (`collectDroppedObjects` + `cmd` em policy) — **bloqueado pela PR #381 aberta** (mesmo arquivo L333).
- Secrets (`SLACK_CI_WEBHOOK_URL`, `SUPABASE_ACCESS_TOKEN`) — conferência no console Actions.
- PRs abertas na validação: #368 (deno.lock Dependabot), #378 (release 1.1.0), #380 (instruções enxutas), #381 (probe table_type — BLOQUEIA backlog probes), #385 (.gitattributes LF, regra 8) — todas regra 8 ou observação, NÃO mergear.

## Fontes e limitações

- 3/5 validações fechadas com handoff completo (CI #374, Inventário #370, Probes #375); auditoria banco recuperada de checkpoint (bloqueada sem acesso); regressão funcional parcial por **erro 402 (limite de créditos)** — a suíte npm do front (typecheck/lint/test/build) **não** pôde ser executada localmente; a validação de não-regressão do front repousa na **CI Linux verde** (Unit Tests/Build/CI Gate SUCCESS).
- Ambiente Windows: vitest/bug de path com subst/UNC impede run local; bugs CRLF observados localmente foram corrigidos pela #384/#385.
