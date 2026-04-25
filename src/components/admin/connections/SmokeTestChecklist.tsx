import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { CheckCircle2, XCircle, Loader2, PlayCircle } from "lucide-react";
import { useState } from "react";
import { useIntegrationConnections, useTestConnection } from "@/hooks/admin/useIntegrationConnections";

export function SmokeTestChecklist() {
  const { data: conns = [] } = useIntegrationConnections();
  const test = useTestConnection();
  const [results, setResults] = useState<Record<string, "pending" | "ok" | "fail" | "running">>({});
  const [running, setRunning] = useState(false);

  const enabled = conns.filter((c) => c.enabled);

  const runAll = async () => {
    setRunning(true);
    setResults(Object.fromEntries(enabled.map((c) => [c.id, "pending"])));
    for (const c of enabled) {
      setResults((r) => ({ ...r, [c.id]: "running" }));
      try {
        const res = await test.mutateAsync(c.id);
        setResults((r) => ({ ...r, [c.id]: res?.ok ? "ok" : "fail" }));
      } catch {
        setResults((r) => ({ ...r, [c.id]: "fail" }));
      }
    }
    setRunning(false);
  };

  return (
    <Card className="glass border-border/40">
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle className="font-display text-lg">Smoke test</CardTitle>
        <Button size="sm" onClick={runAll} disabled={running || enabled.length === 0} className="gap-2">
          {running ? <Loader2 className="h-4 w-4 animate-spin" /> : <PlayCircle className="h-4 w-4" />}
          Rodar todos
        </Button>
      </CardHeader>
      <CardContent>
        {enabled.length === 0 ? (
          <p className="text-sm text-muted-foreground">Cadastre conexões ativas para rodar o smoke test.</p>
        ) : (
          <ul className="space-y-2">
            {enabled.map((c) => {
              const s = results[c.id];
              return (
                <li
                  key={c.id}
                  className="flex items-center justify-between border border-border/40 rounded-lg px-3 py-2"
                >
                  <div className="flex items-center gap-3">
                    {s === "running" && <Loader2 className="h-4 w-4 animate-spin text-primary" />}
                    {s === "ok" && <CheckCircle2 className="h-4 w-4 text-success" />}
                    {s === "fail" && <XCircle className="h-4 w-4 text-destructive" />}
                    {(!s || s === "pending") && <div className="h-2 w-2 rounded-full bg-muted-foreground/40" />}
                    <span className="text-sm font-medium">{c.label}</span>
                    <span className="text-xs text-muted-foreground uppercase">{c.kind}</span>
                  </div>
                </li>
              );
            })}
          </ul>
        )}
      </CardContent>
    </Card>
  );
}
