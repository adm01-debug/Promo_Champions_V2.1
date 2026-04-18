
Próxima: **Melhoria #12/20 — Sound Effects Polish & Contextual Audio Engine**.

## Problema
Os sons existem (`useRaceSounds`) mas são disparados de forma esparsa: só `victory` (takeover) e `overtake` estão ativos. Eventos importantes (checkpoint atingido, boost de combo, countdown final) passam mudos. Falta uma camada que conecte eventos do jogo aos sons já implementados.

## Solução
Criar um hook orquestrador `useRaceAudioEngine` que escuta mudanças de estado da arena e dispara o som certo no momento certo, com debounce para evitar spam.

### Hook `useRaceAudioEngine.ts` (~120L) em `src/hooks/race/`
- Recebe: `{ leaderboard, mySalespersonId, comboCount, secondsToEnd, play, muted }`
- Usa refs para detectar transições:
  - `prevComboRef`: dispara `powerup` quando combo cresce (≥3)
  - `prevMyProgressRef`: dispara `checkpoint` quando usuário cruza múltiplo de 25% (25/50/75/100)
  - `prevSecondsRef`: dispara `countdown` nos últimos 5s da season (1x por segundo)
  - `prevMyRankRef`: dispara `boost` quando usuário sobe ≥1 posição (separado do overtake global)
- Debounce 800ms entre sons do mesmo tipo
- Respeita `muted` (early return)
- Sem retorno (efeito puro)

### Componente `RaceAudioPreferences.tsx` (~80L) em `src/components/race/`
- Pequeno popover acessível pelo `RaceSoundToggle` (ou ao lado dele)
- 6 toggles individuais por tipo de som (boost, checkpoint, etc)
- Persiste em `localStorage` chave `race_sound_prefs`
- Estado padrão: todos ligados

### Refactor `useRaceSounds.ts` (mínimo)
- Adicionar leitura opcional de prefs por tipo: `play(type)` consulta `localStorage` antes de tocar
- Manter compatibilidade total com chamadas existentes

### Integração
- `RaceArenaView.tsx`: instanciar `useRaceAudioEngine({...})` perto dos demais detectores
- Adicionar `<RaceAudioPreferences />` no header da arena, agrupado com `RaceSoundToggle`

### Arquivos
- **Criar**: `src/hooks/race/useRaceAudioEngine.ts`, `src/components/race/RaceAudioPreferences.tsx`
- **Editar**: `src/hooks/race/useRaceSounds.ts` (mínimo), `src/pages/RaceArenaView.tsx`, `src/components/race/RaceArenaHeader.tsx` (adicionar prefs ao lado do toggle), `src/components/race/index.ts`

### Padrões
Semantic tokens, Sora/Inter, ≤200L, strict TS, `useRef` para debounce, sem deps externas, respeita `muted` global e prefs por tipo.

### Próximas (preview)
#13 Pit Stop tactical pause → #14 Weather/track conditions → #15 Ghost car (PR pessoal) → ... até #20.
