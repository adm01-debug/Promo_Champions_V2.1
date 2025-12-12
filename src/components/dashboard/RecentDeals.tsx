import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";

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
  closed: { label: "Fechado", class: "bg-success/20 text-success border-success/30" },
  pending: { label: "Pendente", class: "bg-warning/20 text-warning border-warning/30" },
  lost: { label: "Perdido", class: "bg-destructive/20 text-destructive border-destructive/30" },
};

export const RecentDeals = () => {
  return (
    <div className="glass rounded-xl p-6">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h3 className="text-lg font-semibold">Negócios Recentes</h3>
          <p className="text-sm text-muted-foreground">Últimas vendas fechadas</p>
        </div>
        <button className="text-sm text-primary hover:text-primary/80 transition-colors">
          Ver todos
        </button>
      </div>

      <div className="space-y-4">
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
              className="flex items-center gap-4 p-3 rounded-lg hover:bg-muted/30 transition-colors group"
            >
              <Avatar className="h-10 w-10 border border-border">
                <AvatarFallback className="bg-gradient-to-br from-primary/20 to-secondary/20 text-foreground text-xs font-medium">
                  {initials}
                </AvatarFallback>
              </Avatar>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium truncate group-hover:text-primary transition-colors">
                  {deal.client}
                </p>
                <p className="text-xs text-muted-foreground truncate">{deal.product}</p>
              </div>
              <div className="text-right">
                <p className="text-sm font-semibold">
                  R$ {deal.value.toLocaleString("pt-BR")}
                </p>
                <p className="text-xs text-muted-foreground">{deal.date}</p>
              </div>
              <Badge variant="outline" className={status.class}>
                {status.label}
              </Badge>
            </div>
          );
        })}
      </div>
    </div>
  );
};
