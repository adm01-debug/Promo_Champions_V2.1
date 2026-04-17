import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { CHANNEL_META, formatDelay, type ChannelKey } from "./sequenceHelpers";
import type { SequenceStep } from "@/hooks/sequences/useSequenceSteps";
import { Pencil, Trash2, GripVertical } from "lucide-react";
import { StepVariantBadge } from "./StepVariantBadge";

interface Props {
  step: SequenceStep;
  index: number;
  onEdit: () => void;
  onDelete: () => void;
}

export function SequenceStepCard({ step, index, onEdit, onDelete }: Props) {
  const meta = CHANNEL_META[step.channel as ChannelKey] ?? CHANNEL_META.task;
  const Icon = meta.icon;

  return (
    <Card className="p-4 hover:shadow-md transition-shadow">
      <div className="flex items-start gap-3">
        <div className="flex flex-col items-center gap-2 pt-1">
          <GripVertical className="h-4 w-4 text-muted-foreground/40" />
          <Badge variant="outline" className="font-mono text-xs">{index + 1}</Badge>
        </div>
        <div className={`p-2 rounded-lg bg-muted ${meta.color}`}>
          <Icon className="h-5 w-5" />
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 flex-wrap mb-1">
            <span className="font-medium">{meta.label}</span>
            <Badge variant="secondary" className="text-xs">
              {formatDelay(step.delay_days, step.delay_hours)}
            </Badge>
            <StepVariantBadge stepId={step.id} />
          </div>
          {step.subject && (
            <p className="text-sm font-medium truncate text-foreground">{step.subject}</p>
          )}
          {step.body && (
            <p className="text-xs text-muted-foreground line-clamp-2 mt-1">{step.body}</p>
          )}
        </div>
        <div className="flex gap-1">
          <Button variant="ghost" size="icon-sm" onClick={onEdit}>
            <Pencil className="h-4 w-4" />
          </Button>
          <Button variant="ghost" size="icon-sm" onClick={onDelete}>
            <Trash2 className="h-4 w-4" />
          </Button>
        </div>
      </div>
    </Card>
  );
}
