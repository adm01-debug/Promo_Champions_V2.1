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
              <DollarSign className="h-5 w-5 text-white" />
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
        <ScrollArea className="h-[280px]">
          <div className="space-y-2 pr-3">
            {sortedSalespeople.map((sp, index) => (
              <div
                key={sp.id}
                className="p-3 rounded-xl glass border border-border/40 hover:border-primary/40 hover-lift transition-all group cursor-pointer"
              >
                <div className="flex items-center gap-3">
                  <div className="relative">
                    <Avatar className={`h-10 w-10 border-2 shadow-md ${index === 0 ? 'border-rank-gold' : 'border-background'}`}>
                      <AvatarImage src={sp.avatar_url || undefined} />
                      <AvatarFallback className="gradient-primary text-white text-sm font-display">
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
                    <div className="flex items-center gap-2">
                      <p className="font-display font-medium text-sm truncate">{sp.name}</p>
                      <Badge variant="outline" className="text-[10px] px-1.5 py-0 shrink-0 bg-muted/50 border-border/50">
                        <Percent className="h-2.5 w-2.5 mr-0.5" />
                        {sp.commissionRate}%
                      </Badge>
                    </div>
                    <p className="text-xs text-muted-foreground">
                      Vendas: <span className="font-medium text-foreground">{formatCurrency(sp.currentSales)}</span>
                    </p>
                  </div>
                  <div className="text-right shrink-0">
                    <p className="font-display font-bold text-status-success text-sm">
                      {formatCurrency(sp.currentCommission)}
                    </p>
                    <div className="flex items-center gap-1 justify-end opacity-70 group-hover:opacity-100 transition-opacity">
                      <TrendingUp className="h-3 w-3 text-primary" />
                      <span className="text-xs text-primary font-medium">
                        {formatCurrency(sp.projectedCommission)}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            ))}

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
