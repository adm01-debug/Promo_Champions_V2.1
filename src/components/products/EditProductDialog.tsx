import { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useUpdateProduct, Product } from "@/hooks/useProducts";

interface EditProductDialogProps {
  product: Product | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export const EditProductDialog = ({ product, open, onOpenChange }: EditProductDialogProps) => {
  const [formData, setFormData] = useState({
    name: "",
    category: "Assinatura",
    price: "",
    status: "ativo",
    rating: "",
    sales_count: "",
  });

  const updateProduct = useUpdateProduct();

  useEffect(() => {
    if (product) {
      setFormData({
        name: product.name || "",
        category: product.category || "Assinatura",
        price: product.price?.toString() || "0",
        status: product.status || "ativo",
        rating: product.rating?.toString() || "0",
        sales_count: product.sales_count?.toString() || "0",
      });
    }
  }, [product]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!product || !formData.name.trim() || !formData.price) return;

    updateProduct.mutate(
      {
        id: product.id,
        name: formData.name,
        category: formData.category,
        price: parseFloat(formData.price),
        status: formData.status,
        rating: parseFloat(formData.rating) || 0,
        sales_count: parseInt(formData.sales_count) || 0,
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
          <DialogTitle className="gradient-text">Editar Produto</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <Label htmlFor="edit-prod-name">Nome *</Label>
            <Input
              id="edit-prod-name"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              placeholder="Nome do produto"
              required
              className="bg-muted/50 border-border/50"
            />
          </div>
          <div>
            <Label htmlFor="edit-prod-category">Categoria</Label>
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
            <Label htmlFor="edit-prod-price">Preço *</Label>
            <Input
              id="edit-prod-price"
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
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="edit-prod-rating">Avaliação</Label>
              <Input
                id="edit-prod-rating"
                type="number"
                step="0.1"
                min="0"
                max="5"
                value={formData.rating}
                onChange={(e) => setFormData({ ...formData, rating: e.target.value })}
                placeholder="0.0"
                className="bg-muted/50 border-border/50"
              />
            </div>
            <div>
              <Label htmlFor="edit-prod-sales">Vendas</Label>
              <Input
                id="edit-prod-sales"
                type="number"
                min="0"
                value={formData.sales_count}
                onChange={(e) => setFormData({ ...formData, sales_count: e.target.value })}
                placeholder="0"
                className="bg-muted/50 border-border/50"
              />
            </div>
          </div>
          <div>
            <Label htmlFor="edit-prod-status">Status</Label>
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
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Cancelar
            </Button>
            <Button type="submit" className="gradient-primary" disabled={updateProduct.isPending}>
              {updateProduct.isPending ? "Salvando..." : "Salvar"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};
