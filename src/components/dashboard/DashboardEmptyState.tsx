import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { TrendingUp, Plus, Target, Users } from "lucide-react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { cn } from "@/lib/utils";

interface DashboardEmptyStateProps {
  type: "revenue" | "sales" | "clients" | "conversion";
}

const emptyStates = {
  revenue: {
    icon: TrendingUp,
    title: "Registre seu faturamento",
    description: "Registre sua primeira venda e acompanhe seu faturamento em tempo real.",
    cta: "Registrar Venda",
    href: "/vendas",
    color: "text-primary",
    bgColor: "bg-primary/10",
    borderColor: "border-primary/40",
    step: 1,
    glowClass: "shadow-[0_0_15px_-3px_hsl(var(--primary)/0.3)]",
  },
  sales: {
    icon: Plus,
    title: "Adicione ao pipeline",
    description: "Comece adicionando deals ao seu pipeline.",
    cta: "Ir ao Pipeline",
    href: "/pipeline",
    color: "text-accent",
    bgColor: "bg-accent/10",
    borderColor: "border-accent/30",
    step: 2,
    glowClass: "",
  },
  clients: {
    icon: Users,
    title: "Cadastre clientes",
    description: "Adicione seus primeiros clientes para começar a vender.",
    cta: "Adicionar Cliente",
    href: "/clientes",
    color: "text-status-info",
    bgColor: "bg-status-info/10",
    borderColor: "border-status-info/30",
    step: 3,
    glowClass: "",
  },
  conversion: {
    icon: Target,
    title: "Acompanhe conversões",
    description: "Mova deals pelo pipeline para calcular sua taxa de conversão.",
    cta: "Ver Pipeline",
    href: "/pipeline",
    color: "text-status-warning",
    bgColor: "bg-status-warning/10",
    borderColor: "border-status-warning/30",
    step: 4,
    glowClass: "",
  },
};

export function DashboardEmptyState({ type }: DashboardEmptyStateProps) {
  const state = emptyStates[type];
  const Icon = state.icon;
  const isFirstStep = state.step === 1;

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.3, delay: state.step * 0.05 }}
    >
      <Card className={cn(
        "border-dashed border-2 bg-card/50 relative overflow-hidden transition-all duration-300",
        isFirstStep 
          ? `${state.borderColor} ${state.glowClass} hover:shadow-[0_0_20px_-3px_hsl(var(--primary)/0.4)]` 
          : "border-border/30 opacity-75 hover:opacity-100",
      )}>
        <CardContent className="p-4 sm:p-6 flex flex-col items-center text-center gap-3">
          {/* Step number badge */}
          <div className="absolute top-2 left-2">
            <span className={cn(
              "inline-flex items-center justify-center h-5 w-5 rounded-full text-[10px] font-bold",
              isFirstStep 
                ? "bg-primary text-primary-foreground" 
                : "bg-muted text-muted-foreground"
            )}>
              {state.step}
            </span>
          </div>

          <div className={cn("p-3 rounded-2xl", state.bgColor, "relative")}>
            <Icon className={cn("h-6 w-6", state.color)} />
            {isFirstStep && (
              <motion.div
                className="absolute inset-0 rounded-2xl border-2 border-primary/40"
                animate={{ scale: [1, 1.15, 1], opacity: [0.6, 0, 0.6] }}
                transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
              />
            )}
          </div>
          <div className="space-y-1">
            <h3 className="text-sm font-semibold">{state.title}</h3>
            <p className="text-xs text-muted-foreground max-w-[200px]">{state.description}</p>
          </div>
          <Button 
            asChild 
            size="sm" 
            variant={isFirstStep ? "default" : "outline"} 
            className={cn("mt-1", isFirstStep && "shadow-md")}
          >
            <Link to={state.href}>{state.cta}</Link>
          </Button>
        </CardContent>
      </Card>
    </motion.div>
  );
}
