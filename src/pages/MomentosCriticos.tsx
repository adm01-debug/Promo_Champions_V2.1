import { useMemo, useState } from 'react';
import { Helmet } from 'react-helmet-async';
import { Link } from 'react-router-dom';
import { formatDistanceToNow } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import {
  AlertTriangle,
  BellRing,
  CheckCheck,
  CheckCircle2,
  Clock,
  Lightbulb,
  ListChecks,
  Phone,
  RefreshCw,
  ShieldAlert,
  Volume2,
  XCircle,
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  MOMENT_STATUS_FILTERS,
  SEVERITY_FILTERS,
  formatMomentTimestamp,
  momentStatusLabel,
  momentTypeLabel,
  severityMeta,
  useCriticalMomentActions,
  useCriticalMoments,
  type MomentSeverity,
  type MomentStatus,
} from '@/hooks/useCriticalMoments';

const RECORDINGS_PATH = '/conversational-intelligence/gravacoes';

function Kpi({
  icon: Icon,
  label,
  value,
  tone,
}: {
  icon: typeof Clock;
  label: string;
  value: number;
  tone: string;
}) {
  return (
    <Card>
      <CardContent className="p-4 flex items-center gap-3">
        <div className={`p-2 rounded-lg ${tone}`}>
          <Icon className="h-5 w-5" />
        </div>
        <div>
          <p className="text-xs uppercase tracking-wide text-muted-foreground">{label}</p>
          <p className="text-xl font-semibold text-foreground">{value}</p>
        </div>
      </CardContent>
    </Card>
  );
}

