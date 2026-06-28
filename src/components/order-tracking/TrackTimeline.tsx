import { motion } from "framer-motion";
import { cn } from "@/lib/utils";
import { formatDateTime, type StageDef } from "@/lib/orderTracking/stages";
import type { TrackingStageProgress } from "@/hooks/orders/useOrderTracking";

interface Props {
  title: string;
  stages: StageDef[];
  progress: TrackingStageProgress[];
  accent?: "primary" | "success" | "warning";
}

const accentMap = {
  primary: { done: "bg-primary/15 border-primary text-primary", current: "bg-primary/20 border-primary text-primary", line: "bg-primary" },
  success: { done: "bg-success/15 border-success text-success", current: "bg-success/20 border-success text-success", line: "bg-success" },
  warning: { done: "bg-warning/15 border-warning text-warning", current: "bg-warning/20 border-warning text-warning", line: "bg-warning" },
} as const;

export function TrackTimeline({ title, stages, progress, accent = "primary" }: Props) {
  const tones = accentMap[accent];
  const byKey = new Map(progress.map((p) => [p.key, p]));

  return (
    <div className="space-y-4">
      <h3 className="text-section-title text-foreground">{title}</h3>
      <ol className="relative space-y-5 pl-1">
        {stages.map((step, idx) => {
          const Icon = step.icon;
          const p = byKey.get(step.key);
          const state = p?.state ?? "pending";
          const isDone = state === "done";
          const isCurrent = state === "current";
          const isLast = idx === stages.length - 1;

          return (
            <motion.li
              key={step.key}
              initial={{ opacity: 0, x: -8 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: idx * 0.05 }}
              className="relative flex gap-4"
            >
              {!isLast && (
                <span
                  aria-hidden
                  className={cn(
                    "absolute left-[19px] top-10 h-[calc(100%-0.25rem)] w-px",
                    isDone ? tones.line : "bg-border",
                  )}
                />
              )}
              <div
                className={cn(
                  "relative flex h-10 w-10 shrink-0 items-center justify-center rounded-full border transition-colors",
                  isDone && tones.done,
                  isCurrent && tones.current,
                  !isDone && !isCurrent && "bg-muted border-border text-muted-foreground",
                )}
              >
                {isCurrent && (
                  <span className={cn("absolute inset-0 rounded-full animate-ping", `bg-${accent}/20`)} aria-hidden />
                )}
                <Icon className="h-5 w-5 relative" />
              </div>
              <div className="flex-1 pt-1">
                <div className="flex items-baseline justify-between gap-2">
                  <p className={cn("font-medium text-sm", !isDone && !isCurrent && "text-muted-foreground")}>
                    {step.label}
                  </p>
                  {isCurrent && (
                    <span className="text-[10px] uppercase tracking-wider font-semibold text-primary">
                      Em andamento
                    </span>
                  )}
                </div>
                <p className="text-xs text-muted-foreground">{step.description}</p>
                <p className="text-[11px] text-muted-foreground/80 mt-0.5">
                  {isDone && p?.completedAt
                    ? `Concluído em ${formatDateTime(p.completedAt)}`
                    : isCurrent && p?.startedAt
                      ? `Iniciado em ${formatDateTime(p.startedAt)}`
                      : "Aguardando"}
                </p>
              </div>
            </motion.li>
          );
        })}
      </ol>
    </div>
  );
}
