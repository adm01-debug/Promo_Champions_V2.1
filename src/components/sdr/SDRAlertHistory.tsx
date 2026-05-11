import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { History, AlertTriangle, Settings2, Check, X, Calendar } from "lucide-react";
import { subDays, subMonths, startOfDay } from "date-fns";
import { Skeleton } from "@/components/ui/skeleton";
import { toast } from "sonner";
import { AlertHistoryItem } from "./AlertHistoryItem";

interface SDRDetail {
  id: string;
  name: string;
  email: string | null;
  consecutiveDays: number;
  avgDeficit: number;
  dailyGoal: number;
}

interface SDRAlertHistoryItem {
  id: string;
  created_at: string;
  triggered_by: string;
  sdrs_notified: number;
  threshold_used: number;
  sdr_details: SDRDetail[];
  admin_emails: string[];
}

type PeriodFilter = "7d" | "30d" | "90d" | "all";

export function SDRAlertHistory() {
  const [isEditingThreshold, setIsEditingThreshold] = useState(false);
  const [isEditingRejection, setIsEditingRejection] = useState(false);
  const [thresholdValue, setThresholdValue] = useState("3");
  const [rejectionThreshold, setRejectionThreshold] = useState("30");
  const [periodFilter, setPeriodFilter] = useState<PeriodFilter>("30d");
  const queryClient = useQueryClient();


  // Get current threshold from notification_preferences
  const { data: preferences } = useQuery({
    queryKey: ["notification-preferences-threshold"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("notification_preferences")
        .select("consecutive_days_threshold")
        .limit(1)
        .single();

      if (error && error.code !== "PGRST116") throw error;
      return data?.consecutive_days_threshold || 3;
    },
    staleTime: 60000,
  });

  // Update threshold when loaded
  useState(() => {
    if (preferences) {
      setThresholdValue(String(preferences));
    }
  });

  const updateThresholdMutation = useMutation({
    mutationFn: async (newThreshold: number) => {
      const { error } = await supabase
        .from("notification_preferences")
        .update({ consecutive_days_threshold: newThreshold })
        .neq("id", "00000000-0000-0000-0000-000000000000"); // Update all rows
      
      if (error) throw error;
    },
    onSuccess: () => {
      toast.success("Threshold atualizado");
      setIsEditingThreshold(false);
      queryClient.invalidateQueries({ queryKey: ["notification-preferences-threshold"] });
    },
    onError: (error: Error) => {
      toast.error("Erro ao atualizar threshold", { description: error.message });
    },
  });

  const getDateFilter = () => {
    switch (periodFilter) {
      case "7d":
        return startOfDay(subDays(new Date(), 7)).toISOString();
      case "30d":
        return startOfDay(subDays(new Date(), 30)).toISOString();
      case "90d":
        return startOfDay(subMonths(new Date(), 3)).toISOString();
      default:
        return null;
    }
  };

  const { data: history, isLoading } = useQuery({
    queryKey: ["sdr-alert-history", periodFilter],
    queryFn: async () => {
      let query = supabase
        .from("sdr_alert_history")
        .select("*")
        .order("created_at", { ascending: false })
        .limit(50);

      const dateFilter = getDateFilter();
      if (dateFilter) {
        query = query.gte("created_at", dateFilter);
      }

      const { data, error } = await query;

      if (error) throw error;
      return (data || []).map(item => ({
        ...item,
        sdr_details: (Array.isArray(item.sdr_details) ? item.sdr_details : []) as unknown as SDRDetail[],
      })) as SDRAlertHistoryItem[];
    },
    staleTime: 60000,
  });

  const handleSaveThreshold = () => {
    const value = parseInt(thresholdValue);
    if (isNaN(value) || value < 1 || value > 30) {
      toast.error("Valor inválido", { description: "Insira um número entre 1 e 30" });
      return;
    }
    updateThresholdMutation.mutate(value);
  };

  if (isLoading) {
    return (
      <Card className="glass border-border/40">
        <CardHeader>
          <Skeleton className="h-6 w-48" />
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {[...Array(3)].map((_, i) => (
              <Skeleton key={i} className="h-20 w-full" />
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="glass border-border/40 hover-lift">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2 text-base font-display">
            <div className="p-1.5 rounded-md bg-gradient-to-br from-primary/20 to-primary/5">
              <History className="h-4 w-4 text-primary" />
            </div>
            Histórico de Alertas SDR
          </CardTitle>
          
          <div className="flex flex-wrap items-center gap-3">
            {/* Rejection Threshold Editor */}
            {isEditingRejection ? (
              <div className="flex items-center gap-1 bg-background/50 px-2 py-1 rounded-md border border-primary/20">
                <Input
                  type="number"
                  min={1}
                  max={100}
                  value={rejectionThreshold}
                  onChange={(e) => setRejectionThreshold(e.target.value)}
                  className="w-12 h-7 text-[10px] text-center"
                />
                <span className="text-[10px] text-muted-foreground">% Rejeição</span>
                <Button
                  size="icon"
                  variant="ghost"
                  className="h-6 w-6"
                  onClick={() => {
                    toast.success("Limite de rejeição atualizado");
                    setIsEditingRejection(false);
                  }}
                >
                  <Check className="h-3 w-3 text-success" />
                </Button>
                <Button
                  size="icon"
                  variant="ghost"
                  className="h-6 w-6"
                  onClick={() => setIsEditingRejection(false)}
                >
                  <X className="h-3 w-3 text-destructive" />
                </Button>
              </div>
            ) : (
              <Button
                variant="ghost"
                size="sm"
                className="h-8 text-[10px] gap-1.5 border border-dashed border-border/50"
                onClick={() => setIsEditingRejection(true)}
              >
                <AlertTriangle className="h-3 w-3 text-warning" />
                <span className="text-muted-foreground">Rejeição Max:</span>
                <span className="font-bold">{rejectionThreshold}%</span>
              </Button>
            )}

            {/* Period Filter */}
            <Select value={periodFilter} onValueChange={(v) => setPeriodFilter(v as PeriodFilter)}>
              <SelectTrigger className="w-[120px] h-8 text-xs">
                <Calendar className="h-3 w-3 mr-1" />
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="7d">Últimos 7d</SelectItem>
                <SelectItem value="30d">Últimos 30d</SelectItem>
                <SelectItem value="90d">Últimos 90d</SelectItem>
                <SelectItem value="all">Todos</SelectItem>
              </SelectContent>
            </Select>

            {/* Inline Threshold Editor */}
            {isEditingThreshold ? (
              <div className="flex items-center gap-1">
                <Input
                  type="number"
                  min={1}
                  max={30}
                  value={thresholdValue}
                  onChange={(e) => setThresholdValue(e.target.value)}
                  className="w-14 h-8 text-xs text-center"
                />
                <span className="text-xs text-muted-foreground">dias</span>
                <Button
                  size="icon"
                  variant="ghost"
                  className="h-7 w-7"
                  aria-label="Salvar limiar"
                  onClick={handleSaveThreshold}
                  disabled={updateThresholdMutation.isPending}
                >
                  <Check className="h-3.5 w-3.5 text-success" />
                </Button>
                <Button
                  size="icon" aria-label="Confirmar"
                  variant="ghost"
                  className="h-7 w-7"
                  onClick={() => {
                    setIsEditingThreshold(false);
                    setThresholdValue(String(preferences || 3));
                  }}
                >
                  <X className="h-3.5 w-3.5 text-destructive" />
                </Button>
              </div>
            ) : (
              <Button
                variant="ghost"
                size="sm"
                className="h-8 text-xs gap-1.5"
                onClick={() => {
                  setThresholdValue(String(preferences || 3));
                  setIsEditingThreshold(true);
                }}
              >
                <Settings2 className="h-3 w-3" />
                <span className="text-muted-foreground">Threshold:</span>
                <span className="font-medium">{preferences || 3}d</span>
              </Button>
            )}
          </div>
        </div>
      </CardHeader>
      <CardContent>
        {!history?.length ? (
          <div className="text-center py-8 text-muted-foreground">
            <AlertTriangle className="h-8 w-8 mx-auto mb-2 opacity-50" />
            <p className="text-sm">Nenhum alerta no período selecionado</p>
          </div>
        ) : (
          <ScrollArea className="h-[300px] pr-4">
            <div className="space-y-3">
              {history.map((item) => (
                <AlertHistoryItem key={item.id} item={item} />
              ))}
            </div>
          </ScrollArea>
        )}
      </CardContent>
    </Card>
  );
}
