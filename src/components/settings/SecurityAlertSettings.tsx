import { useState, useEffect } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useUserRoles } from "@/hooks/useUserRoles";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Skeleton } from "@/components/ui/skeleton";
import { ShieldCheck, Settings2, Loader2, AlertTriangle } from "lucide-react";
import { toast } from "@/hooks/use-toast";

interface SecurityAlertSettingsData {
  id: string;
  spike_threshold: number;
  time_window_hours: number;
  cooldown_hours: number;
}

export function SecurityAlertSettings() {
  const { isAdmin, isLoadingCurrentRole } = useUserRoles();
  const queryClient = useQueryClient();
  
  const [spikeThreshold, setSpikeThreshold] = useState(5);
  const [timeWindowHours, setTimeWindowHours] = useState(1);
  const [cooldownHours, setCooldownHours] = useState(24);

  const { data: settings, isLoading } = useQuery({
    queryKey: ["security-alert-settings"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("security_alert_settings")
        .select("*")
        .limit(1)
        .single();
      
      if (error) throw error;
      return data as SecurityAlertSettingsData;
    },
    enabled: isAdmin,
  });

  useEffect(() => {
    if (settings) {
      setSpikeThreshold(settings.spike_threshold);
      setTimeWindowHours(settings.time_window_hours);
      setCooldownHours(settings.cooldown_hours);
    }
  }, [settings]);

  const updateMutation = useMutation({
    mutationFn: async (data: Partial<SecurityAlertSettingsData>) => {
      if (!settings?.id) throw new Error("Settings not found");
      
      const { error } = await supabase
        .from("security_alert_settings")
        .update(data)
        .eq("id", settings.id);
      
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["security-alert-settings"] });
      toast({
        title: "Configurações salvas",
        description: "As configurações de alerta foram atualizadas.",
      });
    },
    onError: (error: any) => {
      toast({
        title: "Erro ao salvar",
        description: error.message || "Não foi possível salvar as configurações.",
        variant: "destructive",
      });
    },
  });

  const handleSave = () => {
    if (spikeThreshold < 1 || timeWindowHours < 1 || cooldownHours < 1) {
      toast({
        title: "Valores inválidos",
        description: "Todos os valores devem ser maiores que zero.",
        variant: "destructive",
      });
      return;
    }

    updateMutation.mutate({
      spike_threshold: spikeThreshold,
      time_window_hours: timeWindowHours,
      cooldown_hours: cooldownHours,
    });
  };

  if (isLoadingCurrentRole || isLoading) {
    return (
      <Card>
        <CardHeader>
          <Skeleton className="h-6 w-48" />
          <Skeleton className="h-4 w-64" />
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <Skeleton className="h-10 w-full" />
            <Skeleton className="h-10 w-full" />
            <Skeleton className="h-10 w-full" />
          </div>
        </CardContent>
      </Card>
    );
  }

  if (!isAdmin) {
    return null;
  }

  const hasChanges = settings && (
    spikeThreshold !== settings.spike_threshold ||
    timeWindowHours !== settings.time_window_hours ||
    cooldownHours !== settings.cooldown_hours
  );

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Settings2 className="h-5 w-5 text-primary" />
          Configurações de Alerta de Segurança
        </CardTitle>
        <CardDescription>
          Configure os parâmetros para detecção de picos de tentativas de acesso negado
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="grid gap-6 sm:grid-cols-3">
          <div className="space-y-2">
            <Label htmlFor="spike-threshold" className="flex items-center gap-2">
              <AlertTriangle className="h-4 w-4 text-warning" />
              Limite de Pico
            </Label>
            <Input
              id="spike-threshold"
              type="number"
              min={1}
              max={100}
              value={spikeThreshold}
              onChange={(e) => setSpikeThreshold(parseInt(e.target.value) || 1)}
            />
            <p className="text-xs text-muted-foreground">
              Número de tentativas por usuário para disparar alerta
            </p>
          </div>

          <div className="space-y-2">
            <Label htmlFor="time-window" className="flex items-center gap-2">
              <ShieldCheck className="h-4 w-4 text-primary" />
              Janela de Tempo (horas)
            </Label>
            <Input
              id="time-window"
              type="number"
              min={1}
              max={48}
              value={timeWindowHours}
              onChange={(e) => setTimeWindowHours(parseInt(e.target.value) || 1)}
            />
            <p className="text-xs text-muted-foreground">
              Período para contagem de tentativas
            </p>
          </div>

          <div className="space-y-2">
            <Label htmlFor="cooldown" className="flex items-center gap-2">
              <ShieldCheck className="h-4 w-4 text-muted-foreground" />
              Cooldown (horas)
            </Label>
            <Input
              id="cooldown"
              type="number"
              min={1}
              max={168}
              value={cooldownHours}
              onChange={(e) => setCooldownHours(parseInt(e.target.value) || 1)}
            />
            <p className="text-xs text-muted-foreground">
              Tempo entre alertas do mesmo tipo
            </p>
          </div>
        </div>

        <div className="flex justify-end">
          <Button
            onClick={handleSave}
            disabled={updateMutation.isPending || !hasChanges}
            className="gap-2"
          >
            {updateMutation.isPending ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <ShieldCheck className="h-4 w-4" />
            )}
            Salvar Configurações
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
