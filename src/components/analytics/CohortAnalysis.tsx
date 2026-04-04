import { FC, useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { Users } from 'lucide-react';
import { format, startOfMonth, subMonths, differenceInMonths } from 'date-fns';
import { ptBR } from 'date-fns/locale';

interface CohortData {
  cohort: string;
  totalClients: number;
  retention: number[]; // percentage retained per month after cohort
}

export const CohortAnalysis: FC = () => {
  const [months, setMonths] = useState('6');
  const numMonths = parseInt(months);

  const { data: cohorts, isLoading } = useQuery<CohortData[]>({
    queryKey: ['cohort-analysis', numMonths],
    queryFn: async () => {
      const now = new Date();
      const startDate = subMonths(startOfMonth(now), numMonths - 1);

      // Fetch all clients created in the window
      const { data: clients, error: clientErr } = await supabase
        .from('clients')
        .select('id, created_at')
        .gte('created_at', startDate.toISOString())
        .order('created_at', { ascending: true });

      if (clientErr) throw clientErr;

      // Fetch all sales to check repeat activity
      const { data: sales, error: salesErr } = await supabase
        .from('sales')
        .select('client_name, created_at')
        .gte('created_at', startDate.toISOString());

      if (salesErr) throw salesErr;

      // Also fetch client names for mapping
      const allClientIds = (clients || []).map(c => c.id);
      const { data: clientNames } = await supabase
        .from('clients')
        .select('id, name')
        .in('id', allClientIds.length > 0 ? allClientIds : ['none']);

      const nameToId = new Map(clientNames?.map(c => [c.name, c.id]) || []);

      // Build cohorts by month of client creation
      const cohortMap = new Map<string, Set<string>>();
      
      (clients || []).forEach(client => {
        const cohortKey = format(new Date(client.created_at), 'yyyy-MM');
        if (!cohortMap.has(cohortKey)) cohortMap.set(cohortKey, new Set());
        cohortMap.get(cohortKey)!.add(client.id);
      });

      // Build activity map: which months each client had sales
      const clientActivityMonths = new Map<string, Set<string>>();
      
      (sales || []).forEach(sale => {
        const clientId = nameToId.get(sale.client_name);
        if (!clientId) return;
        const monthKey = format(new Date(sale.created_at), 'yyyy-MM');
        if (!clientActivityMonths.has(clientId)) clientActivityMonths.set(clientId, new Set());
        clientActivityMonths.get(clientId)!.add(monthKey);
      });

      // Calculate retention for each cohort
      const result: CohortData[] = [];
      const sortedCohorts = [...cohortMap.keys()].sort();

      for (const cohortKey of sortedCohorts) {
        const clientIds = cohortMap.get(cohortKey)!;
        const cohortDate = new Date(cohortKey + '-01');
        const totalClients = clientIds.size;
        const maxPeriods = Math.min(differenceInMonths(now, cohortDate), numMonths);
        const retention: number[] = [];

        for (let i = 0; i <= maxPeriods; i++) {
          
          const targetMonth = format(new Date(cohortDate.getFullYear(), cohortDate.getMonth() + i, 1), 'yyyy-MM');
          
          let activeCount = 0;
          clientIds.forEach(id => {
            const months = clientActivityMonths.get(id);
            if (months?.has(targetMonth)) activeCount++;
          });

          retention.push(totalClients > 0 ? Math.round((activeCount / totalClients) * 100) : 0);
        }

        result.push({
          cohort: format(cohortDate, 'MMM yyyy', { locale: ptBR }),
          totalClients,
          retention,
        });
      }

      return result;
    },
    staleTime: 1000 * 60 * 10,
  });

  const getColor = (value: number) => {
    if (value >= 80) return 'bg-emerald-500/80 text-white';
    if (value >= 60) return 'bg-emerald-500/50 text-foreground';
    if (value >= 40) return 'bg-amber-500/50 text-foreground';
    if (value >= 20) return 'bg-amber-500/30 text-foreground';
    if (value > 0) return 'bg-destructive/20 text-foreground';
    return 'bg-muted/30 text-muted-foreground';
  };

  return (
    <Card className="glass border-border/50">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="text-lg flex items-center gap-2">
            <Users className="h-5 w-5 text-primary" />
            Análise de Cohort — Retenção de Clientes
          </CardTitle>
          <Select value={months} onValueChange={setMonths}>
            <SelectTrigger className="w-[130px] h-8 text-xs">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="3">3 meses</SelectItem>
              <SelectItem value="6">6 meses</SelectItem>
              <SelectItem value="12">12 meses</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <p className="text-xs text-muted-foreground">
          Percentual de clientes que realizaram compras em cada mês após a aquisição
        </p>
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <div className="animate-pulse space-y-2">
            {[1, 2, 3, 4].map(i => (
              <div key={i} className="h-8 bg-muted rounded" />
            ))}
          </div>
        ) : !cohorts?.length ? (
          <div className="text-center py-8 text-muted-foreground text-sm">
            Dados insuficientes para análise de cohort
          </div>
        ) : (
          <div className="overflow-x-auto">
            <TooltipProvider>
              <table className="w-full text-xs">
                <thead>
                  <tr>
                    <th className="text-left px-2 py-1.5 font-medium text-muted-foreground">Cohort</th>
                    <th className="text-center px-2 py-1.5 font-medium text-muted-foreground">Clientes</th>
                    {Array.from({ length: numMonths + 1 }, (_, i) => (
                      <th key={i} className="text-center px-2 py-1.5 font-medium text-muted-foreground">
                        M{i}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {cohorts.map((cohort) => (
                    <tr key={cohort.cohort}>
                      <td className="px-2 py-1.5 font-medium whitespace-nowrap">{cohort.cohort}</td>
                      <td className="text-center px-2 py-1.5 text-muted-foreground">{cohort.totalClients}</td>
                      {Array.from({ length: numMonths + 1 }, (_, i) => {
                        const val = cohort.retention[i];
                        if (val === undefined) return <td key={i} className="px-1 py-1" />;
                        return (
                          <td key={i} className="px-1 py-1">
                            <Tooltip>
                              <TooltipTrigger asChild>
                                <div className={`rounded px-2 py-1 text-center font-medium ${getColor(val)}`}>
                                  {val}%
                                </div>
                              </TooltipTrigger>
                              <TooltipContent>
                                <p>{cohort.cohort} — Mês {i}: {val}% retidos</p>
                              </TooltipContent>
                            </Tooltip>
                          </td>
                        );
                      })}
                    </tr>
                  ))}
                </tbody>
              </table>
            </TooltipProvider>
          </div>
        )}
      </CardContent>
    </Card>
  );
};
