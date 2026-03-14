import { forwardRef } from "react";
import { Button } from "@/components/ui/button";
import { TrendingUp, Plus, Target, Users } from "lucide-react";
import { Link } from "react-router-dom";
import { cn } from "@/lib/utils";

interface DashboardEmptyStateProps {
  type: "revenue" | "sales" | "clients" | "conversion";
}

const emptyStates = {
  revenue: {
    icon: TrendingUp,
    title: "Faturamento",
    cta: "Registrar Venda",
    href: "/vendas",
    iconColor: "text-success",
    iconBg: "bg-success/10",
  },
  sales: {
    icon: Plus,
    title: "Vendas",
    cta: "Ir ao Pipeline",
    href: "/pipeline",
    iconColor: "text-status-info",
    iconBg: "bg-status-info/10",
  },
  clients: {
    icon: Users,
    title: "Clientes",
    cta: "Adicionar",
    href: "/clientes",
    iconColor: "text-status-warning",
    iconBg: "bg-status-warning/10",
  },
  conversion: {
    icon: Target,
    title: "Conversão",
    cta: "Ver Pipeline",
    href: "/pipeline",
    iconColor: "text-status-purple",
    iconBg: "bg-status-purple/10",
  },
};

export const DashboardEmptyState = forwardRef<HTMLDivElement, DashboardEmptyStateProps>(
  function DashboardEmptyState({ type }, ref) {
    const state = emptyStates[type];
    const Icon = state.icon;

    return (
      <div
        ref={ref}
        className="relative h-full rounded-xl border border-dashed border-border/50 bg-card/30 p-4 sm:p-5 flex flex-col justify-between gap-3 transition-colors hover:border-border/80 hover:bg-card/50"
      >
        <div className="flex items-start justify-between">
          <div className="space-y-1">
            <p className="text-xs text-muted-foreground/70 font-medium uppercase tracking-wide">
              {state.title}
            </p>
            <p className="text-xl sm:text-2xl font-bold text-muted-foreground/30 font-display tabular-nums">
              —
            </p>
          </div>
          <div className={cn("p-2 rounded-xl", state.iconBg)}>
            <Icon className={cn("h-4 w-4 sm:h-5 sm:w-5", state.iconColor)} />
          </div>
        </div>
        <Button
          asChild
          variant="ghost"
          size="sm"
          className="w-fit h-7 px-3 text-xs text-muted-foreground hover:text-foreground -ml-1"
        >
          <Link to={state.href}>+ {state.cta}</Link>
        </Button>
      </div>
    );
  }
);

DashboardEmptyState.displayName = "DashboardEmptyState";
