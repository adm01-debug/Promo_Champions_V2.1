import React, { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Switch } from "@/components/ui/switch";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Bell, Mail, Clock, Users, Target, Loader2, TrendingDown, Check, X, Pencil, Trash2 } from "lucide-react";
import { NotificationPreference } from "@/hooks/useNotificationPreferences";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

const frequencyLabels: Record<string, string> = {
  realtime: "Tempo real",
  daily: "Diário",
  weekly: "Semanal",
};

interface EditingThreshold {
  field: 'stagnant_threshold_days' | 'inactive_threshold_days' | 'consecutive_days_threshold';
  value: number;
}

interface NotificationPreferenceCardProps {
  pref: NotificationPreference;
  onToggleActive: (pref: NotificationPreference) => Promise<void>;
  onToggleAlertType: (pref: NotificationPreference, field: keyof NotificationPreference) => Promise<void>;
  onUpdateThreshold: (id: string, field: string, value: number) => Promise<void>;
  onDelete: (id: string) => void;
}

export const NotificationPreferenceCard = React.memo(function NotificationPreferenceCard({
  pref, onToggleActive, onToggleAlertType, onUpdateThreshold, onDelete,
}: NotificationPreferenceCardProps) {
  const [isTesting, setIsTesting] = useState(false);
  const [editingThreshold, setEditingThreshold] = useState<EditingThreshold | null>(null);

  const handleTestNotification = async () => {
    setIsTesting(true);
    try {
      const { data, error } = await supabase.functions.invoke("send-alert-notifications", {
        body: { recipientEmail: pref.email },
      });
      if (error) throw error;
      if (data.alertsSent === 0) toast.info("Nenhum alerta crítico para enviar");
      else toast.success(`${data.alertsSent} alerta(s) enviado(s) para ${pref.email}`);
    } catch (error: unknown) {
      toast.error("Erro ao enviar: " + (error instanceof Error ? error.message : 'Erro desconhecido'));
    } finally {
      setIsTesting(false);
    }
  };

  const handleSaveThreshold = async () => {
    if (!editingThreshold) return;
    await onUpdateThreshold(pref.id, editingThreshold.field, editingThreshold.value);
    setEditingThreshold(null);
    toast.success("Threshold atualizado!");
  };

  const renderThresholdButton = (
    field: EditingThreshold['field'], label: string, icon: React.ReactNode,
    colorClasses: string, enabled: boolean
  ) => {
    const isEditing = editingThreshold?.field === field;
    const value = pref[field] as number;

    if (isEditing) {
      return (
        <div className="flex items-center gap-1 px-2 py-1 rounded-full bg-muted">
          <Input type="number" min={1} max={field === 'consecutive_days_threshold' ? 14 : 365}
            value={editingThreshold!.value}
            onChange={(e) => setEditingThreshold({ ...editingThreshold!, value: parseInt(e.target.value) || 1 })}
            className="h-6 w-14 text-xs px-1 text-center" autoFocus
            onKeyDown={(e) => { if (e.key === 'Enter') handleSaveThreshold(); if (e.key === 'Escape') setEditingThreshold(null); }}
          />
          <button onClick={handleSaveThreshold} className="p-0.5 rounded hover:bg-primary/20 transition-colors" aria-label="Salvar limite"><Check className="h-3.5 w-3.5 text-status-success" /></button>
          <button onClick={() => setEditingThreshold(null)} className="p-0.5 rounded hover:bg-destructive/20 transition-colors" aria-label="Cancelar edição"><X className="h-3.5 w-3.5 text-destructive" /></button>
        </div>
      );
    }

    const alertField = field === 'stagnant_threshold_days' ? 'notify_stagnant_deals'
      : field === 'inactive_threshold_days' ? 'notify_inactive_clients' : 'notify_at_risk_goals';

    return (
      <button
        onClick={() => enabled ? onToggleAlertType(pref, alertField as keyof NotificationPreference) : null}
        className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium transition-all group ${colorClasses}`}
      >
        {icon}<span>{label}</span>
        <button onClick={(e) => { e.stopPropagation(); setEditingThreshold({ field, value }); }}
          className="flex items-center gap-0.5 px-1.5 py-0.5 rounded bg-background/50 hover:bg-background/80 transition-colors ml-1"
          aria-label={`Editar limite de ${label}`}>
          <span>{value}d</span><Pencil className="h-2.5 w-2.5 opacity-0 group-hover:opacity-100 transition-opacity" />
        </button>
      </button>
    );
  };

  return (
    <Card className={`glass transition-all ${!pref.is_active ? "opacity-60" : ""}`}>
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
                {frequencyLabels[pref.frequency] || pref.frequency} às {pref.preferred_time.slice(0, 5)}
              </CardDescription>
            </div>
          </div>
          <Switch checked={pref.is_active} onCheckedChange={() => onToggleActive(pref)} />
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-2">
          <p className="text-xs text-muted-foreground uppercase tracking-wider">
            Tipos de alerta <span className="text-[10px] normal-case">(clique no valor para editar)</span>
          </p>
          <div className="flex flex-wrap gap-2">
            {renderThresholdButton('stagnant_threshold_days', 'Deals parados', <Clock className="h-3 w-3" />,
              pref.notify_stagnant_deals ? "bg-warning/20 text-warning" : "bg-muted text-muted-foreground", pref.notify_stagnant_deals)}
            {renderThresholdButton('inactive_threshold_days', 'Clientes inativos', <Users className="h-3 w-3" />,
              pref.notify_inactive_clients ? "bg-destructive/20 text-destructive" : "bg-muted text-muted-foreground", pref.notify_inactive_clients)}
            <button onClick={() => onToggleAlertType(pref, "notify_at_risk_goals")}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium transition-all ${
                pref.notify_at_risk_goals ? "bg-primary/20 text-primary" : "bg-muted text-muted-foreground"}`}>
              <Target className="h-3 w-3" />Metas em risco
            </button>
            {renderThresholdButton('consecutive_days_threshold', 'SDR consecutivo', <TrendingDown className="h-3 w-3" />,
              "bg-accent/20 text-accent-foreground", true)}
          </div>
        </div>
        <div className="flex gap-2 pt-2">
          <Button variant="outline" size="sm" className="flex-1" onClick={handleTestNotification} disabled={isTesting || !pref.is_active}>
            {isTesting ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : <Bell className="h-4 w-4 mr-2" />}Testar
          </Button>
          <Button variant="outline" size="sm" onClick={() => onDelete(pref.id)} className="text-destructive hover:text-destructive">
            <Trash2 className="h-4 w-4" />
          </Button>
        </div>
      </CardContent>
    </Card>
  );
});
