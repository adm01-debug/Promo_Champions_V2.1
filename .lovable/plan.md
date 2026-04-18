
Roadmap top-5 da análise exaustiva já foi 100% executado na iteração anterior (slipstream, gap badge, exhaust+chama, rumble strips animados, xadrez ondulado, blimp, bandeiras, plaquinhas, blur volumétrico, countdown LED). Para continuar rumo ao 10/10, vou executar a próxima onda de polimentos (itens HUD/microinterações pendentes da análise + refinos finais).

## Próximas iterações (sequencial, sem pausas)

### 1. Mini-mapa periférico
- Novo `RaceMiniMap.tsx` (canto inferior esquerdo): SVG ~120×80 px com silhueta da pista + pontinhos coloridos por carro. Glassmorphism, leitura periférica.

### 2. Timeline de eventos ao vivo
- Novo `RaceEventTicker.tsx`: faixa horizontal compacta acima do leaderboard com últimos 3 eventos ("🏁 X tomou P1 às 10:32", "⚡ Y ativou DRS"). Auto-scroll, fade.

### 3. DRS Zone overlay visual
- Novo `DRSZoneOverlay.tsx`: trecho da reta principal com overlay azul translúcido pulsante + ícone "DRS" sinalizando zona de ultrapassagem.

### 4. Ghost trail neon do líder
- Novo `LeaderNeonTrail.tsx`: rastro colorido (cor do time) seguindo o líder com 8 pontos históricos em gradiente fade.

### 5. Screen shake em ultrapassagens top-3
- Hook `useScreenShake.ts` + integração em `RaceArena`: dispara shake sutil (translate ±2px, 250ms) quando overtake afeta top 3.

### 6. Lap counter LED-style
- Novo `LapCounterBadge.tsx`: badge canto inferior esquerdo (oposto do countdown) com "LAP 3 / ∞" em fonte mono LED.

## Estrutura

**Novos:**
- `src/components/race/RaceMiniMap.tsx`
- `src/components/race/RaceEventTicker.tsx`
- `src/components/race/DRSZoneOverlay.tsx`
- `src/components/race/LeaderNeonTrail.tsx`
- `src/components/race/LapCounterBadge.tsx`
- `src/hooks/race/useScreenShake.ts`

**Editados:**
- `src/components/race/RaceArena.tsx` (montar todos)
- `src/index.css` (keyframes neon-trail, drs-zone-pulse, screen-shake, ticker-fade)

## Garantias
- Tokens HSL semânticos, `pointerEvents="none"` em decorativos, `aria-hidden`, `useReducedMotion` respeitado, arquivos < 200 linhas, zero erros de console. Execução sequencial sem pausas.
