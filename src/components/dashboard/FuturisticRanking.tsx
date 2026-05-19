import { motion, AnimatePresence } from "framer-motion";
import { Trophy, ChevronUp, ChevronDown, Minus, Crown, Medal, Award, Zap } from "lucide-react";
import { useFuturisticRanking, type RankingRow } from "@/hooks/gamification/useFuturisticRanking";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { cn } from "@/lib/utils";
import { useMemo } from "react";

const fmtBRL = (v: number) =>
  `R$ ${v.toLocaleString("pt-BR", {
    maximumFractionDigits: 0,
    notation: v >= 100000 ? "compact" : "standard",
  })}`;

const positionAccent = (pos: number) => {
  if (pos === 1) return { color: "text-warning", glow: "hsl(var(--warning) / 0.4)", icon: Crown };
  if (pos === 2) return { color: "text-muted-foreground", glow: "hsl(var(--muted-foreground) / 0.3)", icon: Medal };
  if (pos === 3) return { color: "text-accent", glow: "hsl(var(--accent) / 0.4)", icon: Award };
  return { color: "text-primary", glow: "hsl(var(--primary) / 0.25)", icon: Trophy };
};

const DeltaBadge = ({ delta }: { delta: number | null }) => {
  if (delta === null) {
    return (
      <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded-md text-[10px] font-mono font-bold bg-primary/10 text-primary border border-primary/30">
        <Zap className="h-2.5 w-2.5" />
        NEW
      </span>
    );
  }
  if (delta === 0) {
    return (
      <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded-md text-[10px] font-mono font-bold bg-muted/40 text-muted-foreground border border-border/40">
        <Minus className="h-2.5 w-2.5" />
        0
      </span>
    );
  }
  const up = delta > 0;
  return (
    <span
      className={cn(
        "inline-flex items-center gap-0.5 px-1.5 py-0.5 rounded-md text-[10px] font-mono font-bold border",
        up
          ? "bg-success/10 text-success border-success/30"
          : "bg-destructive/10 text-destructive border-destructive/30",
      )}
    >
      {up ? <ChevronUp className="h-2.5 w-2.5" /> : <ChevronDown className="h-2.5 w-2.5" />}
      {Math.abs(delta)}
    </span>
  );
};

const RankingRowCard = ({ row, maxRevenue, index }: { row: RankingRow; maxRevenue: number; index: number }) => {
  const accent = positionAccent(row.position);
  const Icon = accent.icon;
  const pct = maxRevenue > 0 ? (row.revenue / maxRevenue) * 100 : 0;
  const isTop3 = row.position <= 3;

  return (
    <motion.div
      layout
      initial={{ opacity: 0, x: -20 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ duration: 0.4, delay: index * 0.04, ease: [0.22, 1, 0.36, 1] }}
      className="relative group"
    >
      {isTop3 && (
        <div
          className="absolute inset-0 rounded-xl opacity-30 blur-xl pointer-events-none transition-opacity group-hover:opacity-60"
          style={{ background: `radial-gradient(circle at 0% 50%, ${accent.glow}, transparent 60%)` }}
        />
      )}
      <div
        className={cn(
          "relative flex items-center gap-3 p-3 rounded-xl border bg-gradient-to-r from-card/95 to-card/70 backdrop-blur-xl transition-all hover:border-primary/40",
          isTop3 ? "border-border/60" : "border-border/40",
        )}
      >
        {/* Position number */}
        <div className="relative flex flex-col items-center justify-center w-10 shrink-0">
          <div
            className={cn(
              "font-mono font-black text-2xl tabular-nums leading-none",
              accent.color,
            )}
          >
            {String(row.position).padStart(2, "0")}
          </div>
          {isTop3 && <Icon className={cn("h-3 w-3 mt-0.5", accent.color)} />}
        </div>

        {/* Avatar */}
        <Avatar className="h-9 w-9 border border-border/50 shrink-0">
          {row.avatarUrl && <AvatarImage src={row.avatarUrl} alt={row.name} />}
          <AvatarFallback className="text-xs font-bold bg-muted/40">
            {row.name.slice(0, 2).toUpperCase()}
          </AvatarFallback>
        </Avatar>

        {/* Info */}
        <div className="flex-1 min-w-0">
          <div className="flex items-center justify-between gap-2 mb-1">
            <span className="font-semibold text-sm truncate">{row.name}</span>
            <DeltaBadge delta={row.delta} />
          </div>
          {/* Progress bar */}
          <div className="relative h-1 bg-muted/30 rounded-full overflow-hidden">
            <motion.div
              initial={{ width: 0 }}
              animate={{ width: `${pct}%` }}
              transition={{ duration: 1, delay: 0.2 + index * 0.04, ease: [0.22, 1, 0.36, 1] }}
              className={cn(
                "absolute inset-y-0 left-0 rounded-full",
                row.position === 1
                  ? "bg-gradient-to-r from-warning via-warning to-warning/70"
                  : row.position === 2
                  ? "bg-gradient-to-r from-muted-foreground/60 to-muted-foreground"
                  : row.position === 3
                  ? "bg-gradient-to-r from-accent to-accent/70"
                  : "bg-gradient-to-r from-primary/60 to-primary",
              )}
            />
          </div>
          <div className="flex items-center justify-between mt-1.5 gap-2">
            <span className="text-[10px] font-mono text-muted-foreground uppercase tracking-wider">
              {row.deals} {row.deals === 1 ? "venda" : "vendas"}
            </span>
            <div className="flex items-center gap-1.5">
              <span
                className={cn(
                  "text-[10px] font-mono font-bold",
                  row.revenueChangePct >= 0 ? "text-success" : "text-destructive",
                )}
              >
                {row.revenueChangePct >= 0 ? "+" : ""}
                {row.revenueChangePct.toFixed(1)}%
              </span>
              <span className={cn("font-display font-black text-4xl tabular-nums", accent.color)} style={{ textShadow: `0 0 45px ${accent.glow}` }}>
                {fmtBRL(row.revenue)}
              </span>
            </div>
          </div>
        </div>
      </div>
    </motion.div>
  );
};

