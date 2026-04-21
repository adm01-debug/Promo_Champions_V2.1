import { Badge } from "@/components/ui/badge";
import { X, Filter } from "lucide-react";
import type { WinLossFilterState } from "./winLossFiltersHelpers";
import type { CompetitorStat } from "@/hooks/win-loss/useWinLossAggregations";

interface QuickFilter {
  id: string;
  label: string;
  active: boolean;
  apply: () => Partial<WinLossFilterState> & { __outcome?: "won" | "lost"; __competitor?: string };
}

interface Props {
  filters: WinLossFilterState;
  topCompetitor: CompetitorStat | undefined;
  outcomeFilter: "won" | "lost" | null;
  competitorFilter: string | null;
  onApply: (patch: { filters?: Partial<WinLossFilterState>; outcome?: "won" | "lost" | null; competitor?: string | null }) => void;
}

export function WinLossQuickFilterChips({ filters, topCompetitor, outcomeFilter, competitorFilter, onApply }: Props) {
  const chips: QuickFilter[] = [
    {
      id: "wins",
      label: "Só Wins",
      active: outcomeFilter === "won",
      apply: () => ({ __outcome: "won" as const }),
    },
    {
      id: "losses",
      label: "Só Losses",
      active: outcomeFilter === "lost",
      apply: () => ({ __outcome: "lost" as const }),
    },
    ...(topCompetitor ? [{
      id: "top-comp",
      label: `vs. ${topCompetitor.name}`,
      active: competitorFilter === topCompetitor.name,
      apply: () => ({ __competitor: topCompetitor.name }),
    }] : []),
    {
      id: "long-cycle",
      label: "Ciclo > 30d",
      active: false,
      apply: () => ({}),
    },
    {
      id: "high-ticket",
      label: "Ticket > 10k",
      active: filters.minAmount === 10000,
      apply: () => ({ minAmount: 10000 }),
    },
  ];

  const handleClick = (chip: QuickFilter) => {
    if (chip.active) {
      // Clear
      if (chip.id === "wins" || chip.id === "losses") onApply({ outcome: null });
      else if (chip.id === "top-comp") onApply({ competitor: null });
      else if (chip.id === "high-ticket") onApply({ filters: { minAmount: null } });
      return;
    }
    const result = chip.apply();
    const { __outcome, __competitor, ...filterPatch } = result;
    onApply({
      filters: Object.keys(filterPatch).length ? filterPatch : undefined,
      outcome: __outcome ?? null,
      competitor: __competitor ?? null,
    });
  };

  return (
    <div className="flex sm:flex-wrap items-center gap-2 no-print overflow-x-auto sm:overflow-visible snap-x snap-mandatory sm:snap-none -mx-1 px-1 pb-1" role="toolbar" aria-label="Filtros rápidos">
      <span className="inline-flex items-center gap-1 text-[11px] text-muted-foreground">
        <Filter className="h-3 w-3" /> Rápido:
      </span>
      {chips.map(chip => (
        <button
          key={chip.id}
          type="button"
          onClick={() => handleClick(chip)}
          className="group focus:outline-none focus-visible:ring-2 focus-visible:ring-ring rounded-full snap-start shrink-0"
        >
          <Badge
            variant={chip.active ? "default" : "outline"}
            className="text-[11px] cursor-pointer transition-all hover:scale-105"
          >
            {chip.label}
            {chip.active && <X className="h-2.5 w-2.5 ml-1" />}
          </Badge>
        </button>
      ))}
    </div>
  );
}
