import React from 'react';
import { Helmet } from 'react-helmet-async';
import { PageTransition, itemVariants } from '@/components/transitions/PageTransition';
import { motion } from 'framer-motion';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { cn } from '@/lib/utils';
import { useInactiveDeals, INACTIVITY_RULES } from '@/hooks/useInactiveDeals';
import { useSendNotification } from '@/hooks/useNotifications';
import {
  AlertTriangle,
  Clock,
  Loader2,
  RefreshCw,
  Send,
  Timer,
  TrendingDown,
} from 'lucide-react';
import { toast } from 'sonner';
import { formatDistanceToNow } from 'date-fns';
import { ptBR } from 'date-fns/locale';

const severityConfig = {
  mild: {
    label: 'Atenção',
    color: 'bg-status-warning/15 text-status-warning border-status-warning/30',
    icon: Clock,
  },
  moderate: {
    label: 'Moderado',
    color: 'bg-accent/15 text-accent border-accent/30',
    icon: Timer,
  },
  critical: {
    label: 'Crítico',
    color: 'bg-destructive/15 text-destructive border-destructive/30',
    icon: AlertTriangle,
  },
};

const notificationPriority = {
  mild: 'low',
  moderate: 'medium',
  critical: 'high',
} as const;

type InactiveDealItem = ReturnType<typeof useInactiveDeals>['inactiveDeals'][number];

