import React from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Code } from "lucide-react";

export const ApiDocsTab = React.memo(function ApiDocsTab() {
  return (
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
              <p className="text-muted-foreground">Todas as requisições devem incluir o token no header:</p>
              <pre className="bg-muted p-3 rounded text-xs overflow-x-auto">
{`Header: authorization
Value: <seu_token_aqui>`}
              </pre>
            </div>

            <div>
              <h3 className="text-lg font-semibold">👥 Usuários</h3>
              <div className="space-y-3">
                <ApiEndpoint method="GET" path="/v2/users" desc="Listar todos os usuários ativos" />
                <ApiEndpoint method="GET" path="/v2/user/:id" desc="Obter usuário específico" />
                <ApiEndpoint method="POST" path="/v2/user/create" desc="Criar novo usuário" body={`{ "name": "...", "email": "..." }`} />
              </div>
            </div>

            <div>
              <h3 className="text-lg font-semibold">👥 Times</h3>
              <div className="space-y-3">
                <ApiEndpoint method="GET" path="/v2/team" desc="Informações do time vinculado ao token" />
                <ApiEndpoint method="GET" path="/v2/team/users" desc="Usuários do time" />
                <ApiEndpoint method="GET" path="/v2/team/logs" desc="Logs de alteração de pontuação" />
                <ApiEndpoint method="GET" path="/v2/team/addfields" desc="Campos adicionais do time" />
              </div>
            </div>

            <div>
              <h3 className="text-lg font-semibold">📊 Edição de Pontuação</h3>
              <div className="space-y-3">
                <ApiEndpoint method="PUT" path="/v2/team/user/edit/total" desc="Editar score total do usuário" body={`{
  "email": "user@email.com",
  "type": "ADD | REM | SET",
  "value": "10",
  "set_value": true
}`} />
                <ApiEndpoint method="PUT" path="/v2/team/user/edit/addfield/:id" desc="Editar campo adicional do usuário" body={`{
  "fieldid": "campo_id",
  "value": 20,
  "set_points": true
}`} />
              </div>
            </div>

            <div>
              <h3 className="text-lg font-semibold">🏢 Companhia</h3>
              <div className="space-y-3">
                <ApiEndpoint method="GET" path="/v2/company" desc="Informações da companhia" />
                <ApiEndpoint method="GET" path="/v2/company/users" desc="Todos os usuários da companhia" />
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
  );
});

function ApiEndpoint({ method, path, desc, body }: { method: string; path: string; desc: string; body?: string }) {
  const variant = method === "GET" ? "default" : method === "POST" ? "secondary" : "outline";
  return (
    <div className="p-3 bg-muted rounded">
      <Badge variant={variant}>{method}</Badge>
      <code className="ml-2 text-xs">{path}</code>
      <p className="text-xs text-muted-foreground mt-1">{desc}</p>
      {body && <pre className="text-xs mt-2">{body}</pre>}
    </div>
  );
}
