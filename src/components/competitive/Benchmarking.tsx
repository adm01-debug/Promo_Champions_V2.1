import React, { FC, useState } from 'react';
import { motion } from 'framer-motion';
import { BarChart3, ArrowLeftRight, TrendingUp, Zap, Target, Users } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { cn } from '@/lib/utils';
import { useCompetitiveRanking } from '@/hooks/useCompetitiveRanking';

const BenchmarkingComponent: FC = () => {
  const { data: ranking, isLoading } = useCompetitiveRanking();
  const [spA, setSpA] = useState('');
  const [spB, setSpB] = useState('');

  if (isLoading) return <div className="h-64 rounded-xl bg-muted/30 animate-pulse" />;

  const sellers = ranking || [];
  const sellerA = sellers.find(s => s.id === spA);
  const sellerB = sellers.find(s => s.id === spB);

  const metrics = sellerA && sellerB ? [
    { label: 'Receita', a: sellerA.totalSales, b: sellerB.totalSales, format: (v: number) => `R$${(v / 1000).toFixed(0)}k` },
    { label: 'Negócios', a: sellerA.dealsCount, b: sellerB.dealsCount, format: (v: number) => String(v) },
    { label: 'Ticket Médio', a: sellerA.dealsCount > 0 ? sellerA.totalSales / sellerA.dealsCount : 0, b: sellerB.dealsCount > 0 ? sellerB.totalSales / sellerB.dealsCount : 0, format: (v: number) => `R$${(v / 1000).toFixed(1)}k` },
    { label: 'Leads Ativos', a: sellerA.leadsCount, b: sellerB.leadsCount, format: (v: number) => String(v) },
    { label: 'Ranking', a: sellerA.rank, b: sellerB.rank, format: (v: number) => `#${v}`, invert: true },
  ] : [];

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-700">
      <Card className="glass border-white/5 shadow-2xl overflow-hidden relative group">
        <div className="absolute top-0 right-0 w-32 h-32 bg-primary/5 rounded-full blur-2xl -mr-16 -mt-16 group-hover:bg-primary/10 transition-colors" />
        <div className="bg-white/5 backdrop-blur-xl relative z-10">
          <CardHeader className="pb-4 border-b border-white/5">
            <CardTitle className="text-xl flex items-center gap-3 italic uppercase font-black tracking-tighter">
              <div className="h-10 w-10 rounded-xl bg-gradient-to-br from-primary to-accent flex items-center justify-center shadow-lg group-hover:rotate-6 transition-transform">
                <BarChart3 className="h-5 w-5 text-primary-foreground" />
              </div>
              <div>
                <span className="block gradient-text">Benchmarking</span>
                <span className="text-[10px] text-muted-foreground font-black uppercase tracking-[0.2em]">Competidor vs Competidor</span>
              </div>
            </CardTitle>
          </CardHeader>
          <CardContent className="p-6">
            <div className="flex items-center gap-4">
              <Select value={spA} onValueChange={setSpA}>
                <SelectTrigger className="h-12 bg-white/5 border-white/10 text-xs font-bold uppercase tracking-widest flex-1 px-4 rounded-xl focus:ring-primary/20">
                  <SelectValue placeholder="Vendedor A" />
                </SelectTrigger>
                <SelectContent className="glass border-white/10">
                  {sellers.filter(s => s.id !== spB).map(s => (
                    <SelectItem key={s.id} value={s.id} className="text-xs font-bold uppercase tracking-widest">{s.name}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center text-primary animate-pulse shrink-0 border border-primary/20">
                <ArrowLeftRight className="h-5 w-5" />
              </div>
              <Select value={spB} onValueChange={setSpB}>
                <SelectTrigger className="h-12 bg-white/5 border-white/10 text-xs font-bold uppercase tracking-widest flex-1 px-4 rounded-xl focus:ring-primary/20">
                  <SelectValue placeholder="Vendedor B" />
                </SelectTrigger>
                <SelectContent className="glass border-white/10">
                  {sellers.filter(s => s.id !== spA).map(s => (
                    <SelectItem key={s.id} value={s.id} className="text-xs font-bold uppercase tracking-widest">{s.name}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </CardContent>
        </div>
      </Card>

      {sellerA && sellerB ? (
        <div className="space-y-6">
          {/* Avatars comparison */}
          <div className="flex items-center justify-between px-8 py-4 bg-white/5 rounded-3xl border border-white/5 relative overflow-hidden">
             <div className="absolute inset-0 bg-gradient-to-r from-primary/5 via-transparent to-accent/5 opacity-50" />
            <div className="flex items-center gap-4 relative z-10">
              <div className="relative">
                <Avatar className="h-20 w-20 border-4 border-background shadow-2xl">
                  <AvatarImage src={sellerA.avatar_url || undefined} />
                  <AvatarFallback className="text-xl font-black bg-primary/20 text-primary">{sellerA.name[0]}</AvatarFallback>
                </Avatar>
                <div className="absolute -bottom-2 -right-2 h-8 w-8 rounded-full bg-primary flex items-center justify-center text-white font-black text-xs border-4 border-background shadow-lg">
                  #{sellerA.rank}
                </div>
              </div>
              <div className="space-y-1">
                <p className="text-xl font-black italic uppercase tracking-tighter leading-none">{sellerA.name}</p>
                <Badge variant="outline" className="text-[9px] uppercase font-black border-primary/20 text-primary bg-primary/5">Atacante</Badge>
              </div>
            </div>

            <div className="hidden md:flex flex-col items-center gap-1 relative z-10">
              <div className="text-4xl font-black italic tracking-tighter opacity-10">VS</div>
              <div className="h-px w-20 bg-gradient-to-r from-transparent via-white/20 to-transparent" />
            </div>

            <div className="flex items-center gap-4 flex-row-reverse relative z-10">
              <div className="relative">
                <Avatar className="h-20 w-20 border-4 border-background shadow-2xl">
                  <AvatarImage src={sellerB.avatar_url || undefined} />
                  <AvatarFallback className="text-xl font-black bg-accent/20 text-accent">{sellerB.name[0]}</AvatarFallback>
                </Avatar>
                <div className="absolute -bottom-2 -left-2 h-8 w-8 rounded-full bg-accent flex items-center justify-center text-white font-black text-xs border-4 border-background shadow-lg">
                  #{sellerB.rank}
                </div>
              </div>
              <div className="text-right space-y-1">
                <p className="text-xl font-black italic uppercase tracking-tighter leading-none">{sellerB.name}</p>
                <Badge variant="outline" className="text-[9px] uppercase font-black border-accent/20 text-accent bg-accent/5">Defensor</Badge>
              </div>
            </div>
          </div>

          {/* Metrics comparison grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {metrics.map((m, i) => {
              const max = Math.max(m.a, m.b) || 1;
              const aWins = m.invert ? m.a < m.b : m.a > m.b;
              const bWins = m.invert ? m.b < m.a : m.b > m.a;
              return (
                <motion.div 
                  key={m.label} 
                  initial={{ opacity: 0, y: 20 }} 
                  animate={{ opacity: 1, y: 0 }} 
                  transition={{ delay: i * 0.1 }}
                >
                  <Card className="glass border-white/5 hover:border-primary/30 transition-all duration-500 group/metric overflow-hidden">
                    <CardContent className="p-6 relative">
                      <div className="flex items-center justify-between mb-6">
                         <div className="h-8 w-8 rounded-lg bg-white/5 flex items-center justify-center text-muted-foreground group-hover/metric:text-primary transition-colors">
                           {m.label === 'Receita' && <TrendingUp className="size-4" />}
                           {m.label === 'Negócios' && <Zap className="size-4" />}
                           {m.label === 'Ticket Médio' && <Target className="size-4" />}
                           {m.label === 'Leads Ativos' && <Users className="size-4" />}
                           {m.label === 'Ranking' && <BarChart3 className="size-4" />}
                         </div>
                         <p className="text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground/60">{m.label}</p>
                         <div className="w-8" />
                      </div>

                      <div className="flex items-center gap-6">
                        <div className="w-24 text-right">
                          <span className={cn('text-xl font-black italic tracking-tighter', aWins ? 'text-emerald-400' : 'text-muted-foreground')}>
                            {m.format(m.a)}
                          </span>
                        </div>
                        
                        <div className="flex-1 flex gap-2 h-4 items-center">
                          <div className="flex-1 h-3 rounded-full bg-white/5 overflow-hidden flex justify-end shadow-inner">
                            <motion.div
                              initial={{ width: 0 }}
                              animate={{ width: `${m.invert ? (max > 0 ? ((max - m.a + 1) / (max + 1)) * 100 : 50) : (m.a / max) * 100}%` }}
                              className={cn('h-full rounded-full transition-all duration-1000 ease-out', aWins ? 'bg-gradient-to-l from-emerald-500 to-emerald-300' : 'bg-white/10')}
                            />
                          </div>
                          <div className="h-4 w-px bg-white/10" />
                          <div className="flex-1 h-3 rounded-full bg-white/5 overflow-hidden shadow-inner">
                            <motion.div
                              initial={{ width: 0 }}
                              animate={{ width: `${m.invert ? (max > 0 ? ((max - m.b + 1) / (max + 1)) * 100 : 50) : (m.b / max) * 100}%` }}
                              className={cn('h-full rounded-full transition-all duration-1000 ease-out', bWins ? 'bg-gradient-to-r from-emerald-500 to-emerald-300' : 'bg-white/10')}
                            />
                          </div>
                        </div>

                        <div className="w-24 text-left">
                          <span className={cn('text-xl font-black italic tracking-tighter', bWins ? 'text-emerald-400' : 'text-muted-foreground')}>
                            {m.format(m.b)}
                          </span>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </motion.div>
              );
            })}
          </div>
        </div>
      ) : (
        <Card className="glass border-dashed border-white/10 bg-white/5">
          <CardContent className="p-16 text-center">
            <div className="size-20 rounded-full bg-white/5 flex items-center justify-center mx-auto mb-6 border border-white/5">
              <BarChart3 className="h-10 w-10 text-muted-foreground/20" />
            </div>
            <p className="text-xl font-black italic uppercase tracking-tighter gradient-text mb-2">Aguardando Seleção</p>
            <p className="text-sm text-muted-foreground font-medium">Selecione dois gladiadores para iniciar o benchmarking comparativo.</p>
          </CardContent>
        </Card>
      )}
    </div>
  );
};


export const Benchmarking = React.memo(BenchmarkingComponent);
