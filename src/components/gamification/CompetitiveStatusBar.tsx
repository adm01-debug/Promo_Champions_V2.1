import { useAuth } from "@/contexts/AuthContext";
import { useCompetitiveRanking } from "@/hooks/useCompetitiveRanking";
import { useIsMobile } from "@/hooks/useMediaQuery";
import { Crown, Swords, Trophy, TrendingUp, Target, AlertTriangle, Flame } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { useNavigate } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { cn } from "@/lib/utils";

const RANK_ICONS: Record<number, React.ElementType> = {
  1: Crown,
  2: Swords,
  3: Trophy,
};

export function CompetitiveStatusBar() {
  const { salesperson } = useAuth();
  const { data: ranking, isLoading } = useCompetitiveRanking();
  const navigate = useNavigate();
  const isMobile = useIsMobile();

  const { data: actionData } = useQuery({
    queryKey: ["action-card-data", salesperson?.id],
    queryFn: async () => {
      if (!salesperson?.id) return null;
      const sevenDaysAgo = new Date();
      sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

      const { count: stagnantDeals } = await supabase
        .from("sales")
        .select("*", { count: "exact", head: true })
        .eq("salesperson_id", salesperson.id)
        .not("status", "in", '("ganho","perdido","won","lost")')
        .lt("updated_at", sevenDaysAgo.toISOString());

      const { count: hotDeals } = await supabase
        .from("sales")
        .select("*", { count: "exact", head: true })
        .eq("salesperson_id", salesperson.id)
        .in("status", ["proposta", "negociação", "negotiation", "proposal"]);

      return { stagnantDeals: stagnantDeals || 0, hotDeals: hotDeals || 0 };
    },
    enabled: !!salesperson?.id,
    staleTime: 1000 * 60 * 5,
  });

  if (!salesperson) {
    return (
      <button 
        onClick={() => navigate("/auth")}
        className="w-full rounded-xl bg-gradient-to-r from-primary/5 via-primary/10 to-accent/5 border border-primary/20 p-3.5 flex items-center justify-between gap-3 hover:border-primary/40 transition-all group"
      >
        <div className="flex items-center gap-3">
          <div className="p-2 rounded-lg bg-primary/15">
            <Target className="h-4 w-4 text-primary" />
          </div>
          <div className="text-left">
            <p className="text-sm font-semibold font-display">Entre e comece a vender</p>
            <p className="text-xs text-muted-foreground">Acompanhe deals, metas e conquiste o ranking</p>
          </div>
        </div>
        <span className="text-xs font-medium text-primary group-hover:underline">Entrar →</span>
      </button>
    );
  }

  if (isLoading) {
    return (
      <div className="rounded-xl border border-border/30 bg-card/50 p-3.5">
        <div className="flex items-center gap-3">
          <Skeleton className="h-10 w-10 rounded-lg" />
          <div className="space-y-1.5 flex-1">
            <Skeleton className="h-4 w-28" />
            <Skeleton className="h-3 w-44" />
          </div>
          <div className="hidden sm:flex gap-3">
            <Skeleton className="h-10 w-20 rounded-lg" />
            <Skeleton className="h-10 w-20 rounded-lg" />
          </div>
        </div>
      </div>
    );
  }

  const myRanking = ranking?.find(r => r.id === salesperson.id);
  
  if (!myRanking) {
    const hasStagnant = actionData?.stagnantDeals && actionData.stagnantDeals > 0;
    return (
      <div className="rounded-xl border border-border/30 bg-card/50 p-3.5 flex items-center justify-between gap-3 flex-wrap">
        <div className="flex items-center gap-3">
          <div className={cn("p-2 rounded-lg", hasStagnant ? "bg-status-warning/10" : "bg-primary/10")}>
            {hasStagnant ? (
              <Flame className="h-4 w-4 text-status-warning" />
            ) : (
              <Target className="h-4 w-4 text-primary" />
            )}
          </div>
          <div>
            <p className="text-sm font-semibold font-display">
              {hasStagnant
                ? `${actionData.stagnantDeals} deal${actionData.stagnantDeals > 1 ? 's' : ''} parado${actionData.stagnantDeals > 1 ? 's' : ''} há 7+ dias`
                : "Comece adicionando deals ao pipeline"}
            </p>
            <p className="text-xs text-muted-foreground">
              {hasStagnant
                ? "Atualize para manter o pipeline saudável"
                : "Registre vendas e suba no ranking"}
            </p>
          </div>
        </div>
        <Button 
          variant="outline" 
          size="sm" 
          className="text-xs h-8"
          onClick={() => navigate("/pipeline")}
        >
          <Target className="h-3.5 w-3.5 mr-1.5" />
          Ver Pipeline
        </Button>
      </div>
    );
  }

  const RankIcon = RANK_ICONS[myRanking.rank] || TrendingUp;
  const isTopThree = myRanking.rank <= 3;
  
  const formatCurrency = (value: number) =>
    new Intl.NumberFormat("pt-BR", {
      style: "currency",
      currency: "BRL",
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(value);

  return (
    <div className={cn(
      "rounded-xl border p-3.5 transition-all",
      isTopThree 
        ? "bg-gradient-to-r from-primary/5 via-transparent to-accent/5 border-primary/25" 
        : "bg-card/50 border-border/30"
    )}>
      <div className="flex items-center justify-between gap-4 flex-wrap">
        {/* Rank */}
        <div className="flex items-center gap-3">
          <div className={cn(
            "p-2.5 rounded-xl",
            myRanking.color 
              ? `bg-gradient-to-br ${myRanking.color}` 
              : "bg-muted"
          )}>
            <RankIcon className={cn("h-5 w-5", isTopThree ? "text-primary-foreground" : "text-muted-foreground")} />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="font-display font-bold text-base sm:text-lg">
                {myRanking.emoji} #{myRanking.rank}
              </span>
              {myRanking.title && (
                <Badge 
                  variant="outline" 
                  className={cn("text-[10px] h-5", myRanking.color && `bg-gradient-to-r ${myRanking.color} text-primary-foreground border-0`)}
                >
                  {myRanking.title}
                </Badge>
              )}
            </div>
            <p className="text-xs text-muted-foreground">
              {myRanking.rank === 1 
                ? "Você é o líder! 👑"
                : `Falta ${formatCurrency(myRanking.gapToFirst)} para o 1º lugar`
              }
            </p>
          </div>
        </div>

        {/* Quick stats */}
        <div className="flex items-center gap-3">
          {actionData?.stagnantDeals && actionData.stagnantDeals > 0 && (
            <div className="hidden md:flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-destructive/10 border border-destructive/15">
              <AlertTriangle className="h-3 w-3 text-destructive" />
              <span className="text-[11px] font-medium text-destructive">
                {actionData.stagnantDeals} parado{actionData.stagnantDeals > 1 ? 's' : ''}
              </span>
            </div>
          )}
          
          <div className="flex items-center gap-2">
            <div className="text-center px-3 py-1.5 rounded-lg bg-primary/10 border border-primary/20">
              <p className="text-[10px] uppercase tracking-wider text-muted-foreground font-medium">Vendas</p>
              <p className="font-display font-bold text-sm">{formatCurrency(myRanking.totalSales)}</p>
            </div>
            <div className="text-center px-3 py-1.5 rounded-lg bg-muted/40 border border-border/20">
              <p className="text-[10px] uppercase tracking-wider text-muted-foreground font-medium">Deals</p>
              <p className="font-display font-bold text-sm">{myRanking.dealsCount}</p>
            </div>
            {myRanking.rank > 1 && !isMobile && (
              <div className="text-center px-3 py-1.5 rounded-lg bg-status-warning/10 border border-status-warning/20">
                <p className="text-[10px] uppercase tracking-wider text-muted-foreground font-medium">Para subir</p>
                <p className="font-display font-semibold text-sm text-status-warning">+{formatCurrency(myRanking.gapToNext)}</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
