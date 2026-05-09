import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { TrendingUp, Plus, Target, Users } from "lucide-react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";

interface DashboardEmptyStateProps {
  type: "revenue" | "sales" | "clients" | "conversion" | "leaderboard";
  hero?: boolean;
}

/** Inline SVG illustrations per type — lightweight, no external assets */
function EmptyIllustration({ type }: { type: string }) {
  const shared = "w-full h-full";

  if (type === "revenue") {
    return (
      <svg viewBox="0 0 120 80" className={shared} fill="none" xmlns="http://www.w3.org/2000/svg">
        <rect x="10" y="50" width="12" height="20" rx="3" className="fill-primary/20" />
        <rect x="28" y="38" width="12" height="32" rx="3" className="fill-primary/30" />
        <rect x="46" y="28" width="12" height="42" rx="3" className="fill-primary/40" />
        <rect x="64" y="18" width="12" height="52" rx="3" className="fill-primary/50" />
        <rect x="82" y="8" width="12" height="62" rx="3" className="fill-primary/60" />
        <path d="M16 48 L34 36 L52 26 L70 16 L88 6" className="stroke-primary" strokeWidth="2" strokeLinecap="round" strokeDasharray="4 3" />
        <path d="M85 4 L92 3 L89 10" className="stroke-primary" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
        <text x="100" y="16" className="fill-primary/40" fontSize="10" fontWeight="bold">$</text>
        <text x="4" y="45" className="fill-primary/20" fontSize="8" fontWeight="bold">$</text>
      </svg>
    );
  }

  if (type === "sales") {
    return (
      <svg viewBox="0 0 120 80" className={shared} fill="none" xmlns="http://www.w3.org/2000/svg">
        <rect x="25" y="15" width="70" height="50" rx="8" className="fill-accent/10 stroke-accent/30" strokeWidth="1.5" />
        <rect x="35" y="25" width="50" height="8" rx="3" className="fill-accent/20" />
        <rect x="35" y="38" width="35" height="6" rx="2" className="fill-accent/15" />
        <rect x="35" y="49" width="25" height="6" rx="2" className="fill-accent/10" />
        <circle cx="85" cy="50" r="10" className="fill-success/20 stroke-success/40" strokeWidth="1.5" />
        <path d="M80 50 L84 54 L91 46" className="stroke-success" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
        <circle cx="18" cy="25" r="8" className="fill-accent/15" />
        <path d="M18 21 V29 M14 25 H22" className="stroke-accent/50" strokeWidth="1.5" strokeLinecap="round" />
      </svg>
    );
  }

  if (type === "clients") {
    return (
      <svg viewBox="0 0 120 80" className={shared} fill="none" xmlns="http://www.w3.org/2000/svg">
        <circle cx="40" cy="28" r="10" className="fill-info/20 stroke-info/30" strokeWidth="1.5" />
        <path d="M25 58 C25 45 55 45 55 58" className="fill-info/15 stroke-info/25" strokeWidth="1.5" />
        <circle cx="70" cy="24" r="12" className="fill-info/30 stroke-info/40" strokeWidth="1.5" />
        <path d="M52 58 C52 42 88 42 88 58" className="fill-info/20 stroke-info/30" strokeWidth="1.5" />
        <circle cx="55" cy="35" r="2" className="fill-primary/40" />
        <path d="M42 30 L55 35 L68 26" className="stroke-primary/20" strokeWidth="1" strokeDasharray="3 2" />
        <circle cx="100" cy="20" r="8" className="fill-success/20 stroke-success/30" strokeWidth="1.5" />
        <path d="M100 16 V24 M96 20 H104" className="stroke-success/60" strokeWidth="1.5" strokeLinecap="round" />
      </svg>
    );
  }

  // conversion
  return (
    <svg viewBox="0 0 120 80" className={shared} fill="none" xmlns="http://www.w3.org/2000/svg">
      <path d="M20 10 L100 10 L75 40 L75 65 L45 65 L45 40 Z" className="fill-warning/10 stroke-warning/30" strokeWidth="1.5" strokeLinejoin="round" />
      <path d="M25 15 L95 15" className="stroke-warning/20" strokeWidth="1" />
      <path d="M35 25 L85 25" className="stroke-warning/15" strokeWidth="1" />
      <path d="M42 35 L78 35" className="stroke-warning/10" strokeWidth="1" />
      <path d="M60 55 L60 72" className="stroke-warning/50" strokeWidth="2" strokeLinecap="round" />
      <path d="M55 68 L60 74 L65 68" className="stroke-warning/50" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
      <circle cx="60" cy="45" r="5" className="fill-warning/20 stroke-warning/40" strokeWidth="1.5" />
      <circle cx="60" cy="45" r="2" className="fill-warning/40" />
    </svg>
  );
}

