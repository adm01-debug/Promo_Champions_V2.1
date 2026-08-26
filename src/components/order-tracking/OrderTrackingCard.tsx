import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { ArrowRight, Calendar, User } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { formatBRL, formatDateTime, statusLabel, statusTone } from "@/components/orders/orderHelpers";
import type { TrackingOrder } from "@/hooks/orders/useOrderTracking";

interface Props {
  order: TrackingOrder;
  index?: number;
}

export function OrderTrackingCard({ order, index = 0 }: Props) {
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
                  <Badge variant={statusTone(order.status)}>{statusLabel(order.status)}</Badge>
                </div>
                <p className="text-sm text-muted-foreground mt-1 flex items-center gap-1.5 truncate">
                  <User className="h-3.5 w-3.5" />
                  {order.clientName ?? "Cliente não informado"}
                </p>
              </div>
              <div className="text-right shrink-0">
                <p className="font-display text-base font-semibold">{formatBRL(order.totalValue)}</p>
                <p className="text-xs text-muted-foreground flex items-center gap-1 justify-end">
                  <Calendar className="h-3 w-3" /> {formatDateTime(order.createdAt)}
                </p>
              </div>
            </header>

            <div className="rounded-lg border bg-muted/30 p-3 flex items-center gap-3">
              <div className="min-w-0 flex-1">
                <p className="text-xs uppercase tracking-wider text-muted-foreground">Última atualização registrada</p>
                <p className="font-medium text-sm truncate">{formatDateTime(order.updatedAt)}</p>
                {order.cancellationReason && (
                  <p className="text-xs text-destructive mt-1 truncate">{order.cancellationReason}</p>
                )}
              </div>
              <ArrowRight className="h-4 w-4 text-muted-foreground group-hover:text-primary group-hover:translate-x-0.5 transition-all" />
            </div>
          </CardContent>
        </Card>
      </Link>
    </motion.div>
  );
}
