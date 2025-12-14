import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { 
  Link2, 
  RefreshCw, 
  CheckCircle2, 
  XCircle, 
  AlertTriangle, 
  Building2, 
  FileText, 
  Loader2,
  ExternalLink,
  Clock,
  History,
  ArrowDownToLine,
  ArrowUpFromLine
} from "lucide-react";
import { useBitrix24 } from "@/hooks/useBitrix24";
import { Skeleton } from "@/components/ui/skeleton";
import { format, formatDistanceToNow } from "date-fns";
import { ptBR } from "date-fns/locale";
import { ScrollArea } from "@/components/ui/scroll-area";

export default function Bitrix24() {
  const {
    isLoadingStatus,
    isConnected,
    needsReauth,
    domain,
    authorize,
    isAuthorizing,
    sync,
    isSyncing,
    refreshToken,
    isRefreshing,
    syncLogs,
    isLoadingLogs,
  } = useBitrix24();

  const getConnectionStatus = () => {
    if (isLoadingStatus) {
      return { label: "Verificando...", variant: "secondary" as const, icon: Loader2 };
    }
    if (isConnected) {
      return { label: "Conectado", variant: "default" as const, icon: CheckCircle2 };
    }
    if (needsReauth) {
      return { label: "Token Expirado", variant: "destructive" as const, icon: AlertTriangle };
    }
    return { label: "Desconectado", variant: "outline" as const, icon: XCircle };
  };

  const status = getConnectionStatus();
  const StatusIcon = status.icon;

  const formatSyncType = (type: string) => {
    const labels: Record<string, string> = {
      "sync-all": "Completa",
      "sync-companies-from-bitrix": "Importar Empresas",
      "sync-companies-to-bitrix": "Exportar Empresas",
      "sync-deals-from-bitrix": "Importar Deals",
      "sync-deals-to-bitrix": "Exportar Deals",
    };
    return labels[type] || type;
  };

  const getTotalRecords = (log: typeof syncLogs[0]) => {
    return log.companies_from_bitrix + log.companies_to_bitrix + log.deals_from_bitrix + log.deals_to_bitrix;
  };

  return (
    <div className="space-y-6 p-6 animate-fade-in">
      {/* Header */}
      <div className="flex flex-col gap-2">
        <h1 className="text-3xl font-display font-bold gradient-text">
          Integração Bitrix24
        </h1>
        <p className="text-muted-foreground">
          Configure a sincronização bidirecional com seu CRM Bitrix24
        </p>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        {/* Connection Status Card */}
        <Card className="glass border-border/40">
          <CardHeader>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="h-10 w-10 rounded-lg gradient-primary flex items-center justify-center">
                  <Link2 className="h-5 w-5 text-primary-foreground" />
                </div>
                <div>
                  <CardTitle className="text-lg">Status da Conexão</CardTitle>
                  <CardDescription>
                    {domain ? `Domínio: ${domain}` : "Nenhum domínio configurado"}
                  </CardDescription>
                </div>
              </div>
              <Badge variant={status.variant} className="flex items-center gap-1.5">
                <StatusIcon className={`h-3.5 w-3.5 ${isLoadingStatus ? 'animate-spin' : ''}`} />
                {status.label}
              </Badge>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            {isLoadingStatus ? (
              <div className="space-y-3">
                <Skeleton className="h-10 w-full" />
                <Skeleton className="h-10 w-full" />
              </div>
            ) : (
              <>
                {!isConnected && !needsReauth && (
                  <div className="rounded-lg border border-border/50 bg-muted/30 p-4">
                    <p className="text-sm text-muted-foreground mb-3">
                      Clique no botão abaixo para autorizar a conexão com seu Bitrix24 via OAuth2.
                    </p>
                    <Button 
                      onClick={authorize} 
                      disabled={isAuthorizing}
                      className="w-full"
                    >
                      {isAuthorizing ? (
                        <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                      ) : (
                        <ExternalLink className="h-4 w-4 mr-2" />
                      )}
                      Autorizar Bitrix24
                    </Button>
                  </div>
                )}

                {needsReauth && (
                  <div className="rounded-lg border border-warning/50 bg-warning/10 p-4">
                    <div className="flex items-start gap-3">
                      <AlertTriangle className="h-5 w-5 text-warning flex-shrink-0 mt-0.5" />
                      <div className="flex-1">
                        <p className="text-sm font-medium text-warning">Token Expirado</p>
                        <p className="text-sm text-muted-foreground mt-1">
                          O token de acesso expirou. Tente atualizar ou reautorize a conexão.
                        </p>
                        <div className="flex gap-2 mt-3">
                          <Button 
                            variant="outline" 
                            size="sm"
                            onClick={() => refreshToken()}
                            disabled={isRefreshing}
                          >
                            {isRefreshing ? (
                              <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                            ) : (
                              <RefreshCw className="h-4 w-4 mr-2" />
                            )}
                            Atualizar Token
                          </Button>
                          <Button 
                            size="sm"
                            onClick={authorize}
                            disabled={isAuthorizing}
                          >
                            {isAuthorizing ? (
                              <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                            ) : (
                              <ExternalLink className="h-4 w-4 mr-2" />
                            )}
                            Reautorizar
                          </Button>
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                {isConnected && (
                  <div className="rounded-lg border border-status-success/50 bg-status-success/10 p-4">
                    <div className="flex items-center gap-3">
                      <CheckCircle2 className="h-5 w-5 text-status-success" />
                      <div>
                        <p className="text-sm font-medium text-status-success">Conexão Ativa</p>
                        <p className="text-sm text-muted-foreground">
                          A integração está funcionando corretamente
                        </p>
                      </div>
                    </div>
                  </div>
                )}
              </>
            )}
          </CardContent>
        </Card>

        {/* Sync Card */}
        <Card className="glass border-border/40">
          <CardHeader>
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 rounded-lg bg-secondary/20 flex items-center justify-center">
                <RefreshCw className="h-5 w-5 text-secondary" />
              </div>
              <div>
                <CardTitle className="text-lg">Sincronização Manual</CardTitle>
                <CardDescription>
                  Execute a sincronização sob demanda
                </CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid gap-3">
              <Button 
                onClick={() => sync("sync-all")} 
                disabled={!isConnected || isSyncing}
                className="w-full"
                size="lg"
              >
                {isSyncing ? (
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                ) : (
                  <RefreshCw className="h-4 w-4 mr-2" />
                )}
                Sincronizar Tudo
              </Button>

              <Separator />

              <div className="grid grid-cols-2 gap-2">
                <Button 
                  variant="outline"
                  onClick={() => sync("sync-companies-from-bitrix")} 
                  disabled={!isConnected || isSyncing}
                  size="sm"
                >
                  <ArrowDownToLine className="h-4 w-4 mr-2" />
                  Importar Empresas
                </Button>
                <Button 
                  variant="outline"
                  onClick={() => sync("sync-companies-to-bitrix")} 
                  disabled={!isConnected || isSyncing}
                  size="sm"
                >
                  <ArrowUpFromLine className="h-4 w-4 mr-2" />
                  Exportar Empresas
                </Button>
                <Button 
                  variant="outline"
                  onClick={() => sync("sync-deals-from-bitrix")} 
                  disabled={!isConnected || isSyncing}
                  size="sm"
                >
                  <ArrowDownToLine className="h-4 w-4 mr-2" />
                  Importar Deals
                </Button>
                <Button 
                  variant="outline"
                  onClick={() => sync("sync-deals-to-bitrix")} 
                  disabled={!isConnected || isSyncing}
                  size="sm"
                >
                  <ArrowUpFromLine className="h-4 w-4 mr-2" />
                  Exportar Deals
                </Button>
              </div>
            </div>

            {!isConnected && (
              <p className="text-xs text-muted-foreground text-center">
                Conecte sua conta Bitrix24 para habilitar a sincronização
              </p>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Sync History */}
      <Card className="glass border-border/40">
        <CardHeader>
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-lg bg-accent/20 flex items-center justify-center">
              <History className="h-5 w-5 text-accent" />
            </div>
            <div>
              <CardTitle className="text-lg">Histórico de Sincronizações</CardTitle>
              <CardDescription>
                Últimas 20 sincronizações realizadas
              </CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {isLoadingLogs ? (
            <div className="space-y-3">
              {[...Array(5)].map((_, i) => (
                <Skeleton key={i} className="h-16 w-full" />
              ))}
            </div>
          ) : syncLogs.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              <History className="h-12 w-12 mx-auto mb-3 opacity-50" />
              <p>Nenhuma sincronização realizada ainda</p>
            </div>
          ) : (
            <ScrollArea className="h-[400px] pr-4">
              <div className="space-y-3">
                {syncLogs.map((log) => (
                  <div 
                    key={log.id} 
                    className={`rounded-lg border p-4 transition-colors ${
                      log.status === "success" 
                        ? "border-status-success/30 bg-status-success/5" 
                        : "border-destructive/30 bg-destructive/5"
                    }`}
                  >
                    <div className="flex items-start justify-between gap-4">
                      <div className="flex items-start gap-3">
                        {log.status === "success" ? (
                          <CheckCircle2 className="h-5 w-5 text-status-success flex-shrink-0 mt-0.5" />
                        ) : (
                          <XCircle className="h-5 w-5 text-destructive flex-shrink-0 mt-0.5" />
                        )}
                        <div className="space-y-1">
                          <div className="flex items-center gap-2 flex-wrap">
                            <span className="font-medium">
                              {formatSyncType(log.sync_type)}
                            </span>
                            <Badge variant="outline" className="text-xs">
                              {log.triggered_by === "manual" ? "Manual" : "CRON"}
                            </Badge>
                            {log.status === "success" && (
                              <Badge variant="secondary" className="text-xs">
                                {getTotalRecords(log)} registros
                              </Badge>
                            )}
                          </div>
                          
                          {log.status === "success" ? (
                            <div className="flex flex-wrap gap-x-4 gap-y-1 text-xs text-muted-foreground">
                              {log.companies_from_bitrix > 0 && (
                                <span className="flex items-center gap-1">
                                  <ArrowDownToLine className="h-3 w-3" />
                                  {log.companies_from_bitrix} empresas
                                </span>
                              )}
                              {log.companies_to_bitrix > 0 && (
                                <span className="flex items-center gap-1">
                                  <ArrowUpFromLine className="h-3 w-3" />
                                  {log.companies_to_bitrix} empresas
                                </span>
                              )}
                              {log.deals_from_bitrix > 0 && (
                                <span className="flex items-center gap-1">
                                  <ArrowDownToLine className="h-3 w-3" />
                                  {log.deals_from_bitrix} deals
                                </span>
                              )}
                              {log.deals_to_bitrix > 0 && (
                                <span className="flex items-center gap-1">
                                  <ArrowUpFromLine className="h-3 w-3" />
                                  {log.deals_to_bitrix} deals
                                </span>
                              )}
                            </div>
                          ) : (
                            <p className="text-xs text-destructive">
                              {log.error_message || "Erro desconhecido"}
                            </p>
                          )}
                        </div>
                      </div>
                      
                      <div className="text-right text-xs text-muted-foreground flex-shrink-0">
                        <p>{format(new Date(log.created_at), "dd/MM/yyyy HH:mm", { locale: ptBR })}</p>
                        <p className="flex items-center gap-1 justify-end">
                          <Clock className="h-3 w-3" />
                          {log.duration_ms ? `${(log.duration_ms / 1000).toFixed(1)}s` : "-"}
                        </p>
                        <p className="text-muted-foreground/60">
                          {formatDistanceToNow(new Date(log.created_at), { addSuffix: true, locale: ptBR })}
                        </p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </ScrollArea>
          )}
        </CardContent>
      </Card>

      {/* Info Cards */}
      <div className="grid gap-4 md:grid-cols-3">
        <Card className="glass border-border/40">
          <CardContent className="pt-6">
            <div className="flex items-start gap-4">
              <div className="h-10 w-10 rounded-lg bg-primary/20 flex items-center justify-center">
                <Building2 className="h-5 w-5 text-primary" />
              </div>
              <div>
                <h3 className="font-semibold">Empresas</h3>
                <p className="text-sm text-muted-foreground mt-1">
                  Sincroniza empresas/clientes com dados ICP (capital social, colaboradores, ramo)
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="glass border-border/40">
          <CardContent className="pt-6">
            <div className="flex items-start gap-4">
              <div className="h-10 w-10 rounded-lg bg-secondary/20 flex items-center justify-center">
                <FileText className="h-5 w-5 text-secondary" />
              </div>
              <div>
                <h3 className="font-semibold">Deals/Vendas</h3>
                <p className="text-sm text-muted-foreground mt-1">
                  Sincroniza negócios do funil com mapeamento automático de estágios
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="glass border-border/40">
          <CardContent className="pt-6">
            <div className="flex items-start gap-4">
              <div className="h-10 w-10 rounded-lg bg-accent/20 flex items-center justify-center">
                <Clock className="h-5 w-5 text-accent" />
              </div>
              <div>
                <h3 className="font-semibold">CRON Automático</h3>
                <p className="text-sm text-muted-foreground mt-1">
                  Sincronização bidirecional automática a cada hora
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Stage Mapping Info */}
      <Card className="glass border-border/40">
        <CardHeader>
          <CardTitle className="text-lg">Mapeamento de Estágios</CardTitle>
          <CardDescription>
            Correspondência entre estágios do Bitrix24 e do Pipeline
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid gap-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-6">
            {[
              { bitrix: "NEW", crm: "Lead" },
              { bitrix: "PREPARATION", crm: "Qualificado" },
              { bitrix: "PREPAYMENT_INVOICE", crm: "Proposta" },
              { bitrix: "EXECUTING", crm: "Negociação" },
              { bitrix: "WON", crm: "Fechado" },
              { bitrix: "LOSE", crm: "Perdido" },
            ].map((stage) => (
              <div 
                key={stage.bitrix} 
                className="rounded-lg border border-border/50 bg-muted/30 p-3 text-center"
              >
                <p className="text-xs text-muted-foreground mb-1">{stage.bitrix}</p>
                <p className="font-medium text-sm">→ {stage.crm}</p>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