const emptyStates = {
  revenue: {
    icon: TrendingUp,
    title: "Nenhum faturamento registrado",
    description: "Registre sua primeira venda e veja seu faturamento crescer em tempo real.",
    cta: "Registrar Venda",
    href: "/vendas",
    gradient: "from-primary/20 via-primary/5 to-transparent",
    iconGradient: "from-primary to-primary/60",
    glowColor: "shadow-primary/10",
    staggerIndex: 0,
  },
  sales: {
    icon: Plus,
    title: "Sem vendas ainda",
    description: "Comece adicionando deals ao seu pipeline e feche negócios.",
    cta: "Ir ao Pipeline",
    href: "/pipeline",
    gradient: "from-accent/20 via-accent/5 to-transparent",
    iconGradient: "from-accent to-accent/60",
    glowColor: "shadow-accent/10",
    staggerIndex: 1,
  },
  clients: {
    icon: Users,
    title: "Nenhum cliente cadastrado",
    description: "Adicione seus primeiros clientes e comece a construir relacionamentos.",
    cta: "Adicionar Cliente",
    href: "/clientes",
    gradient: "from-info/20 via-info/5 to-transparent",
    iconGradient: "from-info to-info/60",
    glowColor: "shadow-info/10",
    staggerIndex: 2,
  },
  conversion: {
    icon: Target,
    title: "Sem dados de conversão",
    description: "Mova deals pelo pipeline para calcular sua taxa de conversão.",
    cta: "Ver Pipeline",
    href: "/pipeline",
    gradient: "from-warning/20 via-warning/5 to-transparent",
    iconGradient: "from-warning to-warning/60",
    glowColor: "shadow-warning/10",
    staggerIndex: 3,
  },
};

export function DashboardEmptyState({ type }: DashboardEmptyStateProps) {
  const state = emptyStates[type];

  return (
    <motion.div
      initial={{ opacity: 0, y: 16, scale: 0.97 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      transition={{
        duration: 0.45,
        delay: state.staggerIndex * 0.08,
        ease: [0.25, 0.46, 0.45, 0.94],
      }}
      className="h-full"
    >
      <Card className={`border-dashed border-2 border-border/40 bg-card/50 overflow-hidden relative group hover:border-primary/30 hover:shadow-lg hover:${state.glowColor} transition-all duration-300 h-full`}>
        {/* Gradient background */}
        <div className={`absolute inset-0 bg-gradient-to-br ${state.gradient} opacity-60 group-hover:opacity-100 transition-opacity duration-500`} />
        
        {/* Animated border shimmer */}
        <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-700">
          <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-primary/40 to-transparent" />
          <div className="absolute inset-x-0 bottom-0 h-px bg-gradient-to-r from-transparent via-primary/20 to-transparent" />
        </div>
        
        <CardContent className="p-5 sm:p-6 flex flex-col items-center text-center gap-3 relative z-10 h-full justify-center">
          {/* SVG Illustration with float animation */}
          <motion.div
            initial={{ scale: 0.85, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ delay: 0.15 + state.staggerIndex * 0.08, type: "spring", stiffness: 180, damping: 15 }}
            className="w-28 h-20 sm:w-32 sm:h-[88px]"
          >
            <motion.div
              animate={{ y: [0, -4, 0] }}
              transition={{ duration: 3, repeat: Infinity, ease: "easeInOut", delay: state.staggerIndex * 0.5 }}
            >
              <EmptyIllustration type={type} />
            </motion.div>
          </motion.div>
          
          <div className="space-y-1.5">
            <h3 className="text-sm font-bold tracking-tight">{state.title}</h3>
            <p className="text-xs text-muted-foreground/80 max-w-[240px] leading-relaxed">
              {state.description}
            </p>
          </div>
          
          <Button asChild size="sm" variant={type === "revenue" ? "glow-pulse" : "glow"} className="mt-1.5 group/btn shadow-sm">
            <Link to={state.href}>
              <Plus className="h-3.5 w-3.5 mr-1 group-hover/btn:rotate-90 transition-transform duration-200" />
              {state.cta}
            </Link>
          </Button>
        </CardContent>
      </Card>
    </motion.div>
  );
}
