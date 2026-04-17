import { useRef, useState } from "react";
import { Sparkles } from "lucide-react";
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { useUpsertSequenceStep, type SequenceStep } from "@/hooks/sequences/useSequenceSteps";
import { CHANNEL_META, type ChannelKey } from "./sequenceHelpers";
import { AIEmailComposerPanel } from "./AIEmailComposerPanel";
import { EmailVariablesHelper } from "./EmailVariablesHelper";

interface Props {
  open: boolean;
  onOpenChange: (v: boolean) => void;
  sequenceId: string;
  step: SequenceStep | null;
  nextOrder: number;
}

export function SequenceStepDialog({ open, onOpenChange, sequenceId, step, nextOrder }: Props) {
  const [channel, setChannel] = useState<ChannelKey>(step?.channel as ChannelKey ?? "email");
  const [days, setDays] = useState(step?.delay_days ?? 0);
  const [hours, setHours] = useState(step?.delay_hours ?? 0);
  const [subject, setSubject] = useState(step?.subject ?? "");
  const [body, setBody] = useState(step?.body ?? "");
  const [showAI, setShowAI] = useState(false);
  const bodyRef = useRef<HTMLTextAreaElement>(null);
  const upsert = useUpsertSequenceStep();

  const insertVariable = (token: string) => {
    const el = bodyRef.current;
    if (!el) {
      setBody((b) => b + token);
      return;
    }
    const start = el.selectionStart ?? body.length;
    const end = el.selectionEnd ?? body.length;
    const next = body.slice(0, start) + token + body.slice(end);
    setBody(next);
    requestAnimationFrame(() => {
      el.focus();
      const pos = start + token.length;
      el.setSelectionRange(pos, pos);
    });
  };

  const handleSave = async () => {
    await upsert.mutateAsync({
      id: step?.id,
      sequence_id: sequenceId,
      step_order: step?.step_order ?? nextOrder,
      channel,
      delay_days: Number(days),
      delay_hours: Number(hours),
      subject: subject || null,
      body: body || null,
    });
    onOpenChange(false);
  };

  const supportsAI = channel === "email" || channel === "linkedin";

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{step ? "Editar passo" : "Novo passo"}</DialogTitle>
        </DialogHeader>
        <div className="space-y-4">
          <div>
            <Label>Canal</Label>
            <Select value={channel} onValueChange={(v) => setChannel(v as ChannelKey)}>
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent>
                {Object.entries(CHANNEL_META).map(([k, m]) => (
                  <SelectItem key={k} value={k}>{m.label}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <Label>Aguardar (dias)</Label>
              <Input type="number" min={0} value={days} onChange={(e) => setDays(Number(e.target.value))} />
            </div>
            <div>
              <Label>Aguardar (horas)</Label>
              <Input type="number" min={0} max={23} value={hours} onChange={(e) => setHours(Number(e.target.value))} />
            </div>
          </div>
          {supportsAI && (
            <div>
              <Label>Assunto</Label>
              <Input value={subject} onChange={(e) => setSubject(e.target.value)} placeholder="Re: Proposta..." />
            </div>
          )}
          <div>
            <div className="flex items-center justify-between mb-1">
              <Label>Mensagem / Anotação</Label>
              {supportsAI && (
                <Button
                  type="button"
                  size="sm"
                  variant="ghost"
                  className="h-7 text-primary hover:text-primary"
                  onClick={() => setShowAI((v) => !v)}
                >
                  <Sparkles className="h-3.5 w-3.5 mr-1" />
                  {showAI ? "Ocultar IA" : "Compor com IA"}
                </Button>
              )}
            </div>
            <Textarea
              ref={bodyRef}
              rows={6}
              value={body}
              onChange={(e) => setBody(e.target.value)}
              placeholder="Olá {{nome}}..."
            />
            {supportsAI && (
              <div className="mt-2">
                <div className="text-xs text-muted-foreground mb-1.5">Inserir variável:</div>
                <EmailVariablesHelper onInsert={insertVariable} />
              </div>
            )}
          </div>
          {showAI && supportsAI && (
            <AIEmailComposerPanel
              onAccept={(s, b) => {
                setSubject(s);
                setBody(b);
              }}
              onClose={() => setShowAI(false)}
            />
          )}
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>Cancelar</Button>
          <Button onClick={handleSave} loading={upsert.isPending}>Salvar passo</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
