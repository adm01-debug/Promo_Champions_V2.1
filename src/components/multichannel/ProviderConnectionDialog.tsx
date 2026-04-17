import { useState } from "react";
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import {
  type ChannelKind,
  type ProviderKind,
  useCreateChannelCredential,
} from "@/hooks/multichannel/useChannelCredentials";
import { CHANNEL_LABEL, PROVIDER_LABEL, PROVIDER_FIELDS } from "./multichannelHelpers";

interface Props {
  open: boolean;
  onOpenChange: (v: boolean) => void;
}

export function ProviderConnectionDialog({ open, onOpenChange }: Props) {
  const [channel, setChannel] = useState<ChannelKind>("whatsapp");
  const [provider, setProvider] = useState<ProviderKind>("twilio");
  const [label, setLabel] = useState("");
  const [fromNumber, setFromNumber] = useState("");
  const [creds, setCreds] = useState<Record<string, string>>({});
  const create = useCreateChannelCredential();

  const fields = PROVIDER_FIELDS[provider];

  const reset = () => {
    setChannel("whatsapp");
    setProvider("twilio");
    setLabel("");
    setFromNumber("");
    setCreds({});
  };

  const handleSave = async () => {
    await create.mutateAsync({
      channel,
      provider,
      label: label || undefined,
      from_number: fromNumber || undefined,
      credentials: creds,
    });
    reset();
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={(v) => { onOpenChange(v); if (!v) reset(); }}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>Conectar canal</DialogTitle>
        </DialogHeader>
        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-3">
            <div>
              <Label>Canal</Label>
              <Select value={channel} onValueChange={(v) => setChannel(v as ChannelKind)}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  {Object.entries(CHANNEL_LABEL).map(([k, v]) => (
                    <SelectItem key={k} value={k}>{v}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label>Provedor</Label>
              <Select value={provider} onValueChange={(v) => { setProvider(v as ProviderKind); setCreds({}); }}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  {Object.entries(PROVIDER_LABEL).map(([k, v]) => (
                    <SelectItem key={k} value={k}>{v}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
          <div>
            <Label>Apelido (opcional)</Label>
            <Input value={label} onChange={(e) => setLabel(e.target.value)} placeholder="Ex: WhatsApp Vendas" />
          </div>
          <div>
            <Label>Número de origem</Label>
            <Input value={fromNumber} onChange={(e) => setFromNumber(e.target.value)} placeholder="+5511999999999" />
          </div>
          {fields.map((f) => (
            <div key={f.key}>
              <Label>{f.label}</Label>
              <Input
                type={f.secret ? "password" : "text"}
                value={creds[f.key] ?? ""}
                onChange={(e) => setCreds({ ...creds, [f.key]: e.target.value })}
              />
              {f.help && <p className="text-xs text-muted-foreground mt-1">{f.help}</p>}
            </div>
          ))}
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>Cancelar</Button>
          <Button onClick={handleSave} loading={create.isPending}>Conectar</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
