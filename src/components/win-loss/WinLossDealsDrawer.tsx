import { useMemo, useState, useCallback } from "react";
import { useQuery } from "@tanstack/react-query";
import { Sheet, SheetContent, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import { Badge } from "@/components/ui/badge";
import { fmtBRL, stageLabel } from "@/components/deal-intelligence/winloss/winLossHelpers";
import { supabase } from "@/integrations/supabase/client";
import type { WLAnalysisRow } from "@/hooks/win-loss/useWinLossData";
import { VirtualDealsList } from "./VirtualDealsList";

export interface DrawerFilter {
  outcome?: "won" | "lost";
  reason?: string;
  stage?: string;
  competitor?: string;
  salespersonId?: string;
  period?: string;
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

const VIRTUAL_HEIGHT = 560;

export function WinLossDealsDrawer({ open, onOpenChange, title, rows, filter }: Props) {
  const [expandedIds, setExpandedIds] = useState<Set<string>>(new Set());

  const toggleExpand = useCallback((id: string) => {
    setExpandedIds(prev => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id); else next.add(id);
      return next;
    });
  }, []);

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

  // Fetch sale meta only for the visible window (cap at 100 to keep network tight)
  const saleIds = useMemo(() => filtered.slice(0, 100).map(r => r.sale_id), [filtered]);

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
        map[s.id] = { id: s.id, account_id: s.account_id, client_name: s.client_name };
      });
      return map;
    },
    staleTime: 30_000,
  });

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent className="w-screen sm:max-w-xl max-h-[90vh] sm:max-h-screen overflow-hidden flex flex-col data-[state=open]:duration-300">
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
        <div className="flex-1 mt-3 overflow-hidden">
          {!filtered.length ? (
            <p className="text-sm text-muted-foreground py-12 text-center">Sem deals para essa seleção.</p>
          ) : (
            <VirtualDealsList
              rows={filtered}
              salesMeta={salesMeta}
              height={VIRTUAL_HEIGHT}
              expandedIds={expandedIds}
              onToggle={toggleExpand}
            />
          )}
        </div>
      </SheetContent>
    </Sheet>
  );
}
