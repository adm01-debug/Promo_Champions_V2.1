import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { useRecentActivities, ActivityType, ActivityOutcome } from "@/hooks/useActivities";
import { useSalespeople } from "@/hooks/useSalespeople";
import { format, startOfDay, endOfDay, startOfWeek, endOfWeek, startOfMonth, endOfMonth } from "date-fns";
import { ptBR } from "date-fns/locale";
import { Search, CalendarIcon, X, ClipboardList, Filter, Download, FileJson, FileText as PdfIcon } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import { usePagination } from "@/hooks/usePagination";
import { TablePagination } from "@/components/shared/TablePagination";
import { FilterPopover, SortOption } from "@/components/shared/FilterPopover";
import { useState, useMemo, useEffect } from "react";
import Fuse from "fuse.js";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Tooltip as TooltipProvider } from "@/components/ui/tooltip";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { cn } from "@/lib/utils";
import { activityLabels, outcomeLabels, activityTypeOptions, outcomeOptions } from "./activityConstants";
import { ActivityStatsCharts } from "./ActivityStatsCharts";
import { ActivityItemRow } from "./ActivityItemRow";
import { exportActivitiesToCSV, exportActivitiesToPDF } from "./exportUtils";

const sortOptions: SortOption[] = [
  { label: "Mais recente", value: "date_desc", direction: "desc" },
  { label: "Mais antigo", value: "date_asc", direction: "asc" },
];

interface ActivityListProps {
  limit?: number;
  showHeader?: boolean;
  showPagination?: boolean;
  showFilters?: boolean;
}

