import { motion } from "framer-motion";
import { differenceInDays, differenceInHours } from "date-fns";
import { Calendar, Clock, Sparkles, ChevronRight } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

interface SeasonalEvent {
  id: string;
  title: string;
  description: string;
  icon: string;
  xp_multiplier: number;
  starts_at: string;
  ends_at: string;
  theme_color?: string;
}

export interface SeasonalEventBannerProps {
  event?: SeasonalEvent;
  onClick?: () => void;
  className?: string;
}

const DEFAULT_EVENT: SeasonalEvent = {
  id: "spring-2026",
  title: "Sprint da Primavera",
  description: "XP em dobro para todas as vendas fechadas!",
  icon: "🌸",
  xp_multiplier: 2,
  starts_at: new Date().toISOString(),
  ends_at: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(),
};

export function SeasonalEventBanner({ event: externalEvent, onClick, className }: SeasonalEventBannerProps) {
  const event = externalEvent || DEFAULT_EVENT;
  const endsAt = new Date(event.ends_at);
  const now = new Date();
  const daysRemaining = differenceInDays(endsAt, now);
  const hoursRemaining = differenceInHours(endsAt, now) % 24;

  const timeText = daysRemaining > 0
    ? `${daysRemaining}d ${hoursRemaining}h restantes`
    : `${hoursRemaining}h restantes`;

  const isUrgent = daysRemaining === 0;

  return (
    <motion.div
      initial={{ opacity: 0, x: -20 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
      className={cn("h-full", className)}
    >
      <Card
        className={cn(
          "relative overflow-hidden cursor-pointer rounded-[2rem] border border-white/[0.05] bg-[#0d1117]/30 backdrop-blur-2xl transition-all duration-700 hover:border-white/[0.1] h-full group",
          isUrgent && "border-primary/30"
        )}
        onClick={onClick}
      >
        <CardContent className="p-8 h-full flex items-center gap-6">
          <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-white/[0.03] border border-white/[0.08] shadow-2xl backdrop-blur-xl group-hover:scale-110 group-hover:rotate-12 transition-all duration-500 shrink-0">
             <span className="text-4xl">{event.icon}</span>
          </div>

          <div className="flex-1 min-w-0 space-y-2">
            <div className="flex items-center gap-3">
              <h3 className="text-lg font-black uppercase tracking-tightest text-white/90">{event.title}</h3>
              <Badge variant="outline" className="rounded-full bg-primary/10 text-primary border-primary/20 text-[10px] font-black uppercase tracking-widest px-3">
                <Sparkles className="h-3 w-3 mr-1" />
                {event.xp_multiplier}x XP Active
              </Badge>
            </div>
            <p className="text-xs font-bold text-white/20 uppercase tracking-widest">{event.description}</p>
            <div className="flex items-center gap-4 pt-1">
              <div className="flex items-center gap-2 px-3 py-1 rounded-full bg-white/[0.03] border border-white/[0.05]">
                <Clock className={cn("h-3 w-3", isUrgent ? "text-primary animate-pulse" : "text-white/20")} />
                <span className={cn("text-[9px] font-black uppercase tracking-widest", isUrgent ? "text-primary" : "text-white/40")}>{timeText}</span>
              </div>
              <div className="flex items-center gap-2 px-3 py-1 rounded-full bg-white/[0.03] border border-white/[0.05]">
                <Calendar className="h-3 w-3 text-white/20" />
                <span className="text-[9px] font-black uppercase tracking-widest text-white/40">Exclusive Rewards</span>
              </div>
            </div>
          </div>

          <div className="h-10 w-10 rounded-full flex items-center justify-center bg-white/[0.03] text-white/20 group-hover:bg-primary/20 group-hover:text-primary transition-all duration-500 shrink-0">
            <ChevronRight className="h-5 w-5" />
          </div>
        </CardContent>
        {/* Animated background glow */}
        <div className="absolute -bottom-12 -right-12 w-32 h-32 bg-primary/10 rounded-full blur-[80px] pointer-events-none group-hover:bg-primary/20 transition-all duration-700" />
      </Card>
    </motion.div>
  );
}
