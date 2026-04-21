

## Reforçar `chartKey` do `ScenarioForecastChart` para refletir filtros + série

### Estado atual
`src/components/win-loss/ScenarioForecastChart.tsx` já passa uma `key` ao `<ComposedChart>` (linhas 88-93, 151), mas a chave é fraca:

```ts
`scenario-${data.length}-${data[0]?.period ?? ""}-${stdDev.toFixed(2)}-${fitN}`
```

Duas séries diferentes (ex.: troca de filtro de vendedor que mantém o mesmo número de períodos e o mesmo período inicial) podem coincidir em `length`, `period[0]`, `stdDev` arredondado e `fitN` — Recharts então reaproveita escalas internas e renderiza inconsistente (eixos cacheados, tooltip "preso", animações fora de sincronia).

### Mudança
Tornar a key uma **assinatura completa do dataset projetado**, garantindo que qualquer mudança de filtro que altere os pontos resulte em key nova:

```ts
const chartKey = useMemo(() => {
  const signature = data
    .map(d => `${d.period}:${d.realistic}:${d.pessimistic}:${d.optimistic}:${d.isForecast ? 1 : 0}`)
    .join("|");
  return `scenario-${data.length}-${fitN}-${stdDev.toFixed(2)}-${signature}`;
}, [data, stdDev, fitN]);
```

Aplicada em `<ComposedChart key={chartKey} …>` (já está; só o conteúdo da key muda).

### Por que funciona
- Inclui **todos os valores de cada ponto** (período + 3 cenários + flag forecast). Qualquer troca de filtro que reescreva a série derruba a key.
- `data` já é memoizado (linha 68-80) → a string da signature só recomputa quando a série muda de fato; sem custo extra em renders idle.
- Custo da `join` é O(n) sobre no máx ~20 pontos (histórico + 3 forecast) — desprezível vs. o reflow do Recharts.
- Mantém os campos antigos (`length`, `fitN`, `stdDev`) como prefixo curto, útil em devtools.

### Detalhes técnicos
- Sem mudança de API do componente nem do hook `useWinLossScenarios`.
- Sem mudança em `useMemo` deps (`data` já capturava `series`).
- Não introduz novos imports.

### Arquivo afetado
- `src/components/win-loss/ScenarioForecastChart.tsx` — substituir o bloco `chartKey` (linhas 88-93).

### Ordem
1. Substituir o `useMemo` da `chartKey` pela versão com signature completa.
2. Confirmar visualmente que o gráfico atualiza ao alternar filtros (Recharts faz unmount/remount limpo).

