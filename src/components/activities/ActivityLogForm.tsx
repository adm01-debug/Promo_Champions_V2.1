import { useState, useMemo } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from "@/components/ui/command";
import { Check, ChevronsUpDown, Sparkles, BookOpen } from "lucide-react";
import { cn } from "@/lib/utils";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { useCreateActivity, ActivityType, ActivityOutcome } from "@/hooks/useActivities";
import { useSalespeople } from "@/hooks/useSalespeople";
import { useClients } from "@/hooks/useClients";
import { Phone, Mail, Users, Linkedin, MessageCircle, MoreHorizontal, Plus, FileText, ExternalLink, Send } from "lucide-react";
import { toast } from "sonner";

const activityTypes: { value: ActivityType; label: string; icon: typeof Phone }[] = [
  { value: "call", label: "Ligação", icon: Phone },
  { value: "email", label: "E-mail", icon: Mail },
  { value: "meeting", label: "Reunião", icon: Users },
  { value: "linkedin", label: "LinkedIn", icon: Linkedin },
  { value: "whatsapp", label: "WhatsApp", icon: MessageCircle },
  { value: "note", label: "Nota", icon: FileText },
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
  { value: "bad_timing", label: "Momento Ruim", color: "bg-amber-500" },
  { value: "wrong_person", label: "Pessoa Errada", color: "bg-red-500" },
  { value: "unsubscribed", label: "Descadastrou", color: "bg-gray-500" },
];

const activitySchema = z.object({
  activity_type: z.enum(["call", "email", "meeting", "linkedin", "whatsapp", "note", "other"]),
  outcome: z.enum(["connected", "no_answer", "scheduled", "voicemail", "busy", "callback", "not_interested", "qualified", "bad_timing", "wrong_person", "unsubscribed"]),
  salesperson_id: z.string().optional(),
  client_id: z.string().optional(),
  contact_name: z.string().max(100, "Nome do contato deve ter no máximo 100 caracteres").optional(),
  duration_minutes: z.string().optional().transform(val => val ? parseInt(val) : undefined).pipe(
    z.number().min(1, "Duração mínima é 1 minuto").max(480, "Duração máxima é 8 horas").optional()
  ),
  notes: z.string().max(1000, "Observações devem ter no máximo 1000 caracteres").optional(),
  // MQL Qualification Fields
  pain_points: z.string().optional(),
  budget_range: z.string().optional(),
  timeline: z.string().optional(),
  decision_criteria: z.string().optional(),
});

type ActivityFormData = z.infer<typeof activitySchema>;

interface ActivityLogFormProps {
  saleId?: string;
  clientId?: string;
  onSuccess?: () => void;
  defaultActivityType?: ActivityType;
}

