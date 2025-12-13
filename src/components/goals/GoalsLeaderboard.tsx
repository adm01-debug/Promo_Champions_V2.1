import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";
import { SalespersonGoalCard } from "./SalespersonGoalCard";
import { Trophy, Users } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { useAllSalespeopleXP } from "@/hooks/useSalespersonXP";

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

export function GoalsLeaderboard({ salespeople, isLoading }: GoalsLeaderboardProps) {
  const { data: xpData } = useAllSalespeopleXP();

  const getXPInfo = (salespersonId: string) => {
    const xp = xpData?.find(x => x.salesperson_id === salespersonId);
    return { level: xp?.current_level || 1, totalXP: xp?.total_xp || 0 };
  };

  // Filter only those with goals set
  const withGoals = salespeople.filter(sp => sp.goalAmount > 0);
  const withoutGoals = salespeople.filter(sp => sp.goalAmount === 0);

  if (isLoading) {
    return (
      <Card className="glass border border-border/40 dark:border-glow card-elevated">
        <CardHeader className="pb-2 border-b border-border/30">
          <CardTitle className="text-sm font-display font-semibold flex items-center gap-2">
            <div className="p-2 rounded-xl gradient-primary shadow-md">
              <Trophy className="h-4 w-4 text-white" />
            </div>
            <span className="gradient-text">Ranking de Metas</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3 pt-2">
            {[...Array(4)].map((_, i) => (
              <Skeleton key={i} className="h-28 w-full rounded-xl" />
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="glass border border-border/40 dark:border-glow card-elevated overflow-hidden">
      <CardHeader className="pb-2 border-b border-border/30">
        <div className="flex items-center justify-between">
          <CardTitle className="text-sm font-display font-semibold flex items-center gap-2">
            <div className="p-2 rounded-xl gradient-primary shadow-md">
              <Trophy className="h-4 w-4 text-white" />
            </div>
            <span className="gradient-text">Ranking de Metas</span>
          </CardTitle>
          <Badge variant="secondary" className="text-xs bg-gradient-to-r from-primary/20 to-primary/10 text-primary border border-primary/20 shadow-sm">
            {withGoals.length} vendedores
          </Badge>
        </div>
      </CardHeader>
      <CardContent className="p-0">
        <ScrollArea className="h-[500px]">
          <div className="p-4 space-y-3">
            {withGoals.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-12 text-muted-foreground">
                <div className="p-4 rounded-full bg-muted/30 mb-4">
                  <Users className="h-12 w-12 opacity-50" />
                </div>
                <p className="font-display font-medium">Nenhuma meta definida</p>
                <p className="text-xs mt-1 text-muted-foreground/70">Configure metas para os vendedores</p>
              </div>
            ) : (
              withGoals.map((sp, index) => {
                const xpInfo = getXPInfo(sp.id);
                return (
                  <SalespersonGoalCard
                    key={sp.id}
                    {...sp}
                    rank={index + 1}
                    level={xpInfo.level}
                    totalXP={xpInfo.totalXP}
                  />
                );
              })
            )}

            {withoutGoals.length > 0 && withGoals.length > 0 && (
              <div className="pt-4 border-t border-border/40">
                <p className="text-xs text-muted-foreground mb-3 uppercase tracking-wider font-medium">
                  Sem meta definida ({withoutGoals.length})
                </p>
                {withoutGoals.map((sp, index) => {
                  const xpInfo = getXPInfo(sp.id);
                  return (
                    <SalespersonGoalCard
                      key={sp.id}
                      {...sp}
                      rank={withGoals.length + index + 1}
                      level={xpInfo.level}
                      totalXP={xpInfo.totalXP}
                    />
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
