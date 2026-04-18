import { useState } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useXpAdjustments } from '@/hooks/admin-tasks/useXpAdjustments';
import { formatXp } from './taskConsoleHelpers';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';

export function XpAdjustmentPanel() {
  const [userId, setUserId] = useState('');
  const [amount, setAmount] = useState<string>('');
  const [reason, setReason] = useState('');
  const { data: history, adjust } = useXpAdjustments(30);

  const { data: salespeople } = useQuery<{ id: string; name: string }[]>({
    queryKey: ['salespeople-min'],
    queryFn: async () => {
      const { data, error } = await supabase.from('salespeople_public').select('id, name').order('name');
      if (error) throw error;
      return (data || []).filter((s): s is { id: string; name: string } => !!s.id && !!s.name);
    },
  });

  const handleSubmit = async () => {
    const n = Number(amount);
    if (!userId || !n || reason.trim().length < 3) return;
    await adjust.mutateAsync({ userId, amount: n, reason });
    setAmount('');
    setReason('');
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
      <Card className="p-4 space-y-3">
        <h3 className="font-display text-lg">Ajuste manual de XP</h3>
        <div>
          <Label>Vendedor</Label>
          <Select value={userId} onValueChange={setUserId}>
            <SelectTrigger><SelectValue placeholder="Selecione…" /></SelectTrigger>
            <SelectContent>
              {(salespeople || []).map((s) => (
                <SelectItem key={s.id} value={s.id}>{s.name}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <div>
          <Label>Quantidade (use negativo para deduzir)</Label>
          <Input type="number" value={amount} onChange={(e) => setAmount(e.target.value)} placeholder="ex: 100 ou -50" />
        </div>
        <div>
          <Label>Motivo (obrigatório)</Label>
          <Textarea value={reason} onChange={(e) => setReason(e.target.value)} rows={3} placeholder="Descreva o motivo do ajuste…" />
        </div>
        <Button
          onClick={handleSubmit}
          disabled={!userId || !amount || reason.trim().length < 3 || adjust.isPending}
          className="w-full"
        >
          Registrar ajuste
        </Button>
      </Card>

      <Card className="p-4">
        <h3 className="font-display text-lg mb-3">Histórico recente</h3>
        <div className="space-y-2 max-h-96 overflow-auto">
          {(history || []).map((h) => (
            <div key={h.id} className="flex items-start justify-between gap-2 p-2 rounded border">
              <div className="min-w-0 flex-1">
                <div className="flex items-center gap-2">
                  <Badge variant={h.amount >= 0 ? 'default' : 'destructive'}>{formatXp(h.amount)}</Badge>
                  <span className="text-xs text-muted-foreground">{h.source}</span>
                </div>
                <p className="text-xs text-muted-foreground mt-1 truncate">{h.reason}</p>
              </div>
              <span className="text-xs text-muted-foreground shrink-0">
                {format(new Date(h.created_at), "dd/MM HH:mm", { locale: ptBR })}
              </span>
            </div>
          ))}
          {!history?.length && <p className="text-sm text-muted-foreground text-center py-4">Sem ajustes ainda</p>}
        </div>
      </Card>
    </div>
  );
}
