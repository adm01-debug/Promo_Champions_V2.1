

## Persistência do seletor de modo de banda — verificação + cobertura de testes

### Estado atual (já implementado)
O `ScenarioForecastChart` **já persiste** corretamente no `localStorage`:

- Chave `winloss-scenario-bandmode` (`"see"` | `"pi95"`) — função `readBandMode()` no init + `useEffect` grava em toda mudança.
- Chave `winloss-scenario-confidence-z` (número entre 0.5 e 3.0) — função `readConfidenceZ()` com sanitização (range + `Number.isFinite`) + `useEffect` grava como string.
- Migração silenciosa: a chave legada `winloss-scenario-see-ols-inflation` é removida no mount.
- `useState(() => readX())` lazy-init garante que o valor restaurado já aparece **no primeiro render** após reload — sem flash de default.

Ao recarregar a página, o gráfico já reflete o último modo escolhido. Não há bug a corrigir.

### O que falta: cobertura de testes contra regressão

Hoje só existem testes da **mudança via UI** (`ScenarioForecastChartKey.test.tsx`). Não há teste que prove que:
1. Um valor pré-existente em `localStorage` é honrado no mount.
2. A escrita acontece (não só a leitura).
3. Sanitização de valores corruptos funciona.
4. O ciclo completo "trocar → desmontar → remontar → restaurar" preserva a escolha.

### Mudança única

**`src/test/components/winloss/ScenarioForecastPersistence.test.tsx`** (novo, ~110 linhas)

Reaproveita o mesmo stub de `recharts` (ResponsiveContainer expõe `key` via `data-chart-key`) usado em `ScenarioForecastChartKey.test.tsx`. 9 casos:

1. **Default `see`** quando localStorage vazio → key começa com `scenario-see-`.
2. **Restaura `pi95`** pré-gravado em localStorage no mount → key começa com `scenario-pi95-`.
3. **Restaura `confidenceZ=1.96`** pré-gravado → key contém `-z1.96-`.
4. **Sanitização de range**: `confidenceZ="999"` → cai para `1.00`.
5. **Sanitização de tipo**: `confidenceZ="abc"` → cai para `1.00`.
6. **Roundtrip bandMode**: clica `PI 95%` → localStorage gravado → unmount → remount → key restaurada.
7. **Roundtrip z**: clica `95%` no popover → localStorage gravado → unmount → remount → key restaurada.
8. **Migração legada**: `winloss-scenario-see-ols-inflation` pré-existente é removido no mount.
9. **Sanitização de bandMode inválido**: valor estranho em localStorage → cai para `see`.

### Não-mudanças
- Nenhum arquivo de produção alterado. A implementação atual já é correta.
- `useDebouncedValue`, `buildScenarioChartKey`, `useWinLossScenarios`: intactos.
- Testes existentes (14 entre `ScenarioChartKey.test.ts`, `ScenarioForecastChartKey.test.tsx`, `useDebouncedValue.test.ts`): permanecem verdes.

### Critério de aceite
1. 9 testes novos verdes em `ScenarioForecastPersistence.test.tsx`.
2. `localStorage.getItem("winloss-scenario-bandmode")` retorna `"pi95"` após click em `Modo PI 95%`.
3. `localStorage.getItem("winloss-scenario-confidence-z")` retorna `"1.96"` após selecionar 95% no popover.
4. Após remount limpo (cleanup + render), a key do gráfico reflete os valores persistidos sem precisar interagir.
5. Suíte completa do projeto continua verde.

