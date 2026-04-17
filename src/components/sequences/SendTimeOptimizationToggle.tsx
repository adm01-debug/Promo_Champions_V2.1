import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Tooltip, TooltipContent, TooltipTrigger, TooltipProvider } from "@/components/ui/tooltip";
import { Info, Clock } from "lucide-react";
import { useToggleSendTimeOptimization } from "@/hooks/sequences/useSendTimeOptimization";

interface Props {
  sequenceId: string;
  enabled: boolean;
}

export function SendTimeOptimizationToggle({ sequenceId, enabled }: Props) {
  const toggle = useToggleSendTimeOptimization();

  return (
    <TooltipProvider delayDuration={200}>
      <div className="flex items-center justify-between gap-3 rounded-lg border bg-card/50 px-4 py-3">
        <div className="flex items-center gap-3">
          <div className="flex h-9 w-9 items-center justify-center rounded-md bg-primary/10 text-primary">
            <Clock className="h-4 w-4" />
          </div>
          <div className="space-y-0.5">
            <div className="flex items-center gap-1.5">
              <Label htmlFor="sto-switch" className="text-sm font-medium cursor-pointer">
                Otimização de horário de envio
              </Label>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Info className="h-3.5 w-3.5 text-muted-foreground cursor-help" />
                </TooltipTrigger>
                <TooltipContent side="top" className="max-w-xs">
                  <p className="text-xs">
                    Quando ativado, a sequência aprende o melhor horário de cada contato (com base em opens, clicks e replies)
                    e adia envios de e-mail/LinkedIn para a próxima janela ótima dentro de 24h.
                  </p>
                </TooltipContent>
              </Tooltip>
            </div>
            <p className="text-xs text-muted-foreground">
              IA escolhe a melhor janela horária por contato
            </p>
          </div>
        </div>
        <Switch
          id="sto-switch"
          checked={enabled}
          disabled={toggle.isPending}
          onCheckedChange={(v) => toggle.mutate({ id: sequenceId, enabled: v })}
        />
      </div>
    </TooltipProvider>
  );
}
