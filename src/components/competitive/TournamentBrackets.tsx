import React from 'react';
import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { motion } from 'framer-motion';
import { Trophy, Swords, Plus, Zap } from 'lucide-react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

function TournamentBracketsComponent() {
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
      const { data } = await supabase.rpc('get_active_salespeople');
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
    completed: { label: 'Finalizado', color: 'bg-success/20 text-success' },
  };

  const metricLabels: Record<string, any> = {
    revenue: 'Receita', deals: 'Deals', activities: 'Atividades', conversion: 'Conversão',
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-display font-bold flex items-center gap-2">
            <Trophy className="h-5 w-5 text-rank-gold" /> Torneios Eliminatórios
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
          {tournaments.map((t: Record<string, any>) => {
            const status = statusConfig[t.status] || statusConfig.upcoming;
            const matches = t.tournament_matches || [];

            return (
              <motion.div key={t.id} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>
                <Card className="overflow-hidden glass border-border/40 card-elevated group relative">
                  <div className="absolute top-0 right-0 w-32 h-32 bg-primary/5 blur-3xl rounded-full -mr-16 -mt-16 pointer-events-none group-hover:bg-primary/10 transition-all duration-700" />
                  
                  <CardHeader className="pb-4 border-b border-border/10 relative z-10">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                      <div className="flex items-center gap-4">
                        <div className="h-12 w-12 rounded-2xl bg-gradient-to-br from-primary/20 to-primary/5 shadow-xl flex items-center justify-center group-hover:scale-110 group-hover:rotate-6 transition-all duration-500 border border-primary/10">
                          <Trophy className="h-6 w-6 text-primary drop-shadow-[0_0_8px_rgba(var(--primary),0.5)]" />
                        </div>
                        <div>
                          <CardTitle className="text-xl font-display font-black tracking-tighter italic gradient-text uppercase">{t.name}</CardTitle>
                          <div className="flex flex-wrap items-center gap-2.5 mt-1.5">
                            <Badge className={cn("text-[9px] font-black uppercase tracking-widest px-2.5 py-0.5 border-none shadow-sm", status.color)}>
                              {status.label}
                            </Badge>
                            <div className="flex items-center gap-1.5 px-2 py-0.5 rounded-md bg-muted/30 border border-border/10">
                              <Zap className="h-3 w-3 text-primary/70" />
                              <span className="text-[10px] font-black uppercase tracking-widest text-muted-foreground/80">{metricLabels[t.metric_type]}</span>
                            </div>
                            <div className="flex items-center gap-1.5 px-2 py-0.5 rounded-md bg-muted/30 border border-border/10">
                              <Users className="h-3 w-3 text-accent/70" />
                              <span className="text-[10px] font-black uppercase tracking-widest text-muted-foreground/80">{t.tournament_participants?.length || 0} GLADIADORES</span>
                            </div>
                          </div>
                        </div>
                      </div>
                      {t.status === 'upcoming' && (
                        <Button size="sm" className="shadow-lg shadow-primary/20 font-black uppercase tracking-widest text-[10px] italic h-9 px-5 rounded-xl animate-pulse-subtle" onClick={() => startTournament.mutate(t.id)}>
                          <Zap className="h-4 w-4 mr-2" /> Iniciar Copa
                        </Button>
                      )}
                    </div>
                  </CardHeader>
                  
                  <CardContent className="pt-8 relative z-10">
                    <div className="overflow-x-auto pb-4 scrollbar-hide">
                      <div className="flex gap-12 min-w-max px-4">
                        {Array.from({ length: t.total_rounds }, (_, r) => {
                          const roundMatches = matches.filter((m: any) => m.round_number === r + 1).sort((a: any, b: any) => a.match_order - b.match_order);
                          const isFinal = r + 1 === t.total_rounds;
                          const isSemi = r + 1 === t.total_rounds - 1;
                          const label = isFinal ? 'Grande Final' : isSemi ? 'Semi-Finais' : `Round ${r + 1}`;

                          return (
                            <div key={r} className="flex flex-col gap-6 w-60">
                              <div className="flex items-center gap-3 justify-center">
                                <div className="h-px flex-1 bg-gradient-to-r from-transparent to-border/30" />
                                <span className="text-[10px] font-black text-primary/70 uppercase tracking-[0.2em] italic whitespace-nowrap">{label}</span>
                                <div className="h-px flex-1 bg-gradient-to-l from-transparent to-border/30" />
                              </div>
                              
                              <div className="flex flex-col justify-around flex-1 gap-8">
                                {roundMatches.length > 0 ? roundMatches.map((match: any) => {
                                  const p1 = t.tournament_participants?.find((p: any) => p.salesperson_id === match.player1_id);
                                  const p2 = match.player2_id ? t.tournament_participants?.find((p: any) => p.salesperson_id === match.player2_id) : null;
                                  
                                  const p1Name = p1?.salespeople?.name || 'TBD';
                                  const p2Name = match.player2_id ? (p2?.salespeople?.name || 'TBD') : 'BYE (Avança)';
                                  
                                  const p1Winner = match.winner_id === match.player1_id;
                                  const p2Winner = match.winner_id === match.player2_id;

                                  return (
                                    <div key={match.id} className="relative group/match">
                                      <div className={cn(
                                        "w-full border rounded-2xl overflow-hidden bg-background/40 backdrop-blur-sm transition-all duration-500 shadow-xl",
                                        match.status === 'active' ? 'ring-2 ring-primary/40 border-primary/20' : 'border-border/10',
                                        p1Winner || p2Winner ? 'hover:scale-[1.02]' : ''
                                      )}>
                                        {/* P1 */}
                                        <div className={cn(
                                          "p-3.5 flex items-center justify-between text-xs transition-colors",
                                          p1Winner ? 'bg-status-success/10' : match.winner_id && !p1Winner ? 'opacity-40 grayscale' : ''
                                        )}>
                                          <div className="flex items-center gap-2.5 min-w-0">
                                            <div className={cn(
                                              "h-6 w-6 rounded-lg flex items-center justify-center text-[10px] font-black",
                                              p1Winner ? 'bg-status-success/20 text-status-success' : 'bg-muted/50 text-muted-foreground'
                                            )}>
                                              {p1Winner ? <CheckCircle2 className="h-3.5 w-3.5" /> : (p1?.seed || '?')}
                                            </div>
                                            <span className="truncate font-black uppercase tracking-tight italic">{p1Name}</span>
                                          </div>
                                          <span className="font-mono font-bold text-primary bg-primary/5 px-1.5 py-0.5 rounded border border-primary/10">{match.player1_score || 0}</span>
                                        </div>
                                        
                                        <div className="h-px bg-border/5 relative">
                                          <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 bg-background/80 px-2 py-0.5 rounded-full border border-border/10 text-[8px] font-black text-muted-foreground/60">VS</div>
                                        </div>
                                        
                                        {/* P2 */}
                                        <div className={cn(
                                          "p-3.5 flex items-center justify-between text-xs transition-colors",
                                          p2Winner ? 'bg-status-success/10' : match.winner_id && !p2Winner ? 'opacity-40 grayscale' : ''
                                        )}>
                                          <div className="flex items-center gap-2.5 min-w-0">
                                            <div className={cn(
                                              "h-6 w-6 rounded-lg flex items-center justify-center text-[10px] font-black",
                                              p2Winner ? 'bg-status-success/20 text-status-success' : 'bg-muted/50 text-muted-foreground'
                                            )}>
                                              {p2Winner ? <CheckCircle2 className="h-3.5 w-3.5" /> : (p2?.seed || '?')}
                                            </div>
                                            <span className={cn(
                                              "truncate font-black uppercase tracking-tight italic",
                                              !match.player2_id && "text-muted-foreground/40"
                                            )}>{p2Name}</span>
                                          </div>
                                          {match.player2_id && (
                                            <span className="font-mono font-bold text-primary bg-primary/5 px-1.5 py-0.5 rounded border border-primary/10">{match.player2_score || 0}</span>
                                          )}
                                        </div>
                                      </div>
                                      
                                      {/* Connector Line to Next Round (Visual only for now) */}
                                      {!isFinal && (
                                        <div className="absolute top-1/2 -right-12 w-12 h-px bg-gradient-to-r from-border/50 to-transparent" />
                                      )}
                                    </div>
                                  );
                                }) : (
                                  <div className="w-full h-24 rounded-2xl border-2 border-dashed border-border/10 flex items-center justify-center text-[10px] font-black uppercase tracking-widest text-muted-foreground/30 italic">
                                    Gladiadores Pendentes
                                  </div>
                                )}
                              </div>
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
              </motion.div>
            );
          })}
        </div>
      )}
    </div>
  );
}


export const TournamentBrackets = React.memo(TournamentBracketsComponent);
