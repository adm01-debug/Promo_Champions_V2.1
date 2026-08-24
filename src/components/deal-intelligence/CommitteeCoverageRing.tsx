import { tierRingClass, tierLabel, type CoverageTier } from "./committeeHelpers";

interface Props {
  score: number;
  tier: CoverageTier;
  size?: number;
}

export function CommitteeCoverageRing({ score, tier, size = 88 }: Props) {
  const r = (size - 12) / 2;
  const c = 2 * Math.PI * r;
  const offset = c - (score / 100) * c;
  return (
    <div className="relative shrink-0" style={{ width: size, height: size }}>
      <svg viewBox={`0 0 ${size} ${size}`} className="w-full h-full -rotate-90">
        <circle cx={size / 2} cy={size / 2} r={r} className="stroke-muted fill-none" strokeWidth="6" />
        <circle
          cx={size / 2} cy={size / 2} r={r}
          className={`fill-none transition-all duration-700 ${tierRingClass(tier)}`}
          strokeWidth="6"
          strokeDasharray={c}
          strokeDashoffset={offset}
          strokeLinecap="round"
        />
      </svg>
      <div className="absolute inset-0 flex flex-col items-center justify-center">
        <span className="text-xl font-display font-bold tabular-nums">{Math.round(score)}</span>
        <span className="text-[9px] text-muted-foreground uppercase tracking-wide">{tierLabel(tier)}</span>
      </div>
    </div>
  );
}
