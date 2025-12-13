import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { ArrowRight, Briefcase } from "lucide-react";

const deals = [
  {
    id: 1,
    client: "Tech Solutions Ltda",
    product: "Plano Enterprise",
    value: 45000,
    date: "Hoje",
    status: "closed",
  },
  {
    id: 2,
    client: "Innovare Corp",
    product: "Plano Business",
    value: 28500,
    date: "Hoje",
    status: "closed",
  },
  {
    id: 3,
    client: "StartUp XYZ",
    product: "Plano Starter",
    value: 12000,
    date: "Ontem",
    status: "pending",
  },
  {
    id: 4,
    client: "Global Trade SA",
    product: "Plano Enterprise",
    value: 52000,
    date: "Ontem",
    status: "closed",
  },
  {
    id: 5,
    client: "Digital First",
    product: "Plano Business",
    value: 31500,
    date: "2 dias",
    status: "closed",
  },
];

const statusConfig = {
  closed: { label: "Fechado", class: "bg-status-success/20 text-status-success border-status-success/30" },
  pending: { label: "Pendente", class: "bg-warning/20 text-warning border-warning/30" },
  lost: { label: "Perdido", class: "bg-destructive/20 text-destructive border-destructive/30" },
};

export const RecentDeals = () => {
  return (
    <div className="glass rounded-xl p-6 border border-border/40 dark:border-glow card-elevated">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <div className="p-2.5 rounded-xl gradient-primary">
            <Briefcase className="h-4 w-4 text-white" />
          </div>
          <div>
            <h3 className="text-lg font-semibold font-display gradient-text">Negócios Recentes</h3>
            <p className="text-sm text-muted-foreground">Últimas vendas fechadas</p>
          </div>
        </div>
        <button className="text-sm text-primary hover:text-primary/80 transition-colors flex items-center gap-1 hover:gap-2 group">
          Ver todos
          <ArrowRight className="h-3.5 w-3.5 transition-all" />
        </button>
      </div>

      <div className="space-y-2">
        {deals.map((deal) => {
          const status = statusConfig[deal.status as keyof typeof statusConfig];
          const initials = deal.client
            .split(" ")
            .map((word) => word[0])
            .join("")
            .slice(0, 2);

          return (
            <div
              key={deal.id}
              className="flex items-center gap-4 p-3 rounded-xl hover:bg-muted/30 hover-lift cursor-pointer group border border-transparent hover:border-border/40 transition-all"
            >
              <Avatar className="h-11 w-11 border-2 border-border/50 group-hover:border-primary/50 transition-colors">
                <AvatarFallback className="gradient-primary text-white text-xs font-semibold">
                  {initials}
                </AvatarFallback>
              </Avatar>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium truncate group-hover:text-primary transition-colors font-display">
                  {deal.client}
                </p>
                <p className="text-xs text-muted-foreground truncate">{deal.product}</p>
              </div>
              <div className="text-right">
                <p className="text-sm font-bold gradient-text">
                  R$ {deal.value.toLocaleString("pt-BR")}
                </p>
                <p className="text-xs text-muted-foreground">{deal.date}</p>
              </div>
              <Badge variant="outline" className={`${status.class} text-xs`}>
                {status.label}
              </Badge>
            </div>
          );
        })}
      </div>
    </div>
  );
};
