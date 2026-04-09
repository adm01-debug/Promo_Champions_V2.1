import { Helmet } from "react-helmet-async";
import { useState } from "react";
import { Bell, Plus, AlertTriangle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
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
  NotificationPreference,
} from "@/hooks/useNotificationPreferences";
import { SoundSettings } from "@/components/settings/SoundSettings";
import { SDRAlertHistory } from "@/components/sdr/SDRAlertHistory";
import { TestSDRAlertButton } from "@/components/sdr/TestSDRAlertButton";
import { BrowserPushSettings } from "@/components/settings/BrowserPushSettings";
import { NotificationCenter } from "@/components/notifications/NotificationCenter";
import { NotificationPreferenceCard } from "@/components/notifications/NotificationPreferenceCard";
import { toast } from "sonner";
import { NotificacoesLoadingSkeleton } from "@/components/skeletons/PageLoadingSkeleton";
import { SkeletonTransition } from "@/components/skeletons/SkeletonTransition";
import { PageTransition } from "@/components/ui/page-transition";

const DEFAULT_PREF: {
  email: string; frequency: "realtime" | "daily" | "weekly"; notify_stagnant_deals: boolean;
  notify_inactive_clients: boolean; notify_at_risk_goals: boolean; stagnant_threshold_days: number;
  inactive_threshold_days: number; consecutive_days_threshold: number; preferred_time: string; is_active: boolean;
} = {
  email: "", frequency: "daily", notify_stagnant_deals: true, notify_inactive_clients: true,
  notify_at_risk_goals: true, stagnant_threshold_days: 14, inactive_threshold_days: 60,
  consecutive_days_threshold: 3, preferred_time: "08:00", is_active: true,
};

