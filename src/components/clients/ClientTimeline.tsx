import { FC, useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Phone, Mail, Users, FileText, MessageSquare, Calendar, Clock, CheckCircle2, XCircle, ArrowRight } from 'lucide-react';
import { format, formatDistanceToNow } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { BehavioralAnalysisDialog } from '@/components/ai/BehavioralAnalysisDialog';

interface TimelineEvent {
  id: string;
  type: string;
  description: string;
  date: Date;
  outcome?: string;
  contactName?: string;
  notes?: string;
  durationMinutes?: number;
  relatedDeal?: { id: string; name: string; status: string };
}

interface ClientTimelineProps {
  clientId: string;
  clientName: string;
}

const activityIcons: Record<string, React.ReactNode> = {
  call: <Phone className="h-4 w-4" />,
  email: <Mail className="h-4 w-4" />,
  meeting: <Users className="h-4 w-4" />,
  proposal: <FileText className="h-4 w-4" />,
  whatsapp: <MessageSquare className="h-4 w-4" />,
  linkedin: <MessageSquare className="h-4 w-4" />,
  follow_up: <ArrowRight className="h-4 w-4" />,
};

const activityLabels: Record<string, string> = {
  call: 'Ligação',
  email: 'Email',
  meeting: 'Reunião',
  proposal: 'Proposta',
  whatsapp: 'WhatsApp',
  linkedin: 'LinkedIn',
  follow_up: 'Follow-up',
};

const outcomeColors: Record<string, string> = {
  positive: 'bg-success/10 text-success border-success/30',
  negative: 'bg-destructive/10 text-destructive border-destructive/30',
  neutral: 'bg-muted text-muted-foreground border-border',
  no_answer: 'bg-rank-gold/10 text-rank-gold border-rank-gold/30',
  scheduled: 'bg-primary/10 text-primary border-primary/30',
  completed: 'bg-success/10 text-success border-success/30',
};

const outcomeLabels: Record<string, string> = {
  positive: 'Positivo',
  negative: 'Negativo',
  neutral: 'Neutro',
  no_answer: 'Sem resposta',
  scheduled: 'Agendado',
  completed: 'Concluído',
};

