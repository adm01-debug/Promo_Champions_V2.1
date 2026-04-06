import React from "react";
import { DollarSign, Target, TrendingUp } from "lucide-react";
import { useCountUp } from "@/lib/useCountUp";

interface SummaryCardsProps {
  totalSales: number;
  avgGoalProgress: number;
  totalCommissions: number;
}

const AnimatedCurrency = React.memo(({ value }: { value: number }) => {
  const animated = useCountUp(value, 1400);
  return <>R$ {animated.toLocaleString("pt-BR")}</>;
});
AnimatedCurrency.displayName = "AnimatedCurrency";

const AnimatedPercent = React.memo(({ value }: { value: number }) => {
  const animated = useCountUp(value, 1200, 1);
  return <>{animated.toFixed(1)}%</>;
});
AnimatedPercent.displayName = "AnimatedPercent";

export const SummaryCards = React.memo(function SummaryCards({
  totalSales,
  avgGoalProgress,
  totalCommissions,
}: SummaryCardsProps) {
  const cards = [
    {
      icon: DollarSign,
      label: "Total Vendido",
      iconBg: "bg-primary/20",
      iconColor: "text-primary",
      content: <AnimatedCurrency value={totalSales} />,
      delay: "100ms",
    },
    {
      icon: Target,
      label: "Média de Metas",
      iconBg: "bg-secondary/20",
      iconColor: "text-secondary",
      content: <AnimatedPercent value={avgGoalProgress} />,
      delay: "150ms",
    },
    {
      icon: TrendingUp,
      label: "Comissões Totais",
      iconBg: "bg-success/20",
      iconColor: "text-success",
      content: <AnimatedCurrency value={totalCommissions} />,
      delay: "200ms",
    },
  ];

  return (
    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
      {cards.map((card) => {
        const Icon = card.icon;
        return (
          <div
            key={card.label}
            className="opacity-0 animate-fade-in-up glass rounded-xl p-5 hover:shadow-lg hover:border-primary/20 transition-all duration-300 group"
            style={{ animationDelay: card.delay }}
          >
            <div className="flex items-center gap-3 mb-3">
              <div className={`p-2.5 rounded-xl ${card.iconBg} group-hover:scale-110 transition-transform duration-300`}>
                <Icon className={`h-4.5 w-4.5 ${card.iconColor}`} />
              </div>
              <span className="text-sm text-muted-foreground font-medium">{card.label}</span>
            </div>
            <p className="text-2xl font-bold tabular-nums tracking-tight">{card.content}</p>
          </div>
        );
      })}
    </div>
  );
});
