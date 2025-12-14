import { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useUpdateClient, Client } from "@/hooks/useClients";

interface EditClientDialogProps {
  client: Client | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export const EditClientDialog = ({ client, open, onOpenChange }: EditClientDialogProps) => {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    company: "",
    total_value: "",
  });

  const updateClient = useUpdateClient();

  useEffect(() => {
    if (client) {
      setFormData({
        name: client.name || "",
        email: client.email || "",
        phone: client.phone || "",
        company: client.company || "",
        total_value: client.total_value?.toString() || "0",
      });
    }
  }, [client]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!client || !formData.name.trim()) return;

    updateClient.mutate(
      {
        id: client.id,
        name: formData.name,
        email: formData.email || null,
        phone: formData.phone || null,
        company: formData.company || null,
        total_value: parseFloat(formData.total_value) || 0,
      },
      {
        onSuccess: () => {
          onOpenChange(false);
        },
      }
    );
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="glass border-border/50">
        <DialogHeader>
          <DialogTitle className="gradient-text">Editar Cliente</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <Label htmlFor="edit-name">Nome *</Label>
            <Input
              id="edit-name"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              placeholder="Nome do cliente"
              required
              className="bg-muted/50 border-border/50"
            />
          </div>
          <div>
            <Label htmlFor="edit-email">E-mail</Label>
            <Input
              id="edit-email"
              type="email"
              value={formData.email}
              onChange={(e) => setFormData({ ...formData, email: e.target.value })}
              placeholder="email@exemplo.com"
              className="bg-muted/50 border-border/50"
            />
          </div>
          <div>
            <Label htmlFor="edit-phone">Telefone</Label>
            <Input
              id="edit-phone"
              value={formData.phone}
              onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
              placeholder="(11) 99999-9999"
              className="bg-muted/50 border-border/50"
            />
          </div>
          <div>
            <Label htmlFor="edit-company">Empresa</Label>
            <Input
              id="edit-company"
              value={formData.company}
              onChange={(e) => setFormData({ ...formData, company: e.target.value })}
              placeholder="Nome da empresa"
              className="bg-muted/50 border-border/50"
            />
          </div>
          <div>
            <Label htmlFor="edit-total-value">Valor Total</Label>
            <Input
              id="edit-total-value"
              type="number"
              step="0.01"
              min="0"
              value={formData.total_value}
              onChange={(e) => setFormData({ ...formData, total_value: e.target.value })}
              placeholder="0.00"
              className="bg-muted/50 border-border/50"
            />
          </div>
          <div className="flex justify-end gap-2 pt-4">
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Cancelar
            </Button>
            <Button type="submit" className="gradient-primary" disabled={updateClient.isPending}>
              {updateClient.isPending ? "Salvando..." : "Salvar"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};
