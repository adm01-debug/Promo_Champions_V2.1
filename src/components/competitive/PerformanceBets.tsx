import { useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Slider } from '@/components/ui/slider';
import { Progress } from '@/components/ui/progress';
import { motion } from 'framer-motion';
import { Flame, TrendingUp, Target, Plus, Coins, Trophy, AlertTriangle, CheckCircle2, XCircle, Timer } from 'lucide-react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { differenceInHours } from 'date-fns';

export function PerformanceBets() {
  const queryClient = useQueryClient();
  const [showCreate, setShowCreate] = useState(false);
  const [betForm, setBetForm] = useState({
    bet_type: 'deals', target_value: 5, xp_wagered: 200, description: '',
    duration_days: 7,
  });

  const { data: currentSp } = useQuery({
    queryKey: ['bets-current-sp'],
    queryFn: async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return null;
      const { data } = await supabase.from('salespeople').select('id, name').eq('auth_user_id', user.id).maybeSingle();
      return data;
    },
    staleTime: 5 * 60 * 1000,
  });

  const { data: bets = [] } = useQuery({
    queryKey: ['performance-bets'],
    queryFn: async () => {
      const { data } = await supabase
        .from('performance_bets')
        .select('*, salespeople:salesperson_id(id, name)')
        .order('created_at', { ascending: false });
      return data || [];
    },
  });

  const createBet = useMutation({
    mutationFn: async () => {
      if (!currentSp) throw new Error('No salesperson');
      const endsAt = new Date();
      endsAt.setDate(endsAt.getDate() + betForm.duration_days);
      const { error } = await supabase.from('performance_bets').insert({
        salesperson_id: currentSp.id,
        bet_type: betForm.bet_type,
        target_value: betForm.target_value,
        xp_wagered: betForm.xp_wagered,
        xp_multiplier: 2.0,
        description: betForm.description || `Aposto ${betForm.xp_wagered} XP que alcanço ${betForm.target_value} ${betForm.bet_type}`,
        ends_at: endsAt.toISOString(),
      });
      if (error) throw error;
    },
    onSuccess: () => {
      toast.success('Aposta registrada! Boa sorte! 🎲');
      setShowCreate(false);
      queryClient.invalidateQueries({ queryKey: ['performance-bets'] });
    },
    onError: () => toast.error('Erro ao criar aposta'),
  });

  const typeLabels: Record<string, { label: string; icon: typeof Target }> = {
    deals: { label: 'Deals', icon: Target },
    revenue: { label: 'Receita', icon: Coins },
    calls: { label: 'Ligações', icon: TrendingUp },
    meetings: { label: 'Reuniões', icon: Trophy },
    activities: { label: 'Atividades', icon: Flame },
  };

  const statusConfig: Record<string, { label: string; color: string; icon: typeof CheckCircle2 }> = {
    active: { label: 'Em andamento', color: 'bg-primary/20 text-primary', icon: Timer },
    won: { label: 'GANHOU! 🎉', color: 'bg-green-500/20 text-green-500', icon: CheckCircle2 },
    lost: { label: 'Perdeu 😞', color: 'bg-destructive/20 text-destructive', icon: XCircle },
    cancelled: { label: 'Cancelada', color: 'bg-muted text-muted-foreground', icon: AlertTriangle },
  };

  const activeBets = bets.filter((b: any) => b.status === 'active');
  const completedBets = bets.filter((b: any) => b.status !== 'active');
  const totalXpAtStake = activeBets.reduce((sum: number, b: any) => sum + (b.xp_wagered || 0), 0);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-display font-bold flex items-center gap-2">
            <Flame className="h-5 w-5 text-amber-500" /> Apostas de Performance
          </h2>
          <p className="text-sm text-muted-foreground">Aposte XP nas suas próprias metas. Ganhe o dobro ou perca tudo!</p>
        </div>
        <Dialog open={showCreate} onOpenChange={setShowCreate}>
          <DialogTrigger asChild>
            <Button size="sm"><Plus className="h-4 w-4 mr-1" /> Nova Aposta</Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader><DialogTitle>🎲 Fazer Aposta</DialogTitle></DialogHeader>
            <div className="space-y-4">
              <div>
                <Label>Tipo de meta</Label>
                <Select value={betForm.bet_type} onValueChange={v => setBetForm(p => ({ ...p, bet_type: v }))}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="deals">Deals Fechados</SelectItem>
                    <SelectItem value="revenue">Receita (R$)</SelectItem>
                    <SelectItem value="calls">Ligações</SelectItem>
                    <SelectItem value="meetings">Reuniões</SelectItem>
                    <SelectItem value="activities">Total Atividades</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label>Meta alvo</Label>
                <Input type="number" value={betForm.target_value} onChange={e => setBetForm(p => ({ ...p, target_value: parseFloat(e.target.value) || 0 }))} />
              </div>
              <div>
                <Label>XP Apostado: {betForm.xp_wagered}</Label>
                <Slider value={[betForm.xp_wagered]} onValueChange={([v]) => setBetForm(p => ({ ...p, xp_wagered: v }))} min={50} max={1000} step={50} className="mt-2" />
                <div className="flex justify-between text-xs text-muted-foreground mt-1">
                  <span>50 XP</span>
                  <span className="text-primary font-semibold">Ganho potencial: {betForm.xp_wagered * 2} XP</span>
                  <span>1000 XP</span>
                </div>
              </div>
              <div>
                <Label>Prazo (dias)</Label>
                <Select value={String(betForm.duration_days)} onValueChange={v => setBetForm(p => ({ ...p, duration_days: parseInt(v) }))}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="3">3 dias</SelectItem>
                    <SelectItem value="5">5 dias</SelectItem>
                    <SelectItem value="7">1 semana</SelectItem>
                    <SelectItem value="14">2 semanas</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <Card className="border-amber-500/30 bg-amber-500/5">
                <CardContent className="p-3 text-center text-sm">
                  <Flame className="h-5 w-5 mx-auto mb-1 text-amber-500" />
                  Se bater: <strong className="text-green-500">+{betForm.xp_wagered * 2} XP</strong><br />
                  Se falhar: <strong className="text-destructive">-{betForm.xp_wagered} XP</strong>
                </CardContent>
              </Card>
              <Button className="w-full" onClick={() => createBet.mutate()} disabled={createBet.isPending}>
                🎲 Apostar {betForm.xp_wagered} XP
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {/* Stats bar */}
      <div className="grid grid-cols-3 gap-4">
        <Card>
          <CardContent className="p-4 text-center">
            <div className="text-2xl font-bold text-primary">{activeBets.length}</div>
            <div className="text-xs text-muted-foreground">Apostas Ativas</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 text-center">
            <div className="text-2xl font-bold text-amber-500">{totalXpAtStake}</div>
            <div className="text-xs text-muted-foreground">XP em Jogo</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 text-center">
            <div className="text-2xl font-bold text-green-500">
              {completedBets.filter((b: any) => b.status === 'won').length}
            </div>
            <div className="text-xs text-muted-foreground">Apostas Ganhas</div>
          </CardContent>
        </Card>
      </div>

      {/* Active Bets */}
      {activeBets.length > 0 && (
        <div className="space-y-3">
          <h3 className="font-semibold text-sm uppercase tracking-wider text-muted-foreground">🔥 Apostas Ativas</h3>
          {activeBets.map((bet: any, i: number) => {
            const type = typeLabels[bet.bet_type] || typeLabels.deals;
            const progress = bet.target_value > 0 ? Math.min((bet.current_value / bet.target_value) * 100, 100) : 0;
            const hoursLeft = differenceInHours(new Date(bet.ends_at), new Date());

            return (
              <motion.div key={bet.id} initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: i * 0.05 }}>
                <Card className="border-primary/20">
                  <CardContent className="p-4">
                    <div className="flex items-center justify-between mb-3">
                      <div className="flex items-center gap-2">
                        <div className="h-8 w-8 rounded-lg bg-primary/10 flex items-center justify-center">
                          <type.icon className="h-4 w-4 text-primary" />
                        </div>
                        <div>
                          <div className="font-semibold text-sm">{(bet as any).salespeople?.name}</div>
                          <div className="text-xs text-muted-foreground">{type.label}: {bet.bet_type === 'revenue' ? `R$ ${bet.target_value}` : bet.target_value}</div>
                        </div>
                      </div>
                      <div className="text-right">
                        <Badge variant="outline" className="text-amber-500 border-amber-500/30">{bet.xp_wagered} XP</Badge>
                        <div className="text-xs text-muted-foreground mt-1">
                          <Timer className="h-3 w-3 inline mr-1" />{hoursLeft > 0 ? `${hoursLeft}h restantes` : 'Expirado'}
                        </div>
                      </div>
                    </div>
                    <Progress value={progress} className="h-2" />
                    <div className="flex justify-between text-xs text-muted-foreground mt-1">
                      <span>{bet.current_value} / {bet.target_value}</span>
                      <span>{progress.toFixed(0)}%</span>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            );
          })}
        </div>
      )}

      {/* Completed Bets */}
      {completedBets.length > 0 && (
        <div className="space-y-3">
          <h3 className="font-semibold text-sm uppercase tracking-wider text-muted-foreground">📜 Histórico</h3>
          {completedBets.slice(0, 10).map((bet: any) => {
            const status = statusConfig[bet.status] || statusConfig.cancelled;
            const StatusIcon = status.icon;
            return (
              <Card key={bet.id} className="opacity-80">
                <CardContent className="p-3 flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <StatusIcon className="h-4 w-4" />
                    <span className="text-sm">{(bet as any).salespeople?.name}</span>
                    <span className="text-xs text-muted-foreground">· {typeLabels[bet.bet_type]?.label}</span>
                  </div>
                  <Badge variant="outline" className={status.color}>{status.label}</Badge>
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}

      {bets.length === 0 && (
        <Card>
          <CardContent className="p-12 text-center">
            <Coins className="h-12 w-12 mx-auto mb-4 text-muted-foreground/50" />
            <h3 className="font-semibold text-lg">Nenhuma aposta ainda</h3>
            <p className="text-sm text-muted-foreground">Seja o primeiro a apostar em si mesmo! 💪</p>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
