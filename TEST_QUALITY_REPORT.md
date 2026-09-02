# 📊 Relatório Real de Qualidade e Testes

**Status:** dados medidos diretamente, sem números fabricados.
**Última medição:** 2026-09-02 (re-execução completa de `eslint`, `tsc`, `vitest`, `vitest --coverage`, `npm run build`).

> Este arquivo substituiu uma versão anterior (gerada em 2026-05-19) que afirmava "10/10 Enterprise Perfection" e 97,6% de cobertura total, incluindo 100% em Edge Functions. Essa versão não correspondia a nenhuma saída real de ferramenta — foi confirmado, com prova documental (`vitest.config.ts`), que a cobertura instrumentada sempre foi restrita a um subconjunto pequeno de arquivos puros, nunca ao sistema inteiro. Ver `docs/auditoria/` para o histórico da investigação.

## Gates locais (execução completa, sem cortes)

| Verificação        | Resultado                      | Evidência                                                             |
| ------------------ | ------------------------------ | --------------------------------------------------------------------- |
| `npx eslint .`     | ✅ 0 erros, 0 warnings         | 2114 arquivos `.ts`/`.tsx` (padrão de inclusão do `eslint.config.js`) |
| `npx tsc --noEmit` | ✅ 0 erros                     | strict mode ativo                                                     |
| `npx vitest run`   | ✅ 469 testes passando, 2 skip | 52 suites, ~28s                                                       |
| `npm run build`    | ✅ build de produção completo  | inclui geração de PWA/service worker                                  |

## Cobertura real (`vitest run --coverage`)

A configuração de cobertura (`vitest.config.ts`) instrumenta **apenas 16 arquivos**, deliberadamente escopados como "Tier-1: código puro crítico" (comentário no próprio arquivo de config):

```
src/lib/winloss/severityFromScore.ts, scenarioChartKey.ts, riskReasons.ts
src/lib/mergeTags.ts, gamification.ts, orderTracking/stages.ts, utils.ts
src/utils/dateHelpers.ts, fuzzing.ts
src/lib/revenueForecast/forecastEngine.ts, csvExport.ts
src/lib/auth/passwordErrorMessages.ts
src/components/reporting/funnelReportHelpers.ts
src/hooks/reports/salesReportHelpers.ts
src/services/salesService.ts
src/lib/staleAssetRecovery.ts
```

Nesses 16 arquivos, a cobertura é de fato alta (statements 99,93% / branches 96,21% / functions 100% / lines 99,93%). **Isso corresponde a ~0,76% da árvore de código-fonte de `src/`** (16 de ~2114 arquivos) — não é uma medida representativa do sistema como um todo, e não deve ser citada como tal.

Componentes React de página e fluxos completos são cobertos por E2E (Playwright), não por esta suíte de cobertura unitária.

## Edge Functions (Deno)

- 172 diretórios em `supabase/functions/`.
- 82 arquivos de teste (`*_test.ts`/`*.test.ts`), cobrindo **28 diretórios de função com pelo menos 1 teste (~16%)**.
- Não existe instrumentação de cobertura de código para Deno neste projeto — a alegação anterior de "100% Edge Functions" não correspondia a nenhuma execução real de ferramenta.
- Funções com cobertura mais forte: `detect-winloss-at-risk` (14 arquivos de teste), `winloss-webhook-dispatcher` (10).

## E2E (Playwright)

- `npx playwright test --list`: 483 testes descobertos em 46 arquivos.
- 47 arquivos `.spec.ts` existem em disco — 1 não é reconhecido pela config atual do Playwright (`testDir`/pattern); vale investigar.
- Cobre fluxos críticos reais: autenticação, pipeline/CRM core, BI, `quote-to-sale` (11 specs dedicados a condições de corrida e idempotência), RLS por role.

## Type Safety

- `strict: true` no `tsconfig.app.json`.
- Apenas 4 usos reais de `: any` em `src/`, todos com justificativa.
- 236 ocorrências de `as unknown as` (double-cast) — débito técnico real, não coberto por lint hoje.

## Próximos gaps de teste (por prioridade)

1. Priorizar testes unitários para as edge functions financeiras/críticas ainda sem cobertura (cotações, comissões, forecast).
2. Investigar o spec `.ts` órfão não reconhecido pelo Playwright.
3. Adicionar regra de lint contra `as unknown as` para conter o crescimento do débito.
