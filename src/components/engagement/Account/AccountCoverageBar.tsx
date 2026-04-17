import { cn } from "@/lib/utils";
import { formatCoverage } from "./accountHelpers";

interface Props {
  coverage: number | null | undefined;
  engaged?: number;
  total?: number;
  className?: string;
}

export function AccountCoverageBar({ coverage, engaged, total, className }: Props) {
  const pct = Math.max(0, Math.min(100, Number(coverage ?? 0)));
  const tone =
    pct >= 70 ? "bg-success" :
    pct >= 40 ? "bg-primary" :
    pct >= 20 ? "bg-warning" : "bg-muted-foreground";

  return (
    <div className={cn("space-y-1", className)}>
      <div className="flex items-center justify-between text-xs">
        <span className="text-muted-foreground">Cobertura do comitê</span>
        <span className="font-medium tabular-nums">
          {formatCoverage(pct)}
          {engaged !== undefined && total !== undefined && (
            <span className="ml-1 text-muted-foreground">({engaged}/{total})</span>
          )}
        </span>
      </div>
      <div className="h-2 rounded-full bg-muted overflow-hidden">
        <div
          className={cn("h-full rounded-full transition-all duration-500", tone)}
          style={{ width: `${pct}%` }}
          aria-label={`Cobertura ${formatCoverage(pct)}`}
        />
      </div>
    </div>
  );
}
