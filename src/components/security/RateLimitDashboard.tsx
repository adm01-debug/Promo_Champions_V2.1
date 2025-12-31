import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { Skeleton } from "@/components/ui/skeleton";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useRateLimitSettings, useRateLimitLogs, useRateLimitStats } from "@/hooks/useRateLimit";
import { Shield, Activity, Clock, AlertTriangle, Settings, BarChart3 } from "lucide-react";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";

export function RateLimitDashboard() {
  const { settings, isLoading: loadingSettings, updateSetting, isUpdating } = useRateLimitSettings();
  const { data: stats, isLoading: loadingStats } = useRateLimitStats();
  const [selectedAction, setSelectedAction] = useState<string | undefined>();
  const { data: logs, isLoading: loadingLogs } = useRateLimitLogs({
    action: selectedAction,
    limit: 50,
  });
  const [editingSetting, setEditingSetting] = useState<string | null>(null);
  const [editValues, setEditValues] = useState({
    max_requests: 0,
    window_seconds: 0,
    block_duration_seconds: 0,
  });

  const handleEditSetting = (setting: typeof settings extends (infer T)[] ? T : never) => {
    setEditingSetting(setting.id);
    setEditValues({
      max_requests: setting.max_requests,
      window_seconds: setting.window_seconds,
      block_duration_seconds: setting.block_duration_seconds,
    });
  };

  const handleSaveSetting = () => {
    if (!editingSetting) return;
    updateSetting({
      id: editingSetting,
      ...editValues,
    });
    setEditingSetting(null);
  };

  const formatSeconds = (seconds: number) => {
    if (seconds < 60) return `${seconds}s`;
    if (seconds < 3600) return `${Math.floor(seconds / 60)}min`;
    return `${Math.floor(seconds / 3600)}h`;
  };

  const actionLabels: Record<string, string> = {
    login: "Login",
    signup: "Cadastro",
    password_reset: "Reset Senha",
    api_call: "API",
    export: "Exportação",
  };

  if (loadingSettings || loadingStats) {
    return (
      <div className="space-y-4">
        <Skeleton className="h-32 w-full" />
        <Skeleton className="h-64 w-full" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-blue-500/10">
                <Activity className="h-5 w-5 text-blue-500" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Requisições (1h)</p>
                <p className="text-2xl font-bold">{stats?.hourly.total ?? 0}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-red-500/10">
                <AlertTriangle className="h-5 w-5 text-red-500" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Bloqueados (1h)</p>
                <p className="text-2xl font-bold text-red-500">{stats?.hourly.blocked ?? 0}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-green-500/10">
                <BarChart3 className="h-5 w-5 text-green-500" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Total (24h)</p>
                <p className="text-2xl font-bold">{stats?.daily.total ?? 0}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-orange-500/10">
                <Shield className="h-5 w-5 text-orange-500" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Bloqueados (24h)</p>
                <p className="text-2xl font-bold text-orange-500">{stats?.daily.blocked ?? 0}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Settings Table */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Settings className="h-5 w-5" />
            Configurações de Rate Limit
          </CardTitle>
          <CardDescription>
            Configure limites por tipo de ação
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Ação</TableHead>
                <TableHead>Limite</TableHead>
                <TableHead>Janela</TableHead>
                <TableHead>Bloqueio</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Ações</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {settings?.map((setting) => (
                <TableRow key={setting.id}>
                  <TableCell className="font-medium">
                    {actionLabels[setting.action] || setting.action}
                  </TableCell>
                  <TableCell>{setting.max_requests} req</TableCell>
                  <TableCell>{formatSeconds(setting.window_seconds)}</TableCell>
                  <TableCell>{formatSeconds(setting.block_duration_seconds)}</TableCell>
                  <TableCell>
                    <Badge variant={setting.is_active ? "default" : "secondary"}>
                      {setting.is_active ? "Ativo" : "Inativo"}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <Dialog open={editingSetting === setting.id} onOpenChange={(open) => !open && setEditingSetting(null)}>
                      <DialogTrigger asChild>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleEditSetting(setting)}
                        >
                          Editar
                        </Button>
                      </DialogTrigger>
                      <DialogContent>
                        <DialogHeader>
                          <DialogTitle>Editar Rate Limit: {actionLabels[setting.action] || setting.action}</DialogTitle>
                          <DialogDescription>
                            Configure os limites para esta ação
                          </DialogDescription>
                        </DialogHeader>
                        <div className="space-y-4 py-4">
                          <div className="space-y-2">
                            <Label>Máximo de Requisições</Label>
                            <Input
                              type="number"
                              value={editValues.max_requests}
                              onChange={(e) => setEditValues({ ...editValues, max_requests: parseInt(e.target.value) || 0 })}
                            />
                          </div>
                          <div className="space-y-2">
                            <Label>Janela de Tempo (segundos)</Label>
                            <Input
                              type="number"
                              value={editValues.window_seconds}
                              onChange={(e) => setEditValues({ ...editValues, window_seconds: parseInt(e.target.value) || 0 })}
                            />
                          </div>
                          <div className="space-y-2">
                            <Label>Duração do Bloqueio (segundos)</Label>
                            <Input
                              type="number"
                              value={editValues.block_duration_seconds}
                              onChange={(e) => setEditValues({ ...editValues, block_duration_seconds: parseInt(e.target.value) || 0 })}
                            />
                          </div>
                        </div>
                        <DialogFooter>
                          <Button variant="outline" onClick={() => setEditingSetting(null)}>
                            Cancelar
                          </Button>
                          <Button onClick={handleSaveSetting} disabled={isUpdating}>
                            Salvar
                          </Button>
                        </DialogFooter>
                      </DialogContent>
                    </Dialog>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* Logs */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="flex items-center gap-2">
                <Clock className="h-5 w-5" />
                Logs de Rate Limit
              </CardTitle>
              <CardDescription>Últimas requisições registradas</CardDescription>
            </div>
            <Select value={selectedAction ?? "all"} onValueChange={(v) => setSelectedAction(v === "all" ? undefined : v)}>
              <SelectTrigger className="w-40">
                <SelectValue placeholder="Filtrar ação" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todas</SelectItem>
                {Object.entries(actionLabels).map(([key, label]) => (
                  <SelectItem key={key} value={key}>{label}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </CardHeader>
        <CardContent>
          {loadingLogs ? (
            <Skeleton className="h-48 w-full" />
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Data/Hora</TableHead>
                  <TableHead>Identificador</TableHead>
                  <TableHead>Tipo</TableHead>
                  <TableHead>Ação</TableHead>
                  <TableHead>Status</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {logs?.slice(0, 20).map((log) => (
                  <TableRow key={log.id}>
                    <TableCell className="text-sm text-muted-foreground">
                      {format(new Date(log.created_at), "dd/MM HH:mm:ss", { locale: ptBR })}
                    </TableCell>
                    <TableCell className="font-mono text-xs">{log.identifier.substring(0, 20)}...</TableCell>
                    <TableCell>
                      <Badge variant="outline">{log.identifier_type}</Badge>
                    </TableCell>
                    <TableCell>{actionLabels[log.action] || log.action}</TableCell>
                    <TableCell>
                      <Badge variant={log.blocked ? "destructive" : "default"}>
                        {log.blocked ? "Bloqueado" : "OK"}
                      </Badge>
                    </TableCell>
                  </TableRow>
                ))}
                {(!logs || logs.length === 0) && (
                  <TableRow>
                    <TableCell colSpan={5} className="text-center text-muted-foreground py-8">
                      Nenhum log encontrado
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
