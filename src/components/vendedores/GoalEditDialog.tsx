import { useState, useEffect } from "react";
import { useQueryClient, useMutation } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { toast } from "@/hooks/use-toast";
import { Loader2 } from "lucide-react";

interface GoalEditDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  salesperson: {
    id: string;
    name: string;
    commission_rate: number;
    goalAmount: number;
  } | null;
}

export function GoalEditDialog({ open, onOpenChange, salesperson }: GoalEditDialogProps) {
  const [commissionRate, setCommissionRate] = useState("");
  const [goalAmount, setGoalAmount] = useState("");

  const queryClient = useQueryClient();

  useEffect(() => {
    if (salesperson) {
      setCommissionRate(salesperson.commission_rate.toString());
      setGoalAmount(salesperson.goalAmount.toString());
    }
  }, [salesperson]);

  const updateMutation = useMutation({
    mutationFn: async (data: { commission_rate: number; goal_amount: number }) => {
      if (!salesperson) throw new Error("Vendedor não selecionado");

      // Update salesperson commission rate
      const { error: spError } = await supabase
        .from("salespeople")
        .update({ commission_rate: data.commission_rate })
        .eq("id", salesperson.id);

      if (spError) throw spError;

      // Upsert goal for current month
      const currentMonth = new Date().toISOString().slice(0, 7) + "-01";
      const { error: goalError } = await supabase
        .from("sales_goals")
        .upsert({
          salesperson_id: salesperson.id,
          month: currentMonth,
          goal_amount: data.goal_amount,
        }, {
          onConflict: "salesperson_id,month",
        });

      if (goalError) throw goalError;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["salespeople"] });
      queryClient.invalidateQueries({ queryKey: ["salespeople_ranking"] });
      queryClient.invalidateQueries({ queryKey: ["sales_goals"] });
      toast({
        title: "Meta atualizada",
        description: "As informações foram atualizadas com sucesso.",
      });
      onOpenChange(false);
    },
    onError: (error: Error) => {
      toast({
        title: "Erro ao atualizar",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    const commission = parseFloat(commissionRate);
    const goal = parseFloat(goalAmount);

    if (isNaN(commission) || commission < 0 || commission > 100) {
      toast({ title: "Taxa de comissão inválida", variant: "destructive" });
      return;
    }

    if (isNaN(goal) || goal < 0) {
      toast({ title: "Meta inválida", variant: "destructive" });
      return;
    }

    updateMutation.mutate({ commission_rate: commission, goal_amount: goal });
  };

  if (!salesperson) return null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="glass border-border/50">
        <DialogHeader>
          <DialogTitle className="gradient-text">Editar Meta - {salesperson.name}</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4 mt-4">
          <div className="space-y-2">
            <Label htmlFor="edit-commission">Taxa de Comissão (%)</Label>
            <Input
              id="edit-commission"
              type="number"
              step="0.5"
              min="0"
              max="100"
              value={commissionRate}
              onChange={(e) => setCommissionRate(e.target.value)}
              className="bg-background/50 border-border/50"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="edit-goal">Meta Mensal (R$)</Label>
            <Input
              id="edit-goal"
              type="number"
              step="1000"
              min="0"
              value={goalAmount}
              onChange={(e) => setGoalAmount(e.target.value)}
              className="bg-background/50 border-border/50"
            />
          </div>

          <div className="flex justify-end gap-3 pt-4">
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Cancelar
            </Button>
            <Button variant="glow-pulse-success" type="submit" disabled={updateMutation.isPending}>
              {updateMutation.isPending ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Salvando...
                </>
              ) : (
                "Salvar"
              )}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
