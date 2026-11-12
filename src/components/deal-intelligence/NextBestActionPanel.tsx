import { motion } from 'framer-motion';
import { useDealHealth } from '@/hooks/deal-intelligence/useDealHealth';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Sparkles, Clock, Zap, Target } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';

interface Props {
  saleId: string | null | undefined;
}

export function NextBestActionPanel({ saleId }: Props) {
  const { data: health, isLoading } = useDealHealth(saleId || undefined);

  if (isLoading) {
    return (
      <Card className="glass border-border/40">
        <CardHeader className="pb-2">
          <CardTitle className="text-section-title text-sm">
            Carregando Recomendações...
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="h-16 w-full bg-muted/20 animate-pulse rounded-lg" />
          <div className="h-16 w-full bg-muted/20 animate-pulse rounded-lg" />
        </CardContent>
      </Card>
    );
  }

  const actions = Array.isArray(health?.recommended_actions)
    ? health.recommended_actions
    : [];
  const aiRecommendation = health?.ai_recommendation?.trim();

  return (
    <Card className="glass border-border/40 overflow-hidden card-elevated">
      <CardHeader className="pb-2 bg-primary/5 border-b border-border/20">
        <div className="flex justify-between items-center">
          <CardTitle className="text-section-title text-sm flex items-center gap-2">
            <Zap className="h-4 w-4 text-primary fill-primary" />
            Next Best Action (NBA)
          </CardTitle>
          <Badge
            variant="outline"
            className="text-[10px] bg-primary/10 text-primary border-primary/20"
          >
            IA Gerativa Live
          </Badge>
        </div>
      </CardHeader>
      <CardContent className="pt-4 space-y-4">
        {actions.length === 0 && !aiRecommendation && (
          <p className="py-6 text-center text-sm text-muted-foreground">
            Sem recomendações para este deal ainda.
          </p>
        )}
        {actions.map((action, i) => (
          <motion.div
            key={i}
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: i * 0.1 }}
            className={cn(
              'group relative p-3 rounded-xl border transition-all duration-300',
              'bg-card/50 hover:bg-card border-border/30 hover:border-primary/40',
              action.priority === 'high'
                ? 'border-l-4 border-l-destructive shadow-sm'
                : action.priority === 'medium'
                  ? 'border-l-4 border-l-amber-500'
                  : 'border-l-4 border-l-emerald-500'
            )}
          >
            <div className="flex items-start gap-3">
              <div
                className={cn(
                  'mt-0.5 p-1.5 rounded-lg',
                  action.priority === 'high'
                    ? 'bg-destructive/10 text-destructive'
                    : action.priority === 'medium'
                      ? 'bg-amber-500/10 text-amber-500'
                      : 'bg-emerald-500/10 text-emerald-500'
                )}
              >
                {action.priority === 'high' ? (
                  <Target className="h-3.5 w-3.5" />
                ) : (
                  <Clock className="h-3.5 w-3.5" />
                )}
              </div>
              <div className="flex-1 min-w-0">
                <div className="mb-0.5">
                  <span
                    className={cn(
                      'text-[9px] font-bold uppercase tracking-widest',
                      action.priority === 'high'
                        ? 'text-destructive'
                        : action.priority === 'medium'
                          ? 'text-amber-500'
                          : 'text-emerald-500'
                    )}
                  >
                    Prioridade{' '}
                    {action.priority === 'high'
                      ? 'Crítica'
                      : action.priority === 'medium'
                        ? 'Alta'
                        : 'Normal'}
                  </span>
                </div>
                <p className="text-sm font-medium text-foreground leading-tight group-hover:text-primary transition-colors">
                  {action.title}
                </p>
              </div>
            </div>
          </motion.div>
        ))}

        {aiRecommendation && (
          <div className="p-3 rounded-lg bg-secondary/30 border border-dashed border-border/40">
            <div className="flex items-center gap-2 mb-2">
              <Sparkles className="h-3.5 w-3.5 text-primary" />
              <span className="text-[11px] font-bold uppercase tracking-tight">
                Raciocínio da IA
              </span>
            </div>
            <p className="text-[11px] text-muted-foreground leading-relaxed italic">
              "{aiRecommendation}"
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
