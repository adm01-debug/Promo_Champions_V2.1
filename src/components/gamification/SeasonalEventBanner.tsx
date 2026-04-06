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
  title: "🌸 Sprint da Primavera",
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
      initial={{ opacity: 0, y: -10 }}
      animate={{ opacity: 1, y: 0 }}
      className={className}
    >
      <Card
        className={cn(
          "cursor-pointer overflow-hidden transition-all hover:shadow-lg border-primary/20 h-full",
          "bg-gradient-to-r from-primary/5 via-primary/10 to-primary/5",
          isUrgent && "border-destructive/30 animate-pulse"
        )}
        onClick={onClick}
      >
        <CardContent className="p-4 h-full flex flex-col justify-center">
          <div className="flex items-center gap-4">
            {/* Icon */}
            <motion.div
              animate={{ rotate: [0, 10, -10, 0] }}
              transition={{ duration: 2, repeat: Infinity, repeatDelay: 3 }}
              className="text-4xl flex-shrink-0"
            >
              {event.icon}
            </motion.div>

            {/* Content */}
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 mb-1">
                <h3 className="font-bold text-sm truncate">{event.title}</h3>
                <Badge variant="secondary" className="text-[10px] bg-primary/20 text-primary">
                  <Sparkles className="h-3 w-3 mr-1" />
                  {event.xp_multiplier}x XP
                </Badge>
              </div>
              <p className="text-xs text-muted-foreground line-clamp-1">{event.description}</p>
              <div className="flex items-center gap-3 mt-1.5">
                <span className={cn(
                  "text-[10px] flex items-center gap-1",
                  isUrgent ? "text-destructive font-medium" : "text-muted-foreground"
                )}>
                  <Clock className="h-3 w-3" />
                  {timeText}
                </span>
                <span className="text-[10px] text-muted-foreground flex items-center gap-1">
                  <Calendar className="h-3 w-3" />
                  Recompensas exclusivas
                </span>
              </div>
            </div>

            {/* Arrow */}
            <ChevronRight className="h-5 w-5 text-muted-foreground flex-shrink-0" />
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
}
