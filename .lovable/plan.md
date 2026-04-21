

## Persistir preferências de visualização Win/Loss (horizonte + granularidade)

### Objetivo
Salvar as escolhas do usuário de **granularidade** (semanal/mensal) e **horizonte de previsão** (3, 6 ou 12 períodos) entre sessões, e expor um seletor de horizonte no `ScenarioForecastChart` (hoje fixo em 3).

### Mudanças

**1. Novo hook `src/hooks/win-loss/useWinLossViewPrefs.ts`**
Modelo igual ao `useAtRiskSettings` (já existente, padrão consolidado): localStorage versionado + `sanitize()` + `update/reset`.

```ts
export interface WinLossViewPrefs {
  granularity: "week" | "month";
  forecastHorizon: 3 | 6 | 12;
}
export const VIEW_PREFS_DEFAULTS = { granularity: "month", forecastHorizon: 3 };
```

- Storage key: `winloss-view-prefs`, schema version `1`.
- `sanitize` valida enum (fallback para default em valor inválido).
- API: `{ prefs, update(partial), reset() }`.

**2. `WinLossTrendChart.tsx`**
- Remover `useState` local de `gran`.
- Aceitar `granularity` + `onGranularityChange` via props (controlled). Manter `compare` local (não é uma preferência persistente — pertence ao gesto da sessão).
- Os botões "Semanal/Mensal" passam a usar essas props.

**3. `ScenarioForecastChart.tsx`**
- Adicionar prop opcional `horizon?: 3 | 6 | 12` (default `3`) e `onHorizonChange?`.
- No header, ao lado do `ToggleGroup` do bandMode, novo `ToggleGroup` "3 / 6 / 12" com `aria-label="Horizonte de previsão"`.
- Passar `forecastSteps: horizon` para o hook.
- Incluir `horizon` no `chartKey` para garantir reset limpo do Recharts.

**4. `pages/WinLossIntelligence.tsx`**
- Instanciar `useWinLossViewPrefs()` uma vez.
- Passar `prefs.granularity` + `update({ granularity })` para `WinLossTrendChart`.
- Passar `prefs.forecastHorizon` + `update({ forecastHorizon })` para `ScenarioForecastChart`.
- (As preferências persistem automaticamente via efeito do hook — sem tocar em URL/searchParams; horizonte e granularidade são preferências de UI, não filtros compartilháveis.)

**5. Testes — `src/test/hooks/useWinLossViewPrefs.test.ts` (novo)**
Replicar a estrutura de `useAtRiskSettings.test.ts`:
- defaults quando storage vazio
- `update` parcial persiste e mescla
- `sanitize` rejeita valores inválidos (granularity="dia", horizon=99)
- `reset` restaura defaults
- fallback em JSON inválido / version errada

Rodar `npx vitest run src/test/hooks/useWinLossViewPrefs.test.ts` — esperado **6/6**.

### Detalhes técnicos
- Padrão segue `useAtRiskSettings` (mesma forma de SSR-safe, versionamento, clamp/whitelist). Sem nova dependência.
- `forecastHorizon` afeta apenas a quantidade de steps projetados; bandas continuam respeitando o `bandMode` já persistido em `winloss-scenario-bandmode` (preferência separada — não consolidamos os dois storages para preservar retrocompatibilidade).
- `compare` no trend chart **não** é persistido (decisão consciente: é um toggle de exploração).
- `granularity` deixa de ser estado local do componente — fica controlled a partir da página.

### Arquivos
- **Criar**: `src/hooks/win-loss/useWinLossViewPrefs.ts`
- **Criar**: `src/test/hooks/useWinLossViewPrefs.test.ts`
- **Modificar**: `src/components/win-loss/WinLossTrendChart.tsx`
- **Modificar**: `src/components/win-loss/ScenarioForecastChart.tsx`
- **Modificar**: `src/pages/WinLossIntelligence.tsx`

### Ordem
1. Criar hook + testes (rodar suite).
2. Tornar `WinLossTrendChart` controlled na granularidade.
3. Adicionar seletor de horizonte ao `ScenarioForecastChart`.
4. Plugar prefs na página.

