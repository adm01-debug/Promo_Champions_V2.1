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

  // Fetch contextual action data
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

  // Not logged in: show contextual action card instead of generic "login to compete"
  if (!salesperson) {
    return (
      <div 
        className="glass rounded-xl p-4 border border-border/40 dark:border-glow cursor-pointer hover:border-primary/50 hover-lift transition-all card-elevated"
        onClick={() => navigate("/auth")}
      >
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-xl gradient-primary shadow-md">
              <Target className="h-5 w-5 text-primary-foreground" />
            </div>
            <div>
              <p className="text-sm font-display font-semibold">Entre e comece a vender</p>
              <p className="text-xs text-muted-foreground">Acompanhe deals, metas e conquiste o ranking</p>
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
  
  if (!myRanking) {
    // Show action card when no ranking data
    return (
      <div className="glass rounded-xl p-4 border border-border/40 dark:border-glow card-elevated">
        <div className="flex items-center justify-between flex-wrap gap-3">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-status-warning/15">
              <Flame className="h-5 w-5 text-status-warning" />
            </div>
            <div>
              <p className="text-sm font-display font-semibold">
                {actionData?.stagnantDeals && actionData.stagnantDeals > 0
                  ? `${actionData.stagnantDeals} deal${actionData.stagnantDeals > 1 ? 's' : ''} parado${actionData.stagnantDeals > 1 ? 's' : ''} há 7+ dias`
                  : "Comece adicionando deals ao pipeline"}
              </p>
              <p className="text-xs text-muted-foreground">
                {actionData?.stagnantDeals && actionData.stagnantDeals > 0
                  ? "Atualize seus deals para manter o pipeline saudável"
                  : "Registre sua primeira venda e suba no ranking"}
              </p>
            </div>
          </div>
          <Button 
            variant="outline" 
            size="sm" 
            className="border-primary/30 hover:border-primary/50 hover:bg-primary/10 transition-colors"
            onClick={() => navigate("/pipeline")}
          >
            <Target className="h-4 w-4 mr-1" />
            Ver Pipeline
          </Button>
        </div>
      </div>
    );
  }

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
      className={`glass rounded-xl p-4 border transition-all card-elevated ${
        isTopThree 
          ? "border-primary/40 dark:border-glow glow-primary" 
          : "border-border/40 dark:border-glow"
      }`}
    >
      <div className="flex items-center justify-between flex-wrap gap-4">
        {/* Rank e título */}
        <div className="flex items-center gap-3">
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
              <span className="font-display font-bold text-lg">
                {myRanking.emoji} #{myRanking.rank}
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
            <p className="text-sm text-muted-foreground">
              Olá, <span className="font-medium text-foreground">{salesperson.name}</span>! 
              {myRanking.rank === 1 
                ? " Você é o líder! 👑"
                : ` Falta ${formatCurrency(myRanking.gapToFirst)} para o 1º lugar.`
              }
            </p>
          </div>
        </div>

        {/* Contextual action alert */}
        {actionData?.stagnantDeals && actionData.stagnantDeals > 0 && (
          <div className="hidden md:flex items-center gap-2 px-3 py-1.5 rounded-lg bg-destructive/10 border border-destructive/20">
            <AlertTriangle className="h-3.5 w-3.5 text-destructive" />
            <span className="text-xs font-medium text-destructive">
              {actionData.stagnantDeals} deal{actionData.stagnantDeals > 1 ? 's' : ''} parado{actionData.stagnantDeals > 1 ? 's' : ''}
            </span>
          </div>
        )}

        {/* Stats rápidas */}
        <div className="flex items-center gap-4">
          <div className="text-center px-3 py-1.5 rounded-lg bg-primary/10 border border-primary/20">
            <p className="text-[10px] uppercase tracking-wider text-muted-foreground font-medium">Vendas</p>
            <p className="font-display font-bold gradient-text">{formatCurrency(myRanking.totalSales)}</p>
          </div>
          <div className="text-center px-3 py-1.5 rounded-lg bg-muted/50 border border-border/30">
            <p className="text-[10px] uppercase tracking-wider text-muted-foreground font-medium">Deals</p>
            <p className="font-display font-bold">{myRanking.dealsCount}</p>
          </div>
          {myRanking.leadsCount > 0 && (
            <div className="text-center px-3 py-1.5 rounded-lg bg-status-info/10 border border-status-info/20">
              <p className="text-[10px] uppercase tracking-wider text-muted-foreground font-medium flex items-center justify-center gap-1">
                <Target className="h-3 w-3" />
                Leads
              </p>
              <p className="font-display font-bold text-status-info">{myRanking.leadsCount}</p>
            </div>
          )}
          
          {myRanking.rank > 1 && (
            <div className="hidden md:block pl-4 border-l border-border/50">
              <p className="text-[10px] uppercase tracking-wider text-muted-foreground font-medium">Para subir</p>
              <p className="font-display font-medium text-sm text-status-warning">
                +{formatCurrency(myRanking.gapToNext)}
              </p>
            </div>
          )}
        </div>

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
  );
}
