import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Send, Loader2 } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

interface Props {
  accountId: string;
  accountName?: string;
  onSent?: () => void;
}

export function SurveyTriggerDialog({ accountId, accountName, onSent }: Props) {
  const [open, setOpen] = useState(false);
  const [email, setEmail] = useState("");
  const [type, setType] = useState<"csat" | "ces">("csat");
  const [score, setScore] = useState<string>("");
  const [comment, setComment] = useState("");
  const [trigger, setTrigger] = useState("manual");
  const [sending, setSending] = useState(false);

  async function handleSend() {
    if (!email) {
      toast.error("Informe o email do contato");
      return;
    }
    setSending(true);
    try {
      const payload: Record<string, unknown> = {
        account_id: accountId,
        contact_email: email,
        survey_type: type,
        trigger_event: trigger,
      };
      if (score) payload.score = Number(score);
      if (comment) payload.comment = comment;

      const { data, error } = await supabase.functions.invoke("csat-ces-trigger", { body: payload });
      if (error) throw error;
      const d = data as { ok?: boolean; skipped?: boolean; error?: string };
      if (d.error) throw new Error(d.error);
      if (d.skipped) {
        toast.info("Pesquisa já enviada nas últimas 24h");
      } else {
        toast.success(`${type.toUpperCase()} registrado para ${accountName ?? "conta"}`);
      }
      setOpen(false);
      setEmail("");
      setScore("");
      setComment("");
      onSent?.();
    } catch (err) {
      toast.error(`Falha: ${err instanceof Error ? err.message : "erro"}`);
    } finally {
      setSending(false);
    }
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button size="sm" variant="outline">
          <Send className="h-3.5 w-3.5" />
          <span className="ml-2">Enviar Survey</span>
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[480px]">
        <DialogHeader>
          <DialogTitle>Disparar CSAT/CES</DialogTitle>
        </DialogHeader>
        <div className="space-y-4">
          <div className="grid gap-2">
            <Label>Tipo</Label>
            <Select value={type} onValueChange={(v) => setType(v as "csat" | "ces")}>
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="csat">CSAT — Satisfação (1–5)</SelectItem>
                <SelectItem value="ces">CES — Esforço (1–7)</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="grid gap-2">
            <Label>Email do contato</Label>
            <Input type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="contato@empresa.com" />
          </div>
          <div className="grid gap-2">
            <Label>Evento gatilho</Label>
            <Input value={trigger} onChange={(e) => setTrigger(e.target.value)} placeholder="ex: ticket_resolved, onboarding_completed" />
          </div>
          <div className="grid gap-2">
            <Label>Score (opcional — se já respondido)</Label>
            <Input type="number" min={1} max={type === "csat" ? 5 : 7} value={score} onChange={(e) => setScore(e.target.value)} placeholder={type === "csat" ? "1 a 5" : "1 a 7"} />
          </div>
          <div className="grid gap-2">
            <Label>Comentário (opcional)</Label>
            <Textarea value={comment} onChange={(e) => setComment(e.target.value)} rows={3} />
          </div>
          <Button onClick={handleSend} disabled={sending} className="w-full">
            {sending ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}
            <span className="ml-2">Enviar</span>
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
