import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Mail, Phone, ArrowRight, CheckCircle2, AlertCircle } from 'lucide-react';
import { Linkedin } from '@/components/icons/Linkedin';
import { motion } from 'framer-motion';
import { useQuery } from '@tanstack/react-query';
import { useNavigate } from 'react-router-dom';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { supabase } from '@/integrations/supabase/client';
import { useSequences } from '@/hooks/sequences/useSequences';

interface EnrollmentRow {
  sequence_id: string;
  status: string;
  next_action_at: string | null;
}

function channelIcon(channels: string[] | null | undefined) {
  const mix = (channels ?? []).map(c => c.toLowerCase());
  if (mix.some(c => c.includes('linkedin') || c.includes('social'))) return Linkedin;
  if (mix.some(c => c.includes('email') || c.includes('mail'))) return Mail;
  return Phone;
}

export const SDRSequenceOrchestrator = () => {
  const navigate = useNavigate();
  const { data: sequences } = useSequences();
  const { data: enrollments } = useQuery({
    queryKey: ['sequence-enrollment-stats'],
    queryFn: async (): Promise<EnrollmentRow[]> => {
      const { data, error } = await supabase
        .from('sequence_enrollments')
        .select('sequence_id, status, next_action_at')
        .limit(1000);
      if (error) throw error;
      return (data ?? []) as EnrollmentRow[];
    },
    staleTime: 5 * 60 * 1000,
  });

  const stats = new Map<string, { total: number; active: number; completed: number }>();
  (enrollments ?? []).forEach(e => {
    const s = stats.get(e.sequence_id) ?? { total: 0, active: 0, completed: 0 };
    s.total += 1;
    if (e.status === 'active') s.active += 1;
    if (e.status === 'completed') s.completed += 1;
    stats.set(e.sequence_id, s);
  });

  const seqList = (sequences ?? []).slice(0, 5).map(seq => {
    const s = stats.get(seq.id) ?? { total: 0, active: 0, completed: 0 };
    const pct = s.total > 0 ? Math.round((s.completed / s.total) * 100) : 0;
    return { seq, ...s, pct };
  });

  const nextActions = (enrollments ?? [])
    .filter(e => e.status === 'active' && e.next_action_at)
    .sort(
      (a, b) =>
        new Date(a.next_action_at!).getTime() - new Date(b.next_action_at!).getTime()
    )
    .slice(0, 3)
    .map(e => ({
      ...e,
      sequence: (sequences ?? []).find(s => s.id === e.sequence_id),
    }))
    .filter(e => e.sequence);

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
      <Card className="md:col-span-2 glass border-primary/10 overflow-hidden relative">
        <div className="absolute top-0 right-0 p-4">
          <Badge
            variant="outline"
            className="bg-primary/5 text-primary border-primary/20 animate-pulse"
          >
            Live Orchestrator
          </Badge>
        </div>
        <CardHeader>
          <CardTitle className="text-section-title flex items-center gap-2">
            <ArrowRight className="h-5 w-5 text-primary" />
            Sequências Ativas
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          {seqList.length === 0 && (
            <div className="py-8 text-center space-y-1">
              <p className="text-sm font-medium text-muted-foreground">
                Nenhuma sequência cadastrada
              </p>
              <p className="text-xs text-muted-foreground">
                Crie cadências em /cadencias para orquestrar o follow-up do time.
              </p>
            </div>
          )}
          {seqList.map(({ seq, total, active, completed, pct }) => {
            const Icon = channelIcon(seq.channel_mix);
            return (
              <div key={seq.id} className="space-y-2">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div
                      className={`p-2 rounded-lg ${
                        seq.enabled
                          ? 'bg-primary/10 text-primary'
                          : 'bg-muted text-muted-foreground'
                      }`}
                    >
                      <Icon className="h-4 w-4" />
                    </div>
                    <div>
                      <p className="text-sm font-semibold">{seq.name}</p>
                      <p className="text-xs text-muted-foreground">
                        {active} ativos • {completed} concluídos de {total} enrollments
                      </p>
                    </div>
                  </div>
                  <div className="text-right">
                    <Badge
                      variant={seq.enabled ? 'default' : 'secondary'}
                      className="text-[10px]"
                    >
                      {seq.enabled ? 'ATIVA' : 'PAUSADA'}
                    </Badge>
                  </div>
                </div>
                <div className="flex items-center gap-4">
                  <Progress value={pct} className="h-1.5 flex-1" />
                  <span className="text-[10px] font-mono font-medium text-muted-foreground">
                    {pct}%
                  </span>
                </div>
              </div>
            );
          })}
        </CardContent>
      </Card>

      <Card className="glass border-primary/10 bg-gradient-to-br from-primary/5 to-transparent">
        <CardHeader>
          <CardTitle className="text-section-title text-sm flex items-center gap-2">
            <CheckCircle2 className="h-4 w-4 text-green-500" />
            Melhores Próximas Ações
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {nextActions.length === 0 && (
            <div className="py-6 text-center space-y-1">
              <p className="text-xs font-medium text-muted-foreground">
                Nenhuma ação agendada
              </p>
              <p className="text-[11px] text-muted-foreground">
                Quando houver enrollments ativos, os próximos passos aparecem aqui.
              </p>
            </div>
          )}
          {nextActions.map((action, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: i * 0.1 }}
              className="p-3 rounded-xl border border-primary/10 bg-background/50 space-y-2 hover:border-primary/30 transition-colors cursor-pointer group"
              onClick={() => navigate('/cadencias')}
            >
              <div className="flex items-center justify-between">
                <p className="text-xs font-bold truncate max-w-[140px]">
                  {action.sequence!.name}
                </p>
                <div className="p-1 rounded bg-primary/10">
                  {(() => {
                    const Icon = channelIcon(action.sequence!.channel_mix);
                    return <Icon className="h-3 w-3 text-primary" />;
                  })()}
                </div>
              </div>
              <p className="text-[11px] font-medium leading-tight group-hover:text-primary transition-colors">
                Próximo passo do enrollment
              </p>
              <div className="flex items-center gap-1 text-[9px] text-muted-foreground">
                <AlertCircle className="h-2.5 w-2.5 text-amber-500" />
                <span>
                  Agendado para{' '}
                  {format(new Date(action.next_action_at!), "dd/MM 'às' HH:mm", {
                    locale: ptBR,
                  })}
                </span>
              </div>
            </motion.div>
          ))}
          <Button
            variant="outline"
            className="w-full text-[10px] h-8 mt-2 border-primary/20 hover:bg-primary/10"
            onClick={() => navigate('/cadencias')}
          >
            Ver todas as tarefas
          </Button>
        </CardContent>
      </Card>
    </div>
  );
};
