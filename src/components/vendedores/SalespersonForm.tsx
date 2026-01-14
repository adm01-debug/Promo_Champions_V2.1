import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useQueryClient, useMutation } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { toast } from "@/hooks/use-toast";
import { UserPlus, Loader2, Phone, Target, Users, Mail, Percent, DollarSign } from "lucide-react";
import { z } from "zod";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";

export type SalespersonRole = 'sdr' | 'closer' | 'hybrid';

const roleLabels: Record<SalespersonRole, { label: string; icon: typeof Phone; color: string; bgColor: string }> = {
  sdr: { label: "SDR", icon: Phone, color: "text-status-info", bgColor: "bg-status-info/10" },
  closer: { label: "Closer", icon: Target, color: "text-status-success", bgColor: "bg-status-success/10" },
  hybrid: { label: "Híbrido", icon: Users, color: "text-status-purple", bgColor: "bg-status-purple/10" },
};

const salespersonSchema = z.object({
  name: z.string().trim().min(1, "Nome é obrigatório").max(100, "Nome muito longo"),
  email: z.string().trim().email("Email inválido").max(255, "Email muito longo").or(z.literal("")),
  commission_rate: z.string()
    .refine((val) => !isNaN(parseFloat(val)), "Valor inválido")
    .refine((val) => parseFloat(val) >= 0, "Taxa mínima é 0%")
    .refine((val) => parseFloat(val) <= 100, "Taxa máxima é 100%"),
  goal_amount: z.string()
    .refine((val) => !isNaN(parseFloat(val)), "Valor inválido")
    .refine((val) => parseFloat(val) >= 0, "Meta deve ser positiva"),
  role: z.enum(['sdr', 'closer', 'hybrid']),
});

type SalespersonFormData = z.infer<typeof salespersonSchema>;

interface SalespersonFormProps {
  onSuccess?: () => void;
}

export function SalespersonForm({ onSuccess }: SalespersonFormProps) {
  const [open, setOpen] = useState(false);
  const queryClient = useQueryClient();

  const form = useForm<SalespersonFormData>({
    resolver: zodResolver(salespersonSchema),
    defaultValues: {
      name: "",
      email: "",
      role: "hybrid",
      commission_rate: "10",
      goal_amount: "100000",
    },
  });

  const createMutation = useMutation({
    mutationFn: async (data: SalespersonFormData) => {
      // Insert salesperson
      const { data: salesperson, error: spError } = await supabase
        .from("salespeople")
        .insert({
          name: data.name,
          email: data.email || null,
          commission_rate: parseFloat(data.commission_rate),
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
          goal_amount: parseFloat(data.goal_amount),
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
      handleClose();
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

  const handleClose = () => {
    form.reset();
    setOpen(false);
  };

  const onSubmit = (data: SalespersonFormData) => {
    createMutation.mutate(data);
  };

  const _selectedRole = form.watch("role");

  return (
    <Dialog open={open} onOpenChange={(o) => { setOpen(o); if (!o) form.reset(); }}>
      <DialogTrigger asChild>
        <Button className="gap-2 gradient-primary border-0 hover-glow transition-all">
          <UserPlus className="h-4 w-4" />
          Novo Vendedor
        </Button>
      </DialogTrigger>
      <DialogContent className="glass dark:border-glow border-border/50 animate-fade-in">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 font-display">
            <div className="p-1.5 rounded-md bg-gradient-to-br from-primary/20 to-primary/5">
              <UserPlus className="h-5 w-5 text-primary" />
            </div>
            <span className="gradient-text">Cadastrar Vendedor</span>
          </DialogTitle>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4 mt-4">
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="flex items-center gap-1.5 text-sm">
                    <Users className="h-3.5 w-3.5 text-muted-foreground" />
                    Nome *
                  </FormLabel>
                  <FormControl>
                    <Input
                      {...field}
                      placeholder="Nome do vendedor"
                      className="glass border-border/50 focus:border-primary/50 transition-all"
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
                  <FormLabel className="flex items-center gap-1.5 text-sm">
                    <Mail className="h-3.5 w-3.5 text-muted-foreground" />
                    Email
                  </FormLabel>
                  <FormControl>
                    <Input
                      {...field}
                      type="email"
                      placeholder="email@exemplo.com"
                      className="glass border-border/50 focus:border-primary/50 transition-all"
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="role"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="flex items-center gap-1.5 text-sm">
                    <Target className="h-3.5 w-3.5 text-muted-foreground" />
                    Função
                  </FormLabel>
                  <FormControl>
                    <div className="grid grid-cols-3 gap-2">
                      {(Object.keys(roleLabels) as SalespersonRole[]).map((r) => {
                        const info = roleLabels[r];
                        const Icon = info.icon;
                        const isSelected = field.value === r;
                        return (
                          <button
                            key={r}
                            type="button"
                            onClick={() => field.onChange(r)}
                            className={`p-3 rounded-xl border text-xs font-medium flex flex-col items-center gap-1.5 transition-all ${
                              isSelected
                                ? `border-primary ${info.bgColor} ${info.color} shadow-lg shadow-primary/10`
                                : "glass border-border/50 text-muted-foreground hover:border-primary/50 hover:text-foreground"
                            }`}
                          >
                            <div className={`p-1.5 rounded-lg transition-all ${
                              isSelected ? info.bgColor : "bg-muted/50"
                            }`}>
                              <Icon className={`h-4 w-4 ${isSelected ? info.color : ""}`} />
                            </div>
                            {info.label}
                          </button>
                        );
                      })}
                    </div>
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="grid grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="commission_rate"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="flex items-center gap-1.5 text-sm">
                      <Percent className="h-3.5 w-3.5 text-muted-foreground" />
                      Comissão
                    </FormLabel>
                    <FormControl>
                      <Input
                        {...field}
                        type="number"
                        step="0.5"
                        min="0"
                        max="100"
                        className="glass border-border/50 focus:border-primary/50 transition-all"
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
                    <FormLabel className="flex items-center gap-1.5 text-sm">
                      <DollarSign className="h-3.5 w-3.5 text-muted-foreground" />
                      Meta Mensal
                    </FormLabel>
                    <FormControl>
                      <Input
                        {...field}
                        type="number"
                        step="1000"
                        min="0"
                        className="glass border-border/50 focus:border-primary/50 transition-all"
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <div className="flex justify-end gap-3 pt-4 border-t border-border/40">
              <Button 
                type="button" 
                variant="outline" 
                onClick={handleClose}
                className="glass border-border/50"
              >
                Cancelar
              </Button>
              <Button 
                variant="glow-pulse" 
                type="submit" 
                disabled={createMutation.isPending}
                className="transition-all"
              >
                {createMutation.isPending ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    Salvando...
                  </>
                ) : (
                  <>
                    <UserPlus className="h-4 w-4 mr-2" />
                    Cadastrar
                  </>
                )}
              </Button>
            </div>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
