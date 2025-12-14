import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useUserRoles } from "@/hooks/useUserRoles";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { ShieldX, AlertTriangle, Clock, User, Globe, FileWarning } from "lucide-react";
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

export function AccessDeniedLogs() {
  const { isAdmin, isLoadingCurrentRole } = useUserRoles();

  const { data: logs, isLoading } = useQuery({
    queryKey: ["access-denied-logs"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("access_denied_logs")
        .select("*")
        .order("created_at", { ascending: false })
        .limit(100);

      if (error) throw error;
      return data as AccessDeniedLog[];
    },
    enabled: isAdmin,
  });

  if (isLoadingCurrentRole) {
    return (
      <Card>
        <CardHeader>
          <Skeleton className="h-6 w-48" />
          <Skeleton className="h-4 w-64" />
        </CardHeader>
        <CardContent>
          <Skeleton className="h-64 w-full" />
        </CardContent>
      </Card>
    );
  }

  if (!isAdmin) {
    return (
      <Card className="border-destructive/20">
        <CardContent className="flex flex-col items-center justify-center py-12 text-center">
          <div className="w-16 h-16 rounded-full bg-destructive/10 flex items-center justify-center mb-4">
            <ShieldX className="h-8 w-8 text-destructive" />
          </div>
          <h3 className="font-semibold text-lg mb-2">Acesso Restrito</h3>
          <p className="text-muted-foreground max-w-md">
            Apenas administradores podem visualizar os logs de auditoria de segurança.
          </p>
        </CardContent>
      </Card>
    );
  }

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <FileWarning className="h-5 w-5 text-warning" />
            Logs de Acesso Negado
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {[...Array(5)].map((_, i) => (
              <Skeleton key={i} className="h-12 w-full" />
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }

  const getBrowserInfo = (userAgent: string | null) => {
    if (!userAgent) return "Desconhecido";
    if (userAgent.includes("Chrome")) return "Chrome";
    if (userAgent.includes("Firefox")) return "Firefox";
    if (userAgent.includes("Safari")) return "Safari";
    if (userAgent.includes("Edge")) return "Edge";
    return "Outro";
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <FileWarning className="h-5 w-5 text-warning" />
          Logs de Acesso Negado
        </CardTitle>
        <CardDescription>
          Registro de tentativas de acesso a páginas restritas (últimos 100 registros)
        </CardDescription>
      </CardHeader>
      <CardContent>
        {logs && logs.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-12 text-center">
            <div className="w-16 h-16 rounded-full bg-success/10 flex items-center justify-center mb-4">
              <ShieldX className="h-8 w-8 text-success" />
            </div>
            <h3 className="font-semibold text-lg mb-2">Nenhuma tentativa registrada</h3>
            <p className="text-muted-foreground">
              Não há registros de tentativas de acesso negado.
            </p>
          </div>
        ) : (
          <div className="rounded-lg border overflow-hidden">
            <Table>
              <TableHeader>
                <TableRow className="bg-muted/30">
                  <TableHead className="w-[180px]">
                    <div className="flex items-center gap-2">
                      <Clock className="h-4 w-4" />
                      Data/Hora
                    </div>
                  </TableHead>
                  <TableHead>
                    <div className="flex items-center gap-2">
                      <User className="h-4 w-4" />
                      Usuário
                    </div>
                  </TableHead>
                  <TableHead>Caminho Tentado</TableHead>
                  <TableHead>Role Atual</TableHead>
                  <TableHead>Role Necessária</TableHead>
                  <TableHead>
                    <div className="flex items-center gap-2">
                      <Globe className="h-4 w-4" />
                      Navegador
                    </div>
                  </TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {logs?.map((log) => (
                  <TableRow key={log.id} className="hover:bg-muted/20">
                    <TableCell className="font-mono text-xs">
                      {format(new Date(log.created_at), "dd/MM/yyyy HH:mm:ss", { locale: ptBR })}
                    </TableCell>
                    <TableCell>
                      <div className="flex flex-col">
                        <span className="font-medium text-sm truncate max-w-[200px]">
                          {log.user_email || "Email não disponível"}
                        </span>
                        <span className="text-xs text-muted-foreground truncate max-w-[200px]">
                          {log.user_id}
                        </span>
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge variant="outline" className="font-mono">
                        {log.attempted_path}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <Badge variant="secondary">
                        {log.user_role || "N/A"}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <Badge className="bg-warning/20 text-warning border-warning/30">
                        <AlertTriangle className="h-3 w-3 mr-1" />
                        {log.required_role || "N/A"}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-sm text-muted-foreground">
                      {getBrowserInfo(log.user_agent)}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
