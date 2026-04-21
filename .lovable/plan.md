

## Filtros persistentes de stage/keyword no painel "Deals em risco"

### Estado atual
`AtRiskDealsFromPatterns` já consome `useAtRiskSettings` (`threshold`, `limit`, `maxVisible`) com persistência em `localStorage` (key `winloss-at-risk-settings`, schema v1) e tem um toggle local `debug` — mas o toggle não persiste e não há filtros por estágio nem por keyword. Hoje, ajustar threshold mexe na chamada da edge, mas não permite "ver só deals em Negociação com 'preço' no padrão".

### O que será feito

**1. Estender `useAtRiskSettings`** (sem quebrar o storage existente)
- Adicionar 3 campos opcionais ao tipo `AtRiskSettings`:
  - `debug: boolean` (default `false`) — substitui o `useState` local.
  - `stageFilter: string[]` (default `[]`, vazio = todos) — filtra por `deal.stage`.
  - `keywordFilter: string` (default `""`) — substring case-insensitive aplicada a `client_name`, `matched_pattern` e `suggested_action`.
- `sanitize` valida tipos (array de strings dedup, string trimada ≤100 chars, boolean coerced).
- Bump `SCHEMA_VERSION` de `1` → `2`. Loader v1 migra preservando `threshold/limit/maxVisible` e preenchendo defaults dos novos campos (não descarta config do usuário).
- Atualizar `useAtRiskSettings.test.ts` para cobrir migração v1→v2, sanitize dos novos campos e default dos novos campos.

**2. Estender `AtRiskSettingsPopover`**
Logo abaixo dos sliders, adicionar uma seção "Debug & filtros":
- Switch "Modo debug" → `settings.debug`.
- Multi-select compacto de estágios (chips toggle) — opções vindas dos `stage` distintos do `data` recebido, mais um conjunto-base (`Lead, Prospecção, Qualificação, Proposta, Negociação`). Clique alterna inclusão.
- Input de busca (`Input` + ícone Search) → `settings.keywordFilter`, com debounce de 200ms via `useDeferredValue`.
- Botão "Limpar filtros" zera apenas stage+keyword (mantém threshold/limit).
- Props novas: `availableStages: string[]`.

**3. Aplicar filtros em `AtRiskDealsFromPatterns`**
- Remover `useState(debug)` local; ler de `settings.debug`.
- Calcular `availableStages` via `useMemo` sobre `data` (stages não-nulos, ordenados).
- Calcular `filtered` via `useMemo`:
  - Se `stageFilter.length > 0` → `stageFilter.includes(d.stage ?? "")`.
  - Se `keywordFilter` não vazio → match em qualquer um dos 3 campos (lowercased).
- `visible = filtered.slice(0, settings.maxVisible)`.
- Atualizar a linha "Exibindo X de Y" para mostrar a contagem pós-filtro: `Exibindo {visible.length} de {filtered.length} (de {data.length} analisados)`.
- Quando filtros ativos zeram a lista mas `data.length > 0`, renderizar empty state específico: "Nenhum deal corresponde aos filtros atuais — limpe stage/keyword no ⚙".
- `matchedFamilyLabels` passa a usar `filtered` (catálogo destaca só as famílias dos deals visíveis no recorte).

**4. Telemetria leve (opcional, sem novo arquivo)**
Sem novo tracking — apenas `aria-label` descritivos (`"Filtro de estágio: Negociação ativo"`) para acessibilidade.

### Mudanças técnicas
- **Editar** `src/hooks/win-loss/useAtRiskSettings.ts`: adicionar campos, bump versão, migração v1→v2, sanitize estendido.
- **Editar** `src/test/hooks/useAtRiskSettings.test.ts`: 3 novos casos (defaults dos novos campos, migração v1, sanitize de array/string inválidos).
- **Editar** `src/components/win-loss/AtRiskSettingsPopover.tsx`: nova seção, prop `availableStages`, botão "Limpar filtros".
- **Editar** `src/components/win-loss/AtRiskDealsFromPatterns.tsx`: remover state local de debug, derivar `availableStages` e `filtered`, novo empty state filtrado, atualizar contador.
- **Não tocar** em `useAtRiskFromPatterns`, edge function, fixtures, scoring nem testes Deno — filtros são puramente client-side sobre o resultado já retornado.

### Verificação
1. `vitest run src/test/hooks/useAtRiskSettings.test.ts` → todos verdes (incluindo migração v1→v2).
2. Abrir o painel, marcar 1–2 estágios + digitar uma keyword → lista encolhe, contador "X de Y (de Z)" reflete; recarregar a página → filtros persistidos.
3. Toggle debug no popover → painéis `RiskDebugPanel` aparecem; recarregar → debug continua ativo.
4. Limpar filtros → stage/keyword voltam a vazio mas threshold/limit/maxVisible permanecem.
5. Preencher keyword sem match → empty state filtrado aparece com instrução clara.

