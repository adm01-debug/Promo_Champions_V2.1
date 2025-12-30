import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Deal } from "@/hooks/usePipeline";
import { cn } from "@/lib/utils";
import { Building2, DollarSign, Calendar, Target, Zap, Users } from "lucide-react";
import { format, parseISO } from "date-fns";
import { ptBR } from "date-fns/locale";

interface DealCardProps {
  deal: Deal;
  probability?: {
    probability: number;
    factors: string[];
  };
  leadScore?: {
    score: number;
    category: 'hot' | 'warm' | 'cold';
    factors: string[];
  };
  activeCadence?: {
    cadenceName: string;
    currentStep: number;
    status: 'active' | 'paused';
  };
  icpData?: {
    is_icp_match: boolean;
    grupo_nicho?: string;
  };
}

export const DealCard = ({ deal, probability, leadScore, activeCadence, icpData }: DealCardProps) => {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: deal.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  };

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat("pt-BR", {
      style: "currency",
      currency: "BRL",
      notation: "compact",
    }).format(value);
  };

  const getScoreColor = (category?: 'hot' | 'warm' | 'cold') => {
    switch (category) {
      case 'hot': return 'bg-status-error/20 text-status-error border-status-error/30';
      case 'warm': return 'bg-status-warning/20 text-status-warning border-status-warning/30';
      case 'cold': return 'bg-blue-500/20 text-blue-500 border-blue-500/30';
      default: return 'bg-muted text-muted-foreground border-border';
    }
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      {...attributes}
      {...listeners}
      className={cn(
        "touch-none cursor-grab active:cursor-grabbing",
        isDragging && "opacity-50"
      )}
    >
      <Card className={cn(
        "p-3 glass border border-border/40 dark:border-glow hover-lift transition-all duration-300",
        "hover:shadow-lg hover:shadow-primary/5 group",
        isDragging && "shadow-xl shadow-primary/20 rotate-2 scale-105"
      )}>
        {/* Header */}
        <div className="flex items-start justify-between gap-2 mb-2">
          <div className="flex-1 min-w-0">
            <h4 className="font-display font-semibold text-sm truncate group-hover:text-primary transition-colors">
              {deal.client_name}
            </h4>
            <p className="text-xs text-muted-foreground truncate mt-0.5">
              {deal.product_name}
            </p>
          </div>
          {leadScore && (
            <Badge variant="outline" className={cn("text-[10px] shrink-0", getScoreColor(leadScore.category))}>
              <Target className="h-3 w-3 mr-1" />
              {leadScore.score}
            </Badge>
          )}
        </div>

        {/* Value */}
        <div className="flex items-center gap-1.5 mb-2">
          <DollarSign className="h-3.5 w-3.5 text-status-success" />
          <span className="font-display font-bold text-sm gradient-text">
            {formatCurrency(deal.amount)}
          </span>
        </div>

        {/* Meta info */}
        <div className="flex flex-wrap gap-1.5 text-[10px] text-muted-foreground">
          {deal.category && (
            <Badge variant="secondary" className="text-[10px] px-1.5 py-0 bg-muted/50">
              {deal.category}
            </Badge>
          )}
          
          {probability && (
            <Badge variant="outline" className="text-[10px] px-1.5 py-0 border-primary/30 text-primary">
              <Zap className="h-2.5 w-2.5 mr-0.5" />
              {probability.probability}%
            </Badge>
          )}

          {icpData?.is_icp_match && (
            <Badge variant="outline" className="text-[10px] px-1.5 py-0 border-status-success/30 text-status-success">
              <Users className="h-2.5 w-2.5 mr-0.5" />
              ICP
            </Badge>
          )}
        </div>

        {/* Active Cadence */}
        {activeCadence && (
          <div className="mt-2 pt-2 border-t border-border/30 text-[10px] text-muted-foreground">
            <span className="text-primary font-medium">{activeCadence.cadenceName}</span>
            <span className="ml-1">• Etapa {activeCadence.currentStep}</span>
          </div>
        )}

        {/* Date */}
        <div className="mt-2 pt-2 border-t border-border/30 flex items-center gap-1 text-[10px] text-muted-foreground">
          <Calendar className="h-3 w-3" />
          <span>{format(parseISO(deal.created_at), "dd MMM", { locale: ptBR })}</span>
        </div>
      </Card>
    </div>
  );
};
