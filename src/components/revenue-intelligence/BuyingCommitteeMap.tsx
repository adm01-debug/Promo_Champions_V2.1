import { FC, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Plus, Trash2, Crown, ShieldOff, Star, Users, UserX } from "lucide-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import {
  useBuyingCommittee,
  useUpsertCommitteeMember,
  useDeleteCommitteeMember,
  type BuyingCommitteeMember,
} from "@/hooks/revenue/useRevenueIntelligenceHub";

interface Props {
  saleId: string;
}

const roleConfig: Record<string, { icon: typeof Crown; label: string; color: string }> = {
  champion: { icon: Crown, label: "Champion", color: "text-emerald-500" },
  decision_maker: { icon: Star, label: "Decisor", color: "text-primary" },
  influencer: { icon: Users, label: "Influenciador", color: "text-blue-500" },
  blocker: { icon: ShieldOff, label: "Blocker", color: "text-destructive" },
  user: { icon: UserX, label: "Usuário", color: "text-muted-foreground" },
};

export const BuyingCommitteeMap: FC<Props> = ({ saleId }) => {
  const { data: members = [], isLoading } = useBuyingCommittee(saleId);
  const upsert = useUpsertCommitteeMember();
  const del = useDeleteCommitteeMember();
  const [open, setOpen] = useState(false);
  const [draft, setDraft] = useState<Partial<BuyingCommitteeMember>>({
    contact_name: "",
    committee_role: "user",
    influence_level: 3,
    sentiment: "neutral",
  });

  const handleSave = async () => {
    if (!draft.contact_name) return;
    await upsert.mutateAsync({ ...draft, sale_id: saleId, contact_name: draft.contact_name });
    setOpen(false);
    setDraft({ contact_name: "", committee_role: "user", influence_level: 3, sentiment: "neutral" });
  };

  return (
    <Card className="glass border-border/40">
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="font-display">Comitê de Compra</CardTitle>
          <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
              <Button size="sm"><Plus className="h-4 w-4 mr-2" />Adicionar</Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader><DialogTitle>Novo membro do comitê</DialogTitle></DialogHeader>
              <div className="space-y-3">
                <div>
                  <Label>Nome</Label>
                  <Input value={draft.contact_name ?? ""} onChange={(e) => setDraft({ ...draft, contact_name: e.target.value })} />
                </div>
                <div>
                  <Label>Cargo</Label>
                  <Input value={draft.job_title ?? ""} onChange={(e) => setDraft({ ...draft, job_title: e.target.value })} />
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <Label>Papel</Label>
                    <Select value={draft.committee_role} onValueChange={(v) => setDraft({ ...draft, committee_role: v as BuyingCommitteeMember["committee_role"] })}>
                      <SelectTrigger><SelectValue /></SelectTrigger>
                      <SelectContent>
                        <SelectItem value="champion">Champion</SelectItem>
                        <SelectItem value="decision_maker">Decisor</SelectItem>
                        <SelectItem value="influencer">Influenciador</SelectItem>
                        <SelectItem value="blocker">Blocker</SelectItem>
                        <SelectItem value="user">Usuário</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label>Influência (1-5)</Label>
                    <Input type="number" min={1} max={5} value={draft.influence_level} onChange={(e) => setDraft({ ...draft, influence_level: Number(e.target.value) })} />
                  </div>
                </div>
                <div>
                  <Label>Sentimento</Label>
                  <Select value={draft.sentiment} onValueChange={(v) => setDraft({ ...draft, sentiment: v as BuyingCommitteeMember["sentiment"] })}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="positive">Positivo</SelectItem>
                      <SelectItem value="neutral">Neutro</SelectItem>
                      <SelectItem value="negative">Negativo</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <Button onClick={handleSave} disabled={upsert.isPending} className="w-full">Salvar</Button>
              </div>
            </DialogContent>
          </Dialog>
        </div>
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <div className="text-center text-sm text-muted-foreground py-4">Carregando...</div>
        ) : members.length === 0 ? (
          <div className="text-center text-sm text-muted-foreground py-8">
            Nenhum membro mapeado. Adicione contatos para construir o comitê de compra.
          </div>
        ) : (
          <div className="grid gap-2 md:grid-cols-2">
            {members.map((m) => {
              const cfg = roleConfig[m.committee_role] ?? roleConfig.user;
              const Icon = cfg.icon;
              return (
                <div key={m.id} className="flex items-center justify-between p-3 rounded-lg border border-border/40 bg-card/50">
                  <div className="flex items-center gap-3">
                    <Icon className={`h-5 w-5 ${cfg.color}`} />
                    <div>
                      <div className="font-medium text-sm">{m.contact_name}</div>
                      <div className="text-xs text-muted-foreground">{m.job_title ?? "—"}</div>
                      <div className="flex gap-1 mt-1">
                        <Badge variant="outline" className="text-xs">{cfg.label}</Badge>
                        <Badge variant="outline" className="text-xs">Inf. {m.influence_level}/5</Badge>
                      </div>
                    </div>
                  </div>
                  <Button size="icon" variant="ghost" onClick={() => del.mutate(m.id)}>
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              );
            })}
          </div>
        )}
      </CardContent>
    </Card>
  );
};
