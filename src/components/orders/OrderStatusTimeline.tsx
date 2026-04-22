import { motion } from "framer-motion";
import { cn } from "@/lib/utils";
import {
  STATUS_STEPS,
  CANCELLED_STEP,
  statusIndex,
  formatDateTime,
  type OrderStatus,
} from "./orderHelpers";
import type { OrderEventRow } from "@/hooks/orders/useOrder";

interface Props {
  currentStatus: OrderStatus;
  events: OrderEventRow[];
  cancellationReason?: string | null;
}

export function OrderStatusTimeline({ currentStatus, events, cancellationReason }: Props) {
  const isCancelled = currentStatus === "cancelled";
  const currentIdx = isCancelled ? STATUS_STEPS.length : statusIndex(currentStatus);

  // Map first event date per status
  const dateByStatus = new Map<OrderStatus, string>();
  for (const ev of events) {
    if (!dateByStatus.has(ev.status)) dateByStatus.set(ev.status, ev.created_at);
  }

  const steps = isCancelled ? [...STATUS_STEPS, CANCELLED_STEP] : STATUS_STEPS;

  return (
    <ol className="relative space-y-6 pl-2">
      {steps.map((step, idx) => {
        const Icon = step.icon;
        const isCurrent = !isCancelled && idx === currentIdx;
        const isDone = !isCancelled && idx < currentIdx;
        const isCancelledStep = isCancelled && step.key === "cancelled";
        const isFuture = !isDone && !isCurrent && !isCancelledStep;
        const ts = dateByStatus.get(step.key);

        return (
          <motion.li
            key={step.key}
            initial={{ opacity: 0, x: -8 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: idx * 0.07 }}
            className="relative flex gap-4"
          >
            {idx < steps.length - 1 && (
              <span
                aria-hidden
                className={cn(
                  "absolute left-[19px] top-10 h-[calc(100%-0.5rem)] w-px",
                  isDone ? "bg-success" : "bg-border"
                )}
              />
            )}
            <div
              className={cn(
                "relative flex h-10 w-10 shrink-0 items-center justify-center rounded-full border transition-colors",
                isDone && "bg-success/15 border-success text-success",
                isCurrent && "bg-primary/15 border-primary text-primary",
                isCancelledStep && "bg-destructive/15 border-destructive text-destructive",
                isFuture && "bg-muted border-border text-muted-foreground"
              )}
            >
              {isCurrent && (
                <span className="absolute inset-0 rounded-full bg-primary/20 animate-ping" aria-hidden />
              )}
              <Icon className="h-5 w-5 relative" />
            </div>
            <div className="flex-1 pt-1.5">
              <p
                className={cn(
                  "font-display font-semibold",
                  isFuture ? "text-muted-foreground" : "text-foreground"
                )}
              >
                {step.label}
              </p>
              <p className="text-xs text-muted-foreground mt-0.5">
                {ts ? formatDateTime(ts) : "—"}
              </p>
              {isCancelledStep && cancellationReason && (
                <p className="text-sm text-destructive mt-1">{cancellationReason}</p>
              )}
            </div>
          </motion.li>
        );
      })}
    </ol>
  );
}
