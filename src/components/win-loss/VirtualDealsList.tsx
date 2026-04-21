import { memo, useCallback, useRef } from "react";
import { VariableSizeList, type ListChildComponentProps } from "react-window";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ExternalLink, MessageCircle, ChevronDown, ChevronRight } from "lucide-react";
import { AnimatePresence, motion } from "framer-motion";
import { Link } from "react-router-dom";
import { fmtBRL, stageLabel } from "@/components/deal-intelligence/winloss/winLossHelpers";
import type { WLAnalysisRow } from "@/hooks/win-loss/useWinLossData";
import { DealTimelineExpand } from "./DealTimelineExpand";
import { useReducedMotion } from "@/hooks/useReducedMotion";

interface SaleMeta {
  id: string;
  account_id: string | null;
  client_name: string | null;
}

interface Props {
  rows: WLAnalysisRow[];
  salesMeta: Record<string, SaleMeta>;
  height: number;
  expandedIds: Set<string>;
  onToggle: (id: string) => void;
}

const ROW_BASE = 132;
const ROW_EXPANDED = 360;

const sentimentEmoji = (outcome: "won" | "lost"): string => (outcome === "won" ? "😊" : "😟");

function RowRenderer({ index, style, data }: ListChildComponentProps<{
  rows: WLAnalysisRow[];
  salesMeta: Record<string, SaleMeta>;
  expandedIds: Set<string>;
  onToggle: (id: string) => void;
  reduced: boolean;
}>) {
  const { rows, salesMeta, expandedIds, onToggle, reduced } = data;
  const r = rows[index];
  const meta = salesMeta[r.sale_id];
  const isExpanded = expandedIds.has(r.sale_id);

  return (
    <div style={{ ...style, paddingBottom: 8 }}>
      <div className="rounded-lg border border-border/50 p-3 bg-card h-full overflow-hidden">
        <div className="flex items-center justify-between gap-2 mb-1">
          <Badge
            variant="outline"
            className={r.outcome === "won" ? "border-emerald-500/40 text-emerald-700" : "border-rose-500/40 text-rose-700"}
          >
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
          <span
            className="text-[11px] text-muted-foreground inline-flex items-center gap-1"
            title={`Cliente: ${meta?.client_name ?? "—"}`}
          >
            <MessageCircle className="h-3 w-3" />
            {sentimentEmoji(r.outcome)} {meta?.client_name ?? "—"}
          </span>
          <div className="flex items-center gap-2">
            <Button
              size="sm"
              variant="ghost"
              onClick={() => onToggle(r.sale_id)}
              className="h-6 px-1.5 text-[11px]"
              aria-expanded={isExpanded}
              aria-label={isExpanded ? "Recolher histórico" : "Expandir histórico"}
            >
              {isExpanded ? <ChevronDown className="h-3 w-3" /> : <ChevronRight className="h-3 w-3" />}
              Histórico
            </Button>
            {meta?.account_id && (
              <Link
                to={`/contas/${meta.account_id}`}
                className="text-[11px] text-primary hover:underline inline-flex items-center gap-0.5"
              >
                Conta <ExternalLink className="h-2.5 w-2.5" />
              </Link>
            )}
          </div>
        </div>
        <AnimatePresence initial={false}>
          {isExpanded && (
            <motion.div
              initial={reduced ? { opacity: 0 } : { opacity: 0, height: 0 }}
              animate={reduced ? { opacity: 1 } : { opacity: 1, height: "auto" }}
              exit={reduced ? { opacity: 0 } : { opacity: 0, height: 0 }}
              transition={{ duration: reduced ? 0.1 : 0.2 }}
              className="overflow-hidden"
            >
              <DealTimelineExpand saleId={r.sale_id} />
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}

export const VirtualDealsList = memo(function VirtualDealsList({
  rows,
  salesMeta,
  height,
  expandedIds,
  onToggle,
}: Props) {
  const listRef = useRef<VariableSizeList>(null);
  const getItemSize = useCallback(
    (idx: number) => (expandedIds.has(rows[idx].sale_id) ? ROW_EXPANDED : ROW_BASE),
    [expandedIds, rows],
  );
  const reduced = useReducedMotion();

  // Reset cached sizes when expansion set changes
  if (listRef.current) listRef.current.resetAfterIndex(0, false);

  return (
    <VariableSizeList
      ref={listRef}
      height={height}
      itemCount={rows.length}
      itemSize={getItemSize}
      width="100%"
      itemData={{ rows, salesMeta, expandedIds, onToggle, reduced }}
      overscanCount={4}
    >
      {RowRenderer}
    </VariableSizeList>
  );
});
