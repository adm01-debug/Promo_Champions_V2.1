import { motion } from "framer-motion";
import { useMemo } from "react";
import { Target, TrendingUp, AlertTriangle, CheckCircle2, Flame, Rocket, Zap } from "lucide-react";
import { useGoalsDashboard } from "@/hooks/useGoalsDashboard";
import { useAuth } from "@/contexts/AuthContext";
import { cn } from "@/lib/utils";

const fmtBRL = (v: number) =>
  `R$ ${v.toLocaleString("pt-BR", {
    maximumFractionDigits: 0,
    notation: v >= 100000 ? "compact" : "standard",
  })}`;

type AlertLevel = "critical" | "warning" | "ontrack" | "exceeded" | "no-goal";

interface AlertConfig {
  level: AlertLevel;
  label: string;
  message: string;
  color: string;
  bgGradient: string;
  border: string;
  glow: string;
  Icon: React.ComponentType<{ className?: string }>;
  ring: string;
}

const buildAlert = (
  progress: number,
  projection: number,
  goal: number,
  daysRemaining: number,
  requiredDaily: number,
): AlertConfig => {
  if (goal <= 0) {
    return {
      level: "no-goal",
      label: "Sem Meta",
      message: "Nenhuma meta definida para este mês. Fale com o gestor.",
      color: "text-muted-foreground",
      bgGradient: "from-muted/20 to-muted/5",
      border: "border-border/40",
      glow: "hsl(var(--muted-foreground) / 0.2)",
      Icon: Target,
      ring: "hsl(var(--muted-foreground))",
    };
  }
  if (progress >= 100) {
    return {
      level: "exceeded",
      label: "Meta Batida",
      message: `🚀 Parabéns! Você superou a meta em ${(progress - 100).toFixed(1)}%. Continue acelerando!`,
      color: "text-success",
      bgGradient: "from-success/20 via-success/10 to-success/5",
      border: "border-success/40",
      glow: "hsl(var(--success) / 0.45)",
      Icon: Rocket,
      ring: "hsl(var(--success))",
    };
  }
  const projPct = (projection / goal) * 100;
  if (projPct >= 100) {
    return {
      level: "ontrack",
      label: "No Ritmo",
      message: `Mantendo este ritmo, você fechará o mês em ${projPct.toFixed(0)}% da meta. Excelente!`,
      color: "text-primary",
      bgGradient: "from-primary/20 via-primary/10 to-primary/5",
      border: "border-primary/40",
      glow: "hsl(var(--primary) / 0.4)",
      Icon: CheckCircle2,
      ring: "hsl(var(--primary))",
    };
  }
  if (projPct >= 80) {
    return {
      level: "warning",
      label: "Atenção",
      message: `Acelere! Faltam ${fmtBRL(goal - projection)} em ${daysRemaining}d. Precisa de ${fmtBRL(requiredDaily)}/dia.`,
      color: "text-warning",
      bgGradient: "from-warning/20 via-warning/10 to-warning/5",
      border: "border-warning/40",
      glow: "hsl(var(--warning) / 0.4)",
      Icon: Flame,
      ring: "hsl(var(--warning))",
    };
  }
  return {
    level: "critical",
    label: "Crítico",
    message: `🔥 Risco alto! Projeção em ${projPct.toFixed(0)}% da meta. Precisa de ${fmtBRL(requiredDaily)}/dia para reverter.`,
    color: "text-destructive",
    bgGradient: "from-destructive/20 via-destructive/10 to-destructive/5",
    border: "border-destructive/40",
    glow: "hsl(var(--destructive) / 0.45)",
    Icon: AlertTriangle,
    ring: "hsl(var(--destructive))",
  };
};

