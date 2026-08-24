import { Button } from "@/components/ui/button";
import { Sparkles } from "lucide-react";
import { useSummarizeRecording } from "@/hooks/conversational/useSummarizeRecording";

interface Props {
  recordingId: string;
  hasSummary: boolean;
  size?: "sm" | "default";
}

export const SummarizeButton = ({ recordingId, hasSummary, size = "sm" }: Props) => {
  const m = useSummarizeRecording();
  return (
    <Button
      size={size}
      variant={hasSummary ? "outline" : "glow"}
      loading={m.isPending}
      loadingText="Resumindo..."
      onClick={() => m.mutate(recordingId)}
    >
      <Sparkles className="size-3.5" />
      {hasSummary ? "Re-gerar resumo" : "Gerar resumo IA"}
    </Button>
  );
};
