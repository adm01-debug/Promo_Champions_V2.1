import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { ShieldOff, Mail } from "lucide-react";
import { useUpdateAutoPauseSettings } from "@/hooks/sequences/useAutoPause";

interface Props {
  sequenceId: string;
  autoPauseOnReply: boolean;
  autoPauseOnBounce: boolean;
}

export function AutoPauseSettingsCard({ sequenceId, autoPauseOnReply, autoPauseOnBounce }: Props) {
  const update = useUpdateAutoPauseSettings();

  return (
    <div className="rounded-lg border bg-card/50 px-4 py-3 space-y-3">
      <div className="flex items-center gap-2">
        <ShieldOff className="h-4 w-4 text-primary" />
        <span className="text-sm font-medium">Auto-pausa inteligente</span>
      </div>

      <div className="flex items-center justify-between gap-3">
        <div className="flex items-center gap-2">
          <Mail className="h-4 w-4 text-muted-foreground" />
          <Label htmlFor="apr-switch" className="text-sm cursor-pointer">
            Pausar quando o contato responder
          </Label>
        </div>
        <Switch
          id="apr-switch"
          checked={autoPauseOnReply}
          disabled={update.isPending}
          onCheckedChange={(v) => update.mutate({ id: sequenceId, auto_pause_on_reply: v })}
        />
      </div>

      <div className="flex items-center justify-between gap-3">
        <div className="flex items-center gap-2">
          <ShieldOff className="h-4 w-4 text-muted-foreground" />
          <Label htmlFor="apb-switch" className="text-sm cursor-pointer">
            Pausar em bounce / descadastro
          </Label>
        </div>
        <Switch
          id="apb-switch"
          checked={autoPauseOnBounce}
          disabled={update.isPending}
          onCheckedChange={(v) => update.mutate({ id: sequenceId, auto_pause_on_bounce: v })}
        />
      </div>

      <p className="text-xs text-muted-foreground">
        Quando ativo, a sequência para de enviar para o contato assim que detectamos resposta, bounce ou atividade inbound.
      </p>
    </div>
  );
}
