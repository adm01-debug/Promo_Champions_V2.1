# Decisões Humanas Pendentes

> 5 PRs que requerem intervenção manual. Não podem ser mergeadas autonomamente.

---

## #298 — bump eslint-plugin-react-refresh 0.4→0.5

**URL:** https://github.com/adm01-debug/Promo_Champions_V2.1/pull/298

**Motivo do bloqueio:**
Major bump (0.4 → 0.5). A versão 0.5 do plugin renomeia e adiciona regras ESLint que quebram o check de lint/typecheck no CI. Não é seguro mergear sem adaptar a configuração.

**O que precisa acontecer para liberar:**
1. Atualizar `eslint.config.js` (ou `.eslintrc`) com as novas regras/configs da v0.5
2. Corrigir arquivos que violem as novas regras (provavelmente relacionadas a HMR e exports)
3. Rodar `npm run lint` e `npm run typecheck` localmente até limpo
4. Push na branch do dependabot (ou criar branch nova aplicando o mesmo bump com config atualizada)
5. CI verde → mergear

**Estado atual (reconciliação 2026-11-06):** ✅ PENDÊNCIA RESOLVIDA NO MAIN. O bump (eslint-plugin-react-refresh 0.4→0.5) foi aplicado direto no `main` em 2026-11-06T02:51Z (head `6c6df6fb`), junto com jsdom 30.1.3 e lint-staged 17.6.0. PR fechada sem merge.

---

## #281 — fix: 4 bugs em scripts de auditoria (DRAFT)

**URL:** https://github.com/adm01-debug/Promo_Champions_V2.1/pull/281

**Motivo do bloqueio:**
PR está em modo **DRAFT**. O código foi verificado e os fixes são reais e necessários. O CI não roda em draft — a PR precisa ser convertida para ready.

**O que precisa acontecer para liberar:**
1. Owner da PR acessar https://github.com/adm01-debug/Promo_Champions_V2.1/pull/281
2. Clicar em **"Ready for review"** para tirar do modo DRAFT
3. CI executa automaticamente; esperado: verde
4. Mergear após CI verde

**Estado atual (reconciliação 2026-11-06):** ⏳ AINDA PENDENTE. Sem desfecho registrado nesta reconciliação (nenhum SHA de merge associado). Segue sem merge.

**Contexto dos fixes (para referência):**
- RegExp g-flag: regex reutilizados com flag `g` tinham `lastIndex` acumulado entre chamadas
- CREATE_TABLE detection: SQL com comentários antes de `CREATE TABLE` não era parseado corretamente
- SQL injection probe: literais não escapados em queries de probe (uso de `pgLit`)
- Views vs BASE TABLE: filtro `table_type = 'BASE TABLE'` excluía views indevidamente

---

## #280 — fix: gen-migration-probes (DROP, schemaname, cmd)

**URL:** https://github.com/adm01-debug/Promo_Champions_V2.1/pull/280

**Motivo do bloqueio:**
Conflito de merge com `main`. Após o squash-merge de #344, os arquivos tocados nesta PR divergiram. A branch pertence a outra sessão de agente — rebase não pode ser feito autonomamente (regra de isolamento de worktree).

**O que precisa acontecer para liberar:**
1. Identificar a branch da PR #280 (ex: `fix/gen-migration-probes-*`)
2. Fazer rebase: `git rebase origin/main` na branch
3. Resolver conflitos nos arquivos de scripts de probe
4. `git push --force-with-lease origin <branch>`
5. CI roda; esperado: verde (os fixes são válidos)
6. Mergear após CI verde

**Contexto dos fixes:**
- DROP reconciliation: objetos dropados não eram reconciliados corretamente na comparação de probes
- `schemaname` ausente: queries sem qualificação de schema falhavam em schemas não-`public`
- `policy cmd`: valor de comando de política retornado incorretamente em probes de RLS

**Estado atual (reconciliação 2026-11-06):** ❌ FECHADA sem merge. A correção da PR foi superada pela reescrita do script no `main` (hoje `collectProbes`/`PATTERNS`, `MIG_DIR='supabase/migrations'`), que não traz a supressão de DROP. Reimplementar ficou em backlog.

---

## #254 — bump TS 7 + vite-plugin-pwa 2 (major)

**URL:** https://github.com/adm01-debug/Promo_Champions_V2.1/pull/254

**Motivo do bloqueio:**
Dois major bumps simultâneos com breaking changes que quebram o CI:
- **TypeScript 7:** opções de `tsconfig.json` removidas/renomeadas, mudanças na resolução de módulos
- **vite-plugin-pwa 2:** API de configuração do Service Worker e Workbox reescrita

