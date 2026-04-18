
Próxima: **Melhoria #4/20 — Transição Hub ↔ Pistas com motion shared layout**.

## Plano

### Problema atual
Navegação entre o Hub da Race Arena e as pistas (Closer/SDR) é instantânea, sem transição cinematográfica. Quebra a imersão do "entrar na pista".

### Solução
Wrapper de transição reutilizando `PageTransition` + `AnimatePresence` com `mode="wait"`:

1. **Identificar Hub e RaceArenaView**: localizar o componente Hub (provavelmente `RaceArenaHub.tsx` ou similar) e confirmar que `RaceArenaView` recebe `roleType` via rota/param.
2. **Criar `RaceTransitionWrapper.tsx`** (~80L) em `src/components/race/`:
   - Usa `AnimatePresence mode="wait"` com `key` derivado da rota (`hub` | `closer` | `sdr`)
   - Animação custom: Hub → Pista = slide horizontal + zoom-in sutil (sensação de entrar na pista) com blur de saída
   - Pista → Hub = zoom-out + fade (sensação de afastar)
   - Respeita `prefers-reduced-motion` (fade simples como fallback)
3. **Aplicar no router**: envolver as rotas `/race-arena`, `/race-arena/closer`, `/race-arena/sdr` com o wrapper, ou aplicar dentro do layout pai dessas rotas.
4. **Headline animada**: no `RaceArenaHeader`, animar título com `layoutId="race-title"` para shared element transition entre Hub (cards das pistas) e Header da pista escolhida.

### Arquivos
- **Criar**: `src/components/race/RaceTransitionWrapper.tsx`
- **Editar**: `src/routes/AppRoutes.tsx` (ou layout específico das rotas race), `src/components/race/RaceArenaHeader.tsx` (adicionar `layoutId`), `src/components/race/index.ts`
- **Investigar primeiro**: localizar Hub atual e cards de pista para aplicar `layoutId` correspondente

### Padrões
- Semantic tokens, framer-motion spring (stiffness 280, damping 28), ≤200L
- `prefers-reduced-motion` honrado
- Sem layout shift; usa `position: relative` no container

### Próximas (preview)
#5 Painel "Próxima Meta" no sidebar → #6 Combo Streak indicator → #7 Mini-podium no header → #8 Histórico de campeões... até #20.
