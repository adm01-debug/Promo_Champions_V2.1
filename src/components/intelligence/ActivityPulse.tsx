import { motion } from 'framer-motion';
import { Bell, CheckCircle2, Info } from 'lucide-react';
import { useQuery } from '@tanstack/react-query';
import { formatDistanceToNow } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { supabase } from '@/integrations/supabase/client';
import { isWonSaleStatus } from '@/constants';
import { formatBRL } from '@/lib/money';

export const ActivityPulse = () => {
  const { data: events } = useQuery({
    queryKey: ['intelligence-activity-pulse'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('sales')
        .select('id, client_name, amount, status, created_at')
        .order('created_at', { ascending: false })
        .limit(4);
      if (error) throw error;
      return (data ?? []).map(s => ({
        id: s.id,
        type: isWonSaleStatus(s.status) ? 'success' : 'info',
        title: isWonSaleStatus(s.status) ? 'Venda Fechada' : 'Nova Oportunidade',
        desc: `${s.client_name ?? 'Cliente'} — ${formatBRL(Number(s.amount ?? 0))}`,
        time: formatDistanceToNow(new Date(s.created_at), {
          addSuffix: true,
          locale: ptBR,
        }),
      }));
    },
    staleTime: 60 * 1000,
  });

  const activities = events ?? [];

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground flex items-center gap-2">
          <Bell className="size-3" /> Real-time Activity Pulse
        </h3>
        <span className="size-2 rounded-full bg-emerald-500 animate-ping" />
      </div>

      {activities.length === 0 && (
        <p className="text-[11px] text-muted-foreground">
          Nenhuma atividade registrada ainda.
        </p>
      )}

      <div className="space-y-3 relative before:absolute before:left-[11px] before:top-2 before:bottom-2 before:w-[1px] before:bg-white/5">
        {activities.map((act, i) => (
          <motion.div
            key={act.id}
            initial={{ opacity: 0, x: -10 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: i * 0.1 }}
            className="relative pl-8 group cursor-pointer"
          >
            <div
              className={`absolute left-0 top-1 size-6 rounded-full border border-white/10 flex items-center justify-center bg-black transition-colors group-hover:border-primary/50`}
            >
              {act.type === 'success' ? (
                <CheckCircle2 className="size-3 text-emerald-500" />
              ) : (
                <Info className="size-3 text-blue-500" />
              )}
            </div>

            <div className="space-y-1">
              <div className="flex justify-between items-baseline">
                <p className="text-[10px] font-black uppercase tracking-widest text-foreground group-hover:text-primary transition-colors">
                  {act.title}
                </p>
                <span className="text-[9px] font-bold text-muted-foreground">
                  {act.time}
                </span>
              </div>
              <p className="text-[11px] text-muted-foreground leading-snug group-hover:text-foreground transition-colors">
                {act.desc}
              </p>
            </div>
          </motion.div>
        ))}
      </div>
    </div>
  );
};
