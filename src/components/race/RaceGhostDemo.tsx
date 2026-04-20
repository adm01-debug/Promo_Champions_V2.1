import { motion } from 'framer-motion';
import { RaceCar } from './RaceCar';
import { getPositionOnTrack } from './raceTrackHelpers';
import { RaceTrack } from './RaceTrack';

const DEMO_CARS = [
  { number: 7, primary: 'hsl(var(--destructive))', secondary: 'hsl(var(--background))', style: 'f1' as const, lane: -16, offset: 0 },
  { number: 11, primary: 'hsl(var(--accent))', secondary: 'hsl(var(--background))', style: 'stock' as const, lane: 0, offset: 0.12 },
  { number: 22, primary: 'hsl(var(--coins))', secondary: 'hsl(var(--background))', style: 'kart' as const, lane: 16, offset: 0.24 },
];

/**
 * Demo ghost-race: 3 carros animados em loop sobre a pista real.
 * Usado em empty states e onboarding para demonstrar o produto vivo.
 */
export function RaceGhostDemo() {
  return (
    <div className="relative w-full aspect-[5/3] rounded-xl overflow-hidden border border-border bg-[hsl(var(--race-grass))]">
      <RaceTrack>
        {DEMO_CARS.map((c) => (
          <motion.g
            key={c.number}
            animate={{ progress: 1 } as never}
            initial={false}
          >
            <DemoCarLoop {...c} />
          </motion.g>
        ))}
      </RaceTrack>
      <div className="absolute bottom-2 left-3 text-[10px] text-foreground/70 bg-background/70 backdrop-blur-sm px-2 py-0.5 rounded font-medium">
        Demo
      </div>
    </div>
  );
}

function DemoCarLoop({
  primary, secondary, style, lane, offset,
}: typeof DEMO_CARS[number]) {
  // Anima progresso 0..1 em loop e amostra a pista a cada frame via framer keyframes
  const STEPS = 60;
  const xs: number[] = [], ys: number[] = [], rots: number[] = [];
  for (let i = 0; i <= STEPS; i++) {
    const p = ((i / STEPS) + offset) % 1;
    const pos = getPositionOnTrack(p, lane);
    xs.push(pos.x); ys.push(pos.y); rots.push(pos.rotation);
  }
  return (
    <motion.g
      animate={{ x: xs, y: ys, rotate: rots }}
      transition={{ duration: 9, ease: 'linear', repeat: Infinity }}
    >
      <RaceCar primaryColor={primary} secondaryColor={secondary} style={style} />
    </motion.g>
  );
}
