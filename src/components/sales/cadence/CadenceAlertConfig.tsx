import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Bell, Mail, Save, Plus, Trash2, Info, Eye, Clock } from "lucide-react";
import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

const VARIABLES = [
  { name: "singu_lead_name", label: "Nome do Lead" },
  { name: "funnel_stage", label: "Etapa Atual" },
  { name: "trigger_name", label: "Gatilho Disparado" },
  { name: "singu_preferred_service", label: "Serviço Preferido" },
];

export function CadenceAlertConfig() {
  const [templates, setTemplates] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [formData, setFormData] = useState<any>({
    name: "",
    type: "push",
    subject: "",
    content: "",
    start_time: "09:00",
    end_time: "18:00",
    timezone: "America/Sao_Paulo",
    days_of_week: ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday"]
  });

  useEffect(() => {
    fetchTemplates();
  }, []);

  const fetchTemplates = async () => {
    const { data, error } = await supabase
      .from("cadence_alert_templates")
      .select("*")
      .order("created_at", { ascending: false });
    
    if (error) {
      toast.error("Erro ao carregar templates");
    } else {
      setTemplates(data || []);
    }
    setLoading(false);
  };

  const handleSave = async () => {
    if (!formData.name || !formData.content) {
      toast.error("Nome e conteúdo são obrigatórios");
      return;
    }

    try {
      if (editingId && editingId !== "new") {
        const { error } = await supabase
          .from("cadence_alert_templates")
          .update(formData)
          .eq("id", editingId);
        if (error) throw error;
        toast.success("Template atualizado");
      } else {
        const { error } = await supabase
          .from("cadence_alert_templates")
          .insert([formData]);
        if (error) throw error;
        toast.success("Template criado");
      }
      setEditingId(null);
      fetchTemplates();
    } catch (error: any) {
      toast.error("Erro ao salvar: " + error.message);
    }
  };

  const deleteTemplate = async (id: string) => {
    const { error } = await supabase.from("cadence_alert_templates").delete().eq("id", id);
    if (error) toast.error("Erro ao excluir");
    else {
      toast.success("Template excluído");
      fetchTemplates();
    }
  };

  const insertVariable = (variable: string) => {
    setFormData((prev: any) => ({
      ...prev,
      content: (prev.content || "") + `{{${variable}}}`
    }));
  };

  return (
    <Card className="glass border-border/40">
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="text-sm flex items-center gap-2">
              <Bell className="h-4 w-4 text-primary" />
              Templates de Alerta
            </CardTitle>
            <CardDescription className="text-xs">
              Configure o conteúdo das notificações Push e E-mail
            </CardDescription>
          </div>
          {!editingId && (
            <Button size="sm" variant="outline" className="h-8 gap-1 text-xs" onClick={() => {
              setEditingId("new");
              setFormData({ 
                name: "", 
                type: "push", 
                subject: "", 
                content: "",
                start_time: "09:00",
                end_time: "18:00",
                timezone: "America/Sao_Paulo",
                days_of_week: ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday"]
              });
            }}>
              <Plus className="h-3 w-3" />
              Novo Template
            </Button>
          )}
        </div>
      </CardHeader>
      <CardContent>
        {editingId ? (
          <div className="space-y-4 border p-4 rounded-xl bg-muted/20 animate-in fade-in slide-in-from-top-2">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <Label className="text-xs">Nome do Template</Label>
                <Input 
                  value={formData.name} 
                  onChange={e => setFormData({ ...formData, name: e.target.value })}
                  placeholder="Ex: Alerta Lead Quente"
                  className="h-8 text-xs"
                />
              </div>
              <div className="space-y-1.5">
                <Label className="text-xs">Tipo</Label>
                <Select value={formData.type} onValueChange={v => setFormData({ ...formData, type: v })}>
                  <SelectTrigger className="h-8 text-xs">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="push">Push Notification</SelectItem>
                    <SelectItem value="email">E-mail</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <Label className="text-xs">Janela de Disparo (Início)</Label>
                <Input 
                  type="time"
                  value={formData.start_time} 
                  onChange={e => setFormData({ ...formData, start_time: e.target.value })}
                  className="h-8 text-xs"
                />
              </div>
              <div className="space-y-1.5">
                <Label className="text-xs">Janela de Disparo (Fim)</Label>
                <Input 
                  type="time"
                  value={formData.end_time} 
                  onChange={e => setFormData({ ...formData, end_time: e.target.value })}
                  className="h-8 text-xs"
                />
              </div>
            </div>

            <div className="space-y-1.5">
              <Label className="text-xs">Fuso Horário (Vendedor)</Label>
              <Select value={formData.timezone} onValueChange={v => setFormData({ ...formData, timezone: v })}>
                <SelectTrigger className="h-8 text-xs">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="America/Sao_Paulo">Brasília (GMT-3)</SelectItem>
                  <SelectItem value="America/Manaus">Manaus (GMT-4)</SelectItem>
                  <SelectItem value="America/New_York">New York (GMT-5)</SelectItem>
                  <SelectItem value="Europe/London">London (GMT+0)</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {formData.type === "email" && (
              <div className="space-y-1.5">
                <Label className="text-xs">Assunto</Label>
                <Input 
                  value={formData.subject} 
                  onChange={e => setFormData({ ...formData, subject: e.target.value })}
                  placeholder="Assunto do e-mail"
                  className="h-8 text-xs"
                />
              </div>
            )}

            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <Label className="text-xs">Conteúdo</Label>
                <div className="flex gap-1 flex-wrap">
                  {VARIABLES.map(v => (
                    <Button 
                      key={v.name} 
                      variant="outline" 
                      size="sm" 
                      className="text-[9px] h-6 px-1.5 bg-background"
                      onClick={() => insertVariable(v.name)}
                    >
                      {v.label}
                    </Button>
                  ))}
                </div>
              </div>
              <Textarea 
                value={formData.content} 
                onChange={e => setFormData({ ...formData, content: e.target.value })}
                rows={4}
                placeholder="Ex: Lead {{singu_lead_name}} atingiu o gatilho..."
                className="text-xs resize-none"
              />
            </div>

            <div className="p-3 rounded-lg bg-primary/5 border border-primary/20 space-y-2">
              <Label className="text-[10px] font-bold uppercase flex items-center gap-2">
                <Eye className="h-3 w-3" />
                Pré-visualização (Dados Reais)
              </Label>
              <div className="text-[11px] italic text-muted-foreground p-2 bg-background rounded border border-border/40">
                {formData.content ? formData.content
                  .replace(/{{singu_lead_name}}/g, "Ana Silva")
                  .replace(/{{funnel_stage}}/g, "Interesse Alto")
                  .replace(/{{trigger_name}}/g, "3 cliques em preço")
                  .replace(/{{singu_preferred_service}}/g, "Massagem VIP") : "Digite o conteúdo para ver a prévia..."}
              </div>
            </div>

            <div className="flex justify-end gap-2 pt-2">
              <Button size="sm" variant="ghost" className="h-8 text-xs" onClick={() => setEditingId(null)}>
                Cancelar
              </Button>
              <Button size="sm" className="h-8 text-xs gap-1" onClick={handleSave}>
                <Save className="h-3 w-3" />
                Salvar
              </Button>
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {templates.length === 0 ? (
              <div className="col-span-2 py-8 text-center border border-dashed rounded-xl border-border/40">
                <Info className="h-8 w-8 text-muted-foreground opacity-20 mx-auto mb-2" />
                <p className="text-xs text-muted-foreground">Nenhum template cadastrado.</p>
              </div>
            ) : (
              templates.map(t => (
                <div key={t.id} className="p-3 border rounded-xl bg-muted/10 flex flex-col gap-2 group relative">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      {t.type === "push" ? <Bell className="h-3.5 w-3.5 text-orange-500" /> : <Mail className="h-3.5 w-3.5 text-blue-500" />}
                      <div className="flex flex-col">
                        <span className="text-xs font-bold">{t.name}</span>
                        <div className="flex items-center gap-1 text-[9px] text-muted-foreground">
                          <Clock className="h-2.5 w-2.5" />
                          {t.start_time?.substring(0, 5)} - {t.end_time?.substring(0, 5)}
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                      <Button variant="ghost" size="icon" className="h-7 w-7" onClick={() => {
                        setEditingId(t.id);
                        setFormData(t);
                      }}>
                        <Save className="h-3 w-3" />
                      </Button>
                      <Button variant="ghost" size="icon" className="h-7 w-7 text-destructive" onClick={() => deleteTemplate(t.id)}>
                        <Trash2 className="h-3 w-3" />
                      </Button>
                    </div>
                  </div>
                  <p className="text-[10px] text-muted-foreground line-clamp-2 italic">
                    "{t.content}"
                  </p>
                </div>
              ))
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
