import { Crown, Flame, TrendingUp, Star } from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { cn } from "@/lib/utils";
import { motion } from "framer-motion";
import React from "react";
import { EnergyParticles } from "./EnergyParticles";
import { HexFrame } from "./HexFrame";
import { AnimatedValue } from "./AnimatedValue";
import { NeonText } from "./NeonText";

interface PodiumPerson {
  id: string;
  name: string;
  avatar_url: string | null;
  totalSales: number;
  completedSales: number;
  goalProgress: number;
}

interface PodiumCardProps {
  person: PodiumPerson;
  config: {
    rank: number;
    podiumHeight: string;
    avatarSize: string;
    hexSize: string;
    neonColor: string;
    glowColor: string;
    bgGradient: string;
    badgeBg: string;
    icon: React.ComponentType<{ className?: string; style?: React.CSSProperties }>;
    iconColor: string;
    nameSize: string;
    salesSize: string;
    salesColor: string;
    delay: number;
    label: string;
    labelSize: string;
    borderColor: string;
    scanlineColor: string;
  };
  salesPercent: number;
}

export const PodiumCard = React.memo(function PodiumCard({ person, config, salesPercent }: PodiumCardProps) {
  const Icon = config.icon;
  const isChampion = config.rank === 1;

  return (
    <motion.div
      initial={{ opacity: 0, y: 80, scale: 0.8 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      transition={{ delay: config.delay, duration: 0.8, type: "spring", bounce: 0.3 }}
      className="flex flex-col items-center flex-1 max-w-[220px] relative"
    >
      {/* Champion crown */}
      {isChampion && (
        <motion.div
          initial={{ scale: 0, y: 20, rotate: -30 }}
          animate={{ scale: 1, y: 0, rotate: 0 }}
          transition={{ delay: 0.6, type: "spring", bounce: 0.6 }}
          className="absolute -top-4 z-20"
        >
          <motion.div animate={{ y: [0, -6, 0] }} transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}>
            <Crown className="h-12 w-12 text-rank-gold" style={{ filter: "drop-shadow(0 0 20px rgba(251,191,36,0.9)) drop-shadow(0 0 40px rgba(251,191,36,0.4))" }} />
          </motion.div>
          {[...Array(4)].map((_, i) => (
            <motion.div
              key={i}
              className="absolute"
              style={{ top: `${-8 + Math.sin(i * 1.5) * 5}px`, left: `${5 + i * 10}px` }}
              animate={{ opacity: [0, 1, 0], scale: [0, 1.2, 0], y: [0, -8, -16] }}
              transition={{ duration: 1.2, repeat: Infinity, delay: i * 0.3 }}
            >
              <Star className="h-2 w-2 text-amber-300 fill-amber-300" />
            </motion.div>
          ))}
        </motion.div>
      )}

      {/* Non-champion icon */}
      {!isChampion && (
        <motion.div
          initial={{ scale: 0, rotate: -20 }}
          animate={{ scale: 1, rotate: 0 }}
          transition={{ delay: config.delay + 0.3, type: "spring", bounce: 0.5 }}
          className="mb-3"
        >
          <Icon className={cn("h-7 w-7", config.iconColor)} style={{ filter: `drop-shadow(0 0 10px ${config.glowColor})` }} />
        </motion.div>
      )}

      {/* Avatar with hexagonal frame */}
      <div className={cn("relative mb-3", isChampion ? "mt-12" : "")}>
        <motion.div
          className="absolute -inset-4 rounded-full"
          style={{ background: `radial-gradient(circle, ${config.glowColor}, transparent 70%)` }}
          animate={{ scale: [1, 1.2, 1], opacity: [0.3, 0.7, 0.3] }}
          transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
        />
        {isChampion && (
          <>
            <motion.div className="absolute inset-[-12px]" animate={{ rotate: 360 }} transition={{ duration: 5, repeat: Infinity, ease: "linear" }}>
              <div className="absolute top-0 left-1/2 -translate-x-1/2 w-2.5 h-2.5 rounded-full bg-rank-gold shadow-[0_0_12px_rgba(250,204,21,0.9)]" />
            </motion.div>
            <motion.div className="absolute inset-[-12px]" animate={{ rotate: -360 }} transition={{ duration: 7, repeat: Infinity, ease: "linear" }}>
              <div className="absolute bottom-0 right-0 w-2 h-2 rounded-full bg-amber-300 shadow-[0_0_8px_rgba(252,211,77,0.8)]" />
            </motion.div>
          </>
        )}
        <HexFrame glowColor={config.neonColor} size={config.hexSize} isChampion={isChampion}>
          <Avatar className={cn(config.avatarSize, "rounded-none w-full h-full")}>
            <AvatarImage src={person.avatar_url || undefined} alt={person.name} className="object-cover" />
            <AvatarFallback className={cn("bg-gradient-to-br text-white font-bold rounded-none w-full h-full", config.bgGradient, isChampion ? "text-3xl" : "text-lg")}>
              {person.name.split(" ").map(n => n[0]).join("").slice(0, 2)}
            </AvatarFallback>
          </Avatar>
        </HexFrame>
        {person.goalProgress >= 100 && (
          <motion.div className="absolute -bottom-1 -right-1 z-20" initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ delay: config.delay + 0.6, type: "spring" }}>
            <motion.div animate={{ scale: [1, 1.3, 1] }} transition={{ duration: 0.6, repeat: Infinity }}>
              <Flame className="h-5 w-5 text-streak" style={{ filter: "drop-shadow(0 0 8px rgba(249,115,22,0.8))" }} />
            </motion.div>
          </motion.div>
        )}
        <motion.div className="absolute -bottom-2 left-1/2 -translate-x-1/2 z-20" initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ delay: config.delay + 0.5, type: "spring", bounce: 0.6 }}>
          <div className={cn("px-2.5 py-1 rounded-lg text-[11px] font-black shadow-lg border text-white", config.badgeBg, config.borderColor)} style={{ boxShadow: `0 0 15px ${config.glowColor}` }}>
            #{config.rank}
          </div>
        </motion.div>
      </div>

      {/* Player name */}
      <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: config.delay + 0.4 }} className={cn("font-black text-center truncate max-w-[10rem] mt-2", config.nameSize)}>
        {person.name.split(" ")[0]}
      </motion.p>

      {/* Sales value */}
      <motion.div initial={{ opacity: 0, scale: 0.8 }} animate={{ opacity: 1, scale: 1 }} transition={{ delay: config.delay + 0.5 }}>
        <NeonText color={config.glowColor} className={cn("font-black text-center block", config.salesSize, config.salesColor)}>
          R$ <AnimatedValue value={person.totalSales} />
        </NeonText>
      </motion.div>

      {/* Stats row */}
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: config.delay + 0.6 }} className="flex items-center gap-2 mt-2 mb-3">
        <span className="text-[10px] text-muted-foreground/70 bg-muted/30 px-2 py-0.5 rounded-md border border-border/20 backdrop-blur-sm">
          {person.completedSales} vendas
        </span>
        {person.goalProgress > 0 && (
          <span className={cn(
            "text-[10px] font-bold flex items-center gap-0.5 px-2 py-0.5 rounded-md border",
            person.goalProgress >= 100 ? "bg-success/15 text-success border-success/30" :
            person.goalProgress >= 80 ? "bg-warning/15 text-coins border-warning/30" :
            "bg-muted/30 text-muted-foreground/70 border-border/20"
          )}>
            <TrendingUp className="h-2.5 w-2.5" />
            {person.goalProgress.toFixed(0)}%
          </span>
        )}
      </motion.div>

      {/* Podium block */}
      <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: "auto", opacity: 1 }} transition={{ delay: config.delay + 0.2, duration: 0.7, ease: [0.22, 1, 0.36, 1] }} className="w-full overflow-hidden">
        <div className={cn("w-full rounded-t-xl flex flex-col items-center justify-center relative overflow-hidden border-t-2", config.podiumHeight, config.borderColor)} style={{ background: `linear-gradient(180deg, ${config.neonColor}22, ${config.neonColor}08)` }}>
          <div className="absolute inset-0 pointer-events-none" style={{ backgroundImage: `repeating-linear-gradient(0deg, ${config.scanlineColor}, ${config.scanlineColor} 1px, transparent 1px, transparent 4px)` }} />
          <div className="absolute left-0 top-4 bottom-4 w-[2px]" style={{ background: `linear-gradient(to bottom, transparent, ${config.neonColor}60, transparent)` }} />
          <div className="absolute right-0 top-4 bottom-4 w-[2px]" style={{ background: `linear-gradient(to bottom, transparent, ${config.neonColor}60, transparent)` }} />
          <div className="absolute top-2 left-2 w-4 h-4 border-t-2 border-l-2 rounded-tl-sm" style={{ borderColor: `${config.neonColor}50` }} />
          <div className="absolute top-2 right-2 w-4 h-4 border-t-2 border-r-2 rounded-tr-sm" style={{ borderColor: `${config.neonColor}50` }} />
          <div className="absolute bottom-2 left-2 w-4 h-4 border-b-2 border-l-2 rounded-bl-sm" style={{ borderColor: `${config.neonColor}30` }} />
          <div className="absolute bottom-2 right-2 w-4 h-4 border-b-2 border-r-2 rounded-br-sm" style={{ borderColor: `${config.neonColor}30` }} />
          <EnergyParticles color={config.neonColor} />
          <motion.div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/5 to-transparent -skew-x-12" animate={{ x: ["-200%", "200%"] }} transition={{ duration: 4, repeat: Infinity, repeatDelay: 3, ease: "easeInOut" }} />
          <motion.span className={cn("font-black relative z-10", config.labelSize)} style={{ color: config.neonColor, textShadow: `0 0 20px ${config.neonColor}80, 0 0 40px ${config.neonColor}40` }} animate={isChampion ? { scale: [1, 1.06, 1] } : {}} transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}>
            {config.label}
          </motion.span>
          <div className="w-3/4 h-1.5 bg-white/5 rounded-full mt-3 overflow-hidden relative z-10 border border-white/5">
            <motion.div initial={{ width: 0 }} animate={{ width: `${salesPercent}%` }} transition={{ delay: config.delay + 0.8, duration: 1.2, ease: "easeOut" }} className="h-full rounded-full relative overflow-hidden" style={{ background: `linear-gradient(90deg, ${config.neonColor}60, ${config.neonColor})`, boxShadow: `0 0 10px ${config.neonColor}60` }}>
              <motion.div className="absolute inset-0" style={{ background: `linear-gradient(90deg, transparent, ${config.neonColor}40, transparent)` }} animate={{ x: ["-100%", "100%"] }} transition={{ duration: 1.5, repeat: Infinity }} />
            </motion.div>
          </div>
          {isChampion && (
            <div className="flex gap-1.5 mt-3 relative z-10">
              {[...Array(5)].map((_, i) => (
                <motion.div key={i} initial={{ opacity: 0, scale: 0, rotate: -30 }} animate={{ opacity: 1, scale: 1, rotate: 0 }} transition={{ delay: config.delay + 1 + i * 0.1, type: "spring" }}>
                  <Star className="h-3.5 w-3.5" style={{ color: config.neonColor, fill: i < 3 ? config.neonColor : "transparent", filter: `drop-shadow(0 0 4px ${config.neonColor}80)` }} />
                </motion.div>
              ))}
            </div>
          )}
        </div>
      </motion.div>
    </motion.div>
  );
});
