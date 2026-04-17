import { Button } from "@/components/ui/button";
import { Sparkles, Loader2 } from "lucide-react";
import { useTranscribeRecording } from "@/hooks/conversational/useTranscribeRecording";

export function TranscribeButton({
  recordingId,
  status,
  className,
}: {
  recordingId: string;
  status: string;
  className?: string;
}) {
  const transcribe = useTranscribeRecording();
  const disabled = transcribe.isPending || status === "transcribing";
  const label =
    status === "transcribing" || transcribe.isPending
      ? "Transcrevendo..."
      : status === "failed"
        ? "Tentar novamente"
        : "Transcrever com IA";

  return (
    <Button
      variant="glow"
      size="sm"
      className={`gap-2 ${className ?? ""}`}
      disabled={disabled}
      onClick={() => transcribe.mutate(recordingId)}
    >
      {disabled ? <Loader2 className="h-4 w-4 animate-spin" /> : <Sparkles className="h-4 w-4" />}
      {label}
    </Button>
  );
}
