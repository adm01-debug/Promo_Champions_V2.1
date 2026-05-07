import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { DollarSign, TrendingUp, Percent, Sparkles } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";

interface SalespersonCommission {
  id: string;
  name: string;
  avatar_url: string | null;
  commissionRate: number;
  currentSales: number;
  currentCommission: number;
  projectedCommission: number;
  projection: number;
}

interface CommissionCalculatorProps {
  salespeople: SalespersonCommission[];
  totalCurrentCommission: number;
  totalProjectedCommission: number;
  isLoading?: boolean;
}

export function CommissionCalculator({
  salespeople,
  totalCurrentCommission,
  totalProjectedCommission,
  isLoading,
}: CommissionCalculatorProps) {
  const formatCurrency = (value: number) =>
    `R$ ${value.toLocaleString("pt-BR", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;

  // Sort by projected commission descending
  const sortedSalespeople = [...salespeople].sort(
    (a, b) => b.projectedCommission - a.projectedCommission
  );

  if (isLoading) {
    return (
      <Card className="glass border border-border/40 dark:border-glow card-elevated">
        <CardHeader className="pb-3 border-b border-border/30">
          <Skeleton className="h-6 w-52 rounded-lg" />
        </CardHeader>
        <CardContent className="space-y-4 pt-4">
          <div className="grid grid-cols-2 gap-3">
            <Skeleton className="h-20 rounded-xl" />
            <Skeleton className="h-20 rounded-xl" />
          </div>
          {[1, 2, 3].map((i) => (
            <Skeleton key={i} className="h-16 w-full rounded-xl" />
          ))}
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="glass border border-border/40 dark:border-glow card-elevated overflow-hidden">
      <CardHeader className="pb-3 border-b border-border/30">
        <div className="flex items-center justify-between">
          <CardTitle className="text-lg font-display font-semibold flex items-center gap-2">
            <div className="p-2 rounded-xl bg-gradient-to-br from-status-success to-status-success/70 shadow-md">
              <DollarSign className="h-5 w-5 text-primary-foreground" />
            </div>
            <span className="gradient-text">Calculadora de Comissão</span>
          </CardTitle>
          <Badge variant="outline" className="text-xs bg-status-success/10 text-status-success border-status-success/30 shadow-sm">
            Tempo Real
          </Badge>
        </div>
      </CardHeader>
      <CardContent className="space-y-4 pt-4">
        {/* Team Totals */}
        <div className="grid grid-cols-2 gap-3">
          <div className="p-4 rounded-xl glass border border-status-success/30 hover-lift cursor-pointer hover-glow-success transition-all">
            <div className="flex items-center gap-2 mb-2">
              <div className="p-1.5 rounded-lg bg-status-success/20">
                <DollarSign className="h-4 w-4 text-status-success" />
              </div>
              <span className="text-xs text-muted-foreground font-medium uppercase tracking-wider">Comissão Atual</span>
            </div>
            <p className="text-xl font-display font-bold text-status-success">
              {formatCurrency(totalCurrentCommission)}
            </p>
          </div>
          <div className="p-4 rounded-xl glass border border-primary/30 hover-lift cursor-pointer hover-glow transition-all">
            <div className="flex items-center gap-2 mb-2">
              <div className="p-1.5 rounded-lg bg-primary/20">
                <Sparkles className="h-4 w-4 text-primary" />
              </div>
              <span className="text-xs text-muted-foreground font-medium uppercase tracking-wider">Projeção</span>
            </div>
            <p className="text-xl font-display font-bold gradient-text">
              {formatCurrency(totalProjectedCommission)}
            </p>
          </div>
        </div>

        {/* Individual Commissions */}
        <ScrollArea className="h-[320px]">
          <div className="space-y-3 pr-3">
            {sortedSalespeople.map((sp, index) => {
              const tiers = [100, 120, 150];
              const nextTier = tiers.find(t => t > sp.progress) || 150;
              const isMaxTier = sp.progress >= 150;
              
              return (
                <div
                  key={sp.id}
                  className="p-4 rounded-xl glass border border-border/40 hover:border-primary/40 hover-lift transition-all group cursor-pointer relative overflow-hidden"
                >
                  <div className="flex items-center gap-3 relative z-10">
                    <div className="relative">
                      <Avatar className={`h-11 w-11 border-2 shadow-md ${index === 0 ? 'border-rank-gold' : 'border-background'}`}>
                        <AvatarImage src={sp.avatar_url || undefined} />
                        <AvatarFallback className="gradient-primary text-primary-foreground text-sm font-display">
                          {sp.name.slice(0, 2).toUpperCase()}
                        </AvatarFallback>
                      </Avatar>
                      {index === 0 && (
                        <div className="absolute -top-1 -right-1 w-5 h-5 bg-gradient-to-br from-rank-gold to-rank-gold/70 rounded-full flex items-center justify-center shadow-md animate-float">
                          <span className="text-[10px]">👑</span>
                        </div>
                      )}
                    </div>
                    
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between mb-1">
                        <div className="flex items-center gap-2">
                          <p className="font-display font-bold text-sm truncate">{sp.name}</p>
                          {sp.progress >= 100 && (
                            <Badge className="bg-status-success/20 text-status-success border-none text-[9px] h-4">
                              ACESSO AO BÔNUS
                            </Badge>
                          )}
                        </div>
                        <div className="text-right">
                          <p className="font-display font-black text-status-success text-sm">
                            {formatCurrency(sp.currentCommission)}
                          </p>
                        </div>
                      </div>

                      {/* Tier Progress Bar */}
                      <div className="space-y-1.5">
                        <div className="flex justify-between items-center text-[10px]">
                          <span className="text-muted-foreground font-medium">
                            Ritmo: <span className="text-primary font-bold">{sp.progress.toFixed(0)}%</span>
                          </span>
                          {!isMaxTier ? (
                            <span className="text-muted-foreground">
                              Próximo Acelerador: <span className="text-foreground font-bold">{nextTier}%</span>
                            </span>
                          ) : (
                            <span className="text-rank-gold font-bold flex items-center gap-1">
                              <Sparkles className="h-2.5 w-2.5" /> MASTER
                            </span>
                          )}
                        </div>
                        <div className="relative h-1.5 bg-muted/40 rounded-full overflow-hidden border border-border/10">
                          <div 
                            className={`absolute h-full transition-all duration-1000 ${
                              sp.progress >= 120 ? "bg-gradient-to-r from-rank-gold to-status-success" :
                              sp.progress >= 100 ? "bg-status-success" : "bg-primary/60"
                            }`}
                            style={{ width: `${Math.min((sp.progress / nextTier) * 100, 100)}%` }}
                          />
                        </div>
                      </div>
                    </div>
                  </div>
                  
                  {/* Subtle background glow for top performers */}
                  {index === 0 && (
                    <div className="absolute top-0 right-0 w-32 h-32 bg-rank-gold/5 blur-3xl -z-0 pointer-events-none" />
                  )}
                </div>
              );
            })}

            {sortedSalespeople.length === 0 && (
              <div className="text-center py-10 text-muted-foreground">
                <div className="p-4 rounded-full bg-muted/30 w-fit mx-auto mb-3">
                  <DollarSign className="h-8 w-8 opacity-50" />
                </div>
                <p className="font-display font-medium text-sm">Nenhum vendedor com vendas no mês</p>
              </div>
            )}
          </div>
        </ScrollArea>
      </CardContent>
    </Card>
  );
}
