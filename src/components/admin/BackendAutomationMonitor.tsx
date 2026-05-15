import { useState } from 'react';
import { useMutation } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { toast } from 'sonner';
import {
  Activity,
  Clock,
  Bell,
  Play,
  Loader2,
  CheckCircle2,
  AlertTriangle,
  Shield,
} from 'lucide-react';

interface AutomationJob {
  id: string;
  name: string;
  description: string;
  edgeFunctionName: string;
  icon: React.ReactNode;
  category: 'monitoring' | 'alerts' | 'maintenance';
}

const AUTOMATION_JOBS: AutomationJob[] = [
  {
    id: 'activity-goals',
    name: 'Alertas de Metas de Atividade',
    description: 'Verifica o progresso das metas de atividades e envia alertas para vendedores abaixo do esperado.',
    edgeFunctionName: 'activity-goal-alerts',
    icon: <Activity className="h-4 w-4" />,
    category: 'alerts',
  },
  {
    id: 'lead-sla',
    name: 'Verificação de SLA de Leads',
    description: 'Detecta leads que ultrapassaram o tempo máximo sem contato e notifica os responsáveis.',
    edgeFunctionName: 'check-lead-sla',
    icon: <Clock className="h-4 w-4" />,
    category: 'monitoring',
  },
  {
    id: 'challenge-expiration',
    name: 'Alertas de Expiração de Desafios',
    description: 'Notifica vendedores sobre desafios prestes a expirar.',
    edgeFunctionName: 'challenge-expiration-alerts',
    icon: <Bell className="h-4 w-4" />,
    category: 'alerts',
  },
  {
    id: 'auto-reassign',
    name: 'Reatribuição Automática',
    description: 'Reatribui deals de vendedores inativos para outros membros do time.',
    edgeFunctionName: 'auto-reassign-inactive',
    icon: <Shield className="h-4 w-4" />,
    category: 'maintenance',
  },
];

export function BackendAutomationMonitor() {
  const [results, setResults] = useState<Record<string, { status: 'success' | 'error'; message: string }>>({});

  const runJob = useMutation({
    mutationFn: async (functionName: string) => {
      const { data, error } = await supabase.functions.invoke(functionName, {
        body: {},
      });

      if (error) throw error;
      return data;
    },
    onSuccess: (data, functionName) => {
      setResults(prev => ({
        ...prev,
        [functionName]: { status: 'success', message: JSON.stringify(data).slice(0, 200) },
      }));
      toast.success('Automação executada com sucesso!');
    },
    onError: (error, functionName) => {
      setResults(prev => ({
        ...prev,
        [functionName]: { status: 'error', message: error.message },
      }));
      toast.error('Erro ao executar automação');
    },
  });

  const categoryLabels: Record<string, string> = {
    monitoring: 'Monitoramento',
    alerts: 'Alertas',
    maintenance: 'Manutenção',
  };

  const categoryColors: Record<string, string> = {
    monitoring: 'bg-primary/10 text-primary',
    alerts: 'bg-destructive/10 text-destructive',
    maintenance: 'bg-muted text-muted-foreground',
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-lg">
          <Activity className="h-5 w-5 text-primary" />
          Automações de Backend
        </CardTitle>
        <p className="text-sm text-muted-foreground">
          Execute e monitore as automações do sistema. Estas funções normalmente rodam em background via cron jobs.
        </p>
      </CardHeader>
      <CardContent className="space-y-3">
        {AUTOMATION_JOBS.map((job: AutomationJob) => {
          const result = results[job.edgeFunctionName];
          const isRunning = runJob.isPending && runJob.variables === job.edgeFunctionName;

          return (
            <div
              key={job.id}
              className="flex items-center gap-4 p-4 rounded-lg border bg-card hover:bg-accent/30 transition-colors"
            >
              <div className="p-2 rounded-lg bg-primary/10 text-primary">
                {job.icon}
              </div>

              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-1">
                  <span className="font-medium text-sm">{job.name}</span>
                  <Badge variant="outline" className={`text-xs ${categoryColors[job.category]}`}>
                    {categoryLabels[job.category]}
                  </Badge>
                </div>
                <p className="text-xs text-muted-foreground">{job.description}</p>

                {result && (
                  <div className="flex items-center gap-1.5 mt-2">
                    {result.status === 'success' ? (
                      <CheckCircle2 className="h-3.5 w-3.5 text-success" />
                    ) : (
                      <AlertTriangle className="h-3.5 w-3.5 text-destructive" />
                    )}
                    <span className="text-xs text-muted-foreground truncate max-w-[300px]">
                      {result.message}
                    </span>
                  </div>
                )}
              </div>

              <Button
                variant="outline"
                size="sm"
                disabled={isRunning}
                onClick={() => runJob.mutate(job.edgeFunctionName)}
                className="gap-1.5 shrink-0"
              >
                {isRunning ? (
                  <Loader2 className="h-3.5 w-3.5 animate-spin" />
                ) : (
                  <Play className="h-3.5 w-3.5" />
                )}
                Executar
              </Button>
            </div>
          );
        })}
      </CardContent>
    </Card>
  );
}
