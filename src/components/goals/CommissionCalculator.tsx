import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { DollarSign, TrendingUp, Percent, Sparkles, Trophy, Zap, ArrowUpRight } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import { motion } from "framer-motion";

interface SalespersonCommission {
  id: string;
  name: string;
  avatar_url: string | null;
  commissionRate: number;
  currentSales: number;
  currentCommission: number;
  projectedCommission: number;
  projection: number;
  progress: number;
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
    <Card className="glass border border-border/40 dark:border-glow card-elevated overflow-hidden relative group">
      {/* Background decoration */}
      <div className="absolute top-0 right-0 w-40 h-40 bg-status-success/5 blur-[100px] rounded-full -mr-20 -mt-20 opacity-0 group-hover:opacity-100 transition-opacity duration-700 pointer-events-none" />

      <CardHeader className="pb-3 border-b border-border/30 relative z-10">
        <div className="flex items-center justify-between">
          <CardTitle className="text-lg font-display font-black flex items-center gap-2">
            <div className="p-2 rounded-xl bg-gradient-to-br from-status-success to-status-success/70 shadow-lg group-hover:rotate-12 transition-transform duration-500">
              <DollarSign className="h-5 w-5 text-white" />
            </div>
            <span className="gradient-text italic uppercase tracking-tighter">Motor de Comissões</span>
          </CardTitle>
          <Badge variant="outline" className="text-[10px] font-black uppercase tracking-widest bg-status-success/10 text-status-success border-status-success/30 shadow-sm animate-pulse">
            Live Pay
          </Badge>
        </div>
      </CardHeader>
      <CardContent className="space-y-4 pt-5 relative z-10">
        {/* Team Totals */}
        <div className="grid grid-cols-2 gap-4">
          <div className="p-5 rounded-2xl glass border border-status-success/20 hover-lift cursor-pointer transition-all bg-gradient-to-br from-status-success/5 to-transparent relative overflow-hidden group/stats">
            <div className="absolute inset-0 bg-status-success/5 opacity-0 group-hover/stats:opacity-100 transition-opacity" />
            <div className="flex items-center gap-2 mb-3 relative z-10">
              <div className="p-2 rounded-xl bg-status-success/20 shadow-sm">
                <DollarSign className="h-4 w-4 text-status-success" />
              </div>
              <span className="text-[10px] text-muted-foreground font-black uppercase tracking-[0.15em]">Ganhos Atuais</span>
            </div>
            <p className="text-2xl font-display font-black text-status-success italic tracking-tighter relative z-10 leading-none drop-shadow-[0_0_8px_rgba(34,197,94,0.3)]">
              {formatCurrency(totalCurrentCommission)}
            </p>
          </div>
          <div className="p-5 rounded-2xl glass border border-primary/20 hover-lift cursor-pointer transition-all bg-gradient-to-br from-primary/5 to-transparent relative overflow-hidden group/stats">
            <div className="absolute inset-0 bg-primary/5 opacity-0 group-hover/stats:opacity-100 transition-opacity" />
            <div className="flex items-center gap-2 mb-3 relative z-10">
              <div className="p-2 rounded-xl bg-primary/20 shadow-sm">
                <Sparkles className="h-4 w-4 text-primary" />
              </div>
              <span className="text-[10px] text-muted-foreground font-black uppercase tracking-[0.15em]">Total Projetado</span>
            </div>
            <p className="text-2xl font-display font-black gradient-text italic tracking-tighter relative z-10 leading-none">
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
                <motion.div
                  key={sp.id}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: index * 0.05 }}
                  className="p-4 rounded-2xl glass border border-border/40 hover:border-primary/40 hover-lift transition-all group/card cursor-pointer relative overflow-hidden"
                >
                  <div className="flex items-center gap-4 relative z-10">
                    <div className="relative">
                      <div className={`absolute -inset-1 bg-gradient-to-br ${index === 0 ? 'from-rank-gold to-yellow-500' : 'from-primary to-blue-500'} rounded-full blur opacity-0 group-hover/card:opacity-30 transition-opacity`} />
                      <Avatar className={`h-12 w-12 border-2 shadow-lg relative ${index === 0 ? 'border-rank-gold scale-110' : 'border-background'}`}>
                        <AvatarImage src={sp.avatar_url || undefined} />
                        <AvatarFallback className="gradient-primary text-primary-foreground text-sm font-black italic">
                          {sp.name.slice(0, 2).toUpperCase()}
                        </AvatarFallback>
                      </Avatar>
                      {index === 0 && (
                        <div className="absolute -top-1.5 -right-1.5 w-6 h-6 bg-gradient-to-br from-rank-gold to-yellow-600 rounded-full flex items-center justify-center shadow-xl border border-white/20 animate-bounce-subtle z-20">
                          <Trophy className="h-3 w-3 text-white" />
                        </div>
                      )}
                    </div>
                    
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between mb-1.5">
                        <div className="flex items-center gap-2">
                          <p className="font-display font-black text-sm truncate tracking-tight uppercase italic">{sp.name}</p>
                          {sp.progress >= 100 && (
                            <div className="flex items-center gap-1 px-1.5 py-0.5 rounded bg-status-success/20 border border-status-success/30">
                              <Zap className="h-2.5 w-2.5 text-status-success animate-pulse" />
                              <span className="text-[8px] font-black text-status-success uppercase tracking-widest">BÔNUS UNLOCKED</span>
                            </div>
                          )}
                        </div>
                        <div className="text-right">
                          <p className="font-display font-black text-status-success text-sm italic tracking-tighter">
                            {formatCurrency(sp.currentCommission)}
                          </p>
                        </div>
                      </div>

                      {/* Tier Progress Bar */}
                      <div className="space-y-2">
                        <div className="flex justify-between items-center text-[10px] font-black uppercase tracking-wider">
                          <span className="text-muted-foreground/80 flex items-center gap-1">
                            Performance: <span className="text-primary italic">{sp.progress.toFixed(0)}%</span>
                          </span>
                          {!isMaxTier ? (
                            <span className="text-muted-foreground/80 flex items-center gap-1">
                              Target <ArrowUpRight className="h-2.5 w-2.5" /> <span className="text-foreground italic">{nextTier}%</span>
                            </span>
                          ) : (
                            <span className="text-rank-gold flex items-center gap-1 animate-pulse">
                              <Sparkles className="h-3 w-3" /> MASTER ELITE
                            </span>
                          )}
                        </div>
                        <div className="relative h-2.5 bg-muted/40 rounded-full overflow-hidden border border-white/10 shadow-inner group/bar">
                          <div 
                            className={`absolute h-full transition-all duration-1000 ease-out ${
                              sp.progress >= 120 ? "bg-gradient-to-r from-rank-gold via-yellow-400 to-status-success shadow-[0_0_15px_rgba(255,215,0,0.4)]" :
                              sp.progress >= 100 ? "bg-gradient-to-r from-status-success to-status-success/60 shadow-[0_0_12px_rgba(34,197,94,0.3)]" : 
                              "bg-gradient-to-r from-primary via-primary/80 to-primary/40 shadow-[0_0_10px_rgba(var(--primary),0.2)]"
                            }`}
                            style={{ width: `${Math.min((sp.progress / nextTier) * 100, 100)}%` }}
                          >
                            <div className="absolute inset-0 bg-[linear-gradient(90deg,transparent,rgba(255,255,255,0.2),transparent)] animate-shimmer" />
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </motion.div>
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
