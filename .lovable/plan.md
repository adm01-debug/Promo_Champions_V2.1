
**Race Arena — Fase 3/3 (final): Power-ups, Countdown e Mini-card no Profile**

Fechando o módulo Race Arena em 10/10 com os ingredientes finais de "videogame de verdade".

## O que entregar

### 1. Power-ups coletáveis na pista
- `PowerUpIcon.tsx` (≤80L) — SVG pulsante (turbo ⚡, shield 🛡️, lightning 🌩️) posicionado em pontos da pista (15%, 45%, 80%).
- Hook `useRacePowerups(seasonId)` — lê `race_powerups` disponíveis + realtime.
- Edge function `collect-race-powerup` (verify_jwt=true) — usuário "coleta" power-up se progresso passou pelo ponto + ainda não coletou; insere registro + dispara evento `powerup` + concede badge se 3 coletados.
- Auto-spawn: ao iniciar season, gerar 3 power-ups disponíveis (turbo/shield/lightning) por vendedor — feito no `start-race-season`.
- Integração visual no `RaceArena.tsx`: renderizar power-ups não coletados na pista, animar coleta (escala + fade) quando carro passa pela posição.

### 2. Countdown 3-2-1-GO no início
- `RaceCountdown.tsx` (≤120L) — overlay grande tela (números 3→2→1→GO!) com Framer Motion + som `countdown` sintético (já existe no `useRaceSounds`).
- Trigger: aparece automaticamente quando season recém-criada (idade < 10s) OU quando usuário clica "Largada!" no header.
- Persiste em `localStorage` o id da season já vista para não repetir.

### 3. Mini-card "Meu Carro" no GamifiedProfile
- Adicionar bloco em `GamifiedProfile.tsx` mostrando: número do carro, cores, nickname, posição atual na corrida, badges conquistados (mini), botão "Ir para Race Arena".
- Componente `MyRaceCarMiniCard.tsx` (≤140L) reutilizável.

### 4. Som de countdown sintético
- Adicionar caso `countdown` em `useRaceSounds.ts` (3 beeps curtos + 1 longo agudo).

### 5. Validação
- `supabase--linter` zero novos warnings.
- Countdown aparece ao entrar em season nova; power-ups coletáveis e somem ao serem usados; mini-card no profile com link funcional.

## Arquivos
- **Migration**: nenhuma (tabela `race_powerups` já existe da Fase 1).
- **Criar**: `supabase/functions/collect-race-powerup/index.ts`, `src/hooks/race/useRacePowerups.ts`, `src/components/race/PowerUpIcon.tsx`, `src/components/race/RaceCountdown.tsx`, `src/components/profile/MyRaceCarMiniCard.tsx`.
- **Editar**: `start-race-season/index.ts` (auto-spawn power-ups), `useRaceSounds.ts` (som countdown), `RaceArena.tsx` (renderizar power-ups + countdown), `GamifiedProfile.tsx` (mini-card), `src/components/race/index.ts`, `supabase/config.toml` (verify_jwt para `collect-race-powerup`).

Após esta entrega, **Race Arena fecha 3/3 (10/10)** e retomo automaticamente o roadmap **Revenue Intelligence (2/4): Pipeline Coverage Analyzer**.
