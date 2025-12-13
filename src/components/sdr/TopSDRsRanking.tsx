import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Trophy, Flame } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useQuery } from "@tanstack/react-query";
import { useAllSalespeopleXP } from "@/hooks/useSalespersonXP";
import { SalespersonLevelBadge } from "@/components/gamification/SalespersonLevelBadge";

export function TopSDRsRanking() {
  const { data: xpData } = useAllSalespeopleXP();

  const getXPInfo = (salespersonId: string) => {
    const xp = xpData?.find(x => x.salesperson_id === salespersonId);
    return { level: xp?.current_level || 1, totalXP: xp?.total_xp || 0 };
  };

  const { data: ranking } = useQuery({
    queryKey: ["sdr-ranking-filtered"],
    queryFn: async () => {
      // Fetch only SDRs and hybrids
      const { data: sdrs } = await supabase
        .from("salespeople")
        .select("*")
        .in("role", ["sdr", "hybrid"])
        .eq("is_active", true);

      const sdrIds = sdrs?.map(s => s.id) || [];

      const { data: sales } = await supabase
        .from("sales")
        .select("salesperson_id, status")
        .in("salesperson_id", sdrIds);

      const { data: tasks } = await supabase
        .from("tasks")
        .select("salesperson_id, task_type")
        .eq("task_type", "meeting")
        .in("salesperson_id", sdrIds);

      // Calculate SDR performance
      const sdrStats = new Map<string, { leads: number; meetings: number; qualified: number }>();

      sales?.forEach(sale => {
        if (!sale.salesperson_id) return;
        const stats = sdrStats.get(sale.salesperson_id) || { leads: 0, meetings: 0, qualified: 0 };
        stats.leads++;
        if (sale.status !== "lead") stats.qualified++;
        sdrStats.set(sale.salesperson_id, stats);
      });

      tasks?.forEach(task => {
        if (!task.salesperson_id) return;
        const stats = sdrStats.get(task.salesperson_id) || { leads: 0, meetings: 0, qualified: 0 };
        stats.meetings++;
        sdrStats.set(task.salesperson_id, stats);
      });

      return sdrs?.map(sdr => {
        const stats = sdrStats.get(sdr.id) || { leads: 0, meetings: 0, qualified: 0 };
        return {
          ...sdr,
          ...stats,
          schedulingRate: stats.leads > 0 ? (stats.meetings / stats.leads) * 100 : 0
        };
      })
      .sort((a, b) => b.schedulingRate - a.schedulingRate)
      .slice(0, 5) || [];
    },
  });

  const getRankStyle = (index: number) => {
    if (index === 0) return "bg-gradient-to-r from-rank-gold/20 to-primary/20 border-rank-gold/50 hover-glow-gold";
    if (index === 1) return "bg-gradient-to-r from-rank-silver/20 to-rank-silver/20 border-rank-silver/50";
    if (index === 2) return "bg-gradient-to-r from-rank-bronze/20 to-rank-bronze/20 border-rank-bronze/50";
    return "";
  };

  return (
    <Card variant="elevated" className="glass border-border/40">
      <CardHeader className="pb-2">
        <CardTitle className="text-sm font-medium flex items-center gap-2">
          <div className="p-1.5 rounded-lg bg-rank-gold/20">
            <Trophy className="h-4 w-4 text-rank-gold" />
          </div>
          <span className="gradient-text">Top SDRs - Taxa de Agendamento</span>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-2.5">
        {ranking?.length === 0 && (
          <div className="flex flex-col items-center justify-center py-6 text-muted-foreground">
            <Trophy className="h-8 w-8 opacity-30 mb-2" />
            <p className="text-xs">Nenhum dado de SDR disponível</p>
          </div>
        )}
        {ranking?.map((sdr, index) => {
          const xpInfo = getXPInfo(sdr.id);
          return (
            <div 
              key={sdr.id}
              className={`flex items-center gap-3 p-2.5 rounded-xl border border-transparent transition-all duration-200 cursor-pointer hover:shadow-sm ${getRankStyle(index)}`}
            >
              <div className={`flex items-center justify-center w-7 h-7 rounded-lg text-xs font-bold ${
                index === 0 ? "gradient-primary text-white" : 
                index === 1 ? "bg-rank-silver/30 text-rank-silver" : 
                index === 2 ? "bg-rank-bronze/30 text-rank-bronze" : "bg-muted"
              }`}>
                {index + 1}
              </div>
              <Avatar className="h-8 w-8 shadow-sm">
                <AvatarImage src={sdr.avatar_url || undefined} />
                <AvatarFallback className="text-xs gradient-primary text-white">
                  {sdr.name.slice(0, 2).toUpperCase()}
                </AvatarFallback>
              </Avatar>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-1.5">
                  <p className={`text-sm font-medium truncate ${index === 0 ? "gradient-text" : ""}`}>{sdr.name}</p>
                  <SalespersonLevelBadge level={xpInfo.level} totalXP={xpInfo.totalXP} size="xs" />
                </div>
                <div className="flex items-center gap-2 text-[10px] text-muted-foreground">
                  <span>{sdr.meetings} reuniões</span>
                  <span className="text-border">•</span>
                  <span>{sdr.qualified} qualificados</span>
                </div>
              </div>
              <div className="text-right">
                <div className="flex items-center gap-1">
                  {sdr.schedulingRate >= 15 && <Flame className="h-3 w-3 text-streak animate-pulse" />}
                  <span className={`text-sm font-bold ${index === 0 ? "gradient-text" : "text-primary"}`}>
                    {sdr.schedulingRate.toFixed(1)}%
                  </span>
                </div>
              </div>
            </div>
          );
        })}
      </CardContent>
    </Card>
  );
}
