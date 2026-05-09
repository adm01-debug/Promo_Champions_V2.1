import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { useCreateActivity, ActivityType, ActivityOutcome } from "@/hooks/useActivities";
import { useSalespeople } from "@/hooks/useSalespeople";
import { useClients } from "@/hooks/useClients";
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

const activitySchema = z.object({
  activity_type: z.enum(["call", "email", "meeting", "linkedin", "whatsapp", "other"]),
  outcome: z.enum(["connected", "no_answer", "scheduled", "voicemail", "busy", "callback", "not_interested", "qualified"]),
  salesperson_id: z.string().optional(),
  client_id: z.string().optional(),
  contact_name: z.string().max(100, "Nome do contato deve ter no máximo 100 caracteres").optional(),
  duration_minutes: z.string().optional().transform(val => val ? parseInt(val) : undefined).pipe(
    z.number().min(1, "Duração mínima é 1 minuto").max(480, "Duração máxima é 8 horas").optional()
  ),
  notes: z.string().max(1000, "Observações devem ter no máximo 1000 caracteres").optional(),
});

type ActivityFormData = z.infer<typeof activitySchema>;

interface ActivityLogFormProps {
  saleId?: string;
  clientId?: string;
  onSuccess?: () => void;
}

export function ActivityLogForm({ saleId, clientId, onSuccess }: ActivityLogFormProps) {
  const { data: salespeople } = useSalespeople();
  const { data: clients } = useClients();
  const createActivity = useCreateActivity();

  const form = useForm<ActivityFormData>({
    resolver: zodResolver(activitySchema),
    defaultValues: {
      activity_type: "call",
      outcome: "connected",
      salesperson_id: "",
      client_id: clientId || "",
      contact_name: "",
      duration_minutes: undefined,
      notes: "",
    },
  });

  const handleSubmit = (data: ActivityFormData) => {
    createActivity.mutate({
      sale_id: saleId || undefined,
      client_id: data.client_id || undefined,
      salesperson_id: data.salesperson_id || undefined,
      activity_type: data.activity_type,
      outcome: data.outcome,
      notes: data.notes || undefined,
      duration_minutes: data.duration_minutes,
      contact_name: data.contact_name || undefined,
    }, {
      onSuccess: () => {
        form.reset();
        onSuccess?.();
      }
    });
  };

  return (
    <Card className="glass border-border/40 dark:border-glow card-elevated transition-all duration-300">
      <CardHeader className="pb-3">
        <CardTitle className="text-sm font-display font-medium flex items-center gap-2">
          <div className="p-1.5 rounded-md bg-gradient-to-br from-primary/20 to-accent/10">
            <Plus className="h-4 w-4 gradient-primary" />
          </div>
          Registrar Atividade
        </CardTitle>
      </CardHeader>
      <CardContent>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-4">
            {/* Activity Type - Visual Buttons */}
            <FormField
              control={form.control}
              name="activity_type"
              render={({ field }) => (
                <FormItem className="space-y-2">
                  <FormLabel className="text-xs font-medium text-muted-foreground">Tipo de Atividade</FormLabel>
                  <div className="grid grid-cols-3 gap-2">
                    {activityTypes.map(type => {
                      const Icon = type.icon;
                      return (
                        <button
                          key={type.value}
                          type="button"
                          onClick={() => field.onChange(type.value)}
                          className={`p-2.5 rounded-lg border text-xs font-medium flex flex-col items-center gap-1.5 transition-all duration-200 ${
                            field.value === type.value
                              ? "border-primary bg-gradient-to-br from-primary/20 to-primary/5 text-primary shadow-sm shadow-primary/20"
                              : "border-border/50 hover:border-primary/50 text-muted-foreground hover:text-foreground bg-muted/30 hover:bg-muted/50"
                          }`}
                        >
                          <Icon className={`h-4 w-4 ${field.value === type.value ? 'gradient-primary' : ''}`} />
                          {type.label}
                        </button>
                      );
                    })}
                  </div>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Outcome */}
            <FormField
              control={form.control}
              name="outcome"
              render={({ field }) => (
                <FormItem className="space-y-2">
                  <FormLabel className="text-xs font-medium text-muted-foreground">Resultado</FormLabel>
                  <div className="grid grid-cols-4 gap-1.5">
                    {outcomes.map(o => (
                      <button
                        key={o.value}
                        type="button"
                        onClick={() => field.onChange(o.value)}
                        className={`px-2 py-1.5 rounded-md text-[10px] font-medium transition-all duration-200 border ${
                          field.value === o.value
                            ? `${o.color} text-primary-foreground border-transparent shadow-sm`
                            : "bg-muted/40 text-muted-foreground hover:bg-muted/60 border-border/30 hover:border-border/50"
                        }`}
                      >
                        {o.label}
                      </button>
                    ))}
                  </div>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Salesperson */}
            <FormField
              control={form.control}
              name="salesperson_id"
              render={({ field }) => (
                <FormItem className="space-y-2">
                  <FormLabel className="text-xs font-medium text-muted-foreground">Vendedor</FormLabel>
                  <Select value={field.value} onValueChange={field.onChange}>
                    <FormControl>
                      <SelectTrigger className="h-9 text-xs bg-muted/30 border-border/50 hover:border-border focus:border-primary transition-colors">
                        <SelectValue placeholder="Selecione o vendedor" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent className="glass border-border/50">
                      {salespeople?.map(sp => (
                        <SelectItem key={sp.id} value={sp.id} className="text-xs">
                          {sp.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Client */}
            {!saleId && !clientId && (
              <FormField
                control={form.control}
                name="client_id"
                render={({ field }) => (
                  <FormItem className="space-y-2">
                    <FormLabel className="text-xs font-medium text-muted-foreground">Cliente</FormLabel>
                    <Select value={field.value} onValueChange={field.onChange}>
                      <FormControl>
                        <SelectTrigger className="h-9 text-xs bg-muted/30 border-border/50 hover:border-border focus:border-primary transition-colors">
                          <SelectValue placeholder="Selecione o cliente" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent className="glass border-border/50">
                        {clients?.map(c => (
                          <SelectItem key={c.id} value={c.id} className="text-xs">
                            {c.name} {c.company ? `(${c.company})` : ""}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
            )}

            {/* Contact Name & Duration */}
            <div className="grid grid-cols-2 gap-3">
              <FormField
                control={form.control}
                name="contact_name"
                render={({ field }) => (
                  <FormItem className="space-y-2">
                    <FormLabel className="text-xs font-medium text-muted-foreground">Contato</FormLabel>
                    <FormControl>
                      <Input
                        {...field}
                        placeholder="Nome do contato"
                        className="h-9 text-xs bg-muted/30 border-border/50 hover:border-border focus:border-primary transition-colors"
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="duration_minutes"
                render={({ field }) => (
                  <FormItem className="space-y-2">
                    <FormLabel className="text-xs font-medium text-muted-foreground">Duração (min)</FormLabel>
                    <FormControl>
                      <Input
                        type="number"
                        {...field}
                        value={field.value ?? ""}
                        onChange={(e) => field.onChange(e.target.value)}
                        placeholder="5"
                        className="h-9 text-xs bg-muted/30 border-border/50 hover:border-border focus:border-primary transition-colors"
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            {/* Notes */}
            <FormField
              control={form.control}
              name="notes"
              render={({ field }) => (
                <FormItem className="space-y-2">
                  <FormLabel className="text-xs font-medium text-muted-foreground">Observações</FormLabel>
                  <FormControl>
                    <Textarea
                      {...field}
                      placeholder="Detalhes da atividade..."
                      className="min-h-[60px] text-xs resize-none bg-muted/30 border-border/50 hover:border-border focus:border-primary transition-colors"
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <Button 
              variant="glow"
              type="submit" 
              className="w-full h-9 text-xs font-medium"
              disabled={createActivity.isPending}
            >
              {createActivity.isPending ? "Registrando..." : "Registrar Atividade"}
            </Button>
          </form>
        </Form>
      </CardContent>
    </Card>
  );
}