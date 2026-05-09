import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Plus } from "lucide-react";
import { useCreateSale } from "@/hooks/useSalesData";
import { useSalespeople } from "@/hooks/useSalespeople";
import { useProducts } from "@/hooks/useProducts";
import { useClients } from "@/hooks/useClients";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";

const saleSchema = z.object({
  client_id: z.string().optional(),
  client_name: z.string().trim().min(1, "Nome do cliente é obrigatório"),
  product_id: z.string().optional(),
  product_name: z.string().trim().min(1, "Produto é obrigatório"),
  amount: z.string().min(1, "Valor é obrigatório").refine((val) => {
    const num = parseFloat(val);
    return !isNaN(num) && num > 0;
  }, "Valor deve ser maior que zero"),
  salesperson_id: z.string().optional(),
  source: z.string().default("other"),
});

type SaleFormData = z.infer<typeof saleSchema>;

export const CreateSaleDialog = () => {
  const [open, setOpen] = useState(false);
  const createSale = useCreateSale();
  const { data: salespeople } = useSalespeople();
  const { data: products } = useProducts();
  const { data: clients } = useClients();

  const form = useForm<SaleFormData>({
    resolver: zodResolver(saleSchema),
    defaultValues: {
      client_id: "",
      client_name: "",
      product_id: "",
      product_name: "",
      amount: "",
      salesperson_id: "",
      source: "other",
    },
  });

  const onSubmit = (data: SaleFormData) => {
    createSale.mutate(
      {
        client_id: data.client_id || undefined,
        client_name: data.client_name,
        product_id: data.product_id || undefined,
        product_name: data.product_name,
        amount: parseFloat(data.amount),
        salesperson_id: data.salesperson_id || undefined,
        source: data.source,
        status: "pending",
        sku: products?.find(p => p.id === data.product_id || p.name === data.product_name)?.sku
      },
      {
        onSuccess: () => {
          form.reset();
          setOpen(false);
        },
      }
    );
  };

  const handleProductSelect = (productId: string) => {
    form.setValue("product_id", productId);
    const product = products?.find((p) => p.id === productId);
    if (product) {
      form.setValue("product_name", product.name);
      form.setValue("amount", product.price.toString());
    }
  };

  const handleClientSelect = (clientId: string) => {
    form.setValue("client_id", clientId);
    const client = clients?.find((c) => c.id === clientId);
    if (client) {
      form.setValue("client_name", client.name);
    }
  };

  const handleOpenChange = (isOpen: boolean) => {
    setOpen(isOpen);
    if (!isOpen) {
      form.reset();
    }
  };

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
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
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="client_id"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Cliente *</FormLabel>
                  <FormControl>
                    {clients && clients.length > 0 ? (
                      <Select value={field.value} onValueChange={handleClientSelect}>
                        <SelectTrigger className="bg-muted/50 border-border/50">
                          <SelectValue placeholder="Selecione um cliente" />
                        </SelectTrigger>
                        <SelectContent>
                          {clients.map((client) => (
                            <SelectItem key={client.id} value={client.id}>
                              {client.name} {client.company ? `(${client.company})` : ""}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    ) : (
                      <Input
                        placeholder="Nome do cliente"
                        className="bg-muted/50 border-border/50"
                        onChange={(e) => form.setValue("client_name", e.target.value)}
                      />
                    )}
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="product_id"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Produto *</FormLabel>
                  <FormControl>
                    {products && products.length > 0 ? (
                      <Select value={field.value} onValueChange={handleProductSelect}>
                        <SelectTrigger className="bg-muted/50 border-border/50">
                          <SelectValue placeholder="Selecione um produto" />
                        </SelectTrigger>
                        <SelectContent>
                          {products.map((product) => (
                            <SelectItem key={product.id} value={product.id}>
                              {product.name} - R$ {product.price.toLocaleString("pt-BR")}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    ) : (
                      <Input
                        {...field}
                        placeholder="Nome do produto"
                        className="bg-muted/50 border-border/50"
                      />
                    )}
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="amount"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Valor *</FormLabel>
                  <FormControl>
                    <Input
                      {...field}
                      type="number"
                      step="0.01"
                      min="0"
                      placeholder="0.00"
                      className="bg-muted/50 border-border/50"
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="salesperson_id"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Vendedor</FormLabel>
                  <FormControl>
                    <Select value={field.value} onValueChange={field.onChange}>
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
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="source"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Origem</FormLabel>
                  <FormControl>
                    <Select value={field.value} onValueChange={field.onChange}>
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
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <div className="flex justify-end gap-2 pt-4">
              <Button type="button" variant="outline" onClick={() => handleOpenChange(false)}>
                Cancelar
              </Button>
              <Button type="submit" className="gradient-primary" disabled={createSale.isPending}>
                {createSale.isPending ? "Criando..." : "Criar Venda"}
              </Button>
            </div>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
};
