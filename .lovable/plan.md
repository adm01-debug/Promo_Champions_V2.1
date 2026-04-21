

## Comparação lado a lado de dois deals no debug de risco

### Estado atual
Hoje o `RiskDebugPanel` é renderizado por deal, isolado dentro do card do deal no `AtRiskDealsFromPatterns`. Não há forma de pegar dois deals e ver, lado a lado:
- Quanto cada componente (estagnação, ticket, estágio) contribuiu em cada um.
- Como o `raw_score` foi formado.
- Qual `confidence_weight` (e por quê — pattern casado + tipo) cada deal recebeu.
- O `final_score` resultante e qual deal "perdeu mais" para o clamp/confiança.
- Quais keywords competitivas foram detectadas em cada um.

Isso obriga o usuário a abrir o debug em dois cards separados e comparar mentalmente.

### O que será feito

**1. Estado de seleção no `AtRiskDealsFromPatterns`**
- Adicionar `useState<string[]>([])` para `compareIds` (máx. 2 sale_ids).
- Só visível quando `settings.debug === true` (recurso é puramente analítico).
- Cada card de deal ganha um `Checkbox` discreto no canto (label `aria-label="Selecionar para comparar"`) que adiciona/remove do array; quando 2 já estão selecionados, demais checkboxes ficam `disabled` com tooltip "Máximo 2 deals para comparar".
- Botão flutuante na barra do header: `Comparar (2)` aparece quando `compareIds.length === 2` → abre modal.
- Botão `Limpar seleção` ao lado quando há 1+ selecionados.

**2. Novo componente `RiskCompareModal.tsx` em `src/components/win-loss/`**
- Recebe props `{ open, onOpenChange, dealA, dealB }` onde cada deal é o `AtRiskDealFromPattern` completo (já tem `breakdown`).
- Layout em 3 colunas:
  - Coluna esquerda: rótulo da métrica.
  - Coluna do meio: valor do Deal A + cliente.
  - Coluna direita: valor do Deal B + cliente.
- Usa o componente `Dialog` (mesmo padrão do `WinLossCompareModal`).
- Largura `max-w-4xl`, scroll interno.

**3. Conteúdo do modal — 5 seções**

**a) Header de identificação**
Duas mini-cards lado a lado mostrando:
- Cliente, ticket (`fmtBRL`), estágio, score final em badge `tone()` igual ao card.
- Borda esquerda colorida: `border-l-primary` para A, `border-l-destructive` para B (apenas para distinção visual, não semântica).

**b) Tabela "Componentes do raw_score"**
| Componente | Deal A | Deal B | Δ |
|---|---|---|---|
| Estagnação (max 50) | `40` (barra 80%) | `25` (barra 50%) | `+15` |
| Ticket alinhado (max 25) | `25` | `0` | `+25` |
| Estágio elegível (max 25) | `15` | `15` | `0` |
| **Raw total** | **`80`** | **`40`** | **`+40`** |

- Δ pintado: positivo verde (`text-status-success`), negativo destructive, zero muted.
- Barra de contribuição inline em cada célula (mesma `ScoreContributionBar`-like, mas inline e fina) reusando o estilo de barras já presente no `RiskDebugPanel`.

**c) Tabela "Confiança e clamp"**
| Passo | Deal A | Deal B |
|---|---|---|
| Padrão casado | `Estagnação crítica` | `Ticket fora do ICP` |
| Tipo do padrão | `stagnation` | `amount` |
| Confidence original | `0.85` | `0.30` (piso aplicado → `0.50`) |
| `raw × conf` | `80 × 0.85 = 68` | `40 × 0.50 = 20` |
| Clamp aplicado? | Não | Não |
| **Final score** | **`68`** | **`20`** |

- Linha "Confidence" destaca quando piso/teto foi aplicado com badge `warning` "(piso 0.5)" ou "(teto 1.0)".
- Linha "Clamp" mostra "Sim → teto 100" em badge `destructive` quando `raw × conf > 100`.

**d) Diff de keywords competitivas**
Duas colunas com listas das `competitor_matches`:
- Verde (badge `success`) para keywords presentes só em A ou só em B (exclusivas — diferenciador).
- Cinza (badge `outline`) para keywords presentes em ambos.
- Texto `"Nenhuma keyword competitiva detectada"` quando vazio.
- Rodapé: `"X exclusivas de A · Y exclusivas de B · Z em comum"`.

