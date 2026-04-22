

## Testes: alternância SEE ↔ PI 95% remonta o gráfico e altera bandas

### Objetivo
Garantir, no nível de componente, que ao trocar o modo de banda no `ScenarioForecastChart`:
1. O gráfico **remonta** (chartKey muda — Recharts reseta escalas/cache).
2. As **larguras das bandas** dos pontos de previsão mudam de fato (não é só rótulo cosmético).
3. A **predição central** (`realistic`) permanece idêntica — só a incerteza muda.
4. O comportamento é **idempotente** (voltar de PI→SEE restaura a chave original).

### Arquivo único

**`src/test/components/winloss/ScenarioForecastBandModeSwitch.test.tsx`** (novo, ~180 linhas)

Estende o stub de `recharts` já usado nas outras suítes para também **capturar `props.data`** do `ComposedChart` numa variável `lastChartData` mutável, atualizada a cada render. Isso permite inspecionar `realistic`/`optimistic`/`pessimistic` diretamente, sem depender do DOM do gráfico.

### Casos (8 testes)

1. **Prefixo da chave muda** — `scenario-see-…` → `scenario-pi95-…` ao clicar no toggle PI 95%.
2. **Hash da assinatura muda** — sufixo `-[0-9a-f]{8}` da chave é diferente entre os dois modos (prova que o payload completo dos pontos mudou, não só o label).
3. **Idempotência SEE → PI → SEE** — voltar para SEE restaura **exatamente** a chave inicial.
4. **PI 95% > SEE em largura** — para cada step de previsão, `optimistic - pessimistic` em PI 95% é estritamente maior que em SEE com z=1 (multiplicador t-Student > 1).
5. **PI 95% se alarga ao longo do horizonte** — sequência de larguras é não-decrescente; última > primeira (incerteza acumulada via `(x−x̄)²/Sxx`).
6. **Histórico colapsado nos dois modos** — `optimistic === pessimistic` para todo `!isForecast`.
7. **Predição central inalterada** — `realistic[]` dos pontos `isForecast` é idêntico em SEE e PI 95% (a reta OLS não muda; só a banda).
8. **Ida e volta rápida** — sequência click→click→assert prova que não há estado preso intermediário.

### Mudanças
- **Único arquivo novo**: o teste acima.
- Nenhuma alteração em código de produção.
- Stub de `recharts` é local ao arquivo (`vi.mock` com escopo do módulo) — não afeta outras suítes.

### Critério de aceite
1. 8 testes verdes em `ScenarioForecastBandModeSwitch.test.tsx`.
2. Suítes existentes (`ScenarioForecastChartKey`, `ScenarioForecastPersistence`, `ScenarioChartKey`, `useDebouncedValue`) seguem verdes.
3. Se uma futura regressão tornar a banda PI 95% colapsada (igual à SEE), o teste 4 falha.
4. Se a predição central começar a oscilar entre modos (bug onde `bandMode` afeta `slope`), o teste 7 falha.
5. Se o `chartKey` deixar de incluir `bandMode` no payload do hash, o teste 2 falha.

