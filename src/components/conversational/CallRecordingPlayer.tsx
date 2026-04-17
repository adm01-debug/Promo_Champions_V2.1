import { useEffect, useState } from "react";
import { getCallRecordingSignedUrl } from "@/hooks/conversational/useUploadCallRecording";
import { Skeleton } from "@/components/ui/skeleton";
import { AlertCircle } from "lucide-react";

interface Props {
  audioPath: string | null;
}

/**
 * Player de áudio que resolve URL assinada para arquivos privados em `call-recordings`.
 * Aceita também URLs absolutas (http) para casos de mock/legacy.
 */
export function CallRecordingPlayer({ audioPath }: Props) {
  const [url, setUrl] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    setError(false);
    setUrl(null);

    if (!audioPath) {
      setLoading(false);
      return;
    }

    if (audioPath.startsWith("http://") || audioPath.startsWith("https://")) {
      setUrl(audioPath);
      setLoading(false);
      return;
    }

    getCallRecordingSignedUrl(audioPath)
      .then((signed) => {
        if (cancelled) return;
        if (!signed) {
          setError(true);
        } else {
          setUrl(signed);
        }
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, [audioPath]);

  if (!audioPath) {
    return (
      <div className="flex items-center gap-2 text-xs text-muted-foreground p-3 rounded-md bg-muted/30">
        <AlertCircle className="h-3.5 w-3.5" />
        Nenhum áudio anexado a esta gravação.
      </div>
    );
  }

  if (loading) return <Skeleton className="h-12 w-full" />;

  if (error || !url) {
    return (
      <div className="flex items-center gap-2 text-xs text-destructive p-3 rounded-md bg-destructive/10">
        <AlertCircle className="h-3.5 w-3.5" />
        Não foi possível carregar o áudio.
      </div>
    );
  }

  return (
    <audio
      controls
      src={url}
      className="w-full h-10 rounded-md"
      preload="metadata"
    >
      Seu navegador não suporta áudio HTML5.
    </audio>
  );
}
