import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";
import { useCreateConnection, useIntegrationConnections } from "@/hooks/admin/useIntegrationConnections";

export function McpTab() {
  const [label, setLabel] = useState("");
  const [url, setUrl] = useState("");
  const [auth, setAuth] = useState("");
  const create = useCreateConnection();
  const { data: items = [] } = useIntegrationConnections("mcp");

  const submit = async () => {
    if (!label || !url) return;
    await create.mutateAsync({
      kind: "mcp",
      label,
      config: { url, auth_header: auth || undefined },
      source: auth ? "secret" : "db",
    });
    setLabel(""); setUrl(""); setAuth("");
  };

  return (
    <Card className="glass border-border/40">
      <CardHeader>
        <CardTitle className="font-display text-lg">MCP (Claude / agentes)</CardTitle>
        <CardDescription>
          Servidores MCP externos via Streamable HTTP. O teste usa o método <code>initialize</code>.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-3">
        <div className="grid gap-3 sm:grid-cols-2">
          <div>
            <Label>Rótulo</Label>
            <Input value={label} onChange={(e) => setLabel(e.target.value)} placeholder="MCP CRM agent" />
          </div>
          <div>
            <Label>URL do servidor</Label>
            <Input value={url} onChange={(e) => setUrl(e.target.value)} placeholder="https://example.com/mcp" />
          </div>
          <div className="sm:col-span-2">
            <Label>Authorization header (opcional)</Label>
            <Input
              value={auth}
              onChange={(e) => setAuth(e.target.value)}
              placeholder="Bearer xxx"
              type="password"
            />
          </div>
        </div>
        <div className="flex justify-end">
          <Button onClick={submit} disabled={create.isPending} className="gap-2">
            <Plus className="h-4 w-4" /> Cadastrar
          </Button>
        </div>
        <p className="text-xs text-muted-foreground">Cadastrados: <strong>{items.length}</strong></p>
      </CardContent>
    </Card>
  );
}
