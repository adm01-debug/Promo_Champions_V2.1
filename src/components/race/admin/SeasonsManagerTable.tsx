import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Skeleton } from '@/components/ui/skeleton';
import { PlayCircle, Pause, Flag, Plus, Trash2, Trophy } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { StartSeasonDialog } from '../StartSeasonDialog';

interface Season {
  id: string;
  name: string;
  role_type: 'closer' | 'sdr';
  status: 'upcoming' | 'active' | 'finished';
  start_date: string;
  end_date: string;
  goal_amount: number;
  winner_id: string | null;
}

export function SeasonsManagerTable() {
  const qc = useQueryClient();
  const [openDialog, setOpenDialog] = useState(false);

  const { data = [], isLoading } = useQuery({
    queryKey: ['admin-race-seasons'],
    queryFn: async (): Promise<Season[]> => {
      const { data, error } = await supabase
        .from('race_seasons')
        .select('*')
        .order('start_date', { ascending: false });
      if (error) throw error;
      return (data ?? []) as Season[];
    },
  });

  useEffect(() => {
    const ch = supabase.channel('admin-seasons')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'race_seasons' }, () => {
        qc.invalidateQueries({ queryKey: ['admin-race-seasons'] });
      })
      .subscribe();
    return () => { supabase.removeChannel(ch); };
  }, [qc]);

  const updateStatus = async (id: string, status: Season['status']) => {
    const { error } = await supabase.from('race_seasons').update({ status }).eq('id', id);
    if (error) toast.error(error.message);
    else toast.success(`Status atualizado para ${status}`);
  };

  const finalize = async (id: string, name: string) => {
    if (!confirm(`Finalizar e premiar campeão da temporada "${name}"? Isso encerrará a corrida e disparará a cerimônia para todos.`)) return;
    const { data, error } = await supabase.rpc('finalize_race_season', { _season_id: id });
    if (error) { toast.error(error.message); return; }
    const winnerId = (data as { winner_id?: string } | null)?.winner_id;
    toast.success(winnerId ? '🏆 Campeão coroado! Cerimônia disparada.' : 'Temporada finalizada (sem vencedor).');
  };

  const remove = async (id: string) => {
    if (!confirm('Excluir esta temporada? Essa ação não pode ser desfeita.')) return;
    const { error } = await supabase.from('race_seasons').delete().eq('id', id);
    if (error) toast.error(error.message);
    else toast.success('Temporada excluída');
  };

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle className="flex items-center gap-2"><Flag className="w-5 h-5" /> Temporadas</CardTitle>
        <Button onClick={() => setOpenDialog(true)} size="sm">
          <Plus className="w-4 h-4 mr-1" /> Nova temporada
        </Button>
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <div className="space-y-2">
            {[1, 2, 3].map((i) => <Skeleton key={i} className="h-12" />)}
          </div>
        ) : data.length === 0 ? (
          <p className="text-sm text-muted-foreground py-8 text-center">Nenhuma temporada criada.</p>
        ) : (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Nome</TableHead>
                <TableHead>Papel</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Período</TableHead>
                <TableHead className="text-right">Meta</TableHead>
                <TableHead className="text-right">Ações</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {data.map((s) => (
                <TableRow key={s.id}>
                  <TableCell className="font-medium">{s.name}</TableCell>
                  <TableCell>
                    <Badge variant="outline">{s.role_type === 'closer' ? '🎯 Closer' : '📞 SDR'}</Badge>
                  </TableCell>
                  <TableCell>
                    <Badge variant={s.status === 'active' ? 'default' : s.status === 'finished' ? 'secondary' : 'outline'}>
                      {s.status}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-xs text-muted-foreground">
                    {format(new Date(s.start_date), 'dd/MM', { locale: ptBR })} → {format(new Date(s.end_date), 'dd/MM', { locale: ptBR })}
                  </TableCell>
                  <TableCell className="text-right tabular-nums">
                    {Number(s.goal_amount).toLocaleString('pt-BR')}
                  </TableCell>
                  <TableCell className="text-right space-x-1">
                    {s.status !== 'active' && (
                      <Button size="icon-sm" variant="ghost" onClick={() => updateStatus(s.id, 'active')} title="Ativar">
                        <PlayCircle className="w-4 h-4" />
                      </Button>
                    )}
                    {s.status === 'active' && (
                      <>
                        <Button size="icon-sm" variant="ghost" onClick={() => finalize(s.id, s.name)} title="Finalizar e premiar campeão" className="text-amber-600 hover:text-amber-700">
                          <Trophy className="w-4 h-4" />
                        </Button>
                        <Button size="icon-sm" variant="ghost" onClick={() => updateStatus(s.id, 'finished')} title="Encerrar sem premiação">
                          <Pause className="w-4 h-4" />
                        </Button>
                      </>
                    )}
                    <Button size="icon-sm" variant="ghost" onClick={() => remove(s.id)} title="Excluir" className="text-destructive">
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        )}
      </CardContent>
      <StartSeasonDialog open={openDialog} onOpenChange={setOpenDialog} />
    </Card>
  );
}
