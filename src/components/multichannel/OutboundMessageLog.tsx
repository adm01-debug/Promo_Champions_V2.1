import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import { MessageCircle, Smartphone } from "lucide-react";
import { useOutboundMessages } from "@/hooks/multichannel/useOutboundMessages";
import { CHANNEL_LABEL, STATUS_LABEL, statusVariant } from "./multichannelHelpers";

interface Props {
  enrollmentId: string;
}

export function OutboundMessageLog({ enrollmentId }: Props) {
  const { data, isLoading } = useOutboundMessages(enrollmentId, 20);

  if (isLoading) return <Skeleton className="h-20 w-full" />;
  if (!data || data.length === 0) {
    return <p className="text-xs text-muted-foreground">Nenhum envio multicanal registrado.</p>;
  }

  return (
    <div className="space-y-1.5">
      {data.map((m) => {
        const Icon = m.channel === "whatsapp" ? MessageCircle : Smartphone;
        return (
          <div key={m.id} className="flex items-center gap-2 text-xs border rounded-md p-2">
            <Icon className="h-3.5 w-3.5 text-muted-foreground shrink-0" />
            <span className="font-medium">{CHANNEL_LABEL[m.channel]}</span>
            <span className="text-muted-foreground truncate flex-1">{m.to_number}</span>
            <Badge variant={statusVariant(m.status)} className="text-[10px] py-0 h-4">
              {STATUS_LABEL[m.status] ?? m.status}
            </Badge>
            <span className="text-muted-foreground">
              {format(new Date(m.created_at), "dd/MM HH:mm", { locale: ptBR })}
            </span>
          </div>
        );
      })}
    </div>
  );
}
