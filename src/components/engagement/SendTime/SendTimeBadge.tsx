import { Clock, Sparkles } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import { useSendTimeProfile } from "@/hooks/sequences/useSendTimeOptimization";
import { formatWindow, normalizeScore } from "@/components/sequences/sendTimeHelpers";
import { SendTimeHeatmap } from "./SendTimeHeatmap";

interface Props {
  saleId: string;
  variant?: "default" | "compact";
}

export function SendTimeBadge({ saleId, variant = "default" }: Props) {
  const { data: profile, isLoading } = useSendTimeProfile(saleId);

  if (isLoading) {
    return (
      <Badge variant="outline" className="gap-1 text-xs">
        <Clock className="h-3 w-3 animate-pulse" /> …
      </Badge>
    );
  }

  if (!profile || profile.sample_size === 0) {
    return (
      <Badge variant="outline" className="gap-1 text-xs text-muted-foreground">
        <Clock className="h-3 w-3" /> Sem dados
      </Badge>
    );
  }

  const conf = Math.round(Number(profile.confidence) * 100);
  const window = formatWindow(profile.best_dow, profile.best_hour);
  const isHigh = conf >= 60;

  return (
    <Tooltip>
      <TooltipTrigger asChild>
        <Badge
          variant={isHigh ? "default" : "secondary"}
          className="gap-1 text-xs cursor-help"
        >
          <Sparkles className="h-3 w-3" />
          {variant === "compact" ? window : `Melhor: ${window}`}
          <span className="opacity-70 ml-1">· {conf}%</span>
        </Badge>
      </TooltipTrigger>
      <TooltipContent className="max-w-sm">
        <div className="space-y-2">
          <div className="text-xs font-medium">
            Janela ótima de envio · amostra {profile.sample_size}
          </div>
          <SendTimeHeatmap
            hourDistribution={profile.hour_distribution}
            dowDistribution={profile.dow_distribution}
            compact
          />
          <div className="text-[10px] text-muted-foreground">
            Confiança: {conf}% (Wilson lower bound). Normalizado: {normalizeScore(conf, 100)}.
          </div>
        </div>
      </TooltipContent>
    </Tooltip>
  );
}
