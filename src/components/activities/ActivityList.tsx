import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { useRecentActivities, ActivityType, ActivityOutcome } from "@/hooks/useActivities";
import { useSalespeople } from "@/hooks/useSalespeople";
import { format, formatDistanceToNow, startOfDay, endOfDay, startOfWeek, endOfWeek, startOfMonth, endOfMonth } from "date-fns";
import { ptBR } from "date-fns/locale";
import { Phone, Mail, Users, Linkedin, MessageCircle, MoreHorizontal, Clock, ClipboardList, Search, CalendarIcon, X, BarChart3, ChevronDown, ChevronUp, Filter } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Skeleton } from "@/components/ui/skeleton";
import { usePagination } from "@/hooks/usePagination";
import { TablePagination } from "@/components/shared/TablePagination";
import { FilterPopover, SortOption } from "@/components/shared/FilterPopover";
import { useState, useMemo, useEffect } from "react";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Tooltip as UITooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { cn } from "@/lib/utils";
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell, PieChart, Pie } from "recharts";
import { ChartContainer, ChartTooltipContent } from "@/components/ui/chart";

const activityIcons: Record<ActivityType, typeof Phone> = {
  call: Phone,
  email: Mail,
  meeting: Users,
  linkedin: Linkedin,
  whatsapp: MessageCircle,
  other: MoreHorizontal,
};

const activityLabels: Record<ActivityType, string> = {
  call: "Ligação",
  email: "E-mail",
  meeting: "Reunião",
  linkedin: "LinkedIn",
  whatsapp: "WhatsApp",
  other: "Outro",
};

const outcomeLabels: Record<ActivityOutcome, { label: string; color: string }> = {
  connected: { label: "Conectou", color: "bg-status-success/10 text-status-success border-status-success/20" },
  no_answer: { label: "Não Atendeu", color: "bg-status-error/10 text-status-error border-status-error/20" },
  scheduled: { label: "Agendou", color: "bg-status-info/10 text-status-info border-status-info/20" },
  voicemail: { label: "Caixa Postal", color: "bg-status-warning/10 text-status-warning border-status-warning/20" },
  busy: { label: "Ocupado", color: "bg-rank-gold/10 text-rank-gold border-rank-gold/20" },
  callback: { label: "Retornar", color: "bg-status-purple/10 text-status-purple border-status-purple/20" },
  not_interested: { label: "Sem Interesse", color: "bg-muted text-muted-foreground border-border" },
  qualified: { label: "Qualificado", color: "bg-primary/10 text-primary border-primary/20" },
};

const sortOptions: SortOption[] = [
  { label: "Mais recente", value: "date_desc", direction: "desc" },
  { label: "Mais antigo", value: "date_asc", direction: "asc" },
];

const activityTypeOptions = [
  { label: "Ligação", value: "call" },
  { label: "E-mail", value: "email" },
  { label: "Reunião", value: "meeting" },
  { label: "LinkedIn", value: "linkedin" },
  { label: "WhatsApp", value: "whatsapp" },
  { label: "Outro", value: "other" },
];

const outcomeOptions = [
  { label: "Conectou", value: "connected" },
  { label: "Não Atendeu", value: "no_answer" },
  { label: "Agendou", value: "scheduled" },
  { label: "Caixa Postal", value: "voicemail" },
  { label: "Ocupado", value: "busy" },
  { label: "Retornar", value: "callback" },
  { label: "Sem Interesse", value: "not_interested" },
  { label: "Qualificado", value: "qualified" },
];

interface ActivityListProps {
  limit?: number;
  showHeader?: boolean;
  showPagination?: boolean;
  showFilters?: boolean;
}

