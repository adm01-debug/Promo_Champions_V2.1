import React from "react";
import { motion } from "framer-motion";
import { Crown, Swords, Trophy, TrendingUp, Star, Zap } from "lucide-react";

function FloatingOrb({ delay, x, y, size, color }: { delay: number; x: string; y: string; size: string; color: string }) {
  return (
    <motion.div
      className={`absolute rounded-full blur-2xl pointer-events-none ${color}`}
      style={{ width: size, height: size, left: x, top: y }}
      animate={{ y: [0, -30, 0], opacity: [0.3, 0.6, 0.3], scale: [1, 1.1, 1] }}
      transition={{ duration: 6, repeat: Infinity, delay, ease: "easeInOut" }}
    />
  );
}

function StatBadge({ icon: Icon, label, value, delay }: { icon: any; label: string; value: string; delay: number }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay, duration: 0.5 }}
      className="flex items-center gap-3 px-4 py-3 rounded-2xl bg-background/10 backdrop-blur-md border border-primary-foreground/10"
    >
      <div className="p-2 rounded-xl bg-primary-foreground/10">
        <Icon className="h-4 w-4 text-primary-foreground" />
      </div>
      <div>
        <p className="text-xl font-bold font-display text-primary-foreground">{value}</p>
        <p className="text-[10px] text-primary-foreground/60 uppercase tracking-[0.3em] font-medium">{label}</p>
      </div>
    </motion.div>
  );
}

export const AuthBrandPanel = React.memo(function AuthBrandPanel() {
  return (
    <div className="relative hidden lg:flex lg:w-[52%] bg-gradient-to-br from-primary via-primary/90 to-primary-glow overflow-hidden">
      <FloatingOrb delay={0} x="10%" y="15%" size="180px" color="bg-primary-foreground/5" />
      <FloatingOrb delay={2} x="70%" y="60%" size="220px" color="bg-accent/10" />
      <FloatingOrb delay={4} x="40%" y="80%" size="140px" color="bg-primary-foreground/8" />

      <div className="absolute inset-0 opacity-[0.03]" style={{
        backgroundImage: `linear-gradient(hsl(var(--primary-foreground)) 1px, transparent 1px), linear-gradient(to right, hsl(var(--primary-foreground)) 1px, transparent 1px)`,
        backgroundSize: "40px 40px",
      }} />

      <div className="relative z-10 flex flex-col justify-between p-10 xl:p-14 w-full">
        <motion.div initial={{ opacity: 0, x: -30 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 0.7 }}>
          <div className="flex items-center gap-3 mb-2">
            <div className="p-2.5 rounded-xl bg-primary-foreground/15 backdrop-blur-sm">
              <Crown className="h-7 w-7 text-primary-foreground" />
            </div>
            <div>
              <h1 className="text-2xl font-bold font-display text-primary-foreground tracking-tight">PROMO CHAMPIONS</h1>
              <p className="text-[10px] text-primary-foreground/50 uppercase tracking-[0.3em] font-medium">Realize seus sonhos!</p>
            </div>
          </div>
        </motion.div>

        <div className="flex-1 flex flex-col justify-center -mt-10">
          <motion.h2 initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3, duration: 0.7 }} className="text-4xl xl:text-5xl font-bold font-display text-primary-foreground leading-tight mb-4">
            Transforme sua<br />equipe em{" "}
            <span className="relative">
              <span className="relative z-10">campeões</span>
              <motion.span initial={{ scaleX: 0 }} animate={{ scaleX: 1 }} transition={{ delay: 1, duration: 0.5 }} className="absolute bottom-1 left-0 right-0 h-3 bg-accent/30 -z-0 origin-left rounded" />
            </span>
          </motion.h2>
          <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.6 }} className="text-base text-primary-foreground/60 max-w-md leading-relaxed">
            Gamificação inteligente, analytics avançado e IA para impulsionar o desempenho da sua equipe de vendas.
          </motion.p>
          <div className="flex flex-wrap gap-3 mt-8">
            <StatBadge icon={TrendingUp} label="Aumento médio" value="+34%" delay={0.8} />
            <StatBadge icon={Star} label="Vendedores ativos" value="2.8k" delay={1} />
            <StatBadge icon={Zap} label="Deals fechados" value="45k+" delay={1.2} />
          </div>
        </div>

        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 1.4 }} className="flex items-center gap-6">
          {[
            { icon: Crown, label: "Lenda", gradient: "from-coins to-rank-gold" },
            { icon: Swords, label: "Elite", gradient: "from-primary to-primary-glow" },
            { icon: Trophy, label: "Veterano", gradient: "from-rank-gold to-streak" },
          ].map((rank, i) => (
            <motion.div key={rank.label} initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ delay: 1.5 + i * 0.15, type: "spring", stiffness: 300 }} className="flex flex-col items-center gap-1.5">
              <div className={`p-2.5 rounded-xl bg-gradient-to-br ${rank.gradient} shadow-lg`}>
                <rank.icon className="h-5 w-5 text-primary-foreground" />
              </div>
              <span className="text-[10px] font-semibold text-primary-foreground/50 uppercase tracking-wider">{rank.label}</span>
            </motion.div>
          ))}
        </motion.div>
      </div>
    </div>
  );
});
