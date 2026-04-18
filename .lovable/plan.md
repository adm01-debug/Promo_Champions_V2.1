
Adicionar partículas de poeira/fumaça quando carros cruzam checkpoints (curvas fechadas), reaproveitando o padrão já existente em `TrackTireMarks`.

## Mudanças

**Novo `src/components/race/track/TrackDustParticles.tsx`**
- Mesma lógica de detecção de `TrackTireMarks`: usa `prevRef` + `CHECKPOINTS` para disparar emissão quando um carro cruza um checkpoint
- Cada emissão gera 5-7 partículas com:
  - posição inicial = `getPositionOnTrack(checkpoint, ±jitter)`
  - velocidade aleatória (vx, vy) leve, dispersa contra a direção do carro (rotation + 180° ± 40°)
  - life de 700ms, raio crescendo de 1.5 → 5px, opacity caindo de 0.55 → 0
  - cor `hsl(var(--race-runoff))` (poeira bege) misturada com `hsl(0 0% 80% / 0.4)` (fumaça)
- Animação via `requestAnimationFrame` interno (estado de partículas atualizado a ~30fps); GC remove partículas expiradas
- Limite máximo de ~120 partículas simultâneas para performance
- `<g pointerEvents="none" aria-hidden>` com `<circle>` por partícula

**`src/components/race/RaceTrack.tsx`**
- Aceitar `cars` prop (já vem via `children` indiretamente — vamos passar explicitamente). Alternativa mais limpa: receber `carSnapshots: Array<{id, progress}>` opcional e renderizar `<TrackDustParticles cars={carSnapshots} />` dentro do `<g transform>` da pista, logo após `TrackTireMarks` (ou seguir o padrão usado hoje)

Investigar onde `TrackTireMarks` é montado hoje para seguir exatamente o mesmo ponto de injeção e reaproveitar o snapshot de carros já disponível.

## Resultado
Curvas ganham vida: nuvenzinhas de poeira/fumaça se dispersam atrás de cada carro ao cruzar checkpoints, complementando os rastros de pneu existentes — sensação Mario Kart / F1 arcade.
