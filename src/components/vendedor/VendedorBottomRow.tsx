import { memo } from "react";
import { Clock, CheckCircle2 } from "lucide-react";
import { cn } from "@/lib/utils";
import { differenceInDays, parseISO } from "date-fns";

interface Sale {
  id: string;
  client_name: string;
  product_name: string;
  amount: number;
  status: string;
  created_at: string;
}

interface VendedorBottomRowProps {
  recentDeals: Sale[];
  staleTasks: Sale[];
}

export const VendedorBottomRow = memo(function VendedorBottomRow({ recentDeals, staleTasks }: VendedorBottomRowProps) {
  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      <div className="opacity-0 animate-fade-in-up glass rounded-xl p-6" style={{ animationDelay: "450ms" }}>
        <h3 className="text-lg font-semibold mb-4">Vendas Recentes</h3>
        {recentDeals.length > 0 ? (
          <div className="space-y-3">
            {recentDeals.map(deal => (
              <div key={deal.id} className="flex items-center justify-between p-3 rounded-lg bg-muted/30">
                <div>
                  <p className="font-medium">{deal.client_name}</p>
                  <p className="text-sm text-muted-foreground">{deal.product_name}</p>
                </div>
                <div className="text-right">
                  <p className="font-bold">R$ {Number(deal.amount).toLocaleString("pt-BR")}</p>
                  <span className={cn(
                    "text-xs px-2 py-0.5 rounded-full",
                    deal.status === "completed" && "bg-success/20 text-success",
                    deal.status === "pending" && "bg-warning/20 text-warning",
                    deal.status === "cancelled" && "bg-destructive/20 text-destructive"
                  )}>
                    {deal.status === "completed" ? "Fechado" : deal.status === "pending" ? "Pendente" : "Cancelado"}
                  </span>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-8 text-muted-foreground">Nenhuma venda registrada</div>
        )}
      </div>

      <div className="opacity-0 animate-fade-in-up glass rounded-xl p-6" style={{ animationDelay: "500ms" }}>
        <h3 className="text-lg font-semibold mb-4">Tarefas Pendentes</h3>
        {staleTasks.length > 0 ? (
          <div className="space-y-3">
            {staleTasks.map(task => {
              const daysSince = differenceInDays(new Date(), parseISO(task.created_at));
              return (
                <div key={task.id} className="flex items-center gap-3 p-3 rounded-lg bg-warning/10 border border-warning/30">
                  <Clock className="h-5 w-5 text-warning" />
                  <div className="flex-1">
                    <p className="font-medium">{task.client_name}</p>
                    <p className="text-sm text-muted-foreground">{task.product_name}</p>
                  </div>
                  <div className="text-right">
                    <p className="font-bold">R$ {Number(task.amount).toLocaleString("pt-BR")}</p>
                    <p className="text-xs text-warning">{daysSince} dias parado</p>
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          <div className="text-center py-8 text-muted-foreground">
            <CheckCircle2 className="h-8 w-8 mx-auto mb-2 text-success" />
            <p>Nenhuma tarefa pendente!</p>
          </div>
        )}
      </div>
    </div>
  );
});
