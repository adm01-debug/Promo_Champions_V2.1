import { useState, useMemo } from 'react';
import { useNextBestActionQuery, NextBestAction } from '@/hooks/useNextBestAction';
import { useCreateTask } from '@/hooks/tasks/useTaskMutations';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import {
  Lightbulb, Phone, Mail, Users, ArrowRight, MessageSquare,
  FileText, Loader2, AlertTriangle, Linkedin, MessagesSquare,
  Sparkles, Plus, Target, RefreshCw, TrendingUp, Calendar,
} from 'lucide-react';
import { Skeleton } from '@/components/ui/skeleton';
import { cn } from '@/lib/utils';

interface NextBestActionCardProps {
  salespersonId?: string;
}

const actionIcons: Record<string, React.ReactNode> = {
  call: <Phone className="h-4 w-4" />,
  meeting: <Users className="h-4 w-4" />,
  email: <Mail className="h-4 w-4" />,
  follow_up: <ArrowRight className="h-4 w-4" />,
  proposal: <FileText className="h-4 w-4" />,
  linkedin: <Linkedin className="h-4 w-4" />,
  whatsapp: <MessagesSquare className="h-4 w-4" />,
  other: <MessageSquare className="h-4 w-4" />,
};

const priorityStyles: Record<string, string> = {
  high: 'bg-destructive/10 text-destructive border-destructive/20',
  medium: 'bg-accent text-accent-foreground border-border',
  low: 'bg-muted text-muted-foreground border-border',
};

const priorityLabels: Record<string, string> = {
  high: 'Alta', medium: 'Média', low: 'Baixa',
};

const categoryLabels: Record<string, string> = {
  urgent: 'Urgente', growth: 'Crescimento', retention: 'Retenção',
  prospecting: 'Prospecção', admin: 'Admin',
};

const categoryStyles: Record<string, string> = {
  urgent: 'bg-destructive/10 text-destructive',
  growth: 'bg-primary/10 text-primary',
  retention: 'bg-accent text-accent-foreground',
  prospecting: 'bg-secondary text-secondary-foreground',
  admin: 'bg-muted text-muted-foreground',
};

type FilterTab = 'all' | 'urgent' | 'growth' | 'retention' | 'prospecting';

export function NextBestActionCard({ salespersonId }: NextBestActionCardProps) {
  const { data, isLoading, error, refetch, isFetching } = useNextBestActionQuery(salespersonId);
  const [filter, setFilter] = useState<FilterTab>('all');
  const [dismissed, setDismissed] = useState<Set<number>>(new Set());

  const filtered = useMemo(() => {
    if (!data?.suggestions) return [];
    return data.suggestions
      .map((s, idx) => ({ ...s, _idx: idx }))
      .filter(s => !dismissed.has(s._idx))
      .filter(s => filter === 'all' || s.category === filter);
  }, [data, filter, dismissed]);

  if (!salespersonId) return null;

  return (
    <Card className="border-primary/20 shadow-sm">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between gap-2">
          <CardTitle className="flex items-center gap-2 text-base">
            <div className="p-1.5 rounded-lg bg-primary/10">
              <Sparkles className="h-4 w-4 text-primary" />
            </div>
            Próximas Melhores Ações
            <Badge variant="outline" className="text-[10px] gap-1">
              <Lightbulb className="h-3 w-3" /> IA Contextual
            </Badge>
          </CardTitle>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => refetch()}
            disabled={isFetching}
            className="h-8 px-2"
          >
            <RefreshCw className={cn('h-3.5 w-3.5', isFetching && 'animate-spin')} />
          </Button>
        </div>

        {data?.summary && (
          <div className="grid grid-cols-3 gap-2 mt-3 text-xs">
            <SummaryStat icon={<Target className="h-3 w-3" />} label="Pipeline" value={data.summary.totalDeals} />
            <SummaryStat icon={<AlertTriangle className="h-3 w-3" />} label="Em risco" value={data.summary.atRisk} tone="danger" />
            <SummaryStat icon={<TrendingUp className="h-3 w-3" />} label="Meta" value={`${Math.round(data.summary.goalProgress)}%`} />
          </div>
        )}
      </CardHeader>

      <CardContent className="space-y-3">
        {isLoading && (
          <div className="space-y-3">
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <Loader2 className="h-4 w-4 animate-spin" />
              Analisando contexto com IA...
            </div>
            {[1, 2, 3].map(i => <Skeleton key={i} className="h-24 w-full" />)}
          </div>
        )}

        {error && (
          <div className="flex items-center gap-2 text-sm text-muted-foreground py-4">
            <AlertTriangle className="h-4 w-4 text-destructive" />
            Não foi possível carregar as sugestões.
          </div>
        )}

        {data && !isLoading && (
          <>
            {data.insight && (
              <p className="text-sm text-muted-foreground italic border-l-2 border-primary/30 pl-3">
                {data.insight}
              </p>
            )}

            <Tabs value={filter} onValueChange={v => setFilter(v as FilterTab)}>
              <TabsList className="grid grid-cols-5 h-8">
                <TabsTrigger value="all" className="text-xs">Todas</TabsTrigger>
                <TabsTrigger value="urgent" className="text-xs">Urgente</TabsTrigger>
                <TabsTrigger value="growth" className="text-xs">Cresc.</TabsTrigger>
                <TabsTrigger value="retention" className="text-xs">Reten.</TabsTrigger>
                <TabsTrigger value="prospecting" className="text-xs">Prosp.</TabsTrigger>
              </TabsList>
            </Tabs>

            <TooltipProvider>
              <div className="space-y-2">
                {filtered.length === 0 ? (
                  <p className="text-xs text-muted-foreground text-center py-6">
                    Nenhuma ação nesta categoria.
                  </p>
                ) : (
                  filtered.map((action) => (
                    <ActionItem
                      key={action._idx}
                      action={action}
                      salespersonId={salespersonId}
                      onDismiss={() => setDismissed(prev => new Set(prev).add(action._idx))}
                    />
                  ))
                )}
              </div>
            </TooltipProvider>
          </>
        )}
      </CardContent>
    </Card>
  );
}

