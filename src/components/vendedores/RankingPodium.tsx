import { Crown, Trophy, Medal, Flame, TrendingUp } from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { cn } from "@/lib/utils";
import { motion } from "framer-motion";

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

const podiumConfig = [
  {
    position: "left" as const,
    rank: 2,
    index: 1,
    podiumHeight: "h-32",
    avatarSize: "h-16 w-16",
    ringClass: "ring-4 ring-slate-300/60",
    glowColor: "rgba(148,163,184,0.3)",
    bgGradient: "from-slate-300 to-slate-500",
    badgeBg: "bg-gradient-to-r from-slate-300 to-slate-400",
    icon: Medal,
    iconColor: "text-slate-300",
    nameSize: "text-sm",
    salesSize: "text-base",
    delay: 0.3,
    label: "2º",
    labelSize: "text-4xl",
  },
  {
    position: "center" as const,
    rank: 1,
    index: 0,
    podiumHeight: "h-44",
    avatarSize: "h-24 w-24",
    ringClass: "ring-4 ring-amber-400/70 shadow-[0_0_30px_rgba(250,204,21,0.4)]",
    glowColor: "rgba(250,204,21,0.4)",
    bgGradient: "from-amber-400 via-yellow-500 to-amber-600",
    badgeBg: "bg-gradient-to-r from-yellow-400 to-amber-500",
    icon: Crown,
    iconColor: "text-amber-400 drop-shadow-[0_0_8px_rgba(250,204,21,0.8)]",
    nameSize: "text-lg",
    salesSize: "text-xl",
    delay: 0.1,
    label: "1º",
    labelSize: "text-5xl",
  },
  {
    position: "right" as const,
    rank: 3,
    index: 2,
    podiumHeight: "h-24",
    avatarSize: "h-14 w-14",
    ringClass: "ring-4 ring-amber-600/50",
    glowColor: "rgba(217,119,6,0.25)",
    bgGradient: "from-amber-600 to-amber-800",
    badgeBg: "bg-gradient-to-r from-amber-600 to-amber-700",
    icon: Trophy,
    iconColor: "text-amber-600",
    nameSize: "text-sm",
    salesSize: "text-base",
    delay: 0.4,
    label: "3º",
    labelSize: "text-3xl",
  },
];

export function RankingPodium({ top3 }: RankingPodiumProps) {
  if (top3.length < 3) return null;

  const maxSales = top3[0]?.totalSales || 1;

  return (
    <div className="relative glass rounded-2xl border border-border/30 overflow-hidden">
      {/* Background effects */}
      <div className="absolute inset-0 bg-gradient-to-b from-amber-500/5 via-transparent to-transparent pointer-events-none" />
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[500px] h-48 bg-amber-500/8 rounded-full blur-[80px] pointer-events-none" />
      <div className="absolute bottom-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-amber-500/20 to-transparent" />

      {/* Header */}
      <div className="relative px-6 pt-6 pb-2 text-center">
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex items-center justify-center gap-2 mb-1"
        >
          <Trophy className="h-5 w-5 text-amber-500" />
          <span className="text-sm font-bold uppercase tracking-widest text-amber-500/80">
            Pódio do Ranking
          </span>
          <Trophy className="h-5 w-5 text-amber-500" />
        </motion.div>
      </div>

      {/* Podium */}
      <div className="relative flex items-end justify-center gap-2 sm:gap-4 px-4 sm:px-8 pb-0 pt-4">
        {podiumConfig.map((config) => {
          const person = top3[config.index];
          if (!person) return null;
          const Icon = config.icon;
          const salesPercent = maxSales > 0 ? (person.totalSales / maxSales) * 100 : 0;

          return (
            <motion.div
              key={person.id}
              initial={{ opacity: 0, y: 50, scale: 0.9 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              transition={{ delay: config.delay, duration: 0.6, type: "spring", bounce: 0.3 }}
              className="flex flex-col items-center flex-1 max-w-[180px]"
            >
              {/* Icon badge */}
              <motion.div
                initial={{ scale: 0, rotate: -20 }}
                animate={{ scale: 1, rotate: 0 }}
                transition={{ delay: config.delay + 0.3, type: "spring", bounce: 0.5 }}
                className="mb-2"
              >
                <Icon className={cn("h-7 w-7", config.iconColor)} />
              </motion.div>

              {/* Avatar with glow */}
              <div className="relative mb-3">
                <div
                  className="absolute -inset-2 rounded-full blur-lg opacity-60 animate-pulse"
                  style={{ background: `radial-gradient(circle, ${config.glowColor}, transparent 70%)` }}
                />
                <Avatar className={cn(config.avatarSize, config.ringClass, "relative shadow-xl")}>
                  <AvatarImage src={person.avatar_url || undefined} alt={person.name} />
                  <AvatarFallback className={cn("bg-gradient-to-br text-white font-bold", config.bgGradient)}>
                    {person.name.split(" ").map(n => n[0]).join("").slice(0, 2)}
                  </AvatarFallback>
                </Avatar>
                {config.rank === 1 && person.goalProgress >= 100 && (
                  <div className="absolute -top-1 -right-1">
                    <Flame className="h-5 w-5 text-orange-500 animate-pulse drop-shadow-[0_0_4px_rgba(249,115,22,0.6)]" />
                  </div>
                )}
              </div>

              {/* Name */}
              <p className={cn("font-bold text-center truncate max-w-[8rem]", config.nameSize)}>
                {person.name.split(" ")[0]}
              </p>

              {/* Sales value */}
              <p className={cn("font-black text-center gradient-text", config.salesSize)}>
                R$ {person.totalSales.toLocaleString("pt-BR", { maximumFractionDigits: 0 })}
              </p>

              {/* Stats row */}
              <div className="flex items-center gap-2 mt-1 mb-3">
                <span className="text-[10px] text-muted-foreground">
                  {person.completedSales} vendas
                </span>
                {person.goalProgress > 0 && (
                  <>
                    <span className="text-muted-foreground/30">•</span>
                    <span className={cn(
                      "text-[10px] font-medium flex items-center gap-0.5",
                      person.goalProgress >= 100 ? "text-green-500" : "text-muted-foreground"
                    )}>
                      <TrendingUp className="h-2.5 w-2.5" />
                      {person.goalProgress.toFixed(0)}%
                    </span>
                  </>
                )}
              </div>

              {/* Podium block */}
              <motion.div
                initial={{ height: 0 }}
                animate={{ height: "auto" }}
                transition={{ delay: config.delay + 0.2, duration: 0.5, ease: "easeOut" }}
                className="w-full overflow-hidden"
              >
                <div
                  className={cn(
                    "w-full rounded-t-2xl flex flex-col items-center justify-center bg-gradient-to-t relative overflow-hidden",
                    config.podiumHeight,
                    config.bgGradient,
                  )}
                >
                  {/* Shimmer effect */}
                  <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent -skew-x-12 animate-shimmer" />

                  {/* Rank number */}
                  <span className={cn("font-black text-white/90 drop-shadow-lg relative z-10", config.labelSize)}>
                    {config.label}
                  </span>

                  {/* Progress bar inside podium */}
                  <div className="w-3/4 h-1.5 bg-white/10 rounded-full mt-2 overflow-hidden relative z-10">
                    <motion.div
                      initial={{ width: 0 }}
                      animate={{ width: `${salesPercent}%` }}
                      transition={{ delay: config.delay + 0.6, duration: 0.8, ease: "easeOut" }}
                      className="h-full bg-white/40 rounded-full"
                    />
                  </div>
                </div>
              </motion.div>
            </motion.div>
          );
        })}
      </div>
    </div>
  );
}
