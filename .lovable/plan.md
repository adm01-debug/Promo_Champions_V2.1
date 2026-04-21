

## Legenda dinâmica sobreposta ao gráfico (fórmula + parâmetros ativos)

### Objetivo
Hoje a fórmula ativa só aparece como texto fino no header e detalhada no painel de auditoria colapsado. Quando o usuário olha direto pro gráfico (print, screenshot, apresentação), não há indicação visual de qual modo está ativo. Adicionar uma **legenda compacta sobreposta ao canto do plot** com a fórmula resumida e os parâmetros principais — sempre visível, sem precisar abrir nada.

### Conteúdo da legenda

Pequeno chip no canto superior direito da área do gráfico, com 3 linhas:

**Modo SEE**
```
SEE · ±z·σ
z = 1.96  (95%)
σ = 4.2 pp · fit n=12
```

**Modo PI 95%**
```
PI 95% · ±t·σ·√(1+1/n+(x−x̄)²/Sxx)
t = 2.18  (gl=10)
σ = 4.2 pp · fit n=12
```

- Largura ~220px, fundo `bg-popover/85` com `backdrop-blur-sm`, borda `border-border/60`, `rounded-md`, padding `px-2 py-1.5`, números em `text-[10px] font-mono tabular-nums`.
- Posicionamento: `absolute top-2 right-3 z-10` dentro de um wrapper `relative` ao redor do `ResponsiveContainer`.
- Primeira linha (fórmula) usa `text-foreground` + ícone `Sigma` 12px à esquerda; demais linhas em `text-muted-foreground`.
- `aria-live="polite"` com label completo para leitores de tela ("Fórmula ativa: PI 95%, t crítico 2.18, σ 4.2 pp em 12 períodos").
- `hidden sm:block` em viewport <640px (mobile mantém apenas o `<span>` do header para não disputar espaço).

### Mudança única

**`src/components/win-loss/ScenarioForecastChart.tsx`**

1. Novo subcomponente local `ActiveFormulaBadge` (~30 linhas) recebendo `bandMode`, `confidenceZ`, `tCritical`, `dof`, `stdDev`, `fitN`, `zPctLabel`. Renderiza JSX condicional ao modo.
2. Envolver `<ResponsiveContainer>` (linha 424) num `<div className="relative h-full w-full">` e posicionar `<ActiveFormulaBadge … />` como `absolute top-2 right-3 z-10`.
3. Adicionar `sm:hidden` ao `<span>` do header (linhas 413-420) para evitar duplicação visual em viewports onde a badge aparece.
4. Estados `fitN < 3` (linha 237) e empty (linha 219): badge **não** é renderizada — esses estados já têm sua própria mensagem central no card.

### Não-mudanças
- `useWinLossScenarios`, `buildScenarioChartKey`, debounce, persistência localStorage, painel de auditoria, modal explicativo, tooltips dos toggles — intactos.
- Sem mudança em testes existentes; eles validam `chartKey` via `data-chart-key`, não o conteúdo do header.
- Sem nova string traduzida; texto inline PT-BR alinhado ao restante do card.

### Critério de aceite
1. `bandMode="see"` + `z=1.96`: badge mostra `SEE · ±z·σ` / `z = 1.96 (95%)` / `σ = X pp · fit n=N`.
2. Trocar para `bandMode="pi95"`: badge atualiza para `PI 95% · ±t·σ·√(1+1/n+(x−x̄)²/Sxx)` / `t = X (gl=N)` / `σ = X pp · fit n=N`.
3. Mudar z no popover SEE: linha 2 da badge atualiza instantaneamente.
4. Mudar horizonte: `t` recalcula via `tCritical` do hook; badge reflete.
5. Em viewport `<640px` a badge desaparece e o `<span>` do header continua visível.
6. Suíte completa segue verde — nenhum teste tocava nesse `<span>`.

