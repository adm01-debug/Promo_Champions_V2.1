import { Card } from "@/components/ui/card";
import { Target } from "lucide-react";

interface GoalProgressProps {
  current: number;
  goal: number;
  label?: string;
}

export function GoalProgress({ current, goal, label = "Meta do Mês" }: GoalProgressProps) {
  const percentage = Math.min((current / goal) * 100, 100);
  const remaining = goal - current;
  const isAchieved = current >= goal;

  return (
    <Card className="p-6 shadow-soft overflow-hidden relative">
      <div className="absolute top-0 right-0 w-32 h-32 gradient-primary opacity-5 rounded-full blur-2xl -translate-y-1/2 translate-x-1/2" />
      
      <div className="flex items-center justify-between mb-6">
        <div>
          <h3 className="text-lg font-semibold text-foreground">{label}</h3>
          <p className="text-sm text-muted-foreground">Dezembro 2024</p>
        </div>
        <div className="p-3 rounded-xl bg-primary/10">
          <Target className="h-5 w-5 text-primary" />
        </div>
      </div>

      <div className="space-y-4">
        <div className="flex items-end justify-between">
          <div>
            <p className="text-4xl font-bold text-foreground">
              {new Intl.NumberFormat("pt-BR", {
                style: "currency",
                currency: "BRL",
                minimumFractionDigits: 0,
              }).format(current)}
            </p>
            <p className="text-sm text-muted-foreground mt-1">
              de{" "}
              {new Intl.NumberFormat("pt-BR", {
                style: "currency",
                currency: "BRL",
                minimumFractionDigits: 0,
              }).format(goal)}
            </p>
          </div>
          <div
            className={`text-right px-4 py-2 rounded-xl ${
              isAchieved ? "bg-success/10 text-success" : "bg-secondary text-muted-foreground"
            }`}
          >
            <p className="text-2xl font-bold">{percentage.toFixed(0)}%</p>
          </div>
        </div>

        <div className="relative h-4 bg-secondary rounded-full overflow-hidden">
          <div
            className={`absolute inset-y-0 left-0 rounded-full transition-all duration-1000 ease-out ${
              isAchieved ? "gradient-success" : "gradient-primary"
            }`}
            style={{ width: `${percentage}%` }}
          />
          <div
            className="absolute inset-y-0 rounded-full opacity-30 animate-pulse"
            style={{
              left: `${Math.max(percentage - 5, 0)}%`,
              width: "10%",
              background: isAchieved
                ? "linear-gradient(90deg, transparent, hsl(142 76% 36%), transparent)"
                : "linear-gradient(90deg, transparent, hsl(252 100% 65%), transparent)",
            }}
          />
        </div>

        <div className="flex items-center justify-between text-sm">
          {isAchieved ? (
            <p className="text-success font-medium">🎉 Meta alcançada!</p>
          ) : (
            <p className="text-muted-foreground">
              Faltam{" "}
              <span className="font-semibold text-foreground">
                {new Intl.NumberFormat("pt-BR", {
                  style: "currency",
                  currency: "BRL",
                  minimumFractionDigits: 0,
                }).format(remaining)}
              </span>
            </p>
          )}
          <p className="text-muted-foreground">19 dias restantes</p>
        </div>
      </div>
    </Card>
  );
}