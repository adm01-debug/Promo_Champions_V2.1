

## Teste de integração: troca de filtros gera `chartKey` diferente

### Objetivo
Garantir, no nível do componente `ScenarioForecastChart`, que ao trocar filtros (horizonte, modo de banda, z, ou os próprios `points`) o `chartKey` propagado para o `ComposedChart` muda — protegendo contra futuras regressões na construção da key ou na propagação das deps do `useMemo`.

O teste unitário existente em `ScenarioChartKey.test.ts` cobre a função pura. Falta cobrir o caminho integrado: hook → memo → prop `key` do Recharts.

### Estratégia

Em vez de inspecionar o DOM do Recharts (frágil — `key` não vira atributo), mockar `recharts.ComposedChart` para capturar a prop `key` recebida em cada render e comparar entre cenários.

### Mudanças

**1. `src/test/components/winloss/ScenarioForecastChartKey.test.tsx`** (novo, ~120 linhas)

Setup:
- `vi.mock("recharts", ...)` — substituir `ComposedChart` por um stub que renderiza `<div data-testid="chart" data-chart-key={props.key}>`. Como React não expõe `key` via props, o stub real precisa receber a key indiretamente. Solução: o componente passa `chartKey` como prop normal num wrapper de teste **OU** usar `React.Children.map` num mock de `ResponsiveContainer` que captura o `key` do filho via `child.key`.
- Approach mais limpo: mockar `ResponsiveContainer` para que ele exponha o `key` do único filho (`React.Children.only(children).key`) num atributo `data-chart-key`. `ComposedChart` recebe a key via JSX `<ComposedChart key={chartKey} …/>`, e `React.Children.only(children).key` retorna exatamente essa string.
- Stub demais primitives do Recharts (`XAxis`, `YAxis`, `CartesianGrid`, `Tooltip`, `Legend`, `ReferenceLine`, `Area`, `Line`) como componentes vazios — evita warnings de SSR e aria.

Helpers:
- `makePoints(n)` → gera `TrendPoint[]` com `period: "p{i}"`, `winRate: 50 + i`, `wins: i`, `losses: i` para preencher `useWinLossScenarios` com `fitN ≥ 3`.
- `renderChart(props)` → `render(<ScenarioForecastChart {...props} />)` retornando `() => screen.getByTestId("scenario-chart-host").dataset.chartKey`.

Casos de teste (5):

1. **Troca de horizonte muda a key**
   - Render com `points = makePoints(8)`, `horizon = 3` → captura `keyA`.
   - Rerender com `horizon = 6` → `keyB`.
   - `expect(keyA).not.toBe(keyB)` e ambas começam com `scenario-see-`.

2. **Troca de modo de banda (SEE → PI 95%) muda a key**
   - Render inicial (default `see`), captura `keyA`.
   - Click no toggle `PI 95%` (`getByRole("radio", { name: /PI 95%/i })` ou `userEvent.click(getByText("PI 95%"))`).
   - Captura `keyB` → `expect(keyA).not.toBe(keyB)` e `keyB` contém `-pi95-`.

3. **Troca de z (95%) no popover muda a key**
   - Render default (z=1.00), `keyA`.
   - Click no botão `z=1.00 (68%)` para abrir popover; click no radio `95%`.
   - `keyB` deve conter `-z1.96-` e ser diferente de `keyA`.

4. **Troca de `points` (filtros externos) muda a key**
   - Render com `makePoints(8)`, `keyA`.
   - Rerender com `makePoints(12)`, `keyB`.
   - `expect(keyA).not.toBe(keyB)` e ambos contêm `-fit` (estado ready).

5. **Mesmos inputs mantêm a key estável (anti-flicker)**
   - Render duas vezes consecutivas com `points`, `horizon`, `bandMode`, `z` idênticos (rerender sem mudança).
   - `expect(keyA).toBe(keyB)` — garante que o `useMemo` não está recriando a key sem motivo (regressão de deps array).

### Não-mudanças
- Nenhuma alteração de produção: o componente, o hook e a função pura permanecem iguais.
- `ScenarioChartKey.test.ts` (testes unitários) continua intacto.
- Nenhum mock de localStorage — o setup global do vitest já provê `window.localStorage`.

### Critério de aceite
1. Arquivo novo `src/test/components/winloss/ScenarioForecastChartKey.test.tsx` com 5 testes verdes.
2. Stubs do Recharts isolam o teste de detalhes internos do gráfico (sem warnings de canvas/SVG).
3. Suíte completa do projeto continua verde — nenhum efeito colateral em outros testes que importam Recharts (mock é local ao arquivo via `vi.mock` com escopo do módulo).
4. Se a função `buildScenarioChartKey` voltar a colidir entre filtros (regressão), os 4 primeiros testes falham; se o `useMemo` for invalidado a cada render (regressão de performance), o teste 5 falha.

