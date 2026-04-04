import { Swords, Shield, Zap } from "lucide-react";
import { motion } from "framer-motion";
import { NeonText } from "./podium/NeonText";
import { PodiumCard } from "./podium/PodiumCard";
import { podiumConfig } from "./podium/podiumConfig";

interface PodiumPerson {
  id: string;
  name: string;
  avatar_url: string | null;
  totalSales: number;
  completedSales: number;
  goalProgress: number;
}

interface RankingPodiumProps {
  top3: PodiumPerson[];
}

export function RankingPodium({ top3 }: RankingPodiumProps) {
  if (top3.length < 3) return null;

  const maxSales = top3[0]?.totalSales || 1;

  return (
    <div className="relative rounded-2xl border border-border/20 overflow-hidden bg-gradient-to-b from-background via-background to-background/95">
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,hsl(var(--primary)/0.08),transparent_60%)]" />
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_bottom,hsl(var(--primary)/0.05),transparent_60%)]" />
      <div className="absolute inset-0 opacity-[0.03] pointer-events-none" style={{ backgroundImage: `linear-gradient(hsl(var(--primary) / 0.3) 1px, transparent 1px), linear-gradient(90deg, hsl(var(--primary) / 0.3) 1px, transparent 1px)`, backgroundSize: "40px 40px" }} />
      <motion.div className="absolute top-0 left-0 right-0 h-[2px]" style={{ background: "linear-gradient(90deg, transparent, hsl(var(--primary) / 0.6), #fbbf24, hsl(var(--primary) / 0.6), transparent)" }} animate={{ opacity: [0.5, 1, 0.5] }} transition={{ duration: 2, repeat: Infinity }} />
      <motion.div className="absolute bottom-0 left-0 right-0 h-[2px]" style={{ background: "linear-gradient(90deg, transparent, hsl(var(--primary) / 0.4), #fbbf24, hsl(var(--primary) / 0.4), transparent)" }} animate={{ opacity: [0.3, 0.8, 0.3] }} transition={{ duration: 3, repeat: Infinity }} />

      {/* Header */}
      <div className="relative px-6 pt-6 pb-2 text-center">
        <motion.div initial={{ opacity: 0, y: -15, scale: 0.9 }} animate={{ opacity: 1, y: 0, scale: 1 }} transition={{ type: "spring", bounce: 0.4 }} className="flex items-center justify-center gap-3 mb-1">
          <motion.div animate={{ rotate: [0, -10, 10, 0] }} transition={{ duration: 2, repeat: Infinity, delay: 1 }}>
            <Swords className="h-5 w-5 text-amber-500" style={{ filter: "drop-shadow(0 0 8px rgba(245,158,11,0.6))" }} />
          </motion.div>
          <div className="flex items-center gap-2">
            <Shield className="h-3.5 w-3.5 text-primary/60" />
            <NeonText color="rgba(251,191,36,0.5)" className="text-sm font-black uppercase tracking-[0.25em] text-amber-500/90">
              Arena dos Campeões
            </NeonText>
            <Shield className="h-3.5 w-3.5 text-primary/60" />
          </div>
          <motion.div animate={{ rotate: [0, 10, -10, 0] }} transition={{ duration: 2, repeat: Infinity, delay: 1.5 }}>
            <Swords className="h-5 w-5 text-amber-500" style={{ filter: "drop-shadow(0 0 8px rgba(245,158,11,0.6))" }} />
          </motion.div>
        </motion.div>
        <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.5 }} className="text-xs text-muted-foreground/50 flex items-center justify-center gap-1 uppercase tracking-widest">
          <Zap className="h-3 w-3 text-amber-500/40" />
          Os guerreiros de elite
          <Zap className="h-3 w-3 text-amber-500/40" />
        </motion.p>
      </div>

      {/* Podium */}
      <div className="relative flex items-end justify-center gap-4 sm:gap-8 px-4 sm:px-10 pb-0 pt-8">
        {podiumConfig.map((config) => {
          const person = top3[config.index];
          if (!person) return null;
          const salesPercent = maxSales > 0 ? (person.totalSales / maxSales) * 100 : 0;
          return <PodiumCard key={person.id} person={person} config={config} salesPercent={salesPercent} />;
        })}
      </div>
    </div>
  );
}
