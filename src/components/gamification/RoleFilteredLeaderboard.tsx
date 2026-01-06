import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useRankingByRole, RoleFilter, ROLE_CONFIG } from "@/hooks/useRankingByRole";
import { useAuth } from "@/contexts/AuthContext";
import { useAllSalespeopleXP } from "@/hooks/useSalespersonXP";
import { Crown, Swords, Trophy, TrendingUp, Flame, Users } from "lucide-react";
import { SalespersonLevelBadge } from "./SalespersonLevelBadge";
import { motion, AnimatePresence } from "framer-motion";

const RANK_ICONS: Record<number, React.ElementType> = {
  1: Crown,
  2: Swords,
  3: Trophy,
};

export function RoleFilteredLeaderboard() {
  const [roleFilter, setRoleFilter] = useState<RoleFilter>('all');
  const { ranking, isLoading, roleStats } = useRankingByRole(roleFilter);
  const { salesperson } = useAuth();
  const { data: xpData } = useAllSalespeopleXP();

  const getXPInfo = (salespersonId: string) => {
    const xp = xpData?.find(x => x.salesperson_id === salespersonId);
    return { level: xp?.current_level || 1, totalXP: xp?.total_xp || 0 };
  };

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat("pt-BR", {
      style: "currency",
      currency: "BRL",
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(value);
  };

  if (isLoading) {
    return (
      <Card variant="elevated" className="glass border border-border/40">
        <CardHeader className="pb-2">
          <Skeleton className="h-8 w-48" />
        </CardHeader>
        <CardContent>
          <Skeleton className="h-10 w-full mb-4" />
          <div className="space-y-3">
            {[...Array(5)].map((_, i) => (
              <Skeleton key={i} className="h-16 w-full rounded-xl" />
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card variant="elevated" className="glass border border-border/40 dark:border-glow overflow-hidden">
      <CardHeader className="pb-2 border-b border-border/30">
        <div className="flex items-center justify-between">
          <CardTitle className="text-sm font-display font-semibold flex items-center gap-2">
            <div className="p-2 rounded-xl gradient-primary shadow-md">
              <Crown className="h-4 w-4 text-white" />
            </div>
            <span className="gradient-text">Arena de Vendas</span>
          </CardTitle>
          <Badge variant="secondary" className="text-xs">
            {ranking?.length || 0} competidores
          </Badge>
        </div>
        
        {/* Role Filter Tabs */}
        <Tabs value={roleFilter} onValueChange={(v) => setRoleFilter(v as RoleFilter)} className="mt-3">
          <TabsList className="grid grid-cols-5 h-9">
            {(['all', 'sdr', 'closer', 'hybrid', 'gestao'] as RoleFilter[]).map((role) => {
              const config = ROLE_CONFIG[role];
              const stat = roleStats.find(s => s.role === role);
              const count = role === 'all' ? ranking?.length : stat?.count;
              
              return (
                <TabsTrigger 
                  key={role} 
                  value={role}
                  className="text-xs data-[state=active]:bg-primary/20"
                >
                  {config.label}
                  {count !== undefined && count > 0 && (
                    <span className="ml-1 text-[10px] opacity-70">({count})</span>
                  )}
                </TabsTrigger>
              );
            })}
          </TabsList>
        </Tabs>
      </CardHeader>
      
      <CardContent className="p-0">
        <ScrollArea className="h-[400px]">
          <AnimatePresence mode="popLayout">
            <div className="p-4 space-y-2.5">
              {ranking?.map((person, index) => {
                const RankIcon = RANK_ICONS[person.rank] || TrendingUp;
                const isCurrentUser = salesperson?.id === person.id;
                const isTopThree = person.rank <= 3;
                const roleConfig = ROLE_CONFIG[person.role as RoleFilter] || ROLE_CONFIG.hybrid;
                const xpInfo = getXPInfo(person.id);

                return (
                  <motion.div
                    key={person.id}
                    layout
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -20 }}
                    transition={{ duration: 0.2, delay: index * 0.03 }}
                    className={`relative p-3 rounded-xl transition-all duration-300 cursor-pointer hover-lift ${
                      isCurrentUser 
                        ? "glass bg-primary/10 border-2 border-primary/40 ring-2 ring-primary/20 shadow-md" 
                        : isTopThree 
                          ? `glass bg-gradient-to-r ${person.color}/10 border border-border/30 hover:border-primary/30 shadow-sm`
                          : "glass bg-muted/20 border border-border/20 hover:bg-muted/40"
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      {/* Rank */}
                      <div 
                        className={`flex items-center justify-center w-11 h-11 rounded-xl font-display font-bold ${
                          isTopThree
                            ? `bg-gradient-to-br ${person.color} text-primary-foreground shadow-lg`
                            : "bg-muted/50 text-muted-foreground border border-border/30"
                        }`}
                      >
                        {isTopThree ? (
                          <RankIcon className={`h-5 w-5 ${person.rank === 1 ? 'animate-float' : ''}`} />
                        ) : (
                          <span className="text-sm">#{person.rank}</span>
                        )}
                      </div>

                      {/* Avatar e info */}
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2">
                          <Avatar className={`h-9 w-9 border-2 shadow-md ${isTopThree ? 'border-primary/30' : 'border-background'}`}>
                            <AvatarImage src={person.avatar_url || undefined} alt={person.name} />
                            <AvatarFallback className="text-xs font-display font-medium gradient-primary text-white">
                              {person.name.split(" ").map(n => n[0]).join("").slice(0, 2)}
                            </AvatarFallback>
                          </Avatar>
                          <div className="min-w-0">
                            <div className="flex items-center gap-1.5 flex-wrap">
                              <span className={`font-display font-medium text-sm truncate ${isCurrentUser ? "text-primary" : isTopThree ? "gradient-text" : ""}`}>
                                {person.name}
                              </span>
                              <SalespersonLevelBadge level={xpInfo.level} totalXP={xpInfo.totalXP} size="xs" />
                              {person.title && (
                                <Badge 
                                  variant="outline" 
                                  className={`text-[10px] px-1.5 py-0 bg-gradient-to-r ${person.color} text-primary-foreground border-0 shadow-sm`}
                                >
                                  {person.emoji} {person.title}
                                </Badge>
                              )}
                              {isCurrentUser && (
                                <Badge variant="outline" className="text-[10px] px-1.5 py-0 bg-primary/20 text-primary border-primary/30">
                                  Você
                                </Badge>
                              )}
                            </div>
                            <div className="flex items-center gap-2 mt-0.5">
                              <Badge variant="secondary" className={`text-[10px] px-1.5 py-0 ${roleConfig.bgColor} ${roleConfig.color}`}>
                                {roleConfig.label}
                              </Badge>
                              {person.dealsCount >= 5 && (
                                <span className="flex items-center gap-0.5 text-[10px] text-status-warning font-medium">
                                  <Flame className="h-3 w-3 animate-fire-pulse" />
                                  {person.dealsCount} deals
                                </span>
                              )}
                            </div>
                          </div>
                        </div>
                      </div>

                      {/* Stats */}
                      <div className="text-right">
                        <p className={`font-display font-bold ${isTopThree ? "text-lg" : "text-sm"} ${person.rank === 1 ? "gradient-text" : ""}`}>
                          {formatCurrency(person.totalSales)}
                        </p>
                        {person.rank > 1 && (
                          <p className="text-[10px] text-muted-foreground flex items-center justify-end gap-0.5">
                            <TrendingUp className="h-2.5 w-2.5" />
                            -{formatCurrency(person.gapToFirst)} do líder
                          </p>
                        )}
                      </div>
                    </div>
                  </motion.div>
                );
              })}
              
              {(!ranking || ranking.length === 0) && (
                <div className="flex flex-col items-center justify-center py-12 text-muted-foreground">
                  <Users className="h-12 w-12 mb-3 opacity-30" />
                  <p className="text-sm">Nenhum competidor nesta categoria</p>
                </div>
              )}
            </div>
          </AnimatePresence>
        </ScrollArea>
      </CardContent>
    </Card>
  );
}
