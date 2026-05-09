import { motion } from "framer-motion";
import { Zap, Bell, CheckCircle2, AlertCircle, Info } from "lucide-react";

const activities = [
  { id: 1, type: "success", title: "Deal Closed", desc: "Acme Corp assinou contrato de R$ 250k.", time: "2 min" },
  { id: 2, type: "alert", title: "Risk Detected", desc: "Global Tech mostra sinais de churn precoce.", time: "15 min" },
  { id: 3, type: "info", title: "Insight Found", desc: "SDR João bateu recorde de conversão em calls.", time: "1h" },
  { id: 4, type: "zap", title: "AI Forecast", desc: "Projeção de receita subiu 5.2% para Q3.", time: "2h" },
];

export const ActivityPulse = () => {
  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground flex items-center gap-2">
          <Bell className="size-3" /> Real-time Activity Pulse
        </h3>
        <span className="size-2 rounded-full bg-emerald-500 animate-ping" />
      </div>
      
      <div className="space-y-3 relative before:absolute before:left-[11px] before:top-2 before:bottom-2 before:w-[1px] before:bg-white/5">
        {activities.map((act, i) => (
          <motion.div 
            key={act.id}
            initial={{ opacity: 0, x: -10 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: i * 0.1 }}
            className="relative pl-8 group cursor-pointer"
          >
            <div className={`absolute left-0 top-1 size-6 rounded-full border border-white/10 flex items-center justify-center bg-black transition-colors group-hover:border-primary/50`}>
              {act.type === 'success' && <CheckCircle2 className="size-3 text-emerald-500" />}
              {act.type === 'alert' && <AlertCircle className="size-3 text-rose-500" />}
              {act.type === 'info' && <Info className="size-3 text-blue-500" />}
              {act.type === 'zap' && <Zap className="size-3 text-primary" />}
            </div>
            
            <div className="space-y-1">
              <div className="flex justify-between items-baseline">
                <p className="text-[10px] font-black uppercase tracking-widest text-foreground group-hover:text-primary transition-colors">{act.title}</p>
                <span className="text-[9px] font-bold text-muted-foreground">{act.time}</span>
              </div>
              <p className="text-[11px] text-muted-foreground leading-snug group-hover:text-foreground transition-colors">{act.desc}</p>
            </div>
          </motion.div>
        ))}
      </div>
    </div>
  );
};