function SummaryStat({ icon, label, value, tone }: { icon: React.ReactNode; label: string; value: string | number; tone?: 'danger' }) {
  return (
    <div className="rounded-lg border bg-card p-2">
      <div className={cn('flex items-center gap-1 text-[10px]', tone === 'danger' ? 'text-destructive' : 'text-muted-foreground')}>
        {icon}{label}
      </div>
      <div className="text-sm font-semibold mt-0.5">{value}</div>
    </div>
  );
}

function ActionItem({
  action, salespersonId, onDismiss,
}: { action: NextBestAction; salespersonId: string; onDismiss: () => void }) {
  const createTask = useCreateTask();

  const handleCreate = () => {
    const allowed: Array<NextBestAction['actionType']> = ['call', 'email', 'meeting', 'follow_up', 'proposal', 'other'];
    const taskType = (allowed.includes(action.actionType) ? action.actionType : 'other') as
      'call' | 'email' | 'meeting' | 'follow_up' | 'proposal' | 'other';
    createTask.mutate({
      title: action.title,
      description: [action.description, action.rationale && `Rationale: ${action.rationale}`, action.expectedImpact && `Impacto: ${action.expectedImpact}`]
        .filter(Boolean).join('\n\n'),
      due_date: action.suggestedDate || new Date().toISOString().slice(0, 10),
      due_time: action.suggestedTime || undefined,
      task_type: taskType,
      priority: action.priority,
      salesperson_id: salespersonId,
      sale_id: action.dealId || undefined,
    }, { onSuccess: onDismiss });
  };

  const confidence = action.confidence != null ? Math.round(action.confidence * 100) : null;

  return (
    <div className="flex gap-3 p-3 rounded-lg border bg-card hover:bg-accent/30 transition-colors group">
      <div className="flex-shrink-0">
        <div className="p-2 rounded-lg bg-primary/10 text-primary">
          {actionIcons[action.actionType] || actionIcons.other}
        </div>
      </div>
      <div className="flex-1 min-w-0 space-y-1.5">
        <div className="flex items-start gap-2 flex-wrap">
          <span className="font-medium text-sm leading-tight">{action.title}</span>
          <div className="flex items-center gap-1 ml-auto">
            <Badge variant="outline" className={`text-[10px] ${priorityStyles[action.priority]}`}>
              {priorityLabels[action.priority]}
            </Badge>
            {action.category && (
              <Badge variant="outline" className={`text-[10px] ${categoryStyles[action.category]}`}>
                {categoryLabels[action.category]}
              </Badge>
            )}
          </div>
        </div>

        <p className="text-xs text-muted-foreground line-clamp-2">{action.description}</p>

        {action.rationale && (
          <Tooltip>
            <TooltipTrigger asChild>
              <p className="text-[11px] text-primary/70 italic line-clamp-1 cursor-help">
                💡 {action.rationale}
              </p>
            </TooltipTrigger>
            <TooltipContent className="max-w-xs">{action.rationale}</TooltipContent>
          </Tooltip>
        )}

        <div className="flex items-center gap-3 text-[10px] text-muted-foreground flex-wrap">
          {action.dealClient && (
            <span className="text-primary/80 font-medium">{action.dealClient}</span>
          )}
          {action.suggestedDate && (
            <span className="flex items-center gap-1">
              <Calendar className="h-3 w-3" />{action.suggestedDate}
              {action.suggestedTime && ` • ${action.suggestedTime}`}
            </span>
          )}
          {confidence != null && (
            <span className="flex items-center gap-1">
              <Sparkles className="h-3 w-3" />{confidence}% confiança
            </span>
          )}
        </div>

        {action.expectedImpact && (
          <p className="text-[10px] text-muted-foreground flex items-start gap-1">
            <TrendingUp className="h-3 w-3 mt-0.5 text-primary/60 flex-shrink-0" />
            <span className="italic">{action.expectedImpact}</span>
          </p>
        )}

        <div className="flex items-center gap-2 pt-1 opacity-0 group-hover:opacity-100 transition-opacity">
          <Button
            size="sm" variant="default" className="h-7 text-xs"
            onClick={handleCreate} disabled={createTask.isPending}
          >
            <Plus className="h-3 w-3 mr-1" /> Criar tarefa
          </Button>
          <Button size="sm" variant="ghost" className="h-7 text-xs" onClick={onDismiss}>
            Dispensar
          </Button>
        </div>
      </div>
    </div>
  );
}
