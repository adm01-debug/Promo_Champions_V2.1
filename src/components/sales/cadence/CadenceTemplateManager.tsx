import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Plus, Save, Trash2, MessageSquare, Mail, Phone, Info } from "lucide-react";
import type { CadenceTemplate, TemplateType } from "@/types/sales";
import { toast } from "sonner";

const SINGU_VARIABLES = [
  { name: "singu_lead_name", label: "Nome do Lead" },
  { name: "singu_last_purchase", label: "Última Compra" },
  { name: "singu_total_spent", label: "Gasto Total" },
  { name: "singu_preferred_service", label: "Serviço Preferido" },
  { name: "singu_lead_source", label: "Origem do Lead" },
];

export function CadenceTemplateManager() {
  const [templates, setTemplates] = useState<CadenceTemplate[]>([]);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [formData, setFormData] = useState<Partial<CadenceTemplate>>({
    type: "whatsapp",
    requires_approval: true,
    content: "",
    name: "",
  });

  const handleSave = () => {
    if (!formData.name || !formData.content) {
      toast.error("Por favor, preencha o nome e o conteúdo do template.");
      return;
    }

    const newTemplate: CadenceTemplate = {
      id: editingId || crypto.randomUUID(),
      name: formData.name!,
      type: formData.type as TemplateType,
      content: formData.content!,
      requires_approval: formData.requires_approval ?? true,
      variables: SINGU_VARIABLES.filter(v => formData.content?.includes(`{{${v.name}}}`)).map(v => v.name),
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };

    if (editingId) {
      setTemplates(prev => prev.map(t => t.id === editingId ? newTemplate : t));
      toast.success("Template atualizado com sucesso.");
    } else {
      setTemplates(prev => [newTemplate, ...prev]);
      toast.success("Novo template criado.");
    }

    setEditingId(null);
    setFormData({ type: "whatsapp", requires_approval: true, content: "", name: "" });
  };

  const insertVariable = (variable: string) => {
    setFormData(prev => ({
      ...prev,
      content: (prev.content || "") + `{{${variable}}}`
    }));
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>Gerenciador de Templates</CardTitle>
              <CardDescription>Crie mensagens personalizadas com dados da SINGU</CardDescription>
            </div>
            {!editingId && (
              <Button onClick={() => setEditingId("new")} size="sm">
                <Plus className="h-4 w-4 mr-2" />
                Novo Template
              </Button>
            )}
          </div>
        </CardHeader>
        <CardContent>
          {editingId ? (
            <div className="space-y-4 border p-4 rounded-lg bg-muted/30">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Nome do Template</Label>
                  <Input 
                    value={formData.name} 
                    onChange={e => setFormData(prev => ({ ...prev, name: e.target.value }))}
                    placeholder="Ex: Boas vindas - VIP"
                  />
                </div>
                <div className="space-y-2">
                  <Label>Tipo</Label>
                  <Select 
                    value={formData.type} 
                    onValueChange={v => setFormData(prev => ({ ...prev, type: v as TemplateType }))}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="whatsapp">WhatsApp</SelectItem>
                      <SelectItem value="email">E-mail</SelectItem>
                      <SelectItem value="call">Roteiro de Ligação</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <Label>Conteúdo da Mensagem</Label>
                  <div className="flex gap-1 flex-wrap">
                    {SINGU_VARIABLES.map(v => (
                      <Button 
                        key={v.name} 
                        variant="outline" 
                        size="xs" 
                        className="text-[10px] h-6"
                        onClick={() => insertVariable(v.name)}
                      >
                        +{v.label}
                      </Button>
                    ))}
                  </div>
                </div>
                <Textarea 
                  value={formData.content} 
                  onChange={e => setFormData(prev => ({ ...prev, content: e.target.value }))}
                  rows={5}
                  placeholder="Olá {{singu_lead_name}}, vi que sua última compra foi..."
                />
              </div>

              <div className="flex items-center justify-between p-3 border rounded-lg bg-background">
                <div className="space-y-0.5">
                  <Label>Exigir Aprovação Humana</Label>
                  <p className="text-xs text-muted-foreground">O envio não será automático até que alguém aprove.</p>
                </div>
                <Switch 
                  checked={formData.requires_approval} 
                  onCheckedChange={v => setFormData(prev => ({ ...prev, requires_approval: v }))}
                />
              </div>

              <div className="flex justify-end gap-2">
                <Button variant="ghost" onClick={() => setEditingId(null)}>Cancelar</Button>
                <Button onClick={handleSave}>
                  <Save className="h-4 w-4 mr-2" />
                  Salvar Template
                </Button>
              </div>
            </div>
          ) : templates.length === 0 ? (
            <div className="text-center py-12 border-2 border-dashed rounded-lg">
              <MessageSquare className="h-12 w-12 mx-auto text-muted-foreground opacity-20" />
              <h3 className="mt-4 text-lg font-medium">Nenhum template criado</h3>
              <p className="text-sm text-muted-foreground">Comece criando um template para suas cadências.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {templates.map(t => (
                <Card key={t.id} className="relative overflow-hidden">
                  <div className="absolute top-2 right-2 flex gap-1">
                    <Button 
                      variant="ghost" 
                      size="icon" 
                      className="h-8 w-8 text-destructive"
                      onClick={() => setTemplates(prev => prev.filter(x => x.id !== t.id))}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                  <CardContent className="pt-6">
                    <div className="flex items-center gap-2 mb-2">
                      {t.type === 'whatsapp' && <MessageSquare className="h-4 w-4 text-green-500" />}
                      {t.type === 'email' && <Mail className="h-4 w-4 text-blue-500" />}
                      {t.type === 'call' && <Phone className="h-4 w-4 text-orange-500" />}
                      <span className="font-semibold">{t.name}</span>
                    </div>
                    <p className="text-sm text-muted-foreground line-clamp-3 mb-4 italic">
                      "{t.content}"
                    </p>
                    <div className="flex items-center justify-between mt-auto pt-4 border-t">
                      <div className="flex gap-1">
                        {t.requires_approval && (
                          <Badge variant="secondary" className="text-[10px]">Aprovação Necessária</Badge>
                        )}
                        <Badge variant="outline" className="text-[10px] uppercase">{t.type}</Badge>
                      </div>
                      <Button variant="ghost" size="sm" onClick={() => {
                        setEditingId(t.id);
                        setFormData(t);
                      }}>Editar</Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
