import { useState } from "react";
import { Bell, Plus, Trash2, Mail, Clock, AlertTriangle, Users, Target, Loader2, TrendingDown, Check, X, Pencil } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Switch } from "@/components/ui/switch";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Skeleton } from "@/components/ui/skeleton";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  useNotificationPreferences, 
  useCreateNotificationPreference, 
  useUpdateNotificationPreference,
  useDeleteNotificationPreference,
  NotificationPreference
} from "@/hooks/useNotificationPreferences";
import { SoundSettings } from "@/components/settings/SoundSettings";
import { SDRAlertHistory } from "@/components/sdr/SDRAlertHistory";
import { TestSDRAlertButton } from "@/components/sdr/TestSDRAlertButton";
import { BrowserPushSettings } from "@/components/settings/BrowserPushSettings";
import { NotificationCenter } from "@/components/notifications/NotificationCenter";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { NotificacoesLoadingSkeleton } from "@/components/skeletons/PageLoadingSkeleton";
import { SkeletonTransition } from "@/components/skeletons/SkeletonTransition";

const frequencyLabels = {
  realtime: "Tempo real",
  daily: "Diário",
  weekly: "Semanal",
};

interface EditingThreshold {
  id: string;
  field: 'stagnant_threshold_days' | 'inactive_threshold_days' | 'consecutive_days_threshold';
  value: number;
}

