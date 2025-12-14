import { useEffect } from "react";
import { useQueryClient, useMutation } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { toast } from "@/hooks/use-toast";
import { Loader2 } from "lucide-react";
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

const goalEditSchema = z.object({
  commission_rate: z
    .string()
    .min(1, "Taxa de comissão é obrigatória")
    .refine((val) => !isNaN(parseFloat(val)), "Taxa inválida")
    .refine((val) => parseFloat(val) >= 0, "Taxa deve ser positiva")
    .refine((val) => parseFloat(val) <= 100, "Taxa deve ser no máximo 100%"),
  goal_amount: z
    .string()
    .min(1, "Meta é obrigatória")
    .refine((val) => !isNaN(parseFloat(val)), "Valor inválido")
    .refine((val) => parseFloat(val) >= 0, "Meta deve ser positiva")
    .refine((val) => parseFloat(val) <= 100000000, "Meta deve ser no máximo R$ 100.000.000"),
});

type GoalEditFormData = z.infer<typeof goalEditSchema>;

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
  const queryClient = useQueryClient();

  const form = useForm<GoalEditFormData>({
    resolver: zodResolver(goalEditSchema),
    defaultValues: {
      commission_rate: "0",
      goal_amount: "0",
    },
  });

  useEffect(() => {
    if (salesperson) {
      form.reset({
        commission_rate: salesperson.commission_rate.toString(),
        goal_amount: salesperson.goalAmount.toString(),
      });
    }
  }, [salesperson, form]);

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

  const onSubmit = (data: GoalEditFormData) => {
    updateMutation.mutate({
      commission_rate: parseFloat(data.commission_rate),
      goal_amount: parseFloat(data.goal_amount),
    });
  };

  if (!salesperson) return null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="glass border-border/50">
        <DialogHeader>
          <DialogTitle className="gradient-text">Editar Meta - {salesperson.name}</DialogTitle>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4 mt-4">
            <FormField
              control={form.control}
              name="commission_rate"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Taxa de Comissão (%)</FormLabel>
                  <FormControl>
                    <Input
                      {...field}
                      type="number"
                      step="0.5"
                      min="0"
                      max="100"
                      className="bg-background/50 border-border/50"
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="goal_amount"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Meta Mensal (R$)</FormLabel>
                  <FormControl>
                    <Input
                      {...field}
                      type="number"
                      step="1000"
                      min="0"
                      className="bg-background/50 border-border/50"
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
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
        </Form>
      </DialogContent>
    </Dialog>
  );
}
