import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Progress } from "@/components/ui/progress";
import { ArrowRightLeft, CalendarCheck, UserCheck, TrendingUp, Crown, Medal } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { startOfMonth, endOfMonth, startOfWeek, endOfWeek, startOfQuarter, endOfQuarter } from "date-fns";
import { Skeleton } from "@/components/ui/skeleton";
import { PeriodFilter } from "@/hooks/useSDRMetrics";
import { cn } from "@/lib/utils";

interface SDRConversionRankingProps {
  period: PeriodFilter;
}

function getPeriodRange(period: PeriodFilter) {
  const now = new Date();
  switch (period) {
    case "week":
      return { start: startOfWeek(now, { weekStartsOn: 1 }), end: endOfWeek(now, { weekStartsOn: 1 }) };
    case "month":
      return { start: startOfMonth(now), end: endOfMonth(now) };
    case "quarter":
      return { start: startOfQuarter(now), end: endOfQuarter(now) };
  }
}

interface SDRConversionData {
  id: string;
  name: string;
  avatar_url: string | null;
  totalLeads: number;
  qualifiedLeads: number;
  meetingsScheduled: number;
  conversionRate: number;
}

function useSDRConversionRanking(period: PeriodFilter) {
  return useQuery({
    queryKey: ["sdr-conversion-ranking", period],
    queryFn: async (): Promise<SDRConversionData[]> => {
      const range = getPeriodRange(period);

      // Fetch SDRs
      const { data: sdrs } = await supabase
        .from("salespeople")
        .select("id, name, avatar_url")
        .in("role", ["sdr", "hybrid"])
        .eq("is_active", true);

      if (!sdrs || sdrs.length === 0) return [];

      const sdrIds = sdrs.map(s => s.id);

      // Fetch activities (meetings scheduled) and sales data in parallel
      const [activitiesResult, salesResult] = await Promise.all([
        supabase
          .from("activities")
          .select("salesperson_id, activity_type, outcome")
          .in("salesperson_id", sdrIds)
          .eq("activity_type", "meeting")
          .eq("outcome", "scheduled")
          .gte("created_at", range.start.toISOString())
          .lte("created_at", range.end.toISOString()),
        supabase
          .from("sales")
          .select("salesperson_id, status")
          .in("salesperson_id", sdrIds)
          .gte("created_at", range.start.toISOString())
          .lte("created_at", range.end.toISOString()),
      ]);

      const activities = activitiesResult.data || [];
      const sales = salesResult.data || [];

      // Aggregate per SDR
      const result = sdrs.map(sdr => {
        const sdrActivities = activities.filter(a => a.salesperson_id === sdr.id);
        const sdrSales = sales.filter(s => s.salesperson_id === sdr.id);
        
        const totalLeads = sdrSales.length;
        const qualifiedLeads = sdrSales.filter(s => 
          s.status === "qualified" || s.status === "proposal" || s.status === "negotiation" || s.status === "completed"
        ).length;
        const meetingsScheduled = sdrActivities.length;
        
        // Conversion rate: meetings scheduled / total leads
        const conversionRate = totalLeads > 0 ? (meetingsScheduled / totalLeads) * 100 : 0;

        return {
          id: sdr.id,
          name: sdr.name,
          avatar_url: sdr.avatar_url,
          totalLeads,
          qualifiedLeads,
          meetingsScheduled,
          conversionRate,
        };
      });

      // Sort by meetings scheduled (primary) and conversion rate (secondary)
      return result.sort((a, b) => {
        if (b.meetingsScheduled !== a.meetingsScheduled) {
          return b.meetingsScheduled - a.meetingsScheduled;
        }
        return b.conversionRate - a.conversionRate;
      });
    },
    staleTime: 60000,
  });
}

