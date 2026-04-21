

## Threshold configurável de risco no painel AtRisk

### Objetivo
Permitir ajustar em runtime o **score mínimo** (e quantos deals mostrar) que filtram o painel "Deals em risco — padrões de loss", sem alterar código nem republicar a edge function. Persistido por usuário (localStorage).

### Estado atual
- Backend `detect-winloss-at-risk` já aceita `threshold` (0–100) e `limit` (1–100) no body, defaults 40 e 20.
- Frontend chama `body: {}` — usa só os defaults.
- Render usa `data.slice(0, 8)` — limite hardcoded.

### Mudanças

**1. Hook `src/hooks/win-loss/useAtRiskFromPatterns.ts`**
- Aceitar `params: { threshold?: number; limit?: number }` e enviar no body.
- `queryKey` inclui params (refetch automático ao mudar).
- `refresh` propaga os mesmos params.

**2. Novo `src/hooks/win-loss/useAtRiskSettings.ts`**
- Persistência em `localStorage` (`winloss-at-risk-settings`, com `version: 1`).
- Schema: `{ threshold: number 0–100, limit: number 5–50, maxVisible: number 3–20 }`.
- Defaults: `{ threshold: 40, limit: 20, maxVisible: 8 }`.
- API: `{ settings, update(partial), reset() }` + clamp ao gravar.
- Resiliente a JSON inválido — volta a defaults.

**3. Novo `src/components/win-loss/AtRiskSettingsPopover.tsx`**
- Botão `SlidersHorizontal` no header do card.
- Popover com 3 sliders (Score mínimo / Máximo analisado / Mostrar no painel) + mini-stats ("Threshold X · mostrando Y de Z") + "Restaurar padrões".
- Acessível: `<Label>` por slider, `aria-valuetext`.

**4. `AtRiskDealsFromPatterns.tsx`**
- Consome `useAtRiskSettings()` → passa `threshold`/`limit` para o hook de dados.
- `data.slice(0, settings.maxVisible)`.
- Empty state contextual: "Nenhum deal com score ≥ {threshold}".
- Footer "Exibindo X de Y deals — ajuste no ⚙" quando ocultando itens.

**5. Teste vitest `src/test/hooks/useAtRiskSettings.test.ts`**
- Defaults com storage vazio · merge parcial · clamp dos 3 ranges · `reset` limpa chave · JSON inválido não quebra.

### Detalhes técnicos
- Backend já valida ranges; frontend faz clamp espelhado para evitar requests inválidas.
- `queryKey: ["winloss-at-risk-from-patterns", threshold, limit]` — cada combinação tem cache próprio.
- `maxVisible` puramente client-side (sem refetch).
- Sem mudança em `scoring.ts` nem `index.ts` da edge.

### Ordem
1. Estender `useAtRiskFromPatterns` para aceitar params.
2. Criar `useAtRiskSettings.ts` + teste vitest.
3. Criar `AtRiskSettingsPopover.tsx`.
4. Integrar no `AtRiskDealsFromPatterns.tsx`.
5. Atualizar `mem://features/winloss-at-risk-scoring.md`.

