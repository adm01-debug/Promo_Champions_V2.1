import { FC } from 'react';
import { motion } from 'framer-motion';
import { Clock } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { cn } from '@/lib/utils';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

const DAYS = ['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb'];
const HOURS = Array.from({ length: 12 }, (_, i) => i + 7); // 7h - 18h

export const ActivityHeatmap: FC = () => {
  const { data: heatmapData, isLoading } = useQuery({
    queryKey: ['activity-heatmap'],
    queryFn: async () => {
      // Get activities from last 90 days
      const since = new Date();
      since.setDate(since.getDate() - 90);
      
      const { data, error } = await supabase
        .from('activities')
        .select('created_at')
        .gte('created_at', since.toISOString());
      if (error) throw error;

      // Build heatmap grid [day][hour]
      const grid: number[][] = Array.from({ length: 7 }, () => Array(12).fill(0));
      
      (data || []).forEach(a => {
        const d = new Date(a.created_at);
        const day = d.getDay();
        const hour = d.getHours();
        if (hour >= 7 && hour <= 18) {
          grid[day][hour - 7]++;
        }
      });

      const maxVal = Math.max(...grid.flat(), 1);
      return { grid, maxVal, total: data?.length || 0 };
    },
    staleTime: 5 * 60 * 1000,
  });

  // Also get sales heatmap
  const { data: salesHeatmap } = useQuery({
    queryKey: ['sales-heatmap'],
    queryFn: async () => {
      const since = new Date();
      since.setDate(since.getDate() - 90);
      
      const { data, error } = await supabase
        .from('sales')
        .select('created_at')
        .eq('status', 'completed')
        .gte('created_at', since.toISOString());
      if (error) throw error;

      const grid: number[][] = Array.from({ length: 7 }, () => Array(12).fill(0));
      
      (data || []).forEach(s => {
        const d = new Date(s.created_at);
        const day = d.getDay();
        const hour = d.getHours();
        if (hour >= 7 && hour <= 18) {
          grid[day][hour - 7]++;
        }
      });

      const maxVal = Math.max(...grid.flat(), 1);
      return { grid, maxVal, total: data?.length || 0 };
    },
    staleTime: 5 * 60 * 1000,
  });

  if (isLoading) return <div className="h-64 rounded-xl bg-muted/30 animate-pulse" />;

  const getColor = (val: number, max: number) => {
    if (val === 0) return 'bg-muted/20';
    const intensity = val / max;
    if (intensity > 0.75) return 'bg-success';
    if (intensity > 0.5) return 'bg-success/80';
    if (intensity > 0.25) return 'bg-success/60';
    return 'bg-success/40';
  };

  const renderHeatmap = (data: { grid: number[][]; maxVal: number; total: number } | undefined, title: string, emoji: string) => (
    <Card className="border-none shadow-md">
      <CardHeader className="pb-2">
        <CardTitle className="text-sm flex items-center gap-2">
          {emoji} {title}
          <span className="text-xs text-muted-foreground font-normal ml-auto">{data?.total || 0} nos últimos 90 dias</span>
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="overflow-x-auto">
          <div className="min-w-[400px]">
            {/* Hour labels */}
            <div className="flex gap-1 mb-1 ml-10">
              {HOURS.map(h => (
                <div key={h} className="flex-1 text-[9px] text-muted-foreground text-center">{h}h</div>
              ))}
            </div>
            {/* Grid */}
            {DAYS.map((day, di) => (
              <div key={day} className="flex gap-1 mb-1 items-center">
                <span className="text-[10px] text-muted-foreground w-8 text-right mr-1">{day}</span>
                {HOURS.map((_, hi) => {
                  const val = data?.grid[di]?.[hi] || 0;
                  return (
                    <motion.div
                      key={hi}
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      transition={{ delay: (di * 12 + hi) * 0.005 }}
                      className={cn(
                        'flex-1 aspect-square rounded-sm transition-colors cursor-default',
                        getColor(val, data?.maxVal || 1)
                      )}
                      title={`${day} ${HOURS[hi]}h: ${val} atividades`}
                    />
                  );
                })}
              </div>
            ))}
            {/* Legend */}
            <div className="flex items-center gap-2 mt-3 justify-end">
              <span className="text-[9px] text-muted-foreground">Menos</span>
              {['bg-muted/20', 'bg-success/40', 'bg-success/60', 'bg-success/80', 'bg-success'].map(c => (
                <div key={c} className={cn('h-3 w-3 rounded-sm', c)} />
              ))}
              <span className="text-[9px] text-muted-foreground">Mais</span>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );

  return (
    <div className="space-y-4">
      <Card className="border-none shadow-lg overflow-hidden">
        <div className="bg-gradient-to-r from-emerald-500/10 to-teal-500/10">
          <CardHeader className="pb-2">
            <CardTitle className="text-base flex items-center gap-2">
              <div className="h-8 w-8 rounded-lg bg-gradient-to-br from-emerald-500 to-teal-600 flex items-center justify-center">
                <Clock className="h-4 w-4 text-primary-foreground" />
              </div>
              Mapa de Calor de Atividades
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-xs text-muted-foreground">Descubra os melhores horários para vender baseado nos últimos 90 dias</p>
          </CardContent>
        </div>
      </Card>

      {renderHeatmap(heatmapData, 'Atividades', '📞')}
      {renderHeatmap(salesHeatmap, 'Vendas Fechadas', '💰')}
    </div>
  );
};
