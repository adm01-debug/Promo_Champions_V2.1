import { Badge } from "@/components/ui/badge";

interface Props {
  seller: number | null | undefined;
  client: number | null | undefined;
}

export function TalkRatioBar({ seller, client }: Props) {
  const s = Math.max(0, Math.min(100, Number(seller) || 0));
  const c = Math.max(0, Math.min(100, Number(client) || 0));
  const total = s + c || 1;
  const sPct = (s / total) * 100;
  const cPct = (c / total) * 100;
  const idealZone = s >= 40 && s <= 55;
  const tooMuch = s > 65;

  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between text-xs">
        <span className="font-medium text-foreground">Talk Ratio</span>
        {tooMuch ? (
          <Badge variant="warning" size="sm">Vendedor falou demais</Badge>
        ) : idealZone ? (
          <Badge variant="success" size="sm">Zona ideal (40–55%)</Badge>
        ) : (
          <Badge variant="info" size="sm">Fora do ideal</Badge>
        )}
      </div>
      <div className="relative h-3 w-full overflow-hidden rounded-full bg-muted">
        <div
          className="absolute left-0 top-0 h-full bg-primary transition-all"
          style={{ width: `${sPct}%` }}
          title={`Vendedor ${s.toFixed(1)}%`}
        />
        <div
          className="absolute top-0 h-full bg-accent transition-all"
          style={{ left: `${sPct}%`, width: `${cPct}%` }}
          title={`Cliente ${c.toFixed(1)}%`}
        />
        {/* benchmark zone marker 40-55% */}
        <div
          className="pointer-events-none absolute top-0 h-full border-x border-success/60"
          style={{ left: "40%", width: "15%" }}
        />
      </div>
      <div className="flex items-center justify-between text-xs text-muted-foreground">
        <span>
          <span className="inline-block h-2 w-2 rounded-full bg-primary mr-1" />
          Vendedor {s.toFixed(1)}%
        </span>
        <span>
          <span className="inline-block h-2 w-2 rounded-full bg-accent mr-1" />
          Cliente {c.toFixed(1)}%
        </span>
      </div>
    </div>
  );
}
