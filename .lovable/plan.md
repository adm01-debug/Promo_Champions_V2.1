

## Ordenação configurável no painel AtRisk: score ↓ vs recência ↓

### Objetivo
Hoje a lista de deals em risco vem ordenada do backend por `risk_score` desc (implícito, sem opção). Adicionar um seletor de **ordenação** no popover para alternar entre:
- **Score (alto → baixo)** — comportamento atual, padrão.
- **Recência (mais recente → mais antigo)** — usa `breakdown.days_stagnant` como proxy invertido (menor = mais recente). Útil para o vendedor que quer **agir primeiro nos deals que ainda têm calor**, antes de virarem casos arquivados.

A escolha persiste no perfil (cross-device via `user_app_settings`, herda free do `useSyncedSetting` já implementado).

### Fonte de "recência"

`breakdown.days_stagnant` (computado pela edge a partir de `sales.updated_at`) é a melhor aproximação disponível no payload atual — **zero mudança no backend**. Quando ausente (deals legacy ou erro), o item cai pro fim da lista de "recência" mas mantém ordem secundária por score.

### Mudanças

#### 1. `useAtRiskSettings` — campo `sortBy: "score" | "recency"`

```ts
export type AtRiskSortBy = "score" | "recency";

interface AtRiskSettings {
  // … existentes
  sortBy: AtRiskSortBy;  // default "score"
}
```

- Sanitização: aceita apenas os 2 valores; fallback para `"score"`.
- Sem bump de schema (v4 mantido) — campo ausente em payloads antigos cai no default automaticamente via `sanitize()`.
- Incluído no `clearFilters`? **Não** — sort é uma preferência de visualização, não um filtro. Mantém ao limpar.
- Incluído em `reset` (já incluso por substituir tudo pelos defaults).

#### 2. `AtRiskDealsFromPatterns.tsx` — aplicar sort após filtros

```ts
const sorted = useMemo(() => {
  if (settings.sortBy === "score") return filtered; // já vem do BE em score desc
  return [...filtered].sort((a, b) => {
    const da = a.breakdown?.days_stagnant ?? Number.POSITIVE_INFINITY;
    const db = b.breakdown?.days_stagnant ?? Number.POSITIVE_INFINITY;
    if (da !== db) return da - db;             // mais recente primeiro
    return b.risk_score - a.risk_score;        // tiebreak por score desc
  });
}, [filtered, settings.sortBy]);

const visible = sorted.slice(0, settings.maxVisible);
```

Substituir `filtered.slice(...)` por `sorted.slice(...)` no `visible` e nos lugares que usam `filtered.length` para "ocultos" — total continua igual (sort não filtra).

#### 3. `AtRiskSettingsPopover.tsx` — UI do seletor

Novo bloco **logo abaixo dos sliders de score/limit/visible** e antes do separador para Estágios:

```text
┌─────────────────────────────────────┐
│ Ordenar por                         │
│ ┌──────────────┬──────────────────┐ │
│ │ ↓ Score       │ 🕐 Recência     │ │
│ └──────────────┴──────────────────┘ │
│ Recência usa days_stagnant (menor   │
│ = mais recente)                     │
└─────────────────────────────────────┘
```

`ToggleGroup type="single"` (mesmo componente já usado pelos presets) com 2 itens, cada um com tooltip explicando a métrica.

Trigger do popover **inalterado** — sort não merece bolinha de "filtros ativos".

### Arquivos

**Editado**
- `src/hooks/win-loss/useAtRiskSettings.ts` — `AtRiskSortBy`, default `"score"`, sanitização, expor no settings.
- `src/components/win-loss/AtRiskDealsFromPatterns.tsx` — `useMemo` `sorted`, troca `filtered.slice` por `sorted.slice` em `visible`.
- `src/components/win-loss/AtRiskSettingsPopover.tsx` — novo bloco ToggleGroup com 2 itens; recebe `sortBy` e `onSortChange` (ou consome `settings.sortBy` direto, igual aos outros campos).

**Novo (teste)**
- `src/test/hooks/atRiskSortBy.test.ts`:
  1. Default `sortBy === "score"`.
  2. `sanitize({ sortBy: "invalid" })` → `"score"`.
  3. `sanitize({ sortBy: "recency" })` → `"recency"`.
  4. Settings antigos (sem `sortBy`) caem em default.
- `src/test/components/winloss/AtRiskSortOrder.test.tsx`:
  1. `sortBy="score"` → ordem retorna como recebida (BE já ordena).
  2. `sortBy="recency"` com `[{days_stagnant:30,score:90},{days_stagnant:5,score:60},{days_stagnant:10,score:80}]` → ordem `[5d, 10d, 30d]`.
  3. Tiebreak: dois deals com mesmo `days_stagnant` ordenam por score desc.
  4. `breakdown` ausente → vai para o fim na ordenação por recência.

### Critério de aceite
1. Default `sortBy="score"` → painel idêntico ao de hoje (ordem do BE).
2. Trocar para "Recência" no popover → lista re-ordena em <100ms; deal com `days_stagnant=5` aparece antes de `days_stagnant=30` mesmo com score menor.
3. Empate de recência → quem tem score maior fica acima.
4. Deal sem `breakdown.days_stagnant` aparece por último em modo "Recência" (não some).
5. Reload preserva escolha (sync via `user_app_settings`); trocar de navegador logado mantém a preferência.
6. "Limpar filtros" **não** muda o sort. "Restaurar padrões" volta para `"score"`.
7. Suítes novas verdes; suítes existentes (`useAtRiskSettings`/`atRiskPresets`/`atRiskSeverityFilter`/`useSyncedSetting`) verdes; backend e suite Deno do `detect-winloss-at-risk` permanecem inalterados.

