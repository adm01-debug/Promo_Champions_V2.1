import React from 'react';
import { Helmet } from 'react-helmet-async';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { PageTransition, itemVariants } from '@/components/transitions/PageTransition';
import { motion } from 'framer-motion';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Skeleton } from '@/components/ui/skeleton';
import { Badge } from '@/components/ui/badge';
import { toast } from 'sonner';
import { AlertTriangle, Bell, Play, Save, Mail, Send, History, ListChecks } from 'lucide-react';
import { Link } from 'react-router-dom';
import { Textarea } from '@/components/ui/textarea';

type Level = 'low' | 'medium' | 'high' | 'critical';
type TaskPriority = 'low' | 'medium' | 'high' | 'urgent';

interface Settings {
  enabled: boolean;
  min_level: Level;
  cooldown_hours: number;
  email_enabled: boolean;
  email_from: string | null;
  email_reply_to: string | null;
  email_recipients: string[];
  email_subject_template: string;
  email_provider: string;
  auto_task_enabled: boolean;
  auto_task_min_level: Exclude<Level, 'low'>;
  auto_task_cooldown_hours: number;
  auto_task_priority: TaskPriority;
  auto_task_due_in_days: number;
}

interface StateRow {
  salesperson_id: string;
  client_name: string;
  last_level: Level;
  last_days_since: number;
  last_alerted_at: string;
}

const LEVEL_LABEL: Record<Level, string> = {
  low: 'Baixo',
  medium: 'Médio',
  high: 'Alto',
  critical: 'Crítico',
};

