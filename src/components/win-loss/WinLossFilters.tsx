import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Filter, X, RotateCcw } from "lucide-react";
import {
  PERIOD_OPTIONS,
  type WLPeriod,
  type WinLossFilterState,
} from "./winLossFiltersHelpers";
import { useActiveSalespeople, useWinLossSegments } from "@/hooks/win-loss/useWinLossData";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";

interface Props {
  filters: WinLossFilterState;
  onChange: (patch: Partial<WinLossFilterState>) => void;
  onReset: () => void;
  onResetViewPrefs?: () => void;
  viewPrefsAreDefault?: boolean;
}

export function WinLossFilters({ filters, onChange, onReset, onResetViewPrefs, viewPrefsAreDefault }: Props) {
  const { data: salespeople = [] } = useActiveSalespeople();
  const { data: segments = [] } = useWinLossSegments();
  const activeCount =
    filters.salespersonIds.length +
    filters.segments.length +
    (filters.minAmount != null ? 1 : 0) +
    (filters.maxAmount != null ? 1 : 0);

  const toggle = (list: string[], v: string): string[] =>
    list.includes(v) ? list.filter(x => x !== v) : [...list, v];

  return (
    <Card className="border-border/50">
      <CardContent className="p-3 flex flex-wrap items-center gap-2">
        <div className="flex items-center gap-1.5 mr-2">
          <Filter className="h-4 w-4 text-muted-foreground" />
          <span className="text-sm font-medium">Filtros</span>
          {activeCount > 0 && (
            <Badge variant="secondary" className="h-5 px-1.5 text-[10px]">{activeCount}</Badge>
          )}
        </div>

        {/* Period buttons */}
        <div className="flex gap-1 rounded-md border border-border/50 p-0.5">
          {PERIOD_OPTIONS.map(o => (
            <Button
              key={o.value}
              size="sm"
              variant={filters.period === o.value ? "default" : "ghost"}
              className="h-7 px-2 text-xs"
              onClick={() => onChange({ period: o.value as WLPeriod })}
            >
              {o.label}
            </Button>
          ))}
        </div>

        {/* Salespeople */}
        <Popover>
          <PopoverTrigger asChild>
            <Button size="sm" variant="outline" className="h-8">
              Vendedores
              {filters.salespersonIds.length > 0 && (
                <Badge variant="secondary" className="ml-1.5 h-4 px-1 text-[10px]">{filters.salespersonIds.length}</Badge>
              )}
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-64 p-2 space-y-1 max-h-72 overflow-y-auto">
            {salespeople.map(s => (
              <label key={s.id} className="flex items-center gap-2 text-sm py-1 cursor-pointer hover:bg-muted/50 rounded px-2">
                <Checkbox
                  checked={filters.salespersonIds.includes(s.id)}
                  onCheckedChange={() => onChange({ salespersonIds: toggle(filters.salespersonIds, s.id) })}
                />
                {s.name}
              </label>
            ))}
            {!salespeople.length && <p className="text-xs text-muted-foreground p-2">Sem vendedores</p>}
          </PopoverContent>
        </Popover>

        {/* Segments */}
        <Popover>
          <PopoverTrigger asChild>
            <Button size="sm" variant="outline" className="h-8">
              Segmento
              {filters.segments.length > 0 && (
                <Badge variant="secondary" className="ml-1.5 h-4 px-1 text-[10px]">{filters.segments.length}</Badge>
              )}
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-56 p-2 space-y-1">
            {segments.map(s => (
              <label key={s} className="flex items-center gap-2 text-sm py-1 cursor-pointer hover:bg-muted/50 rounded px-2">
                <Checkbox
                  checked={filters.segments.includes(s)}
                  onCheckedChange={() => onChange({ segments: toggle(filters.segments, s) })}
                />
                {s}
              </label>
            ))}
            {!segments.length && <p className="text-xs text-muted-foreground p-2">Sem segmentos</p>}
          </PopoverContent>
        </Popover>

        {/* Amount */}
        <div className="flex items-center gap-1.5">
          <Input
            type="number"
            placeholder="Min R$"
            className="h-8 w-24 text-xs"
            value={filters.minAmount ?? ""}
            onChange={e => onChange({ minAmount: e.target.value ? Number(e.target.value) : null })}
          />
          <span className="text-muted-foreground text-xs">—</span>
          <Input
            type="number"
            placeholder="Max R$"
            className="h-8 w-24 text-xs"
            value={filters.maxAmount ?? ""}
            onChange={e => onChange({ maxAmount: e.target.value ? Number(e.target.value) : null })}
          />
        </div>

        {activeCount > 0 && (
          <Button size="sm" variant="ghost" className="h-8 ml-auto" onClick={onReset}>
            <X className="h-3.5 w-3.5 mr-1" /> Limpar
          </Button>
        )}
      </CardContent>
    </Card>
  );
}
