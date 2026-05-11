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
    <div className="space-y-4">
      <Card className="border-none shadow-lg overflow-hidden">
        <div className="bg-gradient-to-r from-primary/10 to-primary-glow/10">
          <CardHeader className="pb-2">
            <CardTitle className="text-base flex items-center gap-2">
              <div className="h-8 w-8 rounded-lg bg-gradient-to-br from-primary to-primary-glow flex items-center justify-center">
                <BarChart3 className="h-4 w-4 text-primary-foreground" />
              </div>
              Benchmarking
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-3">
              <Select value={spA} onValueChange={setSpA}>
                <SelectTrigger className="h-9 text-xs flex-1"><SelectValue placeholder="Vendedor A" /></SelectTrigger>
                <SelectContent>
                  {sellers.filter(s => s.id !== spB).map(s => (
                    <SelectItem key={s.id} value={s.id}>{s.name}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <ArrowLeftRight className="h-4 w-4 text-muted-foreground shrink-0" />
              <Select value={spB} onValueChange={setSpB}>
                <SelectTrigger className="h-9 text-xs flex-1"><SelectValue placeholder="Vendedor B" /></SelectTrigger>
                <SelectContent>
                  {sellers.filter(s => s.id !== spA).map(s => (
                    <SelectItem key={s.id} value={s.id}>{s.name}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </CardContent>
        </div>
      </Card>

      {sellerA && sellerB ? (
        <div className="space-y-3">
          {/* Avatars */}
          <div className="flex items-center justify-between px-4">
            <div className="flex items-center gap-2">
              <Avatar className="h-10 w-10"><AvatarImage src={sellerA.avatar_url || undefined} /><AvatarFallback>{sellerA.name[0]}</AvatarFallback></Avatar>
              <div>
                <p className="text-sm font-bold text-foreground">{sellerA.name}</p>
                <p className="text-[10px] text-muted-foreground">#{sellerA.rank}</p>
              </div>
            </div>
            <div className="flex items-center gap-2 flex-row-reverse">
              <Avatar className="h-10 w-10"><AvatarImage src={sellerB.avatar_url || undefined} /><AvatarFallback>{sellerB.name[0]}</AvatarFallback></Avatar>
              <div className="text-right">
                <p className="text-sm font-bold text-foreground">{sellerB.name}</p>
                <p className="text-[10px] text-muted-foreground">#{sellerB.rank}</p>
              </div>
            </div>
          </div>

          {/* Metrics */}
          {metrics.map((m, i) => {
            const max = Math.max(m.a, m.b) || 1;
            const aWins = m.invert ? m.a < m.b : m.a > m.b;
            const bWins = m.invert ? m.b < m.a : m.b > m.a;
            return (
              <motion.div key={m.label} initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: i * 0.08 }}>
                <Card className="border-none shadow-sm">
                  <CardContent className="p-3 space-y-2">
                    <p className="text-xs font-semibold text-muted-foreground text-center">{m.label}</p>
                    <div className="flex items-center gap-3">
                      <span className={cn('text-sm font-bold w-16 text-right', aWins ? 'text-success' : 'text-foreground')}>
                        {m.format(m.a)}
                      </span>
                      <div className="flex-1 flex gap-1">
                        <div className="flex-1 h-3 rounded-full bg-muted/30 overflow-hidden flex justify-end">
                          <motion.div
                            initial={{ width: 0 }}
                            animate={{ width: `${m.invert ? (max > 0 ? ((max - m.a + 1) / (max + 1)) * 100 : 50) : (m.a / max) * 100}%` }}
                            className={cn('h-full rounded-full', aWins ? 'bg-success' : 'bg-primary/50')}
                          />
                        </div>
                        <div className="flex-1 h-3 rounded-full bg-muted/30 overflow-hidden">
                          <motion.div
                            initial={{ width: 0 }}
                            animate={{ width: `${m.invert ? (max > 0 ? ((max - m.b + 1) / (max + 1)) * 100 : 50) : (m.b / max) * 100}%` }}
                            className={cn('h-full rounded-full', bWins ? 'bg-success' : 'bg-primary/50')}
                          />
                        </div>
                      </div>
                      <span className={cn('text-sm font-bold w-16', bWins ? 'text-success' : 'text-foreground')}>
                        {m.format(m.b)}
                      </span>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            );
          })}
        </div>
      ) : (
        <Card className="border-dashed">
          <CardContent className="p-8 text-center">
            <BarChart3 className="h-10 w-10 mx-auto text-muted-foreground/30 mb-3" />
            <p className="text-sm text-muted-foreground">Selecione dois vendedores para comparar</p>
          </CardContent>
        </Card>
      )}
    </div>
  );
};


export const Benchmarking = React.memo(BenchmarkingComponent);
