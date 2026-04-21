

## Validação do `detect-winloss-at-risk` — scores, razões e ações

Objetivo: confirmar que a edge function pontua deals abertos cruzando padrões de loss (`win_loss_patterns`) com 0–100 coerente, retorna `matched_pattern` e `suggested_action` legíveis e não-vazios, e que o painel `AtRiskDealsFromPatterns` os exibe corretamente.

---

### Estado atual (verificado)

**Edge function** (`supabase/functions/detect-winloss-at-risk/index.ts`):
- Busca até 50 padrões `outcome='lost'` e até 200 deals abertos (`status not in (won,lost)`).
- Score = `min(100, round((hits/keywords.length) * 80 * sevWeight))`, onde `sevWeight ∈ {1, 1.2, 1.5}`.
- Match em `notes + stage` (lowercase). Filtra `risk_score >= 40`, ordena desc, top 20.
- Retorna `{ deals, total }`. Pega o **melhor** padrão (maior score), descarta os demais.

**UI** (`AtRiskDealsFromPatterns.tsx`):
- Renderiza `client_name`, `matched_pattern`, `suggested_action`, `amount`, `risk_score`.
- Tom visual: ≥75 destrutivo, ≥50 âmbar, <50 muted.

**Riscos identificados:**
1. `suggested_action` vem de `pattern.description` — pode ser longo/genérico, não acionável.
2. Score teto 80 × sevWeight 1.5 = 120 → clamp 100; mas critical com 1 hit em 1 keyword já dá 100 (pode inflar).
3. Sem `pattern_id` retornado — impossível auditar/drill-down.
4. Sem fallback quando padrão tem 0 keywords (já filtrado, ok) ou quando todos os deals filtram zero (UI já trata).
5. Não verifica se `notes` é string (deals com `notes=null` viram `""` — ok).
6. Não há log estruturado para troubleshooting de scoring.

---

### Plano de validação + melhorias

**Etapa 1 — Diagnóstico com dados reais (read-only)**
- `supabase--read_query`: contar padrões `lost` ativos e distribuição de `severity` + tamanho médio de `trigger_keywords`.
- `supabase--read_query`: amostrar 20 deals abertos com `notes` não-vazia para entender vocabulário real.
- `supabase--curl_edge_functions` POST `/detect-winloss-at-risk` → capturar payload atual.
- Comparar manualmente: para cada deal retornado, verificar se `matched_pattern` faz sentido vs `notes`.

**Etapa 2 — Refactor da edge function**

Melhorias mínimas, sem quebrar contrato:

```ts
// 1. Normalizar score com curva mais justa:
//    base = (hits / keywords.length) * 70   // teto base 70
//    bonus = min(20, (hits - 1) * 5)        // bônus por múltiplos hits
//    score = min(100, round((base + bonus) * sevWeight))
//    Resultado: 1 hit em 1 kw + critical = 70*1.5=100 (ok),
//               1 hit em 5 kw + low     = 14 (filtrado, ok),
//               3 hits em 5 kw + high   = (42+10)*1.2=62 (at risk).

// 2. Action curta e acionável:
const suggested_action = pat.suggested_action 
  ?? truncate(pat.description, 90) 
  ?? "Revisar abordagem com cliente";

// 3. Retornar pattern_id, severity, hits, keywords_matched para auditoria.

// 4. Validação Zod do body (force?: boolean).

// 5. Log estruturado: { fn, total_patterns, total_deals, matched, top_score, duration_ms }.

// 6. Skip seguro quando notes/stage ambos vazios.
```

**Etapa 3 — Tipo + UI alinhados**
- `AtRiskDealFromPattern` ganha `pattern_id?: string`, `severity?: string`, `keywords_matched?: string[]`.
- `AtRiskDealsFromPatterns.tsx`: adicionar `<Tooltip>` no badge de score mostrando keywords casadas (transparência); manter visual atual.

**Etapa 4 — Testes Deno (`index.test.ts`)**
Unit-testar a função pura de scoring (extraída como `computeRiskScore`):
- Caso A: 0 keywords → 0.
- Caso B: hits=0 → 0.
- Caso C: 1/1 + critical → 100.
- Caso D: 3/5 + high → ~62.
- Caso E: 1/5 + low → ~14 (abaixo do limiar).
- Caso F: notes vazio → 0.

**Etapa 5 — Validação end-to-end**
- Re-deploy + curl real → comparar antes/depois (top 5 deals): score, pattern, action.
- `supabase--edge_function_logs detect-winloss-at-risk` → confirmar log estruturado.
- Abrir `/win-loss-intelligence` → verificar que painel renderiza razão + ação coerentes (screenshot mental via session replay se necessário).

**Etapa 6 — Documentação**
- Atualizar `mem://features/win-loss-intelligence-module` com a fórmula de scoring final.

---

### Detalhes técnicos

**Arquivos alterados:**
- `supabase/functions/detect-winloss-at-risk/index.ts` — refactor scoring + Zod + logs + retorno enriquecido.
- `supabase/functions/detect-winloss-at-risk/scoring.ts` (novo) — função pura `computeRiskScore` exportada.
- `supabase/functions/detect-winloss-at-risk/index.test.ts` (novo) — 6 casos Deno.test.
- `src/hooks/win-loss/useAtRiskFromPatterns.ts` — ampliar tipo `AtRiskDealFromPattern`.
- `src/components/win-loss/AtRiskDealsFromPatterns.tsx` — Tooltip com keywords casadas.

**Contrato preservado:** front antigo continua funcionando (campos novos são opcionais).

**Sem migrations.** Apenas leitura de `win_loss_patterns` (já existente). Se a coluna `suggested_action` não existir nesse table, mantemos fallback em `description` — verifico via `read_query` na Etapa 1 antes de codar.

### Ordem (sequencial, sem pausas)
1. Diagnóstico SQL + curl atual (baseline).
2. Verificar schema `win_loss_patterns` (coluna `suggested_action`?).
3. Extrair `scoring.ts` + escrever 6 testes Deno.
4. Refactor `index.ts` (Zod, logs, retorno enriquecido).
5. Deploy + curl de validação + comparar antes/depois.
6. Atualizar tipo do hook + Tooltip na UI.
7. `tsc --noEmit` + `supabase--test_edge_functions` + log de validação no chat.
8. Atualizar memória do módulo.

