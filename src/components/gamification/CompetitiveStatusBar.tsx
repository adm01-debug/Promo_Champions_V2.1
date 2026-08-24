import { useAuth } from "@/contexts/AuthContext";
import { useCompetitiveRanking } from "@/hooks/useCompetitiveRanking";
import { Crown, Swords, Trophy, TrendingUp, Target, Users } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { useNavigate } from "react-router-dom";

const RANK_ICONS: Record<number, React.ElementType> = {
  1: Crown,
  2: Swords,
  3: Trophy,
};

export function CompetitiveStatusBar() {
  const { salesperson } = useAuth();
  const { data: ranking, isLoading } = useCompetitiveRanking();
  const navigate = useNavigate();

  if (!salesperson) {
    return (
      <div 
        className="glass rounded-xl p-4 border border-border/40 dark:border-glow cursor-pointer hover:border-primary/50 hover-lift transition-all card-elevated"
        onClick={() => navigate("/auth")}
      >
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-gradient-to-br from-muted to-muted/50 border border-border/30">
              <Users className="h-5 w-5 text-muted-foreground" />
            </div>
            <div>
              <p className="text-sm font-display font-semibold">Faça login para competir</p>
              <p className="text-xs text-muted-foreground">Entre no circuito e conquiste seu lugar</p>
            </div>
          </div>
          <Button variant="outline" size="sm" className="border-primary/30 hover:border-primary/50 hover:bg-primary/10 transition-colors">
            Entrar
          </Button>
        </div>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="glass rounded-xl p-4 border border-border/40">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Skeleton className="h-11 w-11 rounded-xl" />
            <div className="space-y-2">
              <Skeleton className="h-4 w-32" />
              <Skeleton className="h-3 w-48" />
            </div>
          </div>
          <div className="flex gap-4">
            <Skeleton className="h-10 w-20" />
            <Skeleton className="h-10 w-20" />
          </div>
        </div>
      </div>
    );
  }

  const myRanking = ranking?.find(r => r.id === salesperson.id);
  
  if (!myRanking) return null;

  const RankIcon = RANK_ICONS[myRanking.rank] || TrendingUp;
  const isTopThree = myRanking.rank <= 3;
  
  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat("pt-BR", {
      style: "currency",
      currency: "BRL",
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(value);
  };

  return (
    <div 
      className={cn(
        "rounded-xl p-4 transition-all border backdrop-blur-sm",
        "bg-gradient-to-r from-card via-card to-primary/[0.03]",
        isTopThree 
          ? "border-primary/30 shadow-md shadow-primary/5" 
          : "border-border/40 shadow-sm"
      )}
    >
      <div className="flex items-center gap-4 flex-wrap">
        {/* === RANK POSITION (Primary - visually prominent) === */}
        <div className="flex items-center gap-3 flex-shrink-0">
          <div 
            className={`p-2.5 rounded-xl shadow-lg ${
              myRanking.color 
                ? `bg-gradient-to-br ${myRanking.color}` 
                : "bg-gradient-to-br from-muted to-muted/50"
            }`}
          >
            <RankIcon className={`h-5 w-5 ${isTopThree ? "text-primary-foreground" : "text-muted-foreground"}`} />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className={cn(
                "inline-flex items-center justify-center font-display font-black text-lg min-w-[2.5rem] h-9 rounded-xl border-2 shadow-sm",
                myRanking.rank === 1 && "bg-gradient-to-br from-coins to-rank-gold text-rank-gold-foreground border-rank-gold/60",
                myRanking.rank === 2 && "bg-gradient-to-br from-rank-silver to-muted text-rank-silver-foreground border-rank-silver/60",
                myRanking.rank === 3 && "bg-gradient-to-br from-streak to-rank-gold text-streak-foreground border-streak/60",
                myRanking.rank > 3 && "bg-muted text-foreground border-border/50"
              )}>
                #{myRanking.rank}
              </span>
              {myRanking.title && (
                <Badge 
                  variant="outline" 
                  className={`bg-gradient-to-r ${myRanking.color} text-primary-foreground border-0 shadow-sm`}
                >
                  {myRanking.title}
                </Badge>
              )}
            </div>
            <p className="text-sm text-muted-foreground/80 mt-0.5">
              Olá, <span className="font-medium text-foreground">{salesperson.name}</span>! 
              {myRanking.rank === 1 
                ? " Você é o líder! 👑"
                : ` Falta ${formatCurrency(myRanking.gapToFirst)} para o 1º lugar.`
              }
            </p>
          </div>
        </div>

        {/* === DIVIDER === */}
        <div className="hidden md:block w-px h-10 bg-border/50" />

        {/* === STATS (Secondary - compact, aligned right) === */}
        <div className="flex items-center gap-3 ml-auto">
          <div className="text-center px-3 py-1.5 rounded-lg bg-primary/10 border border-primary/20">
            <p className="text-[10px] uppercase tracking-wider text-muted-foreground/80 font-medium">Vendas</p>
            <p className="font-display font-bold gradient-text">{formatCurrency(myRanking.totalSales)}</p>
          </div>
          <div className="text-center px-3 py-1.5 rounded-lg bg-muted/50 border border-border/30">
            <p className="text-[10px] uppercase tracking-wider text-muted-foreground/80 font-medium">Deals</p>
            <p className="font-display font-bold">{myRanking.dealsCount}</p>
          </div>
          {myRanking.leadsCount > 0 && (
            <div className="text-center px-3 py-1.5 rounded-lg bg-status-info/10 border border-status-info/20">
              <p className="text-[10px] uppercase tracking-wider text-muted-foreground/80 font-medium flex items-center justify-center gap-1">
                <Target className="h-3 w-3" />
                Leads
              </p>
              <p className="font-display font-bold text-status-info">{myRanking.leadsCount}</p>
            </div>
          )}
          
          {myRanking.rank > 1 && (
            <div className="hidden md:block pl-3 border-l border-border/50">
              <p className="text-[10px] uppercase tracking-wider text-muted-foreground/80 font-medium">Para subir</p>
              <p className="font-display font-medium text-sm text-status-warning">
                +{formatCurrency(myRanking.gapToNext)}
              </p>
            </div>
          )}

          {/* CTA */}
          {myRanking.leadsCount > 0 && (
            <Button 
              variant="outline" 
              size="sm"
              className="hidden lg:flex gap-2 border-primary/30 hover:border-primary/50 hover:bg-primary/10 transition-colors"
              onClick={() => navigate("/pipeline")}
            >
              <Target className="h-4 w-4" />
              {myRanking.leadsCount} leads abertos
            </Button>
          )}
        </div>
      </div>
    </div>
  );
}
