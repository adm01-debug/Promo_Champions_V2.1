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
import { Key, Copy, Eye, EyeOff, Plus, Clock, Activity, FileText, Code, Shield } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";

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
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const baseUrl = `${window.location.origin.replace('://', '://').split('.')[0]}.supabase.co/functions/v1/ranking-api/v2`;

  return (
    <div className="space-y-6">
      <Tabs defaultValue="tokens">
        <TabsList>
          <TabsTrigger value="tokens" className="flex items-center gap-2">
            <Key className="h-4 w-4" />
            Tokens
          </TabsTrigger>
          <TabsTrigger value="logs" className="flex items-center gap-2">
            <Activity className="h-4 w-4" />
            Logs de Score
          </TabsTrigger>
          <TabsTrigger value="docs" className="flex items-center gap-2">
            <FileText className="h-4 w-4" />
            Documentação
          </TabsTrigger>
        </TabsList>

        <TabsContent value="tokens" className="mt-4 space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Plus className="h-5 w-5 text-primary" />
                Gerar Novo Token
              </CardTitle>
              <CardDescription>Crie tokens para integração com sistemas externos</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex gap-3">
                <div className="flex-1">
                  <Label htmlFor="company-name">Nome da Companhia/Integração</Label>
                  <Input
                    id="company-name"
                    placeholder="Ex: Sistema ERP, Bitrix24..."
                    value={companyName}
                    onChange={(e) => setCompanyName(e.target.value)}
                  />
                </div>
                <div className="flex items-end">
                  <Button onClick={handleCreate} disabled={createToken.isPending}>
                    <Key className="h-4 w-4 mr-2" />
                    Gerar Token
                  </Button>
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
                      <motion.div
                        key={token.id}
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: i * 0.05 }}
                        className="p-4 rounded-lg border bg-card"
                      >
                        <div className="flex items-center justify-between mb-2">
                          <div className="flex items-center gap-2">
                            <Shield className="h-4 w-4 text-primary" />
                            <span className="font-medium">{token.company_name}</span>
                            <Badge variant={token.is_active ? "default" : "secondary"}>
                              {token.is_active ? "Ativo" : "Inativo"}
                            </Badge>
                          </div>
                          <Switch
                            checked={token.is_active}
                            onCheckedChange={(checked) => toggleToken.mutate({ id: token.id, isActive: checked })}
                          />
                        </div>
                        <div className="flex items-center gap-2 mb-2">
                          <code className="flex-1 text-xs bg-muted p-2 rounded font-mono truncate">
                            {visibleTokens.has(token.id) ? token.token : "••••••••••••••••••••••••"}
                          </code>
                          <Button size="icon" variant="ghost" onClick={() => toggleVisibility(token.id)}>
                            {visibleTokens.has(token.id) ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                          </Button>
                          <Button size="icon" variant="ghost" onClick={() => copyToken(token.token)}>
                            <Copy className="h-4 w-4" />
                          </Button>
                        </div>
                        <div className="flex gap-4 text-xs text-muted-foreground">
                          <span className="flex items-center gap-1">
                            <Clock className="h-3 w-3" />
                            Criado: {format(new Date(token.created_at), "dd/MM/yyyy HH:mm", { locale: ptBR })}
                          </span>
                          <span>Usos: {token.usage_count}</span>
                          {token.last_used_at && (
                            <span>Último uso: {format(new Date(token.last_used_at), "dd/MM/yyyy HH:mm", { locale: ptBR })}</span>
                          )}
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
              <CardTitle className="flex items-center gap-2">
                <Activity className="h-5 w-5 text-primary" />
                Histórico de Alterações de Score
              </CardTitle>
              <CardDescription>Todas as alterações de pontuação via API e sistema</CardDescription>
            </CardHeader>
            <CardContent>
              <ScrollArea className="h-[500px]">
                <div className="space-y-2">
                  {logs.length === 0 ? (
                    <p className="text-muted-foreground text-sm">Nenhuma alteração registrada</p>
                  ) : (
                    logs.map((log: any, i: number) => (
                      <motion.div
                        key={log.id}
                        initial={{ opacity: 0, x: -10 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: i * 0.03 }}
                        className="flex items-center justify-between p-3 rounded-lg border bg-card"
                      >
                        <div className="flex items-center gap-3">
                          <Badge variant={
                            log.operation === "ADD" ? "default" :
                            log.operation === "REM" ? "destructive" : "secondary"
                          }>
                            {log.operation}
                          </Badge>
                          <div>
                            <p className="text-sm font-medium">{log.salespeople?.name || "—"}</p>
                            <p className="text-xs text-muted-foreground">
                              Campo: {log.field_name} | Via: {log.changed_by}
                            </p>
                          </div>
                        </div>
                        <div className="text-right">
                          <p className="text-sm">
                            <span className="text-muted-foreground">{log.old_value}</span>
                            {" → "}
                            <span className="font-bold">{log.new_value}</span>
                          </p>
                          <p className="text-xs text-muted-foreground">
                            {format(new Date(log.created_at), "dd/MM HH:mm", { locale: ptBR })}
                          </p>
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
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Code className="h-5 w-5 text-primary" />
                Documentação da API REST V2
              </CardTitle>
              <CardDescription>Referência completa para integração externa</CardDescription>
            </CardHeader>
            <CardContent>
              <ScrollArea className="h-[600px]">
                <div className="prose prose-sm dark:prose-invert max-w-none space-y-6">
                  <div>
                    <h3 className="text-lg font-semibold">🔐 Autenticação</h3>
                    <p className="text-muted-foreground">
                      Todas as requisições devem incluir o token no header:
                    </p>
                    <pre className="bg-muted p-3 rounded text-xs overflow-x-auto">
{`Header: authorization
Value: <seu_token_aqui>`}
                    </pre>
                  </div>

                  <div>
                    <h3 className="text-lg font-semibold">👥 Usuários</h3>
                    <div className="space-y-3">
                      <div className="p-3 bg-muted rounded">
                        <Badge>GET</Badge>
                        <code className="ml-2 text-xs">/v2/users</code>
                        <p className="text-xs text-muted-foreground mt-1">Listar todos os usuários ativos</p>
                      </div>
                      <div className="p-3 bg-muted rounded">
                        <Badge>GET</Badge>
                        <code className="ml-2 text-xs">/v2/user/:id</code>
                        <p className="text-xs text-muted-foreground mt-1">Obter usuário específico</p>
                      </div>
                      <div className="p-3 bg-muted rounded">
                        <Badge variant="secondary">POST</Badge>
                        <code className="ml-2 text-xs">/v2/user/create</code>
                        <p className="text-xs text-muted-foreground mt-1">Criar novo usuário</p>
                        <pre className="text-xs mt-2">{`{ "name": "...", "email": "..." }`}</pre>
                      </div>
                    </div>
                  </div>

                  <div>
                    <h3 className="text-lg font-semibold">👥 Times</h3>
                    <div className="space-y-3">
                      <div className="p-3 bg-muted rounded">
                        <Badge>GET</Badge>
                        <code className="ml-2 text-xs">/v2/team</code>
                        <p className="text-xs text-muted-foreground mt-1">Informações do time vinculado ao token</p>
                      </div>
                      <div className="p-3 bg-muted rounded">
                        <Badge>GET</Badge>
                        <code className="ml-2 text-xs">/v2/team/users</code>
                        <p className="text-xs text-muted-foreground mt-1">Usuários do time</p>
                      </div>
                      <div className="p-3 bg-muted rounded">
                        <Badge>GET</Badge>
                        <code className="ml-2 text-xs">/v2/team/logs</code>
                        <p className="text-xs text-muted-foreground mt-1">Logs de alteração de pontuação</p>
                      </div>
                      <div className="p-3 bg-muted rounded">
                        <Badge>GET</Badge>
                        <code className="ml-2 text-xs">/v2/team/addfields</code>
                        <p className="text-xs text-muted-foreground mt-1">Campos adicionais do time</p>
                      </div>
                    </div>
                  </div>

                  <div>
                    <h3 className="text-lg font-semibold">📊 Edição de Pontuação</h3>
                    <div className="space-y-3">
                      <div className="p-3 bg-muted rounded">
                        <Badge variant="outline">PUT</Badge>
                        <code className="ml-2 text-xs">/v2/team/user/edit/total</code>
                        <p className="text-xs text-muted-foreground mt-1">Editar score total do usuário</p>
                        <pre className="text-xs mt-2">{`{
  "email": "user@email.com",
  "type": "ADD | REM | SET",
  "value": "10",
  "set_value": true
}`}</pre>
                      </div>
                      <div className="p-3 bg-muted rounded">
                        <Badge variant="outline">PUT</Badge>
                        <code className="ml-2 text-xs">/v2/team/user/edit/addfield/:id</code>
                        <p className="text-xs text-muted-foreground mt-1">Editar campo adicional do usuário</p>
                        <pre className="text-xs mt-2">{`{
  "fieldid": "campo_id",
  "value": 20,
  "set_points": true
}`}</pre>
                      </div>
                    </div>
                  </div>

                  <div>
                    <h3 className="text-lg font-semibold">🏢 Companhia</h3>
                    <div className="space-y-3">
                      <div className="p-3 bg-muted rounded">
                        <Badge>GET</Badge>
                        <code className="ml-2 text-xs">/v2/company</code>
                        <p className="text-xs text-muted-foreground mt-1">Informações da companhia</p>
                      </div>
                      <div className="p-3 bg-muted rounded">
                        <Badge>GET</Badge>
                        <code className="ml-2 text-xs">/v2/company/users</code>
                        <p className="text-xs text-muted-foreground mt-1">Todos os usuários da companhia</p>
                      </div>
                    </div>
                  </div>

                  <div>
                    <h3 className="text-lg font-semibold">📋 Códigos HTTP</h3>
                    <div className="grid grid-cols-2 gap-2">
                      <div className="p-2 bg-muted rounded text-xs"><Badge className="bg-primary">200</Badge> Sucesso</div>
                      <div className="p-2 bg-muted rounded text-xs"><Badge variant="destructive">400</Badge> Operação mal sucedida</div>
                      <div className="p-2 bg-muted rounded text-xs"><Badge variant="destructive">403</Badge> Acesso negado</div>
                      <div className="p-2 bg-muted rounded text-xs"><Badge variant="destructive">404</Badge> Não encontrado</div>
                      <div className="p-2 bg-muted rounded text-xs"><Badge variant="destructive">409</Badge> Conflito (já existe)</div>
                      <div className="p-2 bg-muted rounded text-xs"><Badge variant="destructive">500</Badge> Erro do servidor</div>
                    </div>
                  </div>
                </div>
              </ScrollArea>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
