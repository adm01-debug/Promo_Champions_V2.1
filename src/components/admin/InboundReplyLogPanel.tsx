import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Inbox, MailWarning } from "lucide-react";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import { useInboundReplyEvents } from "@/hooks/sequences/useAutoPause";

const EVENT_VARIANT: Record<string, "info" | "destructive" | "warning" | "secondary"> = {
  reply: "info",
  bounce: "destructive",
  complaint: "destructive",
  unsubscribe: "warning",
  other: "secondary",
};

export function InboundReplyLogPanel() {
  const { data, isLoading } = useInboundReplyEvents(50);

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-base">
          <MailWarning className="h-4 w-4 text-primary" />
          Eventos de e-mail recebidos
        </CardTitle>
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <div className="space-y-2">
            {[1, 2, 3, 4].map((i) => <Skeleton key={i} className="h-14 w-full" />)}
          </div>
        ) : (data?.length ?? 0) === 0 ? (
          <div className="text-center py-8 text-sm text-muted-foreground">
            <Inbox className="h-8 w-8 mx-auto mb-2 text-muted-foreground/40" />
            Nenhum evento recebido ainda
          </div>
        ) : (
          <ScrollArea className="max-h-[420px] pr-2">
            <div className="space-y-2">
              {data?.map((e) => (
                <div key={e.id} className="border rounded-md p-3 hover:bg-accent/5 transition-colors">
                  <div className="flex items-center justify-between gap-2 mb-1">
                    <div className="flex items-center gap-2 min-w-0">
                      <Badge variant={EVENT_VARIANT[e.event_type] ?? "secondary"} className="text-[10px] h-5">
                        {e.event_type}
                      </Badge>
                      <span className="text-xs font-medium truncate">{e.from_email ?? "—"}</span>
                    </div>
                    <span className="text-[10px] text-muted-foreground whitespace-nowrap">
                      {format(new Date(e.received_at), "dd MMM HH:mm", { locale: ptBR })}
                    </span>
                  </div>
                  <div className="flex items-center justify-between gap-2 text-xs text-muted-foreground">
                    <span className="truncate">{e.subject ?? "(sem assunto)"}</span>
                    <span className="whitespace-nowrap">
                      {e.matched_enrollment_id ? "✓ pausado" : "sem match"} • {e.provider}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </ScrollArea>
        )}
      </CardContent>
    </Card>
  );
}
