import { Trophy, Target, DollarSign, TrendingUp, Medal, Crown, Award, Users } from "lucide-react";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Progress } from "@/components/ui/progress";
import { useSalespeopleRanking } from "@/hooks/useSalespeople";
import { Skeleton } from "@/components/ui/skeleton";

const getRankIcon = (rank: number) => {
  switch (rank) {
    case 1:
      return <Crown className="h-5 w-5 text-yellow-500" />;
    case 2:
      return <Medal className="h-5 w-5 text-gray-400" />;
    case 3:
      return <Award className="h-5 w-5 text-amber-600" />;
    default:
      return <span className="text-sm font-bold text-muted-foreground">#{rank}</span>;
  }
};

const getRankBadge = (rank: number) => {
  switch (rank) {
    case 1:
      return "from-yellow-500/20 to-yellow-600/20 border-yellow-500/30";
    case 2:
      return "from-gray-400/20 to-gray-500/20 border-gray-400/30";
    case 3:
      return "from-amber-600/20 to-amber-700/20 border-amber-600/30";
    default:
      return "from-muted/30 to-muted/20 border-border/30";
  }
};

const Vendedores = () => {
  const { data: salespeople, isLoading, error } = useSalespeopleRanking();

  const totalCommissions = salespeople?.reduce((sum, sp) => sum + sp.commission, 0) || 0;
  const totalSales = salespeople?.reduce((sum, sp) => sum + sp.totalSales, 0) || 0;
  const avgGoalProgress = salespeople && salespeople.length > 0 
    ? salespeople.reduce((sum, sp) => sum + sp.goalProgress, 0) / salespeople.length 
    : 0;

  return (
    <div className="min-h-screen bg-background p-6 lg:p-8">
      <div className="max-w-[1400px] mx-auto space-y-6">
        {/* Header */}
        <div className="opacity-0 animate-fade-in-up flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-xl gradient-primary">
              <Trophy className="h-6 w-6 text-white" />
            </div>
            <div>
              <h1 className="text-2xl font-bold gradient-text">Ranking de Vendedores</h1>
              <p className="text-sm text-muted-foreground">Metas e comissões do mês</p>
            </div>
          </div>
        </div>

        {/* Summary Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div className="opacity-0 animate-fade-in-up glass rounded-xl p-5" style={{ animationDelay: "100ms" }}>
            <div className="flex items-center gap-3 mb-3">
              <div className="p-2 rounded-lg bg-primary/20">
                <DollarSign className="h-4 w-4 text-primary" />
              </div>
              <span className="text-sm text-muted-foreground">Total Vendido</span>
            </div>
            <p className="text-2xl font-bold">R$ {totalSales.toLocaleString("pt-BR")}</p>
          </div>

          <div className="opacity-0 animate-fade-in-up glass rounded-xl p-5" style={{ animationDelay: "150ms" }}>
            <div className="flex items-center gap-3 mb-3">
              <div className="p-2 rounded-lg bg-secondary/20">
                <Target className="h-4 w-4 text-secondary" />
              </div>
              <span className="text-sm text-muted-foreground">Média de Metas</span>
            </div>
            <p className="text-2xl font-bold">{avgGoalProgress.toFixed(1)}%</p>
          </div>

          <div className="opacity-0 animate-fade-in-up glass rounded-xl p-5" style={{ animationDelay: "200ms" }}>
            <div className="flex items-center gap-3 mb-3">
              <div className="p-2 rounded-lg bg-success/20">
                <TrendingUp className="h-4 w-4 text-success" />
              </div>
              <span className="text-sm text-muted-foreground">Comissões Totais</span>
            </div>
            <p className="text-2xl font-bold">R$ {totalCommissions.toLocaleString("pt-BR", { maximumFractionDigits: 0 })}</p>
          </div>
        </div>

        {/* Ranking List */}
        <div className="opacity-0 animate-fade-in-up glass rounded-xl" style={{ animationDelay: "250ms" }}>
          <div className="p-5 border-b border-border/50">
            <div className="flex items-center gap-2">
              <Users className="h-5 w-5 text-primary" />
              <h2 className="text-lg font-semibold">Ranking Mensal</h2>
            </div>
            <p className="text-sm text-muted-foreground mt-1">Performance individual dos vendedores</p>
          </div>

          {isLoading ? (
            <div className="p-5 space-y-4">
              {[1, 2, 3, 4, 5].map((i) => (
                <div key={i} className="flex items-center gap-4">
                  <Skeleton className="h-12 w-12 rounded-full" />
                  <div className="flex-1 space-y-2">
                    <Skeleton className="h-4 w-32" />
                    <Skeleton className="h-3 w-full" />
                  </div>
                </div>
              ))}
            </div>
          ) : error ? (
            <div className="p-5 text-center text-muted-foreground">
              Erro ao carregar vendedores
            </div>
          ) : (
            <div className="divide-y divide-border/30">
              {salespeople?.map((sp, index) => (
                <div 
                  key={sp.id}
                  className={`p-5 hover:bg-muted/30 transition-colors ${sp.rank <= 3 ? 'bg-gradient-to-r ' + getRankBadge(sp.rank) : ''}`}
                >
                  <div className="flex items-start gap-4">
                    {/* Rank & Avatar */}
                    <div className="flex items-center gap-3">
                      <div className="w-8 flex justify-center">
                        {getRankIcon(sp.rank)}
                      </div>
                      <Avatar className="h-12 w-12">
                        <AvatarFallback className="bg-gradient-to-br from-primary/20 to-secondary/20 text-primary font-semibold">
                          {sp.name.split(" ").map(n => n[0]).join("")}
                        </AvatarFallback>
                      </Avatar>
                    </div>

                    {/* Info */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between mb-2">
                        <div>
                          <h3 className="font-semibold">{sp.name}</h3>
                          <p className="text-xs text-muted-foreground">{sp.completedSales} vendas • {sp.commission_rate}% comissão</p>
                        </div>
                        <div className="text-right">
                          <p className="font-bold text-lg">R$ {sp.totalSales.toLocaleString("pt-BR")}</p>
                          <p className="text-xs text-muted-foreground">de R$ {sp.goalAmount.toLocaleString("pt-BR")}</p>
                        </div>
                      </div>

                      {/* Progress Bar */}
                      <div className="space-y-1">
                        <div className="flex justify-between text-xs">
                          <span className="text-muted-foreground">Progresso da meta</span>
                          <span className={sp.goalProgress >= 100 ? "text-success font-medium" : "text-muted-foreground"}>
                            {sp.goalProgress.toFixed(1)}%
                          </span>
                        </div>
                        <div className="relative h-2 bg-muted/50 rounded-full overflow-hidden">
                          <div 
                            className="absolute inset-y-0 left-0 rounded-full gradient-primary transition-all duration-500"
                            style={{ width: `${Math.min(sp.goalProgress, 100)}%` }}
                          />
                        </div>
                      </div>

                      {/* Commission */}
                      <div className="mt-3 flex items-center justify-between">
                        <span className="text-xs text-muted-foreground">Comissão acumulada</span>
                        <span className="text-sm font-semibold text-success">
                          R$ {sp.commission.toLocaleString("pt-BR", { maximumFractionDigits: 0 })}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Vendedores;
