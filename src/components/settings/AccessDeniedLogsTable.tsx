import React from "react";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { ShieldX, AlertTriangle, Clock, User, Globe } from "lucide-react";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";

interface AccessDeniedLog {
  id: string;
  user_id: string;
  user_email: string | null;
  attempted_path: string;
  user_role: string | null;
  required_role: string | null;
  user_agent: string | null;
  created_at: string;
}

interface AccessDeniedLogsTableProps {
  logs: AccessDeniedLog[];
}

const getBrowserInfo = (userAgent: string | null) => {
  if (!userAgent) return "Desconhecido";
  if (userAgent.includes("Chrome")) return "Chrome";
  if (userAgent.includes("Firefox")) return "Firefox";
  if (userAgent.includes("Safari")) return "Safari";
  if (userAgent.includes("Edge")) return "Edge";
  return "Outro";
};

export const AccessDeniedLogsTable = React.memo(function AccessDeniedLogsTable({ logs }: AccessDeniedLogsTableProps) {
  if (logs.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-12 text-center">
        <div className="w-16 h-16 rounded-full bg-success/10 flex items-center justify-center mb-4">
          <ShieldX className="h-8 w-8 text-success" />
        </div>
        <h3 className="font-semibold text-lg mb-2">Nenhuma tentativa registrada</h3>
        <p className="text-muted-foreground">Não há registros de tentativas de acesso negado.</p>
      </div>
    );
  }

  return (
    <div className="rounded-lg border overflow-hidden">
      <Table>
        <TableHeader>
          <TableRow className="bg-muted/30">
            <TableHead className="w-[180px]"><div className="flex items-center gap-2"><Clock className="h-4 w-4" />Data/Hora</div></TableHead>
            <TableHead><div className="flex items-center gap-2"><User className="h-4 w-4" />Usuário</div></TableHead>
            <TableHead>Caminho Tentado</TableHead>
            <TableHead>Role Atual</TableHead>
            <TableHead>Role Necessária</TableHead>
            <TableHead><div className="flex items-center gap-2"><Globe className="h-4 w-4" />Navegador</div></TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {logs.map((log) => (
            <TableRow key={log.id} className="hover:bg-muted/20">
              <TableCell className="font-mono text-xs">{format(new Date(log.created_at), "dd/MM/yyyy HH:mm:ss", { locale: ptBR })}</TableCell>
              <TableCell>
                <div className="flex flex-col">
                  <span className="font-medium text-sm truncate max-w-[200px]">{log.user_email || "Email não disponível"}</span>
                  <span className="text-xs text-muted-foreground truncate max-w-[200px]">{log.user_id}</span>
                </div>
              </TableCell>
              <TableCell><Badge variant="outline" className="font-mono">{log.attempted_path}</Badge></TableCell>
              <TableCell><Badge variant="secondary">{log.user_role || "N/A"}</Badge></TableCell>
              <TableCell>
                <Badge className="bg-warning/20 text-warning border-warning/30">
                  <AlertTriangle className="h-3 w-3 mr-1" />{log.required_role || "N/A"}
                </Badge>
              </TableCell>
              <TableCell className="text-sm text-muted-foreground">{getBrowserInfo(log.user_agent)}</TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
});
