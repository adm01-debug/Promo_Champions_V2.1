import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { TrendingUp, Plus, Target, Users, Sparkles } from "lucide-react";
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
    gradient: "from-primary/20 via-primary/5 to-transparent",
    iconGradient: "from-primary to-primary/60",
  },
  sales: {
    icon: Plus,
    title: "Sem vendas ainda",
    description: "Comece adicionando deals ao seu pipeline.",
    cta: "Ir ao Pipeline",
    href: "/pipeline",
    gradient: "from-accent/20 via-accent/5 to-transparent",
    iconGradient: "from-accent to-accent/60",
  },
  clients: {
    icon: Users,
    title: "Nenhum cliente cadastrado",
    description: "Adicione seus primeiros clientes para começar a vender.",
    cta: "Adicionar Cliente",
    href: "/clientes",
    gradient: "from-status-info/20 via-status-info/5 to-transparent",
    iconGradient: "from-status-info to-status-info/60",
  },
  conversion: {
    icon: Target,
    title: "Sem dados de conversão",
    description: "Mova deals pelo pipeline para calcular sua taxa de conversão.",
    cta: "Ver Pipeline",
    href: "/pipeline",
    gradient: "from-status-warning/20 via-status-warning/5 to-transparent",
    iconGradient: "from-status-warning to-status-warning/60",
  },
};

export function DashboardEmptyState({ type }: DashboardEmptyStateProps) {
  const state = emptyStates[type];
  const Icon = state.icon;

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, ease: [0.25, 0.46, 0.45, 0.94] }}
    >
      <Card className="border-dashed border-2 border-border/40 bg-card/50 overflow-hidden relative group hover:border-primary/30 transition-colors duration-300">
        {/* Gradient background */}
        <div className={`absolute inset-0 bg-gradient-to-br ${state.gradient} opacity-60 group-hover:opacity-100 transition-opacity duration-500`} />
        
        <CardContent className="p-5 sm:p-8 flex flex-col items-center text-center gap-4 relative z-10">
          {/* Animated icon container */}
          <motion.div
            initial={{ scale: 0.8 }}
            animate={{ scale: 1 }}
            transition={{ delay: 0.1, type: "spring", stiffness: 200 }}
            className="relative"
          >
            <div className={`p-4 rounded-2xl bg-gradient-to-br ${state.iconGradient} shadow-lg`}>
              <Icon className="h-7 w-7 text-white" />
            </div>
            {/* Floating sparkle */}
            <motion.div
              animate={{ y: [-2, 2, -2], rotate: [0, 10, 0] }}
              transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
              className="absolute -top-1 -right-1"
            >
              <Sparkles className="h-3.5 w-3.5 text-primary/60" />
            </motion.div>
          </motion.div>
          
          <div className="space-y-1.5">
            <h3 className="text-sm font-bold">{state.title}</h3>
            <p className="text-xs text-muted-foreground max-w-[240px] leading-relaxed">
              {state.description}
            </p>
          </div>
          
          <Button asChild size="sm" variant={type === "revenue" ? "glow-pulse" : "glow"} className="mt-1">
            <Link to={state.href}>
              <Plus className="h-3.5 w-3.5 mr-1" />
              {state.cta}
            </Link>
          </Button>
        </CardContent>
      </Card>
    </motion.div>
  );
}
