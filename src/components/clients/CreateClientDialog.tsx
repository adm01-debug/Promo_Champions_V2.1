import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Plus } from "lucide-react";
import { useCreateClient } from "@/hooks/useClients";

export const CreateClientDialog = () => {
  const [open, setOpen] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    company: "",
  });

  const createClient = useCreateClient();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name.trim()) return;

    createClient.mutate(
      {
        name: formData.name,
        email: formData.email || undefined,
        phone: formData.phone || undefined,
        company: formData.company || undefined,
      },
      {
        onSuccess: () => {
          setFormData({ name: "", email: "", phone: "", company: "" });
          setOpen(false);
        },
      }
    );
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button className="gradient-primary text-primary-foreground">
          <Plus className="h-4 w-4 mr-2" />
          Novo Cliente
        </Button>
      </DialogTrigger>
      <DialogContent className="glass border-border/50">
        <DialogHeader>
          <DialogTitle className="gradient-text">Novo Cliente</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <Label htmlFor="name">Nome *</Label>
            <Input
              id="name"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              placeholder="Nome do cliente"
              required
              className="bg-muted/50 border-border/50"
            />
          </div>
          <div>
            <Label htmlFor="email">E-mail</Label>
            <Input
              id="email"
              type="email"
              value={formData.email}
              onChange={(e) => setFormData({ ...formData, email: e.target.value })}
              placeholder="email@exemplo.com"
              className="bg-muted/50 border-border/50"
            />
          </div>
          <div>
            <Label htmlFor="phone">Telefone</Label>
            <Input
              id="phone"
              value={formData.phone}
              onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
              placeholder="(11) 99999-9999"
              className="bg-muted/50 border-border/50"
            />
          </div>
          <div>
            <Label htmlFor="company">Empresa</Label>
            <Input
              id="company"
              value={formData.company}
              onChange={(e) => setFormData({ ...formData, company: e.target.value })}
              placeholder="Nome da empresa"
              className="bg-muted/50 border-border/50"
            />
          </div>
          <div className="flex justify-end gap-2 pt-4">
            <Button type="button" variant="outline" onClick={() => setOpen(false)}>
              Cancelar
            </Button>
            <Button type="submit" className="gradient-primary" disabled={createClient.isPending}>
              {createClient.isPending ? "Criando..." : "Criar Cliente"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};
