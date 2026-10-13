import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Sparkles, ArrowRight, TrendingUp, AlertCircle, Clock } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { motion } from 'framer-motion';
import { useQuery } from '@tanstack/react-query';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';

interface TopLead {
  sale_id: string;
  score: number;
  calculated_at: string;
  client_name: string;
  status: string;
}

const reasonForStatus = (status: string) =>
  status === 'qualified'
    ? 'Lead qualificado aguardando follow-up'
    : 'Lead em prospecção com score alto';

const actionForScore = (score: number) =>
  score >= 80 ? 'Ligar agora' : 'Enviar follow-up';

export function SDRIntelligenceHighlights() {
  const navigate = useNavigate();
  const { data: recommendations } = useQuery({
    queryKey: ['sdr-intelligence-highlights'],
    queryFn: async (): Promise<TopLead[]> => {
      const { data, error } = await supabase
        .from('lead_scores')
        .select('sale_id, score, calculated_at, sales!inner(id, client_name, status)')
        .in('sales.status', ['lead', 'qualified', 'pending'])
        .order('score', { ascending: false })
        .limit(3);
      if (error) throw error;
      return (data ?? []).map(r => ({
        sale_id: r.sale_id,
        score: Number(r.score),
        calculated_at: r.calculated_at,
        client_name: r.sales.client_name ?? 'Lead',
        status: r.sales.status ?? 'lead',
      }));
    },
    staleTime: 5 * 60 * 1000,
  });

  const items = recommendations ?? [];

  return (
    <Card className="border-primary/20 bg-primary/5 overflow-hidden relative">
      <div className="absolute top-0 right-0 p-4 opacity-10 pointer-events-none">
        <Sparkles className="h-24 w-24 text-primary" />
      </div>

      <CardHeader className="pb-2">
        <div className="flex items-center justify-between">
          <CardTitle className="text-section-title flex items-center gap-2">
            <Sparkles className="h-4 w-4 text-primary animate-pulse" />
            Insights de Inteligência
          </CardTitle>
          <Badge
            variant="outline"
            className="text-[10px] uppercase tracking-tighter border-primary/30 text-primary"
          >
            AI Powered
          </Badge>
        </div>
      </CardHeader>

      <CardContent className="space-y-4">
        {items.length === 0 && (
          <div className="py-6 text-center space-y-1">
            <p className="text-sm font-medium text-muted-foreground">
              Nenhum lead pontuado ainda
            </p>
            <p className="text-xs text-muted-foreground">
              Quando o lead-scoring processar as vendas ativas, os 3 leads mais quentes
              aparecem aqui.
            </p>
          </div>
        )}

        {items.map((rec, index) => (
          <motion.div
            key={rec.sale_id}
            initial={{ opacity: 0, x: -10 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: index * 0.1 }}
            className="group relative p-3 rounded-lg bg-background/50 border border-border/50 hover:border-primary/30 transition-all cursor-pointer"
            onClick={() => navigate('/vendas')}
          >
            <div className="flex items-start justify-between gap-3">
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <span className="font-semibold text-sm">{rec.client_name}</span>
                  <Badge
                    className={`text-[10px] h-4 px-1 ${
                      rec.score >= 80
                        ? 'bg-red-500/10 text-red-500 border-red-500/20'
                        : 'bg-orange-500/10 text-orange-500 border-orange-500/20'
                    }`}
                  >
                    Score {rec.score}
                  </Badge>
                </div>
                <p className="text-xs text-muted-foreground flex items-center gap-1.5">
                  <AlertCircle className="h-3 w-3" />
                  {reasonForStatus(rec.status)}
                </p>
              </div>
              <Button
                size="icon"
                variant="ghost"
                aria-label={`Ver lead ${rec.client_name}`}
                className="h-8 w-8 rounded-full group-hover:bg-primary group-hover:text-primary-foreground"
                onClick={e => {
                  e.stopPropagation();
                  navigate('/vendas');
                }}
              >
                <ArrowRight className="h-4 w-4" />
              </Button>
            </div>

            <div className="mt-2 flex items-center gap-3">
              <span className="text-[10px] font-medium text-primary uppercase tracking-wider bg-primary/10 px-1.5 py-0.5 rounded">
                Ação Sugerida: {actionForScore(rec.score)}
              </span>
              <div className="flex items-center gap-1 text-[10px] text-muted-foreground ml-auto">
                <Clock className="h-3 w-3" />
                Agir agora
              </div>
            </div>
          </motion.div>
        ))}

        <div className="pt-2">
          <Button
            variant="ghost"
            size="sm"
            className="w-full text-xs text-primary hover:bg-primary/5 gap-2"
            onClick={() => navigate('/lead-scoring')}
          >
            Ver todas recomendações
            <TrendingUp className="h-3 w-3" />
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
