import { useState } from "react";
import { Send } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { useTestChannelSend, type ChannelKind } from "@/hooks/multichannel/useChannelCredentials";
import { normalizePhone } from "./multichannelHelpers";

interface Props {
  channel: ChannelKind;
}

export function TestSendButton({ channel }: Props) {
  const [open, setOpen] = useState(false);
  const [to, setTo] = useState("");
  const [body, setBody] = useState("Teste de envio via Promo Champions ✅");
  const test = useTestChannelSend();

  const handleSend = async () => {
    await test.mutateAsync({ channel, to: normalizePhone(to), body });
    setOpen(false);
  };

  return (
    <>
      <Button variant="outline" size="sm" onClick={() => setOpen(true)}>
        <Send className="h-3.5 w-3.5 mr-1" /> Enviar teste
      </Button>
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="max-w-sm">
          <DialogHeader><DialogTitle>Enviar mensagem de teste</DialogTitle></DialogHeader>
          <div className="space-y-3">
            <div>
              <Label>Para</Label>
              <Input value={to} onChange={(e) => setTo(e.target.value)} placeholder="+5511999999999" />
            </div>
            <div>
              <Label>Mensagem</Label>
              <Textarea value={body} onChange={(e) => setBody(e.target.value)} rows={3} />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setOpen(false)}>Cancelar</Button>
            <Button onClick={handleSend} loading={test.isPending} disabled={!to || !body}>Enviar</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