export default function MomentosCriticos() {
  const [status, setStatus] = useState<MomentStatus | 'all'>('all');
  const [severity, setSeverity] = useState<MomentSeverity | 'all'>('all');
  const [onlyUnread, setOnlyUnread] = useState(false);

  const { data, isLoading, isError, error, refetch, isFetching } = useCriticalMoments({
    status,
    severity,
  });
  const { setStatus: updateStatus, markRead } = useCriticalMomentActions();

  const unreadCount = data?.unreadCount ?? 0;
  const moments = useMemo(() => {
    const rows = data?.moments ?? [];
    return onlyUnread ? rows.filter(moment => moment.isUnread) : rows;
  }, [data, onlyUnread]);
  const unreadIds = useMemo(
    () =>
      (data?.moments ?? []).filter(moment => moment.isUnread).map(moment => moment.id),
    [data]
  );

  const totals = useMemo(
    () => ({
      total: moments.length,
      novos: moments.filter(moment => moment.status === 'new').length,
      criticos: moments.filter(moment => moment.severity === 'critical').length,
    }),
    [moments]
  );

  return (
    <div className="container mx-auto max-w-6xl px-4 py-6 space-y-6">
      <Helmet>
        <title>Momentos Críticos | Inteligência de Chamadas</title>
        <meta
          name="description"
          content="Objeções, sinais de compra, menções de preço e riscos detectados nas gravações de chamada."
        />
      </Helmet>

      <header className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <h1 className="text-2xl font-display font-semibold text-foreground flex items-center gap-2">
            <ShieldAlert className="h-6 w-6 text-primary" />
            Momentos Críticos
          </h1>
          <p className="text-sm text-muted-foreground mt-1 max-w-2xl">
            Trechos de risco e de oportunidade detectados automaticamente nas gravações de
            chamada. Cada alerta aponta o instante do áudio, a fala registrada e a ação
            sugerida.
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          <Button
            variant="outline"
            onClick={() => markRead.mutate(unreadIds)}
            disabled={unreadCount === 0 || markRead.isPending}
          >
            <CheckCheck className="h-4 w-4 mr-2" />
            Marcar todos como lidos
          </Button>
          <Button variant="outline" onClick={() => refetch()} disabled={isFetching}>
            <RefreshCw className={`h-4 w-4 mr-2 ${isFetching ? 'animate-spin' : ''}`} />
            Atualizar
          </Button>
          <Button asChild>
            <Link to={RECORDINGS_PATH}>
              <Phone className="h-4 w-4 mr-2" />
              Gravações
            </Link>
          </Button>
        </div>
      </header>

      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        <Kpi
          icon={ListChecks}
          label="Momentos"
          value={totals.total}
          tone="bg-primary/10 text-primary"
        />
        <Kpi
          icon={AlertTriangle}
          label="Novos"
          value={totals.novos}
          tone="bg-amber-500/15 text-amber-600"
        />
        <Kpi
          icon={ShieldAlert}
          label="Críticos"
          value={totals.criticos}
          tone="bg-destructive/15 text-destructive"
        />
        <Kpi
          icon={BellRing}
          label="Não lidos"
          value={unreadCount}
          tone="bg-primary/10 text-primary"
        />
      </div>

      <div className="flex flex-wrap items-center gap-3">
        <Tabs
          value={status}
          onValueChange={value => setStatus(value as MomentStatus | 'all')}
        >
          <TabsList className="flex-wrap h-auto">
            {MOMENT_STATUS_FILTERS.map(filter => (
              <TabsTrigger key={filter.value} value={filter.value}>
                {filter.label}
              </TabsTrigger>
            ))}
          </TabsList>
        </Tabs>

        <Select
          value={severity}
          onValueChange={value => setSeverity(value as MomentSeverity | 'all')}
        >
          <SelectTrigger className="w-[200px]">
            <SelectValue placeholder="Severidade" />
          </SelectTrigger>
          <SelectContent>
            {SEVERITY_FILTERS.map(filter => (
              <SelectItem key={filter.value} value={filter.value}>
                {filter.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        <div className="flex items-center gap-2">
          <Switch id="only-unread" checked={onlyUnread} onCheckedChange={setOnlyUnread} />
          <Label htmlFor="only-unread" className="text-sm text-muted-foreground">
            Somente não lidos
          </Label>
        </div>
      </div>

      {isLoading && (
        <div className="space-y-3">
          {[0, 1, 2].map(index => (
            <Card key={index}>
              <CardContent className="p-5 space-y-3">
                <Skeleton className="h-5 w-1/3" />
                <Skeleton className="h-4 w-full" />
                <Skeleton className="h-4 w-2/3" />
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {!isLoading && isError && (
        <Card>
          <CardHeader>
            <CardTitle>Não foi possível carregar os momentos críticos</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <p className="text-sm text-muted-foreground">
              {error instanceof Error
                ? error.message
                : 'Erro inesperado ao consultar os alertas.'}
            </p>
            <Button onClick={() => refetch()}>Tentar novamente</Button>
          </CardContent>
        </Card>
      )}

      {!isLoading && !isError && moments.length === 0 && (
        <Card>
          <CardContent className="p-10 text-center space-y-3">
            <CheckCircle2 className="h-10 w-10 text-primary mx-auto" />
            <p className="font-medium text-foreground">
              Nenhum momento crítico neste filtro
            </p>
            <p className="text-sm text-muted-foreground max-w-md mx-auto">
              Os alertas aparecem aqui assim que a análise das gravações identificar
              objeções, sinais de compra ou riscos nas chamadas.
            </p>
            <Button variant="outline" asChild>
              <Link to={RECORDINGS_PATH}>Ver gravações analisadas</Link>
            </Button>
          </CardContent>
        </Card>
      )}

      {!isLoading && !isError && moments.length > 0 && (
        <div className="space-y-3">
          {moments.map(moment => {
            const severityInfo = severityMeta(moment.severity);
            return (
              <Card
                key={moment.id}
                className={moment.isUnread ? 'border-primary/40' : undefined}
              >
                <CardContent className="p-5 space-y-3">
                  <div className="flex flex-wrap items-center gap-2">
                    <Badge className={severityInfo.tone}>{severityInfo.label}</Badge>
                    <Badge variant="outline">{momentTypeLabel(moment.moment_type)}</Badge>
                    <Badge variant="secondary">{momentStatusLabel(moment.status)}</Badge>
                    {moment.isUnread && (
                      <span className="text-xs font-medium text-primary flex items-center gap-1">
                        <BellRing className="h-3.5 w-3.5" /> novo alerta
                      </span>
                    )}
                    <span className="ml-auto text-xs text-muted-foreground flex items-center gap-1">
                      <Clock className="h-3.5 w-3.5" />
                      {formatMomentTimestamp(moment.timestamp_sec)} no áudio
                    </span>
                  </div>

                  {moment.quote && (
                    <blockquote className="border-l-2 border-primary/40 pl-3 text-sm text-foreground italic flex gap-2">
                      <Volume2 className="h-4 w-4 text-muted-foreground shrink-0 mt-0.5" />
                      <span>{moment.quote}</span>
                    </blockquote>
                  )}

                  {moment.context && (
                    <p className="text-sm text-muted-foreground">{moment.context}</p>
                  )}

                  {moment.suggested_action && (
                    <p className="text-sm text-foreground flex items-start gap-2 rounded-lg bg-muted/40 p-3">
                      <Lightbulb className="h-4 w-4 text-primary shrink-0 mt-0.5" />
                      <span>{moment.suggested_action}</span>
                    </p>
                  )}

                  <div className="flex flex-wrap items-center justify-between gap-3 pt-1">
                    <div className="text-xs text-muted-foreground">
                      {moment.recordingTitle ?? 'Gravação sem título'}
                      {moment.salespersonName && ` · ${moment.salespersonName}`}
                      {moment.recordedAt &&
                        ` · ${formatDistanceToNow(new Date(moment.recordedAt), {
                          addSuffix: true,
                          locale: ptBR,
                        })}`}
                    </div>
                    <div className="flex flex-wrap gap-2">
                      {moment.isUnread && (
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => markRead.mutate([moment.id])}
                          disabled={markRead.isPending}
                        >
                          <CheckCheck className="h-4 w-4 mr-1.5" /> Marcar lido
                        </Button>
                      )}
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() =>
                          updateStatus.mutate({ id: moment.id, status: 'acknowledged' })
                        }
                        disabled={
                          updateStatus.isPending || moment.status === 'acknowledged'
                        }
                      >
                        Reconhecer
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() =>
                          updateStatus.mutate({ id: moment.id, status: 'actioned' })
                        }
                        disabled={updateStatus.isPending || moment.status === 'actioned'}
                      >
                        <CheckCircle2 className="h-4 w-4 mr-1.5" /> Tratado
                      </Button>
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() =>
                          updateStatus.mutate({ id: moment.id, status: 'dismissed' })
                        }
                        disabled={updateStatus.isPending || moment.status === 'dismissed'}
                      >
                        <XCircle className="h-4 w-4 mr-1.5" /> Dispensar
                      </Button>
                      <Button size="sm" variant="ghost" asChild>
                        <Link to={RECORDINGS_PATH}>
                          <Phone className="h-4 w-4 mr-1.5" /> Abrir gravação
                        </Link>
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
}
