import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { toast } from "sonner";
import { Loader2, Plus, Trash2, MapPin, User, Save, ListChecks } from "lucide-react";
import { useUserRoles } from "@/hooks/useUserRoles";

export function FollowUpTerritoryRules() {
  const { isAdmin } = useUserRoles();
  const queryClient = useQueryClient();
  const [selectedTerritory, setSelectedTerritory] = useState("");
  const [selectedSalesperson, setSelectedSalesperson] = useState("");
  const [selectedTemplate, setSelectedTemplate] = useState("");

  const { data: rules, isLoading: isLoadingRules } = useQuery({
    queryKey: ["follow-up-territory-rules"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("follow_up_territory_rules" as any)
        .select(`
          *,
          whatsapp_template:follow_up_templates(name),
          salesperson:auth_users_view(display_name)
        ` as any);
      if (error) throw error;
      return data;
    },
  });

  const { data: templates } = useQuery({
    queryKey: ["follow-up-templates"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("follow_up_templates" as any)
        .select("id, name")
        .eq("is_active", true);
      if (error) throw error;
      return data;
    },
  });

  const { data: salespersons } = useQuery({
    queryKey: ["salespersons-list"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("auth_users_view" as any)
        .select("id, display_name");
      if (error) throw error;
      return data;
    },
  });

  const addRule = useMutation({
    mutationFn: async () => {
      if (!isAdmin) throw new Error("Acesso negado.");
      const { error } = await supabase
        .from("follow_up_territory_rules" as any)
        .insert({
          territory: selectedTerritory || null,
          salesperson_id: selectedSalesperson || null,
          whatsapp_template_id: selectedTemplate || null,
        });
      if (error) throw error;
    },
    onSuccess: () => {
      toast.success("Regra adicionada com sucesso!");
      queryClient.invalidateQueries({ queryKey: ["follow-up-territory-rules"] });
      setSelectedTerritory("");
      setSelectedSalesperson("");
      setSelectedTemplate("");
    },
    onError: (error: any) => toast.error("Erro ao adicionar regra: " + error.message),
  });

  const deleteRule = useMutation({
    mutationFn: async (id: string) => {
      if (!isAdmin) throw new Error("Acesso negado.");
      const { error } = await supabase
        .from("follow_up_territory_rules" as any)
        .delete()
        .eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      toast.success("Regra removida!");
      queryClient.invalidateQueries({ queryKey: ["follow-up-territory-rules"] });
    },
  });

  if (!isAdmin) return null;

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-lg">
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
                onChange={(e) => setSelectedTerritory(e.target.value)} 
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
                  {salespersons?.map((s: any) => (
                    <SelectItem key={s.id} value={s.id}>{s.display_name}</SelectItem>
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
                  {templates?.map((t: any) => (
                    <SelectItem key={t.id} value={t.id}>{t.name}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="flex items-end">
              <Button 
                className="w-full gap-2" 
                onClick={() => addRule.mutate()}
                disabled={addRule.isPending || (!selectedTerritory && !selectedSalesperson)}
              >
                <Plus className="h-4 w-4" /> Adicionar Regra
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Regras Ativas</CardTitle>
        </CardHeader>
        <CardContent>
          {isLoadingRules ? (
            <div className="flex justify-center p-4"><Loader2 className="h-6 w-6 animate-spin" /></div>
          ) : (
            <div className="space-y-3">
              {rules?.length === 0 && <p className="text-sm text-muted-foreground text-center py-4">Nenhuma regra definida.</p>}
              {rules?.map((rule: any) => (
                <div key={rule.id} className="flex items-center justify-between p-4 bg-muted/30 rounded-lg border">
                  <div className="flex items-center gap-6">
                    <div className="flex items-center gap-2">
                      <MapPin className="h-4 w-4 text-muted-foreground" />
                      <span className="text-sm font-medium">{rule.territory || "Global"}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <User className="h-4 w-4 text-muted-foreground" />
                      <span className="text-sm">{rule.salesperson?.display_name || "Todos"}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Save className="h-4 w-4 text-muted-foreground" />
                      <span className="text-sm italic">{rule.whatsapp_template?.name || "Padrão"}</span>
                    </div>
                  </div>
                  <Button variant="ghost" size="icon" onClick={() => deleteRule.mutate(rule.id)}>
                    <Trash2 className="h-4 w-4 text-destructive" />
                  </Button>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