**e) Diff de razões (`reasons`)**
Reusa o `classifyReason` já criado na iteração anterior. Mostra um diff visual:
- Razões do mesmo `kind` em ambos: lado a lado na mesma linha.
- Razões só em um: linha com lado oposto vazio (placeholder `—`).
- Cada razão renderizada com o mesmo highlight numérico e ícone do `RiskDebugPanel`.

**4. Conclusão automática no rodapé do modal**
Pequeno parágrafo gerado da diferença, ex.:
> *Deal A tem score final 48 pontos maior que Deal B. Principal contribuinte: ticket alinhado (+25 raw) e maior confiança no padrão casado (0.85 vs 0.50). Deal B sofreu piso de confiança aplicado.*

Lógica determinística (não-IA), em helper `buildCompareSummary(a, b)` no próprio arquivo.

**5. Acessibilidade e i18n**
- `Dialog` tem `aria-labelledby` apontando para o `DialogTitle`.
- Tabela com `<caption className="sr-only">` descrevendo o conteúdo.
- Cada Δ tem `aria-label` falado: ex.: `"Diferença: Deal A maior em 15 pontos"`.
- Strings em pt-BR (consistente com o resto do painel).

### Mudanças técnicas
- **Novo arquivo** `src/components/win-loss/RiskCompareModal.tsx` (~250 linhas, contendo componente + helpers `buildCompareSummary`, `diffKeywords`, `pairReasonsByKind`).
- **Editar** `src/components/win-loss/AtRiskDealsFromPatterns.tsx`:
  - Estado `compareIds`, handlers `toggleCompare(id)`, `clearCompare()`.
  - Checkbox por card (visível apenas em modo debug).
  - Barra de ações compacta no topo do card content: chips dos selecionados + botão `Comparar` + `Limpar`.
  - Renderização condicional do `<RiskCompareModal>`.
- **Não tocar** em scoring, hooks, edge functions, types — payload já tem tudo (`breakdown.raw_score`, `confidence_weight`, `final_score`, `competitor_matches`, `reasons`, `matched_pattern_label`, `matched_pattern_type`).
- **Reusar** `Dialog`, `Checkbox` (shadcn já presente), `Badge`, `Tooltip`, `cn`, `fmtBRL` local.

### Testes
**Novo arquivo** `src/test/components/winloss/RiskCompareModal.test.tsx` com 5 casos:
1. Renderiza ambos os deals com cliente e final_score corretos.
2. Δ é calculado corretamente (raw_total e final_score) e tem sinal apropriado.
3. Quando `confidence_weight === 0.5` mas pattern_confidence original era `< 0.5`, mostra badge "(piso aplicado)".
4. Diff de keywords classifica corretamente exclusivas vs comuns.
5. `buildCompareSummary` produz string contendo o nome do pattern dominante e o delta numérico.

### Critérios de aceite
1. Em modo debug, cada card tem um checkbox; selecionar 2 abre o botão `Comparar (2)` no header do painel.
2. Modal abre com layout em 3 colunas (rótulo / Deal A / Deal B), sem scroll horizontal em viewport ≥ 1024px.
3. Coluna Δ pinta verde/destructive/muted conforme sinal e zero.
4. Badges de piso/teto aparecem somente quando aplicável (verificável forçando `matched_confidence: 0.3` em fixtures).
5. Diff de keywords mostra exclusivas em verde e comuns em cinza; rodapé conta corretamente.
6. Conclusão automática referencia o pattern com maior contribuição absoluta.
7. Fechar o modal preserva a seleção; clicar `Limpar` zera; após 2º deal limpo, botão `Comparar` some.
8. Tudo só visível com `settings.debug === true`; modo normal não mostra checkboxes nem barra de ações.
9. `npm test -- RiskCompareModal` → 5/5 verdes; `tsc` sem erros.

### Verificação manual
1. Ativar Debug → selecionar 2 deals com scores próximos → comparar → ver Δ pequeno em raw mas Δ grande em final por causa de confidence diferente.
2. Selecionar deal `stagnation` puro vs deal `competitor` → diff de keywords mostra divergência clara.
3. Forçar deal com `raw × conf > 100` (cenário de teste) → linha "Clamp" aparece com badge destructive em uma das colunas.
4. Desligar Debug com 2 deals selecionados → barra de ações some; reativar → seleção foi descartada (estado é local ao card, não persistido — esperado).

