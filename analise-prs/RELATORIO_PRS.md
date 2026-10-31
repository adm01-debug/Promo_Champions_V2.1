# Relatório de Análise de PRs — Promo Champions V2.1

> Análise realizada em: **2026-10-31**
> Escopo: todas as PRs abertas no repositório `adm01-debug/Promo_Champions_V2.1`

---

## Sumário Executivo

De 14 PRs abertas analisadas, **1 foi mergeada com sucesso** (lote 8 dependabot + deno.lock, #344, CI 100% verde, Vercel deploy confirmado), **8 foram automaticamente encerradas** por estarem incluídas naquele lote, e **5 requerem decisão humana**: três envolvem major bumps de dependências críticas (React 19, TypeScript 7, eslint-plugin-react-refresh 0.5) que quebram CI e exigem migração manual; uma está em DRAFT aguardando o owner marcar como ready (fix real de 4 bugs em scripts de auditoria); e uma tem conflito com `main` em branch de outra sessão que não pode ser rebaseada autonomamente.

---

## Tabela de Vereditos

| # PR | Título | Veredito | Motivo |
|------|--------|----------|--------|
| [#344](https://github.com/adm01-debug/Promo_Champions_V2.1/pull/344) | chore(deps): lote 8 dependabot + deno.lock | ✅ **MERGEADA** | CI verde. SHA squash: `c23e4e8b`. 3 arquivos. |
| [#309](https://github.com/adm01-debug/Promo_Champions_V2.1/pull/309) | bump vite 8.3.0→8.3.4 | 🔵 SUPERADO | Incluído em #344 |
| [#300](https://github.com/adm01-debug/Promo_Champions_V2.1/pull/300) | bump dependency-cruiser 18.5→18.7 | 🔵 SUPERADO | Incluído em #344 |
| [#299](https://github.com/adm01-debug/Promo_Champions_V2.1/pull/299) | bump @supabase/supabase-js | 🔵 SUPERADO | Incluído em #344 |
| [#297](https://github.com/adm01-debug/Promo_Champions_V2.1/pull/297) | bump postcss 8.5 | 🔵 SUPERADO | Incluído em #344 |
| [#296](https://github.com/adm01-debug/Promo_Champions_V2.1/pull/296) | bump papaparse 5.7 | 🔵 SUPERADO | Incluído em #344 |
| [#295](https://github.com/adm01-debug/Promo_Champions_V2.1/pull/295) | bump testing group | 🔵 SUPERADO | Incluído em #344 |
| [#294](https://github.com/adm01-debug/Promo_Champions_V2.1/pull/294) | bump radix-ui group | 🔵 SUPERADO | Incluído em #344 |
| [#256](https://github.com/adm01-debug/Promo_Champions_V2.1/pull/256) | bump @commitlint/config-conventional | 🔵 SUPERADO | Incluído em #344 |
| [#298](https://github.com/adm01-debug/Promo_Champions_V2.1/pull/298) | bump eslint-plugin-react-refresh 0.4→0.5 | 🟡 DECISÃO HUMANA | Major bump; quebra lint/type; requer migração |
| [#281](https://github.com/adm01-debug/Promo_Champions_V2.1/pull/281) | fix: 4 bugs em scripts de auditoria | 🟡 DECISÃO HUMANA | DRAFT — owner deve marcar como ready |
| [#280](https://github.com/adm01-debug/Promo_Champions_V2.1/pull/280) | fix: gen-migration-probes (DROP, schemaname, cmd) | 🟡 DECISÃO HUMANA | CONFLITO com main. Branch de outra sessão |
| [#254](https://github.com/adm01-debug/Promo_Champions_V2.1/pull/254) | bump TS 7 + vite-plugin-pwa 2 (major) | 🟡 DECISÃO HUMANA | Major bumps; quebras em tsconfig e PWA |
| [#252](https://github.com/adm01-debug/Promo_Champions_V2.1/pull/252) | bump React 18.3.1→19.3.1 | 🟡 DECISÃO HUMANA | Major — API ref nova, lifecycle, types |

---

## O que Foi Feito

### ✅ Merge de #344 — chore(deps): lote 8 dependabot + deno.lock

PR mergeada via squash em `main` com SHA `c23e4e8b42aa1c9ccda6f710285766ab2dd7ed1a`.

**Motivação principal:** o `deno.lock` estava desatualizado, causando falha consistente no check **Edge Functions Lint (deno)** do CI. A PR consolidou 8 dependabot PRs abertas em um único lote seguro.

**Checks que passaram (13/13):**
- Lint & Type Check
- Build
- Unit Tests
- Edge Functions Lint (deno)
- Edge Functions Tests
- Migrations Gate
- SQL Suites
- Security Audit
- Bundle Size
- K6 Load
- Lighthouse
- Supabase Types Drift
- CI Gate

**Arquivos alterados:** `package.json`, `package-lock.json`, `supabase/functions/deno.lock` (3 arquivos)

**Deploy Vercel:** sucesso após merge.

---

## PRs Superadas (8 dependabot incluídas no lote)

Todas as PRs abaixo foram encerradas automaticamente pelo GitHub após o merge de #344, que as incorporou:

| # | Pacote | Bump |
|---|--------|------|
| #256 | @commitlint/config-conventional | patch/minor |
| #294 | radix-ui group | patch/minor |
| #295 | testing group | patch/minor |
| #296 | papaparse | 5.x → 5.7 |
| #297 | postcss | 8.4 → 8.5 |
| #299 | @supabase/supabase-js | patch/minor |
| #300 | dependency-cruiser | 18.5 → 18.7 |
| #309 | vite | 8.3.0 → 8.3.4 |

Nenhuma ação adicional necessária — todas encerradas.

---

## Decisões Humanas (5 PRs pendentes)

### 🟡 #298 — bump eslint-plugin-react-refresh 0.4→0.5

**Bloqueio:** Major bump do plugin ESLint. A versão 0.5 introduz novas regras e renomeia configurações existentes, quebrando `lint` e `typecheck` no CI.

**O que precisa acontecer:**
1. Atualizar `.eslintrc` (ou `eslint.config.js`) para as novas regras da versão 0.5
2. Corrigir qualquer arquivo que viole as novas regras
3. Validar localmente com `npm run lint` e `npm run typecheck`
4. CI verde → mergear

---

### 🟡 #281 — fix: 4 bugs em scripts de auditoria (DRAFT)

**Bloqueio:** PR está em DRAFT. O código é válido e os fixes são reais.

**Fixes implementados:**
- **RegExp g-flag lastIndex:** regex com flag `g` reutilizados entre chamadas causavam lastIndex incorreto
- **CREATE_TABLE before stripComments:** SQL com comentários antes de CREATE TABLE não era detectado
- **SQL injection em probe literals (pgLit):** literais não escapados em queries de probe
- **views vs BASE TABLE:** filtro `table_type = 'BASE TABLE'` excluía views indevidamente em alguns checks

**O que precisa acontecer:** owner marcar a PR como **Ready for review** (tirar do DRAFT). CI deve passar e a PR pode ser mergeada.

---

### 🟡 #280 — fix: gen-migration-probes (DROP, schemaname, cmd) — CONFLITO

**Bloqueio:** conflito de merge com `main` após o squash de #344. A branch pertence a outra sessão — rebase não pode ser feito autonomamente.

**Fix válido implementado:**
- DROP reconciliation: objetos dropados não eram comparados corretamente no probe
- `schemaname` ausente: queries sem schema qualificado falhavam em schemas não-public
- `policy cmd`: comando de política retornava valor errado no probe de RLS

**O que precisa acontecer:** rebasear a branch `fix/gen-migration-probes-*` em `main` atual, resolver conflitos, e re-push. CI deve passar.

---

### 🟡 #254 — bump TS 7 + vite-plugin-pwa 2 (major)

**Bloqueio:** dois major bumps simultâneos com quebras de API:
- **TypeScript 7:** mudanças em resolução de módulos, algumas opções de `tsconfig.json` depreciadas/removidas
- **vite-plugin-pwa 2:** API de configuração do Service Worker e Workbox mudou significativamente

**O que precisa acontecer:**
1. Atualizar `tsconfig.json` para remover opções incompatíveis com TS 7
2. Migrar configuração do `vite-plugin-pwa` para a nova API v2
3. Testar build de produção e comportamento do Service Worker
4. CI verde → mergear (ou aguardar janela de migração planejada)

---

### 🟡 #252 — bump React 18.3.1→19.3.1

**Bloqueio:** React 19 é um major com breaking changes significativos em toda a codebase:
- `forwardRef` removido — componentes precisam receber `ref` como prop diretamente
- Mudanças em lifecycle de `useEffect` e `Suspense`
- Tipos TypeScript (`@types/react`) com incompatibilidades
- Risco de regressão em todos os 163 componentes de página

**O que precisa acontecer:**
1. Criar branch de migração dedicada
2. Executar codemod oficial do React 19 (`npx react-codemod`)
3. Corrigir manualmente o que o codemod não alcança (especialmente `forwardRef`)
4. Testes extensivos — E2E Playwright em fluxos críticos
5. Planejamento de janela de deploy — impacto em produção é alto

---

## Próximos Passos para Fechar as 5 Decisões Humanas

| Prioridade | PR | Ação | Esforço |
|------------|-----|------|---------|
| 1 | #281 | Marcar como Ready (tirar do DRAFT) | < 1 min |
| 2 | #280 | Rebasear branch em main e re-push | ~30 min |
| 3 | #298 | Migrar config ESLint para react-refresh 0.5 | ~2h |
| 4 | #254 | Migrar tsconfig + vite-plugin-pwa config | ~1 dia |
| 5 | #252 | Migração React 19 completa | 2-5 dias |
