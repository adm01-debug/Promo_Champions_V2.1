import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { Loader2, Sparkles, Wand2 } from "lucide-react";
import { useAnalyzeConversation } from "@/hooks/conversation-intelligence/useAnalyzeConversation";
import type { ConvSource } from "./conversationHelpers";

interface Props {
  saleId?: string;
  trigger?: React.ReactNode;
}

export const TranscriptAnalyzerDialog = ({ saleId, trigger }: Props) => {
  const [open, setOpen] = useState(false);
  const [source, setSource] = useState<ConvSource>("call");
  const [transcript, setTranscript] = useState("");
  const mutation = useAnalyzeConversation();

  const handleAnalyze = async () => {
    if (transcript.trim().length < 30) return;
    await mutation.mutateAsync({ sale_id: saleId, source, transcript });
    setTranscript("");
    setOpen(false);
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        {trigger ?? (
          <Button size="sm" className="gap-2">
            <Wand2 className="h-4 w-4" />
            Analisar com IA
          </Button>
        )}
      </DialogTrigger>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Sparkles className="h-5 w-5 text-primary" />
            Análise de Conversa com IA
          </DialogTitle>
        </DialogHeader>
        <div className="space-y-4">
          <div className="space-y-2">
            <Label>Fonte</Label>
            <Select value={source} onValueChange={(v) => setSource(v as ConvSource)}>
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="call">📞 Call</SelectItem>
                <SelectItem value="meeting">🤝 Reunião</SelectItem>
                <SelectItem value="email">✉️ E-mail</SelectItem>
                <SelectItem value="whatsapp">💬 WhatsApp</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-2">
            <Label>Transcrição / Texto</Label>
            <Textarea
              value={transcript}
              onChange={(e) => setTranscript(e.target.value)}
              rows={10}
              placeholder="Cole aqui a transcrição da call, e-mail ou conversa…"
              className="font-mono text-sm"
            />
            <p className="text-xs text-muted-foreground">
              {transcript.length} caracteres • mínimo 30
            </p>
          </div>
          <div className="flex justify-end gap-2">
            <Button variant="ghost" onClick={() => setOpen(false)}>Cancelar</Button>
            <Button
              onClick={handleAnalyze}
              disabled={mutation.isPending || transcript.trim().length < 30}
              className="gap-2"
            >
              {mutation.isPending ? (
                <><Loader2 className="h-4 w-4 animate-spin" /> Analisando…</>
              ) : (
                <><Sparkles className="h-4 w-4" /> Analisar com IA</>
              )}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};
