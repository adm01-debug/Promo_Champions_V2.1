import { useAuth } from "@/contexts/AuthContext";
import { useCompetitiveRanking } from "@/hooks/useCompetitiveRanking";
import { Crown, Swords, Trophy, TrendingUp, Target, Users } from "lucide-react";
import { Badge } from "@/components/ui/badge";
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
        className="glass rounded-xl p-4 border-border/40 cursor-pointer hover:border-primary/50 transition-all"
        onClick={() => navigate("/auth")}
      >
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-muted">
              <Users className="h-5 w-5 text-muted-foreground" />
            </div>
            <div>
              <p className="text-sm font-medium">Faça login para competir</p>
              <p className="text-xs text-muted-foreground">Entre na arena e conquiste seu lugar</p>
            </div>
          </div>
          <Button variant="outline" size="sm">
            Entrar
          </Button>
        </div>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="glass rounded-xl p-4 border-border/40">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Skeleton className="h-10 w-10 rounded-lg" />
            <div className="space-y-2">
              <Skeleton className="h-4 w-32" />
              <Skeleton className="h-3 w-48" />
            </div>
          </div>
          <Skeleton className="h-8 w-24" />
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
      className={`glass rounded-xl p-4 border-border/40 transition-all ${
        isTopThree ? "glow-primary" : ""
      }`}
    >
      <div className="flex items-center justify-between flex-wrap gap-4">
        {/* Rank e título */}
        <div className="flex items-center gap-3">
          <div 
            className={`p-2.5 rounded-xl ${
              myRanking.color 
                ? `bg-gradient-to-br ${myRanking.color}` 
                : "bg-muted"
            }`}
          >
            <RankIcon className={`h-5 w-5 ${isTopThree ? "text-white" : "text-muted-foreground"}`} />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="font-bold text-lg">
                {myRanking.emoji} #{myRanking.rank}
              </span>
              {myRanking.title && (
                <Badge 
                  variant="outline" 
                  className={`bg-gradient-to-r ${myRanking.color} text-white border-0`}
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

        {/* Stats rápidas */}
        <div className="flex items-center gap-4">
          <div className="text-center">
            <p className="text-xs text-muted-foreground">Vendas</p>
            <p className="font-bold text-primary">{formatCurrency(myRanking.totalSales)}</p>
          </div>
          <div className="text-center">
            <p className="text-xs text-muted-foreground">Deals</p>
            <p className="font-bold">{myRanking.dealsCount}</p>
          </div>
          {myRanking.leadsCount > 0 && (
            <div className="text-center">
              <p className="text-xs text-muted-foreground flex items-center gap-1">
                <Target className="h-3 w-3" />
                Leads
              </p>
              <p className="font-bold text-info">{myRanking.leadsCount}</p>
            </div>
          )}
          
          {myRanking.rank > 1 && (
            <div className="hidden md:block pl-4 border-l border-border/50">
              <p className="text-xs text-muted-foreground">Para subir</p>
              <p className="font-medium text-sm text-warning">
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
            className="hidden lg:flex gap-2"
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
