import { Target, TrendingUp } from "lucide-react";

interface GoalProgressProps {
  current: number;
  goal: number;
}

export const GoalProgress = ({ current, goal }: GoalProgressProps) => {
  const percentage = Math.min((current / goal) * 100, 100);
  const remaining = goal - current;
  const daysLeft = 19;

  return (
    <div className="glass rounded-xl p-6 h-full">
      <div className="flex items-center gap-3 mb-6">
        <div className="p-2.5 rounded-lg gradient-primary">
          <Target className="h-5 w-5 text-primary-foreground" />
        </div>
        <div>
          <h3 className="text-lg font-semibold">Meta Mensal</h3>
          <p className="text-sm text-muted-foreground">Dezembro 2024</p>
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
                stroke="hsl(222, 30%, 14%)"
                strokeWidth="8"
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
              />
              <defs>
                <linearGradient id="progressGradient" x1="0%" y1="0%" x2="100%" y2="0%">
                  <stop offset="0%" stopColor="hsl(24, 100%, 55%)" />
                  <stop offset="100%" stopColor="hsl(280, 80%, 60%)" />
                </linearGradient>
              </defs>
            </svg>
            <div className="absolute inset-0 flex flex-col items-center justify-center">
              <span className="text-3xl font-bold gradient-text">{percentage.toFixed(1)}%</span>
              <span className="text-xs text-muted-foreground">atingido</span>
            </div>
          </div>
        </div>
      </div>

      <div className="space-y-4">
        <div className="flex justify-between items-center p-3 rounded-lg bg-muted/50">
          <span className="text-sm text-muted-foreground">Atual</span>
          <span className="text-sm font-semibold">
            R$ {current.toLocaleString("pt-BR")}
          </span>
        </div>
        <div className="flex justify-between items-center p-3 rounded-lg bg-muted/50">
          <span className="text-sm text-muted-foreground">Meta</span>
          <span className="text-sm font-semibold">
            R$ {goal.toLocaleString("pt-BR")}
          </span>
        </div>
        <div className="flex justify-between items-center p-3 rounded-lg bg-primary/10 border border-primary/20">
          <span className="text-sm text-muted-foreground">Faltam</span>
          <span className="text-sm font-semibold text-primary">
            R$ {remaining.toLocaleString("pt-BR")}
          </span>
        </div>
      </div>

      <div className="mt-4 flex items-center gap-2 text-sm text-muted-foreground">
        <TrendingUp className="h-4 w-4 text-success" />
        <span>{daysLeft} dias restantes para bater a meta</span>
      </div>
    </div>
  );
};
