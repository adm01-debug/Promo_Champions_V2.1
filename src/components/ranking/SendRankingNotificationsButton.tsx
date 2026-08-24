import { FC } from "react";
import { Megaphone, Loader2 } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { useSendRankingNotifications } from "@/hooks/useRankingNotifications";

export const SendRankingNotificationsButton: FC<{ className?: string }> = ({ className }) => {
  const send = useSendRankingNotifications();

  const handleClick = () => {
    send.mutate(undefined, {
      onSuccess: (data) => toast.success(`Notificações enviadas para ${data.sent} vendedores`),
      onError: (e) => toast.error("Falha ao enviar", { description: e instanceof Error ? e.message : String(e) }),
    });
  };

  return (
    <Button
      onClick={handleClick}
      disabled={send.isPending}
      variant="outline"
      size="sm"
      className={className}
    >
      {send.isPending ? <Loader2 className="h-4 w-4 mr-2 animate-spin" /> : <Megaphone className="h-4 w-4 mr-2" />}
      {send.isPending ? "Enviando..." : "Notificar posições"}
    </Button>
  );
};
