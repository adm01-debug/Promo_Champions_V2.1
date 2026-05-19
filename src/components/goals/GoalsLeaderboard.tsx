import React, { useState } from "react";
import { Input } from "@/components/ui/input";
import { Search, Filter, SortAsc, SortDesc } from "lucide-react";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";
import { SalespersonGoalCard } from "./SalespersonGoalCard";
import { Trophy, Users } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { useAllSalespeopleXP } from "@/hooks/gamification/useSalespersonXP";

interface SalespersonData {
  id: string;
  name: string;
  avatar_url: string | null;
  role: string;
  goalAmount: number;
  currentSales: number;
  progress: number;
  projection: number;
  onTrack: boolean;
  dailyAverage: number;
  requiredDailyAverage: number;
}

interface GoalsLeaderboardProps {
  salespeople: SalespersonData[];
  isLoading?: boolean;
}

function _GoalsLeaderboard({ salespeople, isLoading }: GoalsLeaderboardProps) {
  const { data: xpData } = useAllSalespeopleXP();

  const [search, setSearch] = useState("");
  const [sortBy, setSortBy] = useState("progress");

  const getXPInfo = (salespersonId: string) => {
    const xp = xpData?.find(x => x.salesperson_id === salespersonId);
    return { level: xp?.current_level || 1, totalXP: xp?.total_xp || 0 };
  };

  const filteredSalespeople = salespeople.filter(sp => 
    sp.name.toLowerCase().includes(search.toLowerCase()) ||
    sp.role.toLowerCase().includes(search.toLowerCase())
  );

  const sortedSalespeople = [...filteredSalespeople].sort((a, b) => {
    if (sortBy === "progress") return b.progress - a.progress;
    if (sortBy === "sales") return b.currentSales - a.currentSales;
    if (sortBy === "name") return a.name.localeCompare(b.name);
    return 0;
  });

  const withGoals = sortedSalespeople.filter(sp => sp.goalAmount > 0);
  const withoutGoals = sortedSalespeople.filter(sp => sp.goalAmount === 0);

  if (isLoading) {
    return (
      <Card className="glass border border-border/40 dark:border-glow card-elevated">
        <CardHeader className="pb-2 border-b border-border/30">
          <CardTitle className="text-sm font-display font-semibold flex items-center gap-2">
            <div className="p-2 rounded-xl bg-gradient-to-br from-primary/20 to-primary/5 shadow-md">
              <Trophy className="h-4 w-4 text-primary" />
            </div>
            <span className="gradient-text">Ranking de Metas</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3 pt-2">
            {[...Array(4)].map((_, i) => (
              <Skeleton 
                key={i} 
                className="h-28 w-full rounded-xl animate-pulse" 
                style={{ animationDelay: `${i * 100}ms` }}
              />
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="glass border border-border/40 dark:border-glow card-elevated overflow-hidden group">
      {/* Background decoration */}
      <div className="absolute top-0 right-0 w-64 h-64 bg-rank-gold/5 blur-[100px] rounded-full -mr-32 -mt-32 pointer-events-none" />
      
      <CardHeader className="pb-4 border-b border-border/30 relative z-10">
        <div className="space-y-5">
          <div className="flex items-center justify-between">
            <CardTitle className="text-sm font-display font-black flex items-center gap-3 uppercase italic tracking-tight">
              <div className="p-2.5 rounded-2xl bg-gradient-to-br from-rank-gold/30 to-rank-gold/5 shadow-lg shadow-rank-gold/10 group-hover:rotate-12 transition-transform duration-500">
                <Trophy className="h-5 w-5 text-rank-gold" />
              </div>
              <span className="gradient-text">Hall da Fama: Vendas</span>
            </CardTitle>
            <Badge variant="secondary" className="text-[10px] font-black uppercase tracking-widest bg-primary/10 text-primary border border-primary/20 shadow-sm px-3 py-1">
              <Users className="h-3 w-3 mr-1.5" />
              {withGoals.length} Elites Ativos
            </Badge>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div className="relative group/search">
              <div className="absolute inset-y-0 left-3 flex items-center pointer-events-none">
                <Search className="h-4 w-4 text-muted-foreground group-focus-within/search:text-primary transition-colors" />
              </div>
              <Input
                placeholder="Buscar Guerreiro..."
                className="pl-10 h-10 text-xs glass border-border/20 focus-visible:ring-primary/40 focus:bg-background/40 transition-all rounded-xl"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
            </div>
            <Select value={sortBy} onValueChange={setSortBy}>
              <SelectTrigger className="w-full h-10 text-xs glass border-border/20 rounded-xl hover:bg-background/40 transition-all">
                <div className="flex items-center gap-2">
                  <Filter className="h-3.5 w-3.5 text-primary" />
                  <SelectValue placeholder="Ordenar Por" />
                </div>
              </SelectTrigger>
              <SelectContent className="glass border-border/40 rounded-xl">
                <SelectItem value="progress" className="text-xs font-bold uppercase tracking-widest">⚡ Progresso %</SelectItem>
                <SelectItem value="sales" className="text-xs font-bold uppercase tracking-widest">💰 Volume Bruto</SelectItem>
                <SelectItem value="name" className="text-xs font-bold uppercase tracking-widest">👤 Nome Alfabético</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
      </CardHeader>
      <CardContent className="p-0">
        <ScrollArea className="h-[480px]">
          <div className="p-4 space-y-5">
            {withGoals.length > 0 && (
              <div className="mb-8 p-6 rounded-3xl bg-gradient-to-br from-rank-gold/25 via-rank-gold/5 to-transparent border border-rank-gold/30 relative overflow-hidden group shadow-2xl animate-fade-in ring-1 ring-rank-gold/20">
                {/* Animated Shine Effect */}
                <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/5 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-1000" />
                
                <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-30 transition-all duration-700 group-hover:scale-125 group-hover:rotate-12">
                  <Trophy className="h-24 w-24 text-rank-gold" />
                </div>
                
                <div className="relative z-10 flex items-center gap-6">
                  <div className="relative">
                    <div className="absolute -inset-2 bg-gradient-to-r from-rank-gold via-yellow-400 to-rank-gold rounded-full blur-md opacity-50 group-hover:opacity-80 transition-opacity animate-spin-slow" />
                    <div className="relative h-20 w-20 rounded-full border-4 border-rank-gold overflow-hidden shadow-2xl group-hover:scale-105 transition-transform duration-500">
                      <img 
                        src={withGoals[0].avatar_url || "/placeholder.svg"} 
                        alt={withGoals[0].name}
                        className="h-full w-full object-cover"
                        loading="lazy"
                      />
                    </div>
                    <div className="absolute -bottom-2 -right-2 bg-rank-gold text-white text-[11px] font-black px-2.5 py-1 rounded-xl shadow-2xl border-2 border-white/20 animate-bounce">
                      👑 MVP
                    </div>
                  </div>
                  <div>
                    <div className="flex items-center gap-2 mb-1.5">
                      <h3 className="text-2xl font-display font-black tracking-tighter text-foreground uppercase italic leading-none drop-shadow-sm">
                        {withGoals[0].name}
                      </h3>
                      <div className="h-2 w-2 rounded-full bg-status-success animate-pulse" />
                    </div>
                    <div className="flex flex-wrap items-center gap-3">
                      <Badge className="bg-rank-gold text-white border-none text-[10px] font-black tracking-widest px-3 py-0.5 shadow-lg shadow-rank-gold/20">
                        ABSOLUTO #1
                      </Badge>
                      <div className="flex flex-col">
                        <span className="text-xl font-display font-black text-rank-gold leading-none italic">
                          {withGoals[0].progress.toFixed(1)}%
                        </span>
                        <span className="text-[9px] uppercase font-black tracking-widest text-muted-foreground/60 leading-none mt-1">Status de Dominação</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {withGoals.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-12 text-muted-foreground glass rounded-xl animate-fade-in">
                <div className="p-4 rounded-full bg-muted/20 mb-4">
                  <Users className="h-12 w-12 opacity-50" />
                </div>
                <p className="font-display font-medium">Nenhuma meta definida</p>
                <p className="text-xs mt-1 text-muted-foreground/70">Configure metas para os vendedores</p>
              </div>
            ) : (
              <div className="space-y-3">
                <p className="text-[10px] text-muted-foreground uppercase font-black tracking-widest mb-2 px-1">Geral</p>
                {withGoals.map((sp, index) => {
                  const xpInfo = getXPInfo(sp.id);
                  return (
                    <div 
                      key={sp.id} 
                      className="animate-fade-in"
                      style={{ animationDelay: `${index * 50}ms` }}
                    >
                      <SalespersonGoalCard
                        {...sp}
                        rank={index + 1}
                        level={xpInfo.level}
                        totalXP={xpInfo.totalXP}
                      />
                    </div>
                  );
                })}
              </div>
            )}

            {withoutGoals.length > 0 && withGoals.length > 0 && (
              <div className="pt-4 border-t border-border/40 animate-fade-in" style={{ animationDelay: `${withGoals.length * 50 + 100}ms` }}>
                <p className="text-xs text-muted-foreground mb-3 uppercase tracking-wider font-medium flex items-center gap-2">
                  <div className="w-1.5 h-1.5 rounded-full bg-muted-foreground" />
                  Sem meta definida ({withoutGoals.length})
                </p>
                {withoutGoals.map((sp, index) => {
                  const xpInfo = getXPInfo(sp.id);
                  return (
                    <div 
                      key={sp.id}
                      className="animate-fade-in"
                      style={{ animationDelay: `${(withGoals.length + index) * 50 + 150}ms` }}
                    >
                      <SalespersonGoalCard
                        {...sp}
                        rank={withGoals.length + index + 1}
                        level={xpInfo.level}
                        totalXP={xpInfo.totalXP}
                      />
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </ScrollArea>
      </CardContent>
    </Card>
  );
}

export const GoalsLeaderboard = React.memo(_GoalsLeaderboard);
