

## Tornar fixtures e padrões dominantes reutilizáveis em testes e na UI

### Estado atual
`supabase/functions/detect-winloss-at-risk/fixtures.ts` já exporta tudo o que importa: `LOSS_PATTERNS_REALISTIC`, `SCENARIOS`, `DEAL_HISTORY_FIXTURES`, `ScenarioGroup`, `ScenarioExpect`, `Scenario`, `DealHistoryFamily` e `NOW`. Os testes Deno (`scenarios_test.ts`, `history_catalog_test.ts`, `action_validation_test.ts`) já consomem direto.

**Bloqueios para reuso fora dos testes:**
1. O front-end (`src/`) não pode importar de `supabase/functions/...` — `tsconfig.app.json` só inclui `src` e o módulo usa imports estilo Deno (`./scoring.ts`, URLs `https://deno.land/...`), que o Vite/TS do app rejeita.
2. Não há índice plano `família → padrão dominante` — quem quiser exibir "esse deal cai na família 'Preço alto'" precisa abrir o objeto `DEAL_HISTORY_FIXTURES` e iterar.
3. `daysAgo` é privado, então cenários novos (em testes ad-hoc ou demos visuais) precisam reimplementar.

### O que será feito

**1. Criar fonte canônica neutra de tipos e dados em `src/`**
Novo módulo `src/lib/winloss/atRiskFixtures.ts` (ESM puro, importável tanto pelo Vite quanto por Deno via path relativo) contendo:
- Re-declaração explícita dos tipos `LossPattern`, `OpenDeal`, `RiskSeverity` (espelham `scoring.ts` — esses tipos já são duplicados de fato no front via `useAtRiskFromPatterns.ts`, então centralizamos).
- `LOSS_PATTERNS_REALISTIC`, `SCENARIOS`, `DEAL_HISTORY_FIXTURES`, `ScenarioGroup`, `Scenario`, `ScenarioExpect`, `DealHistoryFamily`, `NOW`, `daysAgo`.
- Novo índice plano `DOMINANT_PATTERNS_BY_FAMILY: Record<DealHistoryFamily, { theme: string; label: string; pattern: LossPattern | null }>` — resolve o `LossPattern` correspondente em `LOSS_PATTERNS_REALISTIC` por substring de label, de modo que a UI mostre `avg_amount`, `avg_cycle_days`, `confidence` reais.
- Helper `getDominantPatternForFamily(family)` para a UI.

**2. Reescrever `supabase/functions/detect-winloss-at-risk/fixtures.ts` como re-export fino**
O arquivo passa a conter apenas:
```ts
export * from "../../../src/lib/winloss/atRiskFixtures.ts";
```
Imports relativos atravessando `src/` funcionam no Deno — sem mudanças de tipo, mantendo todos os 5 arquivos de teste verdes sem editá-los.

**3. Adicionar barrel `src/lib/winloss/index.ts`**
Re-exporta `atRiskFixtures` e os tipos do `useAtRiskFromPatterns` para que componentes consumam um único caminho:
```ts
import { DOMINANT_PATTERNS_BY_FAMILY, LOSS_PATTERNS_REALISTIC } from "@/lib/winloss";
```

**4. Tornar o catálogo visível no dashboard de explicações**
No `AtRiskDealsPanel` (ou componente equivalente já consumido por `useAtRiskFromPatterns`), adicionar uma seção colapsável "Padrões dominantes considerados" que mapeia os 5 itens de `DOMINANT_PATTERNS_BY_FAMILY` em cards mostrando:
- `theme` (título)
- `label` do padrão
- `avg_amount` formatado em BRL (via `fmtBRL` de `winLossHelpers`)
- `avg_cycle_days` (via `fmtDays`)
- `confidence` (via `fmtPct`)
- Texto curto "Este deal não cai aqui" / "Esta família corresponde ao padrão dominante deste deal" — comparando o `matched_pattern` retornado com cada `label`.

Sem novo fetch — o dado é estático, vem do bundle.

### Mudanças
- **Criar** `src/lib/winloss/atRiskFixtures.ts` — fonte canônica (move o conteúdo de `fixtures.ts` para cá, adiciona `DOMINANT_PATTERNS_BY_FAMILY` + `getDominantPatternForFamily`).
- **Criar** `src/lib/winloss/index.ts` — barrel re-exportando fixtures e tipos.
- **Reescrever** `supabase/functions/detect-winloss-at-risk/fixtures.ts` para um único `export * from` apontando para o novo módulo.
- **Editar** o card do painel "Deals em risco" (componente `AtRiskDealsPanel` ou `AtRiskDealCard` — vou confirmar o nome exato ao implementar) para renderizar a seção de padrões dominantes.
- **Não tocar** em `scoring.ts`, `index.ts` da edge function, hooks de query ou nenhum dos arquivos `*_test.ts`.

### Verificação
1. `supabase--test_edge_functions` em `["detect-winloss-at-risk"]` → todos os ~50 testes verdes (re-export transparente).
2. Abrir o painel "Deals em risco" no preview → seção "Padrões dominantes" lista 5 famílias com BRL/cycle/confidence corretos; a família correspondente ao deal selecionado fica destacada.
3. `npm run build` (vite) → sem erro de import (confirma que o front consegue carregar `atRiskFixtures.ts`).
4. Renomear temporariamente `LOSS_PATTERNS_REALISTIC` no novo módulo → tanto os testes Deno quanto o componente do painel quebram → prova fonte única.

