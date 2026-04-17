import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Send } from "lucide-react";
import { useOutboundMessagesByDay } from "@/hooks/multichannel/useOutboundMessages";
import { CHANNEL_LABEL } from "./multichannelHelpers";

export function SequenceSendsWidget() {
  const { data, isLoading } = useOutboundMessagesByDay(7);

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-base">
          <Send className="h-4 w-4 text-primary" />
          Envios via Sequências (últimos 7d)
        </CardTitle>
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <Skeleton className="h-16 w-full" />
        ) : data && data.total > 0 ? (
          <div className="grid grid-cols-2 gap-3">
            {Object.entries(data.byChannel).map(([ch, stats]) => (
              <div key={ch} className="border rounded-lg p-3">
                <p className="text-xs text-muted-foreground">{CHANNEL_LABEL[ch as "whatsapp" | "sms"] ?? ch}</p>
                <p className="text-2xl font-bold">{stats.total}</p>
                <p className="text-xs text-muted-foreground">
                  {stats.sent} enviadas · {stats.failed} falhas
                </p>
              </div>
            ))}
          </div>
        ) : (
          <p className="text-sm text-muted-foreground">Nenhum envio nos últimos 7 dias.</p>
        )}
      </CardContent>
    </Card>
  );
}
