import React from "react";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Skeleton } from "@/components/ui/skeleton";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { CheckCircle2, XCircle, History, Clock, ArrowDownToLine, ArrowUpFromLine } from "lucide-react";
import { format, formatDistanceToNow } from "date-fns";
import { ptBR } from "date-fns/locale";

interface SyncLog {
  id: string;
  sync_type: string;
  status: string;
  triggered_by: string | null;
  companies_from_bitrix: number;
  companies_to_bitrix: number;
  deals_from_bitrix: number;
  deals_to_bitrix: number;
  error_message: string | null;
  duration_ms: number | null;
  created_at: string;
}

const SYNC_TYPE_LABELS: Record<string, string> = {
  "sync-all": "Completa",
  "sync-companies-from-bitrix": "Importar Empresas",
  "sync-companies-to-bitrix": "Exportar Empresas",
  "sync-deals-from-bitrix": "Importar Deals",
  "sync-deals-to-bitrix": "Exportar Deals",
};

interface BitrixSyncHistoryProps {
  syncLogs: SyncLog[];
  isLoading: boolean;
}

export const BitrixSyncHistory = React.memo(function BitrixSyncHistory({ syncLogs, isLoading }: BitrixSyncHistoryProps) {
  return (
    <Card className="glass border-border/40">
      <CardHeader>
        <div className="flex items-center gap-3">
          <div className="h-10 w-10 rounded-lg bg-accent/20 flex items-center justify-center"><History className="h-5 w-5 text-accent" /></div>
          <div><CardTitle className="text-lg">Histórico de Sincronizações</CardTitle><CardDescription>Últimas 20 sincronizações realizadas</CardDescription></div>
        </div>
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <div className="space-y-3">{[...Array(5)].map((_, i) => <Skeleton key={i} className="h-16 w-full" />)}</div>
        ) : syncLogs.length === 0 ? (
          <div className="text-center py-8 text-muted-foreground"><History className="h-12 w-12 mx-auto mb-3 opacity-50" /><p>Nenhuma sincronização realizada ainda</p></div>
        ) : (
          <ScrollArea className="h-[400px] pr-4">
            <div className="space-y-3">
              {syncLogs.map((log) => {
                const totalRecords = log.companies_from_bitrix + log.companies_to_bitrix + log.deals_from_bitrix + log.deals_to_bitrix;
                return (
                  <div key={log.id} className={`rounded-lg border p-4 transition-colors ${log.status === "success" ? "border-status-success/30 bg-status-success/5" : "border-destructive/30 bg-destructive/5"}`}>
                    <div className="flex items-start justify-between gap-4">
                      <div className="flex items-start gap-3">
                        {log.status === "success" ? <CheckCircle2 className="h-5 w-5 text-status-success flex-shrink-0 mt-0.5" /> : <XCircle className="h-5 w-5 text-destructive flex-shrink-0 mt-0.5" />}
                        <div className="space-y-1">
                          <div className="flex items-center gap-2 flex-wrap">
                            <span className="font-medium">{SYNC_TYPE_LABELS[log.sync_type] || log.sync_type}</span>
                            <Badge variant="outline" className="text-xs">{log.triggered_by === "manual" ? "Manual" : "CRON"}</Badge>
                            {log.status === "success" && <Badge variant="secondary" className="text-xs">{totalRecords} registros</Badge>}
                          </div>
                          {log.status === "success" ? (
                            <div className="flex flex-wrap gap-x-4 gap-y-1 text-xs text-muted-foreground">
                              {log.companies_from_bitrix > 0 && <span className="flex items-center gap-1"><ArrowDownToLine className="h-3 w-3" />{log.companies_from_bitrix} empresas</span>}
                              {log.companies_to_bitrix > 0 && <span className="flex items-center gap-1"><ArrowUpFromLine className="h-3 w-3" />{log.companies_to_bitrix} empresas</span>}
                              {log.deals_from_bitrix > 0 && <span className="flex items-center gap-1"><ArrowDownToLine className="h-3 w-3" />{log.deals_from_bitrix} deals</span>}
                              {log.deals_to_bitrix > 0 && <span className="flex items-center gap-1"><ArrowUpFromLine className="h-3 w-3" />{log.deals_to_bitrix} deals</span>}
                            </div>
                          ) : (
                            <p className="text-xs text-destructive">{log.error_message || "Erro desconhecido"}</p>
                          )}
                        </div>
                      </div>
                      <div className="text-right text-xs text-muted-foreground flex-shrink-0">
                        <p>{format(new Date(log.created_at), "dd/MM/yyyy HH:mm", { locale: ptBR })}</p>
                        <p className="flex items-center gap-1 justify-end"><Clock className="h-3 w-3" />{log.duration_ms ? `${(log.duration_ms / 1000).toFixed(1)}s` : "-"}</p>
                        <p className="text-muted-foreground/60">{formatDistanceToNow(new Date(log.created_at), { addSuffix: true, locale: ptBR })}</p>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </ScrollArea>
        )}
      </CardContent>
    </Card>
  );
});
