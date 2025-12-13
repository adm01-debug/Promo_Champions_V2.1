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
      <Card className="glass border-border/40">
        <CardHeader className="pb-3">
          <Skeleton className="h-6 w-48" />
        </CardHeader>
        <CardContent className="space-y-4">
          {[1, 2, 3].map((i) => (
            <Skeleton key={i} className="h-16 w-full" />
          ))}
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="glass border-border/40">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="text-lg font-semibold flex items-center gap-2">
            <DollarSign className="h-5 w-5 text-green-500" />
            Calculadora de Comissão
          </CardTitle>
          <Badge variant="outline" className="text-xs">
            Tempo Real
          </Badge>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Team Totals */}
        <div className="grid grid-cols-2 gap-3">
          <div className="p-3 rounded-lg bg-green-500/10 border border-green-500/20">
            <div className="flex items-center gap-2 mb-1">
              <DollarSign className="h-4 w-4 text-green-500" />
              <span className="text-xs text-muted-foreground">Comissão Atual</span>
            </div>
            <p className="text-lg font-bold text-green-500">
              {formatCurrency(totalCurrentCommission)}
            </p>
          </div>
          <div className="p-3 rounded-lg bg-primary/10 border border-primary/20">
            <div className="flex items-center gap-2 mb-1">
              <Sparkles className="h-4 w-4 text-primary" />
              <span className="text-xs text-muted-foreground">Projeção</span>
            </div>
            <p className="text-lg font-bold text-primary">
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
                className="p-3 rounded-lg bg-card/50 border border-border/40 hover:bg-accent/5 transition-colors"
              >
                <div className="flex items-center gap-3">
                  <div className="relative">
                    <Avatar className="h-10 w-10">
                      <AvatarImage src={sp.avatar_url || undefined} />
                      <AvatarFallback className="bg-primary/10 text-primary text-sm">
                        {sp.name.slice(0, 2).toUpperCase()}
                      </AvatarFallback>
                    </Avatar>
                    {index === 0 && (
                      <div className="absolute -top-1 -right-1 w-4 h-4 bg-yellow-500 rounded-full flex items-center justify-center">
                        <span className="text-[10px]">👑</span>
                      </div>
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <p className="font-medium text-sm truncate">{sp.name}</p>
                      <Badge variant="outline" className="text-[10px] px-1.5 py-0 shrink-0">
                        <Percent className="h-2.5 w-2.5 mr-0.5" />
                        {sp.commissionRate}%
                      </Badge>
                    </div>
                    <p className="text-xs text-muted-foreground">
                      Vendas: {formatCurrency(sp.currentSales)}
                    </p>
                  </div>
                  <div className="text-right shrink-0">
                    <p className="font-semibold text-green-500 text-sm">
                      {formatCurrency(sp.currentCommission)}
                    </p>
                    <div className="flex items-center gap-1 justify-end">
                      <TrendingUp className="h-3 w-3 text-primary" />
                      <span className="text-xs text-primary">
                        {formatCurrency(sp.projectedCommission)}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            ))}

            {sortedSalespeople.length === 0 && (
              <div className="text-center py-8 text-muted-foreground text-sm">
                Nenhum vendedor com vendas no mês
              </div>
            )}
          </div>
        </ScrollArea>
      </CardContent>
    </Card>
  );
}
