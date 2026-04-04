import { Crown, Trophy, Medal, Flame, TrendingUp, Zap, Star, Swords, Shield } from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { cn } from "@/lib/utils";
import { motion } from "framer-motion";
import { useEffect, useState } from "react";

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

// Animated energy particles
function EnergyParticles({ color }: { color: string }) {
  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none">
      {Array.from({ length: 15 }).map((_, i) => (
        <motion.div
          key={i}
          className="absolute rounded-full"
          style={{
            width: Math.random() * 3 + 1,
            height: Math.random() * 3 + 1,
            left: `${Math.random() * 100}%`,
            bottom: `${Math.random() * 40}%`,
            background: color,
            boxShadow: `0 0 6px ${color}`,
          }}
          animate={{
            y: [0, -60 - Math.random() * 80],
            opacity: [0, 1, 0],
            scale: [0, 1.5, 0],
          }}
          transition={{
            duration: 2 + Math.random() * 2,
            repeat: Infinity,
            delay: Math.random() * 3,
            ease: "easeOut",
          }}
        />
      ))}
    </div>
  );
}

// Hexagonal frame for avatar
function HexFrame({ children, glowColor, size, isChampion }: { children: React.ReactNode; glowColor: string; size: string; isChampion?: boolean }) {
  return (
    <div className={cn("relative", size)}>
      {/* Outer hexagon glow */}
      <motion.div
        className="absolute -inset-2 rounded-2xl"
        style={{
          background: `linear-gradient(135deg, ${glowColor}, transparent, ${glowColor})`,
          opacity: 0.6,
          clipPath: "polygon(50% 0%, 100% 25%, 100% 75%, 50% 100%, 0% 75%, 0% 25%)",
        }}
        animate={isChampion ? {
          opacity: [0.4, 0.8, 0.4],
          scale: [1, 1.05, 1],
        } : {}}
        transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
      />
      {/* Inner hexagon */}
      <div
        className="relative w-full h-full overflow-hidden"
        style={{
          clipPath: "polygon(50% 0%, 100% 25%, 100% 75%, 50% 100%, 0% 75%, 0% 25%)",
        }}
      >
        {children}
      </div>
      {/* Corner accents */}
      {isChampion && (
        <>
          <motion.div
            className="absolute -top-1 left-1/2 -translate-x-1/2 w-3 h-3"
            style={{ background: glowColor, clipPath: "polygon(50% 0%, 100% 100%, 0% 100%)" }}
            animate={{ opacity: [0.5, 1, 0.5] }}
            transition={{ duration: 1.5, repeat: Infinity }}
          />
        </>
      )}
    </div>
  );
}

// Animated counter
function AnimatedValue({ value, prefix = "" }: { value: number; prefix?: string }) {
  const [displayValue, setDisplayValue] = useState(0);

  useEffect(() => {
    const duration = 1500;
    const steps = 40;
    const stepDuration = duration / steps;
    let current = 0;
    const increment = value / steps;

    const timer = setInterval(() => {
      current += increment;
      if (current >= value) {
        setDisplayValue(value);
        clearInterval(timer);
      } else {
        setDisplayValue(Math.floor(current));
      }
    }, stepDuration);

    return () => clearInterval(timer);
  }, [value]);

  return (
    <span>
      {prefix}{displayValue.toLocaleString("pt-BR", { maximumFractionDigits: 0 })}
    </span>
  );
}

// Neon text component
function NeonText({ children, color, className }: { children: React.ReactNode; color: string; className?: string }) {
  return (
    <span
      className={cn("relative", className)}
      style={{
        textShadow: `0 0 7px ${color}, 0 0 10px ${color}, 0 0 21px ${color}`,
      }}
    >
      {children}
    </span>
  );
}

