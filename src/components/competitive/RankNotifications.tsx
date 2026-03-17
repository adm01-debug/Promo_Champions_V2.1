import { FC } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Bell, AlertTriangle, TrendingDown, TrendingUp, CheckCheck } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { useRankNotifications } from '@/hooks/useRankNotifications';
import { formatDistanceToNow } from 'date-fns';
import { ptBR } from 'date-fns/locale';

interface RankNotificationsProps {
  salespersonId?: string;
  className?: string;
}

export const RankNotifications: FC<RankNotificationsProps> = ({ salespersonId, className }) => {
  const { notifications, unreadCount, isLoading, markAsRead, markAllRead } = useRankNotifications(salespersonId);

  if (isLoading) {
    return (
      <div className="space-y-2">
        {[1, 2].map(i => <div key={i} className="h-16 rounded-xl bg-muted/30 animate-pulse" />)}
      </div>
    );
  }

  return (
    <div className={cn('space-y-3', className)}>
      <Card className="border-none shadow-lg overflow-hidden">
        <CardHeader className="pb-2">
          <div className="flex items-center justify-between">
            <CardTitle className="text-base flex items-center gap-2">
              <div className="h-8 w-8 rounded-lg bg-gradient-to-br from-destructive to-orange-500 flex items-center justify-center">
                <Bell className="h-4 w-4 text-white" />
              </div>
              Alertas de Ultrapassagem
              {unreadCount > 0 && (
                <Badge className="bg-destructive text-destructive-foreground text-xs animate-pulse">
                  {unreadCount} novo{unreadCount > 1 ? 's' : ''}
                </Badge>
              )}
            </CardTitle>
            {unreadCount > 0 && (
              <Button
                variant="ghost"
                size="sm"
                className="text-xs h-7"
                onClick={() => markAllRead.mutate()}
                disabled={markAllRead.isPending}
              >
                <CheckCheck className="h-3 w-3 mr-1" />
                Marcar todas
              </Button>
            )}
          </div>
        </CardHeader>

        <CardContent className="space-y-2">
          {!notifications?.length ? (
            <div className="text-center py-6">
              <Bell className="h-8 w-8 mx-auto text-muted-foreground/30 mb-2" />
              <p className="text-sm text-muted-foreground">Nenhum alerta de ultrapassagem</p>
              <p className="text-xs text-muted-foreground mt-1">Você será notificado quando alguém passar sua posição no ranking</p>
            </div>
          ) : (
            <AnimatePresence>
              {notifications.map((notif, i) => {
                const wentDown = notif.new_rank > notif.old_rank;
                return (
                  <motion.div
                    key={notif.id}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: i * 0.05 }}
                    onClick={() => !notif.is_read && markAsRead.mutate(notif.id)}
                    className={cn(
                      'flex items-center gap-3 p-3 rounded-xl border cursor-pointer transition-all hover:bg-muted/30',
                      !notif.is_read && 'bg-destructive/5 border-destructive/20',
                      notif.is_read && 'border-border/20 opacity-60',
                    )}
                  >
                    <div className={cn(
                      'h-9 w-9 rounded-lg flex items-center justify-center shrink-0',
                      wentDown
                        ? 'bg-destructive/15 text-destructive'
                        : 'bg-emerald-500/15 text-emerald-500'
                    )}>
                      {wentDown ? <TrendingDown className="h-4 w-4" /> : <TrendingUp className="h-4 w-4" />}
                    </div>

                    <div className="flex-1 min-w-0">
                      <p className="text-sm text-foreground">
                        {wentDown ? (
                          <>
                            <AlertTriangle className="h-3 w-3 inline mr-1 text-destructive" />
                            <strong>{notif.overtaker_name}</strong> te ultrapassou!
                          </>
                        ) : (
                          <>
                            Você subiu para <strong>#{notif.new_rank}</strong>!
                          </>
                        )}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        Posição: #{notif.old_rank} → #{notif.new_rank} •{' '}
                        {formatDistanceToNow(new Date(notif.created_at), { addSuffix: true, locale: ptBR })}
                      </p>
                    </div>

                    {!notif.is_read && (
                      <div className="h-2 w-2 rounded-full bg-destructive shrink-0 animate-pulse" />
                    )}
                  </motion.div>
                );
              })}
            </AnimatePresence>
          )}
        </CardContent>
      </Card>
    </div>
  );
};
