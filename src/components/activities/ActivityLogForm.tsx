import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useCreateActivity, ActivityType, ActivityOutcome } from "@/hooks/useActivities";
import { useSalespeople } from "@/hooks/useSalespeople";
import { Phone, Mail, Users, Linkedin, MessageCircle, MoreHorizontal, Plus } from "lucide-react";

const activityTypes: { value: ActivityType; label: string; icon: typeof Phone }[] = [
  { value: "call", label: "Ligação", icon: Phone },
  { value: "email", label: "E-mail", icon: Mail },
  { value: "meeting", label: "Reunião", icon: Users },
  { value: "linkedin", label: "LinkedIn", icon: Linkedin },
  { value: "whatsapp", label: "WhatsApp", icon: MessageCircle },
  { value: "other", label: "Outro", icon: MoreHorizontal },
];

const outcomes: { value: ActivityOutcome; label: string; color: string }[] = [
  { value: "connected", label: "Conectou", color: "bg-status-success" },
  { value: "no_answer", label: "Não Atendeu", color: "bg-status-error" },
  { value: "scheduled", label: "Agendou", color: "bg-status-info" },
  { value: "voicemail", label: "Caixa Postal", color: "bg-status-warning" },
  { value: "busy", label: "Ocupado", color: "bg-rank-gold" },
  { value: "callback", label: "Retornar", color: "bg-status-purple" },
  { value: "not_interested", label: "Sem Interesse", color: "bg-muted-foreground" },
  { value: "qualified", label: "Qualificado", color: "bg-primary" },
];

interface ActivityLogFormProps {
  saleId?: string;
  onSuccess?: () => void;
}

export function ActivityLogForm({ saleId, onSuccess }: ActivityLogFormProps) {
  const [activityType, setActivityType] = useState<ActivityType>("call");
  const [outcome, setOutcome] = useState<ActivityOutcome>("connected");
  const [notes, setNotes] = useState("");
  const [duration, setDuration] = useState("");
  const [contactName, setContactName] = useState("");
  const [salespersonId, setSalespersonId] = useState("");

  const { data: salespeople } = useSalespeople();
  const createActivity = useCreateActivity();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    createActivity.mutate({
      sale_id: saleId || undefined,
      salesperson_id: salespersonId || undefined,
      activity_type: activityType,
      outcome,
      notes: notes || undefined,
      duration_minutes: duration ? parseInt(duration) : undefined,
      contact_name: contactName || undefined,
    }, {
      onSuccess: () => {
        setNotes("");
        setDuration("");
        setContactName("");
        onSuccess?.();
      }
    });
  };

  return (
    <Card className="glass border-border/40">
      <CardHeader className="pb-3">
        <CardTitle className="text-sm font-medium flex items-center gap-2">
          <Plus className="h-4 w-4 text-primary" />
          Registrar Atividade
        </CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Activity Type - Visual Buttons */}
          <div className="space-y-2">
            <Label className="text-xs">Tipo de Atividade</Label>
            <div className="grid grid-cols-3 gap-2">
              {activityTypes.map(type => {
                const Icon = type.icon;
                return (
                  <button
                    key={type.value}
                    type="button"
                    onClick={() => setActivityType(type.value)}
                    className={`p-2 rounded-lg border text-xs font-medium flex flex-col items-center gap-1 transition-all ${
                      activityType === type.value
                        ? "border-primary bg-primary/10 text-primary"
                        : "border-border hover:border-primary/50 text-muted-foreground hover:text-foreground"
                    }`}
                  >
                    <Icon className="h-4 w-4" />
                    {type.label}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Outcome */}
          <div className="space-y-2">
            <Label className="text-xs">Resultado</Label>
            <div className="grid grid-cols-4 gap-1.5">
              {outcomes.map(o => (
                <button
                  key={o.value}
                  type="button"
                  onClick={() => setOutcome(o.value)}
                  className={`px-2 py-1.5 rounded-md text-[10px] font-medium transition-all ${
                    outcome === o.value
                      ? `${o.color} text-primary-foreground`
                      : "bg-muted text-muted-foreground hover:bg-muted/80"
                  }`}
                >
                  {o.label}
                </button>
              ))}
            </div>
          </div>

          {/* Salesperson */}
          <div className="space-y-2">
            <Label className="text-xs">Vendedor</Label>
            <Select value={salespersonId} onValueChange={setSalespersonId}>
              <SelectTrigger className="h-9 text-xs">
                <SelectValue placeholder="Selecione o vendedor" />
              </SelectTrigger>
              <SelectContent>
                {salespeople?.map(sp => (
                  <SelectItem key={sp.id} value={sp.id} className="text-xs">
                    {sp.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Contact Name & Duration */}
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-2">
              <Label className="text-xs">Contato</Label>
              <Input
                value={contactName}
                onChange={(e) => setContactName(e.target.value)}
                placeholder="Nome do contato"
                className="h-9 text-xs"
              />
            </div>
            <div className="space-y-2">
              <Label className="text-xs">Duração (min)</Label>
              <Input
                type="number"
                value={duration}
                onChange={(e) => setDuration(e.target.value)}
                placeholder="5"
                className="h-9 text-xs"
              />
            </div>
          </div>

          {/* Notes */}
          <div className="space-y-2">
            <Label className="text-xs">Observações</Label>
            <Textarea
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Detalhes da atividade..."
              className="min-h-[60px] text-xs resize-none"
            />
          </div>

          <Button 
            variant="glow"
            type="submit" 
            className="w-full h-9 text-xs"
            disabled={createActivity.isPending}
          >
            {createActivity.isPending ? "Registrando..." : "Registrar Atividade"}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}
