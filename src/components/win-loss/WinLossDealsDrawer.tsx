import { Sheet, SheetContent, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Badge } from "@/components/ui/badge";
import { fmtBRL, stageLabel } from "@/components/deal-intelligence/winloss/winLossHelpers";
import type { WLAnalysisRow } from "@/hooks/win-loss/useWinLossData";

interface Props {
  open: boolean;
  onOpenChange: (o: boolean) => void;
  title: string;
  rows: WLAnalysisRow[];
}

export function WinLossDealsDrawer({ open, onOpenChange, title, rows }: Props) {
  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent className="w-full sm:max-w-xl">
        <SheetHeader>
          <SheetTitle>{title}</SheetTitle>
          <p className="text-xs text-muted-foreground">{rows.length} deals</p>
        </SheetHeader>
        <ScrollArea className="h-[calc(100vh-100px)] mt-3 pr-4">
          <div className="space-y-2">
            {!rows.length && (
              <p className="text-sm text-muted-foreground py-12 text-center">Sem deals para essa seleção.</p>
            )}
            {rows.map(r => (
              <div key={r.id} className="rounded-lg border border-border/50 p-3 bg-card">
                <div className="flex items-center justify-between gap-2 mb-1">
                  <Badge variant="outline" className={r.outcome === "won" ? "border-emerald-500/40 text-emerald-700" : "border-rose-500/40 text-rose-700"}>
                    {r.outcome === "won" ? "Won" : "Lost"}
                  </Badge>
                  <span className="text-xs tabular-nums text-muted-foreground">
                    {fmtBRL(Number(r.amount) || 0)}
                  </span>
                </div>
                <p className="text-sm font-medium truncate">{r.primary_reason ?? "Sem motivo"}</p>
                <div className="flex flex-wrap gap-1.5 mt-1.5 text-[11px] text-muted-foreground">
                  {r.lost_stage && <span>Estágio: {stageLabel(r.lost_stage)}</span>}
                  {r.competitor && <span>· vs. {r.competitor}</span>}
                  {r.cycle_days && <span>· {Number(r.cycle_days).toFixed(0)}d</span>}
                  {r.segment && <span>· {r.segment}</span>}
                </div>
              </div>
            ))}
          </div>
        </ScrollArea>
      </SheetContent>
    </Sheet>
  );
}