export const ClientTimeline: FC<ClientTimelineProps> = ({ clientId, clientName }) => {
  const [filter, setFilter] = useState<string>('all');

  const { data: events, isLoading } = useQuery<TimelineEvent[]>({
    queryKey: ['client-timeline', clientId],
    queryFn: async () => {
      // Fetch activities linked to sales for this client
      const { data: sales, error: salesError } = await supabase
        .from('sales')
        .select('id, client_name, product_name, status')
        .eq('client_name', clientName);

      if (salesError) throw salesError;

      const saleIds = (sales || []).map(s => s.id);
      if (saleIds.length === 0) return [];

      const { data: activities, error: actError } = await supabase
        .from('activities')
        .select('*')
        .or(`sale_id.in.(${saleIds.join(',')}),client_id.eq.${clientId}`)
        .order('created_at', { ascending: false })
        .limit(100);

      if (actError) throw actError;

      const timelineEvents: TimelineEvent[] = [];

      (interactions || []).forEach(int => {
        timelineEvents.push({
          id: int.id,
          type: int.type,
          description: int.content || activityLabels[int.type] || int.type,
          date: new Date(int.created_at),
          outcome: int.metadata?.outcome,
          notes: int.content || undefined,
        });
      });

      const saleMap = new Map(sales?.map(s => [s.id, s]));

      allActivities.forEach(act => {
        const sale = act.sale_id ? saleMap.get(act.sale_id) : null;
        timelineEvents.push({
          id: act.id,
          type: act.activity_type,
          description: act.notes || activityLabels[act.activity_type] || act.activity_type,
          date: new Date(act.created_at),
          outcome: act.outcome || undefined,
          contactName: act.contact_name || undefined,
          notes: act.notes || undefined,
          durationMinutes: act.duration_minutes || undefined,
          relatedDeal: sale ? { id: sale.id, name: sale.product_name, status: sale.status } : undefined,
        });
      });

      return timelineEvents.sort((a, b) => b.date.getTime() - a.date.getTime());
    },
    enabled: !!clientId && !!clientName,
    staleTime: 1000 * 60 * 5,
  });

  const filteredEvents = filter === 'all'
    ? events
    : events?.filter(e => e.type === filter);

  const uniqueTypes = [...new Set(events?.map(e => e.type) || [])];

  return (
    <Card className="glass border-border/50">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="text-lg flex items-center gap-2">
            <Calendar className="h-5 w-5 text-primary" />
            Timeline de Interações
          </CardTitle>
          <Select value={filter} onValueChange={setFilter}>
            <SelectTrigger className="w-[150px] h-8 text-xs">
              <SelectValue placeholder="Filtrar" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Todas</SelectItem>
              {uniqueTypes.map(type => (
                <SelectItem key={type} value={type}>
                  {activityLabels[type] || type}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <div className="space-y-4">
            {[1, 2, 3].map(i => (
              <div key={i} className="animate-pulse flex gap-3">
                <div className="w-8 h-8 bg-muted rounded-full" />
                <div className="flex-1 space-y-2">
                  <div className="h-4 bg-muted rounded w-3/4" />
                  <div className="h-3 bg-muted rounded w-1/2" />
                </div>
              </div>
            ))}
          </div>
        ) : !filteredEvents?.length ? (
          <div className="text-center py-8 text-muted-foreground">
            <Calendar className="h-10 w-10 mx-auto mb-2 opacity-30" />
            <p className="text-sm">Nenhuma interação registrada</p>
          </div>
        ) : (
          <ScrollArea className="h-[400px] pr-2">
            <div className="relative">
              {/* Timeline line */}
              <div className="absolute left-4 top-0 bottom-0 w-px bg-border" />

              <div className="space-y-1">
                {filteredEvents.map((event, _idx) => (
                  <div key={event.id} className="relative flex gap-3 pl-1 py-2 group">
                    {/* Dot */}
                    <div className="relative z-10 flex items-center justify-center w-8 h-8 rounded-full bg-card border-2 border-border group-hover:border-primary transition-colors shrink-0">
                      {activityIcons[event.type] || <Calendar className="h-4 w-4" />}
                    </div>

                    {/* Content */}
                    <div className="flex-1 min-w-0 pb-2">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="text-sm font-medium">
                          {activityLabels[event.type] || event.type}
                        </span>
                        {event.outcome && (
                          <Badge variant="outline" className={`text-[10px] px-1.5 py-0 ${outcomeColors[event.outcome] || ''}`}>
                            {event.outcome === 'positive' ? <CheckCircle2 className="h-3 w-3 mr-0.5" /> : null}
                            {event.outcome === 'negative' ? <XCircle className="h-3 w-3 mr-0.5" /> : null}
                            {outcomeLabels[event.outcome] || event.outcome}
                          </Badge>
                        )}
                        {event.durationMinutes && (
                          <span className="text-[10px] text-muted-foreground flex items-center gap-0.5">
                            <Clock className="h-3 w-3" />
                            {event.durationMinutes}min
                          </span>
                        )}
                      </div>

                      {event.contactName && (
                        <p className="text-xs text-muted-foreground mt-0.5">
                          Contato: {event.contactName}
                        </p>
                      )}

                      {event.notes && (
                        <p className="text-xs text-muted-foreground mt-1 line-clamp-2">
                          {event.notes}
                        </p>
                      )}

                      {event.relatedDeal && (
                        <Badge variant="secondary" className="text-[10px] mt-1">
                          {event.relatedDeal.name} • {event.relatedDeal.status}
                        </Badge>
                      )}

                      <div className="flex items-center justify-between gap-2 mt-1">
                        <p className="text-[10px] text-muted-foreground/60">
                          {format(event.date, "dd/MM/yyyy HH:mm", { locale: ptBR })} • {formatDistanceToNow(event.date, { addSuffix: true, locale: ptBR })}
                        </p>
                        {event.notes && event.notes.length >= 100 && (
                          <BehavioralAnalysisDialog
                            text={event.notes}
                            interactionId={event.id}
                            contactName={event.contactName}
                            channel={event.type}
                            triggerLabel="IA"
                          />
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </ScrollArea>
        )}
      </CardContent>
    </Card>
  );
};
