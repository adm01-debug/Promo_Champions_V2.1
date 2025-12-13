import { useState } from "react";
import { useQueryClient, useMutation } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { toast } from "@/hooks/use-toast";
import { UserPlus, Loader2, Phone, Target, Users } from "lucide-react";
import { z } from "zod";

export type SalespersonRole = 'sdr' | 'closer' | 'hybrid';

const roleLabels: Record<SalespersonRole, { label: string; icon: typeof Phone; color: string }> = {
  sdr: { label: "SDR", icon: Phone, color: "text-status-info" },
  closer: { label: "Closer", icon: Target, color: "text-status-success" },
  hybrid: { label: "Híbrido", icon: Users, color: "text-status-purple" },
};

const salespersonSchema = z.object({
  name: z.string().trim().min(1, "Nome é obrigatório").max(100, "Nome muito longo"),
  email: z.string().trim().email("Email inválido").max(255, "Email muito longo").or(z.literal("")),
  commission_rate: z.number().min(0, "Taxa mínima é 0").max(100, "Taxa máxima é 100"),
  goal_amount: z.number().min(0, "Meta deve ser positiva"),
  role: z.enum(['sdr', 'closer', 'hybrid']),
});

interface SalespersonFormProps {
  onSuccess?: () => void;
}

export function SalespersonForm({ onSuccess }: SalespersonFormProps) {
  const [open, setOpen] = useState(false);
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [role, setRole] = useState<SalespersonRole>("hybrid");
  const [commissionRate, setCommissionRate] = useState("10");
  const [goalAmount, setGoalAmount] = useState("100000");
  const [errors, setErrors] = useState<Record<string, string>>({});

  const queryClient = useQueryClient();

  const createMutation = useMutation({
    mutationFn: async (data: { name: string; email: string; commission_rate: number; goal_amount: number; role: SalespersonRole }) => {
      // Insert salesperson
      const { data: salesperson, error: spError } = await supabase
        .from("salespeople")
        .insert({
          name: data.name,
          email: data.email || null,
          commission_rate: data.commission_rate,
          role: data.role,
        })
        .select()
        .single();

      if (spError) throw spError;

      // Insert goal for current month
      const currentMonth = new Date().toISOString().slice(0, 7) + "-01";
      const { error: goalError } = await supabase
        .from("sales_goals")
        .insert({
          salesperson_id: salesperson.id,
          month: currentMonth,
          goal_amount: data.goal_amount,
        });

      if (goalError) throw goalError;

      return salesperson;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["salespeople"] });
      queryClient.invalidateQueries({ queryKey: ["salespeople_ranking"] });
      queryClient.invalidateQueries({ queryKey: ["sales_goals"] });
      toast({
        title: "Vendedor cadastrado",
        description: "O vendedor foi adicionado com sucesso.",
      });
      resetForm();
      setOpen(false);
      onSuccess?.();
    },
    onError: (error: Error) => {
      toast({
        title: "Erro ao cadastrar",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const resetForm = () => {
    setName("");
    setEmail("");
    setRole("hybrid");
    setCommissionRate("10");
    setGoalAmount("100000");
    setErrors({});
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setErrors({});

    const data = {
      name,
      email,
      role,
      commission_rate: parseFloat(commissionRate) || 0,
      goal_amount: parseFloat(goalAmount) || 0,
    };

    const result = salespersonSchema.safeParse(data);
    if (!result.success) {
      const fieldErrors: Record<string, string> = {};
      result.error.errors.forEach((err) => {
        if (err.path[0]) {
          fieldErrors[err.path[0] as string] = err.message;
        }
      });
      setErrors(fieldErrors);
      return;
    }

    createMutation.mutate(data);
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button className="gap-2 gradient-primary border-0">
          <UserPlus className="h-4 w-4" />
          Novo Vendedor
        </Button>
      </DialogTrigger>
      <DialogContent className="glass border-border/50">
        <DialogHeader>
          <DialogTitle className="gradient-text">Cadastrar Vendedor</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4 mt-4">
          <div className="space-y-2">
            <Label htmlFor="name">Nome *</Label>
            <Input
              id="name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Nome do vendedor"
              className="bg-background/50 border-border/50"
            />
            {errors.name && <p className="text-sm text-destructive">{errors.name}</p>}
          </div>

          <div className="space-y-2">
            <Label htmlFor="email">Email</Label>
            <Input
              id="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="email@exemplo.com"
              className="bg-background/50 border-border/50"
            />
            {errors.email && <p className="text-sm text-destructive">{errors.email}</p>}
          </div>

          <div className="space-y-2">
            <Label>Função</Label>
            <div className="grid grid-cols-3 gap-2">
              {(Object.keys(roleLabels) as SalespersonRole[]).map((r) => {
                const info = roleLabels[r];
                const Icon = info.icon;
                return (
                  <button
                    key={r}
                    type="button"
                    onClick={() => setRole(r)}
                    className={`p-2 rounded-lg border text-xs font-medium flex flex-col items-center gap-1 transition-all ${
                      role === r
                        ? "border-primary bg-primary/10 text-primary"
                        : "border-border hover:border-primary/50 text-muted-foreground hover:text-foreground"
                    }`}
                  >
                    <Icon className={`h-4 w-4 ${role === r ? info.color : ""}`} />
                    {info.label}
                  </button>
                );
              })}
            </div>
            {errors.role && <p className="text-sm text-destructive">{errors.role}</p>}
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="commission">Comissão (%)</Label>
              <Input
                id="commission"
                type="number"
                step="0.5"
                min="0"
                max="100"
                value={commissionRate}
                onChange={(e) => setCommissionRate(e.target.value)}
                className="bg-background/50 border-border/50"
              />
              {errors.commission_rate && <p className="text-sm text-destructive">{errors.commission_rate}</p>}
            </div>

            <div className="space-y-2">
              <Label htmlFor="goal">Meta Mensal (R$)</Label>
              <Input
                id="goal"
                type="number"
                step="1000"
                min="0"
                value={goalAmount}
                onChange={(e) => setGoalAmount(e.target.value)}
                className="bg-background/50 border-border/50"
              />
              {errors.goal_amount && <p className="text-sm text-destructive">{errors.goal_amount}</p>}
            </div>
          </div>

          <div className="flex justify-end gap-3 pt-4">
            <Button type="button" variant="outline" onClick={() => setOpen(false)}>
              Cancelar
            </Button>
            <Button type="submit" disabled={createMutation.isPending} className="gradient-primary border-0">
              {createMutation.isPending ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Salvando...
                </>
              ) : (
                "Cadastrar"
              )}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
