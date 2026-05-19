import { FC, useState } from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Calendar } from "@/components/ui/calendar";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Separator } from "@/components/ui/separator";
import { cn } from "@/lib/utils";
import { 
  Calendar as CalendarIcon, 
  Filter, 
  X, 
  ChevronDown,
  RefreshCw 
} from "lucide-react";
import { DateRange } from "react-day-picker";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import { PeriodType, PERIOD_OPTIONS, DateRange as BIDateRange } from "@/hooks/bi/useBIFilters";
import { motion, AnimatePresence } from "framer-motion";

interface BIFilterBarProps {
  period: PeriodType;
  onPeriodChange: (period: PeriodType) => void;
  customRange: BIDateRange | null;
  onCustomRangeChange: (range: BIDateRange | null) => void;
  
  // Optional filters
  showSalespersonFilter?: boolean;
  salespersonId?: string;
  onSalespersonChange?: (id: string | undefined) => void;
  salespeople?: { id: string; name: string }[];
  
  showCategoryFilter?: boolean;
  category?: string;
  onCategoryChange?: (cat: string | undefined) => void;
  categories?: string[];
  
  showSourceFilter?: boolean;
  source?: string;
  onSourceChange?: (src: string | undefined) => void;
  sources?: string[];
  
  onReset?: () => void;
  hasActiveFilters?: boolean;
  isLoading?: boolean;
  onRefresh?: () => void;
}

export const BIFilterBar: FC<BIFilterBarProps> = ({
  period,
  onPeriodChange,
  customRange,
  onCustomRangeChange,
  showSalespersonFilter,
  salespersonId,
  onSalespersonChange,
  salespeople,
  showCategoryFilter,
  category,
  onCategoryChange,
  categories,
  showSourceFilter,
  source,
  onSourceChange,
  sources,
  onReset,
  hasActiveFilters,
  isLoading,
  onRefresh
}) => {
  const [datePickerOpen, setDatePickerOpen] = useState(false);
  const [selectedDateRange, setSelectedDateRange] = useState<DateRange | undefined>(
    customRange ? { from: customRange.start, to: customRange.end } : undefined
  );

  const handleDateSelect = (range: DateRange | undefined) => {
    setSelectedDateRange(range);
    if (range?.from && range?.to) {
      onPeriodChange("custom");
      onCustomRangeChange({ start: range.from, end: range.to });
      setDatePickerOpen(false);
    }
  };

  const activeFiltersCount = [
    period !== "this_month",
    salespersonId,
    category,
    source
  ].filter(Boolean).length;

  return (
    <div className="glass-card rounded-xl p-4 border border-border/50">
      <div className="flex flex-wrap items-center gap-3">
        {/* Period Quick Filters */}
        <div className="flex items-center gap-1 flex-wrap">
          {PERIOD_OPTIONS.filter(p => p.value !== "custom").map((opt) => (
            <Button
              key={opt.value}
              variant={period === opt.value ? "default" : "ghost"}
              size="sm"
              onClick={() => onPeriodChange(opt.value)}
              className={cn(
                "text-xs h-8 px-3 transition-all",
                period === opt.value 
                  ? "bg-primary text-primary-foreground shadow-md" 
                  : "hover:bg-muted"
              )}
            >
              {opt.shortLabel}
            </Button>
          ))}
        </div>

        <Separator orientation="vertical" className="h-6 hidden sm:block" />

        {/* Custom Date Range */}
        <Popover open={datePickerOpen} onOpenChange={setDatePickerOpen}>
          <PopoverTrigger asChild>
            <Button
              variant={period === "custom" ? "default" : "outline"}
              size="sm"
              className={cn(
                "h-8 gap-2",
                period === "custom" && "bg-primary text-primary-foreground"
              )}
            >
              <CalendarIcon className="h-3.5 w-3.5" />
              {period === "custom" && customRange
                ? `${format(customRange.start, "dd/MM")} - ${format(customRange.end, "dd/MM")}`
                : "Personalizado"
              }
              <ChevronDown className="h-3 w-3" />
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-auto p-0" align="start">
            <Calendar
              mode="range"
              selected={selectedDateRange}
              onSelect={handleDateSelect}
              numberOfMonths={2}
              locale={ptBR}
              className="rounded-md border"
            />
          </PopoverContent>
        </Popover>

        <Separator orientation="vertical" className="h-6 hidden sm:block" />

        {/* Additional Filters */}
        <Popover>
          <PopoverTrigger asChild>
            <Button variant="outline" size="sm" className="h-8 gap-2">
              <Filter className="h-3.5 w-3.5" />
              Filtros
              {activeFiltersCount > 0 && (
                <Badge variant="secondary" className="h-5 px-1.5 text-xs">
                  {activeFiltersCount}
                </Badge>
              )}
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-72" align="start">
            <div className="space-y-4">
              <h4 className="font-medium text-sm">Filtros Avançados</h4>
              
              {showSalespersonFilter && salespeople && onSalespersonChange && (
                <div className="space-y-2">
                  <label className="text-xs text-muted-foreground">Vendedor</label>
                  <Select 
                    value={salespersonId || "all"} 
                    onValueChange={(v) => onSalespersonChange(v === "all" ? undefined : v)}
                  >
                    <SelectTrigger className="h-9">
                      <SelectValue placeholder="Todos os vendedores" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">Todos os vendedores</SelectItem>
                      {salespeople.map(sp => (
                        <SelectItem key={sp.id} value={sp.id}>{sp.name}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              )}

              {showCategoryFilter && categories && onCategoryChange && (
                <div className="space-y-2">
                  <label className="text-xs text-muted-foreground">Categoria</label>
                  <Select 
                    value={category || "all"} 
                    onValueChange={(v) => onCategoryChange(v === "all" ? undefined : v)}
                  >
                    <SelectTrigger className="h-9">
                      <SelectValue placeholder="Todas as categorias" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">Todas as categorias</SelectItem>
                      {categories.map(cat => (
                        <SelectItem key={cat} value={cat}>{cat}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              )}

              {showSourceFilter && sources && onSourceChange && (
                <div className="space-y-2">
                  <label className="text-xs text-muted-foreground">Fonte</label>
                  <Select 
                    value={source || "all"} 
                    onValueChange={(v) => onSourceChange(v === "all" ? undefined : v)}
                  >
                    <SelectTrigger className="h-9">
                      <SelectValue placeholder="Todas as fontes" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">Todas as fontes</SelectItem>
                      {sources.map(src => (
                        <SelectItem key={src} value={src}>{src}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              )}
            </div>
          </PopoverContent>
        </Popover>

        {/* Active Filters Badges */}
        <AnimatePresence>
          {hasActiveFilters && (
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
              className="flex items-center gap-2"
            >
              <Button
                variant="ghost"
                size="sm"
                onClick={onReset}
                className="h-8 text-xs text-muted-foreground hover:text-destructive"
              >
                <X className="h-3.5 w-3.5 mr-1" />
                Limpar
              </Button>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Refresh Button */}
        <div className="ml-auto">
          <Button
            variant="ghost"
            size="sm"
            onClick={onRefresh}
            disabled={isLoading}
            className="h-8"
          >
            <RefreshCw className={cn("h-3.5 w-3.5", isLoading && "animate-spin")} />
          </Button>
        </div>
      </div>
    </div>
  );
};
