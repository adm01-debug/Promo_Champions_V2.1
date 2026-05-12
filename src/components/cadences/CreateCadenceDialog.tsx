import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useCreateCadence, useCreateCadenceStep, useCadenceSteps, ActionType } from "@/hooks/useCadences";
import { Plus, Trash2, Phone, Mail, Linkedin, MessageCircle, Users, MoreHorizontal, CheckSquare } from "lucide-react";
import { MergeTagPicker } from "./MergeTagPicker";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";

const actionTypes: { value: ActionType; label: string; icon: typeof Phone }[] = [
  { value: "email", label: "E-mail", icon: Mail },
  { value: "call", label: "Ligação", icon: Phone },
  { value: "linkedin", label: "LinkedIn", icon: Linkedin },
  { value: "whatsapp", label: "WhatsApp", icon: MessageCircle },
  { value: "task", label: "Tarefa", icon: CheckSquare },
  { value: "meeting", label: "Reunião", icon: Users },
  { value: "other", label: "Outro", icon: MoreHorizontal },
];

const stepInputSchema = z.object({
  day_number: z.number().min(1, "Dia deve ser pelo menos 1"),
  action_type: z.enum(["email", "call", "linkedin", "whatsapp", "task", "meeting", "other"]),
  title: z.string().trim().min(3, "Título deve ter pelo menos 3 caracteres").max(100),
  template_content: z.string().optional(),
  needs_approval: z.boolean().default(false),
  task_type: z.enum(['manual', 'automatic']).default('manual'),
}).refine(data => {
  if (data.task_type === 'automatic' && ["email", "whatsapp", "linkedin"].includes(data.action_type)) {
    return !!data.template_content?.trim();
  }
  return true;
}, {
  message: "Ações automáticas exigem template",
  path: ["template_content"]
});

const cadenceSchema = z.object({
  name: z.string().trim().min(1, "Nome é obrigatório").max(100, "Nome deve ter no máximo 100 caracteres"),
  description: z.string().max(500, "Descrição deve ter no máximo 500 caracteres").optional(),
});

type CadenceFormData = z.infer<typeof cadenceSchema>;
type StepInput = z.infer<typeof stepInputSchema>;

