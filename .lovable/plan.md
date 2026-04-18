
Próxima: **Melhoria #7/20 — Mini-Podium animado no RaceArenaHeader**.

## Plano

### Problema
O `RaceArenaHeader` tem badge de "Season ativa" mas não destaca os 3 primeiros colocados. O piloto precisa rolar até a sidebar para ver o pódio. Falta um resumo visual instantâneo do top 3.

### Solução
Novo componente `MiniPodium.tsx` (~150L) em `src/components/race/`, renderizado no slot `belowChildren` do `RaceArenaHeader`:

**Visual:**
- 3 avatares horizontais lado a lado: 🥇 1º (centro, maior, elevado), 🥈 2º (esquerda), 🥉 3º (direita)
- Cada slot mostra: Avatar com HexFrame, nome (truncado), valor de vendas formatado (Sora black), número do carro como badge
- Coroa animada flutuando sobre o líder (`animate-bounce` sutil)
- Borda dourada/prata/bronze por posição usando tokens semânticos (`warning`, `muted-foreground`, accent custom)
- Layout responsivo: stack vertical em mobile (<640px), horizontal em desktop

**Animações:**
- Entrada com `staggerChildren` (200ms entre slots)
- `layoutId` por `car_id` para transição suave quando ranking muda
- Pulse sutil no líder; respeita `prefers-reduced-motion`
- Hover: leve `scale: 1.03` com `whileHover`

**A11y:**
- `role="list"` + `role="listitem"` por slot
- `aria-label="Top 3 da temporada"` no container

### Integração
- `RaceArenaHeader.tsx`: aceitar nova prop opcional `topEntries?: RaceLeaderboardEntry[]` e renderizar `<MiniPodium entries={topEntries} />` no `belowChildren` quando houver ≥1 entry
- `RaceArenaView.tsx`: passar `entries.slice(0, 3)` como `topEntries` ao header
- Exportar em `src/components/race/index.ts`
- Reutilizar formatador `fmt()` de moeda (extrair p/ `src/components/race/raceFormatters.ts` se ainda não existir, ~20L)

### Arquivos
- **Criar**: `src/components/race/MiniPodium.tsx`, `src/components/race/raceFormatters.ts`
- **Editar**: `src/components/race/RaceArenaHeader.tsx`, `src/pages/RaceArenaView.tsx`, `src/components/race/index.ts`, `src/components/race/RaceLeaderboardSidebar.tsx` (consumir formatter)

### Padrões
Semantic tokens, Sora/Inter, ≤200L por arquivo, strict TS, framer-motion com `useReducedMotion`, sem cores hardcoded.

### Próximas (preview)
#8 Histórico de campeões mensais → #9 Highlight Reel de ultrapassagens → #10 Predictive ranking → ... até #20.
