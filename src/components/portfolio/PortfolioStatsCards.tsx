import React from "react";
// PortfolioStatsCards - aligned with PortfolioStats interface
import { Users, UserCheck, UserX, DollarSign, Target, AlertCircle, CircleSlash, Zap } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { PortfolioStats } from "@/hooks/useClientPortfolio";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";

interface PortfolioStatsCardsProps {
  stats: PortfolioStats | undefined;
  isLoading: boolean;
}

function _PortfolioStatsCards({ stats, isLoading }: PortfolioStatsCardsProps) {
  const cards = [
    {
      title: "Total de Clientes",
      value: stats?.totalClients || 0,
      icon: Users,
      iconWrapperClass: "bg-primary/10",
      iconClass: "text-primary",
    },
    {
      title: "Clientes Ativos",
      value: stats?.activeClients || 0,
      icon: UserCheck,
      iconWrapperClass: "bg-status-success/10",
      iconClass: "text-status-success",
    },
    {
      title: "Clientes Inativos",
      value: stats?.inactiveClients || 0,
      icon: UserX,
      iconWrapperClass: "bg-status-warning/10",
      iconClass: "text-status-warning",
    },
    {
      title: "Clientes Ativados",
      value: stats?.activatedCount || 0,
      icon: Zap,
      iconWrapperClass: "bg-amber-500/10",
      iconClass: "text-amber-500",
      tooltip: "Clientes que já realizaram a primeira compra (ativação)",
    },
    {
      title: "Valor Total",
      value: new Intl.NumberFormat("pt-BR", {
        style: "currency",
        currency: "BRL",
      }).format(stats?.totalValue || 0),
      icon: DollarSign,
      iconWrapperClass: "bg-accent/10",
      iconClass: "text-accent",
      isValue: true,
    },
  ];

  const icpCards = [
    {
      title: "ICP Match",
      value: stats?.icpMatch || 0,
      icon: Target,
      color: "success",
      tooltip: "Clientes que atendem todos os critérios do ICP",
    },
    {
      title: "ICP Parcial",
      value: stats?.icpPartial || 0,
      icon: AlertCircle,
      color: "warning",
      tooltip: "Clientes com dados ICP incompletos",
    },
    {
      title: "Sem ICP",
      value: stats?.icpNone || 0,
      icon: CircleSlash,
      color: "muted",
      tooltip: "Clientes sem dados de ICP cadastrados",
    },
  ];

  return (
    <TooltipProvider>
      <div className="space-y-4">
        {/* Main Stats */}
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-5">
          {cards.map((card) => (
            <Card key={card.title} className="glass hover-lift">
              <CardContent className="pt-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">{card.title}</p>
                    {isLoading ? (
                      <Skeleton className="h-8 w-24 mt-1" />
                    ) : (
                      <p className={`text-2xl font-bold ${card.isValue ? "gradient-text" : ""}`}>{card.value}</p>
                    )}
                  </div>
                  <div className={`h-12 w-12 rounded-xl flex items-center justify-center ${card.iconWrapperClass}`}>
                    <card.icon className={`h-6 w-6 ${card.iconClass}`} />
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* ICP Stats */}
        <div className="grid gap-4 md:grid-cols-3">
          {icpCards.map((card) => (
            <Tooltip key={card.title}>
              <TooltipTrigger asChild>
                <Card className="glass hover-lift cursor-help border-border/40">
                  <CardContent className="pt-4 pb-4">
                    <div className="flex items-center gap-4">
                      <div
                        className={`h-10 w-10 rounded-lg flex items-center justify-center ${
                          card.color === "success"
                            ? "bg-status-success/20"
                            : card.color === "warning"
                            ? "bg-status-warning/20"
                            : "bg-muted/50"
                        }`}
                      >
                        <card.icon
                          className={`h-5 w-5 ${
                            card.color === "success"
                              ? "text-status-success"
                              : card.color === "warning"
                              ? "text-status-warning"
                              : "text-muted-foreground"
                          }`}
                        />
                      </div>
                      <div className="flex-1">
                        <p className="text-xs font-medium text-muted-foreground">{card.title}</p>
                        {isLoading ? (
                          <Skeleton className="h-6 w-12 mt-1" />
                        ) : (
                          <p
                            className={`text-xl font-bold ${
                              card.color === "success"
                                ? "text-status-success"
                                : card.color === "warning"
                                ? "text-status-warning"
                                : "text-muted-foreground"
                            }`}
                          >
                            {card.value}
                          </p>
                        )}
                      </div>
                      {!isLoading && stats?.totalClients ? (
                        <div className="text-right">
                          <p className="text-xs text-muted-foreground">
                            {Math.round((card.value / stats.totalClients) * 100)}%
                          </p>
                        </div>
                      ) : null}
                    </div>
                  </CardContent>
                </Card>
              </TooltipTrigger>
              <TooltipContent>
                <p>{card.tooltip}</p>
              </TooltipContent>
            </Tooltip>
          ))}
        </div>
      </div>
    </TooltipProvider>
  );
}

export const PortfolioStatsCards = React.memo(_PortfolioStatsCards);
