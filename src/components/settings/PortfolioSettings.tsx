import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Slider } from "@/components/ui/slider";
import { Switch } from "@/components/ui/switch";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Briefcase, Clock, RotateCcw, Users, Save, Loader2 } from "lucide-react";
import { usePortfolioSettings, useUpdatePortfolioSetting, getSettingValue } from "@/hooks/usePortfolioSettings";

export function PortfolioSettings() {
  const { data: settings, isLoading } = usePortfolioSettings();
  const updateSetting = useUpdatePortfolioSetting();

  const [inactivityDays, setInactivityDays] = useState(365);
  const [rotationStrategy, setRotationStrategy] = useState('top_performer');
  const [autoReassign, setAutoReassign] = useState(false);
  const [minDaysBeforeReassign, setMinDaysBeforeReassign] = useState(30);
  const [hasChanges, setHasChanges] = useState(false);

  useEffect(() => {
    if (settings) {
      setInactivityDays(parseInt(getSettingValue(settings, 'inactivity_threshold_days')));
      setRotationStrategy(getSettingValue(settings, 'rotation_strategy'));
      setAutoReassign(getSettingValue(settings, 'auto_reassign_inactive') === 'true');
      setMinDaysBeforeReassign(parseInt(getSettingValue(settings, 'min_days_before_reassign')));
    }
  }, [settings]);

  const handleSave = async () => {
    await Promise.all([
      updateSetting.mutateAsync({
        key: 'inactivity_threshold_days',
        value: inactivityDays.toString(),
        description: 'Dias sem compra para cliente ser considerado inativo'
      }),
      updateSetting.mutateAsync({
        key: 'rotation_strategy',
        value: rotationStrategy,
        description: 'Estratégia de distribuição de leads'
      }),
      updateSetting.mutateAsync({
        key: 'auto_reassign_inactive',
        value: autoReassign.toString(),
        description: 'Reatribuir automaticamente clientes inativos'
      }),
      updateSetting.mutateAsync({
        key: 'min_days_before_reassign',
        value: minDaysBeforeReassign.toString(),
        description: 'Dias mínimos antes de permitir reatribuição'
      }),
    ]);
    setHasChanges(false);
  };

  const markChanged = () => setHasChanges(true);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center p-8">
        <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="bg-gradient-to-br from-card/80 to-card/40 border border-border/20 shadow-2xl backdrop-blur-md rounded-2xl overflow-hidden">
        <div className="p-6 border-b border-border/10">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-primary/10">
              <Briefcase className="h-5 w-5 text-primary" />
            </div>
            <div>
              <h3 className="font-display font-black text-lg uppercase tracking-tighter italic">Portfolio Directives</h3>
              <p className="text-[10px] font-bold text-muted-foreground/60 uppercase tracking-widest mt-1">
                Manage client inactivity and tactical redistribution
              </p>
            </div>
          </div>
        </div>
        <div className="p-6 space-y-8">

          {/* Inactivity Threshold */}
          <div className="space-y-4">
            <div className="flex items-center gap-2">
              <Clock className="h-4 w-4 text-muted-foreground" />
              <Label className="text-base font-medium">Threshold de Inatividade</Label>
            </div>
            <p className="text-sm text-muted-foreground">
              Clientes sem compras por mais de {inactivityDays} dias serão considerados inativos.
            </p>
            <div className="space-y-2">
              <Slider
                value={[inactivityDays]}
                onValueChange={(v) => { setInactivityDays(v[0]); markChanged(); }}
                min={90}
                max={365}
                step={30}
                className="w-full"
              />
              <div className="flex justify-between text-xs text-muted-foreground">
                <span>90 dias</span>
                <span className="font-medium text-foreground">{inactivityDays} dias</span>
                <span>365 dias</span>
              </div>
            </div>
          </div>

          {/* Rotation Strategy */}
          <div className="space-y-4">
            <div className="flex items-center gap-2">
              <RotateCcw className="h-4 w-4 text-muted-foreground" />
              <Label className="text-base font-medium">Estratégia de Rotação</Label>
            </div>
            <p className="text-sm text-muted-foreground">
              Como novos leads devem ser distribuídos entre os Closers.
            </p>
            <Select 
              value={rotationStrategy} 
              onValueChange={(v) => { setRotationStrategy(v); markChanged(); }}
            >
              <SelectTrigger className="w-full">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="top_performer">
                  <div className="flex flex-col">
                    <span>Top Performer</span>
                    <span className="text-xs text-muted-foreground">
                      Prioriza vendedores com melhor performance
                    </span>
                  </div>
                </SelectItem>
                <SelectItem value="round_robin">
                  <div className="flex flex-col">
                    <span>Round Robin</span>
                    <span className="text-xs text-muted-foreground">
                      Distribuição igualitária sequencial
                    </span>
                  </div>
                </SelectItem>
                <SelectItem value="balanced_load">
                  <div className="flex flex-col">
                    <span>Carga Balanceada</span>
                    <span className="text-xs text-muted-foreground">
                      Equilibra quantidade de clientes ativos
                    </span>
                  </div>
                </SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Auto Reassign */}
          <div className="space-y-4">
            <div className="flex items-center gap-2">
              <Users className="h-4 w-4 text-muted-foreground" />
              <Label className="text-base font-medium">Reatribuição Automática</Label>
            </div>
            <div className="flex items-center justify-between p-4 rounded-lg bg-muted/50">
              <div className="space-y-1">
                <p className="text-sm font-medium">Reatribuir clientes inativos automaticamente</p>
                <p className="text-xs text-muted-foreground">
                  Clientes inativos serão redistribuídos conforme a estratégia de rotação
                </p>
              </div>
              <Switch
                checked={autoReassign}
                onCheckedChange={(v) => { setAutoReassign(v); markChanged(); }}
              />
            </div>

            {autoReassign && (
              <div className="space-y-2 pl-4 border-l-2 border-primary/30">
                <Label className="text-sm">Dias mínimos antes de reatribuir</Label>
                <Slider
                  value={[minDaysBeforeReassign]}
                  onValueChange={(v) => { setMinDaysBeforeReassign(v[0]); markChanged(); }}
                  min={7}
                  max={90}
                  step={7}
                  className="w-full"
                />
                <div className="flex justify-between text-xs text-muted-foreground">
                  <span>7 dias</span>
                  <span className="font-medium text-foreground">{minDaysBeforeReassign} dias</span>
                  <span>90 dias</span>
                </div>
              </div>
            )}
          </div>

          {/* Save Button */}
          <div className="flex justify-end pt-4 border-t">
            <Button
              onClick={handleSave}
              disabled={!hasChanges || updateSetting.isPending}
              className="gap-2"
            >
              {updateSetting.isPending ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <Save className="h-4 w-4" />
              )}
              Salvar Configurações
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
