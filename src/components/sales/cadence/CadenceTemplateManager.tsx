import { useState } from 'react';
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Skeleton } from '@/components/ui/skeleton';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import {
  Plus,
  Save,
  Trash2,
  MessageSquare,
  Mail,
  Eye,
  CheckCircle,
  AlertCircle,
} from 'lucide-react';
import {
  useMessageTemplates,
  useCreateTemplate,
  useUpdateTemplate,
  useDeleteTemplate,
  type MessageTemplate,
} from '@/hooks/useMultichannel';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from 'sonner';

// Canais aceitos por message_templates.channel (CHECK) e editáveis aqui.
type TemplateChannel = 'whatsapp' | 'email';

interface TemplateForm {
  name: string;
  channel: TemplateChannel;
  body: string;
}

const EMPTY_FORM: TemplateForm = { name: '', channel: 'whatsapp', body: '' };

const SINGU_VARIABLES = [
  { name: 'singu_lead_name', label: 'Nome do Lead' },
  { name: 'singu_last_purchase', label: 'Última Compra' },
  { name: 'singu_total_spent', label: 'Gasto Total' },
  { name: 'singu_preferred_service', label: 'Serviço Preferido' },
  { name: 'singu_lead_source', label: 'Origem do Lead' },
];

export function CadenceTemplateManager() {
  const { salesperson } = useAuth();
  const { data: allTemplates = [], isLoading, isError, refetch } = useMessageTemplates();
  const createTemplate = useCreateTemplate();
  const updateTemplate = useUpdateTemplate();
  const deleteTemplate = useDeleteTemplate();
  const templates = allTemplates.filter(
    (t): t is MessageTemplate & { channel: TemplateChannel } =>
      t.channel === 'whatsapp' || t.channel === 'email'
  );
  const [editingId, setEditingId] = useState<string | null>(null);
  const [formData, setFormData] = useState<TemplateForm>(EMPTY_FORM);
  const [activeTab, setActiveTab] = useState<'manage' | 'approval'>('manage');
  const isSaving = createTemplate.isPending || updateTemplate.isPending;

  const closeForm = () => {
    setEditingId(null);
    setFormData(EMPTY_FORM);
  };

  const handleSave = () => {
    const name = formData.name.trim();
    const body = formData.body.trim();
    if (!name || !body) {
      toast.error('Por favor, preencha o nome e o conteúdo do template.');
      return;
    }

    const payload = {
      name,
      channel: formData.channel,
      body,
      variables: SINGU_VARIABLES.filter(v => body.includes(`{{${v.name}}}`)).map(
        v => v.name
      ),
    };

    if (editingId && editingId !== 'new') {
      updateTemplate.mutate({ id: editingId, ...payload }, { onSuccess: closeForm });
      return;
    }

    if (!salesperson?.id) {
      toast.error('Seu usuário não está vinculado a um vendedor.');
      return;
    }
    createTemplate.mutate(
      { ...payload, salesperson_id: salesperson.id },
      { onSuccess: closeForm }
    );
  };

  const insertVariable = (variable: string) => {
    setFormData(prev => ({
      ...prev,
      body: prev.body + `{{${variable}}}`,
    }));
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-2 border-b pb-1">
        <Button
          variant={activeTab === 'manage' ? 'default' : 'ghost'}
          size="sm"
          onClick={() => setActiveTab('manage')}
          className="rounded-none border-b-2 border-transparent data-[variant=default]:border-primary"
        >
          Gerenciar Templates
        </Button>
        <Button
          variant={activeTab === 'approval' ? 'default' : 'ghost'}
          size="sm"
          onClick={() => setActiveTab('approval')}
          className="rounded-none border-b-2 border-transparent data-[variant=default]:border-primary"
        >
          Fila de Aprovação
        </Button>
      </div>

      {activeTab === 'manage' ? (
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle>Gerenciador de Templates</CardTitle>
                <CardDescription>
                  Crie mensagens personalizadas com dados da SINGU
                </CardDescription>
              </div>
              {!editingId && (
                <Button onClick={() => setEditingId('new')} size="sm">
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
                      onChange={e =>
                        setFormData(prev => ({ ...prev, name: e.target.value }))
                      }
                      placeholder="Ex: Boas vindas - VIP"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Tipo</Label>
                    <Select
                      value={formData.channel}
                      onValueChange={v =>
                        setFormData(prev => ({ ...prev, channel: v as TemplateChannel }))
                      }
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="whatsapp">WhatsApp</SelectItem>
                        <SelectItem value="email">E-mail</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <Label>Conteúdo da Mensagem</Label>
                    <div className="flex gap-1 flex-wrap">
                      {SINGU_VARIABLES.map((v: { name: string; label: string }) => (
                        <Button
                          key={v.name}
                          variant="outline"
                          size="sm"
                          className="text-[10px] h-7 px-2"
                          onClick={() => insertVariable(v.name)}
                        >
                          +{v.label}
                        </Button>
                      ))}
                    </div>
                  </div>
                  <Textarea
                    value={formData.body}
                    onChange={e =>
                      setFormData(prev => ({ ...prev, body: e.target.value }))
                    }
                    rows={5}
                    placeholder="Olá {{singu_lead_name}}, vi que sua última compra foi..."
                  />
                </div>

                <div className="p-4 rounded-lg bg-primary/5 border border-primary/20 space-y-3">
                  <div className="flex items-center justify-between">
                    <Label className="text-xs font-bold uppercase flex items-center gap-2">
                      <Eye className="h-4 w-4" />
                      Pré-visualização (Simulação com Variáveis)
                    </Label>
                    <Badge variant="outline" className="text-[10px] bg-background">
                      Preview Real
                    </Badge>
                  </div>
                  <div className="p-3 bg-background rounded-md border border-border/40 min-h-[80px]">
                    <div className="text-xs font-semibold mb-2 flex items-center gap-2">
                      {formData.channel === 'whatsapp' && (
                        <MessageSquare className="h-3 w-3 text-green-500" />
                      )}
                      {formData.channel === 'email' && (
                        <Mail className="h-3 w-3 text-blue-500" />
                      )}
                      Visualização Final:
                    </div>
                    <p className="text-xs italic whitespace-pre-wrap">
                      {formData.body
                        ? formData.body
                            .replace(/{{singu_lead_name}}/g, 'Maria Oliveira')
                            .replace(/{{singu_last_purchase}}/g, 'Ontem')
                            .replace(/{{singu_total_spent}}/g, 'R$ 450,00')
                            .replace(
                              /{{singu_preferred_service}}/g,
                              'Manicure & Pedicure'
                            )
                            .replace(/{{singu_lead_source}}/g, 'Instagram Ads')
                        : 'O conteúdo aparecerá aqui...'}
                    </p>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="h-2 w-2 rounded-full bg-green-500 animate-pulse" />
                    <span className="text-[10px] text-muted-foreground">
                      Variáveis validadas:{' '}
                      {(formData.body.match(/{{.*?}}/g) || []).length} encontradas
                    </span>
                  </div>
                </div>

                <div className="flex justify-end gap-2">
                  <Button variant="ghost" onClick={closeForm} disabled={isSaving}>
                    Cancelar
                  </Button>
                  <Button onClick={handleSave} disabled={isSaving}>
                    <Save className="h-4 w-4 mr-2" />
                    {isSaving ? 'Salvando...' : 'Salvar Template'}
                  </Button>
                </div>
              </div>
            ) : isLoading ? (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {Array.from({ length: 2 }).map((_, i) => (
                  <Skeleton key={i} className="h-40 rounded-xl" />
                ))}
              </div>
            ) : isError ? (
              <div className="text-center py-10 text-muted-foreground">
                <AlertCircle className="h-10 w-10 mx-auto mb-3 text-destructive opacity-60" />
                <p className="font-medium">Não foi possível carregar os templates.</p>
                <Button
                  variant="outline"
                  size="sm"
                  className="mt-3"
                  onClick={() => refetch()}
                >
                  Tentar novamente
                </Button>
              </div>
            ) : templates.length === 0 ? (
              <div className="text-center py-10 text-muted-foreground">
                <MessageSquare className="h-10 w-10 mx-auto mb-3 opacity-40" />
                <p className="font-medium">Nenhum template cadastrado.</p>
                <p className="text-sm">
                  Clique em &quot;Novo Template&quot; para criar o primeiro.
                </p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {templates.map(t => (
                  <Card
                    key={t.id}
                    className="relative overflow-hidden hover:border-primary/50 transition-colors"
                  >
                    <div className="absolute top-2 right-2 flex gap-1">
                      <Button
                        variant="ghost"
                        size="icon"
                        aria-label="Excluir template"
                        className="h-8 w-8 text-destructive"
                        disabled={deleteTemplate.isPending}
                        onClick={() => deleteTemplate.mutate(t.id)}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                    <CardContent className="pt-6">
                      <div className="flex items-center gap-2 mb-2">
                        {t.channel === 'whatsapp' && (
                          <MessageSquare className="h-4 w-4 text-green-500" />
                        )}
                        {t.channel === 'email' && (
                          <Mail className="h-4 w-4 text-blue-500" />
                        )}
                        <span className="font-semibold">{t.name}</span>
                      </div>
                      <p className="text-sm text-muted-foreground line-clamp-3 mb-4 italic">
                        "{t.body}"
                      </p>
                      <div className="flex items-center justify-between mt-auto pt-4 border-t">
                        <div className="flex gap-1">
                          <Badge variant="outline" className="text-[10px] uppercase">
                            {t.channel}
                          </Badge>
                        </div>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => {
                            setEditingId(t.id);
                            setFormData({
                              name: t.name,
                              channel: t.channel,
                              body: t.body,
                            });
                          }}
                        >
                          Editar
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-4">
          <Card className="border-amber-500/30 bg-amber-500/5">
            <CardHeader className="py-4">
              <CardTitle className="text-section-title text-sm font-medium flex items-center gap-2 text-amber-700">
                <Eye className="h-4 w-4" />
                Ações Aguardando Validação Humana
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {/* Sem backend que retenha ações de cadência para aprovação:
                  estado vazio honesto, sem itens fictícios nem botões sem efeito. */}
              <div className="text-center py-10 text-muted-foreground">
                <CheckCircle className="h-10 w-10 mx-auto mb-3 opacity-40" />
                <p className="font-medium">Nenhuma ação aguardando aprovação.</p>
                <p className="text-sm">
                  As cadências ainda não enviam mensagens que dependam de aprovação.
                </p>
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
}
