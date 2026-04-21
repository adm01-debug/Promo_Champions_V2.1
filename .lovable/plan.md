

## Padronizar reasons com códigos/IDs estáveis

### Estado atual
Hoje cada `reason` em `RiskBreakdown.reasons` é uma string PT-BR livre (ex.: `"23 dias sem atualização (média de loss: 18d)"`). Consequências:
- **Filtros frágeis**: o `RiskDebugPanel.classifyReason` depende de regex sobre prefixos PT-BR (`/dias sem atualização/i`, `/^ticket alinhado/i`). Trocar uma palavra do backend quebra a UI silenciosamente.
- **Testes acoplados a copy**: mudar tradução requer atualizar dezenas de asserts.
- **i18n impossível**: traduzir para EN destruiria a classificação.
- **Sem identidade machine-readable** para filtros, agrupamento ou métricas de "qual sinal mais aparece".

### O que será feito

**1. Schema novo: `RiskReason` (estruturado) + retrocompat com `reasons: string[]`**

Em `scoring.ts`, criar:

```ts
export type RiskReasonCode =
  | "STAGNATION_HIGH"     // estagnação severa (≥30 pts)
  | "STAGNATION_LOW"      // estagnação leve (>0 e <30)
  | "AMOUNT_ALIGNED"      // ticket dentro da faixa de loss
  | "STAGE_STUCK"         // estágio historicamente travado
  | "COMPETITOR_PRESSURE" // keywords competitivas detectadas
  | "CROSSED_SIGNALS";    // fallback

export interface RiskReason {
  code: RiskReasonCode;
  message: string;                              // texto pt-BR (UX atual)
  params: Record<string, string | number>;      // valores numéricos para i18n/testes
  source: "stagnation" | "amount" | "stage" | "competitor" | "generic";
  contribution: number;                         // contrib absoluta ao raw_score
}
```

Adicionar ao `RiskBreakdown`:
```ts
reasons_v2?: RiskReason[];   // novo (opcional, rollout aditivo)
reasons: string[];           // mantido (retrocompat)
```

**2. Construção determinística no `computeDealRisk`**
Função interna `buildReasons(...)` retorna `{ messages, structured }`. `messages` continua idêntico ao array PT-BR atual; `structured` vai em `breakdown.reasons_v2`. Ordem fixa: stagnation → amount → stage → competitor → fallback.

**3. Helpers compartilhados (frontend) — novo `src/lib/winloss/riskReasons.ts`**
- `RISK_REASON_CODES` (const array tipada).
- `RISK_REASON_LABELS: Record<RiskReasonCode, string>` (rótulo curto: "Estagnação severa", "Ticket alinhado", etc.) — fonte única de verdade para chips/filtros.
- `getReasonKindMeta(code)` retorna `{ icon, variant, color }` (move o `KIND_META` que hoje vive dentro do `RiskDebugPanel`).
- `inferReasonCode(message)`: fallback determinístico para deals legados sem `reasons_v2` (mesmas regex que vivem hoje em `classifyReason`, isoladas e testadas).

**4. Refatorar `RiskDebugPanel.tsx`**
- Aceita `reasons_v2` quando existir; cai para `inferReasonCode` quando ausente.
- Substitui `classifyReason` por leitura direta do `code`.
- Cada `<li>` recebe `data-reason-code={code}` para testabilidade DOM.
- Mantém highlighting numérico e pills competitivas.

**5. Refatorar `RiskCompareModal.tsx`**
- `pairReasonsByKind` agora pareia por `code` (e não por inferência regex). Razões só em A ou só em B = exclusivas.

**6. Filtro por código no popover**
- Adicionar a `AtRiskSettings` o campo `reasonCodes: RiskReasonCode[]` (default `[]` = sem filtro).
- Sanitização preserva apenas códigos válidos (whitelist contra `RISK_REASON_CODES`).
- Schema sobe para **v3**; migration v2→v3 mantém todos campos antigos e injeta `reasonCodes: []`.
- `AtRiskSettingsPopover`: nova seção "Sinais" com 5 chips toggláveis (excluindo `CROSSED_SIGNALS`).
- `AtRiskDealsFromPatterns`: filtra deals que tenham **ao menos um** `reasons_v2[i].code` em `settings.reasonCodes`. Quando vazio, sem filtro.

