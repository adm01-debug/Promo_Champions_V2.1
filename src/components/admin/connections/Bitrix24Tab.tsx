import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useBitrix24 } from "@/hooks/useBitrix24";
import { Link } from "react-router-dom";
import { ExternalLink, RefreshCw, Loader2 } from "lucide-react";

export function Bitrix24Tab() {
  const b = useBitrix24();
  return (
    <Card className="glass border-border/40">
      <CardHeader>
        <CardTitle className="font-display text-lg">Bitrix24</CardTitle>
        <CardDescription>Status da integração OAuth com o Bitrix24.</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex items-center gap-2">
          {b.isLoadingStatus ? (
            <Badge variant="outline">Verificando…</Badge>
          ) : b.isConnected ? (
            <>
              <Badge className="bg-success/20 text-success border-success/30">Conectado</Badge>
              <span className="text-sm text-muted-foreground">{b.domain}</span>
            </>
          ) : (
            <Badge variant="destructive">Não conectado</Badge>
          )}
          {b.needsReauth && <Badge variant="outline" className="text-warning">Re-autenticação necessária</Badge>}
        </div>

        <div className="flex flex-wrap gap-2">
          <Button
            variant="default"
            onClick={() => b.authorize()}
            disabled={b.isAuthorizing}
            className="gap-2"
          >
            {b.isAuthorizing ? <Loader2 className="h-4 w-4 animate-spin" /> : <ExternalLink className="h-4 w-4" />}
            {b.isConnected ? "Reconectar" : "Conectar"}
          </Button>
          {b.isConnected && (
            <>
              <Button variant="outline" onClick={() => b.sync("incremental")} disabled={b.isSyncing} className="gap-2">
                {b.isSyncing ? <Loader2 className="h-4 w-4 animate-spin" /> : <RefreshCw className="h-4 w-4" />}
                Sincronizar
              </Button>
              <Button variant="outline" onClick={() => b.refreshToken()} disabled={b.isRefreshing}>
                {b.isRefreshing ? "..." : "Atualizar token"}
              </Button>
            </>
          )}
          <Button asChild variant="ghost">
            <Link to="/bitrix24">Página completa →</Link>
          </Button>
        </div>

        {b.syncLogs && b.syncLogs.length > 0 && (
          <div className="text-xs text-muted-foreground">
            {b.syncLogs.length} sincronizações recentes registradas.
          </div>
        )}
      </CardContent>
    </Card>
  );
}
