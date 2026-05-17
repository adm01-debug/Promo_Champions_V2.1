import React from "react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import { MessageSquare, Phone, Mail, Calendar, User, ArrowRight } from "lucide-react";
import { cn } from "@/lib/utils";

interface SDRHandoffContextProps {
  saleId: string;
}

const activityIcons: Record<string, any> = {
  call: Phone,
  email: Mail,
  whatsapp: MessageSquare,
  meeting: Calendar,
  note: MessageSquare,
};

export const SDRHandoffContext: React.FC<SDRHandoffContextProps> = ({ saleId }) => {
  const { data: activities, isLoading } = useQuery({
    queryKey: ["sdr-handoff-activities", saleId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("activities")
        .select(`
          *,
          salesperson:salespeople(name, role, avatar_url)
        `)
        .eq("sale_id", saleId)
        .order("created_at", { ascending: false });

      if (error) throw error;
      return data;
    },
    enabled: !!saleId,
  });

  if (isLoading) {
    return (
      <Card className="glass border-border/40">
        <CardHeader className="pb-2">
          <Skeleton className="h-5 w-40" />
        </CardHeader>
        <CardContent className="space-y-4">
          {[...Array(3)].map((_, i) => (
            <div key={i} className="flex gap-3">
              <Skeleton className="h-8 w-8 rounded-full" />
              <div className="flex-1 space-y-2">
                <Skeleton className="h-4 w-3/4" />
                <Skeleton className="h-3 w-1/2" />
              </div>
            </div>
          ))}
        </CardContent>
      </Card>
    );
  }

  const sdrActivities = activities?.filter(a => a.salesperson?.role === 'sdr') || [];

  if (sdrActivities.length === 0) return null;

  return (
    <Card className="glass border-border/40 overflow-hidden">
      <CardHeader className="pb-2 bg-muted/10">
        <CardTitle className="text-sm font-medium flex items-center gap-2">
          <ArrowRight className="h-4 w-4 text-primary" />
          Contexto de Prospecção (SDR)
        </CardTitle>
      </CardHeader>
      <CardContent className="pt-4">
        <div className="space-y-6 relative">
          {/* Vertical line */}
          <div className="absolute left-[15px] top-2 bottom-2 w-px bg-border/50" />
          
          {sdrActivities.map((activity, index) => {
            const Icon = activityIcons[activity.activity_type as string] || MessageSquare;
            return (
              <div key={activity.id} className="flex gap-4 relative group">
                <div className={cn(
                  "h-8 w-8 rounded-full flex items-center justify-center z-10 border transition-all duration-300",
                  "bg-background border-border group-hover:border-primary/50 group-hover:shadow-[0_0_10px_rgba(var(--primary),0.2)]"
                )}>
                  <Icon className="h-4 w-4 text-muted-foreground group-hover:text-primary transition-colors" />
                </div>
                
                <div className="flex-1 space-y-1 pb-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-semibold">{activity.salesperson?.name}</span>
                      <Badge variant="outline" className="text-[10px] h-4 px-1 capitalize">
                        {activity.activity_type as string}
                      </Badge>
                    </div>
                    <span className="text-[10px] text-muted-foreground">
                      {format(new Date(activity.created_at), "dd/MM/yyyy HH:mm", { locale: ptBR })}
                    </span>
                  </div>
                  
                  {activity.notes && (
                    <p className="text-xs text-muted-foreground bg-muted/20 p-2 rounded-lg border border-border/30 italic">
                      "{activity.notes}"
                    </p>
                  )}
                  
                  {activity.outcome && (
                    <div className="flex items-center gap-1.5 pt-1">
                      <div className="h-1 w-1 rounded-full bg-success" />
                      <span className="text-[10px] font-medium text-success uppercase tracking-wider">
                        {String(activity.outcome).replace(/_/g, ' ')}
                      </span>
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </CardContent>
    </Card>
  );
};
