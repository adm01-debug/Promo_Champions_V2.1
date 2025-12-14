import { Users, UserCheck, UserX, DollarSign } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { PortfolioStats } from "@/hooks/useClientPortfolio";

interface PortfolioStatsCardsProps {
  stats: PortfolioStats | undefined;
  isLoading: boolean;
}

export function PortfolioStatsCards({ stats, isLoading }: PortfolioStatsCardsProps) {
  const cards = [
    {
      title: "Total de Clientes",
      value: stats?.totalClients || 0,
      icon: Users,
      color: "primary",
    },
    {
      title: "Clientes Ativos",
      value: stats?.activeClients || 0,
      icon: UserCheck,
      color: "success",
    },
    {
      title: "Clientes Inativos",
      value: stats?.inactiveClients || 0,
      icon: UserX,
      color: "warning",
    },
    {
      title: "Valor Total",
      value: new Intl.NumberFormat("pt-BR", {
        style: "currency",
        currency: "BRL",
      }).format(stats?.totalValue || 0),
      icon: DollarSign,
      color: "accent",
      isValue: true,
    },
  ];

  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
      {cards.map((card) => (
        <Card key={card.title} className="glass hover-lift">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">
                  {card.title}
                </p>
                {isLoading ? (
                  <Skeleton className="h-8 w-24 mt-1" />
                ) : (
                  <p className={`text-2xl font-bold ${card.isValue ? 'gradient-text' : ''}`}>
                    {card.value}
                  </p>
                )}
              </div>
              <div className={`h-12 w-12 rounded-xl bg-${card.color}/10 flex items-center justify-center`}>
                <card.icon className={`h-6 w-6 text-${card.color}`} />
              </div>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
