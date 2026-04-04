import React from "react";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Skeleton } from "@/components/ui/skeleton";
import { Activity } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

interface GeoAccessLog {
  id: string;
  ip_address: string;
  country_code: string | null;
  country_name: string | null;
  city: string | null;
  region: string | null;
  blocked: boolean | null;
  attempted_path: string | null;
  created_at: string;
}

function getFlagEmoji(countryCode: string): string {
  const codePoints = countryCode.toUpperCase().split("").map((char) => 127397 + char.charCodeAt(0));
  return String.fromCodePoint(...codePoints);
}

interface GeoAccessLogsProps {
  accessLogs: GeoAccessLog[] | undefined;
  isLoading: boolean;
}

export const GeoAccessLogs = React.memo(function GeoAccessLogs({ accessLogs, isLoading }: GeoAccessLogsProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-lg flex items-center gap-2">
          <Activity className="h-5 w-5" />
          Logs de Acesso Geográfico Recentes
        </CardTitle>
        <CardDescription>Últimos 50 acessos registrados</CardDescription>
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <div className="space-y-2">
            {[...Array(5)].map((_, i) => (
              <Skeleton key={i} className="h-12 w-full" />
            ))}
          </div>
        ) : accessLogs?.length === 0 ? (
          <div className="text-center py-8 text-muted-foreground">
            <Activity className="h-12 w-12 mx-auto mb-3 opacity-50" />
            <p>Nenhum log de acesso registrado</p>
          </div>
        ) : (
          <ScrollArea className="h-[300px]">
            <div className="space-y-2">
              {accessLogs?.map((log) => (
                <div
                  key={log.id}
                  className={`flex items-center justify-between p-3 rounded-lg border ${
                    log.blocked ? "bg-destructive/5 border-destructive/20" : "bg-emerald-500/5 border-emerald-500/20"
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <span className="text-lg">{log.country_code ? getFlagEmoji(log.country_code) : "🌐"}</span>
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-mono text-sm">{log.ip_address}</span>
                        {log.country_name && <Badge variant="outline" className="text-xs">{log.country_name}</Badge>}
                      </div>
                      <div className="flex items-center gap-2 text-xs text-muted-foreground">
                        {log.city && <span>{log.city}</span>}
                        {log.region && <span>• {log.region}</span>}
                        {log.attempted_path && <span>• {log.attempted_path}</span>}
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <Badge variant={log.blocked ? "destructive" : "default"}>{log.blocked ? "Bloqueado" : "Permitido"}</Badge>
                    <span className="text-xs text-muted-foreground">{new Date(log.created_at).toLocaleString("pt-BR")}</span>
                  </div>
                </div>
              ))}
            </div>
          </ScrollArea>
        )}
      </CardContent>
    </Card>
  );
});
