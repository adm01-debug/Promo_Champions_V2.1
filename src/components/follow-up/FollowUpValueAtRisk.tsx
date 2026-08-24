import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { TrendingDown, Target } from 'lucide-react';
import { motion } from 'framer-motion';
import type { ColdLead } from './types';

interface FollowUpValueAtRiskProps {
  leads: ColdLead[];
  onSelectCritical: () => void;
}

export function FollowUpValueAtRisk({ leads, onSelectCritical }: FollowUpValueAtRiskProps) {
  const statusProbabilities: Record<string, number> = {
    lead: 0.1,
    qualified: 0.3,
    proposal: 0.5,
    negotiation: 0.8,
    open: 0.1,
  };

  const totalValue = leads.reduce((sum, l) => sum + (l.amount || 0), 0);
  const weightedValue = leads.reduce((sum, l) => {
    // Usar a probabilidade calibrada se disponível, caso contrário usar a média por status
    const prob = l.probability !== undefined ? l.probability : (statusProbabilities[l.status] || 0.1);
    return sum + ((l.amount || 0) * prob);
  }, 0);
  
  const criticalCount = leads.filter(l => l.temperature === 'cold' || l.temperature === 'frozen').length;

  if (totalValue === 0) return null;

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.98 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ delay: 0.2 }}
    >
      <Card className="border-destructive/30 bg-destructive/5">
        <CardContent className="p-4 flex flex-col sm:flex-row items-start sm:items-center gap-4">
          <div className="p-3 rounded-xl bg-destructive/15">
            <TrendingDown className="h-6 w-6 text-destructive" />
          </div>
          <div className="flex-1">
            <div className="text-sm text-muted-foreground">Valor em Risco (leads esfriando)</div>
            <div className="text-2xl font-bold text-destructive">
              R$ {weightedValue.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
              <span className="text-sm font-normal text-muted-foreground ml-2">
                (Total: R$ {totalValue.toLocaleString('pt-BR')})
              </span>
            </div>
            <div className="text-xs text-muted-foreground mt-0.5">
              {criticalCount} lead(s) em estado crítico (frio/congelado)
            </div>
          </div>
          {criticalCount > 0 && (
            <Button variant="destructive" size="sm" onClick={onSelectCritical} className="shrink-0">
              <Target className="h-4 w-4 mr-2" />
              Selecionar {criticalCount} Críticos
            </Button>
          )}
        </CardContent>
      </Card>
    </motion.div>
  );
}
