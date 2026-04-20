import { useMemo } from "react";
import { useQuery } from "@tanstack/react-query";
import { Sheet, SheetContent, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Badge } from "@/components/ui/badge";
import { ExternalLink, MessageCircle } from "lucide-react";
import { fmtBRL, stageLabel } from "@/components/deal-intelligence/winloss/winLossHelpers";
import { supabase } from "@/integrations/supabase/client";
import { Link } from "react-router-dom";
import type { WLAnalysisRow } from "@/hooks/win-loss/useWinLossData";

export interface DrawerFilter {
  outcome?: "won" | "lost";
  reason?: string;
  stage?: string;
  competitor?: string;
  salespersonId?: string;
  period?: string; // formatted period label from chart click (informational)
}

interface Props {
  open: boolean;
  onOpenChange: (o: boolean) => void;
  title: string;
  rows: WLAnalysisRow[];
  filter?: DrawerFilter;
}

interface SaleMeta {
  id: string;
  account_id: string | null;
  client_name: string | null;
}

const sentimentEmoji = (outcome: "won" | "lost"): string => (outcome === "won" ? "😊" : "😟");

export function WinLossDealsDrawer({ open, onOpenChange, title, rows, filter }: Props) {
  const filtered = useMemo(() => {
    if (!filter) return rows;
    return rows.filter(r => {
      if (filter.outcome && r.outcome !== filter.outcome) return false;
      if (filter.reason && r.primary_reason !== filter.reason) return false;
      if (filter.stage && r.lost_stage !== filter.stage) return false;
      if (filter.competitor && r.competitor !== filter.competitor) return false;
      return true;
    });
  }, [rows, filter]);

  const saleIds = useMemo(() => filtered.slice(0, 30).map(r => r.sale_id), [filtered]);

  const { data: salesMeta = {} } = useQuery({
    queryKey: ["wl-drawer-sales-meta", saleIds.sort().join(",")],
    enabled: open && saleIds.length > 0,
    queryFn: async (): Promise<Record<string, SaleMeta>> => {
      const { data: sales } = await supabase
        .from("sales")
        .select("id, account_id, client_name")
        .in("id", saleIds);
      const map: Record<string, SaleMeta> = {};
      ((sales as Array<{ id: string; account_id: string | null; client_name: string | null }> | null) ?? []).forEach((s) => {
        map[s.id] = {
          id: s.id,
          account_id: s.account_id,
          client_name: s.client_name,
        };
      });
      return map;
    },
    staleTime: 30_000,
  });

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent className="w-full sm:max-w-xl max-h-[85vh] sm:max-h-screen overflow-hidden flex flex-col">
        <SheetHeader>
          <SheetTitle>{title}</SheetTitle>
          <p className="text-xs text-muted-foreground">{filtered.length} deals</p>
          {filter && (
            <div className="flex flex-wrap gap-1 pt-1">
              {filter.outcome && <Badge variant="secondary" className="text-[10px]">{filter.outcome === "won" ? "Won" : "Lost"}</Badge>}
              {filter.reason && <Badge variant="secondary" className="text-[10px]">Motivo: {filter.reason}</Badge>}
              {filter.stage && <Badge variant="secondary" className="text-[10px]">Estágio: {stageLabel(filter.stage)}</Badge>}
              {filter.competitor && <Badge variant="secondary" className="text-[10px]">vs. {filter.competitor}</Badge>}
              {filter.period && <Badge variant="secondary" className="text-[10px]">Período: {filter.period}</Badge>}
            </div>
          )}
        </SheetHeader>
        <ScrollArea className="flex-1 mt-3 pr-4">
          <div className="space-y-2 pb-6">
            {!filtered.length && (
              <p className="text-sm text-muted-foreground py-12 text-center">Sem deals para essa seleção.</p>
            )}
            {filtered.map(r => {
              const meta = salesMeta[r.sale_id];
              return (
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
                  <div className="flex items-center justify-between mt-2 pt-2 border-t border-border/40">
                    <span className="text-[11px] text-muted-foreground inline-flex items-center gap-1" title={`Cliente: ${meta?.client_name ?? "—"}`}>
                      <MessageCircle className="h-3 w-3" />
                      {sentimentEmoji(r.outcome)} {meta?.client_name ?? "—"}
                    </span>
                    {meta?.account_id && (
                      <Link
                        to={`/contas/${meta.account_id}`}
                        className="text-[11px] text-primary hover:underline inline-flex items-center gap-0.5"
                      >
                        Ver timeline <ExternalLink className="h-2.5 w-2.5" />
                      </Link>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </ScrollArea>
      </SheetContent>
    </Sheet>
  );
}
