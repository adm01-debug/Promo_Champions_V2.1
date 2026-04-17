import { useRef, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Upload, FileAudio, X } from "lucide-react";
import { useUploadCallRecording } from "@/hooks/conversational/useUploadCallRecording";
import { toast } from "sonner";

const ACCEPTED = ["audio/mpeg", "audio/mp3", "audio/wav", "audio/webm", "audio/ogg", "audio/m4a", "audio/x-m4a"];
const MAX_BYTES = 50 * 1024 * 1024; // 50MB

export function CallRecordingUploader({ onUploaded }: { onUploaded?: (id: string) => void }) {
  const upload = useUploadCallRecording();
  const inputRef = useRef<HTMLInputElement>(null);
  const [file, setFile] = useState<File | null>(null);
  const [title, setTitle] = useState("");
  const [duration, setDuration] = useState<number>(0);
  const [dragOver, setDragOver] = useState(false);

  const handleFile = (f: File | null) => {
    if (!f) return;
    if (f.size > MAX_BYTES) {
      toast.error("Arquivo excede 50MB");
      return;
    }
    if (!ACCEPTED.includes(f.type) && !/\.(mp3|wav|webm|ogg|m4a)$/i.test(f.name)) {
      toast.error("Formato não suportado. Use MP3, WAV, WEBM, OGG ou M4A.");
      return;
    }
    setFile(f);
    if (!title) setTitle(f.name.replace(/\.[^.]+$/, ""));

    // tenta extrair duração via metadata
    const audio = new Audio();
    audio.preload = "metadata";
    audio.onloadedmetadata = () => {
      if (Number.isFinite(audio.duration)) setDuration(Math.round(audio.duration));
      URL.revokeObjectURL(audio.src);
    };
    audio.src = URL.createObjectURL(f);
  };

  const handleSubmit = () => {
    if (!file || !title.trim()) return;
    upload.mutate(
      { file, title: title.trim(), duration_seconds: duration },
      {
        onSuccess: (res) => {
          setFile(null);
          setTitle("");
          setDuration(0);
          if (inputRef.current) inputRef.current.value = "";
          onUploaded?.(res.id);
        },
      }
    );
  };

  return (
    <Card className="glass border-border/40">
      <CardHeader className="pb-3">
        <CardTitle className="text-sm font-medium flex items-center gap-2">
          <Upload className="h-4 w-4 text-primary" /> Upload de áudio
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        <div
          onDragOver={(e) => {
            e.preventDefault();
            setDragOver(true);
          }}
          onDragLeave={() => setDragOver(false)}
          onDrop={(e) => {
            e.preventDefault();
            setDragOver(false);
            handleFile(e.dataTransfer.files?.[0] ?? null);
          }}
          onClick={() => inputRef.current?.click()}
          className={`flex flex-col items-center justify-center gap-2 rounded-lg border-2 border-dashed p-6 cursor-pointer transition-colors ${
            dragOver ? "border-primary bg-primary/5" : "border-border/60 hover:border-primary/40"
          }`}
        >
          <FileAudio className="h-8 w-8 text-muted-foreground" />
          {file ? (
            <div className="flex items-center gap-2 text-sm">
              <span className="font-medium truncate max-w-[200px]">{file.name}</span>
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  setFile(null);
                  if (inputRef.current) inputRef.current.value = "";
                }}
                className="text-muted-foreground hover:text-destructive"
                aria-label="Remover arquivo"
              >
                <X className="h-4 w-4" />
              </button>
            </div>
          ) : (
            <>
              <p className="text-sm font-medium">Arraste um áudio aqui</p>
              <p className="text-[10px] text-muted-foreground">MP3, WAV, WEBM, OGG, M4A — até 50MB</p>
            </>
          )}
          <input
            ref={inputRef}
            type="file"
            accept="audio/*"
            className="hidden"
            onChange={(e) => handleFile(e.target.files?.[0] ?? null)}
          />
        </div>

        <div className="space-y-1">
          <Label className="text-xs">Título</Label>
          <Input
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="Ex: Discovery Acme Ltda"
            className="h-9 text-sm"
          />
        </div>

        {duration > 0 && (
          <p className="text-[10px] text-muted-foreground">
            Duração detectada: {Math.floor(duration / 60)}:{String(duration % 60).padStart(2, "0")}
          </p>
        )}

        <Button
          variant="glow"
          className="w-full gap-2"
          onClick={handleSubmit}
          disabled={!file || !title.trim() || upload.isPending}
        >
          <Upload className="h-4 w-4" />
          {upload.isPending ? "Enviando..." : "Enviar gravação"}
        </Button>
      </CardContent>
    </Card>
  );
}
