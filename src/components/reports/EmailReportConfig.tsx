import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Mail, Clock, FileText, Send, CheckCircle2, Settings2 } from 'lucide-react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

interface ReportConfig {
  id: string;
  email: string;
  frequency: string;
  is_active: boolean;
  preferred_time: string;
  notify_stagnant_deals: boolean;
  notify_inactive_clients: boolean;
  notify_at_risk_goals: boolean;
  stagnant_threshold_days: number;
  inactive_threshold_days: number;
  consecutive_days_threshold: number;
}

const FREQUENCIES = [
  { value: 'daily', label: 'Diário' },
  { value: 'weekly', label: 'Semanal' },
  { value: 'biweekly', label: 'Quinzenal' },
  { value: 'monthly', label: 'Mensal' },
];

export function EmailReportConfig() {
  const queryClient = useQueryClient();

  const { data: config, isLoading } = useQuery({
    queryKey: ['email-report-config'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('notification_preferences')
        .select('*')
        .limit(1)
        .maybeSingle();
      if (error) throw error;
      return data as ReportConfig | null;
    },
  });

  const [formState, setFormState] = useState<Partial<ReportConfig>>({});
  const currentValues = { ...config, ...formState };

  const upsertConfig = useMutation({
    mutationFn: async (values: Partial<ReportConfig>) => {
      if (config?.id) {
        const { error } = await supabase
          .from('notification_preferences')
          .update(values)
          .eq('id', config.id);
        if (error) throw error;
      } else {
        const { error } = await supabase
          .from('notification_preferences')
          .insert({ email: values.email || '', ...values });
        if (error) throw error;
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['email-report-config'] });
      toast.success('Configurações de relatório salvas!');
      setFormState({});
    },
    onError: () => toast.error('Erro ao salvar configurações'),
  });

  const handleSave = () => {
    if (!currentValues.email) {
      toast.error('Informe um email');
      return;
    }
    upsertConfig.mutate(currentValues);
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <div className="flex items-center gap-2">
            <Mail className="h-5 w-5 text-primary" />
            <div>
              <CardTitle className="text-lg">Relatórios por Email</CardTitle>
              <CardDescription>Configure o envio automático de relatórios de performance</CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Email de destino</Label>
              <Input
                type="email"
                placeholder="seu@email.com"
                value={currentValues.email || ''}
                onChange={e => setFormState(s => ({ ...s, email: e.target.value }))}
              />
            </div>
            <div className="space-y-2">
              <Label>Frequência</Label>
              <Select
                value={currentValues.frequency || 'weekly'}
                onValueChange={v => setFormState(s => ({ ...s, frequency: v }))}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {FREQUENCIES.map(f => (
                    <SelectItem key={f.value} value={f.value}>{f.label}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Horário preferido</Label>
              <Input
                type="time"
                value={currentValues.preferred_time || '08:00'}
                onChange={e => setFormState(s => ({ ...s, preferred_time: e.target.value }))}
              />
            </div>
            <div className="flex items-center gap-3 pt-6">
              <Switch
                checked={currentValues.is_active ?? true}
                onCheckedChange={v => setFormState(s => ({ ...s, is_active: v }))}
              />
              <Label>Ativar envio automático</Label>
              <Badge variant={currentValues.is_active ? 'default' : 'secondary'}>
                {currentValues.is_active ? 'Ativo' : 'Pausado'}
              </Badge>
            </div>
          </div>

          <Separator />

          <div>
            <h3 className="text-sm font-semibold flex items-center gap-2 mb-4">
              <Settings2 className="h-4 w-4" />
              Alertas Incluídos no Relatório
            </h3>
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium">Deals Estagnados</p>
                  <p className="text-xs text-muted-foreground">
                    Deals parados há mais de {currentValues.stagnant_threshold_days || 7} dias
                  </p>
                </div>
                <Switch
                  checked={currentValues.notify_stagnant_deals ?? true}
                  onCheckedChange={v => setFormState(s => ({ ...s, notify_stagnant_deals: v }))}
                />
              </div>
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium">Clientes Inativos</p>
                  <p className="text-xs text-muted-foreground">
                    Sem interação há mais de {currentValues.inactive_threshold_days || 30} dias
                  </p>
                </div>
                <Switch
                  checked={currentValues.notify_inactive_clients ?? true}
                  onCheckedChange={v => setFormState(s => ({ ...s, notify_inactive_clients: v }))}
                />
              </div>
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium">Metas em Risco</p>
                  <p className="text-xs text-muted-foreground">
                    Metas com desempenho abaixo de {currentValues.consecutive_days_threshold || 3} dias consecutivos
                  </p>
                </div>
                <Switch
                  checked={currentValues.notify_at_risk_goals ?? true}
                  onCheckedChange={v => setFormState(s => ({ ...s, notify_at_risk_goals: v }))}
                />
              </div>
            </div>
          </div>

          <Separator />

          <div className="flex justify-end gap-3">
            <Button variant="outline" onClick={() => setFormState({})}>
              Cancelar
            </Button>
            <Button onClick={handleSave} disabled={upsertConfig.isPending}>
              <Send className="h-4 w-4 mr-2" />
              Salvar Configurações
            </Button>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <div className="flex items-center gap-2">
            <FileText className="h-5 w-5 text-primary" />
            <div>
              <CardTitle className="text-lg">Preview do Relatório</CardTitle>
              <CardDescription>Exemplo do que será enviado</CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="bg-muted/30 rounded-lg p-4 border space-y-3">
            <div className="flex items-center gap-2 text-sm">
              <Clock className="h-4 w-4 text-muted-foreground" />
              <span className="text-muted-foreground">
                Próximo envio: {currentValues.frequency === 'daily' ? 'Amanhã' : 'Segunda-feira'}
                , às {currentValues.preferred_time || '08:00'}
              </span>
            </div>
            <Separator />
            <div className="space-y-2 text-sm">
              <div className="flex items-center gap-2">
                <CheckCircle2 className="h-4 w-4 text-green-500" />
                <span>Resumo de vendas do período</span>
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle2 className="h-4 w-4 text-green-500" />
                <span>Performance individual vs meta</span>
              </div>
              {currentValues.notify_stagnant_deals && (
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="h-4 w-4 text-green-500" />
                  <span>Lista de deals estagnados</span>
                </div>
              )}
              {currentValues.notify_inactive_clients && (
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="h-4 w-4 text-green-500" />
                  <span>Clientes inativos para reengajamento</span>
                </div>
              )}
              {currentValues.notify_at_risk_goals && (
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="h-4 w-4 text-green-500" />
                  <span>Metas em risco de não cumprimento</span>
                </div>
              )}
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
