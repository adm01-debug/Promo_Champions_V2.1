import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { Database, TestTube2, Loader2, CheckCircle, XCircle } from "lucide-react";

export function ExternalDBSettings() {
  const [testing, setTesting] = useState(false);
  const [testResult, setTestResult] = useState<"success" | "error" | null>(null);
  const [table, setTable] = useState("salespeople");
  const [result, setResult] = useState<unknown>(null);

  const handleTestConnection = async () => {
    setTesting(true);
    setTestResult(null);
    try {
      const { data, error } = await supabase.functions.invoke("external-db-bridge", {
        body: { operation: "select", table, limit: 1 },
      });
      if (error) throw error;
      if (data?.error) throw new Error(data.error);
      setTestResult("success");
      setResult(data);
      toast.success("Conexão com banco externo OK");
    } catch (e: unknown) {
      setTestResult("error");
      setResult((e as Error).message);
      toast.error("Falha: " + (e as Error).message);
    } finally {
      setTesting(false);
    }
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-primary/10">
              <Database className="h-5 w-5 text-primary" />
            </div>
            <div>
              <CardTitle>Banco de Dados Externo</CardTitle>
              <CardDescription>
                Conecte a um banco de dados externo via Edge Function bridge.
                As credenciais (EXTERNAL_SUPABASE_URL e EXTERNAL_SUPABASE_ANON_KEY) são configuradas como secrets do backend.
              </CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center gap-2">
            <Badge variant="outline" className="text-xs">
              Edge Function: external-db-bridge
            </Badge>
            {testResult === "success" && (
              <Badge className="bg-success/20 text-success border-success/30">
                <CheckCircle className="h-3 w-3 mr-1" />Conectado
              </Badge>
            )}
            {testResult === "error" && (
              <Badge variant="destructive">
                <XCircle className="h-3 w-3 mr-1" />Erro
              </Badge>
            )}
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-2">
              <Label>Tabela para teste</Label>
              <Input
                value={table}
                onChange={e => setTable(e.target.value)}
                placeholder="nome_da_tabela"
              />
            </div>
            <div className="flex items-end">
              <Button onClick={handleTestConnection} disabled={testing}>
                {testing ? <Loader2 className="h-4 w-4 mr-2 animate-spin" /> : <TestTube2 className="h-4 w-4 mr-2" />}
                Testar Conexão
              </Button>
            </div>
          </div>

          {result !== null && (
            <div className="mt-4">
              <Label className="text-sm text-muted-foreground mb-2 block">Resultado</Label>
              <pre className="bg-muted/50 rounded-lg p-4 text-xs overflow-auto max-h-48 font-mono">
                {typeof result === "string" ? result : JSON.stringify(result, null, 2)}
              </pre>
            </div>
          )}

          <div className="bg-muted/30 rounded-lg p-4 text-sm text-muted-foreground space-y-1">
            <p className="font-medium text-foreground">Como configurar:</p>
            <p>1. Defina o secret <code className="bg-muted px-1 rounded">EXTERNAL_SUPABASE_URL</code> com a URL do banco externo</p>
            <p>2. Defina o secret <code className="bg-muted px-1 rounded">EXTERNAL_SUPABASE_ANON_KEY</code> com a anon key</p>
            <p>3. Use o botão acima para validar a conexão</p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
