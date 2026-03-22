import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { useUpdateCadence, useCreateCadenceStep, useUpdateCadenceStep, useDeleteCadenceStep, useCadenceSteps } from "@/hooks/useCadences";
import { Cadence, CadenceStep, ActionType } from "@/hooks/cadences/useCadenceQueries";
import { Plus, Trash2, Phone, Mail, Linkedin, MessageCircle, Users, MoreHorizontal, Pencil, Save, GripVertical } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Label } from "@/components/ui/label";

const actionTypes: { value: ActionType; label: string; icon: typeof Phone }[] = [
  { value: "email", label: "E-mail", icon: Mail },
  { value: "call", label: "Ligação", icon: Phone },
  { value: "linkedin", label: "LinkedIn", icon: Linkedin },
  { value: "whatsapp", label: "WhatsApp", icon: MessageCircle },
  { value: "meeting", label: "Reunião", icon: Users },
  { value: "other", label: "Outro", icon: MoreHorizontal },
];

const cadenceSchema = z.object({
  name: z.string().trim().min(1, "Nome é obrigatório").max(100),
  description: z.string().max(500).optional(),
});

type CadenceFormData = z.infer<typeof cadenceSchema>;

interface EditCadenceDialogProps {
  cadence: Cadence;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

interface NewStepInput {
  day_number: number;
  action_type: ActionType;
  title: string;
  description: string;
}

export function EditCadenceDialog({ cadence, open, onOpenChange }: EditCadenceDialogProps) {
  const { data: existingSteps } = useCadenceSteps(cadence.id);
  const updateCadence = useUpdateCadence();
  const createStep = useCreateCadenceStep();
  const updateStep = useUpdateCadenceStep();
  const deleteStep = useDeleteCadenceStep();

  const [editingStepId, setEditingStepId] = useState<string | null>(null);
  const [editStepData, setEditStepData] = useState<Partial<CadenceStep>>({});
  const [newSteps, setNewSteps] = useState<NewStepInput[]>([]);

  const form = useForm<CadenceFormData>({
    resolver: zodResolver(cadenceSchema),
    defaultValues: {
      name: cadence.name,
      description: cadence.description || "",
    },
  });

  useEffect(() => {
    form.reset({ name: cadence.name, description: cadence.description || "" });
  }, [cadence, form]);

  const handleSave = async (data: CadenceFormData) => {
    await updateCadence.mutateAsync({
      id: cadence.id,
      name: data.name,
      description: data.description || undefined,
    });
    onOpenChange(false);
  };

  const handleSaveStep = async (step: CadenceStep) => {
    await updateStep.mutateAsync({
      id: step.id,
      cadence_id: cadence.id,
      ...editStepData,
    });
    setEditingStepId(null);
    setEditStepData({});
  };

  const handleDeleteStep = async (stepId: string) => {
    await deleteStep.mutateAsync({ stepId, cadenceId: cadence.id });
  };

  const addNewStep = () => {
    const lastDay = existingSteps?.length
      ? Math.max(...existingSteps.map(s => s.day_number))
      : 0;
    setNewSteps([...newSteps, { day_number: lastDay + 2, action_type: "call", title: "", description: "" }]);
  };

  const handleSaveNewSteps = async () => {
    const baseOrder = existingSteps?.length || 0;
    for (let i = 0; i < newSteps.length; i++) {
      const s = newSteps[i];
      if (!s.title.trim()) continue;
      await createStep.mutateAsync({
        cadence_id: cadence.id,
        day_number: s.day_number,
        action_type: s.action_type,
        title: s.title,
        description: s.description || undefined,
        step_order: baseOrder + i,
      });
    }
    setNewSteps([]);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[85vh] overflow-y-auto glass border-border/50 dark:border-glow">
        <DialogHeader>
          <DialogTitle className="font-display text-lg flex items-center gap-2">
            <div className="p-1.5 rounded-md bg-gradient-to-br from-primary/20 to-accent/10">
              <Pencil className="h-4 w-4 text-primary" />
            </div>
            Editar Cadência
          </DialogTitle>
        </DialogHeader>

        {/* Cadence Info */}
        <Form {...form}>
          <form onSubmit={form.handleSubmit(handleSave)} className="space-y-4">
            <FormField control={form.control} name="name" render={({ field }) => (
              <FormItem>
                <FormLabel>Nome da Cadência *</FormLabel>
                <FormControl>
                  <Input {...field} className="bg-muted/30 border-border/50 focus:border-primary transition-colors" />
                </FormControl>
                <FormMessage />
              </FormItem>
            )} />
            <FormField control={form.control} name="description" render={({ field }) => (
              <FormItem>
                <FormLabel>Descrição</FormLabel>
                <FormControl>
                  <Textarea {...field} className="resize-none bg-muted/30 border-border/50 focus:border-primary transition-colors" />
                </FormControl>
                <FormMessage />
              </FormItem>
            )} />

            <div className="flex items-center justify-between p-3 rounded-lg bg-muted/30 border border-border/30">
              <div>
                <Label className="text-sm font-medium">Cadência Ativa</Label>
                <p className="text-xs text-muted-foreground mt-0.5">
                  {cadence.is_active ? "Prospects podem ser inscritos" : "Cadência pausada, sem novas inscrições"}
                </p>
              </div>
              <Switch
                checked={cadence.is_active}
                onCheckedChange={(checked) => {
                  updateCadence.mutate({ id: cadence.id, is_active: checked });
                }}
              />
            </div>

            <Button type="submit" variant="glow" className="w-full font-medium" disabled={updateCadence.isPending}>
              {updateCadence.isPending ? "Salvando..." : "Salvar Informações"}
            </Button>
          </form>
        </Form>

        {/* Existing Steps */}
        <div className="space-y-3 mt-4">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-display font-medium gradient-text">Etapas da Cadência</h3>
            <Badge variant="outline" className="bg-primary/10 text-primary border-primary/30">
              {existingSteps?.length || 0} etapas
            </Badge>
          </div>

          <div className="space-y-2 max-h-[300px] overflow-y-auto pr-1">
            {existingSteps?.map((step) => {
              const isEditing = editingStepId === step.id;
              const Icon = actionTypes.find(a => a.value === step.action_type)?.icon || MoreHorizontal;

              return (
                <div key={step.id} className="p-3 rounded-lg glass border border-border/30 hover:border-primary/30 transition-all duration-200 group">
                  {isEditing ? (
                    <div className="space-y-3">
                      <div className="grid grid-cols-2 gap-3">
                        <div className="space-y-1">
                          <Label className="text-xs">Dia</Label>
                          <Input
                            type="number"
                            min={1}
                            defaultValue={step.day_number}
                            onChange={(e) => setEditStepData(d => ({ ...d, day_number: parseInt(e.target.value) || 1 }))}
                            className="h-8 text-sm bg-background/50"
                          />
                        </div>
                        <div className="space-y-1">
                          <Label className="text-xs">Tipo</Label>
                          <Select
                            defaultValue={step.action_type}
                            onValueChange={(v) => setEditStepData(d => ({ ...d, action_type: v as ActionType }))}
                          >
                            <SelectTrigger className="h-8 text-sm bg-background/50">
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent className="glass border-border/50">
                              {actionTypes.map(t => (
                                <SelectItem key={t.value} value={t.value}>
                                  <div className="flex items-center gap-2">
                                    <t.icon className="h-3.5 w-3.5" />
                                    {t.label}
                                  </div>
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        </div>
                      </div>
                      <div className="space-y-1">
                        <Label className="text-xs">Título</Label>
                        <Input
                          defaultValue={step.title}
                          onChange={(e) => setEditStepData(d => ({ ...d, title: e.target.value }))}
                          className="h-8 text-sm bg-background/50"
                        />
                      </div>
                      <div className="space-y-1">
                        <Label className="text-xs">Descrição</Label>
                        <Textarea
                          defaultValue={step.description || ""}
                          onChange={(e) => setEditStepData(d => ({ ...d, description: e.target.value }))}
                          className="min-h-[50px] text-sm resize-none bg-background/50"
                        />
                      </div>
                      <div className="flex gap-2">
                        <Button size="sm" variant="glow" className="h-7 text-xs gap-1 flex-1" onClick={() => handleSaveStep(step)} disabled={updateStep.isPending}>
                          <Save className="h-3 w-3" /> Salvar
                        </Button>
                        <Button size="sm" variant="outline" className="h-7 text-xs" onClick={() => { setEditingStepId(null); setEditStepData({}); }}>
                          Cancelar
                        </Button>
                      </div>
                    </div>
                  ) : (
                    <div className="flex items-center gap-3">
                      <div className="flex items-center gap-1 text-muted-foreground/50">
                        <GripVertical className="h-4 w-4" />
                      </div>
                      <div className="p-1.5 rounded-lg bg-primary/10">
                        <Icon className="h-3.5 w-3.5 text-primary" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2">
                          <span className="text-[10px] font-semibold text-primary bg-primary/15 px-1.5 py-0.5 rounded">
                            Dia {step.day_number}
                          </span>
                          <span className="text-xs font-medium truncate">{step.title}</span>
                        </div>
                      </div>
                      <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                        <Button size="icon" variant="ghost" className="h-6 w-6 hover:bg-primary/10 hover:text-primary" onClick={() => { setEditingStepId(step.id); setEditStepData({}); }}>
                          <Pencil className="h-3 w-3" />
                        </Button>
                        <Button size="icon" variant="ghost" className="h-6 w-6 text-destructive hover:bg-destructive/10" onClick={() => handleDeleteStep(step.id)}>
                          <Trash2 className="h-3 w-3" />
                        </Button>
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
          </div>

          {/* New Steps */}
          {newSteps.length > 0 && (
            <div className="space-y-2 pt-2 border-t border-dashed border-border/40">
              <p className="text-xs text-muted-foreground font-medium">Novas etapas:</p>
              {newSteps.map((s, i) => (
                <div key={i} className="p-3 rounded-lg border border-primary/30 bg-primary/5 space-y-3">
                  <div className="flex items-center justify-between">
                    <Badge variant="secondary" className="text-xs bg-primary/20 text-primary border-primary/30">Nova Etapa</Badge>
                    <Button size="icon" variant="ghost" className="h-6 w-6 text-destructive" onClick={() => setNewSteps(newSteps.filter((_, idx) => idx !== i))}>
                      <Trash2 className="h-3 w-3" />
                    </Button>
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    <div className="space-y-1">
                      <Label className="text-xs">Dia</Label>
                      <Input type="number" min={1} value={s.day_number} onChange={(e) => {
                        const updated = [...newSteps];
                        updated[i] = { ...s, day_number: parseInt(e.target.value) || 1 };
                        setNewSteps(updated);
                      }} className="h-8 text-sm bg-background/50" />
                    </div>
                    <div className="space-y-1">
                      <Label className="text-xs">Tipo</Label>
                      <Select value={s.action_type} onValueChange={(v) => {
                        const updated = [...newSteps];
                        updated[i] = { ...s, action_type: v as ActionType };
                        setNewSteps(updated);
                      }}>
                        <SelectTrigger className="h-8 text-sm bg-background/50"><SelectValue /></SelectTrigger>
                        <SelectContent className="glass border-border/50">
                          {actionTypes.map(t => (
                            <SelectItem key={t.value} value={t.value}>
                              <div className="flex items-center gap-2"><t.icon className="h-3.5 w-3.5" />{t.label}</div>
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                  <div className="space-y-1">
                    <Label className="text-xs">Título *</Label>
                    <Input value={s.title} onChange={(e) => {
                      const updated = [...newSteps];
                      updated[i] = { ...s, title: e.target.value };
                      setNewSteps(updated);
                    }} className="h-8 text-sm bg-background/50" placeholder="Título da ação" />
                  </div>
                </div>
              ))}
              <Button variant="glow" className="w-full h-8 text-xs font-medium" onClick={handleSaveNewSteps} disabled={createStep.isPending || newSteps.every(s => !s.title.trim())}>
                {createStep.isPending ? "Salvando..." : "Salvar Novas Etapas"}
              </Button>
            </div>
          )}

          <Button variant="outline" className="w-full gap-2 border-dashed border-border/60 hover:border-primary/50 hover:bg-primary/5 transition-colors" onClick={addNewStep}>
            <Plus className="h-4 w-4" />
            Adicionar Nova Etapa
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
