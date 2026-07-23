import { memo, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { AlertOctagon, AlertTriangle, Clock, Phone, MessageCircle, ListPlus, Mail, TrendingDown, Users, Info } from 'lucide-react';
import { formatDistanceToNow, parseISO } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { cn } from '@/lib/utils';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { useClientsNeedingContact, type ContactUrgency } from '@/hooks/useClientsNeedingContact';

interface Props {
  salespersonId?: string;
}

const urgencyStyles: Record<ContactUrgency, { color: string; bg: string; border: string; label: string; icon: typeof AlertOctagon }> = {
  critical: { color: 'text-destructive', bg: 'bg-destructive/10', border: 'border-destructive/40', label: 'Crítico', icon: AlertOctagon },
  high: { color: 'text-warning', bg: 'bg-warning/10', border: 'border-warning/40', label: 'Alto', icon: AlertTriangle },
  medium: { color: 'text-primary', bg: 'bg-primary/10', border: 'border-primary/30', label: 'Médio', icon: Clock },
  low: { color: 'text-muted-foreground', bg: 'bg-muted/40', border: 'border-border', label: 'Baixo', icon: Info },
};

const filters: { key: 'all' | ContactUrgency; label: string }[] = [
  { key: 'all', label: 'Todos' },
  { key: 'critical', label: 'Críticos' },
  { key: 'high', label: 'Altos' },
  { key: 'medium', label: 'Médios' },
];

const sanitizePhone = (raw: string) => raw.replace(/\D/g, '');

export const ClientContactAlertsWidget = memo(function ClientContactAlertsWidget({ salespersonId }: Props) {
  const { data, isLoading } = useClientsNeedingContact({ salespersonId, limit: 15 });
  const [filter, setFilter] = useState<'all' | ContactUrgency>('all');

  const alerts = useMemo(() => {
    if (!data) return [];
    if (filter === 'all') return data;
    return data.filter((a) => a.urgency === filter);
  }, [data, filter]);

  const summary = useMemo(() => {
    const base = { critical: 0, high: 0, medium: 0, low: 0, total: data?.length ?? 0 };
    (data ?? []).forEach((a) => (base[a.urgency] += 1));
    return base;
  }, [data]);

  return (
    <motion.section
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.35 }}
      className="glass rounded-xl p-5 sm:p-6 border border-border/40"
      aria-label="Clientes que precisam de contato"
    >
      <header className="flex flex-wrap items-start justify-between gap-3 mb-4">
        <div className="flex items-start gap-3">
          <div className="p-2 rounded-lg bg-primary/10">
            <Users className="h-5 w-5 text-primary" />
          </div>
          <div>
            <h3 className="text-section-title flex items-center gap-2">
              Clientes para contatar hoje
              {summary.total > 0 && (
                <Badge variant="destructive" className="text-[10px]">{summary.total}</Badge>
              )}
            </h3>
            <p className="text-xs text-muted-foreground mt-0.5">
              Ordenados por risco de churn e dias sem comprar
            </p>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-3 text-xs">
          {summary.critical > 0 && (
            <span className="inline-flex items-center gap-1 text-destructive font-medium">
              <AlertOctagon className="h-3.5 w-3.5" /> {summary.critical} críticos
            </span>
          )}
          {summary.high > 0 && (
            <span className="inline-flex items-center gap-1 text-warning font-medium">
              <AlertTriangle className="h-3.5 w-3.5" /> {summary.high} altos
            </span>
          )}
          {summary.medium > 0 && (
            <span className="inline-flex items-center gap-1 text-primary font-medium">
              <Clock className="h-3.5 w-3.5" /> {summary.medium} médios
            </span>
          )}
        </div>
      </header>

      <div className="flex flex-wrap gap-1.5 mb-4" role="tablist" aria-label="Filtrar por urgência">
        {filters.map((f) => (
          <button
            key={f.key}
            role="tab"
            aria-selected={filter === f.key}
            onClick={() => setFilter(f.key)}
            className={cn(
              'px-3 py-1 rounded-full text-xs font-medium transition-colors border',
              filter === f.key
                ? 'bg-primary text-primary-foreground border-primary'
                : 'bg-background/60 text-muted-foreground border-border hover:bg-muted'
            )}
          >
            {f.label}
          </button>
        ))}
      </div>

      {isLoading ? (
        <div className="space-y-2">
          {Array.from({ length: 3 }).map((_, i) => (
            <div key={i} className="h-20 rounded-lg bg-muted/40 animate-pulse" />
          ))}
        </div>
      ) : alerts.length === 0 ? (
        <div className="text-center py-10 text-sm text-muted-foreground">
          <TrendingDown className="h-8 w-8 mx-auto mb-2 opacity-40" />
          <p className="font-medium">Sua carteira está em dia</p>
          <p className="text-xs">Nenhum cliente precisa de contato imediato.</p>
        </div>
      ) : (
        <ul className="space-y-2.5 max-h-[520px] overflow-y-auto pr-1">
          {alerts.map((alert) => {
            const style = urgencyStyles[alert.urgency];
            const Icon = style.icon;
            const phoneDigits = alert.phone ? sanitizePhone(alert.phone) : '';
            return (
              <motion.li
                key={`${alert.clientId ?? alert.clientName}-${alert.lastPurchaseDate}`}
                initial={{ opacity: 0, x: -6 }}
                animate={{ opacity: 1, x: 0 }}
                className={cn('rounded-lg border p-3 sm:p-4', style.border, style.bg)}
              >
                <div className="flex flex-wrap items-start justify-between gap-3">
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <Icon className={cn('h-4 w-4 shrink-0', style.color)} />
                      <p className="font-semibold truncate">{alert.clientName}</p>
                      <Badge variant="outline" className={cn('text-[10px] shrink-0', style.color)}>
                        {style.label}
                      </Badge>
                    </div>
                    <div className="flex flex-wrap gap-x-3 gap-y-1 text-xs text-muted-foreground">
                      <span className="inline-flex items-center gap-1">
                        <Clock className="h-3 w-3" />
                        {alert.daysSinceLastPurchase}d sem comprar
                        <span className="text-[10px] opacity-70">
                          ({formatDistanceToNow(parseISO(alert.lastPurchaseDate), { addSuffix: true, locale: ptBR })})
                        </span>
                      </span>
                      {alert.averageIntervalDays > 0 && (
                        <span>Média: {alert.averageIntervalDays}d</span>
                      )}
                      <span>{alert.purchaseCount}x compras</span>
                      <span className="font-medium text-foreground">
                        R$ {alert.totalRevenue.toLocaleString('pt-BR', { maximumFractionDigits: 0 })}
                      </span>
                      {alert.churnRisk > 0 && (
                        <span className={cn('font-medium', style.color)}>
                          Risco {alert.churnRisk}%
                        </span>
                      )}
                    </div>
                    {alert.reasons.length > 0 && (
                      <p className="text-[11px] text-muted-foreground mt-1.5 italic">
                        {alert.reasons.join(' • ')}
                      </p>
                    )}
                  </div>

                  <div className="flex items-center gap-1.5 shrink-0">
                    {phoneDigits && (
                      <>
                        <Button
                          asChild
                          size="icon"
                          variant="outline"
                          className="h-8 w-8"
                          title="Ligar"
                        >
                          <a href={`tel:${phoneDigits}`} aria-label={`Ligar para ${alert.clientName}`}>
                            <Phone className="h-3.5 w-3.5" />
                          </a>
                        </Button>
                        <Button
                          asChild
                          size="icon"
                          variant="outline"
                          className="h-8 w-8"
                          title="WhatsApp"
                        >
                          <a
                            href={`https://wa.me/${phoneDigits}?text=${encodeURIComponent(`Olá ${alert.clientName}, tudo bem? Faz um tempo que não conversamos.`)}`}
                            target="_blank"
                            rel="noreferrer"
                            aria-label={`WhatsApp para ${alert.clientName}`}
                          >
                            <MessageCircle className="h-3.5 w-3.5" />
                          </a>
                        </Button>
                      </>
                    )}
                    {alert.email && (
                      <Button
                        asChild
                        size="icon"
                        variant="outline"
                        className="h-8 w-8"
                        title="Email"
                      >
                        <a href={`mailto:${alert.email}`} aria-label={`Email para ${alert.clientName}`}>
                          <Mail className="h-3.5 w-3.5" />
                        </a>
                      </Button>
                    )}
                    <Button
                      asChild
                      size="icon"
                      variant="outline"
                      className="h-8 w-8"
                      title="Criar tarefa"
                    >
                      <Link
                        to={`/tarefas?client=${encodeURIComponent(alert.clientName)}`}
                        aria-label={`Criar tarefa para ${alert.clientName}`}
                      >
                        <ListPlus className="h-3.5 w-3.5" />
                      </Link>
                    </Button>
                  </div>
                </div>
              </motion.li>
            );
          })}
        </ul>
      )}
    </motion.section>
  );
});
