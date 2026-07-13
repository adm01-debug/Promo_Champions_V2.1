import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Bell, PlayCircle } from "lucide-react";
import { toast } from "sonner";

interface AlertResult {
  ok: boolean;
  alerted: boolean;
  total: number;
  threshold?: number;
  window_hours?: number;
  reason?: string;
  request_id?: string;
}

export function EdgeRetryThresholdCard() {
  const [running, setRunning] = useState(false);
  const [last, setLast] = useState<AlertResult | null>(null);

  const runNow = async () => {
    setRunning(true);
    try {
      const { data, error } = await supabase.functions.invoke("edge-retry-threshold-alert", {
        body: {},
      });
      if (error) throw error;
      const result = data as AlertResult;
      setLast(result);
      if (result.alerted) {
        toast.success(`Alerta disparado (${result.total} exauridos > ${result.threshold})`);
      } else if (result.reason === "circuit_open") {
        toast.warning("Circuit breaker do Slack aberto — alerta suprimido");
      } else if (result.reason?.startsWith("retry_exhausted")) {
        toast.error(`Slack indisponível: ${result.reason}`);
      } else {
        toast.info(
          `Sem alerta: ${result.total} exauridos (threshold ${result.threshold ?? "?"})`,
        );
      }
    } catch (e) {
      toast.error(`Falha ao executar: ${(e as Error).message}`);
    } finally {
      setRunning(false);
    }
  };

  return (
    <Card className="border-border/40">
      <CardHeader className="flex flex-row items-center justify-between gap-4 space-y-0">
        <div className="flex items-center gap-2">
          <Bell className="h-4 w-4 text-primary" aria-hidden />
          <CardTitle className="text-base">Alerta de threshold (retries exauridos)</CardTitle>
          {last?.alerted && <Badge variant="destructive">Último: disparou</Badge>}
          {last && !last.alerted && !last.reason && (
            <Badge variant="secondary">Último: sem alerta</Badge>
          )}
          {last?.reason === "circuit_open" && <Badge variant="outline">Circuit aberto</Badge>}
        </div>
        <Button size="sm" onClick={runNow} disabled={running} aria-label="Executar verificação agora">
          <PlayCircle className={`h-3.5 w-3.5 mr-2 ${running ? "animate-pulse" : ""}`} />
          Verificar agora
        </Button>
      </CardHeader>
      <CardContent className="space-y-2 text-xs">
        <p className="text-muted-foreground">
          Consulta <code className="font-mono">edge_retry_events</code> e dispara Slack quando
          o total de exauridos ultrapassa o threshold configurado.
        </p>
        <ul className="text-muted-foreground space-y-1 list-disc list-inside">
          <li>
            Threshold: variável <code className="font-mono">EDGE_RETRY_EXHAUSTED_THRESHOLD</code>{" "}
            (default 10)
          </li>
          <li>
            Janela: <code className="font-mono">EDGE_RETRY_ALERT_WINDOW_HOURS</code> (default 24h)
          </li>
          <li>
            Slack webhook: <code className="font-mono">SLACK_WEBHOOK_URL</code>
          </li>
        </ul>
        {last && (
          <div className="rounded-md border border-border/40 bg-card/40 p-2 mt-2">
            <p className="text-foreground font-medium mb-1">Última execução</p>
            <p className="text-muted-foreground">
              Total exauridos: <span className="font-mono">{last.total}</span>
              {last.threshold != null && (
                <> · Threshold: <span className="font-mono">{last.threshold}</span></>
              )}
              {last.window_hours != null && (
                <> · Janela: <span className="font-mono">{last.window_hours}h</span></>
              )}
            </p>
            {last.reason && (
              <p className="text-muted-foreground">
                Motivo: <span className="font-mono">{last.reason}</span>
              </p>
            )}
            {last.request_id && (
              <p className="text-muted-foreground font-mono text-[10px] mt-1">
                req: {last.request_id}
              </p>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
