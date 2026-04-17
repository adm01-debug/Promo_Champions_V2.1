import { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Phone, SkipForward, Clock, Building2 } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useQuery } from '@tanstack/react-query';
import { useSnoozeItem, useCallLogsForSale } from '@/hooks/dialer/usePowerDialer';
import { dispositionLabel } from './dialerHelpers';
import { formatDistanceToNow } from 'date-fns';
import { ptBR } from 'date-fns/locale';

interface Props {
  itemId: string;
  saleId: string;
  score: number;
  onSkip: () => void;
}

export const CurrentCallCard = ({ itemId, saleId, score, onSkip }: Props) => {
  const [seconds, setSeconds] = useState(0);
  const snooze = useSnoozeItem();

  useEffect(() => {
    const t = setInterval(() => setSeconds((s) => s + 1), 1000);
    return () => clearInterval(t);
  }, [itemId]);

  const { data: sale } = useQuery({
    queryKey: ['sale-detail', saleId],
    enabled: !!saleId,
    queryFn: async () => {
      const { data } = await supabase.from('sales').select('id, client_name, contact_phone, status, value, last_interaction').eq('id', saleId).single();
      return data;
    },
  });

  const { data: history } = useCallLogsForSale(saleId);

  const mm = String(Math.floor(seconds / 60)).padStart(2, '0');
  const ss = String(seconds % 60).padStart(2, '0');

  return (
    <Card className="border-primary/30 bg-primary/5">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Phone className="h-5 w-5 text-primary animate-pulse" />
            <CardTitle className="text-lg">Em ligação</CardTitle>
          </div>
          <Badge variant="outline" className="font-mono">{mm}:{ss}</Badge>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <Building2 className="h-4 w-4 text-muted-foreground" />
            <h2 className="text-2xl font-bold">{sale?.client_name ?? '—'}</h2>
          </div>
          {sale?.contact_phone && (
            <a href={`tel:${sale.contact_phone}`} className="text-primary text-lg hover:underline">
              {sale.contact_phone}
            </a>
          )}
          <div className="flex gap-2 mt-2">
            <Badge variant="secondary">Score: {score.toFixed(0)}</Badge>
            {sale?.status && <Badge variant="outline">{sale.status}</Badge>}
          </div>
        </div>

        {history && history.length > 0 && (
          <div className="space-y-1 text-xs">
            <p className="font-semibold text-muted-foreground uppercase">Últimas chamadas</p>
            {history.slice(0, 3).map((h) => (
              <div key={h.id} className="flex justify-between text-muted-foreground">
                <span>{dispositionLabel(h.disposition)}</span>
                <span>{formatDistanceToNow(new Date(h.created_at), { locale: ptBR, addSuffix: true })}</span>
              </div>
            ))}
          </div>
        )}

        <div className="flex gap-2 pt-2">
          <Button variant="outline" size="sm" onClick={() => snooze.mutate({ item_id: itemId, snooze_minutes: 60 })}>
            <Clock className="h-4 w-4 mr-1" /> Adiar 1h
          </Button>
          <Button variant="outline" size="sm" onClick={onSkip}>
            <SkipForward className="h-4 w-4 mr-1" /> Pular
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};
