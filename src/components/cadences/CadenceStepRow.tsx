import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { Trash2, Pencil, Save, GripVertical, MoreHorizontal, Phone, Mail, Linkedin, MessageCircle, Users, CheckSquare } from "lucide-react";
import { CadenceStep, ActionType } from "@/hooks/cadences/useCadenceQueries";
import { MergeTagPicker } from "./MergeTagPicker";

const ACTION_TYPES: { value: ActionType; label: string; icon: typeof Phone }[] = [
  { value: "email", label: "E-mail", icon: Mail },
  { value: "call", label: "Ligação", icon: Phone },
  { value: "linkedin", label: "LinkedIn", icon: Linkedin },
  { value: "whatsapp", label: "WhatsApp", icon: MessageCircle },
  { value: "task", label: "Tarefa", icon: CheckSquare },
  { value: "meeting", label: "Reunião", icon: Users },
  { value: "other", label: "Outro", icon: MoreHorizontal },
];

export { ACTION_TYPES };

interface CadenceStepRowProps {
  step: CadenceStep;
  onSave: (step: CadenceStep, data: Partial<CadenceStep>) => void;
  onDelete: (stepId: string) => void;
  isSaving: boolean;
}

export const CadenceStepRow = React.memo(function CadenceStepRow({ step, onSave, onDelete, isSaving }: CadenceStepRowProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [editData, setEditData] = useState<Partial<CadenceStep>>({});
  const Icon = ACTION_TYPES.find(a => a.value === step.action_type)?.icon || MoreHorizontal;

  const handleSave = () => {
    onSave(step, editData);
    setIsEditing(false);
    setEditData({});
  };

  if (isEditing) {
    return (
      <div className="p-3 rounded-lg glass border border-border/30 space-y-3">
        <div className="grid grid-cols-2 gap-3">
          <div className="space-y-1">
            <Label className="text-xs">Dia</Label>
            <Input type="number" min={1} defaultValue={step.day_number} onChange={(e) => setEditData(d => ({ ...d, day_number: parseInt(e.target.value) || 1 }))} className="h-8 text-sm bg-background/50" />
          </div>
          <div className="space-y-1">
            <Label className="text-xs">Tipo</Label>
            <Select defaultValue={step.action_type} onValueChange={(v) => setEditData(d => ({ ...d, action_type: v as ActionType }))}>
              <SelectTrigger className="h-8 text-sm bg-background/50"><SelectValue /></SelectTrigger>
              <SelectContent className="glass border-border/50">
                {ACTION_TYPES.map(t => (<SelectItem key={t.value} value={t.value}><div className="flex items-center gap-2"><t.icon className="h-3.5 w-3.5" />{t.label}</div></SelectItem>))}
              </SelectContent>
            </Select>
          </div>
        </div>
        <div className="space-y-1">
          <Label className="text-xs">Título</Label>
          <Input defaultValue={step.title} onChange={(e) => setEditData(d => ({ ...d, title: e.target.value }))} className="h-8 text-sm bg-background/50" />
        </div>
        <div className="space-y-1">
          <Label className="text-xs">Descrição</Label>
          <Textarea defaultValue={step.description || ""} onChange={(e) => setEditData(d => ({ ...d, description: e.target.value }))} className="min-h-[50px] text-sm resize-none bg-background/50" />
        </div>
        <div className="space-y-1">
          <div className="flex items-center justify-between">
            <Label className="text-xs">Template da mensagem</Label>
            <MergeTagPicker
              preview={editData.template_content ?? step.template_content ?? ""}
              onInsert={(token) => setEditData(d => ({ ...d, template_content: (d.template_content ?? step.template_content ?? "") + token }))}
            />
          </div>
          <Textarea
            value={editData.template_content ?? step.template_content ?? ""}
            onChange={(e) => setEditData(d => ({ ...d, template_content: e.target.value }))}
            placeholder="Olá {{cliente.nome}}, sou {{vendedor.nome}}..."
            className="min-h-[80px] text-sm resize-none bg-background/50 font-mono text-xs"
          />
          <p className="text-[10px] text-muted-foreground">Use variáveis como {`{{cliente.nome}}`}, {`{{negocio.valor}}`}</p>
        </div>
        <div className="flex gap-2">
          <Button size="sm" variant="glow" className="h-7 text-xs gap-1 flex-1" onClick={handleSave} disabled={isSaving}><Save className="h-3 w-3" /> Salvar</Button>
          <Button size="sm" variant="outline" className="h-7 text-xs" onClick={() => { setIsEditing(false); setEditData({}); }}>Cancelar</Button>
        </div>
      </div>
    );
  }

  return (
    <div className="p-3 rounded-lg glass border border-border/30 hover:border-primary/30 transition-all duration-200 group">
      <div className="flex items-center gap-3">
        <div className="flex items-center gap-1 text-muted-foreground/50"><GripVertical className="h-4 w-4" /></div>
        <div className="p-1.5 rounded-lg bg-primary/10"><Icon className="h-3.5 w-3.5 text-primary" /></div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2">
            <span className="text-[10px] font-semibold text-primary bg-primary/15 px-1.5 py-0.5 rounded">Dia {step.day_number}</span>
            <span className="text-xs font-medium truncate">{step.title}</span>
          </div>
        </div>
        <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
          <Button size="icon" aria-label="Editar" variant="ghost" className="h-6 w-6 hover:bg-primary/10 hover:text-primary" onClick={() => { setIsEditing(true); setEditData({}); }}><Pencil className="h-3 w-3" /></Button>
          <Button size="icon" aria-label="Excluir" variant="ghost" className="h-6 w-6 text-destructive hover:bg-destructive/10" onClick={() => onDelete(step.id)}><Trash2 className="h-3 w-3" /></Button>
        </div>
      </div>
    </div>
  );
});
