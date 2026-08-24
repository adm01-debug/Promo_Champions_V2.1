import { Badge } from "@/components/ui/badge";
import { useStepVariants } from "@/hooks/sequences/useStepVariants";
import { FlaskConical } from "lucide-react";

export function StepVariantBadge({ stepId }: { stepId: string }) {
  const { data } = useStepVariants(stepId);
  if (!data || data.length === 0) return null;
  return (
    <Badge variant="outline" className="text-xs gap-1 border-primary/40 text-primary">
      <FlaskConical className="h-3 w-3" />
      A/B
    </Badge>
  );
}
