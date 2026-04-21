

## Detalhar keywords competitivas detectadas no debug

### Estado atual
`RiskDebugPanel` já mostra `breakdown.matched_keywords` em duas formas:
- Como pills `warning` na seção "Sinais detectados".
- Como pills inline na linha de razão "Possível pressão competitiva detectada".

Mas falta transparência sobre **como** cada keyword foi detectada:
- Qual termo do regex casou (ex.: detectado `leila` dentro de `"leilao_publico"`).
- A substring original em que o match aconteceu (`leilao_publico`).
- Qual a confiança do `competitor` pattern utilizada para essa decisão.

`extractCompetitorKeywords(deal.source)` hoje retorna apenas `string[]` — perdendo o offset, a substring original e o regex que casou.

### O que será feito

**1. Estender `extractCompetitorKeywords` em `scoring.ts`**
Manter a assinatura atual e adicionar uma função companheira `extractCompetitorMatches(source: string | null)` que retorna `Array<{ keyword: string; matched_substring: string; regex: string }>` — uma entrada por match único (dedup case-insensitive por `keyword`). A função antiga continua existindo (re-implementada como `extractCompetitorMatches(...).map(m => m.keyword)`) para não quebrar testes.

**2. Expor no breakdown**
Adicionar campo opcional `competitor_matches?: Array<{ keyword: string; matched_substring: string; regex: string; confidence: number }>` no tipo `RiskBreakdown` (em `scoring.ts` e refletido em `useAtRiskFromPatterns.ts`).
- `confidence`: vem do `bestCompetitor` pattern (maior `confidence` entre `pattern_type === "competitor"`), ou `0.5` se nenhum competitor pattern existir mas a regex casou (fallback).
- Populado apenas quando `matches.length > 0`. `matched_keywords` continua existindo (compat).

**3. Nova seção visual no `RiskDebugPanel`**
Renderizar — entre "Sinais detectados" e "Razões" — um bloco condicional só quando `breakdown.competitor_matches?.length > 0`:
```
KEYWORDS COMPETITIVAS DETECTADAS (3)
┌─ Swords  leilão              conf 70%
│  match: "leilao_publico"     regex: /leila/i
├─ Swords  cotação             conf 70%
│  match: "COTACAO"            regex: /cota/i
└─ Swords  concorrência        conf 70%
   match: "concorrencia"       regex: /concorr/i
```
Implementação:
- `<ul>` com cada `<li>` em `flex flex-col` com border esquerda destructive.
- Linha 1: ícone Swords + nome da keyword (Badge `destructive`) + Badge `conf XX%`.
- Linha 2: `match: "<substring>"` (mono, `bg-muted`) e `regex: /xxx/i` (mono, `text-muted-foreground`).
- `aria-label` na `<li>`: `"Keyword competitiva: leilão, casou em 'leilao_publico' via /leila/i, confiança 70%"`.
- Texto curto em rodapé: `"baseado no padrão de maior confiança do tipo competitor"`.

**4. Cobertura de teste (Deno)**
Adicionar 1 caso em `debug_breakdown_test.ts`:
- Source `"leilao_publico, COTACAO, inbound_form"` → `competitor_matches.length === 2`, primeira entry tem `matched_substring === "leilao_publico"` e `regex.includes("leila")`, todas têm `confidence === 0.7` (vindo do `Concorrente X` pattern).
- Source sem match → `competitor_matches` é `undefined`/vazio.

### Mudanças técnicas
- **Editar** `supabase/functions/detect-winloss-at-risk/scoring.ts`: nova `extractCompetitorMatches`, refator de `extractCompetitorKeywords` em cima dela, novo campo no `RiskBreakdown`, popular no `computeDealRisk` lendo `bestCompetitor.confidence`.
- **Editar** `src/hooks/win-loss/useAtRiskFromPatterns.ts`: adicionar campo opcional `competitor_matches` no tipo `RiskBreakdown`.
- **Editar** `src/components/win-loss/RiskDebugPanel.tsx`: nova seção condicional "Keywords competitivas detectadas".
- **Editar** `supabase/functions/detect-winloss-at-risk/debug_breakdown_test.ts`: 1 novo `Deno.test` para o shape de `competitor_matches`.
- **Não tocar** em `index.ts` da edge, fixtures, hooks de UI ou outros componentes — payload é puramente aditivo.

### Verificação
1. `supabase--test_edge_functions ["detect-winloss-at-risk"]` → todos os ~50 verdes + 1 novo.
2. Ativar Debug em deal com `source = "leilao_publico"` → seção lista 1 keyword com substring `"leilao_publico"`, regex `/leila/i`, confiança 70%.
3. Deal sem source competitivo → seção não aparece (sem ruído visual).
4. Deal com 3 keywords distintas no source → 3 entries; nenhuma duplicada se a mesma keyword aparece duas vezes (`COTACAO, cotacao` → 1 entry).
5. Inspeção a11y: leitor de tela anuncia `aria-label` completo de cada match.

