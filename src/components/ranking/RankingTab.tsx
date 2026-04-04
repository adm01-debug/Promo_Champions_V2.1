import { memo } from "react";
import { Trophy, Medal } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Progress } from "@/components/ui/progress";

interface RankingPerson {
  id: string;
  name: string;
  avatar_url: string | null;
  rank: number;
  totalSales: number;
  dealsCount: number;
  leadsCount: number;
  gapToFirst: number;
  gapToNext: number;
  title: string;
  emoji: string;
  color: string;
  role: string;
}

interface RankingTabProps {
  ranking: RankingPerson[];
  leader: RankingPerson | undefined;
  formatCurrency: (value: number) => string;
}

const getRankIcon = (rank: number) => {
  if (rank === 1) return <Trophy className="h-6 w-6 text-rank-gold" />;
  if (rank === 2) return <Medal className="h-6 w-6 text-rank-silver" />;
  if (rank === 3) return <Medal className="h-6 w-6 text-rank-bronze" />;
  return <span className="text-lg font-bold text-muted-foreground">#{rank}</span>;
};

const getRankGradient = (rank: number) => {
  if (rank === 1) return "from-rank-gold/20 via-rank-gold/10 to-transparent border-rank-gold/30";
  if (rank === 2) return "from-rank-silver/20 via-rank-silver/10 to-transparent border-rank-silver/30";
  if (rank === 3) return "from-rank-bronze/20 via-rank-bronze/10 to-transparent border-rank-bronze/30";
  return "from-muted/20 to-transparent border-border/50";
};

export const RankingTab = memo(function RankingTab({ ranking, leader, formatCurrency }: RankingTabProps) {
  return (
    <div className="space-y-4">
      {ranking.map((person) => (
        <Card
          key={person.id}
          className={`glass border overflow-hidden transition-all hover:scale-[1.01] bg-gradient-to-r ${getRankGradient(person.rank)}`}
        >
          <CardContent className="p-4">
            <div className="flex items-center gap-4">
              <div className="flex-shrink-0 w-12 h-12 rounded-xl bg-background/50 flex items-center justify-center">
                {getRankIcon(person.rank)}
              </div>
              <Avatar className="h-14 w-14 border-2 border-border/50">
                <AvatarImage src={person.avatar_url || ""} />
                <AvatarFallback className="bg-gradient-to-br from-primary/20 to-secondary/20">
                  {person.name.split(" ").map((n) => n[0]).join("").slice(0, 2)}
                </AvatarFallback>
              </Avatar>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <h3 className="font-bold text-lg truncate">{person.name}</h3>
                  {person.title && (
                    <Badge className={`bg-gradient-to-r ${person.color} text-primary-foreground border-0`}>
                      {person.emoji} {person.title}
                    </Badge>
                  )}
                </div>
                <div className="flex items-center gap-4 mt-1">
                  <span className="text-sm text-muted-foreground">{person.dealsCount} vendas</span>
                  <span className="text-sm text-muted-foreground">{person.leadsCount} leads</span>
                  <Badge variant="outline" className="text-xs">{person.role.toUpperCase()}</Badge>
                </div>
              </div>
              <div className="text-right">
                <p className="text-2xl font-bold gradient-text">{formatCurrency(person.totalSales)}</p>
                {person.gapToFirst > 0 && (
                  <p className="text-xs text-muted-foreground">{formatCurrency(person.gapToFirst)} para o 1º</p>
                )}
                {person.gapToNext > 0 && person.rank > 1 && (
                  <p className="text-xs text-primary">{formatCurrency(person.gapToNext)} para subir</p>
                )}
              </div>
              {person.rank > 1 && leader && (
                <div className="w-24 hidden lg:block">
                  <Progress value={(person.totalSales / leader.totalSales) * 100} className="h-2" />
                  <p className="text-xs text-center mt-1 text-muted-foreground">
                    {Math.round((person.totalSales / leader.totalSales) * 100)}%
                  </p>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
});
