# Baseline — Estado do Repositorio

> Data: 2026-10-31
> SHA main: `7e7ca4342ce9e96ed74f277f7027101b9ff9cdf9`
> Fonte: resultados de CI das PRs mergeadas (evidencia real; nao executado localmente)

## Resumo

| Check | Status | Fonte |
|-------|--------|-------|
| Lint & Type Check | PASS | CI PR #350, SHA `7e7ca434` |
| Build Check | PASS | CI PR #350, SHA `7e7ca434` |
| Unit Tests | PASS | CI PR #348 head `74c8108b` |
| SQL Suites | PASS | CI PR #348 head `74c8108b` |
| Edge Functions Lint | PASS | CI PR #348 head `74c8108b` |
| Edge Functions Tests | PASS | CI PR #348 head `74c8108b` |
| Security Audit | PASS | CI PR #348 head `74c8108b` |
| Migrations Gate | PASS | CI PR #348 head `74c8108b` |
| Supabase Types Drift | PASS | CI PR #348 head `74c8108b` |
| CI Gate | PASS | CI PR #348 head `74c8108b` |
| Bundle Size Check | PASS | CI PR #348 head `74c8108b` |
| E2E Tests | IN_PROGRESS | CI PR #348 — nao e gate obrigatorio (C3) |
| Lighthouse | IN_PROGRESS | CI PR #348 — nao e gate obrigatorio |

## Stack Verificada

- React: 18.3.x (package.json SHA c23e4e8b)
- TypeScript: 5.x
- Vite: versao atual
- Supabase CLI: gerenciado por CI

## Falhas Herdadas (nao introduzidas nesta sessao)

- E2E sem gate obrigatorio: C3 — DECISAO HUMANA (requer edicao de `.github/workflows`)
- PRs de dependencias major pendentes: #252 (React 19), #254 (TS 6), #298, #345, #347

## Notas

Baseline nao executado localmente (acesso read-only ao checkout original).
Todos os valores sao extraidos de saidas de CI reais de PRs mergeadas nesta sessao.
