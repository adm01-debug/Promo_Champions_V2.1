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
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Target className="h-5 w-5 text-primary" />
            Metas de {salespersonName}
          </DialogTitle>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4 py-4">
            <p className="text-sm text-muted-foreground">
              Defina as metas diárias de atividades para este vendedor. Coloque 0 para desativar uma meta.
            </p>

            <div className="space-y-4">
              {goalFields.map((field) => (
                <FormField
                  key={field.name}
                  control={form.control}
                  name={field.name}
                  render={({ field: formField }) => (
                    <FormItem className="flex items-center gap-4">
                      <div className="flex items-center gap-2 w-40">
                        <field.icon className={`h-4 w-4 ${field.color}`} />
                        <FormLabel className="text-sm mb-0">{field.label}</FormLabel>
                      </div>
                      <FormControl>
                        <Input
                          {...formField}
                          type="number"
                          min="0"
                          className="w-24"
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              ))}
            </div>

            <div className="flex justify-end gap-2 pt-4">
              <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
                Cancelar
              </Button>
              <Button variant="glow-pulse-success" type="submit" disabled={upsertGoal.isPending}>
                {upsertGoal.isPending ? "Salvando..." : "Salvar Metas"}
              </Button>
            </div>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}