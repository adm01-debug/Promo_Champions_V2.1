import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Plus } from "lucide-react";
import { useCreateProduct } from "@/hooks/useProducts";

export const CreateProductDialog = () => {
  const [open, setOpen] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    category: "Assinatura",
    price: "",
    status: "ativo",
  });

  const createProduct = useCreateProduct();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name.trim() || !formData.price) return;

    createProduct.mutate(
      {
        name: formData.name,
        category: formData.category,
        price: parseFloat(formData.price),
        status: formData.status,
      },
      {
        onSuccess: () => {
          setFormData({ name: "", category: "Assinatura", price: "", status: "ativo" });
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
          Novo Produto
        </Button>
      </DialogTrigger>
      <DialogContent className="glass border-border/50">
        <DialogHeader>
          <DialogTitle className="gradient-text">Novo Produto</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <Label htmlFor="name">Nome *</Label>
            <Input
              id="name"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              placeholder="Nome do produto"
              required
              className="bg-muted/50 border-border/50"
            />
          </div>
          <div>
            <Label htmlFor="category">Categoria</Label>
            <Select value={formData.category} onValueChange={(value) => setFormData({ ...formData, category: value })}>
              <SelectTrigger className="bg-muted/50 border-border/50">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="Assinatura">Assinatura</SelectItem>
                <SelectItem value="Serviço">Serviço</SelectItem>
                <SelectItem value="Projeto">Projeto</SelectItem>
                <SelectItem value="Consultoria">Consultoria</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div>
            <Label htmlFor="price">Preço *</Label>
            <Input
              id="price"
              type="number"
              step="0.01"
              min="0"
              value={formData.price}
              onChange={(e) => setFormData({ ...formData, price: e.target.value })}
              placeholder="0.00"
              required
              className="bg-muted/50 border-border/50"
            />
          </div>
          <div>
            <Label htmlFor="status">Status</Label>
            <Select value={formData.status} onValueChange={(value) => setFormData({ ...formData, status: value })}>
              <SelectTrigger className="bg-muted/50 border-border/50">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="ativo">Ativo</SelectItem>
                <SelectItem value="pausado">Pausado</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="flex justify-end gap-2 pt-4">
            <Button type="button" variant="outline" onClick={() => setOpen(false)}>
              Cancelar
            </Button>
            <Button type="submit" className="gradient-primary" disabled={createProduct.isPending}>
              {createProduct.isPending ? "Criando..." : "Criar Produto"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};