const podiumConfig = [
  {
    position: "left" as const,
    rank: 2,
    index: 1,
    podiumHeight: "h-40",
    avatarSize: "h-20 w-20",
    hexSize: "h-24 w-24",
    neonColor: "#a78bfa",
    glowColor: "rgba(167,139,250,0.6)",
    bgGradient: "from-violet-600/90 via-purple-500/80 to-violet-700/90",
    accentGradient: "from-violet-500 to-purple-600",
    badgeBg: "bg-gradient-to-r from-violet-400 to-purple-500",
    icon: Medal,
    iconColor: "text-violet-300",
    nameSize: "text-sm",
    salesSize: "text-lg",
    salesColor: "text-violet-300",
    delay: 0.3,
    label: "2º",
    labelSize: "text-5xl",
    borderColor: "border-violet-500/40",
    scanlineColor: "rgba(167,139,250,0.1)",
  },
  {
    position: "center" as const,
    rank: 1,
    index: 0,
    podiumHeight: "h-56",
    avatarSize: "h-32 w-32",
    hexSize: "h-36 w-36",
    neonColor: "#fbbf24",
    glowColor: "rgba(251,191,36,0.7)",
    bgGradient: "from-amber-500 via-yellow-400 to-amber-600",
    accentGradient: "from-amber-400 to-yellow-500",
    badgeBg: "bg-gradient-to-r from-yellow-400 to-amber-500",
    icon: Crown,
    iconColor: "text-amber-400",
    nameSize: "text-xl",
    salesSize: "text-2xl",
    salesColor: "text-amber-300",
    delay: 0.1,
    label: "1º",
    labelSize: "text-7xl",
    borderColor: "border-amber-400/50",
    scanlineColor: "rgba(251,191,36,0.08)",
  },
  {
    position: "right" as const,
    rank: 3,
    index: 2,
    podiumHeight: "h-32",
    avatarSize: "h-18 w-18",
    hexSize: "h-22 w-22",
    neonColor: "#f97316",
    glowColor: "rgba(249,115,22,0.5)",
    bgGradient: "from-orange-600/90 via-amber-500/80 to-orange-700/90",
    accentGradient: "from-orange-500 to-amber-600",
    badgeBg: "bg-gradient-to-r from-orange-500 to-amber-600",
    icon: Trophy,
    iconColor: "text-orange-400",
    nameSize: "text-sm",
    salesSize: "text-base",
    salesColor: "text-orange-300",
    delay: 0.4,
    label: "3º",
    labelSize: "text-4xl",
    borderColor: "border-orange-500/40",
    scanlineColor: "rgba(249,115,22,0.08)",
  },
];

