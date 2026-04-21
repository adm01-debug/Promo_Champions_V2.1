

## Modo debug no painel AtRisk — keywords/stage casados e impacto no score

### Objetivo
Permitir inspecionar, deal a deal, **quais sinais foram casados** (estágio, keywords competitivas, padrão de loss usado, dias de estagnação, alinhamento de ticket) e **quanto cada um contribuiu** para o `risk_score` final — sem afetar a UX padrão.

### Já temos
- `breakdown` no payload (`stagnation`, `amount_alignment`, `stage_match`, `matched_pattern_label/type`, `matched_confidence`, `reasons`).
- Tooltip atual mostra os 4 valores agregados.

### Gaps a fechar
1. Backend não devolve **as keywords competitivas que casaram** (regex `/concorr|competitor|leilao|cotac/i` é avaliada mas não exposta) nem o **fator de confiança aplicado** (`raw * confWeight`).
2. Frontend não mostra **a fórmula final** (raw → ×conf → clamp) nem distingue contribuição zerada vs ausente.
3. Não há toggle "modo debug" — tudo vive em tooltip pequeno.

### Mudanças

**Backend — `supabase/functions/detect-winloss-at-risk/scoring.ts`**
- Estender `RiskBreakdown` com:
  - `matched_keywords: string[]` (todas as ocorrências do regex no `source`).
  - `days_stagnant: number`
  - `avg_loss_cycle_days: number | null`
  - `avg_loss_amount: number | null`
  - `raw_score: number` (soma antes do peso de confiança)
  - `confidence_weight: number` (`max(0.5, min(1, conf))`)
  - `final_score: number` (idêntico a `risk_score`, redundante mas explícito p/ debug)
- Extrair regex p/ const `COMPETITOR_KEYWORDS_RE` + helper `extractCompetitorKeywords(source)` retornando `string[]`.
- Garantir que `stage_match=0` ainda apareça (já aparece, mas adicionar no breakdown se status estava em `STUCK_STATUSES` mas pattern faltou — campo `stage_eligible: boolean`).
- Adicionar 3 testes unitários em `retry_test.ts` equivalente da função (novo arquivo `debug_breakdown_test.ts`):
  - keywords extraídas corretamente de "leilao_publico, cotacao".
  - `raw_score` + `confidence_weight` reproduzem `final_score`.
  - `stage_eligible=true` quando status ∈ STUCK_STATUSES mesmo sem pattern stuck.

**Frontend — tipos**
- `src/hooks/win-loss/useAtRiskFromPatterns.ts`: estender interface `RiskBreakdown` com os novos campos (todos opcionais para retrocompatibilidade).

**Frontend — UI debug**
- `src/components/win-loss/AtRiskDealsFromPatterns.tsx`:
  - Toggle "Debug" no header do card (ícone `Bug`, `useState` local — não persiste).
  - Quando ligado, cada `<li>` ganha `<Collapsible>` aberto por padrão exibindo um painel `RiskDebugPanel`.
- **Novo componente** `src/components/win-loss/RiskDebugPanel.tsx`:
  - Mini-tabela "Contribuição" (4 linhas: Estagnação / Ticket / Estágio / Confiança aplicada) com valor, peso máximo e barra horizontal proporcional.
  - Linha "Fórmula": `raw 78 × conf 0.85 = final 66` (tabular, `font-mono`).
  - Bloco "Padrão casado": label, tipo (badge), confidence (%).
  - Bloco "Sinais detectados": chips para cada `matched_keyword`, chip "Estágio elegível" quando `stage_eligible`, dias de estagnação vs ciclo médio (`21d / 45d`).
  - Lista completa de `reasons` (já vem do backend).
  - Acessibilidade: `aria-label="Detalhes de cálculo do risco"`, navegação por teclado no toggle.

**Estilo**
- Usa tokens semânticos existentes (`bg-muted`, `text-muted-foreground`, `border-border`).
- Sem cores hardcoded; barras usam `bg-primary/60`.

### Detalhes técnicos
- Toggle não dispara refetch — debug usa o mesmo payload (campos vêm sempre, render condicional).
- Tamanho do payload aumenta ~120 bytes/deal — aceitável (limite 20 deals).
- Mantém retrocompatibilidade: campos opcionais, UI degrada se ausentes.
- Validação final: `supabase--test_edge_functions detect-winloss-at-risk` (esperado 29 prévios + 3 novos = 32/32).

### Ordem
1. Estender `scoring.ts` (interface + helper de keywords + populate breakdown).
2. Adicionar `debug_breakdown_test.ts` e rodar `supabase--test_edge_functions`.
3. Atualizar tipos em `useAtRiskFromPatterns.ts`.
4. Criar `RiskDebugPanel.tsx` + toggle em `AtRiskDealsFromPatterns.tsx`.
5. Atualizar `mem://features/winloss-at-risk-scoring.md` registrando o modo debug.

