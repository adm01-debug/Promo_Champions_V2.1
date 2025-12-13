import { useState } from "react";
import { Bell, Plus, Trash2, Mail, Clock, AlertTriangle, Users, Target, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Switch } from "@/components/ui/switch";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Skeleton } from "@/components/ui/skeleton";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { 
  useNotificationPreferences, 
  useCreateNotificationPreference, 
  useUpdateNotificationPreference,
  useDeleteNotificationPreference,
  NotificationPreference
} from "@/hooks/useNotificationPreferences";
import { SoundSettings } from "@/components/settings/SoundSettings";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

const frequencyLabels = {
  realtime: "Tempo real",
  daily: "Diário",
  weekly: "Semanal",
};

export default function Notificacoes() {
  const { data: preferences, isLoading } = useNotificationPreferences();
  const createPreference = useCreateNotificationPreference();
  const updatePreference = useUpdateNotificationPreference();
  const deletePreference = useDeleteNotificationPreference();

  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isTesting, setIsTesting] = useState<string | null>(null);
  const [newPreference, setNewPreference] = useState<{
    email: string;
    frequency: "realtime" | "daily" | "weekly";
    notify_stagnant_deals: boolean;
    notify_inactive_clients: boolean;
    notify_at_risk_goals: boolean;
    stagnant_threshold_days: number;
    inactive_threshold_days: number;
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
    } catch (error: any) {
      toast.error("Erro ao enviar: " + error.message);
    } finally {
      setIsTesting(null);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold gradient-text">Notificações</h1>
          <p className="text-muted-foreground mt-1">
            Gerencie suas preferências de alertas e notificações
          </p>
        </div>
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
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Limite deal parado (dias)</Label>
                  <Input
                    type="number"
                    min={1}
                    value={newPreference.stagnant_threshold_days}
                    onChange={(e) => setNewPreference({ ...newPreference, stagnant_threshold_days: parseInt(e.target.value) || 14 })}
                  />
                </div>
                <div className="space-y-2">
                  <Label>Limite inatividade (dias)</Label>
                  <Input
                    type="number"
                    min={1}
                    value={newPreference.inactive_threshold_days}
                    onChange={(e) => setNewPreference({ ...newPreference, inactive_threshold_days: parseInt(e.target.value) || 60 })}
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
                        {frequencyLabels[pref.frequency]} às {pref.preferred_time.slice(0, 5)}
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
                  <p className="text-xs text-muted-foreground uppercase tracking-wider">Tipos de alerta</p>
                  <div className="flex flex-wrap gap-2">
                    <button
                      onClick={() => handleToggleAlertType(pref, "notify_stagnant_deals")}
                      className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium transition-all ${
                        pref.notify_stagnant_deals 
                          ? "bg-warning/20 text-warning" 
                          : "bg-muted text-muted-foreground"
                      }`}
                    >
                      <Clock className="h-3 w-3" />
                      Deals parados ({pref.stagnant_threshold_days}d)
                    </button>
                    <button
                      onClick={() => handleToggleAlertType(pref, "notify_inactive_clients")}
                      className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium transition-all ${
                        pref.notify_inactive_clients 
                          ? "bg-destructive/20 text-destructive" 
                          : "bg-muted text-muted-foreground"
                      }`}
                    >
                      <Users className="h-3 w-3" />
                      Clientes inativos ({pref.inactive_threshold_days}d)
                    </button>
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

      <SoundSettings />

      <Card className="glass">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <AlertTriangle className="h-5 w-5 text-warning" />
            Sobre as Notificações
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3 text-sm text-muted-foreground">
          <p>
            <strong className="text-foreground">Alertas críticos incluem:</strong>
          </p>
          <ul className="list-disc list-inside space-y-1 ml-2">
            <li>Deals parados há mais de X dias sem atualização</li>
            <li>Clientes inativos há mais de X dias sem compra</li>
            <li>Vendedores com metas 40%+ abaixo do esperado</li>
          </ul>
          <p className="pt-2">
            Configure o domínio do Resend para enviar emails de produção. 
            Atualmente usando o domínio de teste (onboarding@resend.dev).
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
