import { Crown, Trophy, Medal } from "lucide-react";
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
    rank: 2,
    index: 1,
    height: "h-28",
    avatarSize: "h-16 w-16",
    ringColor: "ring-slate-300",
    bgGradient: "from-slate-400 to-slate-500",
    textSize: "text-3xl",
    icon: Medal,
    iconColor: "text-slate-300",
    delay: 0.2,
    label: "2º",
  },
  {
    rank: 1,
    index: 0,
    height: "h-36",
    avatarSize: "h-20 w-20",
    ringColor: "ring-amber-400",
    bgGradient: "from-amber-400 to-yellow-500",
    textSize: "text-4xl",
    icon: Crown,
    iconColor: "text-amber-400",
    delay: 0,
    label: "1º",
  },
  {
    rank: 3,
    index: 2,
    height: "h-20",
    avatarSize: "h-14 w-14",
    ringColor: "ring-amber-600",
    bgGradient: "from-amber-600 to-amber-700",
    textSize: "text-2xl",
    icon: Trophy,
    iconColor: "text-amber-600",
    delay: 0.3,
    label: "3º",
  },
];

export function RankingPodium({ top3 }: RankingPodiumProps) {
  if (top3.length < 3) return null;

  return (
    <div className="relative glass rounded-2xl border border-border/30 p-6 pt-8 overflow-hidden">
      {/* Background glow effects */}
      <div className="absolute inset-0 bg-gradient-to-b from-amber-500/5 via-transparent to-transparent pointer-events-none" />
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-96 h-40 bg-amber-500/10 rounded-full blur-3xl pointer-events-none" />

      <div className="relative flex items-end justify-center gap-3 sm:gap-6">
        {podiumConfig.map((config) => {
          const person = top3[config.index];
          if (!person) return null;
          const Icon = config.icon;

          return (
            <motion.div
              key={person.id}
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: config.delay, duration: 0.5, type: "spring" }}
              className="flex flex-col items-center"
            >
              {/* Icon */}
              <Icon className={cn("h-6 w-6 mb-2 drop-shadow-lg", config.iconColor)} />

              {/* Avatar */}
              <div className="relative mb-2">
                <Avatar className={cn(config.avatarSize, "ring-4 shadow-xl", config.ringColor)}>
                  <AvatarImage src={person.avatar_url || undefined} alt={person.name} />
                  <AvatarFallback className={cn("bg-gradient-to-br text-white font-bold", config.bgGradient)}>
                    {person.name.split(" ").map(n => n[0]).join("").slice(0, 2)}
                  </AvatarFallback>
                </Avatar>
              </div>

              {/* Name */}
              <p className="text-sm font-semibold text-center truncate max-w-[6rem] mb-1">
                {person.name.split(" ")[0]}
              </p>

              {/* Sales info */}
              <p className="text-[10px] text-muted-foreground mb-2">
                {person.completedSales} vendas
              </p>

              {/* Podium block */}
              <div
                className={cn(
                  "w-20 sm:w-24 rounded-t-xl flex items-center justify-center bg-gradient-to-t shadow-inner",
                  config.height,
                  config.bgGradient
                )}
              >
                <span className={cn("font-black text-white/90 drop-shadow", config.textSize)}>
                  {config.label}
                </span>
              </div>
            </motion.div>
          );
        })}
      </div>
    </div>
  );
}
