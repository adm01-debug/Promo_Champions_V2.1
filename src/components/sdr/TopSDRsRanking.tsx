import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Trophy, Flame } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useQuery } from "@tanstack/react-query";

export function TopSDRsRanking() {
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
          Top SDRs - Taxa de Agendamento
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-2">
        {ranking?.length === 0 && (
          <p className="text-xs text-muted-foreground text-center py-4">
            Nenhum dado de SDR disponível
          </p>
        )}
        {ranking?.map((sdr, index) => (
          <div 
            key={sdr.id}
            className={`flex items-center gap-3 p-2 rounded-lg border border-transparent ${getRankStyle(index)}`}
          >
            <div className="flex items-center justify-center w-6 h-6 rounded-full bg-muted text-xs font-bold">
              {index + 1}
            </div>
            <Avatar className="h-8 w-8">
              <AvatarImage src={sdr.avatar_url || undefined} />
              <AvatarFallback className="text-xs">
                {sdr.name.slice(0, 2).toUpperCase()}
              </AvatarFallback>
            </Avatar>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium truncate">{sdr.name}</p>
              <div className="flex items-center gap-2 text-[10px] text-muted-foreground">
                <span>{sdr.meetings} reuniões</span>
                <span>•</span>
                <span>{sdr.qualified} qualificados</span>
              </div>
            </div>
            <div className="text-right">
              <div className="flex items-center gap-1">
                {sdr.schedulingRate >= 15 && <Flame className="h-3 w-3 text-orange-500" />}
                <span className="text-sm font-bold text-primary">
                  {sdr.schedulingRate.toFixed(1)}%
                </span>
              </div>
            </div>
          </div>
        ))}
      </CardContent>
    </Card>
  );
}
