import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Info, UserCheck, Activity, Target, Zap } from 'lucide-react';
import { motion } from 'framer-motion';
import type { LucideIcon } from 'lucide-react';
import { useQuery } from '@tanstack/react-query';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { supabase } from '@/integrations/supabase/client';

const FACTOR_META = [
  { key: 'dealValue', max: 25, label: 'Valor do Deal', icon: UserCheck },
  { key: 'stageProgress', max: 25, label: 'Progresso no Funil', icon: Target },
  { key: 'timeInPipeline', max: 20, label: 'Tempo no Pipeline', icon: Activity },
  { key: 'category', max: 15, label: 'Categoria', icon: Info },
  { key: 'recentActivity', max: 15, label: 'Atividade Recente', icon: Zap },
] as const;

interface ScoreFactor {
  key: string;
  label: string;
  detail: string | null;
  value: number;
  max: number;
  icon: LucideIcon;
}

function extractFactors(factors: unknown): ScoreFactor[] {
  if (!factors || typeof factors !== 'object' || Array.isArray(factors)) return [];
  const rec = factors as Record<string, unknown>;
  const labels =
    rec.labels && typeof rec.labels === 'object' && !Array.isArray(rec.labels)
      ? (rec.labels as Record<string, unknown>)
      : {};
  const out: ScoreFactor[] = [];
  for (const meta of FACTOR_META) {
    const v = rec[meta.key];
    if (typeof v === 'number' && Number.isFinite(v)) {
      const detail = labels[meta.key];
      out.push({
        key: meta.key,
        label: meta.label,
        detail: typeof detail === 'string' ? detail : null,
        value: Math.round(v),
        max: meta.max,
        icon: meta.icon,
      });
    }
  }
  return out;
}

interface LeadScoreBreakdownProps {
  leadName?: string;
  score?: number;
}

export function LeadScoreBreakdown({ leadName, score }: LeadScoreBreakdownProps = {}) {
  const { data: fetched } = useQuery({
    queryKey: ['lead-score-breakdown-top'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('lead_scores')
        .select(
          'sale_id, score, factors, calculated_at, sales!inner(client_name, status)'
        )
        .in('sales.status', ['lead', 'qualified', 'pending'])
        .order('score', { ascending: false })
        .limit(1);
      if (error) throw error;
      const row = data?.[0];
      if (!row) return null;
      return {
        leadName: row.sales.client_name ?? 'Lead',
        score: Number(row.score),
        factors: extractFactors(row.factors),
        calculatedAt: row.calculated_at,
      };
    },
    staleTime: 5 * 60 * 1000,
    enabled: !leadName,
  });

  const top =
    leadName !== undefined && score !== undefined
      ? { leadName, score, factors: [], calculatedAt: null }
      : fetched;

  if (!top) {
    return (
      <Card className="glass border-primary/20 overflow-hidden">
        <CardContent className="p-6">
          <div className="flex flex-col items-center justify-center gap-2 py-6 text-center">
            <Info className="h-8 w-8 text-muted-foreground/50" />
            <p className="text-sm font-medium text-muted-foreground">
              Nenhum lead com score disponível
            </p>
            <p className="text-xs text-muted-foreground max-w-xs">
              Assim que o lead-scoring pontuar uma venda ativa, a análise do líder aparece
              aqui.
            </p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="glass border-primary/20 overflow-hidden">
      <CardHeader className="pb-3 border-b border-border/50">
        <div className="flex items-center justify-between">
          <CardTitle className="text-section-title text-sm flex items-center gap-2">
            <Info className="h-4 w-4 text-primary" />
            Análise de Score: {top.leadName}
          </CardTitle>
          <div className="flex items-center gap-2">
            <span className="text-lg font-black text-primary">{top.score}</span>
            <Badge className="bg-primary/20 text-primary border-primary/30">
              {top.score >= 75 ? 'QUENTE' : top.score >= 50 ? 'MORNO' : 'FRIO'}
            </Badge>
          </div>
        </div>
      </CardHeader>
      <CardContent className="pt-5 space-y-5">
        {top.factors.length === 0 && (
          <p className="text-xs text-muted-foreground">
            Detalhamento de fatores não disponível para este score — exibindo apenas o
            consolidado calculado pelo lead-scoring.
          </p>
        )}
        {top.factors.map((factor, i) => (
          <motion.div
            key={factor.key}
            initial={{ opacity: 0, x: -10 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: i * 0.1 }}
            className="space-y-1.5"
          >
            <div className="flex justify-between items-center text-[10px] uppercase font-bold tracking-wider text-muted-foreground">
              <div className="flex items-center gap-1.5">
                <factor.icon className="h-3 w-3" />
                {factor.label}
                {factor.detail && (
                  <span className="normal-case font-normal opacity-70">
                    — {factor.detail}
                  </span>
                )}
              </div>
              <span>
                {factor.value}/{factor.max} pts
              </span>
            </div>
            <Progress value={(factor.value / factor.max) * 100} className="h-1.5" />
          </motion.div>
        ))}

        <div className="mt-4 p-3 rounded-lg bg-muted/50 border border-border/50">
          <p className="text-[10px] text-muted-foreground italic leading-relaxed">
            {top.calculatedAt
              ? `Score calculado em ${format(new Date(top.calculatedAt), "dd/MM/yyyy 'às' HH:mm", { locale: ptBR })} pelo motor de lead-scoring.`
              : 'Score informado pelo lead-scoring.'}
          </p>
        </div>
      </CardContent>
    </Card>
  );
}
