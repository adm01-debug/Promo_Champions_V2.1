import { useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useUpdateClient, Client } from "@/hooks/useClients";
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

const editClientSchema = z.object({
  name: z
    .string()
    .trim()
    .min(1, "Nome é obrigatório")
    .max(100, "Nome deve ter no máximo 100 caracteres"),
  email: z
    .string()
    .trim()
    .email("E-mail inválido")
    .max(255, "E-mail deve ter no máximo 255 caracteres")
    .or(z.literal("")),
  phone: z
    .string()
    .trim()
    .max(20, "Telefone deve ter no máximo 20 caracteres"),
  company: z
    .string()
    .trim()
    .max(100, "Empresa deve ter no máximo 100 caracteres"),
  total_value: z
    .string()
    .refine((val) => !val || !isNaN(parseFloat(val)), "Valor inválido")
    .refine((val) => !val || parseFloat(val) >= 0, "Valor deve ser positivo"),
  lead_source: z.string().optional(),
});

type EditClientFormData = z.infer<typeof editClientSchema>;

interface EditClientDialogProps {
  client: Client | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export const EditClientDialog = ({ client, open, onOpenChange }: EditClientDialogProps) => {
  const updateClient = useUpdateClient();

  const form = useForm<EditClientFormData>({
    resolver: zodResolver(editClientSchema),
    defaultValues: {
      name: "",
      email: "",
      phone: "",
      company: "",
      total_value: "0",
      lead_source: "",
    },
  });

  useEffect(() => {
    if (client) {
      form.reset({
        name: client.name || "",
        email: client.email || "",
        phone: client.phone || "",
        company: client.company || "",
        total_value: client.total_value?.toString() || "0",
        lead_source: client.lead_source || "",
      });
    }
  }, [client, form]);

  const onSubmit = (data: EditClientFormData) => {
    if (!client) return;

    updateClient.mutate(
      {
        id: client.id,
        name: data.name,
        email: data.email || null,
        phone: data.phone || null,
        company: data.company || null,
        total_value: parseFloat(data.total_value) || 0,
        lead_source: data.lead_source || null,
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
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Nome *</FormLabel>
                  <FormControl>
                    <Input
                      {...field}
                      placeholder="Nome do cliente"
                      className="bg-muted/50 border-border/50"
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="email"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>E-mail</FormLabel>
                  <FormControl>
                    <Input
                      {...field}
                      type="email"
                      placeholder="email@exemplo.com"
                      className="bg-muted/50 border-border/50"
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="phone"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Telefone</FormLabel>
                  <FormControl>
                    <Input
                      {...field}
                      placeholder="(11) 99999-9999"
                      className="bg-muted/50 border-border/50"
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="company"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Empresa</FormLabel>
                  <FormControl>
                    <Input
                      {...field}
                      placeholder="Nome da empresa"
                      className="bg-muted/50 border-border/50"
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="total_value"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Valor Total</FormLabel>
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
            <FormField
              control={form.control}
              name="lead_source"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Origem do Lead</FormLabel>
                  <FormControl>
                    <Input
                      {...field}
                      placeholder="Ex: LinkedIn, Indicação, Site..."
                      className="bg-muted/50 border-border/50"
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <div className="flex justify-end gap-2 pt-4">
              <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
                Cancelar
              </Button>
              <Button type="submit" className="gradient-primary" disabled={updateClient.isPending}>
                {updateClient.isPending ? "Salvando..." : "Salvar"}
              </Button>
            </div>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
};
