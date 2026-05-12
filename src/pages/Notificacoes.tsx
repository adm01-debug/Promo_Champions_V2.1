import { Helmet } from "react-helmet-async";
import { useState } from "react";
import { Bell, Plus, AlertTriangle, History, TrendingUp, User, Clock, ShieldCheck, Mail } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Switch } from "@/components/ui/switch";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Skeleton } from "@/components/ui/skeleton";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Badge } from "@/components/ui/badge";
import {
  useNotificationPreferences,
  useCreateNotificationPreference,
  useUpdateNotificationPreference,
  useDeleteNotificationPreference,
  NotificationPreference,
} from "@/hooks/useNotificationPreferences";
import { useSaleNotificationAudits } from "@/hooks/useSaleNotificationAudits";
import { SoundSettings } from "@/components/settings/SoundSettings";
import { SDRAlertHistory } from "@/components/sdr/SDRAlertHistory";
import { TestSDRAlertButton } from "@/components/sdr/TestSDRAlertButton";
import { BrowserPushSettings } from "@/components/settings/BrowserPushSettings";
import { NotificationCenter } from "@/components/notifications/NotificationCenter";
import { NotificationPreferenceCard } from "@/components/notifications/NotificationPreferenceCard";
import { toast } from "sonner";
import { NotificacoesLoadingSkeleton } from "@/components/skeletons/PageLoadingSkeleton";
import { SkeletonTransition } from "@/components/skeletons/SkeletonTransition";
import { PageTransition } from "@/components/transitions/PageTransition";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";

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
  const { data: audits, isLoading: isLoadingAudits } = useSaleNotificationAudits(50);
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
          <TabsList className="bg-muted/30 border border-border/40 p-1">
            <TabsTrigger value="central" className="text-xs font-bold uppercase tracking-widest px-6">HUD de Alertas</TabsTrigger>
            <TabsTrigger value="configuracoes" className="text-xs font-bold uppercase tracking-widest px-6">Canais & Destinatários</TabsTrigger>
            <TabsTrigger value="historico" className="text-xs font-bold uppercase tracking-widest px-6">Auditoria de Vendas</TabsTrigger>
            <TabsTrigger value="sons" className="text-xs font-bold uppercase tracking-widest px-6">Sons & Push</TabsTrigger>
          </TabsList>

          <TabsContent value="central" className="space-y-6">
            <NotificationCenter />
          </TabsContent>

          <TabsContent value="configuracoes" className="space-y-6">
            <div className="flex items-center justify-between">
              <h2 className="text-xl font-semibold">Destinatários de Alertas</h2>
              <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
                <DialogTrigger asChild><Button className="gradient-primary"><Plus className="h-4 w-4 mr-2" />Nova Configuração</Button></DialogTrigger>
                <DialogContent className="sm:max-w-[500px] glass">
                  <DialogHeader>
                    <DialogTitle className="font-display uppercase italic tracking-tighter">Nova Configuração</DialogTitle>
                    <DialogDescription>Configure um novo destinatário para receber alertas do sistema</DialogDescription>
                  </DialogHeader>
                  <div className="space-y-4 py-4">
                    <div className="space-y-2">
                      <Label htmlFor="email">Email</Label>
                      <Input id="email" type="email" placeholder="email@exemplo.com" value={newPreference.email} onChange={(e) => setNewPreference({ ...newPreference, email: e.target.value })} className="bg-white/5 border-white/10" />
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label>Frequência</Label>
                        <Select value={newPreference.frequency} onValueChange={(value) => setNewPreference({ ...newPreference, frequency: value as "realtime" | "daily" | "weekly" })}>
                          <SelectTrigger className="bg-white/5 border-white/10"><SelectValue /></SelectTrigger>
                          <SelectContent className="glass"><SelectItem value="realtime">Tempo real</SelectItem><SelectItem value="daily">Diário</SelectItem><SelectItem value="weekly">Semanal</SelectItem></SelectContent>
                        </Select>
                      </div>
                      <div className="space-y-2">
                        <Label>Horário preferido</Label>
                        <Input type="time" value={newPreference.preferred_time} onChange={(e) => setNewPreference({ ...newPreference, preferred_time: e.target.value })} className="bg-white/5 border-white/10" />
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
                  </div>
                  <DialogFooter>
                    <Button variant="ghost" onClick={() => setIsDialogOpen(false)}>Cancelar</Button>
                    <Button onClick={handleCreate} disabled={createPreference.isPending} className="gradient-primary">{createPreference.isPending ? "Criando..." : "Criar"}</Button>
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
                <CardHeader><div className="flex items-center justify-between"><CardTitle className="flex items-center gap-2"><AlertTriangle className="h-5 w-5 text-warning" />Canais de Notificação</CardTitle><TestSDRAlertButton /></div></CardHeader>
                <CardContent className="space-y-3 text-sm text-muted-foreground">
                  <p><strong className="text-foreground italic">Ecossistema Multicanal:</strong></p>
                  <ul className="list-disc list-inside space-y-2 ml-2">
                    <li className="flex items-center gap-2"><div className="h-2 w-2 rounded-full bg-primary" /> <span className="font-bold text-foreground">In-App HUD:</span> Notificações instantâneas no dashboard com dados de rank.</li>
                    <li className="flex items-center gap-2"><div className="h-2 w-2 rounded-full bg-accent" /> <span className="font-bold text-foreground">E-mail:</span> Alertas críticos e resumos de performance enviados via Resend.</li>
                    <li className="flex items-center gap-2"><div className="h-2 w-2 rounded-full bg-success" /> <span className="font-bold text-foreground">Browser Push:</span> Alertas nativos mesmo com o sistema fechado.</li>
                  </ul>
                  <p className="pt-4 text-[10px] uppercase font-black opacity-60">Status do Servidor de Email: <span className="text-success">Ativo (onboarding@resend.dev)</span></p>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="historico" className="space-y-6">
             <Card className="glass border-primary/20">
                <CardHeader className="border-b border-white/5">
                   <div className="flex items-center justify-between">
                      <CardTitle className="flex items-center gap-2 font-display uppercase italic tracking-tighter">
                         <History className="h-5 w-5 text-primary" />
                         Auditoria de Notificações de Vendas
                      </CardTitle>
                      <Badge variant="outline" className="bg-primary/10 text-primary border-primary/30">
                         {audits?.length || 0} LOGS
                      </Badge>
                   </div>
                </CardHeader>
                <CardContent className="p-0">
                   <ScrollArea className="h-[600px]">
                      {isLoadingAudits ? (
                        <div className="p-8 space-y-4">
                           {[...Array(5)].map((_, i) => <Skeleton key={i} className="h-16 rounded-xl" />)}
                        </div>
                      ) : audits?.length === 0 ? (
                        <div className="p-20 text-center opacity-40">
                           <ShieldCheck className="h-12 w-12 mx-auto mb-4" />
                           <p className="text-sm font-black uppercase tracking-widest">Nenhum evento registrado</p>
                        </div>
                      ) : (
                        <div className="divide-y divide-white/5">
                           {audits?.map((audit) => (
                             <div key={audit.id} className="p-4 hover:bg-white/5 transition-colors group">
                                <div className="flex items-start justify-between gap-4">
                                   <div className="flex gap-4">
                                      <div className="h-10 w-10 rounded-xl bg-primary/10 flex items-center justify-center border border-primary/20 shrink-0">
                                         <TrendingUp className="h-5 w-5 text-primary" />
                                      </div>
                                      <div className="space-y-1">
                                         <p className="text-sm font-black uppercase tracking-tight">
                                            {audit.seller_name} <span className="text-muted-foreground font-normal">vendeu</span> R$ {audit.sale_amount.toLocaleString('pt-BR')}
                                         </p>
                                         <div className="flex items-center gap-2 text-[10px] text-muted-foreground font-mono">
                                            <Badge variant="secondary" className="h-4 text-[8px] px-1 font-bold">
                                               RANK: #{audit.seller_rank_at_time}
                                            </Badge>
                                            <span>•</span>
                                            <Badge variant="outline" className="h-4 text-[8px] px-1 font-bold border-white/10">
                                               REC: #{audit.recipient_rank_at_time}
                                            </Badge>
                                            <span>•</span>
                                            <span className="flex items-center gap-1"><Clock className="h-3 w-3" /> {format(new Date(audit.created_at), "dd/MM HH:mm:ss", { locale: ptBR })}</span>
                                         </div>
                                      </div>
                                   </div>
                                   <div className="flex flex-col items-end gap-1 opacity-60 group-hover:opacity-100 transition-opacity">
                                      <div className="flex items-center gap-1.5 px-2 py-0.5 rounded bg-black/40 border border-white/10 text-[8px] font-black uppercase tracking-widest">
                                         {audit.notification_type === 'in-app' ? <Bell className="h-2.5 w-2.5" /> : <Mail className="h-2.5 w-2.5" />}
                                         {audit.notification_type}
                                      </div>
                                      <span className="text-[8px] font-mono text-muted-foreground">ID_{audit.sale_id.slice(0,8).toUpperCase()}</span>
                                   </div>
                                </div>
                             </div>
                           ))}
                        </div>
                      )}
                   </ScrollArea>
                </CardContent>
             </Card>
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
