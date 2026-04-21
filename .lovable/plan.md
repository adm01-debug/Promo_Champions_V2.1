

## Validações para `matched_pattern` e `suggested_action` em at-risk

### Objetivo
Garantir que o resultado do scoring **nunca** retorne `matched_pattern` vazio/whitespace ou `suggested_action` genérico/vazio, e que a ação sugerida seja **coerente** com:
- `outcome` do padrão dominante (`lost` vs `won`/`win_factor` produzem ações em direções opostas).
- **Severidade** combinada (score 0–100 + confidence do padrão) — score crítico merece ação mais urgente que score limítrofe.

### Estado atual
- `suggestedActionFor(patternType, status)` ignora outcome e severidade — só olha tipo.
- Fallback `"Sinal genérico de risco"` pode escapar se nenhum pattern fizer sentido.
- Nenhuma asserção runtime garante que strings finais não sejam vazias.

### Mudanças

**`supabase/functions/detect-winloss-at-risk/scoring.ts`**

1. Refatorar assinatura:
   ```ts
   suggestedActionFor(
     patternType: string,
     status: string | null,
     opts: { outcome?: string | null; severity: "low" | "medium" | "high" | "critical" }
   ): string
   ```
2. Helper interno `severityFromScore(score, confidence)`:
   - `critical` se score ≥ 80 **e** confidence ≥ 0.7
   - `high` se score ≥ 65
   - `medium` se score ≥ 50
   - `low` caso contrário (≥ threshold de 40).
3. Matriz de ações por `(patternType, outcome, severity)` em pt-BR. Exemplos:
   - `loss_factor` + `lost` + `critical`: "AÇÃO IMEDIATA: agendar call de resgate em 24h e revisar proposta com desconto/condição estratégica"
   - `loss_factor` + `lost` + `high`: "Revisar proposta nas próximas 48h com foco em valor percebido"
   - `loss_factor` + `lost` + `medium`: "Reforçar valor percebido e ajustar narrativa de ROI"
   - `stuck_stage` + `lost` + `critical`: `"URGENTE: desbloquear estágio \"X\" hoje — escalar para gestor se necessário"`
   - `stuck_stage` + `lost` + `high`: `"Acelerar saída do estágio \"X\" com próxima ação concreta em 48h"`
   - `competitor` + `lost` + `critical`: "Concorrência ativa detectada — disparar battle card e ligar ao decisor em 24h"
   - `win_factor` + `won`: "Reaplicar abordagem consultiva vencedora deste perfil" (não escala por severidade — é positivo).
   - `generic`: ação por severidade (`critical`→"Revisar deal urgente com gestor"; `medium`→"Revisar abordagem nas próximas 72h").
4. Função `ensureNonEmpty(str, fallback)` — garante string trimada não-vazia; usa fallback determinístico baseado em `patternType + severity`.
5. `computeDealRisk` ao montar resultado:
   - Calcula `severity = severityFromScore(finalScore, dominant.confidence)`.
   - `matched_pattern = ensureNonEmpty(dominant.label?.trim(), `Sinal de risco (${dominant.type})`)`.
   - `suggested_action = ensureNonEmpty(suggestedActionFor(...), fallbackBySeverity)`.
   - Adiciona `severity` ao `breakdown` (campo novo opcional para UI/debug).
6. Asserções no payload final (defensivo, não joga — só corrige):
   - Se `matched_pattern` ainda vazio → log `console.warn` estruturado e usa `"Sinal de risco indeterminado"`.
   - Se `suggested_action` < 15 chars → substitui por fallback severity-aware.

**Tipos**
- Estender `RiskBreakdown` em `scoring.ts` e em `src/hooks/win-loss/useAtRiskFromPatterns.ts` com `severity?: "low"|"medium"|"high"|"critical"`.

**UI (`RiskDebugPanel.tsx`)**
- Mostrar badge `severity` ao lado do tipo do padrão dominante (variant: `destructive` para critical, `warning` high, `secondary` medium, `outline` low).

**Testes — novo `supabase/functions/detect-winloss-at-risk/action_validation_test.ts`**
- 7 testes:
  1. `matched_pattern` nunca vazio nem só whitespace (testa pattern com `label: ""` e `label: "   "`).
  2. `suggested_action` nunca vazio nem < 15 chars em todos os 10 cenários do `fixtures.ts`.
  3. `severityFromScore`: tabela-verdade para os 4 níveis.
  4. `loss_factor + critical` contém marcador de urgência ("IMEDIATA"|"URGENTE"|"24h").
  5. `loss_factor + medium` **não** contém marcador de urgência (evitar wolf-crying).
  6. `win_factor + won` produz ação positiva (regex `/reaplicar|reforçar|replicar/i`), nunca contém "urgente".
  7. Pattern com label só de espaços + tipo desconhecido → `matched_pattern` cai no fallback determinístico, não em string vazia.
- Validação final: `supabase--test_edge_functions detect-winloss-at-risk` (esperado 33 prévios + 7 novos = 40/40).

**Memory**
- Atualizar `mem://features/winloss-at-risk-scoring.md` documentando a matriz `(type, outcome, severity)` e as garantias de não-vazio.

### Detalhes técnicos
- Mudança de assinatura de `suggestedActionFor` exige adaptar o único call-site (`computeDealRisk`); função exportada — manter compatibilidade aceitando `severity` como obrigatório, breaking interno mas sem consumer externo.
- Score band para `critical` exige confidence alta — evita marcar como crítico um deal cuja única evidência é um padrão fraco.
- UI degrada: campo `severity` é opcional; sem ele o badge não renderiza.

### Ordem
1. Refatorar `suggestedActionFor` + adicionar `severityFromScore` + `ensureNonEmpty` em `scoring.ts`.
2. Atualizar `computeDealRisk` para aplicar matriz e validações; adicionar `severity` no breakdown.
3. Atualizar tipos em `useAtRiskFromPatterns.ts`.
4. Criar `action_validation_test.ts` e rodar `supabase--test_edge_functions`.
5. Adicionar badge `severity` em `RiskDebugPanel.tsx`.
6. Atualizar `mem://features/winloss-at-risk-scoring.md`.

