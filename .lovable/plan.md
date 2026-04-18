
Próxima onda de melhorias rumo ao 10/10 — imersão sonora, ar de transmissão e telemetria do piloto.

## Iterações (sequencial, sem pausas)

### 1. Sound design 🔊
- `useRaceSounds.ts` (já existe — expandir): garantir cobertura para overtakes top-3, takeover do líder, tier-up de combo, fim de season.
- Integrar disparos em `RaceArena.tsx` nos eventos já detectados.
- `RaceMuteToggle.tsx`: botão 🔊/🔇 ao lado do `RaceCountdownBadge`.

### 2. Modo Broadcast (TV F1) 📺
- `BroadcastOverlay.tsx`: lower-third inferior animado, rotaciona a cada 12s entre eventos quentes (gap < 1%, overtake recente, últimos 5% da season).
- Bandeira virtual no topo: 🟢 normal · 🟡 overtake recente · 🏁 reta final.

### 3. Telemetria do piloto 📊
- `MyTelemetryPanel.tsx`: card colapsável com velocidade média (deals/dia da week), best lap pessoal, delta vs ghost (`useGhostCar`), barrinha de "fadiga dos pneus" (dias sem venda) e próximo objetivo (`useNextGoal`).

### 4. Pit stop visual 🛠️
- `PitLane.tsx`: garagem SVG lateral. Carro entra automaticamente quando piloto fica > 24h sem venda; sai ao registrar próxima. 4 mecânicos animados ao redor.

### 5. Replay highlight 🎬
- `useRaceReplay.ts` + `RaceReplayButton.tsx`: replay 4s das últimas 10 posições com easing acelerado e flash branco em cada cruzamento.

### 6. Easter eggs 🎁
- `RaceEasterEggs.tsx`: Konami code → "rainbow road" 10s. Aniversário do vendedor → coroa flutuante. 100% da season → confetti + fogos SVG no P1.

## Arquivos

**Novos:** `useRaceReplay.ts`, `BroadcastOverlay.tsx`, `MyTelemetryPanel.tsx`, `PitLane.tsx`, `RaceReplayButton.tsx`, `RaceMuteToggle.tsx`, `RaceEasterEggs.tsx`

**Editados:** `RaceArena.tsx` (montagem + integração de eventos sonoros), `useRaceSounds.ts` (cobertura completa de eventos), `index.css` (keyframes broadcast-slide-in, rainbow-road, fireworks, pit-mechanic-bounce)

## Garantias
Tokens HSL · `pointerEvents="none"` em decorativos · `aria-hidden` · `useReducedMotion` respeitado · sons opt-in (mutável) · arquivos < 200 linhas · zero erros de console · retrocompatível.
