import { useState, useEffect, forwardRef } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/contexts/AuthContext";
import { useNavigate } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Check, ChevronRight, Rocket, User, Users, ShoppingBag, Target, X } from "lucide-react";
import { cn } from "@/lib/utils";
import { motion, AnimatePresence } from "framer-motion";

interface Step {
  id: string;
  title: string;
  description: string;
  icon: React.ElementType;
  route: string;
  checkFn: () => Promise<boolean>;
}

export const OnboardingChecklist = forwardRef<HTMLDivElement>(function OnboardingChecklist(_props, ref) {
  const { salesperson } = useAuth();
  const navigate = useNavigate();
  const [dismissed, setDismissed] = useState(false);

  useEffect(() => {
    const d = localStorage.getItem("onboarding-dismissed");
    if (d) setDismissed(true);
  }, []);

  const { data: completionStatus, isLoading } = useQuery({
    queryKey: ["onboarding-status", salesperson?.id],
    queryFn: async () => {
      if (!salesperson?.id) return { profile: false, client: false, sale: false, goal: false };

      const hasProfile = !!(salesperson.name && salesperson.email);

      const { count: clientCount } = await supabase
        .from("clients")
        .select("*", { count: "exact", head: true })
        .limit(1);

      const { count: saleCount } = await supabase
        .from("sales")
        .select("*", { count: "exact", head: true })
        .eq("salesperson_id", salesperson.id)
        .limit(1);

      const { count: goalCount } = await supabase
        .from("sales_goals")
        .select("*", { count: "exact", head: true })
        .eq("salesperson_id", salesperson.id)
        .limit(1);

      return {
        profile: hasProfile,
        client: (clientCount ?? 0) > 0,
        sale: (saleCount ?? 0) > 0,
        goal: (goalCount ?? 0) > 0,
      };
    },
    enabled: !!salesperson?.id,
    staleTime: 1000 * 60 * 10,
  });

  if (!salesperson || dismissed || isLoading) return null;

  const steps: { id: keyof NonNullable<typeof completionStatus>; title: string; description: string; icon: React.ElementType; route: string }[] = [
    { id: "profile", title: "Completar perfil", description: "Nome e email configurados", icon: User, route: "/configuracoes" },
    { id: "client", title: "Primeiro cliente", description: "Cadastre seu primeiro cliente", icon: Users, route: "/clientes" },
    { id: "sale", title: "Primeira venda", description: "Registre sua primeira venda", icon: ShoppingBag, route: "/vendas" },
    { id: "goal", title: "Definir meta", description: "Configure sua meta mensal", icon: Target, route: "/metas" },
  ];

  const completedCount = completionStatus
    ? Object.values(completionStatus).filter(Boolean).length
    : 0;

  const allComplete = completedCount === steps.length;

  if (allComplete) return null;

  const handleDismiss = () => {
    setDismissed(true);
    localStorage.setItem("onboarding-dismissed", "true");
  };

  return (
    <AnimatePresence>
      <motion.div
        ref={ref}
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -20 }}
      >
        <Card className="border-primary/30 bg-gradient-to-br from-primary/5 to-transparent">
          <CardHeader className="pb-2">
            <div className="flex items-center justify-between">
              <CardTitle className="text-sm font-semibold flex items-center gap-2">
                <Rocket className="h-4 w-4 text-primary" />
                Primeiros Passos
                <span className="text-xs text-muted-foreground font-normal">
                  {completedCount}/{steps.length}
                </span>
              </CardTitle>
              <button
                onClick={handleDismiss}
                className="p-1 rounded-full hover:bg-muted transition-colors"
              >
                <X className="h-3.5 w-3.5 text-muted-foreground" />
              </button>
            </div>
            {/* Progress bar */}
            <div className="h-1.5 bg-muted rounded-full overflow-hidden mt-2">
              <motion.div
                className="h-full bg-primary rounded-full"
                initial={{ width: 0 }}
                animate={{ width: `${(completedCount / steps.length) * 100}%` }}
                transition={{ duration: 0.8, ease: "easeOut" }}
              />
            </div>
          </CardHeader>
          <CardContent className="space-y-1.5 pb-3">
            {steps.map((step) => {
              const isComplete = completionStatus?.[step.id] ?? false;
              return (
                <button
                  key={step.id}
                  onClick={() => !isComplete && navigate(step.route)}
                  disabled={isComplete}
                  className={cn(
                    "w-full flex items-center gap-3 p-2.5 rounded-lg text-left transition-all",
                    isComplete
                      ? "opacity-60"
                      : "hover:bg-muted/50 cursor-pointer"
                  )}
                >
                  <div className={cn(
                    "h-7 w-7 rounded-full flex items-center justify-center shrink-0 transition-colors",
                    isComplete
                      ? "bg-success/20 text-success"
                      : "bg-muted text-muted-foreground"
                  )}>
                    {isComplete ? (
                      <Check className="h-3.5 w-3.5" />
                    ) : (
                      <step.icon className="h-3.5 w-3.5" />
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className={cn(
                      "text-sm font-medium",
                      isComplete && "line-through text-muted-foreground"
                    )}>
                      {step.title}
                    </p>
                    <p className="text-[11px] text-muted-foreground truncate">
                      {step.description}
                    </p>
                  </div>
                  {!isComplete && (
                    <ChevronRight className="h-4 w-4 text-muted-foreground shrink-0" />
                  )}
                </button>
              );
            })}
          </CardContent>
        </Card>
      </motion.div>
    </AnimatePresence>
  );
});