**O que precisa acontecer para liberar:**
1. Criar branch de migração (`feat/migrate-ts7-pwa2`) a partir de `main`
2. Aplicar o bump de TypeScript 7 e atualizar `tsconfig.json` conforme migration guide oficial
3. Aplicar o bump de vite-plugin-pwa 2 e migrar configuração do `vite.config.ts`
4. Verificar build de produção (`npm run build`) e comportamento do Service Worker
5. CI verde → mergear
6. Fechar a PR #254 do dependabot (substituída pela branch de migração)

**Referências:**
- TypeScript 7 migration: https://www.typescriptlang.org/docs/handbook/release-notes/
- vite-plugin-pwa v2 migration: https://vite-pwa-org.netlify.app/guide/

**Estado atual (reconciliação 2026-11-06):** ⚠️ SUPERADA PARCIALMENTE. Os dois majors foram tratados via merge da #347 (2026-11-06): vite-plugin-pwa `^2.0.0` permanece no `main`, mas **TypeScript 7 foi REVERTIDO** para `^5.3.0` — detalhes e evidência no bloco da #347 (commit `aba5965f`). `main` hoje (head `6c6df6fb`): typescript `^5.3.0`, vite-plugin-pwa `^2.0.0`.

---

## #252 — bump React 18.3.1→19.3.1

**URL:** https://github.com/adm01-debug/Promo_Champions_V2.1/pull/252

**Motivo do bloqueio:**
React 19 é um major com breaking changes que afetam potencialmente toda a codebase (163 páginas, 103 domínios de componentes):
- `forwardRef` removido — `ref` agora é prop direta
- Mudanças em `Suspense`, `useEffect`, `useTransition`
- `@types/react` 19 com tipos incompatíveis com React 18
- Risco de regressão em UI de produção

**O que precisa acontecer para liberar:**
1. Criar branch dedicada `feat/migrate-react-19`
2. Aplicar bump de React 18 → 19 e `@types/react` correspondente
3. Rodar codemod oficial: `npx react-codemod upgrade`
4. Corrigir manualmente componentes com `forwardRef` e outros que o codemod não cobre
5. Rodar `npm run typecheck` até limpo
6. Rodar `npm run test` (Vitest unit) e `npm run test:e2e` (Playwright) em fluxos críticos
7. Validar em ambiente de staging antes de mergear em `main`
8. Planejar janela de deploy — impacto em produção é alto

**Estado atual (reconciliação 2026-11-06):** ❌ NÃO APLICADO. O bump para React 19 não entrou no `main` — package.json@main (head `6c6df6fb`) mantém `react ^18.3.1`. Mesmo desfecho da #345.

**Referências:**
- React 19 upgrade guide: https://react.dev/blog/2024/04/25/react-19-upgrade-guide
- React 19 breaking changes: https://react.dev/blog/2024/12/05/react-19

---

## #345 — bump React 19

**URL:** https://github.com/adm01-debug/Promo_Champions_V2.1/pull/345

**Estado atual (reconciliação 2026-11-06):** ❌ FECHADA sem merge. O React 19 não entrou — `main` mantém `react ^18.3.1` (package.json@head `6c6df6fb`). Ver também #252.

---

## #347 — dependabot build-tools (5 deps)

**URL:** https://github.com/adm01-debug/Promo_Champions_V2.1/pull/347

**Estado atual (reconciliação 2026-11-06):** ✅ MERGIDA. `merge_commit_sha`=`b5797bd8`, head `0e8e65bf`, merge em 2026-11-06T01:05:22Z. 5 dependências: @vitejs/plugin-react-swc 4.3.3, rollup-plugin-visualizer 7.1.1, typescript 7.0.2, typescript-eslint 8.72.1, vite-plugin-pwa 2.0.0.

**Reversão do TypeScript 7 (peça central desta reconciliação):** o major `typescript ^7.0.2` trazido por esta PR foi **REVERTIDO** para `^5.3.0` no commit `aba5965f5e64ef48c856e383bee4d9ab288ced4d` (autor adm01-debug, 2026-11-06T01:44:47Z, parte do merge #363). Mensagem do commit literal: *'fix: reverte typescript ^7.0.2→^5.3.0 — typescript-eslint@8.x não suporta TS 7'*. Causa: o bump quebrou o check Lint & Type Check (issue #10940); `package-lock.json` e `deno.lock` regenerados. O mesmo commit também corrigiu 3 workflows (--remote em `supabase migration list`, `gerar-banco.mjs` sem `difPct`, cron-failure-alerter pulando E2E com `console.warn` em 401).

**Conclusão:** pendência resolvida no `main` — typescript `^5.3.0` (head `6c6df6fb`).