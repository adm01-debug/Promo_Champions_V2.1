import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Settings, Trash2, Plus } from "lucide-react";
import {
  useCompetitorsRegistry,
  useUpsertCompetitor,
  useDeleteCompetitor,
  type CompetitorRegistry,
} from "@/hooks/conversational/useCompetitorsRegistry";

export function CompetitorsAdminDialog() {
  const [open, setOpen] = useState(false);
  const { data: competitors } = useCompetitorsRegistry();
  const upsert = useUpsertCompetitor();
  const del = useDeleteCompetitor();
  const [editing, setEditing] = useState<Partial<CompetitorRegistry> | null>(null);
  const [aliasesText, setAliasesText] = useState("");

  const startEdit = (c?: CompetitorRegistry) => {
    setEditing(c ?? { name: "", aliases: [], is_active: true });
    setAliasesText((c?.aliases ?? []).join(", "));
  };

  const save = async () => {
    if (!editing?.name?.trim()) return;
    await upsert.mutateAsync({
      ...editing,
      name: editing.name.trim(),
      aliases: aliasesText
        .split(",")
        .map((s) => s.trim())
        .filter(Boolean),
    });
    setEditing(null);
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" size="sm">
          <Settings className="h-4 w-4 mr-1" />
          Concorrentes
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>Gerenciar Concorrentes</DialogTitle>
        </DialogHeader>

        {!editing ? (
          <div className="space-y-2">
            <Button size="sm" onClick={() => startEdit()} className="w-full">
              <Plus className="h-4 w-4 mr-1" />
              Adicionar concorrente
            </Button>
            <div className="space-y-1 max-h-80 overflow-y-auto">
              {(competitors ?? []).map((c) => (
                <div
                  key={c.id}
                  className="flex items-center justify-between p-2 rounded border border-border hover:bg-muted/50"
                >
                  <div className="flex-1 min-w-0">
                    <p className="font-medium text-sm">{c.name}</p>
                    {c.aliases.length > 0 && (
                      <p className="text-xs text-muted-foreground truncate">
                        Aliases: {c.aliases.join(", ")}
                      </p>
                    )}
                  </div>
                  <div className="flex gap-1">
                    <Button size="sm" variant="ghost" onClick={() => startEdit(c)}>
                      Editar
                    </Button>
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={() => del.mutate(c.id)}
                    >
                      <Trash2 className="h-3 w-3 text-destructive" />
                    </Button>
                  </div>
                </div>
              ))}
              {(competitors ?? []).length === 0 && (
                <p className="text-xs text-muted-foreground text-center py-6">
                  Nenhum concorrente cadastrado.
                </p>
              )}
            </div>
          </div>
        ) : (
          <div className="space-y-3">
            <div>
              <Label>Nome *</Label>
              <Input
                value={editing.name ?? ""}
                onChange={(e) => setEditing({ ...editing, name: e.target.value })}
                placeholder="Ex: Salesforce"
              />
            </div>
            <div>
              <Label>Aliases (separados por vírgula)</Label>
              <Input
                value={aliasesText}
                onChange={(e) => setAliasesText(e.target.value)}
                placeholder="SF, sales force, sfdc"
              />
            </div>
            <div>
              <Label>Battle Card padrão (UUID, opcional)</Label>
              <Input
                value={editing.default_battle_card_id ?? ""}
                onChange={(e) =>
                  setEditing({
                    ...editing,
                    default_battle_card_id: e.target.value || null,
                  })
                }
                placeholder="UUID do asset em sales_enablement"
              />
            </div>
            <div className="flex items-center justify-between">
              <Label>Ativo</Label>
              <Switch
                checked={editing.is_active ?? true}
                onCheckedChange={(v) => setEditing({ ...editing, is_active: v })}
              />
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setEditing(null)}>
                Cancelar
              </Button>
              <Button onClick={save} loading={upsert.isPending}>
                Salvar
              </Button>
            </DialogFooter>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
