import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Trophy, Crown, DollarSign } from "lucide-react";
import { useTopClosers } from "@/hooks/useCloserMetrics";

export function TopClosersRanking() {
  const { data: closers } = useTopClosers();

  const getRankStyle = (index: number) => {
    if (index === 0) return "bg-gradient-to-r from-yellow-500/20 to-orange-500/20 border-yellow-500/50";
    if (index === 1) return "bg-gradient-to-r from-gray-400/20 to-gray-300/20 border-gray-400/50";
    if (index === 2) return "bg-gradient-to-r from-amber-700/20 to-amber-600/20 border-amber-700/50";
    return "";
  };

  return (
    <Card className="glass border-border/40">
      <CardHeader className="pb-2">
        <CardTitle className="text-sm font-medium flex items-center gap-2">
          <Trophy className="h-4 w-4 text-yellow-500" />
          Top Closers - Faturamento
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-2">
        {closers?.length === 0 && (
          <p className="text-xs text-muted-foreground text-center py-4">
            Nenhum dado de Closer disponível
          </p>
        )}
        {closers?.map((closer, index) => (
          <div 
            key={closer.id}
            className={`flex items-center gap-3 p-2 rounded-lg border border-transparent ${getRankStyle(index)}`}
          >
            <div className="flex items-center justify-center w-6 h-6 rounded-full bg-muted text-xs font-bold">
              {index === 0 ? <Crown className="h-3.5 w-3.5 text-yellow-500" /> : index + 1}
            </div>
            <Avatar className="h-8 w-8">
              <AvatarImage src={closer.avatar_url || undefined} />
              <AvatarFallback className="text-xs">
                {closer.name.slice(0, 2).toUpperCase()}
              </AvatarFallback>
            </Avatar>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium truncate">{closer.name}</p>
              <p className="text-[10px] text-muted-foreground">
                {closer.closedDeals} vendas fechadas
              </p>
            </div>
            <div className="text-right">
              <div className="flex items-center gap-1">
                <DollarSign className="h-3 w-3 text-green-500" />
                <span className="text-sm font-bold text-green-500">
                  R$ {closer.closedValue.toLocaleString("pt-BR")}
                </span>
              </div>
            </div>
          </div>
        ))}
      </CardContent>
    </Card>
  );
}
