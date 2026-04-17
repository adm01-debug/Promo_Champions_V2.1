import { useMemo, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Copy, ChevronDown, ChevronUp, FileText } from "lucide-react";
import { toast } from "sonner";

interface Props {
  transcript: string;
  language?: string | null;
  transcribedAt?: string | null;
}

export function TranscriptViewer({ transcript, language, transcribedAt }: Props) {
  const [expanded, setExpanded] = useState(true);

  const { wordCount, lines } = useMemo(() => {
    const wc = transcript.trim().split(/\s+/).filter(Boolean).length;
    const ls = transcript.split(/\n+/).map((l) => l.trim()).filter(Boolean);
    return { wordCount: wc, lines: ls };
  }, [transcript]);

  const handleCopy = async () => {
    await navigator.clipboard.writeText(transcript);
    toast.success("Transcrição copiada!");
  };

  return (
    <Card className="glass border-border/40">
      <CardHeader className="pb-3 flex flex-row items-center justify-between space-y-0">
        <CardTitle className="text-sm font-medium flex items-center gap-2">
          <FileText className="h-4 w-4 text-primary" /> Transcrição
          <Badge variant="secondary" className="ml-1 text-[10px]">
            {wordCount} palavras
          </Badge>
          {language && (
            <Badge variant="outline" className="text-[10px] uppercase">
              {language}
            </Badge>
          )}
        </CardTitle>
        <div className="flex items-center gap-1">
          <Button variant="ghost" size="icon" className="h-7 w-7" onClick={handleCopy} aria-label="Copiar">
            <Copy className="h-3.5 w-3.5" />
          </Button>
          <Button
            variant="ghost"
            size="icon"
            className="h-7 w-7"
            onClick={() => setExpanded((v) => !v)}
            aria-label={expanded ? "Recolher" : "Expandir"}
          >
            {expanded ? <ChevronUp className="h-3.5 w-3.5" /> : <ChevronDown className="h-3.5 w-3.5" />}
          </Button>
        </div>
      </CardHeader>
      {expanded && (
        <CardContent className="space-y-2 max-h-[400px] overflow-y-auto pr-2">
          {lines.map((line, idx) => {
            const isSeller = /^vendedor\s*:/i.test(line);
            const isClient = /^cliente\s*:/i.test(line);
            return (
              <p
                key={idx}
                className={`text-sm leading-relaxed rounded-md px-2 py-1 ${
                  isSeller
                    ? "bg-primary/5 border-l-2 border-primary/60"
                    : isClient
                      ? "bg-accent/30 border-l-2 border-accent-foreground/40"
                      : "text-muted-foreground"
                }`}
              >
                {line}
              </p>
            );
          })}
          {transcribedAt && (
            <p className="text-[10px] text-muted-foreground pt-2 border-t border-border/40 mt-2">
              Transcrito em {new Date(transcribedAt).toLocaleString("pt-BR")}
            </p>
          )}
        </CardContent>
      )}
    </Card>
  );
}
