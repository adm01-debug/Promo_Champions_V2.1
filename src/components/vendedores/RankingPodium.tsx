import { Crown, Trophy, Medal, Flame, TrendingUp, Sparkles, Zap, Star } from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { cn } from "@/lib/utils";
import { motion, AnimatePresence } from "framer-motion";
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

// Floating particles component
function FloatingParticles() {
  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none">
      {Array.from({ length: 20 }).map((_, i) => (
        <motion.div
          key={i}
          className="absolute rounded-full"
          style={{
            width: Math.random() * 4 + 2,
            height: Math.random() * 4 + 2,
            left: `${Math.random() * 100}%`,
            top: `${Math.random() * 100}%`,
            background: `hsl(${40 + Math.random() * 20}, ${80 + Math.random() * 20}%, ${60 + Math.random() * 20}%)`,
          }}
          animate={{
            y: [0, -30 - Math.random() * 40, 0],
            x: [0, (Math.random() - 0.5) * 20, 0],
            opacity: [0, 0.8, 0],
            scale: [0, 1.2, 0],
          }}
          transition={{
            duration: 3 + Math.random() * 3,
            repeat: Infinity,
            delay: Math.random() * 4,
            ease: "easeInOut",
          }}
        />
      ))}
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

const podiumConfig = [
  {
    position: "left" as const,
    rank: 2,
    index: 1,
    podiumHeight: "h-36",
    avatarSize: "h-18 w-18",
    ringClass: "ring-[3px] ring-slate-300/80",
    glowColor: "rgba(148,163,184,0.4)",
    bgGradient: "from-slate-400/90 via-slate-300/80 to-slate-500/90",
    badgeBg: "bg-gradient-to-r from-slate-300 to-slate-400",
    icon: Medal,
    iconColor: "text-slate-300",
    nameSize: "text-sm",
    salesSize: "text-lg",
    delay: 0.3,
    label: "2º",
    labelSize: "text-5xl",
    crownGlow: "drop-shadow-[0_0_10px_rgba(148,163,184,0.6)]",
    particleColor: "hsl(210, 20%, 70%)",
  },
  {
    position: "center" as const,
    rank: 1,
    index: 0,
    podiumHeight: "h-52",
    avatarSize: "h-28 w-28",
    ringClass: "ring-[4px] ring-amber-400/90 shadow-[0_0_40px_rgba(250,204,21,0.5)]",
    glowColor: "rgba(250,204,21,0.5)",
    bgGradient: "from-amber-400 via-yellow-400 to-amber-500",
    badgeBg: "bg-gradient-to-r from-yellow-400 to-amber-500",
    icon: Crown,
    iconColor: "text-amber-400",
    nameSize: "text-xl",
    salesSize: "text-2xl",
    delay: 0.1,
    label: "1º",
    labelSize: "text-6xl",
    crownGlow: "drop-shadow-[0_0_15px_rgba(250,204,21,0.9)]",
    particleColor: "hsl(45, 100%, 60%)",
  },
  {
    position: "right" as const,
    rank: 3,
    index: 2,
    podiumHeight: "h-28",
    avatarSize: "h-16 w-16",
    ringClass: "ring-[3px] ring-amber-600/70",
    glowColor: "rgba(217,119,6,0.35)",
    bgGradient: "from-amber-600/90 via-amber-500/80 to-amber-700/90",
    badgeBg: "bg-gradient-to-r from-amber-600 to-amber-700",
    icon: Trophy,
    iconColor: "text-amber-600",
    nameSize: "text-sm",
    salesSize: "text-base",
    delay: 0.4,
    label: "3º",
    labelSize: "text-4xl",
    crownGlow: "drop-shadow-[0_0_8px_rgba(217,119,6,0.5)]",
    particleColor: "hsl(30, 80%, 50%)",
  },
];

export function RankingPodium({ top3 }: RankingPodiumProps) {
  if (top3.length < 3) return null;

  const maxSales = top3[0]?.totalSales || 1;

  return (
    <div className="relative glass rounded-2xl border border-border/30 overflow-hidden">
      {/* Animated background layers */}
      <div className="absolute inset-0 bg-gradient-to-b from-amber-500/8 via-transparent to-transparent pointer-events-none" />
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[600px] h-64 bg-amber-500/10 rounded-full blur-[100px] pointer-events-none" />
      <motion.div
        className="absolute top-10 left-1/4 w-32 h-32 bg-amber-400/5 rounded-full blur-[60px] pointer-events-none"
        animate={{ scale: [1, 1.3, 1], opacity: [0.3, 0.6, 0.3] }}
        transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
      />
      <motion.div
        className="absolute top-10 right-1/4 w-32 h-32 bg-purple-400/5 rounded-full blur-[60px] pointer-events-none"
        animate={{ scale: [1.2, 1, 1.2], opacity: [0.3, 0.5, 0.3] }}
        transition={{ duration: 5, repeat: Infinity, ease: "easeInOut" }}
      />

      {/* Floating particles */}
      <FloatingParticles />

      {/* Bottom glow line */}
      <motion.div
        className="absolute bottom-0 left-0 right-0 h-[2px]"
        style={{
          background: "linear-gradient(90deg, transparent, hsl(var(--primary) / 0.5), hsl(45 100% 60% / 0.6), hsl(var(--primary) / 0.5), transparent)",
        }}
        animate={{ opacity: [0.4, 1, 0.4] }}
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
            <Trophy className="h-6 w-6 text-amber-500 drop-shadow-[0_0_8px_rgba(245,158,11,0.6)]" />
          </motion.div>
          <div className="flex items-center gap-2">
            <Sparkles className="h-4 w-4 text-amber-400/60" />
            <span className="text-sm font-black uppercase tracking-[0.2em] text-amber-500/90">
              Pódio dos Campeões
            </span>
            <Sparkles className="h-4 w-4 text-amber-400/60" />
          </div>
          <motion.div animate={{ rotate: [0, 10, -10, 0] }} transition={{ duration: 2, repeat: Infinity, delay: 1.5 }}>
            <Trophy className="h-6 w-6 text-amber-500 drop-shadow-[0_0_8px_rgba(245,158,11,0.6)]" />
          </motion.div>
        </motion.div>
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.5 }}
          className="text-xs text-muted-foreground/60 flex items-center justify-center gap-1"
        >
          <Zap className="h-3 w-3 text-amber-500/50" />
          Os melhores vendedores em destaque
          <Zap className="h-3 w-3 text-amber-500/50" />
        </motion.p>
      </div>

      {/* Podium */}
      <div className="relative flex items-end justify-center gap-3 sm:gap-6 px-4 sm:px-10 pb-0 pt-6">
        {podiumConfig.map((config) => {
          const person = top3[config.index];
          if (!person) return null;
          const Icon = config.icon;
          const salesPercent = maxSales > 0 ? (person.totalSales / maxSales) * 100 : 0;
          const isChampion = config.rank === 1;

          return (
            <motion.div
              key={person.id}
              initial={{ opacity: 0, y: 60, scale: 0.85 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              transition={{ delay: config.delay, duration: 0.7, type: "spring", bounce: 0.35 }}
              className="flex flex-col items-center flex-1 max-w-[200px] relative"
            >
              {/* Champion crown animation */}
              {isChampion && (
                <motion.div
                  initial={{ scale: 0, y: 10, rotate: -30 }}
                  animate={{ scale: 1, y: 0, rotate: 0 }}
                  transition={{ delay: 0.6, type: "spring", bounce: 0.6 }}
                  className="absolute -top-2 z-20"
                >
                  <motion.div
                    animate={{ y: [0, -4, 0] }}
                    transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
                  >
                    <Crown className={cn("h-10 w-10", config.iconColor, config.crownGlow)} />
                  </motion.div>
                  {/* Crown sparkles */}
                  {[...Array(3)].map((_, i) => (
                    <motion.div
                      key={i}
                      className="absolute"
                      style={{
                        top: `${-5 + i * 3}px`,
                        left: `${10 + i * 8}px`,
                      }}
                      animate={{
                        opacity: [0, 1, 0],
                        scale: [0, 1, 0],
                      }}
                      transition={{
                        duration: 1.5,
                        repeat: Infinity,
                        delay: i * 0.5,
                      }}
                    >
                      <Star className="h-2.5 w-2.5 text-amber-300 fill-amber-300" />
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
                  className="mb-2"
                >
                  <Icon className={cn("h-7 w-7", config.iconColor, config.crownGlow)} />
                </motion.div>
              )}

              {/* Avatar container with orbit ring */}
              <div className={cn("relative mb-3", isChampion ? "mt-10" : "")}>
                {/* Pulsing outer glow */}
                <motion.div
                  className="absolute -inset-3 rounded-full"
                  style={{
                    background: `radial-gradient(circle, ${config.glowColor}, transparent 70%)`,
                  }}
                  animate={{
                    scale: [1, 1.15, 1],
                    opacity: [0.5, 0.8, 0.5],
                  }}
                  transition={{ duration: 2.5, repeat: Infinity, ease: "easeInOut" }}
                />

                {/* Orbiting dot (champion only) */}
                {isChampion && (
                  <motion.div
                    className="absolute inset-[-8px]"
                    animate={{ rotate: 360 }}
                    transition={{ duration: 6, repeat: Infinity, ease: "linear" }}
                  >
                    <div className="absolute top-0 left-1/2 -translate-x-1/2 w-2 h-2 rounded-full bg-amber-400 shadow-[0_0_8px_rgba(250,204,21,0.8)]" />
                  </motion.div>
                )}

                <Avatar className={cn(config.avatarSize, config.ringClass, "relative shadow-2xl z-10")}>
                  <AvatarImage src={person.avatar_url || undefined} alt={person.name} />
                  <AvatarFallback className={cn("bg-gradient-to-br text-white font-bold", config.bgGradient, isChampion ? "text-2xl" : "text-base")}>
                    {person.name.split(" ").map(n => n[0]).join("").slice(0, 2)}
                  </AvatarFallback>
                </Avatar>

                {/* Fire indicator for goal achievers */}
                {person.goalProgress >= 100 && (
                  <motion.div
                    className="absolute -bottom-1 -right-1 z-20"
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    transition={{ delay: config.delay + 0.6, type: "spring" }}
                  >
                    <motion.div animate={{ scale: [1, 1.2, 1] }} transition={{ duration: 0.8, repeat: Infinity }}>
                      <Flame className="h-5 w-5 text-orange-500 drop-shadow-[0_0_6px_rgba(249,115,22,0.7)]" />
                    </motion.div>
                  </motion.div>
                )}

                {/* XP-like level badge */}
                <motion.div
                  className="absolute -bottom-2 left-1/2 -translate-x-1/2 z-20"
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ delay: config.delay + 0.5, type: "spring", bounce: 0.6 }}
                >
                  <div className={cn(
                    "px-2 py-0.5 rounded-full text-[10px] font-black shadow-lg border border-white/20",
                    config.badgeBg, "text-white"
                  )}>
                    #{config.rank}
                  </div>
                </motion.div>
              </div>

              {/* Name */}
              <motion.p
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: config.delay + 0.4 }}
                className={cn("font-bold text-center truncate max-w-[10rem] mt-1", config.nameSize)}
              >
                {person.name.split(" ")[0]}
              </motion.p>

              {/* Sales value with animated counter */}
              <motion.p
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: config.delay + 0.5 }}
                className={cn("font-black text-center gradient-text", config.salesSize)}
              >
                R$ <AnimatedValue value={person.totalSales} />
              </motion.p>

              {/* Stats row with badges */}
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: config.delay + 0.6 }}
                className="flex items-center gap-2 mt-1.5 mb-3"
              >
                <span className="text-[10px] text-muted-foreground bg-muted/50 px-1.5 py-0.5 rounded-full">
                  {person.completedSales} vendas
                </span>
                {person.goalProgress > 0 && (
                  <span className={cn(
                    "text-[10px] font-semibold flex items-center gap-0.5 px-1.5 py-0.5 rounded-full",
                    person.goalProgress >= 100
                      ? "bg-green-500/20 text-green-400"
                      : person.goalProgress >= 80
                        ? "bg-yellow-500/20 text-yellow-400"
                        : "bg-muted/50 text-muted-foreground"
                  )}>
                    <TrendingUp className="h-2.5 w-2.5" />
                    {person.goalProgress.toFixed(0)}%
                  </span>
                )}
              </motion.div>

              {/* Podium block */}
              <motion.div
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: "auto", opacity: 1 }}
                transition={{ delay: config.delay + 0.2, duration: 0.6, ease: "easeOut" }}
                className="w-full overflow-hidden"
              >
                <div
                  className={cn(
                    "w-full rounded-t-2xl flex flex-col items-center justify-center bg-gradient-to-t relative overflow-hidden",
                    config.podiumHeight,
                    config.bgGradient,
                  )}
                >
                  {/* Shimmer sweep effect */}
                  <motion.div
                    className="absolute inset-0 bg-gradient-to-r from-transparent via-white/15 to-transparent -skew-x-12"
                    animate={{ x: ["-200%", "200%"] }}
                    transition={{ duration: 3, repeat: Infinity, repeatDelay: 2, ease: "easeInOut" }}
                  />

                  {/* Vertical light beams */}
                  <div className="absolute inset-0 opacity-20">
                    <div className="absolute left-1/4 top-0 bottom-0 w-px bg-gradient-to-b from-white/0 via-white/40 to-white/0" />
                    <div className="absolute right-1/4 top-0 bottom-0 w-px bg-gradient-to-b from-white/0 via-white/40 to-white/0" />
                  </div>

                  {/* Rank number */}
                  <motion.span
                    className={cn("font-black text-white/90 drop-shadow-lg relative z-10", config.labelSize)}
                    animate={isChampion ? { scale: [1, 1.05, 1] } : {}}
                    transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
                  >
                    {config.label}
                  </motion.span>

                  {/* Progress bar inside podium */}
                  <div className="w-3/4 h-2 bg-white/10 rounded-full mt-2 overflow-hidden relative z-10 backdrop-blur-sm">
                    <motion.div
                      initial={{ width: 0 }}
                      animate={{ width: `${salesPercent}%` }}
                      transition={{ delay: config.delay + 0.8, duration: 1, ease: "easeOut" }}
                      className="h-full rounded-full relative overflow-hidden"
                      style={{
                        background: "linear-gradient(90deg, rgba(255,255,255,0.3), rgba(255,255,255,0.6))",
                      }}
                    >
                      {/* Progress bar glow */}
                      <motion.div
                        className="absolute inset-0 bg-white/20"
                        animate={{ opacity: [0.3, 0.7, 0.3] }}
                        transition={{ duration: 1.5, repeat: Infinity }}
                      />
                    </motion.div>
                  </div>

                  {/* Stars decoration at bottom for champion */}
                  {isChampion && (
                    <div className="flex gap-1 mt-2 relative z-10">
                      {[...Array(5)].map((_, i) => (
                        <motion.div
                          key={i}
                          initial={{ opacity: 0, scale: 0 }}
                          animate={{ opacity: 1, scale: 1 }}
                          transition={{ delay: config.delay + 1 + i * 0.1 }}
                        >
                          <Star className="h-3 w-3 text-white/50 fill-white/30" />
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
