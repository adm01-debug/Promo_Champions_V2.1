# Release v2.1.0 — Mega-Jornada 10/10

**Data:** 2026-07-12

Consolida cinco frentes de excelência: segurança, bundle, cobertura, novos módulos e refactor de performance.

---

## 🛡️ Segurança (Hardening)

- **HIBP ativado** (`configure_auth: password_hibp_enabled: true`): senhas vazadas conhecidas são bloqueadas em toda troca de senha.
- **`classifyPasswordError`** em `src/lib/auth/passwordErrorMessages.ts`: traduz erros do Supabase Auth em mensagens PT-BR (`leaked`, `too_short`, `same_as_old`, `rate_limited`, `unknown`).
- **`/reset-password`** agora exige mínimo de 8 caracteres e exibe a mensagem HIBP correta ("Essa senha aparece em vazamentos públicos conhecidos…").
- **4 policies permissivas removidas** (findings críticos de exposure):
  - `lead_churn_risk` — dropou `Public read` (USING true); substituído por acesso de admins/managers e do vendedor dono da venda.
  - `quote_sync_logs` — dropou `Vendedores podem ver logs`; leitura restrita a admins/managers.
  - `victory_feed` — dropou `Anyone can view victory feed`; leitura só para autenticados.
  - `whatsapp_template_versions` — dropou `Venders can view active template versions`; leitura só para autenticados.
- **`jspdf` 2.5.2 → 4.2.1** — remedia GHSA-f8cm-6447-x5h2 (Path Traversal) e GHSA-wfv2-pwc8-crg5 (HTML Injection).
- Security memory atualizada com aceites intencionais das funções `SECURITY DEFINER` pré-auth.

## ⚡ Otimização de bundle

- **`RevenueIntelligenceHub`** refatorado: 18 hubs internos migrados de import estático para `React.lazy` + `Suspense`. Chunk inicial de `/revenue-intelligence` caiu de ~200 KB para **~16.7 KB** (≈ **90 %** menos).
- Cada aba carrega sob demanda o próprio bundle (BriefingHub 11 KB, PipelinePulseHub 10 KB, WinLossHub 9 KB, etc.).

## 🧪 Cobertura Tier-1

- Coverage enforced (`vitest.config.ts`): **lines 85 % / branches 75 % / functions 85 %**.
- Estado atual: **99.43 % lines / 90.25 % branches / 100 % functions** em **220 testes verdes**.
- Novos módulos no escopo Tier-1: `hooks/reports/salesReportHelpers`, `components/reporting/funnelReportHelpers`, `services/salesService`, `lib/revenueForecast/csvExport`, `lib/auth/passwordErrorMessages`.

## 🚀 Novos módulos funcionais

- **`Revenue Forecast v2`** (`/revenue-forecast-v2`): ensemble Holt-Winters + regressão linear + Monte Carlo com bandas P10/P50/P90, simulador what-if (Δ win rate, Δ ticket, Δ velocity, horizonte 1–24m) e export CSV.
- **`WinLossAnalysis`** refatorado em 4 subcomponentes memoizados (`WinLossKpiCards`, `WinLossMonthlyTrend`, `WinLossReasonsPanels`, `WinLossDrillDown`); página caiu de 366 para 88 linhas.

## 🧭 Testes E2E adicionados

- `tests/e2e/revenue-forecast-v2.spec.ts` — sliders what-if, bandas P10/P50/P90, export CSV com validação de header e linhas.
- `tests/e2e/reset-password-hibp.spec.ts` — `Password123!` bloqueado com toast PT-BR, senha forte aceita, senha curta rejeitada client-side.

## 🔧 Migrações de banco (aplicadas)

1. `20260712183258_…` — infraestrutura Revenue Forecast v2.
2. `2026-07-12 hardening` — remoção das 4 policies permissivas + policies restritas em `lead_churn_risk`.

## ✅ Validações finais

- `tsgo --noEmit`: **0 erros**.
- `vitest run --coverage`: **220/220 verdes**, 99.43 % lines.
- `code--dependency_scan`: **sem vulnerabilidades HIGH/CRITICAL**.
- `security--get_scan_results`: **0 findings ativos**.
- Linter Supabase: apenas warnings de `SECURITY DEFINER` executable (aceites intencionais, documentados em security memory).

---

## 🔗 Breaking changes

Nenhum.

## 📌 Notas para o time

- Reset de senha rejeita senhas fracas conhecidas — comunicar suporte.
- `/revenue-forecast-v2` disponível para roles `admin`/`manager` via guard.
- `jspdf` v4 mantém API compatível com os wrappers atuais (`pdfExporter.ts`, `quotePdfExporter.ts`, `salesReportPdf.ts`).
