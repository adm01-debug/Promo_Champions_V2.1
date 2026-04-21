

## Suíte de fixtures ponta-a-ponta com asserts de score, razão e ação por cenário

### Estado atual
A infraestrutura **já existe** em `supabase/functions/detect-winloss-at-risk/`:
- `fixtures.ts`: 10 cenários (`SCENARIOS`) + `LOSS_PATTERNS_REALISTIC` + tipo `ScenarioExpect` com `minScore/maxScore`, `patternTypeOneOf`, `reasonsInclude`, `actionIncludes`.
- `scenarios_test.ts`: roda `computeDealRisk` por cenário e valida score (0–100, banda min/max), pattern dominante e razões.

### Gap real
1. O campo `actionIncludes` está **declarado mas nunca preenchido** em nenhum dos 10 cenários — a coerência da `suggested_action` com a história nunca é validada ponta-a-ponta. Hoje só há um teste genérico de comprimento mínimo em `action_validation_test.ts`.
2. Falta cenário cobrindo `pattern_type: "competitor"` puro (a branch "battle card" / "concorrência ativa" do `suggestedActionFor` nunca é exercitada como dominante).
3. Não há cenário com `severity = critical` validando o tom imperativo esperado ("URGENTE", "AÇÃO IMEDIATA").

### O que será implementado

**1. Preencher `actionIncludes` nos 8 cenários incluídos atuais** (`fixtures.ts`), ancorando em tokens estáveis de `suggestedActionFor`:
- `stuck_negotiation_aligned_ticket` → `"negotiation"` (status aparece literal nas branches `stuck_stage`).
- `long_proposal_oversized_ticket` → `"proposal"`.
- `qualified_90d_competitor_pressure` → `["qualified", "48h"]` (OR — aceita stuck_stage OU loss_factor dominando).
- `negotiation_45d_zero_amount` → `"negotiation"`.
- `fresh_proposal_perfect_ticket` → `"valor"` (loss_factor low/medium menciona "valor percebido"/"narrativa de ROI").
- `super_stagnant_negotiation` (saturação) → `["URGENTE", "IMEDIATA"]`.
- `proposal_30d_competitive_source` → `"proposal"`.

Antes de fixar as substrings, vou rodar `supabase--test_edge_functions` para imprimir o `suggested_action` real produzido por cada cenário e ancorar no token mais seguro — evita falso negativo se a severidade flutuar.

**2. Adicionar 2 novos cenários** ao `SCENARIOS`:
- `competitor_dominant_active_threat`: estagnação leve + amount alinhado ao perfil "Pressão competitiva", forçando `pattern_type = "competitor"` como dominante. Espera `patternTypeOneOf: ["competitor"]`, `reasonsInclude: ["competitiva"]`, `actionIncludes: ["battle card", "concorr"]`.
- `critical_severity_imperative_action`: deal extremo (estagnação 180d + ticket alinhado + `negotiation`) garantindo `severity = critical`. Espera `actionIncludes: ["URGENTE", "IMEDIATA"]`.

**3. Evoluir `actionIncludes` para `string | string[]`** (array = OR — pelo menos um match precisa bater). Atualizar a checagem em `scenarios_test.ts` para iterar quando array.

**4. Meta-teste anti-regressão** `"scenarios: every included scenario declares actionIncludes"`: falha se algum cenário com `expect.included === true` não definir `actionIncludes`. Previne o gap voltar a abrir silenciosamente no futuro.

### Mudanças
- **Modificar** `supabase/functions/detect-winloss-at-risk/fixtures.ts`
  - Tipo `ScenarioExpect.actionIncludes: string | string[]`.
  - Preencher `actionIncludes` nos 8 cenários incluídos.
  - Adicionar 2 novos cenários (`competitor_dominant_active_threat`, `critical_severity_imperative_action`).
- **Modificar** `supabase/functions/detect-winloss-at-risk/scenarios_test.ts`
  - Aceitar `actionIncludes` como `string | string[]` (OR semântico).
  - Adicionar meta-teste de cobertura.

### Verificação
1. `supabase--test_edge_functions` em `["detect-winloss-at-risk"]` — todos verdes (~12 cenários + asserts de ação + meta-teste).
2. Remover `actionIncludes` de um cenário incluído → meta-teste falha com mensagem clara.
3. Alterar `suggestedActionFor` para texto sem a keyword → cenário correspondente falha apontando substring esperada vs ação real.

