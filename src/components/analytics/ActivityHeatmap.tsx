import { useMemo } from "react";
import { motion } from "framer-motion";
import { Flame, Calendar } from "lucide-react";
import { format, eachDayOfInterval, subDays, startOfWeek, isSameDay } from "date-fns";
import { ptBR } from "date-fns/locale";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";

interface ActivityData {
  date: string;
  count: number;
}

interface ActivityHeatmapProps {
  data?: ActivityData[];
  title?: string;
  className?: string;
}

const DAYS_TO_SHOW = 365;
const WEEK_DAYS = ["Dom", "Seg", "Ter", "Qua", "Qui", "Sex", "Sáb"];
const MONTHS = ["Jan", "Fev", "Mar", "Abr", "Mai", "Jun", "Jul", "Ago", "Set", "Out", "Nov", "Dez"];

function getActivityLevel(count: number): 0 | 1 | 2 | 3 | 4 {
  if (count === 0) return 0;
  if (count <= 2) return 1;
  if (count <= 5) return 2;
  if (count <= 10) return 3;
  return 4;
}

const levelColors: Record<number, string> = {
  0: "bg-muted/50",
  1: "bg-primary/25",
  2: "bg-primary/50",
  3: "bg-primary/75",
  4: "bg-primary",
};

const levelGlow: Record<number, string> = {
  0: "",
  1: "",
  2: "",
  3: "shadow-[0_0_4px_hsl(var(--primary)/0.3)]",
  4: "shadow-[0_0_8px_hsl(var(--primary)/0.5)]",
};

