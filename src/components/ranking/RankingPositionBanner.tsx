import { FC, useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Crown, Trophy, TrendingUp, X, ArrowRight } from "lucide-react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import { useMyRankingNotification, useMarkRankingNotificationRead } from "@/hooks/useRankingNotifications";

const fmtBRL = (n: number) =>
  new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL", maximumFractionDigits: 0 }).format(n);

const rankIcon = (rank: number) => {
  if (rank === 1) return <Crown className="h-5 w-5" />;
  if (rank <= 3) return <Trophy className="h-5 w-5" />;
  return <TrendingUp className="h-5 w-5" />;
};

const rankAccent = (rank: number) => {
  if (rank === 1) return "from-yellow-500/20 to-amber-600/10 border-yellow-500/40 text-yellow-500";
  if (rank === 2) return "from-purple-500/20 to-violet-600/10 border-purple-500/40 text-purple-400";
  if (rank === 3) return "from-amber-500/20 to-orange-600/10 border-amber-500/40 text-amber-500";
  return "from-primary/15 to-primary/5 border-primary/30 text-primary";
};

export const RankingPositionBanner: FC<{ className?: string }> = ({ className }) => {
  const { data: notif, isLoading } = useMyRankingNotification();
  const markRead = useMarkRankingNotificationRead();
  const [dismissed, setDismissed] = useState(false);

  useEffect(() => {
    if (notif && !notif.read_at) {
      const t = setTimeout(() => markRead.mutate(notif.id), 4000);
      return () => clearTimeout(t);
    }
  }, [notif?.id]);

  if (isLoading || !notif || dismissed) return null;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0, y: -8 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -8 }}
        transition={{ duration: 0.3 }}
        className={className}
      >
        <Card className={cn(
          "relative overflow-hidden border bg-gradient-to-r p-4",
          rankAccent(notif.rank),
        )}>
          <div className="flex items-center gap-4">
            <div className={cn(
              "h-12 w-12 rounded-xl flex items-center justify-center bg-background/40 backdrop-blur-sm shrink-0",
            )}>
              {rankIcon(notif.rank)}
            </div>

            <div className="flex-1 min-w-0">
              <div className="flex items-baseline gap-2 flex-wrap">
                <span className="font-display text-lg font-semibold text-foreground">
                  #{notif.rank} no ranking
                </span>
                <span className="text-sm text-muted-foreground">
                  • {fmtBRL(notif.total_sales)} este mês
                </span>
              </div>
              <p className="text-sm text-foreground/90 mt-0.5 line-clamp-2">{notif.message}</p>
              {notif.rank > 1 && (
                <div className="flex gap-4 mt-2 text-xs text-muted-foreground">
                  <span>↑ Próximo: <strong className="text-foreground">{fmtBRL(notif.gap_to_next)}</strong></span>
                  <span>👑 Líder: <strong className="text-foreground">{fmtBRL(notif.gap_to_first)}</strong></span>
                </div>
              )}
            </div>

            <div className="flex items-center gap-2 shrink-0">
              <Button asChild size="sm" variant="secondary" className="hidden sm:inline-flex">
                <Link to="/ranking">
                  Ver ranking <ArrowRight className="ml-1 h-3 w-3" />
                </Link>
              </Button>
              <Button
                size="icon"
                variant="ghost"
                className="h-8 w-8"
                onClick={() => setDismissed(true)}
                aria-label="Dispensar"
              >
                <X className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </Card>
      </motion.div>
    </AnimatePresence>
  );
};
