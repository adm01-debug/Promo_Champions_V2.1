import { cn } from "@/lib/utils";

interface Props {
  hourDistribution: number[];
  dowDistribution: number[];
  compact?: boolean;
}

const DOW = ["D", "S", "T", "Q", "Q", "S", "S"];

export function SendTimeHeatmap({ hourDistribution, dowDistribution, compact }: Props) {
  const hourMax = Math.max(1, ...hourDistribution);
  const dowMax = Math.max(1, ...dowDistribution);

  return (
    <div className={cn("space-y-2", compact ? "text-[9px]" : "text-xs")}>
      <div>
        <div className="text-muted-foreground mb-1">Por hora</div>
        <div className="flex items-end gap-[2px] h-10">
          {hourDistribution.map((v, i) => {
            const intensity = v / hourMax;
            return (
              <div
                key={i}
                className="flex-1 rounded-sm bg-primary"
                style={{
                  opacity: 0.15 + intensity * 0.85,
                  height: `${Math.max(8, intensity * 100)}%`,
                }}
                title={`${i}h · ${v}`}
              />
            );
          })}
        </div>
        <div className="flex justify-between text-muted-foreground mt-1">
          <span>0h</span>
          <span>12h</span>
          <span>23h</span>
        </div>
      </div>
      <div>
        <div className="text-muted-foreground mb-1">Por dia da semana</div>
        <div className="grid grid-cols-7 gap-1">
          {dowDistribution.map((v, i) => {
            const intensity = v / dowMax;
            return (
              <div
                key={i}
                className="rounded-sm flex flex-col items-center justify-center py-1 bg-primary"
                style={{ opacity: 0.15 + intensity * 0.85 }}
                title={`${DOW[i]} · ${v}`}
              >
                <div className="text-primary-foreground font-medium">{DOW[i]}</div>
                <div className="text-[9px] text-primary-foreground/80">{v}</div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
