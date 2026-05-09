import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Bell, ShieldAlert, TrendingDown, Save } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/components/ui/use-toast";

export function SDRAlertSettings() {
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [configs, setConfigs] = useState({
    rejection_rate: { active: true, threshold: 40 },
    no_answer_rate: { active: true, threshold: 60 },
    low_activity: { active: false, threshold: 20 },
  });

  const handleSave = async () => {
    setLoading(true);
    try {
      const { data: userData } = await supabase.auth.getUser();
      if (!userData.user) return;

      const upsertData = Object.entries(configs).map(([type, config]) => ({
        user_id: userData.user.id,
        metric_type: type,
        threshold_value: config.threshold,
        is_active: config.active,
      }));

      const { error } = await supabase
        .from('sdr_alert_configs')
        .upsert(upsertData, { onConflict: 'user_id,metric_type' });

      if (error) throw error;

      toast({
        title: "Configurações salvas",
        description: "Seus alertas automáticos foram atualizados com sucesso.",
      });
    } catch (error) {
      console.error(error);
      toast({
        title: "Erro ao salvar",
        description: "Ocorreu um erro ao tentar salvar suas configurações.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card className="glass border-border/40 dark:border-glow">
      <CardHeader>
        <CardTitle className="text-sm font-display font-medium flex items-center gap-2">
          <Bell className="h-4 w-4 text-primary" />
          Alertas Automáticos SDR
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label className="text-xs font-bold uppercase tracking-wider">Taxa de Rejeição Crítica</Label>
              <p className="text-[10px] text-muted-foreground">Alerta quando "Sem Interesse" supera este %</p>
            </div>
            <div className="flex items-center gap-4">
              <Input 
                type="number" 
                className="w-16 h-8 text-xs text-center" 
                value={configs.rejection_rate.threshold}
                onChange={(e) => setConfigs({
                  ...configs, 
                  rejection_rate: { ...configs.rejection_rate, threshold: Number(e.target.value) }
                })}
              />
              <Switch 
                checked={configs.rejection_rate.active}
                onCheckedChange={(checked) => setConfigs({
                  ...configs, 
                  rejection_rate: { ...configs.rejection_rate, active: checked }
                })}
              />
            </div>
          </div>

          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label className="text-xs font-bold uppercase tracking-wider">Taxa de "Não Atendeu"</Label>
              <p className="text-[10px] text-muted-foreground">Alerta quando a produtividade de voz cai</p>
            </div>
            <div className="flex items-center gap-4">
              <Input 
                type="number" 
                className="w-16 h-8 text-xs text-center" 
                value={configs.no_answer_rate.threshold}
                onChange={(e) => setConfigs({
                  ...configs, 
                  no_answer_rate: { ...configs.no_answer_rate, threshold: Number(e.target.value) }
                })}
              />
              <Switch 
                checked={configs.no_answer_rate.active}
                onCheckedChange={(checked) => setConfigs({
                  ...configs, 
                  no_answer_rate: { ...configs.no_answer_rate, active: checked }
                })}
              />
            </div>
          </div>
        </div>

        <Button 
          className="w-full h-9 text-xs font-bold gap-2" 
          onClick={handleSave}
          disabled={loading}
        >
          <Save className="h-3 w-3" />
          {loading ? "Salvando..." : "Salvar Configurações"}
        </Button>
      </CardContent>
    </Card>
  );
}
