import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { ArrowRight, Calendar, User } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { cn } from "@/lib/utils";
import { formatBRL, formatDate, getStage } from "@/lib/orderTracking/stages";
import type { TrackingOrder } from "@/hooks/orders/useOrderTracking";

const healthLabel: Record<TrackingOrder["health"], { label: string; tone: "success" | "warning" | "destructive" }> = {
  on_track: { label: "No prazo", tone: "success" },
  at_risk: { label: "Em risco", tone: "warning" },
  delayed: { label: "Atrasado", tone: "destructive" },
};

interface Props {
  order: TrackingOrder;
  index?: number;
}

export function OrderTrackingCard({ order, index = 0 }: Props) {
  const stage = getStage(order.currentStage);
  const StageIcon = stage?.icon;
  const health = healthLabel[order.health];

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.04 }}
    >
      <Link to={`/acompanhamento-pedidos/${order.id}`} className="block group">
        <Card className="hover:border-primary/40 transition-colors">
          <CardContent className="p-5 space-y-4">
            <header className="flex items-start justify-between gap-3">
              <div className="min-w-0">
                <div className="flex items-center gap-2">
                  <span className="font-display text-lg font-semibold text-foreground">
                    #{order.orderNumber}
                  </span>
                  <Badge variant={health.tone}>{health.label}</Badge>
                </div>
                <p className="text-sm text-muted-foreground mt-1 flex items-center gap-1.5 truncate">
                  <User className="h-3.5 w-3.5" />
                  {order.clientName}
                </p>
              </div>
              <div className="text-right shrink-0">
                <p className="font-display text-base font-semibold">{formatBRL(order.totalValue)}</p>
                <p className="text-xs text-muted-foreground flex items-center gap-1 justify-end">
                  <Calendar className="h-3 w-3" /> {formatDate(order.createdAt)}
                </p>
              </div>
            </header>

            <div className="rounded-lg border bg-muted/30 p-3 flex items-center gap-3">
              {StageIcon && (
                <div className="flex h-9 w-9 items-center justify-center rounded-full bg-primary/10 text-primary">
                  <StageIcon className="h-4.5 w-4.5" />
                </div>
              )}
              <div className="min-w-0 flex-1">
                <p className="text-xs uppercase tracking-wider text-muted-foreground">Etapa atual</p>
                <p className="font-medium text-sm truncate">{stage?.label ?? "—"}</p>
              </div>
              <ArrowRight className="h-4 w-4 text-muted-foreground group-hover:text-primary group-hover:translate-x-0.5 transition-all" />
            </div>

            <div className="grid grid-cols-3 gap-3">
              {(["operational", "financial", "post_sale"] as const).map((t) => {
                const labels = { operational: "Operacional", financial: "Financeiro", post_sale: "Pós-venda" };
                const tones = { operational: "bg-primary", financial: "bg-success", post_sale: "bg-warning" };
                const pct = Math.round(order.progressByTrack[t] * 100);
                return (
                  <div key={t}>
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-[10px] uppercase tracking-wider text-muted-foreground">{labels[t]}</span>
                      <span className="text-[10px] font-semibold tabular-nums">{pct}%</span>
                    </div>
                    <Progress value={pct} className={cn("h-1.5", `[&>div]:${tones[t]}`)} />
                  </div>
                );
              })}
            </div>
          </CardContent>
        </Card>
      </Link>
    </motion.div>
  );
}
