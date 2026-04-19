import { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import { Flag, Eye } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import { supabase } from '@/integrations/supabase/client';
import { fmtCompact } from '@/components/race/raceFormatters';

interface SpectatorRow {
  car_id: string;
  salesperson_id: string;
  salesperson_name: string;
  avatar_url: string | null;
  car_number: number;
  primary_color: string;
  total_sales: number;
  progress: number;
}

/** Modo Espectador público — sem dados sensíveis. Ideal para TVs do escritório. */
export default function RaceSpectator() {
  const { seasonId } = useParams<{ seasonId: string }>();
  const [rows, setRows] = useState<SpectatorRow[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!seasonId) return;
    let cancelled = false;
    async function load() {
      const { data } = await supabase
        .from('race_spectator_view')
        .select('car_id, salesperson_id, salesperson_name, avatar_url, car_number, primary_color, total_sales, progress')
        .eq('season_id', seasonId);
      if (cancelled) return;
      const sorted = (data ?? []).sort((a, b) => Number(b.progress) - Number(a.progress));
      setRows(sorted as SpectatorRow[]);
      setLoading(false);
    }
    load();
    const channel = supabase
      .channel(`spectator-${seasonId}`)
      .on('postgres_changes', { event: '*', schema: 'public', table: 'sales' }, load)
      .subscribe();
    const interval = window.setInterval(load, 30_000);
    return () => {
      cancelled = true;
      supabase.removeChannel(channel);
      window.clearInterval(interval);
    };
  }, [seasonId]);

  return (
    <div className="min-h-screen bg-background p-6">
      <Helmet>
        <title>Race Arena — Modo Espectador</title>
        <meta name="description" content="Acompanhe a corrida em tempo real no modo público (somente exibição)." />
        <meta name="robots" content="noindex" />
      </Helmet>

      <header className="flex items-center justify-between mb-6">
        <h1 className="text-3xl font-display font-black flex items-center gap-3">
          <Flag className="w-8 h-8 text-primary" /> Race Arena · Ao Vivo
        </h1>
        <Badge variant="default" className="animate-pulse">
          <Eye className="w-3 h-3 mr-1" /> ESPECTADOR
        </Badge>
      </header>

      {loading ? (
        <p className="text-muted-foreground text-center py-12">Carregando pista…</p>
      ) : rows.length === 0 ? (
        <p className="text-muted-foreground text-center py-12">Nenhum piloto na pista.</p>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {rows.map((r, i) => (
            <Card key={r.car_id} className="overflow-hidden">
              <CardContent className="p-4 flex items-center gap-3">
                <div
                  className="w-12 h-12 rounded-lg flex items-center justify-center font-display font-black text-lg shrink-0 shadow"
                  style={{ background: r.primary_color, color: '#fff' }}
                >
                  #{r.car_number}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-xs uppercase tracking-wide text-muted-foreground font-semibold">P{i + 1}</p>
                  <p className="text-sm font-bold truncate">{r.salesperson_name}</p>
                  <p className="text-xs text-muted-foreground tabular-nums">{fmtCompact(Number(r.total_sales))} pts</p>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
