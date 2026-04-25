import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { TestTube2, Trash2, Loader2 } from "lucide-react";
import {
  useIntegrationConnections,
  useIntegrationHealth,
  useTestConnection,
  useUpdateConnection,
  useDeleteConnection,
  type IntegrationConnection,
} from "@/hooks/admin/useIntegrationConnections";
import { useCredentialsSource } from "./CredentialsSourceFilterContext";
import { useMemo } from "react";
import { formatDistanceToNow } from "date-fns";
import { ptBR } from "date-fns/locale";

const KIND_LABEL: Record<IntegrationConnection["kind"], string> = {
  database: "Banco",
  bitrix24: "Bitrix24",
  n8n: "n8n",
  mcp: "MCP",
  webhook: "Webhook",
  other: "Outro",
};

const KIND_COLOR: Record<IntegrationConnection["kind"], string> = {
  database: "bg-chart-1/20 text-chart-1 border-chart-1/30",
  bitrix24: "bg-chart-2/20 text-chart-2 border-chart-2/30",
  n8n: "bg-chart-3/20 text-chart-3 border-chart-3/30",
  mcp: "bg-chart-4/20 text-chart-4 border-chart-4/30",
  webhook: "bg-chart-5/20 text-chart-5 border-chart-5/30",
  other: "bg-muted text-muted-foreground",
};

export function ConnectionsOverviewTable() {
  const { source } = useCredentialsSource();
  const { data: conns = [], isLoading } = useIntegrationConnections();
  const { data: checks = [] } = useIntegrationHealth();
  const test = useTestConnection();
  const update = useUpdateConnection();
  const del = useDeleteConnection();

  const lastByConn = useMemo(() => {
    const m = new Map<string, { status: string; checked_at: string; latency_ms: number | null }>();
    for (const ch of checks) {
      const c = ch as { connection_id: string; status: string; checked_at: string; latency_ms: number | null };
      if (!m.has(c.connection_id)) m.set(c.connection_id, c);
    }
    return m;
  }, [checks]);

  const rows = useMemo(() => {
    if (source === "all") return conns;
    return conns.filter((c) => c.source === source);
  }, [conns, source]);

  return (
    <Card className="glass border-border/40">
      <CardHeader>
        <CardTitle className="font-display text-lg">Conexões</CardTitle>
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <div className="text-sm text-muted-foreground">Carregando…</div>
        ) : rows.length === 0 ? (
          <div className="text-sm text-muted-foreground py-6 text-center">
            Nenhuma conexão cadastrada. Use as abas abaixo para criar a primeira.
          </div>
        ) : (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Tipo</TableHead>
                <TableHead>Rótulo</TableHead>
                <TableHead>Origem</TableHead>
                <TableHead>Último teste</TableHead>
                <TableHead>Latência</TableHead>
                <TableHead>Ativo</TableHead>
                <TableHead className="text-right">Ações</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {rows.map((c) => {
                const last = lastByConn.get(c.id);
                return (
                  <TableRow key={c.id}>
                    <TableCell>
                      <Badge variant="outline" className={KIND_COLOR[c.kind]}>
                        {KIND_LABEL[c.kind]}
                      </Badge>
                    </TableCell>
                    <TableCell className="font-medium">{c.label}</TableCell>
                    <TableCell>
                      <Badge variant="secondary" className="text-xs uppercase">{c.source}</Badge>
                    </TableCell>
                    <TableCell>
                      {last ? (
                        <div className="flex items-center gap-2">
                          <Badge
                            variant={last.status === "success" ? "default" : "destructive"}
                            className="text-xs"
                          >
                            {last.status}
                          </Badge>
                          <span className="text-xs text-muted-foreground">
                            {formatDistanceToNow(new Date(last.checked_at), { addSuffix: true, locale: ptBR })}
                          </span>
                        </div>
                      ) : (
                        <span className="text-xs text-muted-foreground">—</span>
                      )}
                    </TableCell>
                    <TableCell className="text-xs text-muted-foreground">
                      {last?.latency_ms != null ? `${last.latency_ms}ms` : "—"}
                    </TableCell>
                    <TableCell>
                      <Switch
                        checked={c.enabled}
                        onCheckedChange={(checked) => update.mutate({ id: c.id, enabled: checked })}
                      />
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex justify-end gap-1">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => test.mutate(c.id)}
                          disabled={test.isPending}
                        >
                          {test.isPending ? <Loader2 className="h-4 w-4 animate-spin" /> : <TestTube2 className="h-4 w-4" />}
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => {
                            if (confirm(`Remover "${c.label}"?`)) del.mutate(c.id);
                          }}
                        >
                          <Trash2 className="h-4 w-4 text-destructive" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        )}
      </CardContent>
    </Card>
  );
}
