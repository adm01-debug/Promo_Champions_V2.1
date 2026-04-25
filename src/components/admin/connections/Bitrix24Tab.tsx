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
        <div className="flex items-center gap-2" role="status" aria-live="polite">
          {b.isLoadingStatus ? (
            <Badge variant="outline" aria-label="Verificando status do Bitrix24">Verificando…</Badge>
          ) : b.isConnected ? (
            <>
              <Badge
                className="bg-success/20 text-success border-success/30"
                aria-label="Bitrix24: conectado"
              >
                Conectado
              </Badge>
              <span className="text-sm text-muted-foreground">{b.domain}</span>
            </>
          ) : (
            <Badge variant="destructive" aria-label="Bitrix24: não conectado">Não conectado</Badge>
          )}
          {b.needsReauth && (
            <Badge
              variant="outline"
              className="text-warning"
              aria-label="Bitrix24: re-autenticação necessária"
            >
              Re-autenticação necessária
            </Badge>
          )}
        </div>

        <div className="flex flex-wrap gap-2">
          <Button
            variant="default"
            onClick={() => b.authorize()}
            disabled={b.isAuthorizing}
            className="gap-2"
            aria-label={b.isConnected ? "Reconectar ao Bitrix24" : "Conectar ao Bitrix24"}
          >
            {b.isAuthorizing ? (
              <Loader2 className="h-4 w-4 animate-spin" aria-hidden="true" />
            ) : (
              <ExternalLink className="h-4 w-4" aria-hidden="true" />
            )}
            {b.isConnected ? "Reconectar" : "Conectar"}
          </Button>
          {b.isConnected && (
            <>
              <Button
                variant="outline"
                onClick={() => b.sync("incremental")}
                disabled={b.isSyncing}
                className="gap-2"
                aria-label="Sincronizar dados com o Bitrix24"
              >
                {b.isSyncing ? (
                  <Loader2 className="h-4 w-4 animate-spin" aria-hidden="true" />
                ) : (
                  <RefreshCw className="h-4 w-4" aria-hidden="true" />
                )}
                Sincronizar
              </Button>
              <Button
                variant="outline"
                onClick={() => b.refreshToken()}
                disabled={b.isRefreshing}
                aria-label="Atualizar token de acesso do Bitrix24"
              >
                {b.isRefreshing ? "..." : "Atualizar token"}
              </Button>
            </>
          )}
          <Button asChild variant="ghost">
            <Link to="/bitrix24" aria-label="Abrir página completa do Bitrix24">Página completa →</Link>
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