export function RankingPodium({ top3 }: RankingPodiumProps) {
  if (top3.length < 3) return null;

  const maxSales = top3[0]?.totalSales || 1;

  return (
    <div className="relative rounded-2xl border border-border/20 overflow-hidden bg-gradient-to-b from-background via-background to-background/95">
      {/* Dark arena background */}
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,hsl(var(--primary)/0.08),transparent_60%)]" />
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_bottom,hsl(var(--primary)/0.05),transparent_60%)]" />
      
      {/* Grid overlay */}
      <div
        className="absolute inset-0 opacity-[0.03] pointer-events-none"
        style={{
          backgroundImage: `
            linear-gradient(hsl(var(--primary) / 0.3) 1px, transparent 1px),
            linear-gradient(90deg, hsl(var(--primary) / 0.3) 1px, transparent 1px)
          `,
          backgroundSize: "40px 40px",
        }}
      />

      {/* Top neon accent line */}
      <motion.div
        className="absolute top-0 left-0 right-0 h-[2px]"
        style={{
          background: "linear-gradient(90deg, transparent, hsl(var(--primary) / 0.6), #fbbf24, hsl(var(--primary) / 0.6), transparent)",
        }}
        animate={{ opacity: [0.5, 1, 0.5] }}
        transition={{ duration: 2, repeat: Infinity }}
      />

      {/* Bottom neon accent line */}
      <motion.div
        className="absolute bottom-0 left-0 right-0 h-[2px]"
        style={{
          background: "linear-gradient(90deg, transparent, hsl(var(--primary) / 0.4), #fbbf24, hsl(var(--primary) / 0.4), transparent)",
        }}
        animate={{ opacity: [0.3, 0.8, 0.3] }}
        transition={{ duration: 3, repeat: Infinity }}
      />

      {/* Header */}
      <div className="relative px-6 pt-6 pb-2 text-center">
        <motion.div
          initial={{ opacity: 0, y: -15, scale: 0.9 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          transition={{ type: "spring", bounce: 0.4 }}
          className="flex items-center justify-center gap-3 mb-1"
        >
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
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.5 }}
          className="text-xs text-muted-foreground/50 flex items-center justify-center gap-1 uppercase tracking-widest"
        >
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
          const Icon = config.icon;
          const salesPercent = maxSales > 0 ? (person.totalSales / maxSales) * 100 : 0;
          const isChampion = config.rank === 1;

          return (
            <motion.div
              key={person.id}
              initial={{ opacity: 0, y: 80, scale: 0.8 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              transition={{ delay: config.delay, duration: 0.8, type: "spring", bounce: 0.3 }}
              className="flex flex-col items-center flex-1 max-w-[220px] relative"
            >
              {/* Champion crown - floating with energy */}
              {isChampion && (
                <motion.div
                  initial={{ scale: 0, y: 20, rotate: -30 }}
                  animate={{ scale: 1, y: 0, rotate: 0 }}
                  transition={{ delay: 0.6, type: "spring", bounce: 0.6 }}
                  className="absolute -top-4 z-20"
                >
                  <motion.div
                    animate={{ y: [0, -6, 0] }}
                    transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
                  >
                    <Crown
                      className="h-12 w-12 text-amber-400"
                      style={{ filter: "drop-shadow(0 0 20px rgba(251,191,36,0.9)) drop-shadow(0 0 40px rgba(251,191,36,0.4))" }}
                    />
                  </motion.div>
                  {/* Crown energy sparks */}
                  {[...Array(4)].map((_, i) => (
                    <motion.div
                      key={i}
                      className="absolute"
                      style={{
                        top: `${-8 + Math.sin(i * 1.5) * 5}px`,
                        left: `${5 + i * 10}px`,
                      }}
                      animate={{
                        opacity: [0, 1, 0],
                        scale: [0, 1.2, 0],
                        y: [0, -8, -16],
                      }}
                      transition={{
                        duration: 1.2,
                        repeat: Infinity,
                        delay: i * 0.3,
                      }}
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
                  <Icon
                    className={cn("h-7 w-7", config.iconColor)}
                    style={{ filter: `drop-shadow(0 0 10px ${config.glowColor})` }}
                  />
                </motion.div>
              )}

              {/* Avatar with hexagonal frame */}
              <div className={cn("relative mb-3", isChampion ? "mt-12" : "")}>
                {/* Pulsing energy ring */}
                <motion.div
                  className="absolute -inset-4 rounded-full"
                  style={{
                    background: `radial-gradient(circle, ${config.glowColor}, transparent 70%)`,
                  }}
                  animate={{
                    scale: [1, 1.2, 1],
                    opacity: [0.3, 0.7, 0.3],
                  }}
                  transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
                />

                {/* Orbiting energy (champion) */}
                {isChampion && (
                  <>
                    <motion.div
                      className="absolute inset-[-12px]"
                      animate={{ rotate: 360 }}
                      transition={{ duration: 5, repeat: Infinity, ease: "linear" }}
                    >
                      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-2.5 h-2.5 rounded-full bg-amber-400 shadow-[0_0_12px_rgba(250,204,21,0.9)]" />
                    </motion.div>
                    <motion.div
                      className="absolute inset-[-12px]"
                      animate={{ rotate: -360 }}
                      transition={{ duration: 7, repeat: Infinity, ease: "linear" }}
                    >
                      <div className="absolute bottom-0 right-0 w-2 h-2 rounded-full bg-amber-300 shadow-[0_0_8px_rgba(252,211,77,0.8)]" />
                    </motion.div>
                  </>
                )}

                {/* Hexagonal avatar */}
                <HexFrame glowColor={config.neonColor} size={config.hexSize} isChampion={isChampion}>
                  <Avatar className={cn(config.avatarSize, "rounded-none w-full h-full")}>
                    <AvatarImage src={person.avatar_url || undefined} alt={person.name} className="object-cover" />
                    <AvatarFallback className={cn("bg-gradient-to-br text-white font-bold rounded-none w-full h-full", config.bgGradient, isChampion ? "text-3xl" : "text-lg")}>
                      {person.name.split(" ").map(n => n[0]).join("").slice(0, 2)}
                    </AvatarFallback>
                  </Avatar>
                </HexFrame>

                {/* Fire indicator */}
                {person.goalProgress >= 100 && (
                  <motion.div
                    className="absolute -bottom-1 -right-1 z-20"
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    transition={{ delay: config.delay + 0.6, type: "spring" }}
                  >
                    <motion.div animate={{ scale: [1, 1.3, 1] }} transition={{ duration: 0.6, repeat: Infinity }}>
                      <Flame className="h-5 w-5 text-orange-400" style={{ filter: "drop-shadow(0 0 8px rgba(249,115,22,0.8))" }} />
                    </motion.div>
                  </motion.div>
                )}

                {/* Rank badge */}
                <motion.div
                  className="absolute -bottom-2 left-1/2 -translate-x-1/2 z-20"
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ delay: config.delay + 0.5, type: "spring", bounce: 0.6 }}
                >
                  <div
                    className={cn(
                      "px-2.5 py-1 rounded-lg text-[11px] font-black shadow-lg border text-white",
                      config.badgeBg, config.borderColor
                    )}
                    style={{ boxShadow: `0 0 15px ${config.glowColor}` }}
                  >
                    #{config.rank}
                  </div>
                </motion.div>
              </div>

              {/* Player name */}
              <motion.p
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: config.delay + 0.4 }}
                className={cn("font-black text-center truncate max-w-[10rem] mt-2", config.nameSize)}
              >
                {person.name.split(" ")[0]}
              </motion.p>

              {/* Sales value with neon effect */}
              <motion.div
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: config.delay + 0.5 }}
              >
                <NeonText
                  color={config.glowColor}
                  className={cn("font-black text-center block", config.salesSize, config.salesColor)}
                >
                  R$ <AnimatedValue value={person.totalSales} />
                </NeonText>
              </motion.div>

              {/* Stats row */}
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: config.delay + 0.6 }}
                className="flex items-center gap-2 mt-2 mb-3"
              >
                <span className="text-[10px] text-muted-foreground/70 bg-muted/30 px-2 py-0.5 rounded-md border border-border/20 backdrop-blur-sm">
                  {person.completedSales} vendas
                </span>
                {person.goalProgress > 0 && (
                  <span className={cn(
                    "text-[10px] font-bold flex items-center gap-0.5 px-2 py-0.5 rounded-md border",
                    person.goalProgress >= 100
                      ? "bg-emerald-500/15 text-emerald-400 border-emerald-500/30"
                      : person.goalProgress >= 80
                        ? "bg-yellow-500/15 text-yellow-400 border-yellow-500/30"
                        : "bg-muted/30 text-muted-foreground/70 border-border/20"
                  )}>
                    <TrendingUp className="h-2.5 w-2.5" />
                    {person.goalProgress.toFixed(0)}%
                  </span>
                )}
              </motion.div>

              {/* Podium block - Gaming style */}
              <motion.div
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: "auto", opacity: 1 }}
                transition={{ delay: config.delay + 0.2, duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
                className="w-full overflow-hidden"
              >
                <div
                  className={cn(
                    "w-full rounded-t-xl flex flex-col items-center justify-center relative overflow-hidden border-t-2",
                    config.podiumHeight,
                    config.borderColor
                  )}
                  style={{
                    background: `linear-gradient(180deg, ${config.neonColor}22, ${config.neonColor}08)`,
                  }}
                >
                  {/* Scanline effect */}
                  <div
                    className="absolute inset-0 pointer-events-none"
                    style={{
                      backgroundImage: `repeating-linear-gradient(0deg, ${config.scanlineColor}, ${config.scanlineColor} 1px, transparent 1px, transparent 4px)`,
                    }}
                  />

                  {/* Side accent lines */}
                  <div className="absolute left-0 top-4 bottom-4 w-[2px]" style={{ background: `linear-gradient(to bottom, transparent, ${config.neonColor}60, transparent)` }} />
                  <div className="absolute right-0 top-4 bottom-4 w-[2px]" style={{ background: `linear-gradient(to bottom, transparent, ${config.neonColor}60, transparent)` }} />

                  {/* Corner brackets */}
                  <div className="absolute top-2 left-2 w-4 h-4 border-t-2 border-l-2 rounded-tl-sm" style={{ borderColor: `${config.neonColor}50` }} />
                  <div className="absolute top-2 right-2 w-4 h-4 border-t-2 border-r-2 rounded-tr-sm" style={{ borderColor: `${config.neonColor}50` }} />
                  <div className="absolute bottom-2 left-2 w-4 h-4 border-b-2 border-l-2 rounded-bl-sm" style={{ borderColor: `${config.neonColor}30` }} />
                  <div className="absolute bottom-2 right-2 w-4 h-4 border-b-2 border-r-2 rounded-br-sm" style={{ borderColor: `${config.neonColor}30` }} />

                  {/* Energy particles inside podium */}
                  <EnergyParticles color={config.neonColor} />

                  {/* Shimmer effect */}
                  <motion.div
                    className="absolute inset-0 bg-gradient-to-r from-transparent via-white/5 to-transparent -skew-x-12"
                    animate={{ x: ["-200%", "200%"] }}
                    transition={{ duration: 4, repeat: Infinity, repeatDelay: 3, ease: "easeInOut" }}
                  />

                  {/* Rank number */}
                  <motion.span
                    className={cn("font-black relative z-10", config.labelSize)}
                    style={{
                      color: `${config.neonColor}`,
                      textShadow: `0 0 20px ${config.neonColor}80, 0 0 40px ${config.neonColor}40`,
                    }}
                    animate={isChampion ? { scale: [1, 1.06, 1] } : {}}
                    transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
                  >
                    {config.label}
                  </motion.span>

                  {/* Power bar */}
                  <div className="w-3/4 h-1.5 bg-white/5 rounded-full mt-3 overflow-hidden relative z-10 border border-white/5">
                    <motion.div
                      initial={{ width: 0 }}
                      animate={{ width: `${salesPercent}%` }}
                      transition={{ delay: config.delay + 0.8, duration: 1.2, ease: "easeOut" }}
                      className="h-full rounded-full relative overflow-hidden"
                      style={{
                        background: `linear-gradient(90deg, ${config.neonColor}60, ${config.neonColor})`,
                        boxShadow: `0 0 10px ${config.neonColor}60`,
                      }}
                    >
                      <motion.div
                        className="absolute inset-0"
                        style={{ background: `linear-gradient(90deg, transparent, ${config.neonColor}40, transparent)` }}
                        animate={{ x: ["-100%", "100%"] }}
                        transition={{ duration: 1.5, repeat: Infinity }}
                      />
                    </motion.div>
                  </div>

                  {/* Stars for champion */}
                  {isChampion && (
                    <div className="flex gap-1.5 mt-3 relative z-10">
                      {[...Array(5)].map((_, i) => (
                        <motion.div
                          key={i}
                          initial={{ opacity: 0, scale: 0, rotate: -30 }}
                          animate={{ opacity: 1, scale: 1, rotate: 0 }}
                          transition={{ delay: config.delay + 1 + i * 0.1, type: "spring" }}
                        >
                          <Star
                            className="h-3.5 w-3.5"
                            style={{
                              color: config.neonColor,
                              fill: i < 3 ? config.neonColor : "transparent",
                              filter: `drop-shadow(0 0 4px ${config.neonColor}80)`,
                            }}
                          />
                        </motion.div>
                      ))}
                    </div>
                  )}
                </div>
              </motion.div>
            </motion.div>
          );
        })}
      </div>
    </div>
  );
}
