import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { MoreHorizontal, ArrowUpRight } from "lucide-react";
import { Button } from "@/components/ui/button";

const deals = [
  {
    id: 1,
    client: "Tech Solutions Ltda",
    value: 45000,
    status: "fechado",
    date: "12 Dez",
    initials: "TS",
    product: "CRM Enterprise",
  },
  {
    id: 2,
    client: "Indústria ABC",
    value: 32000,
    status: "proposta",
    date: "11 Dez",
    initials: "IA",
    product: "ERP Completo",
  },
  {
    id: 3,
    client: "Varejo Plus",
    value: 28500,
    status: "negociacao",
    date: "10 Dez",
    initials: "VP",
    product: "PDV Cloud",
  },
  {
    id: 4,
    client: "Consultoria XYZ",
    value: 18000,
    status: "fechado",
    date: "09 Dez",
    initials: "CX",
    product: "Analytics Pro",
  },
  {
    id: 5,
    client: "Logística Express",
    value: 56000,
    status: "proposta",
    date: "08 Dez",
    initials: "LE",
    product: "TMS Complete",
  },
];

const statusConfig = {
  fechado: { label: "Fechado", variant: "default" as const, className: "bg-success/10 text-success border-success/20" },
  proposta: { label: "Proposta", variant: "default" as const, className: "bg-warning/10 text-warning border-warning/20" },
  negociacao: { label: "Negociação", variant: "default" as const, className: "bg-info/10 text-info border-info/20" },
};

export function RecentDeals() {
  return (
    <Card className="p-6 shadow-soft">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h3 className="text-lg font-semibold text-foreground">Negócios Recentes</h3>
          <p className="text-sm text-muted-foreground">Últimas oportunidades</p>
        </div>
        <Button variant="ghost" size="sm" className="text-primary hover:text-primary/80">
          Ver todos
          <ArrowUpRight className="ml-1 h-4 w-4" />
        </Button>
      </div>

      <div className="space-y-4">
        {deals.map((deal) => (
          <div
            key={deal.id}
            className="flex items-center gap-4 p-4 rounded-xl bg-secondary/50 hover:bg-secondary transition-colors group"
          >
            <Avatar className="h-10 w-10 border-2 border-background shadow-sm">
              <AvatarFallback className="bg-primary/10 text-primary text-sm font-semibold">
                {deal.initials}
              </AvatarFallback>
            </Avatar>

            <div className="flex-1 min-w-0">
              <p className="font-medium text-foreground truncate">{deal.client}</p>
              <p className="text-sm text-muted-foreground">{deal.product}</p>
            </div>

            <div className="text-right">
              <p className="font-bold text-foreground">
                {new Intl.NumberFormat("pt-BR", {
                  style: "currency",
                  currency: "BRL",
                  minimumFractionDigits: 0,
                }).format(deal.value)}
              </p>
              <p className="text-xs text-muted-foreground">{deal.date}</p>
            </div>

            <Badge className={statusConfig[deal.status as keyof typeof statusConfig].className}>
              {statusConfig[deal.status as keyof typeof statusConfig].label}
            </Badge>

            <Button
              variant="ghost"
              size="icon"
              className="h-8 w-8 opacity-0 group-hover:opacity-100 transition-opacity"
            >
              <MoreHorizontal className="h-4 w-4 text-muted-foreground" />
            </Button>
          </div>
        ))}
      </div>
    </Card>
  );
}