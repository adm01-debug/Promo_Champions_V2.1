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
      <Card className="glass border-border/40">
        <CardHeader className="pb-2">
          <CardTitle className="text-sm font-medium flex items-center gap-2">
            <Trophy className="h-4 w-4 text-primary" />
            Ranking de Metas
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {[...Array(4)].map((_, i) => (
              <Skeleton key={i} className="h-28 w-full" />
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="glass border-border/40">
      <CardHeader className="pb-2">
        <div className="flex items-center justify-between">
          <CardTitle className="text-sm font-medium flex items-center gap-2">
            <Trophy className="h-4 w-4 text-primary" />
            Ranking de Metas
          </CardTitle>
          <Badge variant="secondary" className="text-xs">
            {withGoals.length} vendedores
          </Badge>
        </div>
      </CardHeader>
      <CardContent className="p-0">
        <ScrollArea className="h-[500px]">
          <div className="p-4 space-y-3">
            {withGoals.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-12 text-muted-foreground">
                <Users className="h-12 w-12 mb-3 opacity-50" />
                <p className="text-sm font-medium">Nenhuma meta definida</p>
                <p className="text-xs mt-1">Configure metas para os vendedores</p>
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
                <p className="text-xs text-muted-foreground mb-3">
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
