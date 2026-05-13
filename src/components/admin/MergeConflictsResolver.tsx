import React, { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { cn } from "@/lib/utils";
import { Merge, AlertTriangle } from "lucide-react";

interface Client {
  id: string;
  name: string;
  email: string | null;
  phone: string | null;
  company: string | null;
  total_value: number;
}

interface MergeConflictsResolverProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  clients: Client[];
  onMerge: (targetId: string, duplicateIds: string[], preferredFields: Record<string, string>) => void;
  isMerging: boolean;
}

export const MergeConflictsResolver = ({ open, onOpenChange, clients, onMerge, isMerging }: MergeConflictsResolverProps) => {
  const [targetId, setTargetId] = useState(clients[0]?.id);
  const [preferredFields, setPreferredFields] = useState<Record<string, string>>({
    name: clients[0]?.name || "",
    email: clients[0]?.email || "",
    phone: clients[0]?.phone || "",
    company: clients[0]?.company || "",
  });

  if (clients.length === 0) return null;

  const handleMerge = () => {
    const duplicateIds = clients.filter(c => c.id !== targetId).map(c => c.id);
    onMerge(targetId, duplicateIds, preferredFields);
  };

  const fields = [
    { key: "name", label: "Nome" },
    { key: "email", label: "Email" },
    { key: "phone", label: "Telefone" },
    { key: "company", label: "Empresa" },
  ];

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl glass border-white/10 shadow-2xl">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-xl font-display italic uppercase tracking-tighter">
            <Merge className="h-5 w-5 text-primary" />
            Resolver Conflitos de Mesclagem
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-6 py-4">
          <div className="p-3 rounded-lg bg-status-warning/10 border border-status-warning/20 flex gap-3">
            <AlertTriangle className="h-5 w-5 text-status-warning shrink-0" />
            <p className="text-xs text-status-warning leading-relaxed">
              Selecione o registro mestre e escolha quais valores de campo deseja manter. 
              Vendas, tarefas, notas, tags e históricos de todos os registros serão consolidados no mestre.
            </p>
          </div>

          <div className="space-y-4">
            <Label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground/60">
              Registro Mestre
            </Label>
            <RadioGroup value={targetId} onValueChange={setTargetId} className="grid gap-2">
              {clients.map((client) => (
                <div key={client.id} className={cn(
                  "flex items-center justify-between p-3 rounded-xl border transition-all cursor-pointer",
                  targetId === client.id ? "bg-primary/10 border-primary/40 shadow-lg shadow-primary/5" : "bg-white/5 border-white/5 hover:bg-white/10"
                )} onClick={() => setTargetId(client.id)}>
                  <div className="flex items-center gap-3">
                    <RadioGroupItem value={client.id} id={client.id} />
                    <div>
                      <p className="text-sm font-bold">{client.name}</p>
                      <p className="text-[10px] text-muted-foreground">{client.email || "Sem email"}</p>
                    </div>
                  </div>
                  <Badge variant="outline" className="text-[10px] bg-black/20">
                    {new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" }).format(client.total_value)}
                  </Badge>
                </div>
              ))}
            </RadioGroup>
          </div>

          <div className="space-y-4">
            <Label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground/60">
              Campos Preferenciais
            </Label>
            <div className="grid gap-4">
              {fields.map((field) => (
                <div key={field.key} className="space-y-2">
                  <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest pl-1">{field.label}</p>
                  <div className="grid grid-cols-2 gap-2">
                    {clients.map((client) => {
                      const value = client[field.key as keyof Client] as string;
                      if (!value) return null;
                      return (
                        <div
                          key={`${client.id}-${field.key}`}
                          className={cn(
                            "p-2 rounded-lg border text-xs cursor-pointer transition-all truncate",
                            preferredFields[field.key] === value ? "bg-primary/20 border-primary/40 text-primary font-bold" : "bg-white/5 border-white/5 text-muted-foreground hover:border-white/20"
                          )}
                          onClick={() => setPreferredFields(prev => ({ ...prev, [field.key]: value }))}
                        >
                          {value}
                        </div>
                      );
                    })}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        <DialogFooter className="gap-2 sm:gap-0">
          <Button variant="ghost" onClick={() => onOpenChange(false)} disabled={isMerging} className="text-[10px] font-black uppercase tracking-widest">
            Cancelar
          </Button>
          <Button onClick={handleMerge} disabled={isMerging} className="gradient-primary text-[10px] font-black uppercase tracking-widest px-8">
            {isMerging ? "Mesclando..." : "Confirmar Mesclagem"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};
