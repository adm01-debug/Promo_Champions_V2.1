import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Plus } from "lucide-react";
import { useCreateSale } from "@/hooks/useSalesData";
import { useSalespeople } from "@/hooks/useSalespeople";
import { useProducts } from "@/hooks/useProducts";

export const CreateSaleDialog = () => {
  const [open, setOpen] = useState(false);
  const [formData, setFormData] = useState({
    client_name: "",
    product_name: "",
    amount: "",
    salesperson_id: "",
    source: "other",
  });

  const createSale = useCreateSale();
  const { data: salespeople } = useSalespeople();
  const { data: products } = useProducts();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.client_name.trim() || !formData.product_name.trim() || !formData.amount) return;

    createSale.mutate(
      {
        client_name: formData.client_name,
        product_name: formData.product_name,
        amount: parseFloat(formData.amount),
        salesperson_id: formData.salesperson_id || undefined,
        source: formData.source,
      },
      {
        onSuccess: () => {
          setFormData({ client_name: "", product_name: "", amount: "", salesperson_id: "", source: "other" });
          setOpen(false);
        },
      }
    );
  };

  const handleProductSelect = (productName: string) => {
    setFormData({ ...formData, product_name: productName });
    const product = products?.find((p) => p.name === productName);
    if (product) {
      setFormData((prev) => ({ ...prev, product_name: productName, amount: product.price.toString() }));
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button className="gradient-primary text-primary-foreground">
          <Plus className="h-4 w-4 mr-2" />
          Nova Venda
        </Button>
      </DialogTrigger>
      <DialogContent className="glass border-border/50">
        <DialogHeader>
          <DialogTitle className="gradient-text">Nova Venda</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <Label htmlFor="client_name">Cliente *</Label>
            <Input
              id="client_name"
              value={formData.client_name}
              onChange={(e) => setFormData({ ...formData, client_name: e.target.value })}
              placeholder="Nome do cliente"
              required
              className="bg-muted/50 border-border/50"
            />
          </div>
          <div>
            <Label htmlFor="product_name">Produto *</Label>
            {products && products.length > 0 ? (
              <Select value={formData.product_name} onValueChange={handleProductSelect}>
                <SelectTrigger className="bg-muted/50 border-border/50">
                  <SelectValue placeholder="Selecione um produto" />
                </SelectTrigger>
                <SelectContent>
                  {products.map((product) => (
                    <SelectItem key={product.id} value={product.name}>
                      {product.name} - R$ {product.price.toLocaleString("pt-BR")}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            ) : (
              <Input
                id="product_name"
                value={formData.product_name}
                onChange={(e) => setFormData({ ...formData, product_name: e.target.value })}
                placeholder="Nome do produto"
                required
                className="bg-muted/50 border-border/50"
              />
            )}
          </div>
          <div>
            <Label htmlFor="amount">Valor *</Label>
            <Input
              id="amount"
              type="number"
              step="0.01"
              min="0"
              value={formData.amount}
              onChange={(e) => setFormData({ ...formData, amount: e.target.value })}
              placeholder="0.00"
              required
              className="bg-muted/50 border-border/50"
            />
          </div>
          <div>
            <Label htmlFor="salesperson">Vendedor</Label>
            <Select value={formData.salesperson_id} onValueChange={(value) => setFormData({ ...formData, salesperson_id: value })}>
              <SelectTrigger className="bg-muted/50 border-border/50">
                <SelectValue placeholder="Selecione um vendedor" />
              </SelectTrigger>
              <SelectContent>
                {salespeople?.map((sp) => (
                  <SelectItem key={sp.id} value={sp.id}>
                    {sp.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div>
            <Label htmlFor="source">Origem</Label>
            <Select value={formData.source} onValueChange={(value) => setFormData({ ...formData, source: value })}>
              <SelectTrigger className="bg-muted/50 border-border/50">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="linkedin">LinkedIn</SelectItem>
                <SelectItem value="referral">Indicação</SelectItem>
                <SelectItem value="inbound">Inbound</SelectItem>
                <SelectItem value="other">Outro</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="flex justify-end gap-2 pt-4">
            <Button type="button" variant="outline" onClick={() => setOpen(false)}>
              Cancelar
            </Button>
            <Button type="submit" className="gradient-primary" disabled={createSale.isPending}>
              {createSale.isPending ? "Criando..." : "Criar Venda"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};
