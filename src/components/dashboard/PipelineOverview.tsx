import React, { FC } from 'react';
import { Card } from '@/components/ui/card';

interface PipelineOverviewProps {
  pipelineId?: string;
  showValue?: boolean;
}

const PipelineOverviewBase: FC<PipelineOverviewProps> = ({ 
  pipelineId,
  showValue = true
}) => {
  return (
    <Card className="p-6">
      <h3 className="text-lg font-semibold mb-4">Visão Geral do Pipeline</h3>
      {pipelineId && <p className="text-sm">Pipeline: {pipelineId}</p>}
      {showValue && <p className="text-xs mt-2">Exibindo valores</p>}
    </Card>
  );
};

export const PipelineOverview = React.memo(PipelineOverviewBase);
