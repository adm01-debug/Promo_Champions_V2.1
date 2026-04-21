

## Fórmula completa do risk_score passo a passo no debug

### Estado atual
`RiskDebugPanel` já mostra contribuições por componente (estagnação, ticket, estágio) com barras, mas a fórmula final aparece comprimida em uma única linha: `raw 78 × conf 0.85 = 66`. Isso esconde:
- O que cada parcela soma para formar o `raw`.
- O piso/teto aplicado em `confidence_weight` (max(0.5, min(1, conf))).
- O `Math.round` antes do clamp.
- O clamp final em [0, 100] e quando ele dispara.

A fórmula real (de `scoring.ts`): `final = clamp(0, 100, round((stagnation + amount_alignment + stage_match) × max(0.5, min(1, matched_confidence))))`.

### O que será feito

Substituir a linha única de fórmula em `RiskDebugPanel.tsx` por uma lista numerada de 4 passos, cada um em um bloco mono-espaçado, com os valores numéricos reais do deal:

```
1. raw = 40 (estag) + 18 (ticket) + 20 (estágio) = 78/100
2. conf_weight = max(0.5, min(1, 0.85)) = 0.85
3. round(78 × 0.85) = 66
4. clamp(0, 100) → final = 66/100
```

Cada passo:
- Renderiza valores numéricos atuais (sem placeholders).
- Marca visualmente quando piso/teto disparam:
  - Passo 2: "(piso aplicado)" se `matched_confidence < 0.5`; "(teto aplicado)" se `> 1`.
  - Passo 4: "(teto 100 aplicado)" / "(piso 0 aplicado)" quando o `round` saiu do intervalo.
- O passo final destacado com borda/bg `primary` para fechar o raciocínio.

Sem mudança em scoring, edge function, hooks ou tipos — o `RiskBreakdown` já expõe `raw_score`, `confidence_weight`, `final_score` e `matched_confidence`.

### Mudanças técnicas
- **Editar** `src/components/win-loss/RiskDebugPanel.tsx`: substituir o `<div>` de fórmula compacta (linhas 53–57) pela seção "Fórmula passo a passo" com `<ol>` de 4 `<li>` mono-espaçados. Manter `aria-label="Detalhes de cálculo do risco"` no container externo.
- **Não tocar** em `scoring.ts`, edge function, hooks (`useAtRiskFromPatterns`), `AtRiskDealsFromPatterns` nem testes Deno.

### Verificação
1. Ativar Modo Debug no popover do painel "Deals em risco" → cada deal mostra a lista numerada com valores reais.
2. Deal com `matched_confidence = 0.3` → passo 2 marca "(piso aplicado)" e usa `0.50`.
3. Deal com `raw × conf > 100` (cenário extremo de teste) → passo 4 marca "(teto 100 aplicado)".
4. Conferência aritmética: passo 1 deve bater com a soma das 3 barras de contribuição já exibidas acima; passo 4 deve bater com o número grande do badge de risco do card.