const AdminAlertasChurn = () => {
  const qc = useQueryClient();
  const [running, setRunning] = React.useState(false);
  const [draft, setDraft] = React.useState<Settings | null>(null);

  const { data: settings, isLoading } = useQuery<Settings>({
    queryKey: ['churn-alert-settings'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('churn_alert_settings')
        .select('enabled, min_level, cooldown_hours, email_enabled, email_from, email_reply_to, email_recipients, email_subject_template, email_provider, auto_task_enabled, auto_task_min_level, auto_task_cooldown_hours, auto_task_priority, auto_task_due_in_days')
        .maybeSingle();
      if (error) throw error;
      return (data ?? {
        enabled: true,
        min_level: 'high',
        cooldown_hours: 24,
        email_enabled: false,
        email_from: null,
        email_reply_to: null,
        email_recipients: [],
        email_subject_template: '[Churn] Cliente {{client_name}} em risco {{level}}',
        email_provider: 'lovable',
        auto_task_enabled: false,
        auto_task_min_level: 'high',
        auto_task_cooldown_hours: 48,
        auto_task_priority: 'high',
        auto_task_due_in_days: 1,
      }) as Settings;
    },
  });

  React.useEffect(() => {
    if (settings && !draft) setDraft(settings);
  }, [settings, draft]);

  const { data: recent } = useQuery<StateRow[]>({
    queryKey: ['churn-alert-recent'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('client_churn_alerts_state')
        .select('salesperson_id, client_name, last_level, last_days_since, last_alerted_at')
        .order('last_alerted_at', { ascending: false })
        .limit(20);
      if (error) throw error;
      return (data ?? []) as StateRow[];
    },
  });

  const saveMutation = useMutation({
    mutationFn: async (payload: Settings) => {
      const { error } = await supabase
        .from('churn_alert_settings')
        .update({ ...payload, updated_at: new Date().toISOString() })
        .eq('id', true);
      if (error) throw error;
    },
    onSuccess: () => {
      toast.success('Configurações salvas');
      qc.invalidateQueries({ queryKey: ['churn-alert-settings'] });
    },
    onError: (e: Error) => toast.error(`Erro ao salvar: ${e.message}`),
  });

  const runNow = async () => {
    setRunning(true);
    try {
      const { data, error } = await supabase.functions.invoke('detect-client-churn-alerts', {
        body: { source: 'manual' },
      });
      if (error) throw error;
      const created = (data as { created?: number })?.created ?? 0;
      toast.success(`Verificação concluída — ${created} alerta(s) enviado(s)`);
      qc.invalidateQueries({ queryKey: ['churn-alert-recent'] });
    } catch (e) {
      toast.error(`Falha: ${(e as Error).message}`);
    } finally {
      setRunning(false);
    }
  };

  const [sendingTest, setSendingTest] = React.useState(false);
  const sendTestEmail = async () => {
    if (!draft) return;
    setSendingTest(true);
    try {
      const { data, error } = await supabase.functions.invoke('send-churn-alert-email', {
        body: { test: true },
      });
      if (error) throw error;
      const res = data as { ok: boolean; error?: string; recipients?: number };
      if (!res.ok) throw new Error(res.error ?? 'Falha desconhecida');
      toast.success(`E-mail de teste enviado para ${res.recipients} destinatário(s).`);
    } catch (e) {
      toast.error(`Falha no teste: ${(e as Error).message}`);
    } finally {
      setSendingTest(false);
    }
  };

  const levelBadge = (l: Level) => {
    const cls =
      l === 'critical'
        ? 'bg-destructive text-destructive-foreground'
        : l === 'high'
        ? 'bg-warning text-warning-foreground'
        : l === 'medium'
        ? 'bg-muted text-foreground'
        : 'bg-muted/50 text-muted-foreground';
    return <Badge className={cls}>{LEVEL_LABEL[l]}</Badge>;
  };

  return (
    <PageTransition>
      <Helmet>
        <title>Alertas de Churn | Admin</title>
        <meta name="description" content="Configurar alertas automáticos quando clientes cruzam limite de churn." />
      </Helmet>

      <div className="p-6 space-y-6 max-w-5xl mx-auto">
        <motion.div variants={itemVariants} className="flex items-center justify-between">
          <div>
            <h1 className="text-page-title flex items-center gap-2">
              <AlertTriangle className="h-6 w-6 text-primary" />
              Alertas de Churn
            </h1>
            <p className="text-muted-foreground text-sm mt-1">
              Notifica automaticamente o vendedor quando um cliente ultrapassa o limite de risco.
            </p>
          </div>
          <div className="flex items-center gap-2">
            <Button asChild variant="outline">
              <Link to="/admin/alertas-churn/historico">
                <History className="h-4 w-4 mr-2" />
                Histórico
              </Link>
            </Button>
            <Button onClick={runNow} disabled={running} variant="outline">
              <Play className="h-4 w-4 mr-2" />
              {running ? 'Executando...' : 'Executar agora'}
            </Button>
          </div>
        </motion.div>

        <motion.div variants={itemVariants}>
          <Card className="p-6 space-y-5">
            {isLoading || !draft ? (
              <Skeleton className="h-32 w-full" />
            ) : (
              <>
                <div className="flex items-center justify-between">
                  <div>
                    <Label className="text-label">Ativar alertas automáticos</Label>
                    <p className="text-xs text-muted-foreground">Verificação executada de hora em hora.</p>
                  </div>
                  <Switch
                    checked={draft.enabled}
                    onCheckedChange={(v) => setDraft({ ...draft, enabled: v })}
                  />
                </div>

                <div className="grid gap-4 md:grid-cols-2">
                  <div>
                    <Label className="text-label">Nível mínimo para alertar</Label>
                    <select
                      className="mt-1 w-full h-10 rounded-md border border-input bg-background px-3 text-sm"
                      value={draft.min_level}
                      onChange={(e) => setDraft({ ...draft, min_level: e.target.value as Level })}
                    >
                      <option value="low">Baixo</option>
                      <option value="medium">Médio</option>
                      <option value="high">Alto</option>
                      <option value="critical">Crítico</option>
                    </select>
                    <p className="text-xs text-muted-foreground mt-1">
                      Clientes com risco igual ou acima disparam alerta.
                    </p>
                  </div>
                  <div>
                    <Label className="text-label">Cooldown (horas)</Label>
                    <Input
                      type="number"
                      min={1}
                      max={720}
                      value={draft.cooldown_hours}
                      onChange={(e) =>
                        setDraft({ ...draft, cooldown_hours: Math.max(1, Number(e.target.value) || 1) })
                      }
                    />
                    <p className="text-xs text-muted-foreground mt-1">
                      Tempo mínimo entre alertas repetidos para o mesmo cliente. Escalonamento de nível ignora o cooldown.
                    </p>
                  </div>
                </div>

                <div className="flex justify-end">
                  <Button
                    onClick={() => saveMutation.mutate(draft)}
                    disabled={saveMutation.isPending}
                  >
                    <Save className="h-4 w-4 mr-2" />
                    Salvar
                  </Button>
                </div>
              </>
            )}
          </Card>
        </motion.div>

        <motion.div variants={itemVariants}>
          <Card className="p-6 space-y-5">
            <div className="flex items-center gap-2">
              <Mail className="h-4 w-4 text-primary" />
              <h2 className="text-lg font-semibold">Envio por e-mail</h2>
            </div>
            {isLoading || !draft ? (
              <Skeleton className="h-32 w-full" />
            ) : (
              <>
                <div className="flex items-center justify-between">
                  <div>
                    <Label className="text-label">Ativar envio por e-mail</Label>
                    <p className="text-xs text-muted-foreground">
                      Envia um e-mail toda vez que um alerta for disparado. Requer domínio verificado.
                    </p>
                  </div>
                  <Switch
                    checked={draft.email_enabled}
                    onCheckedChange={(v) => setDraft({ ...draft, email_enabled: v })}
                  />
                </div>

                <div className="grid gap-4 md:grid-cols-2">
                  <div>
                    <Label className="text-label">Provedor</Label>
                    <select
                      className="mt-1 w-full h-10 rounded-md border border-input bg-background px-3 text-sm"
                      value={draft.email_provider}
                      onChange={(e) => setDraft({ ...draft, email_provider: e.target.value })}
                    >
                      <option value="lovable">Lovable Emails (domínio próprio)</option>
                    </select>
                    <p className="text-xs text-muted-foreground mt-1">
                      Configure o domínio verificado em Cloud → E-mails antes de habilitar.
                    </p>
                  </div>
                  <div>
                    <Label className="text-label">Remetente (From)</Label>
                    <Input
                      type="email"
                      placeholder="alertas@seudominio.com"
                      value={draft.email_from ?? ''}
                      onChange={(e) => setDraft({ ...draft, email_from: e.target.value || null })}
                    />
                  </div>
                  <div>
                    <Label className="text-label">Responder para (Reply-To)</Label>
                    <Input
                      type="email"
                      placeholder="opcional"
                      value={draft.email_reply_to ?? ''}
                      onChange={(e) => setDraft({ ...draft, email_reply_to: e.target.value || null })}
                    />
                  </div>
                  <div>
                    <Label className="text-label">Assunto (template)</Label>
                    <Input
                      value={draft.email_subject_template}
                      onChange={(e) => setDraft({ ...draft, email_subject_template: e.target.value })}
                    />
                    <p className="text-xs text-muted-foreground mt-1">
                      Variáveis: <code>{'{{client_name}}'}</code>, <code>{'{{level}}'}</code>, <code>{'{{days}}'}</code>.
                    </p>
                  </div>
                </div>

                <div>
                  <Label className="text-label">Destinatários</Label>
                  <Textarea
                    rows={3}
                    placeholder="Um e-mail por linha ou separados por vírgula"
                    value={draft.email_recipients.join('\n')}
                    onChange={(e) =>
                      setDraft({
                        ...draft,
                        email_recipients: e.target.value
                          .split(/[\n,;]+/)
                          .map((s) => s.trim())
                          .filter(Boolean),
                      })
                    }
                  />
                  <p className="text-xs text-muted-foreground mt-1">
                    {draft.email_recipients.length} destinatário(s) configurado(s).
                  </p>
                </div>

                <div className="flex flex-wrap justify-end gap-2">
                  <Button
                    variant="outline"
                    onClick={sendTestEmail}
                    disabled={sendingTest || !draft.email_enabled || !draft.email_from || draft.email_recipients.length === 0}
                  >
                    <Send className="h-4 w-4 mr-2" />
                    {sendingTest ? 'Enviando...' : 'Enviar e-mail de teste'}
                  </Button>
                  <Button onClick={() => saveMutation.mutate(draft)} disabled={saveMutation.isPending}>
                    <Save className="h-4 w-4 mr-2" />
                    Salvar
                  </Button>
                </div>
              </>
            )}
          </Card>
        </motion.div>

        <motion.div variants={itemVariants}>
          <Card className="p-6">
            <div className="flex items-center gap-2 mb-4">
              <Bell className="h-4 w-4 text-primary" />
              <h2 className="text-lg font-semibold">Últimos alertas disparados</h2>
            </div>
            {!recent || recent.length === 0 ? (
              <p className="text-sm text-muted-foreground">Nenhum alerta registrado ainda.</p>
            ) : (
              <div className="divide-y divide-border">
                {recent.map((r) => (
                  <div
                    key={`${r.salesperson_id}-${r.client_name}`}
                    className="flex items-center justify-between py-3"
                  >
                    <div>
                      <div className="text-sm font-medium">{r.client_name}</div>
                      <div className="text-xs text-muted-foreground">
                        {r.last_days_since} dias sem comprar ·{' '}
                        {new Date(r.last_alerted_at).toLocaleString('pt-BR')}
                      </div>
                    </div>
                    {levelBadge(r.last_level)}
                  </div>
                ))}
              </div>
            )}
          </Card>
        </motion.div>
      </div>
    </PageTransition>
  );
};

export default AdminAlertasChurn;
