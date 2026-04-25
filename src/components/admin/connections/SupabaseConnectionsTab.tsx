import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Plus } from "lucide-react";
import { ExternalDBSettings } from "@/components/admin/ExternalDBSettings";
import { useCreateConnection, useIntegrationConnections } from "@/hooks/admin/useIntegrationConnections";

export function SupabaseConnectionsTab() {
  const [label, setLabel] = useState("");
  const [url, setUrl] = useState("");
  const [anonKey, setAnonKey] = useState("");
  const [testTable, setTestTable] = useState("salespeople");
  const create = useCreateConnection();
  const { data: dbs = [] } = useIntegrationConnections("database");

  const submit = async () => {
    if (!label || !url || !anonKey) return;
    await create.mutateAsync({
      kind: "database",
      label,
      config: { url, anon_key: anonKey, test_table: testTable },
      source: "db",
    });
    setLabel(""); setUrl(""); setAnonKey(""); setTestTable("salespeople");
  };

  return (
    <div className="space-y-6">
      <ExternalDBSettings />

      <Card className="glass border-border/40">
        <CardHeader>
          <CardTitle className="font-display text-lg">Adicionar banco externo</CardTitle>
          <CardDescription>
            Cadastre um banco Supabase adicional para monitorar a saúde via auto-testes.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="grid gap-3 sm:grid-cols-2">
            <div>
              <Label>Rótulo</Label>
              <Input value={label} onChange={(e) => setLabel(e.target.value)} placeholder="GIFT STORE prod" />
            </div>
            <div>
              <Label>Tabela de teste</Label>
              <Input value={testTable} onChange={(e) => setTestTable(e.target.value)} />
            </div>
            <div className="sm:col-span-2">
              <Label>URL</Label>
              <Input value={url} onChange={(e) => setUrl(e.target.value)} placeholder="https://xxx.supabase.co" />
            </div>
            <div className="sm:col-span-2">
              <Label>Anon key</Label>
              <Input value={anonKey} onChange={(e) => setAnonKey(e.target.value)} type="password" />
            </div>
          </div>
          <div className="flex justify-end">
            <Button onClick={submit} disabled={create.isPending} className="gap-2">
              <Plus className="h-4 w-4" /> Cadastrar
            </Button>
          </div>
          <p className="text-xs text-muted-foreground">
            Já cadastrados: <strong>{dbs.length}</strong>
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