export default function Notificacoes() {
  const { data: preferences, isLoading } = useNotificationPreferences();
  const createPreference = useCreateNotificationPreference();
  const updatePreference = useUpdateNotificationPreference();
  const deletePreference = useDeleteNotificationPreference();
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [newPreference, setNewPreference] = useState(DEFAULT_PREF);

  const handleCreate = async () => {
    if (!newPreference.email) { toast.error("Email é obrigatório"); return; }
    await createPreference.mutateAsync(newPreference);
    setIsDialogOpen(false);
    setNewPreference(DEFAULT_PREF);
  };

  const handleToggleActive = async (pref: NotificationPreference) => {
    await updatePreference.mutateAsync({ id: pref.id, is_active: !pref.is_active });
  };

  const handleToggleAlertType = async (pref: NotificationPreference, field: keyof NotificationPreference) => {
    await updatePreference.mutateAsync({ id: pref.id, [field]: !pref[field] });
  };

  const handleUpdateThreshold = async (id: string, field: string, value: number) => {
    await updatePreference.mutateAsync({ id, [field]: value });
  };

  return (
    <PageTransition>
    <>
    <Helmet>
      <title>Notificações | Promo Champions</title>
      <meta name="description" content="Central de notificações e alertas" />
    </Helmet>
    <SkeletonTransition isLoading={isLoading} skeleton={<NotificacoesLoadingSkeleton />} duration={400}>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-page-title gradient-text">Notificações</h1>
            <p className="text-muted-foreground mt-1">Central de notificações e configurações de alertas</p>
          </div>
        </div>

        <Tabs defaultValue="central" className="space-y-6">
          <TabsList>
            <TabsTrigger value="central">Central de Notificações</TabsTrigger>
            <TabsTrigger value="configuracoes">Configurações</TabsTrigger>
            <TabsTrigger value="sons">Sons</TabsTrigger>
          </TabsList>

          <TabsContent value="central" className="space-y-6"><NotificationCenter /></TabsContent>

          <TabsContent value="configuracoes" className="space-y-6">
            <div className="flex items-center justify-between">
              <h2 className="text-xl font-semibold">Destinatários de Alertas</h2>
              <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
                <DialogTrigger asChild><Button className="gradient-primary"><Plus className="h-4 w-4 mr-2" />Nova Configuração</Button></DialogTrigger>
                <DialogContent className="sm:max-w-[500px]">
                  <DialogHeader>
                    <DialogTitle>Nova Configuração de Notificação</DialogTitle>
                    <DialogDescription>Configure um novo destinatário para receber alertas do sistema</DialogDescription>
                  </DialogHeader>
                  <div className="space-y-4 py-4">
                    <div className="space-y-2">
                      <Label htmlFor="email">Email</Label>
                      <Input id="email" type="email" placeholder="email@exemplo.com" value={newPreference.email} onChange={(e) => setNewPreference({ ...newPreference, email: e.target.value })} />
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label>Frequência</Label>
                        <Select value={newPreference.frequency} onValueChange={(value) => setNewPreference({ ...newPreference, frequency: value as "realtime" | "daily" | "weekly" })}>
                          <SelectTrigger><SelectValue /></SelectTrigger>
                          <SelectContent><SelectItem value="realtime">Tempo real</SelectItem><SelectItem value="daily">Diário</SelectItem><SelectItem value="weekly">Semanal</SelectItem></SelectContent>
                        </Select>
                      </div>
                      <div className="space-y-2">
                        <Label>Horário preferido</Label>
                        <Input type="time" value={newPreference.preferred_time} onChange={(e) => setNewPreference({ ...newPreference, preferred_time: e.target.value })} />
                      </div>
                    </div>
                    <div className="space-y-3">
                      <Label>Tipos de alerta</Label>
                      <div className="space-y-2">
                        <div className="flex items-center justify-between"><span className="text-sm">Deals parados</span><Switch checked={newPreference.notify_stagnant_deals} onCheckedChange={(checked) => setNewPreference({ ...newPreference, notify_stagnant_deals: checked })} /></div>
                        <div className="flex items-center justify-between"><span className="text-sm">Clientes inativos</span><Switch checked={newPreference.notify_inactive_clients} onCheckedChange={(checked) => setNewPreference({ ...newPreference, notify_inactive_clients: checked })} /></div>
                        <div className="flex items-center justify-between"><span className="text-sm">Metas em risco</span><Switch checked={newPreference.notify_at_risk_goals} onCheckedChange={(checked) => setNewPreference({ ...newPreference, notify_at_risk_goals: checked })} /></div>
                      </div>
                    </div>
                    <div className="grid grid-cols-3 gap-4">
                      <div className="space-y-2"><Label>Deal parado (dias)</Label><Input type="number" min={1} value={newPreference.stagnant_threshold_days} onChange={(e) => setNewPreference({ ...newPreference, stagnant_threshold_days: parseInt(e.target.value) || 14 })} /></div>
                      <div className="space-y-2"><Label>Inatividade (dias)</Label><Input type="number" min={1} value={newPreference.inactive_threshold_days} onChange={(e) => setNewPreference({ ...newPreference, inactive_threshold_days: parseInt(e.target.value) || 60 })} /></div>
                      <div className="space-y-2"><Label>SDR consecutivo (dias)</Label><Input type="number" min={1} max={14} value={newPreference.consecutive_days_threshold} onChange={(e) => setNewPreference({ ...newPreference, consecutive_days_threshold: parseInt(e.target.value) || 3 })} /></div>
                    </div>
                  </div>
                  <DialogFooter>
                    <Button variant="outline" onClick={() => setIsDialogOpen(false)}>Cancelar</Button>
                    <Button onClick={handleCreate} disabled={createPreference.isPending}>{createPreference.isPending ? "Criando..." : "Criar"}</Button>
                  </DialogFooter>
                </DialogContent>
              </Dialog>
            </div>

            {isLoading ? (
              <div className="grid gap-4 md:grid-cols-2">{[...Array(2)].map((_, i) => <Skeleton key={i} className="h-64 rounded-xl" />)}</div>
            ) : preferences?.length === 0 ? (
              <Card className="glass"><CardContent className="flex flex-col items-center justify-center py-12"><Bell className="h-12 w-12 text-muted-foreground mb-4" /><h3 className="text-lg font-semibold mb-2">Nenhuma configuração</h3><p className="text-muted-foreground text-center mb-4">Configure destinatários para receber alertas críticos do sistema</p><Button onClick={() => setIsDialogOpen(true)}><Plus className="h-4 w-4 mr-2" />Adicionar configuração</Button></CardContent></Card>
            ) : (
              <div className="grid gap-4 md:grid-cols-2">
                {preferences?.map((pref) => (
                  <NotificationPreferenceCard key={pref.id} pref={pref} onToggleActive={handleToggleActive} onToggleAlertType={handleToggleAlertType} onUpdateThreshold={handleUpdateThreshold} onDelete={(id) => deletePreference.mutate(id)} />
                ))}
              </div>
            )}

            <div className="grid gap-6 lg:grid-cols-2">
              <SDRAlertHistory />
              <Card className="glass">
                <CardHeader><div className="flex items-center justify-between"><CardTitle className="flex items-center gap-2"><AlertTriangle className="h-5 w-5 text-warning" />Sobre as Notificações</CardTitle><TestSDRAlertButton /></div></CardHeader>
                <CardContent className="space-y-3 text-sm text-muted-foreground">
                  <p><strong className="text-foreground">Alertas críticos incluem:</strong></p>
                  <ul className="list-disc list-inside space-y-1 ml-2">
                    <li>Deals parados há mais de X dias sem atualização</li>
                    <li>Clientes inativos há mais de X dias sem compra</li>
                    <li>Vendedores com metas 40%+ abaixo do esperado</li>
                    <li>SDRs abaixo da meta por dias consecutivos</li>
                  </ul>
                  <p className="pt-2">Configure o domínio do Resend para enviar emails de produção. Atualmente usando o domínio de teste (onboarding@resend.dev).</p>
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
  </>
    </PageTransition>
  );
}
