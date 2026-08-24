import { formatDaysRemaining } from "./velocityHelpers";

interface Props {
  daysInStage: number;
  expectedDays: number;
  remainingDays: number;
  currentStage: string;
}

export function VelocityForecastTimeline({ daysInStage, expectedDays, remainingDays, currentStage }: Props) {
  const totalSpan = Math.max(daysInStage + remainingDays, expectedDays, 1);
  const elapsedPct = Math.min(100, (daysInStage / totalSpan) * 100);
  const expectedPct = Math.min(100, (expectedDays / totalSpan) * 100);

  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between text-[10px] text-muted-foreground">
        <span>Estágio: <span className="font-medium text-foreground/80">{currentStage}</span></span>
        <span>Falta: <span className="font-medium text-foreground/80">{formatDaysRemaining(remainingDays)}</span></span>
      </div>
      <div className="relative h-2.5 w-full rounded-full bg-muted overflow-hidden">
        {/* Expected baseline marker */}
        <div
          className="absolute top-0 h-full w-px bg-foreground/40"
          style={{ left: `${expectedPct}%` }}
          title={`Esperado: ${expectedDays.toFixed(0)}d`}
        />
        {/* Elapsed */}
        <div
          className="h-full bg-gradient-to-r from-primary/60 to-primary transition-all"
          style={{ width: `${elapsedPct}%` }}
        />
      </div>
      <div className="flex items-center justify-between text-[10px] text-muted-foreground tabular-nums">
        <span>{daysInStage}d decorridos</span>
        <span className="text-foreground/60">| baseline {expectedDays.toFixed(0)}d</span>
        <span>+{remainingDays}d previstos</span>
      </div>
    </div>
  );
}
