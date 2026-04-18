import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { Sliders, Target } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useQuery } from '@tanstack/react-query';
import { ScoringRulesEditor } from './ScoringRulesEditor';
import { useRaceScoringRules, useUpsertScoringRule, METRIC_LABELS } from '@/hooks/race/useRaceScoringRules';
import { toast } from 'sonner';

interface Season { id: string; name: string; role_type: 'closer' | 'sdr'; status: string }

function SeasonRulesRow({ season }: { season: Season }) {
  const { data: rules = [] } = useRaceScoringRules(season.id);
  const upsert = useUpsertScoringRule();
  const [open, setOpen] = useState(false);

  return (
    <div className="flex items-center justify-between py-3 border-b last:border-0">
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2 flex-wrap">
          <span className="font-semibold truncate">{season.name}</span>
          <Badge variant="outline" className="text-xs">{season.role_type === 'closer' ? '🎯' : '📞'} {season.role_type}</Badge>
          <Badge variant={season.status === 'active' ? 'default' : 'secondary'} className="text-xs">{season.status}</Badge>
        </div>
        <div className="text-xs text-muted-foreground mt-1 flex flex-wrap gap-1">
          {rules.length === 0 ? (
            <span>Sem regras configuradas</span>
          ) : rules.map((r) => (
            <span key={r.metric_code} title={`peso ${r.weight} · ${r.points_per_unit} pts/un`}>
              {METRIC_LABELS[r.metric_code]?.icon} {METRIC_LABELS[r.metric_code]?.label} ({r.weight}×)
            </span>
          ))}
        </div>
      </div>
      <Button size="sm" variant="outline" onClick={() => setOpen(true)}>
        <Sliders className="w-3.5 h-3.5 mr-1.5" /> Editar
      </Button>
      <ScoringRulesEditor
        open={open}
        onOpenChange={setOpen}
        roleType={season.role_type}
        initialRules={rules}
        onConfirm={async (newRules) => {
          try {
            await Promise.all(newRules.map((r) => upsert.mutateAsync({
              season_id: season.id,
              metric_code: r.metric_code,
              weight: r.weight,
              points_per_unit: r.points_per_unit,
              label: r.label,
            })));
            toast.success('Regras atualizadas! Leaderboard será recalculado.');
          } catch (e) {
            toast.error(`Erro: ${e instanceof Error ? e.message : 'desconhecido'}`);
          }
        }}
      />
    </div>
  );
}

export function SeasonRulesPanel() {
  const { data = [], isLoading } = useQuery({
    queryKey: ['admin-race-seasons-for-rules'],
    queryFn: async (): Promise<Season[]> => {
      const { data, error } = await supabase
        .from('race_seasons')
        .select('id,name,role_type,status')
        .order('start_date', { ascending: false });
      if (error) throw error;
      return (data ?? []) as Season[];
    },
  });

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2"><Target className="w-5 h-5" /> Regras de pontuação por temporada</CardTitle>
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <div className="space-y-2">{[1, 2].map((i) => <Skeleton key={i} className="h-14" />)}</div>
        ) : data.length === 0 ? (
          <p className="text-sm text-muted-foreground py-6 text-center">Crie uma temporada para configurar regras.</p>
        ) : (
          <div>{data.map((s) => <SeasonRulesRow key={s.id} season={s} />)}</div>
        )}
      </CardContent>
    </Card>
  );
}
