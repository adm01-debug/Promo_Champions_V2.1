import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { GripVertical, User, Package, Calendar } from "lucide-react";
import { Deal } from "@/hooks/usePipeline";
import { formatDistanceToNow } from "date-fns";
import { ptBR } from "date-fns/locale";

interface DealCardProps {
  deal: Deal;
}

export const DealCard = ({ deal }: DealCardProps) => {
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
    }).format(value);
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={`
        glass rounded-lg p-3 cursor-grab active:cursor-grabbing
        transition-all duration-200 hover:scale-[1.02] hover:shadow-lg
        ${isDragging ? "opacity-50 scale-105 shadow-2xl z-50" : ""}
      `}
      {...attributes}
      {...listeners}
    >
      <div className="flex items-start gap-2">
        <GripVertical className="h-4 w-4 text-muted-foreground flex-shrink-0 mt-0.5" />
        <div className="flex-1 min-w-0">
          <div className="flex items-center justify-between gap-2 mb-1">
            <h4 className="font-medium text-sm truncate">{deal.client_name}</h4>
            <span className="text-xs font-semibold text-primary whitespace-nowrap">
              {formatCurrency(deal.amount)}
            </span>
          </div>
          <div className="flex items-center gap-1.5 text-xs text-muted-foreground mb-2">
            <Package className="h-3 w-3" />
            <span className="truncate">{deal.product_name}</span>
          </div>
          <div className="flex items-center justify-between text-xs text-muted-foreground">
            <div className="flex items-center gap-1">
              <Calendar className="h-3 w-3" />
              <span>
                {formatDistanceToNow(new Date(deal.updated_at), {
                  addSuffix: true,
                  locale: ptBR,
                })}
              </span>
            </div>
            <span className="px-1.5 py-0.5 rounded bg-muted text-[10px] uppercase">
              {deal.category}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};