export function ActivityHeatmap({
  data: externalData,
  title = "Atividade Anual",
  className
}: ActivityHeatmapProps) {
  const { salesperson } = useAuth();

  const { data: fetchedData } = useQuery({
    queryKey: ["activity-heatmap", salesperson?.id],
    queryFn: async () => {
      if (!salesperson?.id) return [];
      const startDate = subDays(new Date(), DAYS_TO_SHOW);
      const { data, error } = await supabase
        .from("activities")
        .select("created_at")
        .eq("salesperson_id", salesperson.id)
        .gte("created_at", startDate.toISOString());
      if (error) return [];
      const countMap = new Map<string, number>();
      data.forEach((a) => {
        const key = format(new Date(a.created_at), "yyyy-MM-dd");
        countMap.set(key, (countMap.get(key) || 0) + 1);
      });
      return Array.from(countMap.entries()).map(([date, count]) => ({ date, count }));
    },
    enabled: !externalData && !!salesperson?.id,
  });

  const data = externalData || fetchedData || [];

  const today = new Date();
  const startDate = startOfWeek(subDays(today, DAYS_TO_SHOW - 1));

  const calendarData = useMemo(() => {
    const days = eachDayOfInterval({ start: startDate, end: today });
    const activityMap = new Map<string, number>();

    data.forEach((item) => {
      const dateKey = format(new Date(item.date), "yyyy-MM-dd");
      activityMap.set(dateKey, (activityMap.get(dateKey) || 0) + item.count);
    });

    const weeks: { date: Date; count: number; level: 0 | 1 | 2 | 3 | 4 }[][] = [];
    let currentWeek: { date: Date; count: number; level: 0 | 1 | 2 | 3 | 4 }[] = [];

    days.forEach((day, index) => {
      const dateKey = format(day, "yyyy-MM-dd");
      const count = activityMap.get(dateKey) || 0;
      const level = getActivityLevel(count);

      currentWeek.push({ date: day, count, level });

      if (currentWeek.length === 7 || index === days.length - 1) {
        weeks.push(currentWeek);
        currentWeek = [];
      }
    });

    return weeks;
  }, [data, startDate, today]);

  const totalActivities = useMemo(() =>
    data.reduce((sum, item) => sum + item.count, 0),
    [data]
  );

  const activeDays = useMemo(() =>
    data.filter(item => item.count > 0).length,
    [data]
  );

  const monthLabels = useMemo(() => {
    const labels: { month: string; weekIndex: number }[] = [];
    let lastMonth = -1;

    calendarData.forEach((week, weekIndex) => {
      const firstDay = week[0];
      if (firstDay) {
        const month = firstDay.date.getMonth();
        if (month !== lastMonth) {
          labels.push({ month: MONTHS[month], weekIndex });
          lastMonth = month;
        }
      }
    });

    return labels;
  }, [calendarData]);

  return (
    <Card className={cn("overflow-hidden", className)}>
      <CardHeader className="pb-2">
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2 text-base">
            <Calendar className="h-4 w-4 text-primary" />
            {title}
          </CardTitle>
          <div className="flex items-center gap-4 text-xs text-muted-foreground">
            <span className="flex items-center gap-1">
              <Flame className="h-3 w-3 text-streak" />
              {totalActivities} atividades
            </span>
            <span>{activeDays} dias ativos</span>
          </div>
        </div>
      </CardHeader>

      <CardContent className="overflow-x-auto pb-4">
        {/* Month labels */}
        <div className="flex mb-1 ml-8">
          {monthLabels.map((label, i) => (
            <div
              key={i}
              className="text-[10px] text-muted-foreground"
              style={{
                position: "relative",
                left: `${label.weekIndex * 14}px`,
                marginRight: i < monthLabels.length - 1
                  ? `${((monthLabels[i + 1]?.weekIndex || 0) - label.weekIndex) * 14 - 24}px`
                  : 0,
              }}
            >
              {label.month}
            </div>
          ))}
        </div>

        <div className="flex gap-0.5">
          {/* Day labels */}
          <div className="flex flex-col gap-0.5 mr-1">
            {WEEK_DAYS.map((day, i) => (
              <div key={day} className="h-[12px] flex items-center">
                {i % 2 === 1 && (
                  <span className="text-[9px] text-muted-foreground w-6 text-right">
                    {day}
                  </span>
                )}
              </div>
            ))}
          </div>

          {/* Grid */}
          <TooltipProvider delayDuration={100}>
            <div className="flex gap-[2px]">
              {calendarData.map((week, weekIndex) => (
                <div key={weekIndex} className="flex flex-col gap-[2px]">
                  {week.map((day, dayIndex) => (
                    <Tooltip key={dayIndex}>
                      <TooltipTrigger asChild>
                        <motion.div
                          initial={{ opacity: 0, scale: 0.5 }}
                          animate={{ opacity: 1, scale: 1 }}
                          transition={{
                            delay: weekIndex * 0.005 + dayIndex * 0.01,
                            duration: 0.2,
                          }}
                          className={cn(
                            "w-[12px] h-[12px] rounded-[2px] cursor-pointer transition-all hover:ring-1 hover:ring-foreground/30",
                            levelColors[day.level],
                            levelGlow[day.level],
                            isSameDay(day.date, today) && "ring-1 ring-primary"
                          )}
                        />
                      </TooltipTrigger>
                      <TooltipContent side="top" className="text-xs">
                        <p className="font-medium">
                          {format(day.date, "d 'de' MMMM, yyyy", { locale: ptBR })}
                        </p>
                        <p className="text-muted-foreground">
                          {day.count} {day.count === 1 ? "atividade" : "atividades"}
                        </p>
                      </TooltipContent>
                    </Tooltip>
                  ))}
                </div>
              ))}
            </div>
          </TooltipProvider>
        </div>

        {/* Legend */}
        <div className="flex items-center gap-2 mt-3 ml-8">
          <span className="text-[10px] text-muted-foreground">Menos</span>
          {[0, 1, 2, 3, 4].map((level) => (
            <div
              key={level}
              className={cn(
                "w-[12px] h-[12px] rounded-[2px]",
                levelColors[level]
              )}
            />
          ))}
          <span className="text-[10px] text-muted-foreground">Mais</span>
        </div>
      </CardContent>
    </Card>
  );
}
