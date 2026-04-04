import { useState } from "react";
import { motion } from "framer-motion";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ScrollArea } from "@/components/ui/scroll-area";
import { useApiTokens } from "@/hooks/useApiTokens";
import { useScoreChangeLogs } from "@/hooks/useScoreChangeLogs";
import { Key, Copy, Eye, EyeOff, Plus, Clock, Activity, FileText, Shield } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import { ApiDocsTab } from "./ApiDocsTab";

export function ApiIntegrationSettings() {
  const { tokens, isLoading, createToken, toggleToken } = useApiTokens();
  const { data: logs = [] } = useScoreChangeLogs();
  const { toast } = useToast();
  const [companyName, setCompanyName] = useState("");
  const [visibleTokens, setVisibleTokens] = useState<Set<string>>(new Set());

  const handleCreate = () => {
    if (!companyName.trim()) {
      toast({ title: "Erro", description: "Nome da companhia é obrigatório", variant: "destructive" });
      return;
    }
    createToken.mutate({ companyName: companyName.trim() });
    setCompanyName("");
  };

  const copyToken = (token: string) => {
    navigator.clipboard.writeText(token);
    toast({ title: "Copiado!", description: "Token copiado para a área de transferência" });
  };

  const toggleVisibility = (id: string) => {
    setVisibleTokens(prev => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id); else next.add(id);
      return next;
    });
  };

  return (
    <div className="space-y-6">
      <Tabs defaultValue="tokens">
        <TabsList>
          <TabsTrigger value="tokens" className="flex items-center gap-2"><Key className="h-4 w-4" />Tokens</TabsTrigger>
          <TabsTrigger value="logs" className="flex items-center gap-2"><Activity className="h-4 w-4" />Logs de Score</TabsTrigger>
          <TabsTrigger value="docs" className="flex items-center gap-2"><FileText className="h-4 w-4" />Documentação</TabsTrigger>
        </TabsList>

        <TabsContent value="tokens" className="mt-4 space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2"><Plus className="h-5 w-5 text-primary" />Gerar Novo Token</CardTitle>
              <CardDescription>Crie tokens para integração com sistemas externos</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex gap-3">
                <div className="flex-1">
                  <Label htmlFor="company-name">Nome da Companhia/Integração</Label>
                  <Input id="company-name" placeholder="Ex: Sistema ERP, Bitrix24..." value={companyName} onChange={(e) => setCompanyName(e.target.value)} />
                </div>
                <div className="flex items-end">
                  <Button onClick={handleCreate} disabled={createToken.isPending}><Key className="h-4 w-4 mr-2" />Gerar Token</Button>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Tokens Ativos</CardTitle>
              <CardDescription>{tokens.length} token(s) registrado(s)</CardDescription>
            </CardHeader>
            <CardContent>
              <ScrollArea className="h-[400px]">
                <div className="space-y-3">
                  {isLoading ? (
                    <p className="text-muted-foreground text-sm">Carregando...</p>
                  ) : tokens.length === 0 ? (
                    <p className="text-muted-foreground text-sm">Nenhum token criado ainda</p>
                  ) : (
                    tokens.map((token, i) => (
                      <motion.div key={token.id} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.05 }} className="p-4 rounded-lg border bg-card">
                        <div className="flex items-center justify-between mb-2">
                          <div className="flex items-center gap-2">
                            <Shield className="h-4 w-4 text-primary" />
                            <span className="font-medium">{token.company_name}</span>
                            <Badge variant={token.is_active ? "default" : "secondary"}>{token.is_active ? "Ativo" : "Inativo"}</Badge>
                          </div>
                          <Switch checked={token.is_active} onCheckedChange={(checked) => toggleToken.mutate({ id: token.id, isActive: checked })} />
                        </div>
                        <div className="flex items-center gap-2 mb-2">
                          <code className="flex-1 text-xs bg-muted p-2 rounded font-mono truncate">{visibleTokens.has(token.id) ? token.token : "••••••••••••••••••••••••"}</code>
                          <Button size="icon" aria-label="Alternar visibilidade" variant="ghost" onClick={() => toggleVisibility(token.id)}>{visibleTokens.has(token.id) ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}</Button>
                          <Button size="icon" aria-label="Copiar token" variant="ghost" onClick={() => copyToken(token.token)}><Copy className="h-4 w-4" /></Button>
                        </div>
                        <div className="flex gap-4 text-xs text-muted-foreground">
                          <span className="flex items-center gap-1"><Clock className="h-3 w-3" />Criado: {format(new Date(token.created_at), "dd/MM/yyyy HH:mm", { locale: ptBR })}</span>
                          <span>Usos: {token.usage_count}</span>
                          {token.last_used_at && <span>Último uso: {format(new Date(token.last_used_at), "dd/MM/yyyy HH:mm", { locale: ptBR })}</span>}
                        </div>
                      </motion.div>
                    ))
                  )}
                </div>
              </ScrollArea>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="logs" className="mt-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2"><Activity className="h-5 w-5 text-primary" />Histórico de Alterações de Score</CardTitle>
              <CardDescription>Todas as alterações de pontuação via API e sistema</CardDescription>
            </CardHeader>
            <CardContent>
              <ScrollArea className="h-[500px]">
                <div className="space-y-2">
                  {logs.length === 0 ? (
                    <p className="text-muted-foreground text-sm">Nenhuma alteração registrada</p>
                  ) : (
                    logs.map((log, i: number) => (
                      <motion.div key={log.id} initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: i * 0.03 }} className="flex items-center justify-between p-3 rounded-lg border bg-card">
                        <div className="flex items-center gap-3">
                          <Badge variant={log.operation === "ADD" ? "default" : log.operation === "REM" ? "destructive" : "secondary"}>{log.operation}</Badge>
                          <div>
                            <p className="text-sm font-medium">{log.salespeople?.name || "—"}</p>
                            <p className="text-xs text-muted-foreground">Campo: {log.field_name} | Via: {log.changed_by}</p>
                          </div>
                        </div>
                        <div className="text-right">
                          <p className="text-sm"><span className="text-muted-foreground">{log.old_value}</span>{" → "}<span className="font-bold">{log.new_value}</span></p>
                          <p className="text-xs text-muted-foreground">{format(new Date(log.created_at), "dd/MM HH:mm", { locale: ptBR })}</p>
                        </div>
                      </motion.div>
                    ))
                  )}
                </div>
              </ScrollArea>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="docs" className="mt-4">
          <ApiDocsTab />
        </TabsContent>
      </Tabs>
    </div>
  );
}
