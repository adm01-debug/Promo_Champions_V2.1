import { Button } from "@/components/ui/button";
import { Loader2, Mic2 } from "lucide-react";
import { useDiarizeRecording } from "@/hooks/conversational/useDiarizeRecording";

interface Props {
  recordingId: string;
  hasTranscript: boolean;
  alreadyDiarized: boolean;
}

export function DiarizeButton({ recordingId, hasTranscript, alreadyDiarized }: Props) {
  const m = useDiarizeRecording();
  if (!hasTranscript) return null;
  return (
    <Button
      size="sm"
      variant={alreadyDiarized ? "outline" : "default"}
      onClick={() => m.mutate(recordingId)}
      disabled={m.isPending}
    >
      {m.isPending ? (
        <>
          <Loader2 className="h-3.5 w-3.5 mr-2 animate-spin" />
          Diarizando…
        </>
      ) : (
        <>
          <Mic2 className="h-3.5 w-3.5 mr-2" />
          {alreadyDiarized ? "Re-diarizar" : "Diarizar com IA"}
        </>
      )}
    </Button>
  );
}
