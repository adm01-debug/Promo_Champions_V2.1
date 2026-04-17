import { Badge } from "@/components/ui/badge";
import { Pause } from "lucide-react";
import { autoPauseLabel, autoPauseVariant } from "./autoReplyHelpers";

interface Props {
  reason: string | null | undefined;
  pausedAt: string | null | undefined;
}

export function AutoPausedBadge({ reason, pausedAt }: Props) {
  if (!pausedAt) return null;
  return (
    <Badge variant={autoPauseVariant(reason)} className="gap-1 text-[10px] py-0 h-5">
      <Pause className="h-2.5 w-2.5" />
      {autoPauseLabel(reason)}
    </Badge>
  );
}