export const FuturisticRanking = () => {
  const { data: rows = [], isLoading } = useFuturisticRanking();

  const maxRevenue = useMemo(() => Math.max(...rows.map((r) => r.revenue), 1), [rows]);

  return (
    <motion.section
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      aria-label="Ranking futurista de vendedores"
      className="relative"
    >
      {/* Header */}
      <div className="flex items-center justify-between mb-5">
        <div className="flex items-center gap-3">
          <div className="relative">
            <div className="absolute inset-0 bg-warning/40 blur-lg rounded-full animate-pulse" />
            <div className="relative p-2 rounded-xl bg-gradient-to-br from-warning/20 to-warning/5 border border-warning/30">
              <Trophy className="h-5 w-5 text-warning" />
            </div>
          </div>
          <div>
            <h2 className="font-display text-lg font-bold tracking-tight">Leaderboard HUD</h2>
            <p className="text-[11px] text-muted-foreground font-mono uppercase tracking-wider">
              Ranking · Faturamento do mês · vs mês anterior
            </p>
          </div>
        </div>
        <div className="hidden sm:flex items-center gap-2 px-3 py-1.5 rounded-lg bg-warning/10 border border-warning/30">
          <span className="text-[10px] font-mono uppercase tracking-wider text-warning font-bold">
            {rows.length} · Pilotos
          </span>
        </div>
      </div>

      {/* Body */}
      <div className="relative rounded-2xl border border-border/50 bg-gradient-to-b from-card/95 via-card to-card/80 backdrop-blur-xl p-4 overflow-hidden">
        {/* Grid overlay */}
        <div
          className="absolute inset-0 opacity-[0.04] pointer-events-none"
          style={{
            backgroundImage: `linear-gradient(hsl(var(--foreground)) 1px, transparent 1px), linear-gradient(90deg, hsl(var(--foreground)) 1px, transparent 1px)`,
            backgroundSize: "24px 24px",
          }}
        />
        {isLoading ? (
          <div className="space-y-2">
            {Array.from({ length: 5 }).map((_, i) => (
              <div key={i} className="h-16 rounded-xl bg-muted/20 animate-pulse" />
            ))}
          </div>
        ) : rows.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-10 text-center">
            <Trophy className="h-10 w-10 text-muted-foreground/40 mb-2" />
            <p className="text-sm text-muted-foreground">Nenhum vendedor ranqueado ainda este mês.</p>
          </div>
        ) : (
          <div className="relative space-y-2 max-h-[520px] overflow-y-auto pr-1">
            <AnimatePresence>
              {rows.map((row, i) => (
                <RankingRowCard key={row.id} row={row} maxRevenue={maxRevenue} index={i} />
              ))}
            </AnimatePresence>
          </div>
        )}
      </div>
    </motion.section>
  );
};

export default FuturisticRanking;