function _ActivityList({ limit = 100, showHeader = true, showPagination = true, showFilters = true }: ActivityListProps) {
  const { data: activities, isLoading } = useRecentActivities(limit);
  const { data: salespeople } = useSalespeople();

  const [sortBy, setSortBy] = useState("date_desc");
  const [typeFilter, setTypeFilter] = useState("");
  const [outcomeFilter, setOutcomeFilter] = useState("");
  const [salespersonFilter, setSalespersonFilter] = useState("");
  const [searchTerm, setSearchTerm] = useState("");
  const [startDate, setStartDate] = useState<Date | undefined>(undefined);
  const [endDate, setEndDate] = useState<Date | undefined>(undefined);
  const [showStats, setShowStats] = useState(() => {
    try { return JSON.parse(localStorage.getItem('activityListShowStats') ?? 'true'); } catch { return true; }
  });

  useEffect(() => { localStorage.setItem('activityListShowStats', JSON.stringify(showStats)); }, [showStats]);

  const salespersonOptions = useMemo(() => salespeople?.map(sp => ({ label: sp.name, value: sp.id })) || [], [salespeople]);

  const fuse = useMemo(() => {
    if (!activities || activities.length === 0) return null;
    return new Fuse(activities, { keys: ['contact_name', 'notes'], threshold: 0.4, ignoreLocation: true, minMatchCharLength: 1 });
  }, [activities]);

  const filteredAndSortedActivities = useMemo(() => {
    if (!activities) return [];
    let filtered = searchTerm.trim() && fuse ? fuse.search(searchTerm).map(r => r.item) : [...activities];
    if (typeFilter) filtered = filtered.filter(a => a.activity_type === typeFilter);
    if (outcomeFilter) filtered = filtered.filter(a => a.outcome === outcomeFilter);
    if (salespersonFilter) filtered = filtered.filter(a => a.salesperson_id === salespersonFilter);
    if (startDate) { const start = startOfDay(startDate); filtered = filtered.filter(a => new Date(a.created_at) >= start); }
    if (endDate) { const end = endOfDay(endDate); filtered = filtered.filter(a => new Date(a.created_at) <= end); }
    return filtered.sort((a, b) => sortBy === "date_asc" ? new Date(a.created_at).getTime() - new Date(b.created_at).getTime() : new Date(b.created_at).getTime() - new Date(a.created_at).getTime());
  }, [activities, fuse, sortBy, typeFilter, outcomeFilter, salespersonFilter, searchTerm, startDate, endDate]);

  const stats = useMemo(() => {
    const typeStats: Record<string, number> = {};
    const outcomeStats: Record<string, number> = {};
    filteredAndSortedActivities.forEach(a => { typeStats[a.activity_type] = (typeStats[a.activity_type] || 0) + 1; outcomeStats[a.outcome] = (outcomeStats[a.outcome] || 0) + 1; });
    return { typeStats, outcomeStats };
  }, [filteredAndSortedActivities]);

  const activeFiltersCount = [typeFilter, outcomeFilter, salespersonFilter, searchTerm, startDate, endDate].filter(Boolean).length;
  const clearAllFilters = () => { setTypeFilter(""); setOutcomeFilter(""); setSalespersonFilter(""); setSearchTerm(""); setStartDate(undefined); setEndDate(undefined); };

  const { paginatedItems, currentPage, totalPages, goToPage, startIndex, endIndex, totalItems, itemsPerPage, setItemsPerPage, itemsPerPageOptions } = usePagination(filteredAndSortedActivities, { initialItemsPerPage: 10 });

  const getSalesperson = (id: string | null) => salespeople?.find(sp => sp.id === id);

  if (isLoading) {
    return (
      <Card className="glass border-border/40 dark:border-glow card-elevated">
        {showHeader && (
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-display font-medium flex items-center gap-2">
              <div className="p-1.5 rounded-md bg-gradient-to-br from-primary/20 to-accent/10"><ClipboardList className="h-4 w-4 gradient-primary" /></div>
              Log de Atividades
            </CardTitle>
          </CardHeader>
        )}
        <CardContent><div className="space-y-3">{[...Array(5)].map((_, i) => <Skeleton key={i} className="h-16 w-full" />)}</div></CardContent>
      </Card>
    );
  }

  return (
    <Card className="glass border-border/40 dark:border-glow card-elevated transition-all duration-300">
      {showHeader && (
        <CardHeader className="pb-2">
          <div className="flex items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <CardTitle className="text-sm font-display font-medium flex items-center gap-2">
                <div className="p-1.5 rounded-md bg-gradient-to-br from-primary/20 to-accent/10"><ClipboardList className="h-4 w-4 gradient-primary" /></div>
                Log de Atividades
              </CardTitle>
              <Badge variant="secondary" className="text-xs">{filteredAndSortedActivities.length} {filteredAndSortedActivities.length === 1 ? 'atividade' : 'atividades'}</Badge>
              {activeFiltersCount > 0 && (
                <Badge variant="outline" className="text-xs gap-1 bg-primary/10 text-primary border-primary/30 cursor-pointer hover:bg-primary/20 transition-colors" onClick={clearAllFilters}>
                  <Filter className="h-3 w-3" />{activeFiltersCount} {activeFiltersCount === 1 ? 'filtro' : 'filtros'}<X className="h-3 w-3 ml-0.5" />
                </Badge>
              )}
            </div>
            <div className="flex items-center gap-2">
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="outline" size="sm" className="h-9 gap-2">
                    <Download className="h-4 w-4" />
                    Exportar
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuItem onClick={() => exportActivitiesToCSV(filteredAndSortedActivities)}>
                    <FileJson className="mr-2 h-4 w-4" />
                    CSV
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => exportActivitiesToPDF(filteredAndSortedActivities)}>
                    <PdfIcon className="mr-2 h-4 w-4" />
                    PDF
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>

              {showFilters && (
                <FilterPopover sortOptions={sortOptions} currentSort={sortBy} onSortChange={setSortBy}
                  filterOptions={[
                    { label: "Tipo", options: activityTypeOptions, value: typeFilter, onChange: setTypeFilter },
                    { label: "Resultado", options: outcomeOptions, value: outcomeFilter, onChange: setOutcomeFilter },
                    { label: "Vendedor", options: salespersonOptions, value: salespersonFilter, onChange: setSalespersonFilter },
                  ]}
                />
              )}
            </div>
          </div>
          {showFilters && (
            <div className="mt-3 flex flex-col sm:flex-row gap-3">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input placeholder="Buscar por contato ou notas..." className="pl-10 bg-muted/50 border-border/50 h-9 text-sm" value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} />
              </div>
              <div className="flex items-center gap-2 flex-wrap">
                <div className="flex items-center gap-1">
                  <Button variant="outline" size="sm" className="h-8 text-xs" onClick={() => { const t = new Date(); setStartDate(t); setEndDate(t); }}>Hoje</Button>
                  <Button variant="outline" size="sm" className="h-8 text-xs" onClick={() => { const t = new Date(); setStartDate(startOfWeek(t, { locale: ptBR })); setEndDate(endOfWeek(t, { locale: ptBR })); }}>Esta Semana</Button>
                  <Button variant="outline" size="sm" className="h-8 text-xs" onClick={() => { const t = new Date(); setStartDate(startOfMonth(t)); setEndDate(endOfMonth(t)); }}>Este Mês</Button>
                </div>
                <div className="flex items-center gap-1">
                  <Popover>
                    <PopoverTrigger asChild>
                      <Button variant="outline" size="sm" className={cn("h-8 text-xs justify-start text-left font-normal", !startDate && "text-muted-foreground")}>
                        <CalendarIcon className="mr-1 h-3 w-3" />{startDate ? format(startDate, "dd/MM/yyyy", { locale: ptBR }) : "De"}
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0" align="start"><Calendar mode="single" selected={startDate} onSelect={setStartDate} initialFocus className="p-3 pointer-events-auto" locale={ptBR} /></PopoverContent>
                  </Popover>
                  <Popover>
                    <PopoverTrigger asChild>
                      <Button variant="outline" size="sm" className={cn("h-8 text-xs justify-start text-left font-normal", !endDate && "text-muted-foreground")}>
                        <CalendarIcon className="mr-1 h-3 w-3" />{endDate ? format(endDate, "dd/MM/yyyy", { locale: ptBR }) : "Até"}
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0" align="start"><Calendar mode="single" selected={endDate} onSelect={setEndDate} initialFocus className="p-3 pointer-events-auto" locale={ptBR} /></PopoverContent>
                  </Popover>
                  {(startDate || endDate) && <Button variant="ghost" size="icon" aria-label="Limpar filtro" className="h-8 w-8" onClick={() => { setStartDate(undefined); setEndDate(undefined); }}><X className="h-4 w-4" /></Button>}
                </div>
              </div>
            </div>
          )}
          {/* Active Filter Chips */}
          {showFilters && activeFiltersCount > 0 && (
            <TooltipProvider delayDuration={300}>
              <div className="mt-3 flex flex-wrap gap-2 transition-all duration-300">
                {typeFilter && <FilterChip label={`Tipo: ${activityLabels[typeFilter as ActivityType]}`} onRemove={() => setTypeFilter("")} />}
                {outcomeFilter && <FilterChip label={`Resultado: ${outcomeLabels[outcomeFilter as ActivityOutcome].label}`} onRemove={() => setOutcomeFilter("")} />}
                {salespersonFilter && <FilterChip label={`Vendedor: ${salespeople?.find(sp => sp.id === salespersonFilter)?.name || 'N/A'}`} onRemove={() => setSalespersonFilter("")} />}
                {searchTerm && <FilterChip label={`Busca: "${searchTerm.length > 15 ? searchTerm.slice(0, 15) + '...' : searchTerm}"`} onRemove={() => setSearchTerm("")} />}
                {startDate && <FilterChip label={`De: ${format(startDate, "dd/MM/yyyy", { locale: ptBR })}`} onRemove={() => setStartDate(undefined)} />}
                {endDate && <FilterChip label={`Até: ${format(endDate, "dd/MM/yyyy", { locale: ptBR })}`} onRemove={() => setEndDate(undefined)} />}
              </div>
            </TooltipProvider>
          )}
        </CardHeader>
      )}
      <CardContent>
        {filteredAndSortedActivities.length > 0 && (
          <ActivityStatsCharts typeStats={stats.typeStats} outcomeStats={stats.outcomeStats} showStats={showStats} onToggle={() => setShowStats(!showStats)} />
        )}
        <div className="space-y-2">
          {filteredAndSortedActivities.length === 0 && (
            <div className="text-center py-8 bg-muted/20 rounded-lg border border-dashed border-border/50">
              <ClipboardList className="h-8 w-8 mx-auto text-muted-foreground/50 mb-2" />
              <p className="text-xs text-muted-foreground">{activeFiltersCount > 0 ? "Nenhuma atividade encontrada com os filtros aplicados" : "Nenhuma atividade registrada"}</p>
            </div>
          )}
          {paginatedItems.map((activity) => (
            <ActivityItemRow key={activity.id} activity={activity} salesperson={getSalesperson(activity.salesperson_id)} />
          ))}
        </div>
        {showPagination && filteredAndSortedActivities.length > 0 && (
          <TablePagination currentPage={currentPage} totalPages={totalPages} onPageChange={goToPage} startIndex={startIndex} endIndex={endIndex} totalItems={totalItems} itemsPerPage={itemsPerPage} onItemsPerPageChange={setItemsPerPage} itemsPerPageOptions={itemsPerPageOptions} />
        )}
      </CardContent>
    </Card>
  );
}

function FilterChip({ label, onRemove }: { label: string; onRemove: () => void }) {
  return (
    <Badge variant="secondary" className="text-xs gap-1 pl-2 pr-1 py-1 cursor-pointer hover:bg-secondary/80 transition-all duration-200 animate-scale-in hover:scale-105 active:scale-95" onClick={onRemove}>
      {label}<X className="h-3 w-3 ml-1 hover:text-destructive transition-colors" />
    </Badge>
  );
}

export const ActivityList = React.memo(_ActivityList);