export default function Notificacoes() {
  const { data: preferences, isLoading } = useNotificationPreferences();
  const createPreference = useCreateNotificationPreference();
  const updatePreference = useUpdateNotificationPreference();
  const deletePreference = useDeleteNotificationPreference();

  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isTesting, setIsTesting] = useState<string | null>(null);
  const [editingThreshold, setEditingThreshold] = useState<EditingThreshold | null>(null);
  const [newPreference, setNewPreference] = useState<{
    email: string;
    frequency: "realtime" | "daily" | "weekly";
    notify_stagnant_deals: boolean;
    notify_inactive_clients: boolean;
    notify_at_risk_goals: boolean;
    stagnant_threshold_days: number;
    inactive_threshold_days: number;
    consecutive_days_threshold: number;
    preferred_time: string;
    is_active: boolean;
  }>({
    email: "",
    frequency: "daily",
    notify_stagnant_deals: true,
    notify_inactive_clients: true,
    notify_at_risk_goals: true,
    stagnant_threshold_days: 14,
    inactive_threshold_days: 60,
    consecutive_days_threshold: 3,
    preferred_time: "08:00",
    is_active: true,
  });

  const handleCreate = async () => {
    if (!newPreference.email) {
      toast.error("Email é obrigatório");
      return;
    }
    await createPreference.mutateAsync(newPreference);
    setIsDialogOpen(false);
    setNewPreference({
      email: "",
      frequency: "daily",
      notify_stagnant_deals: true,
      notify_inactive_clients: true,
      notify_at_risk_goals: true,
      stagnant_threshold_days: 14,
      inactive_threshold_days: 60,
      consecutive_days_threshold: 3,
      preferred_time: "08:00",
      is_active: true,
    });
  };

  const handleToggleActive = async (pref: NotificationPreference) => {
    await updatePreference.mutateAsync({ id: pref.id, is_active: !pref.is_active });
  };

  const handleToggleAlertType = async (pref: NotificationPreference, field: keyof NotificationPreference) => {
    await updatePreference.mutateAsync({ 
      id: pref.id, 
      [field]: !pref[field] 
    });
  };

  const handleStartEditThreshold = (pref: NotificationPreference, field: EditingThreshold['field']) => {
    setEditingThreshold({
      id: pref.id,
      field,
      value: pref[field] as number,
    });
  };

  const handleSaveThreshold = async () => {
    if (!editingThreshold) return;
    
    await updatePreference.mutateAsync({
      id: editingThreshold.id,
      [editingThreshold.field]: editingThreshold.value,
    });
    setEditingThreshold(null);
    toast.success("Threshold atualizado!");
  };

  const handleCancelEditThreshold = () => {
    setEditingThreshold(null);
  };

  const handleTestNotification = async (pref: NotificationPreference) => {
    setIsTesting(pref.id);
    try {
      const { data, error } = await supabase.functions.invoke("send-alert-notifications", {
        body: { recipientEmail: pref.email },
      });

      if (error) throw error;

      if (data.alertsSent === 0) {
        toast.info("Nenhum alerta crítico para enviar");
      } else {
        toast.success(`${data.alertsSent} alerta(s) enviado(s) para ${pref.email}`);
      }
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : 'Erro desconhecido';
      toast.error("Erro ao enviar: " + message);
    } finally {
      setIsTesting(null);
    }
  };

  const renderThresholdButton = (
    pref: NotificationPreference, 
    field: EditingThreshold['field'],
    label: string,
    icon: React.ReactNode,
    colorClasses: string,
    enabled: boolean
  ) => {
    const isEditing = editingThreshold?.id === pref.id && editingThreshold?.field === field;
    const value = pref[field] as number;

    if (isEditing) {
      return (
        <div className="flex items-center gap-1 px-2 py-1 rounded-full bg-muted">
          <Input
            type="number"
            min={1}
            max={field === 'consecutive_days_threshold' ? 14 : 365}
            value={editingThreshold.value}
            onChange={(e) => setEditingThreshold({ 
              ...editingThreshold, 
              value: parseInt(e.target.value) || 1 
            })}
            className="h-6 w-14 text-xs px-1 text-center"
            autoFocus
            onKeyDown={(e) => {
              if (e.key === 'Enter') handleSaveThreshold();
              if (e.key === 'Escape') handleCancelEditThreshold();
            }}
          />
          <button
            onClick={handleSaveThreshold}
            className="p-0.5 rounded hover:bg-primary/20 transition-colors"
          >
            <Check className="h-3.5 w-3.5 text-status-success" />
          </button>
          <button
            onClick={handleCancelEditThreshold}
            className="p-0.5 rounded hover:bg-destructive/20 transition-colors"
          >
            <X className="h-3.5 w-3.5 text-destructive" />
          </button>
        </div>
      );
    }

    return (
      <button
        onClick={() => enabled ? handleToggleAlertType(pref, field.replace('_threshold_days', '').replace('consecutive_days_', '') === 'stagnant' ? 'notify_stagnant_deals' : field.includes('inactive') ? 'notify_inactive_clients' : 'notify_at_risk_goals' as keyof NotificationPreference) : null}
        className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium transition-all group ${colorClasses}`}
      >
        {icon}
        <span>{label}</span>
        <button
          onClick={(e) => {
            e.stopPropagation();
            handleStartEditThreshold(pref, field);
          }}
          className="flex items-center gap-0.5 px-1.5 py-0.5 rounded bg-background/50 hover:bg-background/80 transition-colors ml-1"
        >
          <span>{value}d</span>
          <Pencil className="h-2.5 w-2.5 opacity-0 group-hover:opacity-100 transition-opacity" />
        </button>
      </button>
    );
  };

  return (
    <SkeletonTransition
      isLoading={isLoading}
      skeleton={<NotificacoesLoadingSkeleton />}
      duration={400}
    >
      <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold gradient-text">Notificações</h1>
          <p className="text-muted-foreground mt-1">
            Central de notificações e configurações de alertas
          </p>
        </div>
      </div>

      <Tabs defaultValue="central" className="space-y-6">
        <TabsList>
          <TabsTrigger value="central">Central de Notificações</TabsTrigger>
          <TabsTrigger value="configuracoes">Configurações</TabsTrigger>
          <TabsTrigger value="sons">Sons</TabsTrigger>
        </TabsList>

        <TabsContent value="central" className="space-y-6">
          <NotificationCenter />
        </TabsContent>

        <TabsContent value="configuracoes" className="space-y-6">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-semibold">Destinatários de Alertas</h2>
            <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
              <DialogTrigger asChild>
            <Button className="gradient-primary">
              <Plus className="h-4 w-4 mr-2" />
              Nova Configuração
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[500px]">
            <DialogHeader>
              <DialogTitle>Nova Configuração de Notificação</DialogTitle>
              <DialogDescription>
                Configure um novo destinatário para receber alertas do sistema
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4 py-4">
              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="email@exemplo.com"
                  value={newPreference.email}
                  onChange={(e) => setNewPreference({ ...newPreference, email: e.target.value })}
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Frequência</Label>
                  <Select
                    value={newPreference.frequency}
                    onValueChange={(value) => 
                      setNewPreference({ ...newPreference, frequency: value as "realtime" | "daily" | "weekly" })
                    }
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="realtime">Tempo real</SelectItem>
                      <SelectItem value="daily">Diário</SelectItem>
                      <SelectItem value="weekly">Semanal</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label>Horário preferido</Label>
                  <Input
                    type="time"
                    value={newPreference.preferred_time}
                    onChange={(e) => setNewPreference({ ...newPreference, preferred_time: e.target.value })}
                  />
                </div>
              </div>
              <div className="space-y-3">
                <Label>Tipos de alerta</Label>
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-sm">Deals parados</span>
                    <Switch
                      checked={newPreference.notify_stagnant_deals}
                      onCheckedChange={(checked) => 
                        setNewPreference({ ...newPreference, notify_stagnant_deals: checked })
                      }
                    />
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm">Clientes inativos</span>
                    <Switch
                      checked={newPreference.notify_inactive_clients}
                      onCheckedChange={(checked) => 
                        setNewPreference({ ...newPreference, notify_inactive_clients: checked })
                      }
                    />
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm">Metas em risco</span>
                    <Switch
                      checked={newPreference.notify_at_risk_goals}
                      onCheckedChange={(checked) => 
                        setNewPreference({ ...newPreference, notify_at_risk_goals: checked })
                      }
                    />
                  </div>
                </div>
              </div>
              <div className="grid grid-cols-3 gap-4">
                <div className="space-y-2">
                  <Label>Deal parado (dias)</Label>
                  <Input
                    type="number"
                    min={1}
                    value={newPreference.stagnant_threshold_days}
                    onChange={(e) => setNewPreference({ ...newPreference, stagnant_threshold_days: parseInt(e.target.value) || 14 })}
                  />
                </div>
                <div className="space-y-2">
                  <Label>Inatividade (dias)</Label>
                  <Input
                    type="number"
                    min={1}
                    value={newPreference.inactive_threshold_days}
                    onChange={(e) => setNewPreference({ ...newPreference, inactive_threshold_days: parseInt(e.target.value) || 60 })}
                  />
                </div>
                <div className="space-y-2">
                  <Label>SDR consecutivo (dias)</Label>
                  <Input
                    type="number"
                    min={1}
                    max={14}
                    value={newPreference.consecutive_days_threshold}
                    onChange={(e) => setNewPreference({ ...newPreference, consecutive_days_threshold: parseInt(e.target.value) || 3 })}
                  />
                </div>
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setIsDialogOpen(false)}>
                Cancelar
              </Button>
              <Button onClick={handleCreate} disabled={createPreference.isPending}>
                {createPreference.isPending ? "Criando..." : "Criar"}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
          </div>

          {isLoading ? (
        <div className="grid gap-4 md:grid-cols-2">
          {[...Array(2)].map((_, i) => (
            <Skeleton key={i} className="h-64 rounded-xl" />
          ))}
        </div>
      ) : preferences?.length === 0 ? (
        <Card className="glass">
          <CardContent className="flex flex-col items-center justify-center py-12">
            <Bell className="h-12 w-12 text-muted-foreground mb-4" />
            <h3 className="text-lg font-semibold mb-2">Nenhuma configuração</h3>
            <p className="text-muted-foreground text-center mb-4">
              Configure destinatários para receber alertas críticos do sistema
            </p>
            <Button onClick={() => setIsDialogOpen(true)}>
              <Plus className="h-4 w-4 mr-2" />
              Adicionar configuração
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-4 md:grid-cols-2">
          {preferences?.map((pref) => (
            <Card key={pref.id} className={`glass transition-all ${!pref.is_active ? "opacity-60" : ""}`}>
              <CardHeader className="pb-3">
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-3">
                    <div className={`p-2 rounded-lg ${pref.is_active ? "bg-primary/20" : "bg-muted"}`}>
                      <Mail className={`h-5 w-5 ${pref.is_active ? "text-primary" : "text-muted-foreground"}`} />
                    </div>
                    <div>
                      <CardTitle className="text-base">{pref.email}</CardTitle>
                      <CardDescription className="flex items-center gap-2 mt-1">
                        <Clock className="h-3 w-3" />
                        {frequencyLabels[pref.frequency as keyof typeof frequencyLabels]} às {pref.preferred_time.slice(0, 5)}
                      </CardDescription>
                    </div>
                  </div>
                  <Switch
                    checked={pref.is_active}
                    onCheckedChange={() => handleToggleActive(pref)}
                  />
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <p className="text-xs text-muted-foreground uppercase tracking-wider">
                    Tipos de alerta <span className="text-[10px] normal-case">(clique no valor para editar)</span>
                  </p>
                  <div className="flex flex-wrap gap-2">
                    {renderThresholdButton(
                      pref,
                      'stagnant_threshold_days',
                      'Deals parados',
                      <Clock className="h-3 w-3" />,
                      pref.notify_stagnant_deals 
                        ? "bg-warning/20 text-warning" 
                        : "bg-muted text-muted-foreground",
                      pref.notify_stagnant_deals
                    )}
                    {renderThresholdButton(
                      pref,
                      'inactive_threshold_days',
                      'Clientes inativos',
                      <Users className="h-3 w-3" />,
                      pref.notify_inactive_clients 
                        ? "bg-destructive/20 text-destructive" 
                        : "bg-muted text-muted-foreground",
                      pref.notify_inactive_clients
                    )}
                    <button
                      onClick={() => handleToggleAlertType(pref, "notify_at_risk_goals")}
                      className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium transition-all ${
                        pref.notify_at_risk_goals 
                          ? "bg-primary/20 text-primary" 
                          : "bg-muted text-muted-foreground"
                      }`}
                    >
                      <Target className="h-3 w-3" />
                      Metas em risco
                    </button>
                    {renderThresholdButton(
                      pref,
                      'consecutive_days_threshold',
                      'SDR consecutivo',
                      <TrendingDown className="h-3 w-3" />,
                      "bg-accent/20 text-accent-foreground",
                      true
                    )}
                  </div>
                </div>
                <div className="flex gap-2 pt-2">
                  <Button
                    variant="outline"
                    size="sm"
                    className="flex-1"
                    onClick={() => handleTestNotification(pref)}
                    disabled={isTesting === pref.id || !pref.is_active}
                  >
                    {isTesting === pref.id ? (
                      <Loader2 className="h-4 w-4 animate-spin mr-2" />
                    ) : (
                      <Bell className="h-4 w-4 mr-2" />
                    )}
                    Testar
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => deletePreference.mutate(pref.id)}
                    className="text-destructive hover:text-destructive"
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
          )}

          <div className="grid gap-6 lg:grid-cols-2">
            <SDRAlertHistory />
            <Card className="glass">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle className="flex items-center gap-2">
                    <AlertTriangle className="h-5 w-5 text-warning" />
                    Sobre as Notificações
                  </CardTitle>
                  <TestSDRAlertButton />
                </div>
              </CardHeader>
              <CardContent className="space-y-3 text-sm text-muted-foreground">
                <p>
                  <strong className="text-foreground">Alertas críticos incluem:</strong>
                </p>
                <ul className="list-disc list-inside space-y-1 ml-2">
                  <li>Deals parados há mais de X dias sem atualização</li>
                  <li>Clientes inativos há mais de X dias sem compra</li>
                  <li>Vendedores com metas 40%+ abaixo do esperado</li>
                  <li>SDRs abaixo da meta por dias consecutivos</li>
                </ul>
                <p className="pt-2">
                  Configure o domínio do Resend para enviar emails de produção. 
                  Atualmente usando o domínio de teste (onboarding@resend.dev).
                </p>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="sons" className="space-y-6">
          <SoundSettings />
          <BrowserPushSettings />
        </TabsContent>
      </Tabs>
    </div>
    </SkeletonTransition>
  );
}
