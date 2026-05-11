import { Card, CardContent } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { TrendingDown, AlertCircle, ShieldOff } from "lucide-react";
import { motion } from "framer-motion";

interface Props {
  totalLost: number;
  discountLost: number;
  competitorLost: number;
  marginErosion: number;
}

const fmtBRL = (n: number) => 
  new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL", maximumFractionDigits: 0 }).format(n);

export function RevenueLeakageCard({ totalLost, discountLost, competitorLost, marginErosion }: Props) {
  const total = discountLost + competitorLost + marginErosion || 1;

  const items = [
    { label: "Descontos Excessivos", value: discountLost, icon: TrendingDown, color: "text-warning", bg: "bg-warning" },
    { label: "Pressão Competitiva", value: competitorLost, icon: ShieldOff, color: "text-destructive", bg: "bg-destructive" },
    { label: "Erosão de Margem", value: marginErosion, icon: AlertCircle, color: "text-info", bg: "bg-info" },
  ];

  return (
    <Card className="glass border-destructive/20 overflow-hidden">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-0">
        <div className="p-6 bg-destructive/5 border-r border-border/40 flex flex-col justify-center">
          <p className="text-[10px] font-black uppercase tracking-[0.2em] text-destructive">
            Vazamento Total
          </p>
          <motion.p 
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className="text-4xl font-black font-display tracking-tighter text-destructive mt-2"
          >
            {fmtBRL(totalLost)}
          </motion.p>
          <p className="text-xs text-muted-foreground mt-2 italic">
            Receita perdida no período por ineficiência de pricing.
          </p>
        </div>
        <div className="md:col-span-2 p-6 space-y-4">
          {items.map((item, i) => {
            const pct = (item.value / total) * 100;
            return (
              <motion.div
                key={item.label}
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: i * 0.1 }}
              >
                <div className="flex items-center justify-between mb-1.5">
                  <div className="flex items-center gap-2">
                    <item.icon className={`h-3.5 w-3.5 ${item.color}`} />
                    <span className="text-xs font-bold">{item.label}</span>
                  </div>
                  <span className="text-sm font-mono font-black tracking-tight">{fmtBRL(item.value)}</span>
                </div>
                <div className="h-2 w-full bg-muted rounded-full overflow-hidden">
                  <motion.div 
                    initial={{ width: 0 }}
                    animate={{ width: `${pct}%` }}
                    transition={{ duration: 1, delay: i * 0.15 }}
                    className={`h-full ${item.bg} rounded-full`}
                  />
                </div>
              </motion.div>
            );
          })}
        </div>
      </div>
    </Card>
  );
}
