import { useState } from "react";
import { Button } from "@/components/ui/button";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { Zap, Loader2 } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useQuery } from "@tanstack/react-query";

export function SalesTestButton() {
  const [isOpen, setIsOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [salespersonId, setSalespersonId] = useState<string>("");
  const [amount, setAmount] = useState("5000");
  const [clientName, setClientName] = useState("Cliente Teste");

  const { data: salespeople } = useQuery({
    queryKey: ["salespeople-for-test"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("salespeople")
        .select("id, name")
        .eq("is_active", true)
        .order("name");
      if (error) throw error;
      return data;
    },
  });

  const handleSimulateSale = async () => {
    if (!salespersonId) {
      toast.error("Selecione um vendedor");
      return;
    }

    setIsLoading(true);

    try {
      const { error } = await supabase.from("sales").insert({
        client_name: clientName,
        product_name: "Produto Teste",
        amount: parseFloat(amount),
        status: "completed",
        salesperson_id: salespersonId,
        category: "subscription",
        source: "other",
      });

      if (error) throw error;

      toast.success("Venda simulada com sucesso!", {
        description: "A notificação deve aparecer em instantes...",
      });
      setIsOpen(false);
    } catch (error) {
      console.error("Error simulating sale:", error);
      toast.error("Erro ao simular venda");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button
          variant="outline"
          size="sm"
          className="gap-2 border-dashed border-warning/50 text-warning hover:bg-warning/10"
        >
          <Zap className="h-4 w-4" />
          Testar Notificação
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Zap className="h-5 w-5 text-warning" />
            Simular Venda
          </DialogTitle>
          <DialogDescription>
            Crie uma venda de teste para verificar se as notificações push e toast estão funcionando.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-4">
          <div className="space-y-2">
            <Label>Vendedor</Label>
            <Select value={salespersonId} onValueChange={setSalespersonId}>
              <SelectTrigger>
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

          <div className="space-y-2">
            <Label>Nome do Cliente</Label>
            <Input
              value={clientName}
              onChange={(e) => setClientName(e.target.value)}
              placeholder="Nome do cliente"
            />
          </div>

          <div className="space-y-2">
            <Label>Valor da Venda (R$)</Label>
            <Input
              type="number"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              placeholder="5000"
            />
          </div>

          <div className="rounded-lg bg-muted/50 p-3 text-sm text-muted-foreground">
            <p className="font-medium text-foreground mb-1">O que vai acontecer:</p>
            <ul className="list-disc list-inside space-y-1">
              <li>Uma venda será registrada no banco</li>
              <li>Um <strong>Toast</strong> aparecerá na tela</li>
              <li>Uma <strong>Push Notification</strong> será enviada (se permitido)</li>
              <li>O ranking será atualizado automaticamente</li>
            </ul>
          </div>
        </div>

        <div className="flex justify-end gap-2">
          <Button variant="ghost" onClick={() => setIsOpen(false)}>
            Cancelar
          </Button>
          <Button
            onClick={handleSimulateSale}
            disabled={isLoading}
            className="gap-2 gradient-primary"
          >
            {isLoading ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" />
                Simulando...
              </>
            ) : (
              <>
                <Zap className="h-4 w-4" />
                Simular Venda
              </>
            )}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
