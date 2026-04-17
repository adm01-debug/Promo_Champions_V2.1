import { useState } from "react";
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { useUpsertSequenceStep, type SequenceStep } from "@/hooks/sequences/useSequenceSteps";
import { CHANNEL_META, type ChannelKey } from "./sequenceHelpers";

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
  const upsert = useUpsertSequenceStep();

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

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
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
          {(channel === "email" || channel === "linkedin") && (
            <div>
              <Label>Assunto</Label>
              <Input value={subject} onChange={(e) => setSubject(e.target.value)} placeholder="Re: Proposta..." />
            </div>
          )}
          <div>
            <Label>Mensagem / Anotação</Label>
            <Textarea rows={5} value={body} onChange={(e) => setBody(e.target.value)} placeholder="Olá {{nome}}..." />
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>Cancelar</Button>
          <Button onClick={handleSave} loading={upsert.isPending}>Salvar passo</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
