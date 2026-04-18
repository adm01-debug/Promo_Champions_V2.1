import { Progress } from "@/components/ui/progress";

interface Props {
  resolved: number;
  partial: number;
  unresolved: number;
}

export function ObjectionResolutionBar({ resolved, partial, unresolved }: Props) {
  const total = resolved + partial + unresolved;
  if (total === 0) {
    return <p className="text-sm text-muted-foreground">Nenhuma objeção detectada.</p>;
  }
  const rPct = (resolved / total) * 100;
  const pPct = (partial / total) * 100;
  const uPct = (unresolved / total) * 100;

  return (
    <div className="space-y-2">
      <div className="flex h-3 w-full overflow-hidden rounded-full bg-muted">
        <div
          className="h-full bg-success transition-all"
          style={{ width: `${rPct}%`, backgroundColor: "hsl(var(--success, var(--primary)))" }}
        />
        <div
          className="h-full transition-all"
          style={{ width: `${pPct}%`, backgroundColor: "hsl(var(--warning))" }}
        />
        <div
          className="h-full transition-all"
          style={{ width: `${uPct}%`, backgroundColor: "hsl(var(--destructive))" }}
        />
      </div>
      <div className="flex items-center justify-between text-xs">
        <span className="text-muted-foreground">
          <span className="font-medium" style={{ color: "hsl(var(--success, var(--primary)))" }}>
            {resolved}
          </span>{" "}
          resolvidas
        </span>
        <span className="text-muted-foreground">
          <span className="font-medium text-warning">{partial}</span> parciais
        </span>
        <span className="text-muted-foreground">
          <span className="font-medium text-destructive">{unresolved}</span> não resolvidas
        </span>
      </div>
      <Progress value={(resolved / total) * 100} className="hidden" />
    </div>
  );
}
