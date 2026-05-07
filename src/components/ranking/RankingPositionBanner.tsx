import { FC, useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Crown, Trophy, TrendingUp, X, ArrowRight } from "lucide-react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
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
          "relative overflow-hidden border bg-gradient-to-r p-5 shadow-lg backdrop-blur-md ring-1 ring-inset ring-white/10",
          rankAccent(notif.rank),
        )}>
          {/* Subtle animated light sweep */}
          <motion.div 
            animate={{ x: ["-100%", "200%"] }}
            transition={{ duration: 3, repeat: Infinity, ease: "linear", repeatDelay: 5 }}
            className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent skew-x-12"
          />

          <div className="flex items-center gap-4 relative z-10">
            <div className={cn(
              "h-14 w-14 rounded-2xl flex items-center justify-center bg-background/60 backdrop-blur-xl shrink-0 shadow-inner border border-white/10",
            )}>
              {rankIcon(notif.rank)}
            </div>

            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 flex-wrap mb-1">
                <span className="font-black text-xl tracking-tight text-foreground uppercase">
                  #{notif.rank} NO RANKING
                </span>
                <Badge variant="outline" className="bg-background/40 border-current/30 font-bold">
                  {fmtBRL(notif.total_sales)} ESTE MÊS
                </Badge>
              </div>
              <p className="text-sm font-medium text-foreground/80 leading-relaxed max-w-2xl">{notif.message}</p>
              
              {notif.rank > 1 && (
                <div className="flex items-center gap-4 mt-3">
                  <div className="flex items-center gap-1.5 px-2 py-1 bg-background/30 rounded-lg border border-white/5">
                    <span className="text-[10px] font-black text-muted-foreground uppercase tracking-wider">Próximo:</span>
                    <span className="text-xs font-bold text-foreground">{fmtBRL(notif.gap_to_next)}</span>
                  </div>
                  <div className="flex items-center gap-1.5 px-2 py-1 bg-background/30 rounded-lg border border-white/5">
                    <span className="text-[10px] font-black text-rank-gold uppercase tracking-wider">Líder:</span>
                    <span className="text-xs font-bold text-rank-gold">{fmtBRL(notif.gap_to_first)}</span>
                  </div>
                </div>
              )}
            </div>

            <div className="flex items-center gap-3 shrink-0 ml-4">
              <Button asChild size="sm" variant="secondary" className="hidden sm:inline-flex font-bold bg-white/10 hover:bg-white/20 border-white/10 text-foreground transition-all duration-300">
                <Link to="/vendedores" className="flex items-center gap-2">
                  VER ARENA <ArrowRight className="h-3 w-3" />
                </Link>
              </Button>
              <Button
                size="icon"
                variant="ghost"
                className="h-9 w-9 hover:bg-white/10 text-foreground/50 hover:text-foreground transition-colors"
                onClick={() => setDismissed(true)}
                aria-label="Dispensar"
              >
                <X className="h-5 w-5" />
              </Button>
            </div>
          </div>
        </Card>
      </motion.div>
    </AnimatePresence>
  );
};
