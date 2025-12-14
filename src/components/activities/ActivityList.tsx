import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useRecentActivities, ActivityType, ActivityOutcome } from "@/hooks/useActivities";
import { useSalespeople } from "@/hooks/useSalespeople";
import { formatDistanceToNow } from "date-fns";
import { ptBR } from "date-fns/locale";
import { Phone, Mail, Users, Linkedin, MessageCircle, MoreHorizontal, Clock, ClipboardList } from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Skeleton } from "@/components/ui/skeleton";
import { usePagination } from "@/hooks/usePagination";
import { TablePagination } from "@/components/shared/TablePagination";
import { FilterPopover, SortOption } from "@/components/shared/FilterPopover";
import { useState, useMemo } from "react";

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

  const salespersonOptions = useMemo(() => {
    if (!salespeople) return [];
    return salespeople.map(sp => ({ label: sp.name, value: sp.id }));
  }, [salespeople]);
  const filteredAndSortedActivities = useMemo(() => {
    if (!activities) return [];
    
    let filtered = [...activities];
    
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
  }, [activities, sortBy, typeFilter, outcomeFilter, salespersonFilter]);

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
            <CardTitle className="text-sm font-display font-medium flex items-center gap-2">
              <div className="p-1.5 rounded-md bg-gradient-to-br from-primary/20 to-accent/10">
                <ClipboardList className="h-4 w-4 gradient-primary" />
              </div>
              Log de Atividades
            </CardTitle>
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
        </CardHeader>
      )}
      <CardContent>
        <div className="space-y-2">
          {filteredAndSortedActivities.length === 0 && (
            <div className="text-center py-8 bg-muted/20 rounded-lg border border-dashed border-border/50">
              <ClipboardList className="h-8 w-8 mx-auto text-muted-foreground/50 mb-2" />
              <p className="text-xs text-muted-foreground">
                {typeFilter || outcomeFilter || salespersonFilter
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
