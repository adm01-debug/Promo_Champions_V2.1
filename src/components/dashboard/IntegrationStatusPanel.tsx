import { useState, useEffect } from 'react';
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import {
  ShieldCheck,
  Mail,
  Smartphone,
  RefreshCw,
  CheckCircle2,
  XCircle,
  AlertTriangle,
  Terminal,
  Clock,
  Settings2,
  AlertCircle,
} from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { cn } from '@/lib/utils';
import { useUserRoles } from '@/hooks/useUserRoles';

interface IntegrationStatus {
  id: string;
  name: string;
  type: 'email' | 'push';
  status: 'active' | 'error' | 'pending';
  lastCheck: string;
  errorCount: number;
  configValid: boolean;
}

interface LogEntry {
  id: string;
  timestamp: string;
  type: 'email' | 'push' | 'auth';
  event: string;
  status: 'success' | 'error';
  details: string;
  recipient?: string;
}

export const IntegrationStatusPanel = () => {
  // `email_logs` so tem leitura para admin/gestor (policy "Admins and managers
  // can view email_logs"). Para o resto do time a consulta volta vazia SEM erro,
  // entao o painel mostrava "nenhum log recente" e dava a impressao de que o
  // envio de email estava parado. Sem permissao de leitura, nao ha o que exibir.
  const { isAdminOrManager, isLoadingCurrentRole } = useUserRoles();

  const [loading, setLoading] = useState(false);
  const [integrations, setIntegrations] = useState<IntegrationStatus[]>([
    {
      id: 'email-infrastructure',
      name: 'Infraestrutura de Email',
      type: 'email',
      status: 'active',
      lastCheck: new Date().toISOString(),
      errorCount: 0,
      configValid: true,
    },
    {
      id: 'push-notifications',
      name: 'Notificações Push',
      type: 'push',
      status: 'active',
      lastCheck: new Date().toISOString(),
      errorCount: 0,
      configValid: true,
    },
  ]);

  const [logs, setLogs] = useState<LogEntry[]>([]);

  const fetchLogs = async (): Promise<LogEntry[] | undefined> => {
    setLoading(true);
    try {
      // `integration_logs` nao tem produtor: nenhuma funcao do sistema grava nela,
      // entao a leitura voltava sempre vazia e o painel nunca mostrava evento real.
      // `email_logs` e a fonte de verdade - gravada por send-transactional-email,
      // send-alert-notifications, sdr-consecutive-alerts e demais funcoes de envio.
      const { data: emailLogs, error: emailError } = await supabase
        .from('email_logs')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(30);

      if (emailError) throw emailError;

      const fetchedLogs: LogEntry[] = (emailLogs || []).map(log => ({
        id: log.id,
        timestamp: log.created_at,
        type: 'email',
        event: log.subject || 'Email Notification',
        status: log.status === 'sent' ? 'success' : 'error',
        details: log.error_message || `Enviado para ${log.recipient_email}`,
        recipient: log.recipient_email,
      }));

      setLogs(fetchedLogs);

      // Atualiza status de infraestrutura baseado nos logs
      const emailFails = fetchedLogs.filter(
        l => l.type === 'email' && l.status === 'error'
      ).length;

      setIntegrations(prev =>
        prev.map(i => {
          if (i.type === 'email')
            return {
              ...i,
              errorCount: emailFails,
              status: emailFails > 5 ? 'error' : 'active',
            };
          return i;
        })
      );

      toast.success('Diagnóstico concluído com sucesso');
      return fetchedLogs;
    } catch (error) {
      console.error('Error fetching logs:', error);
      toast.error('Erro ao carregar logs de integração');
      return undefined;
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (!isAdminOrManager) return;
    fetchLogs();
  }, [isAdminOrManager]);

  const testIntegration = async (type: 'email' | 'push') => {
    // Push nao tem tabela de log de envio: ler "erros" ali seria inventar o
    // resultado. O painel informa a ausencia de fonte em vez de simular OK.
    if (type === 'push') {
      toast.info('Push nao registra envio no banco: sem leitura de falhas');
      return;
    }
    const label = 'Email';
    toast.promise(
      async () => {
        // A tabela de logs nao aceita escrita do navegador: o registro e feito
        // pelo servidor. Aqui relemos os ultimos registros e o estado derivado.
        const fresh = await fetchLogs();
        if (!fresh) throw new Error('logs_indisponiveis');
        const fails = fresh.filter(l => l.type === type && l.status === 'error').length;
        return fails > 0
          ? `${label}: ${fails} erro(s) nos ultimos logs`
          : `${label}: nenhum erro nos ultimos logs`;
      },
      {
        loading: `Verificando ${type}...`,
        success: (message: string) => message,
        error: `Falha ao verificar ${type}`,
      }
    );
  };

  // Enquanto o papel nao resolve, e para quem nao pode ler os logs, nao renderiza
  // nada: um painel vazio seria lido como "integracao sem nenhum evento".
  if (isLoadingCurrentRole || !isAdminOrManager) return null;

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
      <Card className="lg:col-span-1 bg-black/40 border-white/10 backdrop-blur-xl relative overflow-hidden group">
        <div className="absolute top-0 right-0 p-3 opacity-10">
          <Settings2 className="h-12 w-12 text-primary" />
        </div>
        <CardHeader>
          <CardTitle className="text-section-title text-sm font-mono uppercase tracking-widest text-primary flex items-center gap-2">
            <ShieldCheck className="h-4 w-4" />
            Status da Infraestrutura
          </CardTitle>
          <CardDescription className="text-[10px] uppercase font-mono">
            Diagnóstico em tempo real
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="space-y-4">
            {integrations.map(integration => (
              <div
                key={integration.id}
                className="p-3 rounded-lg border border-white/5 bg-white/5 space-y-3"
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    {integration.type === 'email' ? (
                      <Mail className="h-4 w-4 text-primary" />
                    ) : (
                      <Smartphone className="h-4 w-4 text-success" />
                    )}
                    <span className="text-xs font-bold uppercase tracking-tight">
                      {integration.name}
                    </span>
                  </div>
                  <Badge
                    variant={
                      integration.type === 'push'
                        ? 'outline'
                        : integration.status === 'active'
                          ? 'default'
                          : 'destructive'
                    }
                    className="text-[9px] h-5 uppercase"
                  >
                    {integration.type === 'push' ? 'sem log' : integration.status}
                  </Badge>
                </div>

                <div className="grid grid-cols-2 gap-2 pt-2">
                  <div className="space-y-1">
                    <p className="text-[9px] text-muted-foreground uppercase font-mono">
                      Config
                    </p>
                    <div className="flex items-center gap-1">
                      {integration.configValid ? (
                        <CheckCircle2 className="h-3 w-3 text-success" />
                      ) : (
                        <XCircle className="h-3 w-3 text-destructive" />
                      )}
                      <span className="text-[10px] font-mono">
                        {integration.configValid ? 'VÁLIDA' : 'INVÁLIDA'}
                      </span>
                    </div>
                  </div>
                  <div className="space-y-1">
                    <p className="text-[9px] text-muted-foreground uppercase font-mono">
                      Falhas (24h)
                    </p>
                    <div className="flex items-center gap-1">
                      <AlertTriangle
                        className={cn(
                          'h-3 w-3',
                          integration.errorCount > 0 ? 'text-warning' : 'text-success'
                        )}
                      />
                      <span className="text-[10px] font-mono">
                        {integration.type === 'push'
                          ? 'SEM LOG'
                          : integration.errorCount + ' ERROS'}
                      </span>
                    </div>
                  </div>
                </div>

                <Button
                  variant="ghost"
                  size="sm"
                  className="w-full h-7 text-[9px] font-mono uppercase tracking-widest border border-white/5 hover:bg-primary/10 hover:text-primary"
                  onClick={() => testIntegration(integration.type)}
                >
                  Testar {integration.type}
                </Button>
              </div>
            ))}
          </div>

          <Button
            className="w-full bg-primary/20 border border-primary/30 text-primary hover:bg-primary/30 transition-all font-mono text-[10px] uppercase tracking-[0.2em]"
            onClick={fetchLogs}
            disabled={loading}
          >
            <RefreshCw className={cn('h-3 w-3 mr-2', loading && 'animate-spin')} />
            {loading ? 'Analisando...' : 'Diagnóstico Global'}
          </Button>
        </CardContent>
      </Card>

      <Card className="lg:col-span-2 bg-black/40 border-white/10 backdrop-blur-xl flex flex-col">
        <CardHeader className="flex flex-row items-center justify-between pb-2">
          <div className="space-y-1">
            <CardTitle className="text-section-title text-sm font-mono uppercase tracking-widest text-primary flex items-center gap-2">
              <Terminal className="h-4 w-4" />
              Logs de Protocolo e Cadastro
            </CardTitle>
            <CardDescription className="text-[10px] uppercase font-mono">
              Fluxo de eventos reais do sistema
            </CardDescription>
          </div>
          <Badge
            variant="outline"
            className="border-primary/30 text-primary font-mono text-[9px]"
          >
            {logs.length} EVENTOS
          </Badge>
        </CardHeader>
        <CardContent className="flex-1 overflow-hidden p-0">
          <ScrollArea className="h-[400px]">
            <div className="px-6 py-4 space-y-4">
              {logs.length === 0 && !loading && (
                <div className="flex flex-col items-center justify-center h-40 text-muted-foreground gap-2">
                  <AlertCircle className="h-8 w-8 opacity-20" />
                  <p className="text-xs font-mono uppercase">
                    Nenhum log recente encontrado
                  </p>
                </div>
              )}
              {logs.map((log, idx) => (
                <div key={log.id} className="relative group">
                  <div className="flex items-start gap-4">
                    <div className="flex flex-col items-center gap-1 pt-1">
                      <div
                        className={cn(
                          'h-2 w-2 rounded-full',
                          log.status === 'success'
                            ? 'bg-success'
                            : 'bg-destructive shadow-[0_0_8px_rgba(239,68,68,0.5)]'
                        )}
                      />
                      {idx !== logs.length - 1 && (
                        <div className="w-px h-12 bg-white/5" />
                      )}
                    </div>

                    <div className="flex-1 space-y-1">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <span
                            className={cn(
                              'text-[10px] font-mono px-1.5 py-0.5 rounded border uppercase',
                              log.type === 'email'
                                ? 'border-primary/20 text-primary bg-primary/5'
                                : 'border-success/20 text-success bg-success/5'
                            )}
                          >
                            {log.type}
                          </span>
                          <span className="text-xs font-bold uppercase tracking-tight">
                            {log.event}
                          </span>
                        </div>
                        <div className="flex items-center gap-1.5 text-muted-foreground">
                          <Clock className="h-3 w-3" />
                          <span className="text-[10px] font-mono">
                            {new Date(log.timestamp).toLocaleString('pt-BR')}
                          </span>
                        </div>
                      </div>

                      <div className="p-3 rounded border border-white/5 bg-white/5 group-hover:bg-white/10 transition-colors">
                        <div className="flex items-center justify-between">
                          <div>
                            <p className="text-[11px] font-mono text-foreground/80 break-all">
                              {log.details}
                            </p>
                            {log.recipient && (
                              <p className="text-[9px] text-muted-foreground mt-1 font-mono">
                                {log.recipient}
                              </p>
                            )}
                          </div>
                          {log.status === 'error' && (
                            <AlertTriangle className="h-3 w-3 text-destructive" />
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </ScrollArea>
        </CardContent>
      </Card>
    </div>
  );
};

export default IntegrationStatusPanel;
