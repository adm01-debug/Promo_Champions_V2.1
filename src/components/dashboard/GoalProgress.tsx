import { Target, TrendingUp } from "lucide-react";
import { differenceInDays, endOfMonth, format } from "date-fns";
import { ptBR } from "date-fns/locale";

interface GoalProgressProps {
  current: number;
  goal: number;
  label?: string;
  compact?: boolean;
}

export const GoalProgress = ({ current, goal, label, compact = false }: GoalProgressProps) => {
  const now = new Date();
  const monthEnd = endOfMonth(now);
  const daysLeft = Math.max(0, differenceInDays(monthEnd, now));
  const currentMonth = format(now, "MMMM yyyy", { locale: ptBR });
  
  const percentage = goal > 0 ? Math.min((current / goal) * 100, 100) : 0;
  const remaining = Math.max(0, goal - current);

  // Show empty state when no goal is configured
  if (goal === 0) {
    return (
      <div className="glass rounded-xl p-6 h-full border border-border/40 dark:border-glow card-elevated">
        <div className="flex items-center gap-3 mb-6">
          <div className="p-2.5 rounded-xl gradient-primary">
            <Target className="h-5 w-5 text-primary-foreground" />
          </div>
          <div>
            <h3 className="text-lg font-semibold font-display gradient-text">Meta Mensal</h3>
            <p className="text-sm text-muted-foreground capitalize">{currentMonth}</p>
          </div>
        </div>

        <div className="flex flex-col items-center justify-center py-8 text-center">
          <Target className="h-16 w-16 text-muted-foreground/30 mb-4" />
          <h4 className="text-lg font-semibold mb-2">Nenhuma meta configurada</h4>
          <p className="text-sm text-muted-foreground max-w-[200px]">
            Configure metas para seus vendedores na página de Metas
          </p>
        </div>

        <div className="mt-4 flex items-center gap-2 text-sm text-muted-foreground p-2 rounded-lg bg-muted/20 border border-border/30">
          <TrendingUp className="h-4 w-4 text-muted-foreground" />
          <span><span className="font-semibold">{daysLeft} {daysLeft === 1 ? 'dia' : 'dias'}</span> restantes no mês</span>
        </div>
      </div>
    );
  }

  return (
    <div className="glass rounded-xl p-6 h-full border border-border/40 dark:border-glow card-elevated">
      <div className="flex items-center gap-3 mb-6">
        <div className="p-2.5 rounded-xl gradient-primary">
          <Target className="h-5 w-5 text-primary-foreground animate-heartbeat" />
        </div>
        <div>
          <h3 className="text-lg font-semibold font-display gradient-text">Meta Mensal</h3>
          <p className="text-sm text-muted-foreground capitalize">{currentMonth}</p>
        </div>
      </div>

      <div className="relative mb-6">
        <div className="flex justify-center">
          <div className="relative w-48 h-48">
            <svg className="w-full h-full transform -rotate-90" viewBox="0 0 100 100">
              <circle
                cx="50"
                cy="50"
                r="42"
                fill="none"
                stroke="hsl(var(--muted))"
                strokeWidth="8"
                className="opacity-30"
              />
              <circle
                cx="50"
                cy="50"
                r="42"
                fill="none"
                stroke="url(#progressGradient)"
                strokeWidth="8"
                strokeLinecap="round"
                strokeDasharray={`${percentage * 2.64} 264`}
                className="transition-all duration-1000 ease-out"
                style={{ filter: "drop-shadow(0 0 8px hsl(24 95% 55% / 0.4))" }}
              />
              <defs>
                <linearGradient id="progressGradient" x1="0%" y1="0%" x2="100%" y2="0%">
                  <stop offset="0%" stopColor="hsl(24, 95%, 55%)" />
                  <stop offset="100%" stopColor="hsl(340, 80%, 55%)" />
                </linearGradient>
              </defs>
            </svg>
            <div className="absolute inset-0 flex flex-col items-center justify-center">
              <span className="text-3xl font-bold gradient-text font-display">{percentage.toFixed(1)}%</span>
              <span className="text-xs text-muted-foreground uppercase tracking-wider">atingido</span>
            </div>
          </div>
        </div>
      </div>

      <div className="space-y-3">
        <div className="flex justify-between items-center p-3 rounded-xl bg-muted/30 border border-border/40 hover:bg-muted/50 transition-colors">
          <span className="text-sm text-muted-foreground">Atual</span>
          <span className="text-sm font-semibold font-display">
            R$ {current.toLocaleString("pt-BR")}
          </span>
        </div>
        <div className="flex justify-between items-center p-3 rounded-xl bg-muted/30 border border-border/40 hover:bg-muted/50 transition-colors">
          <span className="text-sm text-muted-foreground">Meta</span>
          <span className="text-sm font-semibold font-display">
            R$ {goal.toLocaleString("pt-BR")}
          </span>
        </div>
        <div className="flex justify-between items-center p-3 rounded-xl glass border border-primary/30 hover-lift cursor-pointer">
          <span className="text-sm text-muted-foreground">Faltam</span>
          <span className="text-sm font-bold gradient-text font-display">
            R$ {remaining.toLocaleString("pt-BR")}
          </span>
        </div>
      </div>

      <div className="mt-4 flex items-center gap-2 text-sm text-muted-foreground p-2 rounded-lg bg-status-success/10 border border-status-success/20">
        <TrendingUp className="h-4 w-4 text-status-success animate-heartbeat" />
        <span><span className="font-semibold text-status-success">{daysLeft} {daysLeft === 1 ? 'dia' : 'dias'}</span> restantes para bater a meta</span>
      </div>
    </div>
  );
};
