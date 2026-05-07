import { useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Phone, Mail, Calendar, MessageCircle, Linkedin, Target } from "lucide-react";
import { useUpsertActivityGoal, useActivityGoals } from "@/hooks/useActivityGoals";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";

const activityGoalSchema = z.object({
  calls_goal: z.string()
    .refine((val) => !isNaN(parseInt(val)), "Valor inválido")
    .refine((val) => parseInt(val) >= 0, "Valor deve ser positivo")
    .refine((val) => parseInt(val) <= 200, "Valor máximo é 200"),
  emails_goal: z.string()
    .refine((val) => !isNaN(parseInt(val)), "Valor inválido")
    .refine((val) => parseInt(val) >= 0, "Valor deve ser positivo")
    .refine((val) => parseInt(val) <= 200, "Valor máximo é 200"),
  meetings_goal: z.string()
    .refine((val) => !isNaN(parseInt(val)), "Valor inválido")
    .refine((val) => parseInt(val) >= 0, "Valor deve ser positivo")
    .refine((val) => parseInt(val) <= 50, "Valor máximo é 50"),
  linkedin_goal: z.string()
    .refine((val) => !isNaN(parseInt(val)), "Valor inválido")
    .refine((val) => parseInt(val) >= 0, "Valor deve ser positivo")
    .refine((val) => parseInt(val) <= 200, "Valor máximo é 200"),
  whatsapp_goal: z.string()
    .refine((val) => !isNaN(parseInt(val)), "Valor inválido")
    .refine((val) => parseInt(val) >= 0, "Valor deve ser positivo")
    .refine((val) => parseInt(val) <= 200, "Valor máximo é 200"),
});

type ActivityGoalFormData = z.infer<typeof activityGoalSchema>;

interface ActivityGoalEditDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  salespersonId: string;
  salespersonName: string;
}

export function ActivityGoalEditDialog({
  open,
  onOpenChange,
  salespersonId,
  salespersonName,
}: ActivityGoalEditDialogProps) {
  const { data: goals } = useActivityGoals();
  const upsertGoal = useUpsertActivityGoal();

  const form = useForm<ActivityGoalFormData>({
    resolver: zodResolver(activityGoalSchema),
    defaultValues: {
      calls_goal: "30",
      emails_goal: "20",
      meetings_goal: "3",
      linkedin_goal: "10",
      whatsapp_goal: "15",
    },
  });

  useEffect(() => {
    if (goals && salespersonId) {
      const existingGoal = goals.find(g => g.salesperson_id === salespersonId);
      if (existingGoal) {
        form.reset({
          calls_goal: existingGoal.calls_goal.toString(),
          emails_goal: existingGoal.emails_goal.toString(),
          meetings_goal: existingGoal.meetings_goal.toString(),
          linkedin_goal: existingGoal.linkedin_goal.toString(),
          whatsapp_goal: existingGoal.whatsapp_goal.toString(),
        });
      } else {
        form.reset({
          calls_goal: "30",
          emails_goal: "20",
          meetings_goal: "3",
          linkedin_goal: "10",
          whatsapp_goal: "15",
        });
      }
    }
  }, [goals, salespersonId, form]);

  const onSubmit = (data: ActivityGoalFormData) => {
    upsertGoal.mutate({
      salesperson_id: salespersonId,
      calls_goal: parseInt(data.calls_goal),
      emails_goal: parseInt(data.emails_goal),
      meetings_goal: parseInt(data.meetings_goal),
      linkedin_goal: parseInt(data.linkedin_goal),
      whatsapp_goal: parseInt(data.whatsapp_goal),
    }, {
      onSuccess: () => onOpenChange(false),
    });
  };

  const goalFields: { 
    name: keyof ActivityGoalFormData; 
    label: string; 
    icon: typeof Phone; 
    color: string;
  }[] = [
    { name: "calls_goal", label: "Calls por dia", icon: Phone, color: "text-status-success" },
    { name: "emails_goal", label: "Emails por dia", icon: Mail, color: "text-status-info" },
    { name: "meetings_goal", label: "Reuniões por dia", icon: Calendar, color: "text-status-purple" },
    { name: "linkedin_goal", label: "LinkedIn por dia", icon: Linkedin, color: "text-primary" },
    { name: "whatsapp_goal", label: "WhatsApp por dia", icon: MessageCircle, color: "text-accent" },
  ];

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md glass border-border/40 p-0 overflow-hidden">
        <div className="bg-gradient-to-r from-primary/10 via-accent/5 to-transparent p-6 pb-0">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-3 text-xl font-display font-black uppercase tracking-tight italic">
              <div className="p-2 rounded-xl bg-primary shadow-lg">
                <Target className="h-5 w-5 text-primary-foreground" />
              </div>
              Metas de {salespersonName}
            </DialogTitle>
          </DialogHeader>
        </div>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="p-6 pt-4 space-y-6">
            <div className="p-3 rounded-lg bg-muted/30 border border-border/20">
              <p className="text-xs text-muted-foreground leading-relaxed font-medium">
                Defina o volume diário esperado. O <span className="text-primary font-bold">Power Score</span> será recalculado automaticamente com base na complexidade de cada tarefa.
              </p>
            </div>

            <div className="space-y-3">
              {goalFields.map((field) => (
                <FormField
                  key={field.name}
                  control={form.control}
                  name={field.name}
                  render={({ field: formField }) => (
                    <FormItem className="flex items-center justify-between p-3 rounded-xl border border-border/10 bg-muted/10 hover:bg-muted/20 transition-all group">
                      <div className="flex items-center gap-3">
                        <div className={`p-2 rounded-lg bg-background border border-border/10 shadow-sm transition-transform group-hover:scale-110`}>
                          <field.icon className={`h-4 w-4 ${field.color}`} />
                        </div>
                        <FormLabel className="text-xs font-black uppercase tracking-tight mb-0 cursor-pointer">{field.label.split(' ')[0]}</FormLabel>
                      </div>
                      <div className="flex items-center gap-2">
                        <FormControl>
                          <Input
                            {...formField}
                            type="number"
                            min="0"
                            className="w-20 h-9 text-right font-black glass border-border/20 focus-visible:ring-primary/40"
                          />
                        </FormControl>
                        <span className="text-[10px] font-bold text-muted-foreground uppercase opacity-60">un/dia</span>
                      </div>
                      <FormMessage className="text-[10px]" />
                    </FormItem>
                  )}
                />
              ))}
            </div>

            <div className="flex gap-3 pt-2">
              <Button 
                type="button" 
                variant="outline" 
                className="flex-1 font-bold uppercase tracking-tight text-xs h-11"
                onClick={() => onOpenChange(false)}
              >
                Cancelar
              </Button>
              <Button 
                variant="glow-pulse-success" 
                type="submit" 
                className="flex-1 font-bold uppercase tracking-tight text-xs h-11"
                disabled={upsertGoal.isPending}
              >
                {upsertGoal.isPending ? "Sincronizando..." : "Aplicar Estratégia"}
              </Button>
            </div>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}