import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Switch } from "@/components/ui/switch";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Skeleton } from "@/components/ui/skeleton";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { useAutomationRules, useAutomationLogs, useToggleAutomationRule } from "@/hooks/automation/useAutomationRules";
import { formatDistanceToNow } from "date-fns";
import { ptBR } from "date-fns/locale";
import { Activity, AlertCircle, CheckCircle2, Clock, Zap } from "lucide-react";

export function AutomationRulesPanel() {
  const [selectedRule, setSelectedRule] = useState<string | undefined>();
  const { data: rules, isLoading: rulesLoading } = useAutomationRules();
  const { data: logs, isLoading: logsLoading } = useAutomationLogs(selectedRule, 50);
  const toggle = useToggleAutomationRule();

  const statusVariant = (s: string) =>
    s === "success" ? "default" : s === "failed" ? "destructive" : "secondary";

  const statusIcon = (s: string) =>
    s === "success" ? (
      <CheckCircle2 className="h-3.5 w-3.5" />
    ) : s === "failed" ? (
      <AlertCircle className="h-3.5 w-3.5" />
    ) : (
      <Clock className="h-3.5 w-3.5" />
    );

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Zap className="h-5 w-5 text-primary" />
          Regras de Automação
        </CardTitle>
      </CardHeader>
      <CardContent>
        <Tabs defaultValue="rules">
          <TabsList>
            <TabsTrigger value="rules">Regras ({rules?.length ?? 0})</TabsTrigger>
            <TabsTrigger value="logs">
              <Activity className="h-3.5 w-3.5 mr-1" />
              Logs de Execução
            </TabsTrigger>
          </TabsList>

          <TabsContent value="rules" className="mt-4">
            {rulesLoading ? (
              <div className="space-y-2">
                {[1, 2, 3].map((i) => (
                  <Skeleton key={i} className="h-16 w-full" />
                ))}
              </div>
            ) : !rules?.length ? (
              <p className="text-sm text-muted-foreground text-center py-8">
                Nenhuma regra de automação configurada.
              </p>
            ) : (
              <ScrollArea className="h-[400px] pr-4">
                <div className="space-y-2">
                  {rules.map((rule) => (
                    <div
                      key={rule.id}
                      className="flex items-center justify-between p-3 rounded-lg border bg-card hover:bg-accent/30 transition-colors cursor-pointer"
                      onClick={() => setSelectedRule(rule.id)}
                    >
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1">
                          <span className="font-medium truncate">{rule.name}</span>
                          <Badge variant="outline" className="text-xs">
                            {rule.trigger_type}
                          </Badge>
                        </div>
                        {rule.description && (
                          <p className="text-xs text-muted-foreground truncate">
                            {rule.description}
                          </p>
                        )}
                        <div className="flex items-center gap-3 mt-1 text-xs text-muted-foreground">
                          <span>Execuções: {rule.run_count}</span>
                          {rule.last_run_at && (
                            <span>
                              Última:{" "}
                              {formatDistanceToNow(new Date(rule.last_run_at), {
                                addSuffix: true,
                                locale: ptBR,
                              })}
                            </span>
                          )}
                        </div>
                      </div>
                      <Switch
                        checked={rule.is_active}
                        disabled={toggle.isPending}
                        onClick={(e) => e.stopPropagation()}
                        onCheckedChange={(checked) =>
                          toggle.mutate({ id: rule.id, active: checked })
                        }
                      />
                    </div>
                  ))}
                </div>
              </ScrollArea>
            )}
          </TabsContent>

          <TabsContent value="logs" className="mt-4">
            {selectedRule && (
              <div className="mb-3 flex items-center gap-2 text-xs">
                <Badge variant="secondary">Filtrado por regra</Badge>
                <button
                  className="text-primary hover:underline"
                  onClick={() => setSelectedRule(undefined)}
                >
                  Limpar filtro
                </button>
              </div>
            )}
            {logsLoading ? (
              <div className="space-y-2">
                {[1, 2, 3].map((i) => (
                  <Skeleton key={i} className="h-12 w-full" />
                ))}
              </div>
            ) : !logs?.length ? (
              <p className="text-sm text-muted-foreground text-center py-8">
                Nenhuma execução registrada.
              </p>
            ) : (
              <ScrollArea className="h-[400px] pr-4">
                <div className="space-y-2">
                  {logs.map((log) => (
                    <div
                      key={log.id}
                      className="flex items-center justify-between p-3 rounded-lg border bg-card text-sm"
                    >
                      <div className="flex items-center gap-3 min-w-0">
                        <Badge
                          variant={statusVariant(log.status)}
                          className="gap-1"
                        >
                          {statusIcon(log.status)}
                          {log.status}
                        </Badge>
                        <div className="min-w-0">
                          <div className="text-xs text-muted-foreground">
                            {formatDistanceToNow(new Date(log.started_at), {
                              addSuffix: true,
                              locale: ptBR,
                            })}
                          </div>
                          {log.error_message && (
                            <div className="text-xs text-destructive truncate max-w-md">
                              {log.error_message}
                            </div>
                          )}
                        </div>
                      </div>
                      {log.duration_ms != null && (
                        <span className="text-xs text-muted-foreground tabular-nums">
                          {log.duration_ms}ms
                        </span>
                      )}
                    </div>
                  ))}
                </div>
              </ScrollArea>
            )}
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
}
