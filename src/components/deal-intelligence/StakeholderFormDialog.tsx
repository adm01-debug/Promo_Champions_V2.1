import { useEffect, useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useUpsertStakeholder, type DealStakeholder } from "@/hooks/deal-intelligence/useDealStakeholders";
import type { DMURole, InfluenceLevel, Sentiment } from "./committeeHelpers";

interface Props {
  open: boolean;
  onOpenChange: (o: boolean) => void;
  saleId: string;
  ownerId: string;
  initial?: DealStakeholder | null;
}

const emptyDraft = {
  name: "", role_title: "", dmu_role: "unknown" as DMURole,
  influence_level: "medium" as InfluenceLevel, sentiment: "neutral" as Sentiment,
  email: "", phone: "", linkedin_url: "", notes: "",
};

export function StakeholderFormDialog({ open, onOpenChange, saleId, ownerId, initial }: Props) {
  const [draft, setDraft] = useState(emptyDraft);
  const upsert = useUpsertStakeholder();

  useEffect(() => {
    if (initial) {
      setDraft({
        name: initial.name, role_title: initial.role_title || "",
        dmu_role: initial.dmu_role, influence_level: initial.influence_level, sentiment: initial.sentiment,
        email: initial.email || "", phone: initial.phone || "",
        linkedin_url: initial.linkedin_url || "", notes: initial.notes || "",
      });
    } else if (open) {
      setDraft(emptyDraft);
    }
  }, [initial, open]);

  const handleSave = async () => {
    if (!draft.name.trim()) return;
    await upsert.mutateAsync({
      ...(initial?.id ? { id: initial.id } : {}),
      sale_id: saleId,
      owner_id: ownerId,
      name: draft.name.trim(),
      role_title: draft.role_title || null,
      dmu_role: draft.dmu_role,
      influence_level: draft.influence_level,
      sentiment: draft.sentiment,
      email: draft.email || null,
      phone: draft.phone || null,
      linkedin_url: draft.linkedin_url || null,
      notes: draft.notes || null,
    });
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle>{initial ? "Editar stakeholder" : "Novo stakeholder"}</DialogTitle>
        </DialogHeader>
        <div className="space-y-3 py-2">
          <div className="grid grid-cols-2 gap-3">
            <div>
              <Label htmlFor="sh-name">Nome *</Label>
              <Input id="sh-name" value={draft.name} onChange={(e) => setDraft({ ...draft, name: e.target.value })} />
            </div>
            <div>
              <Label htmlFor="sh-title">Cargo</Label>
              <Input id="sh-title" value={draft.role_title} onChange={(e) => setDraft({ ...draft, role_title: e.target.value })} />
            </div>
          </div>

          <div className="grid grid-cols-3 gap-3">
            <div>
              <Label>Papel DMU</Label>
              <Select value={draft.dmu_role} onValueChange={(v) => setDraft({ ...draft, dmu_role: v as DMURole })}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="decision_maker">Decisor</SelectItem>
                  <SelectItem value="economic_buyer">Comprador Econômico</SelectItem>
                  <SelectItem value="champion">Champion</SelectItem>
                  <SelectItem value="influencer">Influenciador</SelectItem>
                  <SelectItem value="user">Usuário</SelectItem>
                  <SelectItem value="blocker">Blocker</SelectItem>
                  <SelectItem value="unknown">Indefinido</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label>Influência</Label>
              <Select value={draft.influence_level} onValueChange={(v) => setDraft({ ...draft, influence_level: v as InfluenceLevel })}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="low">Baixa</SelectItem>
                  <SelectItem value="medium">Média</SelectItem>
                  <SelectItem value="high">Alta</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label>Sentimento</Label>
              <Select value={draft.sentiment} onValueChange={(v) => setDraft({ ...draft, sentiment: v as Sentiment })}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="positive">Positivo</SelectItem>
                  <SelectItem value="neutral">Neutro</SelectItem>
                  <SelectItem value="negative">Negativo</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div><Label htmlFor="sh-email">E-mail</Label><Input id="sh-email" type="email" value={draft.email} onChange={(e) => setDraft({ ...draft, email: e.target.value })} /></div>
            <div><Label htmlFor="sh-phone">Telefone</Label><Input id="sh-phone" value={draft.phone} onChange={(e) => setDraft({ ...draft, phone: e.target.value })} /></div>
          </div>
          <div><Label htmlFor="sh-linkedin">LinkedIn</Label><Input id="sh-linkedin" value={draft.linkedin_url} onChange={(e) => setDraft({ ...draft, linkedin_url: e.target.value })} /></div>
          <div><Label htmlFor="sh-notes">Notas</Label><Textarea id="sh-notes" rows={2} value={draft.notes} onChange={(e) => setDraft({ ...draft, notes: e.target.value })} /></div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>Cancelar</Button>
          <Button onClick={handleSave} disabled={upsert.isPending || !draft.name.trim()}>Salvar</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