export function ActivityLogForm({ saleId, clientId, onSuccess, defaultActivityType }: ActivityLogFormProps) {
  const { data: salespeople } = useSalespeople();
  const { data: clients } = useClients();
  const createActivity = useCreateActivity();
  const [salespersonOpen, setSalespersonOpen] = useState(false);
  const [clientOpen, setClientOpen] = useState(false);

  const templates: Record<ActivityType, { label: string; text: string }[]> = {
    call: [
      { label: "Caixa Postal", text: "Deixado recado na caixa postal. Agendado novo follow-up." },
      { label: "Qualificação BANT", text: "Budget: \nAuthority: \nNeed: \nTimeline: " },
      { label: "Conexão Sucedida", text: "Conversamos sobre [DOR]. Demonstrou interesse em [PRODUTO]." }
    ],
    email: [
      { label: "Follow-up #1", text: "Olá [NOME], estou acompanhando nosso último contato sobre [ASSUNTO]..." },
      { label: "Cold Outreach", text: "Vi que você atua com [SETOR] e gostaria de compartilhar como ajudamos..." }
    ],
    linkedin: [
      { label: "Pedido Conexão", text: "Olá [NOME], acompanho seu trabalho em [EMPRESA] e gostaria de conectar." },
      { label: "Mensagem InMail", text: "Notei seu interesse em [ASSUNTO] e acredito que podemos colaborar..." }
    ],
    whatsapp: [
      { label: "Confirmar Reunião", text: "Oi [NOME], passando para confirmar nossa reunião hoje às [HORA]. Podemos manter?" },
      { label: "Follow-up Rápido", text: "Conseguiu dar uma olhada no material que te enviei por e-mail?" }
    ],
    meeting: [
      { label: "Ata de Reunião", text: "Participantes: \nPrincipais pontos: \nPróximos passos: " }
    ],
    note: [
      { label: "Insight ICP", text: "Cliente se encaixa perfeitamente no perfil de [SEGMENTO] devido a [RAZÃO]." }
    ],
    other: []
  };

  const form = useForm<ActivityFormData>({
    resolver: zodResolver(activitySchema),
    defaultValues: {
      activity_type: defaultActivityType || "call",
      outcome: "connected",
      salesperson_id: "",
      client_id: clientId || "",
      contact_name: "",
      duration_minutes: undefined,
      notes: "",
    },
  });

  const selectedActivityType = form.watch("activity_type");
  const selectedOutcome = form.watch("outcome");
  const selectedClientId = form.watch("client_id");
  const selectedClient = clients?.find(c => c.id === selectedClientId);

  const applyTemplate = (text: string) => {
    const currentNotes = form.getValues("notes");
    form.setValue("notes", currentNotes ? `${currentNotes}\n\n${text}` : text);
    toast.success("Template aplicado!");
  };

  const handleOpenWhatsApp = () => {
    const phone = selectedClient?.phone;
    if (!phone) {
      toast.error("Cliente sem telefone cadastrado");
      return;
    }
    const cleanPhone = phone.replace(/\D/g, "");
    const text = encodeURIComponent(form.getValues("notes") || "Olá, tudo bem?");
    window.open(`https://wa.me/${cleanPhone}?text=${text}`, "_blank");
  };

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
        form.reset({
          ...form.getValues(),
          notes: "",
          duration_minutes: undefined,
          contact_name: "",
        });
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
                  <div className="grid grid-cols-4 sm:grid-cols-4 lg:grid-cols-7 gap-2">
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
                  <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-3 gap-1.5">
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
                <FormItem className="flex flex-col">
                  <FormLabel className="text-xs font-medium text-muted-foreground mb-1">Vendedor</FormLabel>
                  <Popover open={salespersonOpen} onOpenChange={setSalespersonOpen}>
                    <PopoverTrigger asChild>
                      <FormControl>
                        <Button
                          variant="outline"
                          role="combobox"
                          className={cn(
                            "w-full justify-between h-9 text-xs bg-muted/30 border-border/50 font-normal",
                            !field.value && "text-muted-foreground"
                          )}
                        >
                          {field.value
                            ? salespeople?.find((sp) => sp.id === field.value)?.name
                            : "Selecione o vendedor"}
                          <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                        </Button>
                      </FormControl>
                    </PopoverTrigger>
                    <PopoverContent className="w-[--radix-popover-trigger-width] p-0" align="start">
                      <Command className="glass border-border/50">
                        <CommandInput placeholder="Buscar vendedor..." className="h-9 text-xs" />
                        <CommandList>
                          <CommandEmpty className="text-xs py-2 px-4">Nenhum vendedor encontrado.</CommandEmpty>
                          <CommandGroup>
                            {salespeople?.map((sp) => (
                              <CommandItem
                                key={sp.id}
                                value={sp.name}
                                onSelect={() => {
                                  form.setValue("salesperson_id", sp.id);
                                  setSalespersonOpen(false);
                                }}
                                className="text-xs"
                              >
                                <Check
                                  className={cn(
                                    "mr-2 h-4 w-4",
                                    sp.id === field.value ? "opacity-100" : "opacity-0"
                                  )}
                                />
                                {sp.name}
                              </CommandItem>
                            ))}
                          </CommandGroup>
                        </CommandList>
                      </Command>
                    </PopoverContent>
                  </Popover>
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
                  <FormItem className="flex flex-col">
                    <FormLabel className="text-xs font-medium text-muted-foreground mb-1">Cliente</FormLabel>
                    <Popover open={clientOpen} onOpenChange={setClientOpen}>
                      <PopoverTrigger asChild>
                        <FormControl>
                          <Button
                            variant="outline"
                            role="combobox"
                            className={cn(
                              "w-full justify-between h-9 text-xs bg-muted/30 border-border/50 font-normal",
                              !field.value && "text-muted-foreground"
                            )}
                          >
                            {field.value
                              ? clients?.find((c) => c.id === field.value)?.name
                              : "Selecione o cliente"}
                            <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                          </Button>
                        </FormControl>
                      </PopoverTrigger>
                      <PopoverContent className="w-[--radix-popover-trigger-width] p-0" align="start">
                        <Command className="glass border-border/50">
                          <CommandInput placeholder="Buscar cliente..." className="h-9 text-xs" />
                          <CommandList>
                            <CommandEmpty className="text-xs py-2 px-4">Nenhum cliente encontrado.</CommandEmpty>
                            <CommandGroup>
                              {clients?.map((c) => (
                                <CommandItem
                                  key={c.id}
                                  value={c.name}
                                  onSelect={() => {
                                    form.setValue("client_id", c.id);
                                    setClientOpen(false);
                                  }}
                                  className="text-xs"
                                >
                                  <Check
                                    className={cn(
                                      "mr-2 h-4 w-4",
                                      c.id === field.value ? "opacity-100" : "opacity-0"
                                    )}
                                  />
                                  {c.name} {c.company ? `(${c.company})` : ""}
                                </CommandItem>
                              ))}
                            </CommandGroup>
                          </CommandList>
                        </Command>
                      </PopoverContent>
                    </Popover>
                    <FormMessage />
                  </FormItem>
                )}
              />
            )}

            {/* Contact Name & Duration */}
            <div className="grid grid-cols-2 lg:grid-cols-2 gap-3">
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

            {/* Notes & Templates */}
            <div className="space-y-3">
              {templates[selectedActivityType].length > 0 && (
                <div className="flex flex-wrap gap-2">
                  {templates[selectedActivityType].map((tmpl, idx) => (
                    <Button
                      key={idx}
                      type="button"
                      variant="outline"
                      size="sm"
                      className="h-7 text-[10px] px-2 py-0 border-primary/20 hover:border-primary/40 bg-primary/5 hover:bg-primary/10 text-primary-foreground/80 flex items-center gap-1.5"
                      onClick={() => applyTemplate(tmpl.text)}
                    >
                      <Sparkles className="h-3 w-3" />
                      {tmpl.label}
                    </Button>
                  ))}
                </div>
              )}

              <FormField
                control={form.control}
                name="notes"
                render={({ field }) => (
                  <FormItem className="space-y-2">
                    <FormLabel className="text-xs font-medium text-muted-foreground flex items-center justify-between">
                      <div className="flex items-center gap-1.5">
                        <BookOpen className="h-3 w-3 text-primary" />
                        Observações
                      </div>
                      {selectedActivityType === "whatsapp" && selectedClientId && (
                        <Button 
                          type="button" 
                          variant="ghost" 
                          size="sm" 
                          className="h-6 text-[10px] gap-1 text-primary hover:text-primary-glow"
                          onClick={handleOpenWhatsApp}
                        >
                          <MessageCircle className="h-3 w-3" />
                          Enviar no WhatsApp
                        </Button>
                      )}
                    </FormLabel>
                    <FormControl>
                      <Textarea
                        {...field}
                        placeholder={selectedActivityType === "whatsapp" ? "Escreva a mensagem para enviar..." : "Detalhes da atividade..."}
                        className="min-h-[60px] text-xs resize-none bg-muted/30 border-border/50 hover:border-border focus:border-primary transition-colors"
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

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
