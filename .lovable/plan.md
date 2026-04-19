
Plano de execução autônoma para corrigir os 4 bugs do relatório Race Arena, um por vez, até atingir 10/10.

## Sequência de execução (sem pausas, sem perguntas)

**Fix 1 — B1 (Médio): Backfill `race_scoring_rules`**
- Migration que insere regras default para a temporada ativa "Temporada de Estreia 🏁" (closer) usando `ROLE_METRICS.closer` de `useRaceScoringRules.ts`:
  - `sales_value`: weight 1.0, points_per_unit 0.001 (1pt por R$1.000)
  - `markup_pct`: weight 1.0, points_per_unit 10 (1% = 10pts)
  - `new_clients_activated`: weight 1.0, points_per_unit 50
  - `routine_compliance`: weight 1.0, points_per_unit 5
- Idempotente via `ON CONFLICT (season_id, metric_code) DO NOTHING`.
- Cobre também qualquer temporada ativa SDR futura via loop sobre `race_seasons WHERE is_active = true`.

**Fix 2 — B2 (Baixo): `getPresetById` respeita `DEFAULT_PRESET_ID`**
- Em `src/components/race/raceColors.ts`, alterar fallback para:
  ```ts
  return RACE_CAR_PRESETS.find(p => p.id === DEFAULT_PRESET_ID) ?? RACE_CAR_PRESETS[0];
  ```
- Atualizar `raceColors.test.ts` (testes `getPresetById null/undefined/empty/unknown`) para esperar `DEFAULT_PRESET_ID`.

**Fix 3 — B3 (Baixo): `inferPresetFromColors` com tie-breaker de `secondary`**
- Aceitar parâmetro opcional `secondary?: string`; quando vários presets compartilham `primary+style`, desempatar por `secondary` (case-insensitive); manter assinatura backward-compatible.
- Atualizar callers se necessário (busca rápida confirma uso só em customizer).
- Adicionar testes cobrindo o desempate.

**Fix 4 — B5 (Info): `race-commentary` retorna 200/skipped sem `LOVABLE_API_KEY`**
- Em `supabase/functions/race-commentary/index.ts`, trocar o early-return 500 por:
  ```ts
  return new Response(JSON.stringify({ commentary: "", skipped: true, reason: "no_api_key" }), { status: 200, headers: ... });
  ```
- Atualizar `index_test.ts` para refletir o novo contrato.

## Validação após cada fix
- Fix 1: `SELECT count(*) FROM race_scoring_rules WHERE season_id = '12cba1ad-...'` → 4.
- Fix 2/3: rodar `vitest` na suíte race; tudo verde.
- Fix 4: rodar `supabase--test_edge_functions` em `race-commentary`; deploy.

## Entregáveis finais
- 1 migration SQL (Fix 1)
- 2 arquivos editados em `src/components/race/raceColors.ts` + testes (Fix 2, 3)
- 1 edge function + teste editados (Fix 4)
- Atualização do `docs/reports/race-arena-test-report.md` marcando B1–B5 como ✅ resolvidos
- Status final: módulo Race Arena **10/10**.

Execução começa imediatamente após sua aprovação.
