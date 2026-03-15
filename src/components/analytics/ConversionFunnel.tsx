import { FC } from 'react';
import { Card } from '@/components/ui/card';

interface ConversionFunnelProps {
  stages?: string[];
  showPercentages?: boolean;
}

export const ConversionFunnel: FC<ConversionFunnelProps> = ({ 
  stages = ['Lead', 'Qualificado', 'Proposta', 'Negociação', 'Fechado'],
  showPercentages = true
}) => {
  return (
    <Card className="p-6">
      <h3 className="text-lg font-semibold mb-4">Funil de Conversão</h3>
      <div className="space-y-2">
        {stages.map((stage, idx) => (
          <div key={idx} className="text-sm">{stage}</div>
        ))}
      </div>
    </Card>
  );
};
