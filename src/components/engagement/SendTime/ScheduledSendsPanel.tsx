import { Clock, Mail, MessageSquare, Linkedin, X, AlertCircle, CheckCircle2 } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  useScheduledSends,
  useCancelScheduledSend,
  type ScheduledSend,
} from "@/hooks/sequences/useSendTimeOptimization";

const channelIcon = (c: string) => {
  if (c === "email") return <Mail className="h-3 w-3" />;
  if (c === "whatsapp") return <MessageSquare className="h-3 w-3" />;
  if (c === "linkedin") return <Linkedin className="h-3 w-3" />;
  return <Clock className="h-3 w-3" />;
};

const STATUS_TONE: Record<ScheduledSend["status"], "default" | "secondary" | "destructive" | "outline"> = {
  pending: "secondary",
  sent: "default",
  failed: "destructive",
  cancelled: "outline",
};

const STATUS_LABEL: Record<ScheduledSend["status"], string> = {
  pending: "Pendente",
  sent: "Enviado",
  failed: "Falhou",
  cancelled: "Cancelado",
};

const SOURCE_LABEL: Record<string, string> = {
  profile: "Perfil IA",
  global: "Global",
  manual: "Manual",
};

interface Props {
  status?: ScheduledSend["status"] | "all";
  showHeader?: boolean;
}

export function ScheduledSendsPanel({ status = "pending", showHeader = true }: Props) {
  const { data: sends = [], isLoading } = useScheduledSends(status);
  const cancel = useCancelScheduledSend();

  const fmt = (iso: string) =>
    new Date(iso).toLocaleString("pt-BR", { day: "2-digit", month: "2-digit", hour: "2-digit", minute: "2-digit" });

  return (
    <Card>
      {showHeader && (
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-base">
            <Clock className="h-4 w-4 text-primary" /> Envios agendados
            <Badge variant="outline" className="ml-1">{sends.length}</Badge>
          </CardTitle>
        </CardHeader>
      )}
      <CardContent className="space-y-2">
        {isLoading && <div className="text-sm text-muted-foreground py-4">Carregando…</div>}
        {!isLoading && sends.length === 0 && (
          <div className="text-sm text-muted-foreground py-4 text-center">
            Nenhum envio {status === "pending" ? "pendente" : ""}.
          </div>
        )}
        {sends.map((s) => {
          const subject = (s.payload as { subject?: string })?.subject ?? "—";
          return (
            <div
              key={s.id}
              className="flex items-center justify-between gap-3 p-3 rounded-lg border bg-card hover:bg-accent/5 transition-colors"
            >
              <div className="min-w-0 flex-1 space-y-1">
                <div className="flex items-center gap-2">
                  <Badge variant="outline" className="gap-1 text-xs">
                    {channelIcon(s.channel)} {s.channel}
                  </Badge>
                  <Badge variant={STATUS_TONE[s.status]} className="text-xs">
                    {s.status === "sent" && <CheckCircle2 className="h-3 w-3 mr-1" />}
                    {s.status === "failed" && <AlertCircle className="h-3 w-3 mr-1" />}
                    {STATUS_LABEL[s.status]}
                  </Badge>
                  <Badge variant="secondary" className="text-xs">
                    {SOURCE_LABEL[s.optimization_source] ?? s.optimization_source}
                  </Badge>
                </div>
                <div className="text-sm font-medium truncate">{subject}</div>
                <div className="text-xs text-muted-foreground">
                  Agendado para {fmt(s.scheduled_for)}
                  {s.error && <span className="text-destructive ml-2">· {s.error}</span>}
                </div>
              </div>
              {s.status === "pending" && (
                <Button
                  variant="ghost"
                  size="icon-sm"
                  onClick={() => cancel.mutate(s.id)}
                  disabled={cancel.isPending}
                  aria-label="Cancelar envio"
                >
                  <X className="h-4 w-4" />
                </Button>
              )}
            </div>
          );
        })}
      </CardContent>
    </Card>
  );
}
