import { motion } from "framer-motion";
import { Users, Star, Target, Clock, Package, TrendingUp } from "lucide-react";
import { Card } from "@/components/ui/card";

interface ClientOverview360Props {
  data: {
    ltv: number;
    avgTicket: number;
    recency: number;
    orderCount: number;
    lastOrders: { id: string; date: string; value: number; status: string }[];
  };
}

export function ClientOverview360({ data }: ClientOverview360Props) {
  const formatCurrency = (val: number) => 
    new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL', maximumFractionDigits: 0 }).format(val);

  return (
    <Card className="p-8 border-border/40 bg-card/30 backdrop-blur-xl relative overflow-hidden group rounded-3xl">
      <div className="absolute top-0 right-0 w-64 h-64 bg-primary/5 rounded-full blur-3xl -mr-32 -mt-32 transition-transform duration-1000 group-hover:scale-110" />
      
      <div className="flex items-center justify-between mb-8 relative z-10">
        <h3 className="text-lg font-black uppercase italic tracking-tighter flex items-center gap-2">
          <Users className="size-5 text-primary" /> Visão <span className="text-primary">360°</span> do Cliente
        </h3>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8 relative z-10">
        {[
          { label: "LTV", value: formatCurrency(data.ltv), icon: Star, color: "text-amber-500" },
          { label: "Ticket Médio", value: formatCurrency(data.avgTicket), icon: Target, color: "text-blue-500" },
          { label: "Recência", value: `${data.recency} dias`, icon: Clock, color: "text-emerald-500" },
          { label: "Pedidos", value: data.orderCount, icon: Package, color: "text-purple-500" },
        ].map((m, i) => (
          <motion.div 
            key={m.label} 
            initial={{ opacity: 0, y: 10 }} 
            animate={{ opacity: 1, y: 0 }} 
            transition={{ delay: i * 0.1 }} 
            className="p-4 bg-white/5 rounded-2xl border border-white/5 hover:border-primary/20 transition-all"
          >
            <div className="flex items-center gap-2 mb-2">
              <m.icon className={`size-3.5 ${m.color}`} />
              <p className="text-[10px] text-muted-foreground font-black uppercase tracking-widest">{m.label}</p>
            </div>
            <p className="text-xl font-black font-mono tracking-tighter">{m.value}</p>
          </motion.div>
        ))}
      </div>

      <div className="space-y-4 relative z-10">
        <p className="text-[10px] font-black text-muted-foreground uppercase tracking-[0.2em] flex items-center gap-2">
          <TrendingUp className="size-3 text-primary" /> Timeline 5 Últimos Pedidos
        </p>
        <div className="grid grid-cols-1 sm:grid-cols-5 gap-3">
          {data.lastOrders.map((order) => (
            <div key={order.id} className="p-3 bg-black/40 rounded-xl border border-white/5 flex flex-col justify-between group/order hover:border-primary/30 transition-all">
              <p className="text-[9px] text-muted-foreground font-mono">{new Date(order.date).toLocaleDateString('pt-BR')}</p>
              <p className="text-sm font-black text-primary mt-1">{formatCurrency(order.value)}</p>
            </div>
          ))}
        </div>
      </div>
    </Card>
  );
}