**7. Retrocompat e edge function**
- `index.ts` da edge function não muda — payload puramente aditivo.
- `useAtRiskFromPatterns.ts` ganha `RiskReasonCode` e `reasons_v2` no tipo `RiskBreakdown`.
- Deals em cache antigos (sem `reasons_v2`) continuam funcionando via `inferReasonCode`.

### Cobertura de teste

**Backend (Deno)** — `supabase/functions/detect-winloss-at-risk/reasons_codes_test.ts` (novo):
1. Deal com 50 dias estagnado → `code: "STAGNATION_HIGH"`, `params.days === 50`, `contribution === breakdown.stagnation`.
2. Deal com ticket próximo da média → `code: "AMOUNT_ALIGNED"`.
3. Deal em `negotiation` com bestStuck → `code: "STAGE_STUCK"`, `params.stage === "negotiation"`.
4. Deal com `source = "leilao_publico"` + competitor pattern → `code: "COMPETITOR_PRESSURE"`, `params.keywordCount === 1`.
5. Deal sem sinais fortes → único `code: "CROSSED_SIGNALS"`.
6. Ordem dos códigos é determinística.
7. `reasons` (string[]) continua idêntico ao formato atual.

**Frontend (Vitest)** — `src/test/lib/riskReasons.test.ts` (novo):
- `inferReasonCode` para cada um dos 5 prefixos atuais + fallback.
- `RISK_REASON_LABELS` exhaustivo: tem entrada para cada `RiskReasonCode`.

**Hook settings** — adições em `useAtRiskSettings.test.ts`:
- `sanitize` com array misto preserva só códigos válidos.
- Migration v2→v3 preserva campos antigos e adiciona `reasonCodes: []`.

**Compare modal** — atualizar 1 caso em `RiskCompareModal.test.tsx` para verificar pareamento por `code`.

### Arquivos tocados

**Backend**
- `supabase/functions/detect-winloss-at-risk/scoring.ts` — tipos `RiskReasonCode`/`RiskReason`, `buildReasons`, popular `breakdown.reasons_v2`.
- `supabase/functions/detect-winloss-at-risk/reasons_codes_test.ts` — **novo**.

**Frontend (lib + hook + UI)**
- `src/lib/winloss/riskReasons.ts` — **novo**.
- `src/lib/winloss/index.ts` — re-export.
- `src/hooks/win-loss/useAtRiskFromPatterns.ts` — tipos novos.
- `src/hooks/win-loss/useAtRiskSettings.ts` — `reasonCodes`, sanitize, migration v3.
- `src/components/win-loss/RiskDebugPanel.tsx` — usar `code` quando disponível, remover `KIND_META` local.
- `src/components/win-loss/RiskCompareModal.tsx` — pareamento por `code`.
- `src/components/win-loss/AtRiskSettingsPopover.tsx` — seção "Sinais" com chips.
- `src/components/win-loss/AtRiskDealsFromPatterns.tsx` — aplicar filtro.

**Testes**
- `src/test/lib/riskReasons.test.ts` — **novo**.
- `src/test/hooks/useAtRiskSettings.test.ts` — +2 casos.
- `src/test/components/winloss/RiskCompareModal.test.tsx` — atualizar 1 caso.

### Critérios de aceite
1. Cada `RiskBreakdown` em respostas novas tem `reasons_v2: RiskReason[]` completo. `reasons: string[]` continua idêntico (zero quebra).
2. Painel debug renderiza `<li data-reason-code="STAGNATION_HIGH">` (verificável via DOM).
3. Popover ganha 5 chips de sinal; selecionar filtra a lista visível.
4. Recarregar a página preserva `reasonCodes` (migration v2→v3 funciona).
5. Trocar a string `"Ticket alinhado..."` por `"Ticket dentro da faixa..."` em `scoring.ts` **não quebra nenhum teste de UI** nem o filtro (tudo roteia por `code`).
6. `supabase--test_edge_functions ["detect-winloss-at-risk"]` → todos verdes (incluindo 7 novos).
7. `npm test -- riskReasons useAtRiskSettings RiskCompareModal` → todos verdes.

### Verificação manual
1. Ativar Debug → inspecionar `data-reason-code` no DOM; ver `breakdown.reasons_v2` em DevTools React.
2. Filtrar por "Estagnação severa" → painel mostra só deals com `STAGNATION_HIGH`.
3. Combinar com filtro de estágio → ambos aplicam (AND).
4. Recarregar com 2 chips ativos → seleção persistida.