export function CreateCadenceDialog() {
  const [open, setOpen] = useState(false);
  const [step, setStep] = useState<"info" | "steps">("info");
  const [cadenceId, setCadenceId] = useState<string | null>(null);
  const [steps, setSteps] = useState<StepInput[]>([
    { day_number: 1, action_type: "email", title: "Email de introdução", template_content: "", needs_approval: false, task_type: "manual" },
  ]);
  const [stepErrors, setStepErrors] = useState<Record<number, string[]>>({});

  const createCadence = useCreateCadence();
  const createStep = useCreateCadenceStep();

  const form = useForm<CadenceFormData>({
    resolver: zodResolver(cadenceSchema),
    defaultValues: { name: "", description: "" },
  });

  const resetForm = () => {
    setStep("info");
    setCadenceId(null);
    form.reset();
    setSteps([{ day_number: 1, action_type: "email", title: "Email de introdução", template_content: "", needs_approval: false, task_type: "manual" }]);
    setStepErrors({});
  };

  const handleCreateCadence = async (data: CadenceFormData) => {
    const result = await createCadence.mutateAsync({ name: data.name, description: data.description || undefined });
    setCadenceId(result.id);
    setStep("steps");
  };

  const addStep = () => {
    const lastDay = steps.length > 0 ? Math.max(...steps.map(s => s.day_number)) : 0;
    setSteps([...steps, { day_number: lastDay + 2, action_type: "call", title: "", template_content: "", needs_approval: false, task_type: "manual" }]);
  };

  const removeStep = (index: number) => {
    setSteps(steps.filter((_, i) => i !== index));
    const newErrors = { ...stepErrors };
    delete newErrors[index];
    setStepErrors(newErrors);
  };

  const updateStep = <K extends keyof StepInput>(index: number, field: K, value: StepInput[K]) => {
    const updated = [...steps];
    updated[index] = { ...updated[index], [field]: value };
    setSteps(updated);
    if (stepErrors[index]) {
      const newErrors = { ...stepErrors };
      delete newErrors[index];
      setStepErrors(newErrors);
    }
  };

  const validateSteps = () => {
    const errors: Record<number, string[]> = {};
    let isValid = true;
    steps.forEach((s, index) => {
      const result = stepInputSchema.safeParse(s);
      if (!result.success) {
        errors[index] = result.error.errors.map(err => err.message);
        isValid = false;
      }
    });
    let lastDay = 0;
    steps.forEach((s, index) => {
      if (s.day_number <= lastDay) {
        const e = errors[index] || [];
        e.push(`Dia deve ser maior que ${lastDay}`);
        errors[index] = e;
        isValid = false;
      }
      lastDay = s.day_number;
    });
    setStepErrors(errors);
    return isValid;
  };

  const handleSaveSteps = async () => {
    if (!cadenceId) return;
    if (!validateSteps()) {
      toast.error("Corrija os erros nas etapas");
      return;
    }
    try {
      for (let i = 0; i < steps.length; i++) {
        const s = steps[i];
        await createStep.mutateAsync({
          cadence_id: cadenceId,
          day_number: s.day_number,
          action_type: s.action_type,
          title: s.title,
          template_content: s.template_content || undefined,
          needs_approval: s.needs_approval,
          task_type: s.task_type,
          step_order: i,
        });
      }
      setOpen(false);
      resetForm();
    } catch (e) { console.error(e); }
  };

  return (
    <Dialog open={open} onOpenChange={(o) => { setOpen(o); if (!o) resetForm(); }}>
      <DialogTrigger asChild>
        <Button variant="glow" className="gap-2 font-medium"><Plus className="h-4 w-4" />Nova Cadência</Button>
      </DialogTrigger>
      <DialogContent className="max-w-2xl max-h-[85vh] overflow-y-auto glass border-border/50 dark:border-glow">
        <DialogHeader>
          <DialogTitle className="font-display text-lg flex items-center gap-2">
            <div className="p-1.5 rounded-md bg-gradient-to-br from-primary/20 to-accent/10"><Plus className="h-4 w-4 gradient-primary" /></div>
            {step === "info" ? "Criar Nova Cadência" : "Configurar Etapas"}
          </DialogTitle>
        </DialogHeader>

        {step === "info" ? (
          <Form {...form}>
            <form onSubmit={form.handleSubmit(handleCreateCadence)} className="space-y-4 py-4">
              <FormField control={form.control} name="name" render={({ field }) => (
                <FormItem><FormLabel>Nome da Cadência *</FormLabel><FormControl><Input {...field} placeholder="Ex: Prospecção Inicial" className="bg-muted/30 border-border/50 focus:border-primary transition-colors" /></FormControl><FormMessage /></FormItem>
              )} />
              <FormField control={form.control} name="description" render={({ field }) => (
                <FormItem><FormLabel>Descrição</FormLabel><FormControl><Textarea {...field} placeholder="Objetivo..." className="resize-none bg-muted/30 border-border/50 focus:border-primary transition-colors" /></FormControl><FormMessage /></FormItem>
              )} />
              <Button variant="glow" type="submit" className="w-full font-medium" disabled={createCadence.isPending}>{createCadence.isPending ? "Criando..." : "Continuar"}</Button>
            </form>
          </Form>
        ) : (
          <div className="space-y-4 py-4">
            <div className="flex items-center justify-between p-3 rounded-lg bg-muted/30 border border-border/30">
              <p className="text-sm text-muted-foreground">Configure as etapas para "<span className="text-foreground font-medium">{form.getValues("name")}</span>"</p>
              <Badge variant="outline" className="bg-primary/10 text-primary border-primary/30">{steps.length} etapas</Badge>
            </div>
            <div className="space-y-3 max-h-[400px] overflow-y-auto pr-2">
              {steps.map((s, index) => (
                <div key={index} className={`p-4 rounded-lg border bg-muted/30 hover:bg-muted/40 space-y-3 transition-colors ${stepErrors[index] ? 'border-destructive/50 ring-1 ring-destructive/20' : 'border-border/50'}`}>
                  <div className="flex items-center justify-between">
                    <Badge variant="secondary" className="text-xs bg-gradient-to-r from-primary/20 to-accent/10 text-primary border border-primary/20">Etapa {index + 1}</Badge>
                    {steps.length > 1 && <Button variant="ghost" size="icon" className="h-6 w-6 text-destructive hover:bg-destructive/10" onClick={() => removeStep(index)}><Trash2 className="h-3.5 w-3.5" /></Button>}
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    <div className="space-y-1.5"><FormLabel className="text-xs font-medium text-muted-foreground">Dia *</FormLabel><Input type="number" min={1} value={s.day_number} onChange={(e) => updateStep(index, "day_number", parseInt(e.target.value) || 1)} className="h-8 text-sm bg-background/50 border-border/50" /></div>
                    <div className="space-y-1.5"><FormLabel className="text-xs font-medium text-muted-foreground">Tipo</FormLabel>
                      <Select value={s.action_type} onValueChange={(v) => updateStep(index, "action_type", v as ActionType)}>
                        <SelectTrigger className="h-8 text-sm bg-background/50 border-border/50"><SelectValue /></SelectTrigger>
                        <SelectContent className="glass border-border/50">{actionTypes.map(t => { const I = t.icon; return (<SelectItem key={t.value} value={t.value}><div className="flex items-center gap-2"><I className="h-3.5 w-3.5" />{t.label}</div></SelectItem>); })}</SelectContent>
                      </Select>
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    <div className="flex items-center justify-between p-2 rounded bg-background/40 border border-border/40"><div className="space-y-0.5"><FormLabel className="text-[10px] font-medium">Aprovação</FormLabel></div><input type="checkbox" className="h-3 w-3 rounded border-gray-300 text-primary" checked={s.needs_approval} onChange={(e) => updateStep(index, "needs_approval", e.target.checked)} /></div>
                    <div className="flex items-center justify-between p-2 rounded bg-background/40 border border-border/40"><div className="space-y-0.5"><FormLabel className="text-[10px] font-medium">Automática</FormLabel></div><input type="checkbox" className="h-3 w-3 rounded border-gray-300 text-primary" checked={s.task_type === 'automatic'} onChange={(e) => updateStep(index, "task_type", e.target.checked ? 'automatic' : 'manual')} /></div>
                  </div>
                  <div className="space-y-1.5"><FormLabel className="text-xs font-medium text-muted-foreground">Título *</FormLabel><Input value={s.title} onChange={(e) => updateStep(index, "title", e.target.value)} placeholder="Título da ação" className="h-8 text-sm bg-background/50" /></div>
                  <div className="space-y-1.5">
                    <div className="flex items-center justify-between"><FormLabel className="text-xs font-medium text-muted-foreground">Template</FormLabel><MergeTagPicker preview={s.template_content} onInsert={(t) => updateStep(index, "template_content", (s.template_content || "") + t)} /></div>
                    <Textarea value={s.template_content} onChange={(e) => updateStep(index, "template_content", e.target.value)} placeholder="Conteúdo..." className={`min-h-[80px] text-sm resize-none bg-background/50 font-mono ${stepErrors[index]?.some(e => e.toLowerCase().includes("template")) ? 'border-destructive/50' : ''}`} />
                  </div>
                  {stepErrors[index] && (<div className="mt-2 space-y-1">{stepErrors[index].map((err, i) => (<p key={i} className="text-[10px] text-destructive flex items-center gap-1"><span className="w-1 h-1 rounded-full bg-destructive" />{err}</p>))}</div>)}
                </div>
              ))}
            </div>
            <Button variant="outline" className="w-full gap-2 border-dashed border-border/60" onClick={addStep}><Plus className="h-4 w-4" />Adicionar Etapa</Button>
            <Button variant="glow-pulse-success" className="w-full font-medium" onClick={handleSaveSteps} disabled={createStep.isPending}>{createStep.isPending ? "Salvando..." : "Salvar Cadência"}</Button>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}