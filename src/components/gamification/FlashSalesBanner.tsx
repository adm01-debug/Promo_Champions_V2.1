import { useState, useEffect, useMemo } from "react";
import { motion } from "framer-motion";
import { Clock, Flame, Percent, Zap } from "lucide-react";
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

  const isCritical = useMemo(() =>
    timeLeft.days === 0 && timeLeft.hours < 1,
    [timeLeft.days, timeLeft.hours]
  );

  return (
    <div className={cn(
      "flex items-center gap-1 font-mono text-xs font-bold",
      isUrgent ? "text-destructive" : "text-primary",
      isCritical && "animate-pulse"
    )}>
      <Clock className={cn("h-3 w-3", isCritical && "animate-bounce")} />
      {timeLeft.days > 0 && (
        <span>{timeLeft.days}d</span>
      )}
      <span>
        {String(timeLeft.hours).padStart(2, "0")}:
        {String(timeLeft.minutes).padStart(2, "0")}:
        {String(timeLeft.seconds).padStart(2, "0")}
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
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      className={className}
    >
      <Card className="overflow-hidden border-streak/20 bg-gradient-to-r from-streak/5 via-destructive/5 to-primary-glow/5 h-full">
        <CardContent className="p-4 h-full flex flex-col justify-center">
          {/* Header */}
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2">
              <motion.div
                animate={{ scale: [1, 1.2, 1] }}
                transition={{ duration: 1, repeat: Infinity }}
              >
                <Flame className="h-5 w-5 text-streak" />
              </motion.div>
              <h3 className="font-bold text-sm">Promoção Relâmpago</h3>
              <Badge variant="destructive" className="text-[10px]">
                <Zap className="h-3 w-3 mr-0.5" />
                LIMITADO
              </Badge>
            </div>
          </div>

          {/* Promotion Cards */}
          <div className="space-y-2">
            {promotions.map((promo) => (
              <div
                key={promo.id}
                className="flex items-center gap-3 p-3 rounded-lg bg-background/80 border"
              >
                {/* Discount Badge */}
                <div className="flex-shrink-0 w-12 h-12 rounded-lg bg-destructive/10 flex flex-col items-center justify-center">
                  <Percent className="h-3 w-3 text-destructive" />
                  <span className="text-sm font-bold text-destructive">
                    {promo.discount_percent}
                  </span>
                </div>

                {/* Info */}
                <div className="flex-1 min-w-0">
                  <p className="font-medium text-sm truncate">{promo.title}</p>
                  <div className="flex items-center gap-2 mt-0.5">
                    <span className="text-xs text-muted-foreground line-through">
                      {promo.original_price} 🪙
                    </span>
                    <span className="text-sm font-bold text-primary">
                      {promo.sale_price} 🪙
                    </span>
                  </div>
                  <CountdownTimer endDate={promo.ends_at} />
                </div>

                {/* Buy button */}
                <Button
                  size="sm"
                  variant="default"
                  className="flex-shrink-0"
                  onClick={() => onBuy?.(promo.id)}
                >
                  Comprar
                </Button>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
}
