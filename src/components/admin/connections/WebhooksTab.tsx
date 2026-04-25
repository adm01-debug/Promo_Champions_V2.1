import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useWebhooks, useTestWebhook, useDeleteWebhook, WEBHOOK_EVENTS } from "@/hooks/useWebhooks";
import { Link } from "react-router-dom";
import { TestTube2, Trash2, Loader2 } from "lucide-react";

export function WebhooksTab() {
  const { data: webhooks = [], isLoading } = useWebhooks();
  const test = useTestWebhook();
  const del = useDeleteWebhook();

  return (
    <Card className="glass border-border/40">
      <CardHeader className="flex flex-row items-start justify-between">
        <div>
          <CardTitle className="font-display text-lg">Webhooks</CardTitle>
          <CardDescription>
            {WEBHOOK_EVENTS.length} eventos disponíveis para distribuição em tempo real.
          </CardDescription>
        </div>
        <Button asChild variant="outline" size="sm">
          <Link to="/admin/webhooks-timeline">Timeline →</Link>
        </Button>
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <p className="text-sm text-muted-foreground">Carregando…</p>
        ) : webhooks.length === 0 ? (
          <p className="text-sm text-muted-foreground">
            Nenhum webhook cadastrado. Use a página dedicada de webhooks para criar.
          </p>
        ) : (
          <ul className="space-y-2">
            {webhooks.map((w) => (
              <li
                key={w.id}
                className="flex items-center justify-between border border-border/40 rounded-lg px-3 py-2"
              >
                <div className="min-w-0">
                  <div className="font-medium truncate">{w.name}</div>
                  <div className="text-xs text-muted-foreground truncate">{w.url}</div>
                  <div className="flex flex-wrap gap-1 mt-1">
                    {w.events.slice(0, 3).map((e) => (
                      <Badge key={e} variant="secondary" className="text-[10px]">{e}</Badge>
                    ))}
                    {w.events.length > 3 && (
                      <Badge variant="outline" className="text-[10px]">+{w.events.length - 3}</Badge>
                    )}
                  </div>
                </div>
                <div className="flex gap-1">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => test.mutate(w.id)}
                    disabled={test.isPending}
                  >
                    {test.isPending ? <Loader2 className="h-4 w-4 animate-spin" /> : <TestTube2 className="h-4 w-4" />}
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => { if (confirm(`Remover "${w.name}"?`)) del.mutate(w.id); }}
                  >
                    <Trash2 className="h-4 w-4 text-destructive" />
                  </Button>
                </div>
              </li>
            ))}
          </ul>
        )}
      </CardContent>
    </Card>
  );
}
