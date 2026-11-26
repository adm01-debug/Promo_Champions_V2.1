import { useState } from 'react';
import { DeleteConfirmDialog } from '@/components/shared/DeleteConfirmDialog';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { toast } from 'sonner';
import { Loader2, Plus, Trash2, MapPin, User, Save, ListChecks } from 'lucide-react';
import { useUserRoles } from '@/hooks/useUserRoles';

interface TerritoryRule {
  id: string;
  territory: string | null;
  salesperson_id?: string | null;
  salesperson?: { display_name: string | null } | null;
  whatsapp_template?: { name: string | null } | null;
}

interface TemplateOption {
  id: string;
  name: string;
}

interface SalespersonOption {
  id: string;
  display_name: string | null;
}

export function FollowUpTerritoryRules() {
  const { isAdmin } = useUserRoles();
  const queryClient = useQueryClient();
  const [selectedTerritory, setSelectedTerritory] = useState('');
  const [selectedSalesperson, setSelectedSalesperson] = useState('');
  const [selectedTemplate, setSelectedTemplate] = useState('');
  const [ruleToDelete, setRuleToDelete] = useState<{ id: string; label: string } | null>(
    null
  );

  const { data: rules, isLoading: isLoadingRules } = useQuery({
    queryKey: ['follow-up-territory-rules'],
    queryFn: async () => {
      const { data, error } = await supabase.from('follow_up_territory_rules').select(`
          *,
          whatsapp_template:follow_up_templates(name)
        `);
      if (error) throw error;
      const rows = (data ?? []) as TerritoryRule[];
      const salespersonIds = [
        ...new Set(
          rows.map(rule => rule.salesperson_id).filter((id): id is string => !!id)
        ),
      ];
      if (salespersonIds.length === 0) return rows;
      const { data: salespeople } = await supabase
        .from('salespeople')
        .select('auth_user_id, name')
        .in('auth_user_id', salespersonIds);
      const nameByAuthUserId = new Map(
        (salespeople ?? []).map(person => [person.auth_user_id, person.name])
      );
      return rows.map(rule => ({
        ...rule,
        salesperson: rule.salesperson_id
          ? { display_name: nameByAuthUserId.get(rule.salesperson_id) ?? null }
          : null,
      }));
    },
  });

  const { data: templates } = useQuery({
    queryKey: ['follow-up-templates'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('follow_up_templates')
        .select('id, name')
        .eq('is_active', true);
      if (error) throw error;
      return data as TemplateOption[];
    },
  });

  const { data: salespersons } = useQuery({
    queryKey: ['salespersons-list'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('salespeople')
        .select('auth_user_id, name')
        .eq('is_active', true)
        .order('name');
      if (error) throw error;
      const options: SalespersonOption[] = [];
      for (const person of data ?? []) {
        if (person.auth_user_id) {
          options.push({ id: person.auth_user_id, display_name: person.name });
        }
      }
      return options;
    },
  });

  const addRule = useMutation({
    mutationFn: async () => {
      if (!isAdmin) throw new Error('Acesso negado.');
      const { error } = await supabase.from('follow_up_territory_rules').insert({
        territory: selectedTerritory || null,
        salesperson_id:
          selectedSalesperson && selectedSalesperson !== 'none'
            ? selectedSalesperson
            : null,
        whatsapp_template_id: selectedTemplate || null,
      });
      if (error) throw error;
    },
    onSuccess: () => {
      toast.success('Regra adicionada com sucesso!');
      queryClient.invalidateQueries({ queryKey: ['follow-up-territory-rules'] });
      setSelectedTerritory('');
      setSelectedSalesperson('');
      setSelectedTemplate('');
    },
    onError: (error: Error) => toast.error('Erro ao adicionar regra: ' + error.message),
  });

  const deleteRule = useMutation({
    mutationFn: async (id: string) => {
      if (!isAdmin) throw new Error('Acesso negado.');
      const { error } = await supabase
        .from('follow_up_territory_rules')
        .delete()
        .eq('id', id);
      if (error) throw error;
    },
    onSuccess: () => {
      toast.success('Regra removida!');
      queryClient.invalidateQueries({ queryKey: ['follow-up-territory-rules'] });
    },
  });

  if (!isAdmin) return null;

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="text-section-title flex items-center gap-2">
            <ListChecks className="h-5 w-5 text-primary" />
            Nova Regra de Follow-up
          </CardTitle>
          <CardDescription>
            Defina templates e cadências específicas para territórios ou vendedores.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="space-y-2">
              <Label>Território (opcional)</Label>
              <Input
                placeholder="Ex: Sudeste"
                value={selectedTerritory}
                onChange={e => setSelectedTerritory(e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label>Vendedor (opcional)</Label>
              <Select value={selectedSalesperson} onValueChange={setSelectedSalesperson}>
                <SelectTrigger>
                  <SelectValue placeholder="Selecione..." />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="none">Todos</SelectItem>
                  {salespersons?.map((s: SalespersonOption) => (
                    <SelectItem key={s.id} value={s.id}>
                      {s.display_name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>Template WhatsApp</Label>
              <Select value={selectedTemplate} onValueChange={setSelectedTemplate}>
                <SelectTrigger>
                  <SelectValue placeholder="Selecione..." />
                </SelectTrigger>
                <SelectContent>
                  {templates?.map((t: TemplateOption) => (
                    <SelectItem key={t.id} value={t.id}>
                      {t.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="flex items-end">
              <Button
                className="w-full gap-2"
                onClick={() => addRule.mutate()}
                disabled={
                  addRule.isPending ||
                  (!selectedTerritory &&
                    (!selectedSalesperson || selectedSalesperson === 'none'))
                }
              >
                <Plus className="h-4 w-4" /> Adicionar Regra
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-section-title">Regras Ativas</CardTitle>
        </CardHeader>
        <CardContent>
          {isLoadingRules ? (
            <div className="flex justify-center p-4">
              <Loader2 className="h-6 w-6 animate-spin" />
            </div>
          ) : (
            <div className="space-y-3">
              {rules?.length === 0 && (
                <p className="text-sm text-muted-foreground text-center py-4">
                  Nenhuma regra definida.
                </p>
              )}
              {rules?.map((rule: TerritoryRule) => (
                <div
                  key={rule.id}
                  className="flex items-center justify-between p-4 bg-muted/30 rounded-lg border"
                >
                  <div className="flex items-center gap-6">
                    <div className="flex items-center gap-2">
                      <MapPin className="h-4 w-4 text-muted-foreground" />
                      <span className="text-sm font-medium">
                        {rule.territory || 'Global'}
                      </span>
                    </div>
                    <div className="flex items-center gap-2">
                      <User className="h-4 w-4 text-muted-foreground" />
                      <span className="text-sm">
                        {rule.salesperson?.display_name || 'Todos'}
                      </span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Save className="h-4 w-4 text-muted-foreground" />
                      <span className="text-sm italic">
                        {rule.whatsapp_template?.name || 'Padrão'}
                      </span>
                    </div>
                  </div>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() =>
                      setRuleToDelete({ id: rule.id, label: rule.territory || 'Global' })
                    }
                  >
                    <Trash2 className="h-4 w-4 text-destructive" />
                  </Button>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      <DeleteConfirmDialog
        open={!!ruleToDelete}
        onOpenChange={open => !open && setRuleToDelete(null)}
        onConfirm={() => {
          if (!ruleToDelete) return;
          deleteRule.mutate(ruleToDelete.id, { onSuccess: () => setRuleToDelete(null) });
        }}
        title="Excluir esta regra de territorio?"
        description={
          ruleToDelete
            ? `A regra do territorio "${ruleToDelete.label}" sai do follow-up automatico. Leads deixam de ser roteados por ela.`
            : ''
        }
        isDeleting={deleteRule.isPending}
      />
    </div>
  );
}
