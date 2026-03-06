import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { TrendingUp, Plus, Target, Users } from "lucide-react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";

interface DashboardEmptyStateProps {
  type: "revenue" | "sales" | "clients" | "conversion";
}

const emptyStates = {
  revenue: {
    icon: TrendingUp,
    title: "Nenhum faturamento registrado",
    description: "Registre sua primeira venda e acompanhe seu faturamento em tempo real.",
    cta: "Registrar Venda",
    href: "/vendas",
    color: "text-primary",
    bgColor: "bg-primary/10",
  },
  sales: {
    icon: Plus,
    title: "Sem vendas ainda",
    description: "Comece adicionando deals ao seu pipeline.",
    cta: "Ir ao Pipeline",
    href: "/pipeline",
    color: "text-accent",
    bgColor: "bg-accent/10",
  },
  clients: {
    icon: Users,
    title: "Nenhum cliente cadastrado",
    description: "Adicione seus primeiros clientes para começar a vender.",
    cta: "Adicionar Cliente",
    href: "/clientes",
    color: "text-status-info",
    bgColor: "bg-status-info/10",
  },
  conversion: {
    icon: Target,
    title: "Sem dados de conversão",
    description: "Mova deals pelo pipeline para calcular sua taxa de conversão.",
    cta: "Ver Pipeline",
    href: "/pipeline",
    color: "text-status-warning",
    bgColor: "bg-status-warning/10",
  },
};

export function DashboardEmptyState({ type }: DashboardEmptyStateProps) {
  const state = emptyStates[type];
  const Icon = state.icon;

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.3 }}
    >
      <Card className="border-dashed border-2 border-border/50 bg-card/50">
        <CardContent className="p-4 sm:p-6 flex flex-col items-center text-center gap-3">
          <div className={`p-3 rounded-2xl ${state.bgColor}`}>
            <Icon className={`h-6 w-6 ${state.color}`} />
          </div>
          <div className="space-y-1">
            <h3 className="text-sm font-semibold">{state.title}</h3>
            <p className="text-xs text-muted-foreground max-w-[200px]">{state.description}</p>
          </div>
          <Button asChild size="sm" variant="outline" className="mt-1">
            <Link to={state.href}>{state.cta}</Link>
          </Button>
        </CardContent>
      </Card>
    </motion.div>
  );
}
