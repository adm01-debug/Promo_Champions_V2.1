import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";
import { useCreateConnection, useIntegrationConnections } from "@/hooks/admin/useIntegrationConnections";

export function N8nTab() {
  const [label, setLabel] = useState("");
  const [baseUrl, setBaseUrl] = useState("");
  const [apiKey, setApiKey] = useState("");
  const create = useCreateConnection();
  const { data: items = [] } = useIntegrationConnections("n8n");

  const submit = async () => {
    if (!label || !baseUrl) return;
    await create.mutateAsync({
      kind: "n8n",
      label,
      config: { base_url: baseUrl, api_key: apiKey || undefined },
      source: apiKey ? "secret" : "db",
    });
    setLabel(""); setBaseUrl(""); setApiKey("");
  };

  return (
    <Card className="glass border-border/40">
      <CardHeader>
        <CardTitle className="font-display text-lg">n8n</CardTitle>
        <CardDescription>
          Conecte instâncias n8n para validar healthcheck e disparar workflows via Webhook.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-3">
        <div className="grid gap-3 sm:grid-cols-2">
          <div>
            <Label>Rótulo</Label>
            <Input value={label} onChange={(e) => setLabel(e.target.value)} placeholder="n8n produção" />
          </div>
          <div>
            <Label>Base URL</Label>
            <Input value={baseUrl} onChange={(e) => setBaseUrl(e.target.value)} placeholder="https://n8n.example.com" />
          </div>
          <div className="sm:col-span-2">
            <Label>API key (opcional)</Label>
            <Input value={apiKey} onChange={(e) => setApiKey(e.target.value)} type="password" />
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