export const MyGoalAlertCard = () => {
  const { salesperson } = useAuth();
  const { data: goalsData, isLoading } = useGoalsDashboard();

  const myGoal = useMemo(() => {
    if (!salesperson?.id || !goalsData) return null;
    return goalsData.salespeople.find((sp) => sp.id === salesperson.id) ?? null;
  }, [salesperson?.id, goalsData]);

  const alert = useMemo(() => {
    if (!myGoal) return null;
    return buildAlert(
      myGoal.progress,
      myGoal.projection,
      myGoal.goalAmount,
      goalsData?.daysRemaining ?? 0,
      myGoal.requiredDailyAverage,
    );
  }, [myGoal, goalsData?.daysRemaining]);

  if (isLoading) {
    return <div className="h-32 rounded-2xl bg-muted/20 animate-pulse" />;
  }

  if (!myGoal || !alert) return null;

  const progressClamped = Math.min(100, myGoal.progress);
  const projectionClamped = Math.min(100, (myGoal.projection / Math.max(1, myGoal.goalAmount)) * 100);
  const Icon = alert.Icon;

  // Ring SVG
  const size = 110;
  const stroke = 9;
  const r = (size - stroke) / 2;
  const cx = size / 2;
  const cy = size / 2;
  const circ = 2 * Math.PI * r;
  const dashOffset = circ * (1 - progressClamped / 100);

  return (
    <motion.section
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      aria-label="Alerta visual da minha meta mensal"
      className="relative"
    >
      {/* Ambient glow */}
      <div
        className="absolute inset-0 rounded-2xl opacity-50 blur-2xl pointer-events-none"
        style={{ background: `radial-gradient(circle at 30% 50%, ${alert.glow}, transparent 70%)` }}
      />

      <div
        className={cn(
          "relative rounded-2xl border-2 backdrop-blur-xl p-5 overflow-hidden bg-gradient-to-br",
          alert.bgGradient,
          alert.border,
        )}
      >
        {/* Grid overlay */}
        <div
          className="absolute inset-0 opacity-[0.05] pointer-events-none"
          style={{
            backgroundImage: `linear-gradient(hsl(var(--foreground)) 1px, transparent 1px), linear-gradient(90deg, hsl(var(--foreground)) 1px, transparent 1px)`,
            backgroundSize: "20px 20px",
          }}
        />

        <div className="relative flex flex-col sm:flex-row items-center gap-5">
          {/* Progress Ring */}
          <div className="relative shrink-0" style={{ width: size, height: size }}>
            <svg width={size} height={size} className="-rotate-90">
              <circle
                cx={cx}
                cy={cy}
                r={r}
                fill="none"
                stroke="hsl(var(--border))"
                strokeOpacity="0.3"
                strokeWidth={stroke}
              />
              <motion.circle
                cx={cx}
                cy={cy}
                r={r}
                fill="none"
                stroke={alert.ring}
                strokeWidth={stroke}
                strokeLinecap="round"
                strokeDasharray={circ}
                initial={{ strokeDashoffset: circ }}
                animate={{ strokeDashoffset: dashOffset }}
                transition={{ duration: 1.4, ease: [0.22, 1, 0.36, 1] }}
                style={{ filter: `drop-shadow(0 0 6px ${alert.glow})` }}
              />
            </svg>
            <div className="absolute inset-0 flex flex-col items-center justify-center">
              <span className={cn("font-display font-black text-2xl tabular-nums leading-none", alert.color)}>
                {Math.round(myGoal.progress)}%
              </span>
              <span className="text-[9px] font-mono uppercase tracking-wider text-muted-foreground mt-1">
                da meta
              </span>
            </div>
          </div>

          {/* Info */}
          <div className="flex-1 min-w-0 w-full">
            {/* Header badge */}
            <div className="flex items-center gap-2 mb-2 flex-wrap">
              <div
                className={cn(
                  "inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-[10px] font-mono font-black uppercase tracking-[0.18em] border",
                  alert.color,
                  alert.border,
                )}
              >
                <Icon className="h-3 w-3" />
                {alert.label}
              </div>
              <span className="text-[10px] font-mono uppercase tracking-wider text-muted-foreground">
                {goalsData?.daysRemaining}d restantes
              </span>
            </div>

            {/* Message */}
            <p className={cn("text-sm font-medium leading-snug mb-3", alert.color)}>{alert.message}</p>

            {/* Metrics grid */}
            <div className="grid grid-cols-3 gap-2 mb-3">
              <Metric label="Atual" value={fmtBRL(myGoal.currentSales)} accent={alert.color} />
              <Metric label="Meta" value={fmtBRL(myGoal.goalAmount)} accent="text-foreground" />
              <Metric label="Projeção" value={fmtBRL(myGoal.projection)} accent={alert.color} icon={TrendingUp} />
            </div>

            {/* Dual progress bar: actual vs projection */}
            <div className="space-y-1.5">
              <div className="relative h-2 rounded-full bg-muted/30 overflow-hidden">
                {/* Projection (background) */}
                <motion.div
                  initial={{ width: 0 }}
                  animate={{ width: `${projectionClamped}%` }}
                  transition={{ duration: 1.2, delay: 0.3 }}
                  className="absolute inset-y-0 left-0 bg-foreground/15 rounded-full"
                />
                {/* Actual */}
                <motion.div
                  initial={{ width: 0 }}
                  animate={{ width: `${progressClamped}%` }}
                  transition={{ duration: 1.4, delay: 0.4, ease: [0.22, 1, 0.36, 1] }}
                  className="absolute inset-y-0 left-0 rounded-full"
                  style={{
                    background: `linear-gradient(90deg, ${alert.ring} 0%, ${alert.ring} 100%)`,
                    boxShadow: `0 0 12px ${alert.glow}`,
                  }}
                />
              </div>
              <div className="flex items-center justify-between text-[10px] font-mono uppercase tracking-wider text-muted-foreground">
                <span className="flex items-center gap-1">
                  <span className="h-1.5 w-1.5 rounded-full" style={{ background: alert.ring }} />
                  Realizado
                </span>
                <span className="flex items-center gap-1">
                  <Zap className="h-2.5 w-2.5" />
                  Necessário/dia: <span className={cn("font-bold", alert.color)}>{fmtBRL(myGoal.requiredDailyAverage)}</span>
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </motion.section>
  );
};

const Metric = ({
  label,
  value,
  accent,
  icon: Icon,
}: {
  label: string;
  value: string;
  accent: string;
  icon?: React.ComponentType<{ className?: string }>;
}) => (
  <div className="rounded-lg bg-background/50 border border-border/40 p-2">
    <div className="text-[9px] font-mono uppercase tracking-wider text-muted-foreground mb-0.5 flex items-center gap-1">
      {Icon && <Icon className="h-2.5 w-2.5" />}
      {label}
    </div>
    <div className={cn("font-mono font-bold text-sm tabular-nums truncate", accent)}>{value}</div>
  </div>
);

export default MyGoalAlertCard;
