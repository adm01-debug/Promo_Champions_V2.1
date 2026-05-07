import { useState, useEffect, useMemo } from "react";
import { motion } from "framer-motion";
import { Clock, Flame, Percent, Zap, ChevronRight } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

interface TimeLeft {
  days: number;
  hours: number;
  minutes: number;
  seconds: number;
}

function calculateTimeLeft(endDate: string): TimeLeft {
  const difference = new Date(endDate).getTime() - new Date().getTime();

  if (difference <= 0) {
    return { days: 0, hours: 0, minutes: 0, seconds: 0 };
  }

  return {
    days: Math.floor(difference / (1000 * 60 * 60 * 24)),
    hours: Math.floor((difference / (1000 * 60 * 60)) % 24),
    minutes: Math.floor((difference / 1000 / 60) % 60),
    seconds: Math.floor((difference / 1000) % 60),
  };
}

function CountdownTimer({ endDate }: { endDate: string }) {
  const [timeLeft, setTimeLeft] = useState<TimeLeft>(() => calculateTimeLeft(endDate));

  useEffect(() => {
    const timer = setInterval(() => {
      setTimeLeft(calculateTimeLeft(endDate));
    }, 1000);

    return () => clearInterval(timer);
  }, [endDate]);

  const isUrgent = useMemo(() =>
    timeLeft.days === 0 && timeLeft.hours < 6,
    [timeLeft.days, timeLeft.hours]
  );

  return (
    <div className={cn(
      "flex items-center gap-2 px-3 py-1 rounded-full bg-white/[0.03] border border-white/[0.05]",
      isUrgent ? "text-primary shadow-[0_0_10px_rgba(var(--primary-rgb),0.2)]" : "text-white/40"
    )}>
      <Clock className={cn("h-3 w-3", isUrgent && "animate-pulse")} />
      <span className="text-[9px] font-black uppercase tracking-widest tabular-nums">
        {timeLeft.days > 0 && `${timeLeft.days}d `}
        {String(timeLeft.hours).padStart(2, "0")}:{String(timeLeft.minutes).padStart(2, "0")}:{String(timeLeft.seconds).padStart(2, "0")}
      </span>
    </div>
  );
}

export interface FlashPromotion {
  id: string;
  title: string;
  description: string;
  discount_percent: number;
  ends_at: string;
  original_price: number;
  sale_price: number;
}

interface FlashSalesBannerProps {
  promotions?: FlashPromotion[];
  onBuy?: (promotionId: string) => void;
  className?: string;
}

const DEFAULT_PROMOS: FlashPromotion[] = [
  { id: "1", title: "Power-Up Velocidade", description: "2x XP por 24h", discount_percent: 50, ends_at: new Date(Date.now() + 3 * 60 * 60 * 1000).toISOString(), original_price: 500, sale_price: 250 },
];

export function FlashSalesBanner({ promotions: externalPromos, onBuy, className }: FlashSalesBannerProps) {
  const promotions = externalPromos || DEFAULT_PROMOS;
  if (promotions.length === 0) return null;

  return (
    <motion.div
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
      className={cn("h-full", className)}
    >
      <Card className="relative overflow-hidden rounded-[2rem] border border-white/[0.05] bg-[#0d1117]/30 backdrop-blur-2xl transition-all duration-700 hover:border-white/[0.1] h-full group">
        <CardContent className="p-8 h-full flex flex-col justify-center">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-primary/10 rounded-lg animate-pulse">
                <Flame className="h-5 w-5 text-primary" />
              </div>
              <h3 className="text-lg font-black uppercase tracking-tightest text-white/90">Temporal Shift</h3>
              <Badge variant="destructive" className="rounded-full bg-primary text-primary-foreground border-none text-[8px] font-black uppercase tracking-widest px-3">
                Limited Burst
              </Badge>
            </div>
          </div>

          <div className="space-y-4">
            {promotions.map((promo) => (
              <div
                key={promo.id}
                className="flex items-center gap-6 p-6 rounded-3xl bg-white/[0.02] border border-white/[0.03] hover:bg-white/[0.05] transition-all duration-500 group/item"
              >
                <div className="flex-shrink-0 w-16 h-16 rounded-2xl bg-primary/10 border border-primary/20 flex flex-col items-center justify-center group-hover/item:scale-110 transition-transform duration-500 shadow-[0_0_20px_rgba(var(--primary-rgb),0.2)]">
                  <Percent className="h-4 w-4 text-primary" />
                  <span className="text-xl font-black text-primary leading-none">
                    {promo.discount_percent}
                  </span>
                </div>

                <div className="flex-1 min-w-0 space-y-2">
                  <p className="text-xs font-black uppercase tracking-tight text-white group-hover/item:text-primary transition-colors">{promo.title}</p>
                  <div className="flex items-center gap-4">
                    <div className="flex flex-col">
                      <span className="text-[9px] font-bold text-white/20 uppercase tracking-widest line-through">
                        {promo.original_price} CR
                      </span>
                      <span className="text-sm font-black text-white tabular-nums tracking-tighter">
                        {promo.sale_price} CR
                      </span>
                    </div>
                    <CountdownTimer endDate={promo.ends_at} />
                  </div>
                </div>

                <Button
                  size="icon"
                  variant="default"
                  className="rounded-2xl h-12 w-12 bg-primary text-primary-foreground shadow-[0_0_15px_rgba(var(--primary-rgb),0.3)] transition-all duration-500 hover:scale-110"
                  onClick={() => onBuy?.(promo.id)}
                >
                  <ChevronRight className="h-6 w-6" />
                </Button>
              </div>
            ))}
          </div>
        </CardContent>
        {/* Animated background glow */}
        <div className="absolute -top-12 -left-12 w-32 h-32 bg-primary/10 rounded-full blur-[80px] pointer-events-none group-hover:bg-primary/20 transition-all duration-700" />
      </Card>
    </motion.div>
  );
}
