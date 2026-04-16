import React from "react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Calendar } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import { format, addDays } from "date-fns";
import { ptBR } from "date-fns/locale";

export const CalendarPreviewWidget = React.memo(function CalendarPreviewWidget() {
  const { salesperson } = useAuth();
  const today = format(new Date(), "yyyy-MM-dd");
  const nextWeek = format(addDays(new Date(), 7), "yyyy-MM-dd");

  const { data, isLoading } = useQuery({
    queryKey: ["calendar-preview-widget", salesperson?.id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("activities")
        .select("id, activity_type, contact_name, created_at")
        .eq("salesperson_id", salesperson!.id)
        .gte("created_at", `${today}T00:00:00`)
        .lte("created_at", `${nextWeek}T23:59:59`)
        .order("created_at", { ascending: true })
        .limit(5);
      if (error) throw error;
      return data || [];
    },
    enabled: !!salesperson?.id,
  });

  if (isLoading) return <Skeleton className="h-full w-full rounded-xl" />;

  return (
    <Card className="h-full">
      <CardHeader className="pb-2">
        <CardTitle className="text-xs font-medium text-muted-foreground flex items-center gap-1.5">
          <Calendar className="h-3.5 w-3.5 text-info" />
          Próximas Atividades
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-2">
        {data && data.length > 0 ? data.map(act => (
          <div key={act.id} className="flex items-center gap-2 p-1.5 rounded-md bg-muted/20">
            <div className="text-center shrink-0 w-10">
              <p className="text-xs font-bold">{format(new Date(act.created_at), "dd", { locale: ptBR })}</p>
              <p className="text-[9px] text-muted-foreground uppercase">{format(new Date(act.created_at), "MMM", { locale: ptBR })}</p>
            </div>
            <div className="min-w-0 flex-1">
              <p className="text-xs font-medium truncate">{act.contact_name || act.activity_type}</p>
              <p className="text-[10px] text-muted-foreground">{format(new Date(act.created_at), "HH:mm")}</p>
            </div>
          </div>
        )) : (
          <p className="text-xs text-muted-foreground text-center py-4">Nenhuma atividade agendada</p>
        )}
      </CardContent>
    </Card>
  );
});

CalendarPreviewWidget.displayName = "CalendarPreviewWidget";
