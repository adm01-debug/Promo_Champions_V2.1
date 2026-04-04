import { memo } from "react";
import { Flame, Trophy } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";

interface AchievementData {
  id: string;
  achievement_type: string;
  achievement_date: string;
  details: { name?: string; streak?: number } | null;
  salespeople: { name: string; avatar_url: string | null } | null;
}

interface AchievementsTabProps {
  achievements: AchievementData[];
}

export const AchievementsTab = memo(function AchievementsTab({ achievements }: AchievementsTabProps) {
  if (!achievements || achievements.length === 0) {
    return (
      <Card className="glass border-border/50">
        <CardContent className="py-12 text-center">
          <Trophy className="h-12 w-12 mx-auto text-muted-foreground/50 mb-4" />
          <p className="text-muted-foreground">Nenhuma conquista registrada ainda</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
      {achievements.map((achievement) => {
        const details = achievement.details as { name?: string; streak?: number } | null;
        const isStreak = achievement.achievement_type.includes("streak");

        return (
          <Card key={achievement.id} className="glass border-border/50 overflow-hidden">
            <CardContent className="p-4">
              <div className="flex items-start gap-3">
                <div className={`h-12 w-12 rounded-xl flex items-center justify-center flex-shrink-0 ${
                  isStreak ? "bg-gradient-to-br from-streak/20 to-primary/20" : "bg-gradient-to-br from-status-success/20 to-status-success/20"
                }`}>
                  {isStreak ? <Flame className="h-6 w-6 text-streak" /> : <Trophy className="h-6 w-6 text-status-success" />}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <Avatar className="h-6 w-6">
                      <AvatarImage src={achievement.salespeople?.avatar_url || ""} />
                      <AvatarFallback className="text-xs">{(achievement.salespeople?.name || "?")[0]}</AvatarFallback>
                    </Avatar>
                    <span className="font-medium truncate">{achievement.salespeople?.name || "Vendedor"}</span>
                  </div>
                  <p className="text-sm text-muted-foreground mt-1">
                    {isStreak ? `🔥 ${details?.streak || 0} dias consecutivos` : "🎯 Meta do dia batida!"}
                  </p>
                  <p className="text-xs text-muted-foreground mt-1">
                    {format(new Date(achievement.achievement_date), "dd MMM yyyy", { locale: ptBR })}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
});
