import { useState, useEffect } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Phone, Mail, Calendar, MessageCircle, Linkedin, Target } from "lucide-react";
import { useUpsertActivityGoal, useActivityGoals } from "@/hooks/useActivityGoals";

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

  const [callsGoal, setCallsGoal] = useState(30);
  const [emailsGoal, setEmailsGoal] = useState(20);
  const [meetingsGoal, setMeetingsGoal] = useState(3);
  const [linkedinGoal, setLinkedinGoal] = useState(10);
  const [whatsappGoal, setWhatsappGoal] = useState(15);

  useEffect(() => {
    if (goals && salespersonId) {
      const existingGoal = goals.find(g => g.salesperson_id === salespersonId);
      if (existingGoal) {
        setCallsGoal(existingGoal.calls_goal);
        setEmailsGoal(existingGoal.emails_goal);
        setMeetingsGoal(existingGoal.meetings_goal);
        setLinkedinGoal(existingGoal.linkedin_goal);
        setWhatsappGoal(existingGoal.whatsapp_goal);
      } else {
        setCallsGoal(30);
        setEmailsGoal(20);
        setMeetingsGoal(3);
        setLinkedinGoal(10);
        setWhatsappGoal(15);
      }
    }
  }, [goals, salespersonId]);

  const handleSave = () => {
    upsertGoal.mutate({
      salesperson_id: salespersonId,
      calls_goal: callsGoal,
      emails_goal: emailsGoal,
      meetings_goal: meetingsGoal,
      linkedin_goal: linkedinGoal,
      whatsapp_goal: whatsappGoal,
    }, {
      onSuccess: () => onOpenChange(false),
    });
  };

  const goalFields = [
    { label: "Calls por dia", icon: Phone, value: callsGoal, setValue: setCallsGoal, color: "text-status-success" },
    { label: "Emails por dia", icon: Mail, value: emailsGoal, setValue: setEmailsGoal, color: "text-status-info" },
    { label: "Reuniões por dia", icon: Calendar, value: meetingsGoal, setValue: setMeetingsGoal, color: "text-status-purple" },
    { label: "LinkedIn por dia", icon: Linkedin, value: linkedinGoal, setValue: setLinkedinGoal, color: "text-primary" },
    { label: "WhatsApp por dia", icon: MessageCircle, value: whatsappGoal, setValue: setWhatsappGoal, color: "text-accent" },
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

        <div className="space-y-4 py-4">
          <p className="text-sm text-muted-foreground">
            Defina as metas diárias de atividades para este vendedor. Coloque 0 para desativar uma meta.
          </p>

          <div className="space-y-4">
            {goalFields.map((field, index) => (
              <div key={index} className="flex items-center gap-4">
                <div className="flex items-center gap-2 w-40">
                  <field.icon className={`h-4 w-4 ${field.color}`} />
                  <Label className="text-sm">{field.label}</Label>
                </div>
                <Input
                  type="number"
                  min="0"
                  value={field.value}
                  onChange={(e) => field.setValue(parseInt(e.target.value) || 0)}
                  className="w-24"
                />
              </div>
            ))}
          </div>
        </div>

        <div className="flex justify-end gap-2">
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancelar
          </Button>
          <Button variant="glow-success" onClick={handleSave} disabled={upsertGoal.isPending}>
            {upsertGoal.isPending ? "Salvando..." : "Salvar Metas"}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
