import { PieChart, Info } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip';
import { CategoryPie } from './CategoryPie';
import type { Client360Data } from '@/hooks/crm/useClient360';

export function Client360AffinityCard({ data }: { data: Client360Data }) {
  return (
    <Card className="border-border/40 bg-card/40 backdrop-blur-md shadow-xl rounded-2xl overflow-hidden">
      <CardHeader>
        <CardTitle className="text-section-title flex items-center justify-between uppercase font-black tracking-tighter">
          <div className="flex items-center gap-2">
            <PieChart className="h-5 w-5 text-indigo-500" />
            Mix de Categorias
          </div>
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger>
                <Info className="h-3.5 w-3.5 text-muted-foreground" />
              </TooltipTrigger>
              <TooltipContent>Distribuição das compras por categoria</TooltipContent>
            </Tooltip>
          </TooltipProvider>
        </CardTitle>
      </CardHeader>
      <CardContent className="flex flex-col items-center">
        <CategoryPie data={data.categoryDistribution} />
      </CardContent>
    </Card>
  );
}
