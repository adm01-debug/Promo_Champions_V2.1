import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { ChannelInteraction, Channel } from "@/hooks/useMultichannel";
import { ArrowUpRight, ArrowDownLeft, MessageCircle } from "lucide-react";
import { cn } from "@/lib/utils";
import { format, parseISO } from "date-fns";
import { ptBR } from "date-fns/locale";

const STATUS_COLORS: Record<string, string> = {
  sent: "bg-blue-500/20 text-blue-500 border-blue-500/30",
  delivered: "bg-status-info/20 text-status-info border-status-info/30",
  read: "bg-status-success/20 text-status-success border-status-success/30",
  replied: "bg-primary/20 text-primary border-primary/30",
  failed: "bg-status-error/20 text-status-error border-status-error/30",
  scheduled: "bg-status-warning/20 text-status-warning border-status-warning/30",
};

const STATUS_LABELS: Record<string, string> = {
  sent: "Enviado",
  delivered: "Entregue",
  read: "Lido",
  replied: "Respondido",
  failed: "Falhou",
  scheduled: "Agendado",
};

interface Props {
  interactions: ChannelInteraction[];
  isLoading: boolean;
  searchTerm: string;
  channelConfig: Record<string, { label: string; icon: typeof MessageCircle; color: string }>;
}

export function InteractionTimeline({ interactions, isLoading, searchTerm, channelConfig }: Props) {
  if (isLoading) {
    return (
      <div className="space-y-3">
        {Array.from({ length: 5 }).map((_, i) => (
          <Skeleton key={i} className="h-20 rounded-xl" />
        ))}
      </div>
    );
  }

  const filtered = interactions.filter(i =>
    !searchTerm || i.contact_name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (filtered.length === 0) {
    return (
      <Card className="p-12 text-center text-muted-foreground glass border-border/40">
        <MessageCircle className="h-12 w-12 mx-auto mb-3 opacity-30" />
        <p className="font-medium">Nenhuma interação encontrada</p>
        <p className="text-sm mt-1">Registre interações para vê-las aqui</p>
      </Card>
    );
  }

  return (
    <div className="space-y-2">
      {filtered.map(interaction => {
        const cfg = channelConfig[interaction.channel];
        const Icon = cfg?.icon || MessageCircle;
        const statusCls = STATUS_COLORS[interaction.status] || STATUS_COLORS.sent;

        return (
          <Card
            key={interaction.id}
            className="p-3 glass border-border/40 hover-lift transition-all"
          >
            <div className="flex items-start gap-3">
              {/* Channel Icon */}
              <div className={cn("p-2 rounded-lg bg-muted/50 shrink-0")}>
                <Icon className={cn("h-4 w-4", cfg?.color || "text-muted-foreground")} />
              </div>

              {/* Content */}
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-0.5">
                  <span className="font-semibold text-sm truncate">{interaction.contact_name}</span>
                  {interaction.direction === "outbound" ? (
                    <ArrowUpRight className="h-3 w-3 text-status-info shrink-0" />
                  ) : (
                    <ArrowDownLeft className="h-3 w-3 text-status-success shrink-0" />
                  )}
                  <Badge variant="outline" className={cn("text-[10px] shrink-0", statusCls)}>
                    {STATUS_LABELS[interaction.status] || interaction.status}
                  </Badge>
                </div>
                {interaction.message_preview && (
                  <p className="text-xs text-muted-foreground truncate">{interaction.message_preview}</p>
                )}
                <div className="flex items-center gap-2 mt-1 text-[10px] text-muted-foreground">
                  <span>{cfg?.label}</span>
                  <span>•</span>
                  <span>{format(parseISO(interaction.created_at), "dd MMM HH:mm", { locale: ptBR })}</span>
                  {interaction.contact_info && (
                    <>
                      <span>•</span>
                      <span className="truncate">{interaction.contact_info}</span>
                    </>
                  )}
                </div>
              </div>
            </div>
          </Card>
        );
      })}
    </div>
  );
}