const InactivityTriggers = () => {
  const { inactiveDeals, isLoading, isError, refetch } = useInactiveDeals();
  const sendNotification = useSendNotification();
  const notifyingId = sendNotification.isPending
    ? (sendNotification.variables?.metadata?.sale_id as string | undefined)
    : undefined;

  // Notificação real (RPC send_notification) para o vendedor dono do deal.
  // Erros já viram toast no onError do useSendNotification.
  const handleNotify = (deal: InactiveDealItem) => {
    if (!deal.salespersonUserId) return;
    sendNotification.mutate(
      {
        user_id: deal.salespersonUserId,
        type: 'inactivity_alert',
        category: 'sales',
        priority: notificationPriority[deal.severity],
        title: `Deal parado há ${deal.daysInactive} dias`,
        message: `"${deal.clientName}" (${deal.stage}) está sem atividade há ${deal.daysInactive} dias. Retome o contato.`,
        action_url: '/pipeline',
        action_label: 'Abrir pipeline',
        metadata: {
          sale_id: deal.id,
          stage: deal.stage,
          severity: deal.severity,
          days_inactive: deal.daysInactive,
        },
      },
      {
        onSuccess: () => {
          toast.success(
            `${deal.salespersonName ?? 'Vendedor'} notificado sobre "${deal.clientName}"`
          );
        },
      }
    );
  };

  const grouped = React.useMemo(() => {
    if (!inactiveDeals?.length)
      return {
        critical: [] as typeof inactiveDeals,
        moderate: [] as typeof inactiveDeals,
        mild: [] as typeof inactiveDeals,
      };
    return {
      critical: inactiveDeals.filter(d => d.severity === 'critical'),
      moderate: inactiveDeals.filter(d => d.severity === 'moderate'),
      mild: inactiveDeals.filter(d => d.severity === 'mild'),
    };
  }, [inactiveDeals]);

  const total = inactiveDeals?.length || 0;

  return (
    <>
      <Helmet>
        <title>Gatilhos de Inatividade | Promo Champions</title>
        <meta
          name="description"
          content="Detecte e gerencie deals inativos com alertas automáticos."
        />
      </Helmet>
      <PageTransition>
        <div className="container max-w-5xl mx-auto p-4 md:p-6 lg:p-8 space-y-6">
          <motion.div
            variants={itemVariants}
            className="flex flex-col md:flex-row md:items-center md:justify-between gap-4"
          >
            <div>
              <h1 className="text-page-title font-display">⏰ Gatilhos de Inatividade</h1>
              <p className="text-sm text-muted-foreground mt-1">
                Deals sem atividade detectados automaticamente • {total} alerta
                {total !== 1 ? 's' : ''}
              </p>
            </div>
            <div className="flex gap-2">
              {Object.entries(grouped).map(([key, deals]) => (
                <Badge
                  key={key}
                  variant="outline"
                  className={cn(
                    'text-xs gap-1',
                    severityConfig[key as keyof typeof severityConfig].color
                  )}
                >
                  {React.createElement(
                    severityConfig[key as keyof typeof severityConfig].icon,
                    { className: 'h-3 w-3' }
                  )}
                  {deals.length}{' '}
                  {severityConfig[key as keyof typeof severityConfig].label}
                </Badge>
              ))}
            </div>
          </motion.div>

          {/* Rules Reference */}
          <motion.div variants={itemVariants}>
            <Card className="glass border-border/40 p-4">
              <div className="flex items-center gap-2 mb-3">
                <Timer className="h-4 w-4 text-primary" />
                <span className="text-xs font-semibold">Regras de SLA por Estágio</span>
              </div>
              <div className="flex flex-wrap gap-2">
                {INACTIVITY_RULES.map(rule => (
                  <Badge key={rule.stage} variant="outline" className="text-[10px] gap-1">
                    {rule.label}: {rule.mildDays}/{rule.moderateDays}/{rule.criticalDays}d
                  </Badge>
                ))}
              </div>
            </Card>
          </motion.div>

          {isLoading ? (
            <div className="space-y-3">
              {Array.from({ length: 5 }).map((_, i) => (
                <Skeleton key={i} className="h-20 rounded-xl" />
              ))}
            </div>
          ) : isError ? (
            <motion.div variants={itemVariants}>
              <Card className="p-8 text-center glass border-border/40">
                <AlertTriangle className="h-12 w-12 text-destructive mx-auto mb-3" />
                <p className="font-display font-bold text-lg">
                  Não foi possível carregar os deals
                </p>
                <p className="text-sm text-muted-foreground mt-1">
                  Verifique sua conexão e tente novamente.
                </p>
                <Button
                  variant="outline"
                  size="sm"
                  className="mt-4 gap-2"
                  onClick={refetch}
                >
                  <RefreshCw className="h-3.5 w-3.5" />
                  Tentar novamente
                </Button>
              </Card>
            </motion.div>
          ) : total === 0 ? (
            <motion.div variants={itemVariants}>
              <Card className="p-8 text-center glass border-border/40">
                <TrendingDown className="h-12 w-12 text-status-success mx-auto mb-3" />
                <p className="font-display font-bold text-lg">Tudo em dia! 🎉</p>
                <p className="text-sm text-muted-foreground mt-1">
                  Nenhum deal inativo detectado.
                </p>
              </Card>
            </motion.div>
          ) : (
            <>
              {(['critical', 'moderate', 'mild'] as const).map(severity => {
                const deals = grouped[severity];
                if (!deals.length) return null;
                const cfg = severityConfig[severity];
                return (
                  <motion.div
                    key={severity}
                    variants={itemVariants}
                    className="space-y-2"
                  >
                    <h3 className="text-sm font-semibold flex items-center gap-2">
                      {React.createElement(cfg.icon, { className: 'h-4 w-4' })}
                      {cfg.label} ({deals.length})
                    </h3>
                    {deals.map(deal => (
                      <Card
                        key={deal.id}
                        className={cn(
                          'p-4 glass border-border/40 hover-lift-sm transition-all',
                          severity === 'critical' && 'border-destructive/20'
                        )}
                      >
                        <div className="flex items-center gap-4">
                          <div
                            className={cn(
                              'p-2.5 rounded-xl shrink-0',
                              cfg.color.split(' ')[0]
                            )}
                          >
                            {React.createElement(cfg.icon, {
                              className: cn('h-4 w-4', cfg.color.split(' ')[1]),
                            })}
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="font-medium text-sm truncate">
                              {deal.clientName}
                            </p>
                            <div className="flex items-center gap-2 mt-0.5">
                              <Badge variant="outline" className="text-[10px]">
                                {deal.stage}
                              </Badge>
                              <span className="text-[10px] text-muted-foreground">
                                Inativo há{' '}
                                {formatDistanceToNow(new Date(deal.lastActivityDate), {
                                  locale: ptBR,
                                })}
                              </span>
                            </div>
                          </div>
                          <div className="text-right shrink-0">
                            <p
                              className={cn(
                                'font-display font-bold text-sm',
                                severity === 'critical'
                                  ? 'text-destructive'
                                  : 'text-foreground'
                              )}
                            >
                              {deal.daysInactive}d / {deal.criticalDays}d
                            </p>
                          </div>
                          <div className="flex gap-1 shrink-0">
                            <Button
                              variant="ghost"
                              size="icon"
                              className="h-8 w-8 hover:text-primary"
                              title={
                                deal.salespersonUserId
                                  ? `Notificar ${deal.salespersonName ?? 'vendedor'}`
                                  : 'Deal sem vendedor com acesso ao sistema'
                              }
                              onClick={() => handleNotify(deal)}
                              disabled={
                                !deal.salespersonUserId || notifyingId === deal.id
                              }
                              aria-label="Notificar vendedor"
                            >
                              {notifyingId === deal.id ? (
                                <Loader2 className="h-3.5 w-3.5 animate-spin" />
                              ) : (
                                <Send className="h-3.5 w-3.5" />
                              )}
                            </Button>
                          </div>
                        </div>
                      </Card>
                    ))}
                  </motion.div>
                );
              })}
            </>
          )}
        </div>
      </PageTransition>
    </>
  );
};

export default InactivityTriggers;
