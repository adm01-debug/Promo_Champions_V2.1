import { useEffect, useState } from 'react';
import { Helmet } from 'react-helmet-async';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { toast } from 'sonner';
import { Loader2, PlayCircle } from 'lucide-react';
import { format } from 'date-fns';

interface QueueSettings {
  id: string;
  enabled: boolean;
  cutoff_time: string;
  timezone: string;
  min_urgency: 'critical' | 'high' | 'medium';
  max_tasks_per_salesperson: number;
  last_run_date: string | null;
  last_run_created_count: number | null;
}

export default function AdminFilaTarefasAutomaticas() {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [running, setRunning] = useState(false);
  const [s, setS] = useState<QueueSettings | null>(null);

  useEffect(() => {
    (async () => {
      const { data, error } = await supabase
        .from('auto_task_queue_settings')
        .select('*')
        .eq('singleton', true)
        .maybeSingle();
      if (error) toast.error('Falha ao carregar configurações');
      setS(data as QueueSettings | null);
      setLoading(false);
    })();
  }, []);

  const save = async () => {
    if (!s) return;
    setSaving(true);
    const { error } = await supabase
      .from('auto_task_queue_settings')
      .update({
        enabled: s.enabled,
        cutoff_time: s.cutoff_time,
        timezone: s.timezone,
        min_urgency: s.min_urgency,
        max_tasks_per_salesperson: s.max_tasks_per_salesperson,
      })
      .eq('id', s.id);
    setSaving(false);
    if (error) { toast.error('Não foi possível salvar'); return; }
    toast.success('Configurações salvas');
  };

  const runNow = async () => {
    setRunning(true);
    const { data, error } = await supabase.functions.invoke('generate-urgent-client-tasks', {
      body: {},
      // force execution regardless of schedule
      method: 'POST',
    });
    setRunning(false);
    if (error) return toast.error('Falha ao executar');
    toast.success(`Fila executada: ${JSON.stringify(data)}`);
  };

  if (loading || !s) {
    return (
      <div className="flex items-center justify-center py-24">
        <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
      </div>
    );
  }

  return (
    <div className="container max-w-3xl py-8 space-y-6">
      <Helmet>
        <title>Fila Diária de Tarefas Automáticas</title>
        <meta name="description" content="Configure a geração automática diária de tarefas para clientes com urgência alta." />
      </Helmet>

      <div>
        <h1 className="text-page-title">Fila Diária Automática</h1>
        <p className="text-muted-foreground mt-1">
          Gera tarefas automaticamente para clientes com urgência alta todo dia após o horário definido.
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Configurações</CardTitle>
          <CardDescription>Ajuste horário, urgência mínima e limite por vendedor.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="flex items-center justify-between">
            <div>
              <Label htmlFor="enabled" className="text-base">Fila ativa</Label>
              <p className="text-sm text-muted-foreground">Quando ligada, roda diariamente após o horário limite.</p>
            </div>
            <Switch id="enabled" checked={s.enabled} onCheckedChange={(v) => setS({ ...s, enabled: v })} />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="cutoff">Horário de execução</Label>
              <Input
                id="cutoff"
                type="time"
                value={s.cutoff_time.slice(0, 5)}
                onChange={(e) => setS({ ...s, cutoff_time: `${e.target.value}:00` })}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="tz">Fuso horário</Label>
              <Input id="tz" value={s.timezone} onChange={(e) => setS({ ...s, timezone: e.target.value })} />
            </div>

            <div className="space-y-2">
              <Label>Urgência mínima</Label>
              <Select
                value={s.min_urgency}
                onValueChange={(v) => setS({ ...s, min_urgency: v as QueueSettings['min_urgency'] })}
              >
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="critical">Apenas crítica</SelectItem>
                  <SelectItem value="high">Alta ou crítica</SelectItem>
                  <SelectItem value="medium">Média para cima</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="max">Máx. tarefas por vendedor</Label>
              <Input
                id="max"
                type="number"
                min={1}
                max={50}
                value={s.max_tasks_per_salesperson}
                onChange={(e) => setS({ ...s, max_tasks_per_salesperson: Number(e.target.value) })}
              />
            </div>
          </div>

          <div className="rounded-md border border-border/60 bg-muted/40 p-3 text-sm">
            <div>Última execução: {s.last_run_date ? format(new Date(s.last_run_date), 'dd/MM/yyyy') : '—'}</div>
            <div>Tarefas criadas na última execução: {s.last_run_created_count ?? 0}</div>
          </div>

          <div className="flex flex-wrap gap-2 justify-end">
            <Button variant="outline" onClick={runNow} disabled={running}>
              {running ? <Loader2 className="h-4 w-4 animate-spin" /> : <PlayCircle className="h-4 w-4" />}
              <span className="ml-2">Executar agora</span>
            </Button>
            <Button onClick={save} disabled={saving}>
              {saving && <Loader2 className="h-4 w-4 animate-spin mr-2" />}
              Salvar
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