export function SDRConversionRanking({ period }: SDRConversionRankingProps) {
  const { data: sdrs, isLoading } = useSDRConversionRanking(period);

  const periodLabel = period === "week" ? "esta semana" : period === "month" ? "este mês" : "este trimestre";

  const maxMeetings = sdrs?.[0]?.meetingsScheduled || 1;

  if (isLoading) {
    return (
      <Card className="card-elevated">
        <CardHeader>
          <Skeleton className="h-6 w-48" />
        </CardHeader>
        <CardContent className="space-y-4">
          {[1, 2, 3].map(i => (
            <Skeleton key={i} className="h-16 w-full" />
          ))}
        </CardContent>
      </Card>
    );
  }

  if (!sdrs || sdrs.length === 0) {
    return (
      <Card className="card-elevated">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 font-display">
            <div className="p-2 rounded-lg gradient-primary">
              <ArrowRightLeft className="h-4 w-4 text-white" />
            </div>
            Conversão SDR→Closer
          </CardTitle>
        </CardHeader>
        <CardContent className="text-center py-8 text-muted-foreground">
          Nenhum SDR encontrado
        </CardContent>
      </Card>
    );
  }

  const totalMeetings = sdrs.reduce((sum, s) => sum + s.meetingsScheduled, 0);
  const totalQualified = sdrs.reduce((sum, s) => sum + s.qualifiedLeads, 0);

  return (
    <Card className="card-elevated">
      <CardHeader className="pb-2">
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2 font-display">
            <div className="p-2 rounded-lg gradient-primary">
              <ArrowRightLeft className="h-4 w-4 text-white" />
            </div>
            Conversão SDR→Closer
          </CardTitle>
          <div className="flex gap-2">
            <Badge variant="outline" className="text-xs">
              <CalendarCheck className="h-3 w-3 mr-1" />
              {totalMeetings} reuniões
            </Badge>
            <Badge variant="outline" className="text-xs bg-status-success/10 text-status-success border-status-success/30">
              <UserCheck className="h-3 w-3 mr-1" />
              {totalQualified} qualificados
            </Badge>
          </div>
        </div>
        <p className="text-sm text-muted-foreground">
          Reuniões qualificadas geradas por SDR {periodLabel}
        </p>
      </CardHeader>
      <CardContent className="space-y-3">
        {sdrs.map((sdr, index) => (
          <div
            key={sdr.id}
            className={cn(
              "p-3 rounded-lg transition-all duration-200",
              index === 0 
                ? "bg-primary/10 border border-primary/30 hover-glow" 
                : "bg-muted/50 hover:bg-muted"
            )}
          >
            <div className="flex items-center gap-3">
              {/* Rank */}
              <div className={cn(
                "flex items-center justify-center h-8 w-8 rounded-full font-bold text-sm",
                index === 0 && "bg-yellow-500/20 text-yellow-500",
                index === 1 && "bg-gray-400/20 text-gray-400",
                index === 2 && "bg-amber-700/20 text-amber-700",
                index > 2 && "bg-muted text-muted-foreground"
              )}>
                {index === 0 ? (
                  <Crown className="h-4 w-4" />
                ) : index < 3 ? (
                  <Medal className="h-4 w-4" />
                ) : (
                  `#${index + 1}`
                )}
              </div>

              {/* Avatar */}
              <Avatar className="h-10 w-10">
                <AvatarImage src={sdr.avatar_url || undefined} />
                <AvatarFallback className={cn(
                  "text-sm font-medium",
                  index === 0 ? "bg-primary/20 text-primary" : "bg-muted"
                )}>
                  {sdr.name.substring(0, 2).toUpperCase()}
                </AvatarFallback>
              </Avatar>

              {/* Info */}
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <span className="font-medium truncate">{sdr.name}</span>
                  {index === 0 && (
                    <Badge className="bg-primary/20 text-primary text-[10px]">
                      <TrendingUp className="h-3 w-3 mr-1" />
                      Top
                    </Badge>
                  )}
                </div>
                <div className="flex items-center gap-3 text-xs text-muted-foreground mt-0.5">
                  <span className="flex items-center gap-1">
                    <CalendarCheck className="h-3 w-3" />
                    {sdr.meetingsScheduled} reuniões
                  </span>
                  <span className="flex items-center gap-1">
                    <UserCheck className="h-3 w-3" />
                    {sdr.qualifiedLeads} qualificados
                  </span>
                </div>
              </div>

              {/* Conversion Rate */}
              <div className="text-right">
                <span className={cn(
                  "text-lg font-bold",
                  index === 0 ? "text-primary" : "text-foreground"
                )}>
                  {sdr.conversionRate.toFixed(0)}%
                </span>
                <p className="text-[10px] text-muted-foreground">conversão</p>
              </div>
            </div>

            {/* Progress bar */}
            <div className="mt-2">
              <Progress 
                value={(sdr.meetingsScheduled / maxMeetings) * 100} 
                className="h-1.5"
              />
            </div>
          </div>
        ))}

        {sdrs.length === 0 && (
          <div className="text-center py-6 text-muted-foreground">
            <ArrowRightLeft className="h-8 w-8 mx-auto mb-2 opacity-30" />
            <p className="text-sm">Nenhum dado de conversão encontrado</p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}