export function ActivityList({ 
  limit = 100, 
  showHeader = true, 
  showPagination = true,
  showFilters = true,
}: ActivityListProps) {
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
    const saved = localStorage.getItem('activityListShowStats');
    return saved !== null ? JSON.parse(saved) : true;
  });

  useEffect(() => {
    localStorage.setItem('activityListShowStats', JSON.stringify(showStats));
  }, [showStats]);

  const salespersonOptions = useMemo(() => {
    if (!salespeople) return [];
    return salespeople.map(sp => ({ label: sp.name, value: sp.id }));
  }, [salespeople]);

  const clearDateFilter = () => {
    setStartDate(undefined);
    setEndDate(undefined);
  };
  const filteredAndSortedActivities = useMemo(() => {
    if (!activities) return [];
    
    let filtered = [...activities];

    // Apply search filter
    if (searchTerm) {
      const search = searchTerm.toLowerCase();
      filtered = filtered.filter(a => 
        (a.contact_name?.toLowerCase().includes(search)) ||
        (a.notes?.toLowerCase().includes(search))
      );
    }
    
    // Apply type filter
    if (typeFilter) {
      filtered = filtered.filter(a => a.activity_type === typeFilter);
    }
    
    // Apply outcome filter
    if (outcomeFilter) {
      filtered = filtered.filter(a => a.outcome === outcomeFilter);
    }

    // Apply salesperson filter
    if (salespersonFilter) {
      filtered = filtered.filter(a => a.salesperson_id === salespersonFilter);
    }

    // Apply date range filter
    if (startDate) {
      const start = startOfDay(startDate);
      filtered = filtered.filter(a => new Date(a.created_at) >= start);
    }
    if (endDate) {
      const end = endOfDay(endDate);
      filtered = filtered.filter(a => new Date(a.created_at) <= end);
    }
    
    // Apply sorting
    return filtered.sort((a, b) => {
      switch (sortBy) {
        case "date_desc":
          return new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
        case "date_asc":
          return new Date(a.created_at).getTime() - new Date(b.created_at).getTime();
        default:
          return 0;
      }
    });
  }, [activities, sortBy, typeFilter, outcomeFilter, salespersonFilter, searchTerm, startDate, endDate]);

  // Statistics for filtered activities
  const stats = useMemo(() => {
    const typeStats: Record<string, number> = {};
    const outcomeStats: Record<string, number> = {};
    
    filteredAndSortedActivities.forEach(activity => {
      typeStats[activity.activity_type] = (typeStats[activity.activity_type] || 0) + 1;
      outcomeStats[activity.outcome] = (outcomeStats[activity.outcome] || 0) + 1;
    });
    
    return { typeStats, outcomeStats };
  }, [filteredAndSortedActivities]);

  const activeFiltersCount = useMemo(() => {
    let count = 0;
    if (typeFilter) count++;
    if (outcomeFilter) count++;
    if (salespersonFilter) count++;
    if (searchTerm) count++;
    if (startDate) count++;
    if (endDate) count++;
    return count;
  }, [typeFilter, outcomeFilter, salespersonFilter, searchTerm, startDate, endDate]);

  const clearAllFilters = () => {
    setTypeFilter("");
    setOutcomeFilter("");
    setSalespersonFilter("");
    setSearchTerm("");
    setStartDate(undefined);
    setEndDate(undefined);
  };

  const {
    paginatedItems,
    currentPage,
    totalPages,
    goToPage,
    startIndex,
    endIndex,
    totalItems,
    itemsPerPage,
    setItemsPerPage,
    itemsPerPageOptions,
  } = usePagination(filteredAndSortedActivities, { initialItemsPerPage: 10 });

  const getSalesperson = (id: string | null) => 
    salespeople?.find(sp => sp.id === id);

  if (isLoading) {
    return (
      <Card className="glass border-border/40 dark:border-glow card-elevated">
        {showHeader && (
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-display font-medium flex items-center gap-2">
              <div className="p-1.5 rounded-md bg-gradient-to-br from-primary/20 to-accent/10">
                <ClipboardList className="h-4 w-4 gradient-primary" />
              </div>
              Log de Atividades
            </CardTitle>
          </CardHeader>
        )}
        <CardContent>
          <div className="space-y-3">
            {[...Array(5)].map((_, i) => (
              <Skeleton key={i} className="h-16 w-full" />
            ))}
          </div>
        </CardContent>
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
                <div className="p-1.5 rounded-md bg-gradient-to-br from-primary/20 to-accent/10">
                  <ClipboardList className="h-4 w-4 gradient-primary" />
                </div>
                Log de Atividades
              </CardTitle>
              <Badge variant="secondary" className="text-xs">
                {filteredAndSortedActivities.length} {filteredAndSortedActivities.length === 1 ? 'atividade' : 'atividades'}
              </Badge>
              {activeFiltersCount > 0 && (
                <Badge 
                  variant="outline" 
                  className="text-xs gap-1 bg-primary/10 text-primary border-primary/30 cursor-pointer hover:bg-primary/20 transition-colors"
                  onClick={clearAllFilters}
                >
                  <Filter className="h-3 w-3" />
                  {activeFiltersCount} {activeFiltersCount === 1 ? 'filtro' : 'filtros'}
                  <X className="h-3 w-3 ml-0.5" />
                </Badge>
              )}
            </div>
            {showFilters && (
              <FilterPopover
                sortOptions={sortOptions}
                currentSort={sortBy}
                onSortChange={setSortBy}
                filterOptions={[
                  {
                    label: "Tipo",
                    options: activityTypeOptions,
                    value: typeFilter,
                    onChange: setTypeFilter,
                  },
                  {
                    label: "Resultado",
                    options: outcomeOptions,
                    value: outcomeFilter,
                    onChange: setOutcomeFilter,
                  },
                  {
                    label: "Vendedor",
                    options: salespersonOptions,
                    value: salespersonFilter,
                    onChange: setSalespersonFilter,
                  },
                ]}
              />
            )}
          </div>
          {showFilters && (
            <div className="mt-3 flex flex-col sm:flex-row gap-3">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input 
                  placeholder="Buscar por contato ou notas..." 
                  className="pl-10 bg-muted/50 border-border/50 h-9 text-sm"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>
              <div className="flex items-center gap-2 flex-wrap">
                <div className="flex items-center gap-1">
                  <Button
                    variant="outline"
                    size="sm"
                    className="h-8 text-xs"
                    onClick={() => {
                      const today = new Date();
                      setStartDate(today);
                      setEndDate(today);
                    }}
                  >
                    Hoje
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    className="h-8 text-xs"
                    onClick={() => {
                      const today = new Date();
                      setStartDate(startOfWeek(today, { locale: ptBR }));
                      setEndDate(endOfWeek(today, { locale: ptBR }));
                    }}
                  >
                    Esta Semana
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    className="h-8 text-xs"
                    onClick={() => {
                      const today = new Date();
                      setStartDate(startOfMonth(today));
                      setEndDate(endOfMonth(today));
                    }}
                  >
                    Este Mês
                  </Button>
                </div>
                <div className="flex items-center gap-1">
                  <Popover>
                    <PopoverTrigger asChild>
                      <Button
                        variant="outline"
                        size="sm"
                        className={cn(
                          "h-8 text-xs justify-start text-left font-normal",
                          !startDate && "text-muted-foreground"
                        )}
                      >
                        <CalendarIcon className="mr-1 h-3 w-3" />
                        {startDate ? format(startDate, "dd/MM/yyyy", { locale: ptBR }) : "De"}
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0" align="start">
                      <Calendar
                        mode="single"
                        selected={startDate}
                        onSelect={setStartDate}
                        initialFocus
                        className={cn("p-3 pointer-events-auto")}
                        locale={ptBR}
                      />
                    </PopoverContent>
                  </Popover>
                  <Popover>
                    <PopoverTrigger asChild>
                      <Button
                        variant="outline"
                        size="sm"
                        className={cn(
                          "h-8 text-xs justify-start text-left font-normal",
                          !endDate && "text-muted-foreground"
                        )}
                      >
                        <CalendarIcon className="mr-1 h-3 w-3" />
                        {endDate ? format(endDate, "dd/MM/yyyy", { locale: ptBR }) : "Até"}
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0" align="start">
                      <Calendar
                        mode="single"
                        selected={endDate}
                        onSelect={setEndDate}
                        initialFocus
                        className={cn("p-3 pointer-events-auto")}
                        locale={ptBR}
                      />
                    </PopoverContent>
                  </Popover>
                  {(startDate || endDate) && (
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-8 w-8"
                      onClick={clearDateFilter}
                    >
                      <X className="h-4 w-4" />
                    </Button>
                  )}
                </div>
              </div>
            </div>
          )}
          {/* Active Filters Chips */}
          {showFilters && activeFiltersCount > 0 && (
            <TooltipProvider delayDuration={300}>
              <div className="mt-3 flex flex-wrap gap-2 transition-all duration-300">
                {typeFilter && (
                  <UITooltip>
                    <TooltipTrigger asChild>
                      <Badge 
                        variant="secondary" 
                        className="text-xs gap-1 pl-2 pr-1 py-1 cursor-pointer hover:bg-secondary/80 transition-all duration-200 animate-scale-in hover:scale-105 active:scale-95"
                        onClick={() => setTypeFilter("")}
                      >
                        Tipo: {activityLabels[typeFilter as ActivityType]}
                        <X className="h-3 w-3 ml-1 hover:text-destructive transition-colors" />
                      </Badge>
                    </TooltipTrigger>
                    <TooltipContent side="bottom" className="text-xs">
                      Clique para remover
                    </TooltipContent>
                  </UITooltip>
                )}
                {outcomeFilter && (
                  <UITooltip>
                    <TooltipTrigger asChild>
                      <Badge 
                        variant="secondary" 
                        className="text-xs gap-1 pl-2 pr-1 py-1 cursor-pointer hover:bg-secondary/80 transition-all duration-200 animate-scale-in hover:scale-105 active:scale-95"
                        onClick={() => setOutcomeFilter("")}
                      >
                        Resultado: {outcomeLabels[outcomeFilter as ActivityOutcome].label}
                        <X className="h-3 w-3 ml-1 hover:text-destructive transition-colors" />
                      </Badge>
                    </TooltipTrigger>
                    <TooltipContent side="bottom" className="text-xs">
                      Clique para remover
                    </TooltipContent>
                  </UITooltip>
                )}
                {salespersonFilter && (
                  <UITooltip>
                    <TooltipTrigger asChild>
                      <Badge 
                        variant="secondary" 
                        className="text-xs gap-1 pl-2 pr-1 py-1 cursor-pointer hover:bg-secondary/80 transition-all duration-200 animate-scale-in hover:scale-105 active:scale-95"
                        onClick={() => setSalespersonFilter("")}
                      >
                        Vendedor: {salespeople?.find(sp => sp.id === salespersonFilter)?.name || 'N/A'}
                        <X className="h-3 w-3 ml-1 hover:text-destructive transition-colors" />
                      </Badge>
                    </TooltipTrigger>
                    <TooltipContent side="bottom" className="text-xs">
                      Clique para remover
                    </TooltipContent>
                  </UITooltip>
                )}
                {searchTerm && (
                  <UITooltip>
                    <TooltipTrigger asChild>
                      <Badge 
                        variant="secondary" 
                        className="text-xs gap-1 pl-2 pr-1 py-1 cursor-pointer hover:bg-secondary/80 transition-all duration-200 animate-scale-in hover:scale-105 active:scale-95"
                        onClick={() => setSearchTerm("")}
                      >
                        Busca: "{searchTerm.length > 15 ? searchTerm.slice(0, 15) + '...' : searchTerm}"
                        <X className="h-3 w-3 ml-1 hover:text-destructive transition-colors" />
                      </Badge>
                    </TooltipTrigger>
                    <TooltipContent side="bottom" className="text-xs">
                      Clique para remover
                    </TooltipContent>
                  </UITooltip>
                )}
                {startDate && (
                  <UITooltip>
                    <TooltipTrigger asChild>
                      <Badge 
                        variant="secondary" 
                        className="text-xs gap-1 pl-2 pr-1 py-1 cursor-pointer hover:bg-secondary/80 transition-all duration-200 animate-scale-in hover:scale-105 active:scale-95"
                        onClick={() => setStartDate(undefined)}
                      >
                        De: {format(startDate, "dd/MM/yyyy", { locale: ptBR })}
                        <X className="h-3 w-3 ml-1 hover:text-destructive transition-colors" />
                      </Badge>
                    </TooltipTrigger>
                    <TooltipContent side="bottom" className="text-xs">
                      Clique para remover
                    </TooltipContent>
                  </UITooltip>
                )}
                {endDate && (
                  <UITooltip>
                    <TooltipTrigger asChild>
                      <Badge 
                        variant="secondary" 
                        className="text-xs gap-1 pl-2 pr-1 py-1 cursor-pointer hover:bg-secondary/80 transition-all duration-200 animate-scale-in hover:scale-105 active:scale-95"
                        onClick={() => setEndDate(undefined)}
                      >
                        Até: {format(endDate, "dd/MM/yyyy", { locale: ptBR })}
                        <X className="h-3 w-3 ml-1 hover:text-destructive transition-colors" />
                      </Badge>
                    </TooltipTrigger>
                    <TooltipContent side="bottom" className="text-xs">
                      Clique para remover
                    </TooltipContent>
                  </UITooltip>
                )}
              </div>
            </TooltipProvider>
          )}
        </CardHeader>
      )}
      <CardContent>
        {/* Statistics Summary */}
        {filteredAndSortedActivities.length > 0 && (
          <div className="mb-4">
            <Button
              variant="ghost"
              size="sm"
              className="w-full justify-between text-xs text-muted-foreground hover:text-foreground mb-2"
              onClick={() => setShowStats(!showStats)}
            >
              <span className="flex items-center gap-2">
                <BarChart3 className="h-4 w-4" />
                Estatísticas e Gráficos
              </span>
              {showStats ? (
                <ChevronUp className="h-4 w-4 transition-transform duration-200" />
              ) : (
                <ChevronDown className="h-4 w-4 transition-transform duration-200" />
              )}
            </Button>
            <div
              className={cn(
                "grid transition-all duration-300 ease-out",
                showStats ? "grid-rows-[1fr] opacity-100" : "grid-rows-[0fr] opacity-0"
              )}
            >
              <div className="overflow-hidden">
                <div className="p-3 rounded-lg bg-muted/30 border border-border/30">
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              {/* Bar Chart */}
              <div className="lg:col-span-1">
                <p className="text-xs font-medium text-muted-foreground mb-2">Distribuição por Tipo</p>
                <div className="h-[120px]">
                  <ChartContainer
                    config={{
                      count: { label: "Quantidade", color: "hsl(var(--primary))" }
                    }}
                    className="h-full w-full"
                  >
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart
                        data={Object.entries(stats.typeStats).map(([type, count]) => ({
                          name: activityLabels[type as ActivityType],
                          count,
                          type
                        }))}
                        layout="vertical"
                        margin={{ top: 0, right: 0, left: 0, bottom: 0 }}
                      >
                        <XAxis type="number" hide />
                        <YAxis 
                          type="category" 
                          dataKey="name" 
                          width={70} 
                          tick={{ fontSize: 10 }}
                          axisLine={false}
                          tickLine={false}
                        />
                        <Tooltip content={<ChartTooltipContent />} />
                        <Bar dataKey="count" radius={[0, 4, 4, 0]} maxBarSize={20}>
                          {Object.entries(stats.typeStats).map(([type], index) => (
                            <Cell 
                              key={`cell-${index}`} 
                              fill={`hsl(var(--primary))`}
                              fillOpacity={0.8 - (index * 0.1)}
                            />
                          ))}
                        </Bar>
                      </BarChart>
                    </ResponsiveContainer>
                  </ChartContainer>
                </div>
              </div>
              {/* Type Stats */}
              <div>
                <p className="text-xs font-medium text-muted-foreground mb-2">Por Tipo</p>
                <div className="flex flex-wrap gap-1.5">
                  {Object.entries(stats.typeStats).map(([type, count]) => {
                    const Icon = activityIcons[type as ActivityType];
                    return (
                      <Badge key={type} variant="secondary" className="text-[10px] gap-1">
                        <Icon className="h-3 w-3" />
                        {activityLabels[type as ActivityType]}: {count}
                      </Badge>
                    );
                  })}
                </div>
              </div>
              {/* Outcome Stats */}
              <div>
                <p className="text-xs font-medium text-muted-foreground mb-2">Por Resultado</p>
                <div className="flex flex-wrap gap-1.5">
                  {Object.entries(stats.outcomeStats).map(([outcome, count]) => {
                    const style = outcomeLabels[outcome as ActivityOutcome];
                    return (
                      <Badge key={outcome} variant="outline" className={`text-[10px] border ${style.color}`}>
                        {style.label}: {count}
                      </Badge>
                    );
                  })}
                </div>
              </div>
              {/* Pie Chart for Outcomes */}
              <div>
                <p className="text-xs font-medium text-muted-foreground mb-2">Resultados</p>
                <div className="h-[120px]">
                  <ChartContainer
                    config={{
                      count: { label: "Quantidade", color: "hsl(var(--primary))" }
                    }}
                    className="h-full w-full"
                  >
                    <ResponsiveContainer width="100%" height="100%">
                      <PieChart>
                        <Pie
                          data={Object.entries(stats.outcomeStats).map(([outcome, count]) => ({
                            name: outcomeLabels[outcome as ActivityOutcome].label,
                            value: count,
                            outcome
                          }))}
                          cx="50%"
                          cy="50%"
                          innerRadius={25}
                          outerRadius={45}
                          paddingAngle={2}
                          dataKey="value"
                        >
                          {Object.entries(stats.outcomeStats).map(([outcome], index) => {
                            const colors = [
                              'hsl(var(--status-success))',
                              'hsl(var(--status-error))',
                              'hsl(var(--status-info))',
                              'hsl(var(--status-warning))',
                              'hsl(var(--primary))',
                              'hsl(var(--accent))',
                              'hsl(var(--muted-foreground))',
                              'hsl(var(--secondary))',
                            ];
                            return (
                              <Cell 
                                key={`cell-${index}`} 
                                fill={colors[index % colors.length]}
                              />
                            );
                          })}
                        </Pie>
                        <Tooltip content={<ChartTooltipContent />} />
                      </PieChart>
                    </ResponsiveContainer>
                  </ChartContainer>
                </div>
              </div>
            </div>
          </div>
              </div>
            </div>
          </div>
        )}
        
        <div className="space-y-2">
          {filteredAndSortedActivities.length === 0 && (
            <div className="text-center py-8 bg-muted/20 rounded-lg border border-dashed border-border/50">
              <ClipboardList className="h-8 w-8 mx-auto text-muted-foreground/50 mb-2" />
              <p className="text-xs text-muted-foreground">
                {searchTerm || typeFilter || outcomeFilter || salespersonFilter || startDate || endDate
                  ? "Nenhuma atividade encontrada com os filtros aplicados" 
                  : "Nenhuma atividade registrada"}
              </p>
            </div>
          )}
          {paginatedItems.map((activity) => {
            const Icon = activityIcons[activity.activity_type];
            const outcomeStyle = outcomeLabels[activity.outcome];
            const salesperson = getSalesperson(activity.salesperson_id);

            return (
              <div 
                key={activity.id}
                className="p-3 rounded-lg bg-muted/30 hover:bg-muted/50 border border-border/30 hover:border-border/50 transition-all duration-200 space-y-2 hover-lift"
              >
                <div className="flex items-start gap-3">
                  <div className="p-2 rounded-lg bg-gradient-to-br from-primary/20 to-accent/10 shadow-sm">
                    <Icon className="h-4 w-4 gradient-primary" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="text-sm font-display font-medium">
                        {activityLabels[activity.activity_type]}
                      </span>
                      <Badge variant="outline" className={`text-[10px] border ${outcomeStyle.color}`}>
                        {outcomeStyle.label}
                      </Badge>
                    </div>
                    {activity.contact_name && (
                      <p className="text-xs text-muted-foreground mt-0.5">
                        {activity.contact_name}
                      </p>
                    )}
                  </div>
                  <div className="text-right shrink-0">
                    <p className="text-[10px] text-muted-foreground flex items-center gap-1">
                      <Clock className="h-3 w-3" />
                      {formatDistanceToNow(new Date(activity.created_at), { 
                        addSuffix: true, 
                        locale: ptBR 
                      })}
                    </p>
                    {activity.duration_minutes && (
                      <p className="text-[10px] text-muted-foreground font-medium">
                        {activity.duration_minutes} min
                      </p>
                    )}
                  </div>
                </div>
                
                {activity.notes && (
                  <p className="text-xs text-muted-foreground pl-11 line-clamp-2 bg-muted/30 rounded-md px-2 py-1">
                    {activity.notes}
                  </p>
                )}

                {salesperson && (
                  <div className="flex items-center gap-2 pl-11">
                    <Avatar className="h-5 w-5 border border-border/40">
                      <AvatarImage src={salesperson.avatar_url || undefined} />
                      <AvatarFallback className="text-[8px] bg-gradient-to-br from-primary/20 to-accent/10">
                        {salesperson.name.slice(0, 2).toUpperCase()}
                      </AvatarFallback>
                    </Avatar>
                    <span className="text-[10px] text-muted-foreground font-medium">
                      {salesperson.name}
                    </span>
                  </div>
                )}
              </div>
            );
          })}
        </div>
        
        {showPagination && filteredAndSortedActivities.length > 0 && (
          <TablePagination
            currentPage={currentPage}
            totalPages={totalPages}
            onPageChange={goToPage}
            startIndex={startIndex}
            endIndex={endIndex}
            totalItems={totalItems}
            itemsPerPage={itemsPerPage}
            onItemsPerPageChange={setItemsPerPage}
            itemsPerPageOptions={itemsPerPageOptions}
          />
        )}
      </CardContent>
    </Card>
  );
}
