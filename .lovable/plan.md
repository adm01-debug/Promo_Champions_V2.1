
Frentes A + B + C + D entregues. Resta a última onda: **5 refinos cirúrgicos de microinterações** + **disciplina de remoção** (analytics de overlays).

## Iterações sequenciais

### 1. Easing F1-real nos carros 🏎️
- Substituir spring genérico em `RaceCar.tsx`/`RaceTrack.tsx` por curva cubic-bezier estilo F1 (slow-in, fast-out: `cubic-bezier(0.22, 0.61, 0.36, 1)`).
- Token compartilhado em `src/lib/race/easings.ts` (`EASE_F1_ACCEL`, `EASE_F1_BRAKE`, `EASE_F1_COAST`).

### 2. Som contextual ao gap 🔊
- `useRivalProximityAudio.ts`: monitora `gap_pct` do rival. Quando <5%, dispara drone de fundo cujo pitch sobe 1 semitom a cada 1% de aproximação. Para automaticamente quando gap >7% (histerese).
- Respeita `useCalmMode` e mute global.

### 3. Hover persistente revela "capacete" 🪖
- `RaceCar.tsx`: ao hover, após 600ms, exibe avatar circular flutuante 32px acima do carro com nome + posição. Fade-in suave, dismiss em mouseleave.
- Acessível via `aria-describedby` apontando para tooltip.

### 4. Transição cinemática entre view modes 🎥
- `useRaceViewModeTransition.ts`: ao trocar `competitive ↔ focus ↔ immersive`, aplica blur+scale na pista (300ms) simulando zoom de TV F1.
- Respeita `useReducedMotion` e `useCalmMode` (nestes casos: cross-fade simples).

### 5. Celebração proporcional ao feito 🎆
- `getCelebrationIntensity.ts` (helper puro): calcula score (0-100) baseado em `from_rank`, `to_rank`, `is_takeover`, `is_top3`. Retorna `{ shake, fireworks, sound, duration }`.
- Integra em `RaceFireworks.tsx`, `RaceShakeWrapper.tsx`, `useRaceSounds.ts`. Overtake P15→P14 = pulse sutil; takeover P2→P1 = full fireworks + screen-shake + horn.

### 6. Analytics de overlays (disciplina de remoção) 📊
- `useOverlayVisibility.ts`: usa IntersectionObserver para registrar quais overlays foram efetivamente vistos por sessão (>2s visível). Salva agregado em `race_overlay_telemetry` (overlay_name, viewed_count, last_viewed_at).
- Migração: tabela `race_overlay_telemetry` (RLS: insert pelo próprio user, leitura admin).
- Painel admin existente recebe widget "Overlays usados nos últimos 30 dias" para guiar futuras remoções.

## Arquivos

**Novos:**
- `src/lib/race/easings.ts`
- `src/lib/race/getCelebrationIntensity.ts`
- `src/hooks/race/useRivalProximityAudio.ts`
- `src/hooks/race/useRaceViewModeTransition.ts`
- `src/hooks/race/useOverlayVisibility.ts`
- `src/components/race/CarHelmetTooltip.tsx`

**Editados:**
- `src/components/race/RaceCar.tsx` (helmet tooltip + easing F1)
- `src/components/race/RaceTrack.tsx` (transição cinemática mode swap)
- `src/components/race/RaceFireworks.tsx` (intensidade proporcional)
- `src/components/race/RaceShakeWrapper.tsx` (intensidade proporcional)
- `src/hooks/race/useRaceSounds.ts` (intensidade proporcional)
- `src/components/race/RaceArena.tsx` (instrumentar overlays + montar proximity audio)
- `src/pages/admin/RaceArenaAdmin.tsx` (widget telemetria de overlays)

**Migração SQL:**
- `race_overlay_telemetry` (id, user_id, overlay_name, viewed_count, last_viewed_at) + RLS

## Garantias
Tokens HSL · `useReducedMotion` + `useCalmMode` respeitados em todas as animações novas · som opt-in · arquivos < 200 linhas · zero erros de console · retrocompatível (telemetria silenciosa em caso de erro).
