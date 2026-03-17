import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { motion, AnimatePresence } from 'framer-motion';
import { Trophy, Swords, Crown, Shield, Plus, Users, ChevronRight, Medal, Zap } from 'lucide-react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';

export function TournamentBrackets() {
  const queryClient = useQueryClient();
  const [showCreate, setShowCreate] = useState(false);
  const [newTournament, setNewTournament] = useState({ name: '', metric_type: 'revenue', round_duration_days: 7, starts_at: '' });

  const { data: currentSp } = useQuery({
    queryKey: ['tournament-current-sp'],
    queryFn: async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return null;
      const { data } = await supabase.from('salespeople').select('id, name').eq('auth_user_id', user.id).maybeSingle();
      return data;
    },
    staleTime: 5 * 60 * 1000,
  });

  const { data: tournaments = [] } = useQuery({
    queryKey: ['tournaments'],
    queryFn: async () => {
      const { data } = await supabase
        .from('tournaments')
        .select('*, tournament_participants(*, salespeople:salesperson_id(id, name)), tournament_matches(*)')
        .order('created_at', { ascending: false });
      return data || [];
    },
  });

  const { data: salespeople = [] } = useQuery({
    queryKey: ['tournament-salespeople'],
    queryFn: async () => {
      const { data } = await supabase.from('salespeople').select('id, name').eq('is_active', true);
      return data || [];
    },
    staleTime: 5 * 60 * 1000,
  });

  const createTournament = useMutation({
    mutationFn: async () => {
      const totalRounds = Math.ceil(Math.log2(salespeople.length));
      const { data: tournament, error } = await supabase.from('tournaments').insert({
        name: newTournament.name,
        metric_type: newTournament.metric_type,
        round_duration_days: newTournament.round_duration_days,
        total_rounds: totalRounds,
        starts_at: new Date(newTournament.starts_at).toISOString(),
        created_by: currentSp?.id,
        status: 'upcoming',
      }).select().single();
      if (error) throw error;

      // Add all active salespeople as participants with random seeds
      const shuffled = [...salespeople].sort(() => Math.random() - 0.5);
      const participants = shuffled.map((sp, i) => ({
        tournament_id: tournament.id,
        salesperson_id: sp.id,
        seed: i + 1,
      }));
      const { error: pErr } = await supabase.from('tournament_participants').insert(participants);
      if (pErr) throw pErr;

      // Generate round 1 matches
      const matches = [];
      for (let i = 0; i < shuffled.length; i += 2) {
        matches.push({
          tournament_id: tournament.id,
          round_number: 1,
          match_order: Math.floor(i / 2),
          player1_id: shuffled[i].id,
          player2_id: i + 1 < shuffled.length ? shuffled[i + 1].id : null,
          status: i + 1 < shuffled.length ? 'pending' : 'completed',
          winner_id: i + 1 >= shuffled.length ? shuffled[i].id : null,
        });
      }
      const { error: mErr } = await supabase.from('tournament_matches').insert(matches);
      if (mErr) throw mErr;
    },
    onSuccess: () => {
      toast.success('Torneio criado com sucesso!');
      setShowCreate(false);
      queryClient.invalidateQueries({ queryKey: ['tournaments'] });
    },
    onError: () => toast.error('Erro ao criar torneio'),
  });

  const startTournament = useMutation({
    mutationFn: async (tournamentId: string) => {
      await supabase.from('tournaments').update({ status: 'active', current_round: 1 }).eq('id', tournamentId);
      await supabase.from('tournament_matches').update({ status: 'active', started_at: new Date().toISOString() }).eq('tournament_id', tournamentId).eq('round_number', 1);
    },
    onSuccess: () => {
      toast.success('Torneio iniciado!');
      queryClient.invalidateQueries({ queryKey: ['tournaments'] });
    },
  });

  const statusConfig: Record<string, { label: string; color: string }> = {
    upcoming: { label: 'Em Breve', color: 'bg-muted text-muted-foreground' },
    active: { label: 'Ativo', color: 'bg-primary/20 text-primary' },
    completed: { label: 'Finalizado', color: 'bg-green-500/20 text-green-500' },
  };

  const metricLabels: Record<string, string> = {
    revenue: 'Receita', deals: 'Deals', activities: 'Atividades', conversion: 'Conversão',
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-display font-bold flex items-center gap-2">
            <Trophy className="h-5 w-5 text-amber-500" /> Torneios Eliminatórios
          </h2>
          <p className="text-sm text-muted-foreground">Brackets de eliminação com rounds semanais</p>
        </div>
        <Dialog open={showCreate} onOpenChange={setShowCreate}>
          <DialogTrigger asChild>
            <Button size="sm"><Plus className="h-4 w-4 mr-1" /> Novo Torneio</Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader><DialogTitle>Criar Torneio</DialogTitle></DialogHeader>
            <div className="space-y-4">
              <div>
                <Label>Nome</Label>
                <Input value={newTournament.name} onChange={e => setNewTournament(p => ({ ...p, name: e.target.value }))} placeholder="Copa de Vendas Q1" />
              </div>
              <div>
                <Label>Métrica</Label>
                <Select value={newTournament.metric_type} onValueChange={v => setNewTournament(p => ({ ...p, metric_type: v }))}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="revenue">Receita</SelectItem>
                    <SelectItem value="deals">Deals Fechados</SelectItem>
                    <SelectItem value="activities">Atividades</SelectItem>
                    <SelectItem value="conversion">Taxa de Conversão</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label>Duração por Round (dias)</Label>
                <Input type="number" value={newTournament.round_duration_days} onChange={e => setNewTournament(p => ({ ...p, round_duration_days: parseInt(e.target.value) || 7 }))} />
              </div>
              <div>
                <Label>Início</Label>
                <Input type="date" value={newTournament.starts_at} onChange={e => setNewTournament(p => ({ ...p, starts_at: e.target.value }))} />
              </div>
              <Button className="w-full" onClick={() => createTournament.mutate()} disabled={!newTournament.name || !newTournament.starts_at || createTournament.isPending}>
                <Trophy className="h-4 w-4 mr-2" /> Criar Torneio ({salespeople.length} participantes)
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {tournaments.length === 0 ? (
        <Card>
          <CardContent className="p-12 text-center">
            <Swords className="h-12 w-12 mx-auto mb-4 text-muted-foreground/50" />
            <h3 className="font-semibold text-lg">Nenhum torneio ainda</h3>
            <p className="text-sm text-muted-foreground">Crie o primeiro torneio eliminatório para o time!</p>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-4">
          {tournaments.map((t: any) => {
            const status = statusConfig[t.status] || statusConfig.upcoming;
            const matches = t.tournament_matches || [];
            const rounds = Math.max(...matches.map((m: any) => m.round_number), 0);

            return (
              <motion.div key={t.id} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>
                <Card className="overflow-hidden">
                  <CardHeader className="pb-3">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className="h-10 w-10 rounded-lg bg-primary/10 flex items-center justify-center">
                          <Trophy className="h-5 w-5 text-primary" />
                        </div>
                        <div>
                          <CardTitle className="text-base">{t.name}</CardTitle>
                          <div className="flex items-center gap-2 mt-1">
                            <Badge variant="outline" className={status.color}>{status.label}</Badge>
                            <span className="text-xs text-muted-foreground">{metricLabels[t.metric_type]}</span>
                            <span className="text-xs text-muted-foreground">·</span>
                            <span className="text-xs text-muted-foreground">{t.tournament_participants?.length || 0} participantes</span>
                          </div>
                        </div>
                      </div>
                      {t.status === 'upcoming' && (
                        <Button size="sm" onClick={() => startTournament.mutate(t.id)}>
                          <Zap className="h-4 w-4 mr-1" /> Iniciar
                        </Button>
                      )}
                    </div>
                  </CardHeader>
                  <CardContent>
                    {/* Bracket visualization */}
                    <div className="overflow-x-auto">
                      <div className="flex gap-8 min-w-max pb-2">
                        {Array.from({ length: t.total_rounds }, (_, r) => {
                          const roundMatches = matches.filter((m: any) => m.round_number === r + 1).sort((a: any, b: any) => a.match_order - b.match_order);
                          const roundLabels = ['Quartas', 'Semi', 'Final', 'Grande Final'];
                          const label = r + 1 === t.total_rounds ? 'Final' : r + 1 === t.total_rounds - 1 ? 'Semi' : `Round ${r + 1}`;

                          return (
                            <div key={r} className="flex flex-col gap-4">
                              <div className="text-xs font-semibold text-muted-foreground uppercase tracking-wider text-center">{label}</div>
                              {roundMatches.length > 0 ? roundMatches.map((match: any) => {
                                const p1Name = t.tournament_participants?.find((p: any) => p.salesperson_id === match.player1_id)?.salespeople?.name || 'TBD';
                                const p2Name = match.player2_id ? t.tournament_participants?.find((p: any) => p.salesperson_id === match.player2_id)?.salespeople?.name || 'TBD' : 'BYE';

                                return (
                                  <div key={match.id} className="w-48 border rounded-lg overflow-hidden bg-card">
                                    <div className={`p-2 flex items-center justify-between text-sm ${match.winner_id === match.player1_id ? 'bg-primary/10 font-semibold' : ''}`}>
                                      <span className="truncate">{p1Name}</span>
                                      <span className="text-xs font-mono">{match.player1_score}</span>
                                    </div>
                                    <div className="border-t" />
                                    <div className={`p-2 flex items-center justify-between text-sm ${match.winner_id === match.player2_id ? 'bg-primary/10 font-semibold' : ''}`}>
                                      <span className="truncate">{p2Name}</span>
                                      <span className="text-xs font-mono">{match.player2_score}</span>
                                    </div>
                                  </div>
                                );
                              }) : (
                                <div className="w-48 h-20 border rounded-lg flex items-center justify-center text-xs text-muted-foreground border-dashed">
                                  Aguardando...
                                </div>
                              )}
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            );
          })}
        </div>
      )}
    </div>
  );
}
