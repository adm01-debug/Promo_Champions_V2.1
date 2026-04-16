import React from "react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Clock } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import { formatDistanceToNow } from "date-fns";
import { ptBR } from "date-fns/locale";

const TYPE_LABELS: Record<string, string> = {
  call: "Ligação", email: "Email", meeting: "Reunião", whatsapp: "WhatsApp", linkedin: "LinkedIn",
};

export const RecentActivitiesWidget = React.memo(function RecentActivitiesWidget() {
  const { salesperson } = useAuth();

  const { data, isLoading } = useQuery({
    queryKey: ["recent-activities-widget", salesperson?.id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("activities")
        .select("id, activity_type, contact_name, outcome, created_at")
        .eq("salesperson_id", salesperson!.id)
        .order("created_at", { ascending: false })
        .limit(6);
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
          <Clock className="h-3.5 w-3.5" />
          Atividades Recentes
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-1.5">
        {data && data.length > 0 ? data.map(act => (
          <div key={act.id} className="flex items-center gap-2 p-1.5 rounded-md hover:bg-muted/30 transition-colors">
            <Badge variant="outline" className="text-[9px] shrink-0">
              {TYPE_LABELS[act.activity_type] || act.activity_type}
            </Badge>
            <span className="text-xs truncate flex-1">{act.contact_name || "—"}</span>
            <span className="text-[10px] text-muted-foreground shrink-0">
              {formatDistanceToNow(new Date(act.created_at), { addSuffix: true, locale: ptBR })}
            </span>
          </div>
        )) : (
          <p className="text-xs text-muted-foreground text-center py-4">Sem atividades recentes</p>
        )}
      </CardContent>
    </Card>
  );
});

RecentActivitiesWidget.displayName = "RecentActivitiesWidget";
