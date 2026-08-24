import { motion } from 'framer-motion';
import { Badge } from '@/components/ui/badge';
import { Eye, Star } from 'lucide-react';
import { cn } from '@/lib/utils';
import { formatCurrency, type SelectedOrder } from './Client360ViewHelpers';

interface OrdersTimelineProps {
  orders: SelectedOrder[];
  averageTicket: number;
  onSelectOrder: (order: SelectedOrder) => void;
}

export function OrdersTimeline({
  orders,
  averageTicket,
  onSelectOrder,
}: OrdersTimelineProps) {
  return (
    <div className="p-8 relative">
      <div className="absolute left-[39px] top-8 bottom-8 w-0.5 bg-gradient-to-b from-primary/50 via-border to-transparent" />
      <div className="space-y-12">
        {orders.map((order, idx) => {
          const isHighValue = Number(order.amount) > averageTicket * 1.5;
          const date = new Date(order.created_at ?? '');
          const month = date.getMonth();
          const isSeasonal = [10, 11, 0].includes(month); // BF and Xmas

          return (
            <motion.div
              key={order.id}
              initial={{ opacity: 0, x: -20 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ delay: idx * 0.05 }}
              className="relative pl-16 group"
            >
              <div
                className={cn(
                  'absolute left-0 top-0 w-5 h-5 rounded-full border-4 border-background z-10 transition-transform group-hover:scale-125 shadow-lg shadow-black/50',
                  order.status === 'completed'
                    ? 'bg-emerald-500'
                    : order.status === 'pending'
                      ? 'bg-amber-500'
                      : 'bg-rose-500'
                )}
              />
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 p-5 rounded-2xl bg-white/5 border border-white/5 hover:border-primary/20 hover:bg-white/[0.08] transition-all relative overflow-hidden">
                {isHighValue && (
                  <div className="absolute top-0 right-0 w-24 h-24 -mr-8 -mt-8 bg-primary/20 blur-2xl rounded-full" />
                )}

                <div className="space-y-1 relative z-10">
                  <div className="flex items-center gap-2">
                    <span className="text-[10px] font-black text-muted-foreground uppercase tracking-widest">
                      {date.toLocaleDateString('pt-BR', {
                        day: '2-digit',
                        month: 'long',
                        year: 'numeric',
                      })}
                    </span>
                    {isSeasonal && (
                      <Badge
                        variant="outline"
                        className="text-[7px] font-black border-amber-500/30 text-amber-500 bg-amber-500/5 px-1 h-3.5"
                      >
                        Sazonalidade Alta
                      </Badge>
                    )}
                  </div>
                  <h4 className="text-sm font-black uppercase text-foreground group-hover:text-primary transition-colors flex items-center gap-2">
                    {order.product_name}
                    {isHighValue && (
                      <Star className="h-3 w-3 text-amber-500 fill-amber-500" />
                    )}
                  </h4>
                  <div className="flex items-center gap-2">
                    <Badge
                      variant="outline"
                      className="text-[8px] font-black border-white/10 uppercase opacity-60"
                    >
                      SKU: {order.sku || 'N/A'}
                    </Badge>
                    <Badge
                      variant="outline"
                      className={cn(
                        'text-[8px] font-black border-none uppercase',
                        order.status === 'completed'
                          ? 'bg-emerald-500/10 text-emerald-500'
                          : order.status === 'pending'
                            ? 'bg-amber-500/10 text-amber-500'
                            : 'bg-rose-500/10 text-rose-500'
                      )}
                    >
                      {order.status}
                    </Badge>
                  </div>
                </div>
                <div className="flex items-center gap-6 relative z-10">
                  <div className="text-right">
                    <span
                      className={cn(
                        'text-lg font-black',
                        isHighValue ? 'text-amber-500' : 'text-primary'
                      )}
                    >
                      {formatCurrency(Number(order.amount))}
                    </span>
                    <p className="text-[9px] font-bold text-muted-foreground uppercase">
                      Valor da Transação
                    </p>
                  </div>
                  <button
                    onClick={() => onSelectOrder(order)}
                    className="p-3 rounded-xl bg-primary/10 border border-primary/20 hover:bg-primary text-primary hover:text-primary-foreground transition-all shadow-lg group/btn"
                  >
                    <Eye className="h-4 w-4 group-hover/btn:scale-110 transition-transform" />
                  </button>
                </div>
              </div>
            </motion.div>
          );
        })}

        {orders.length === 0 && (
          <div className="text-center py-20">
            <p className="text-xs font-bold text-muted-foreground uppercase">
              Nenhum evento na jornada com estes filtros
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
