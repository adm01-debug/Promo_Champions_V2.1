import { useState } from "react";
import { motion } from "framer-motion";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { ScrollArea } from "@/components/ui/scroll-area";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Plus, Settings2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

export function CustomFieldsManager() {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [fieldLabel, setFieldLabel] = useState("");
  const [fieldKey, setFieldKey] = useState("");
  const [fieldType, setFieldType] = useState("number");
  const [selectedTeam, setSelectedTeam] = useState("");

  const { data: teams = [] } = useQuery({
    queryKey: ["teams-for-fields"],
    queryFn: async () => {
      const { data, error } = await supabase.from("teams").select("id, name").order("name");
      if (error) throw error;
      return data;
    },
  });

  const { data: fields = [], isLoading } = useQuery({
    queryKey: ["custom-fields", selectedTeam],
    queryFn: async () => {
      if (!selectedTeam) return [];
      const { data, error } = await supabase
        .from("team_custom_fields")
        .select("*")
        .eq("team_id", selectedTeam)
        .order("created_at");
      if (error) throw error;
      return data;
    },
    enabled: !!selectedTeam,
  });

  const createField = useMutation({
    mutationFn: async () => {
      if (!selectedTeam || !fieldLabel || !fieldKey) throw new Error("Preencha todos os campos");
      const { error } = await supabase.from("team_custom_fields").insert({
        team_id: selectedTeam,
        field_key: fieldKey.toLowerCase().replace(/\s+/g, "_"),
        field_label: fieldLabel,
        field_type: fieldType,
      });
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["custom-fields"] });
      setFieldLabel("");
      setFieldKey("");
      toast({ title: "Campo criado com sucesso" });
    },
    onError: (err: Error) => {
      toast({ title: "Erro", description: err.message, variant: "destructive" });
    },
  });

  const toggleField = useMutation({
    mutationFn: async ({ id, isActive }: { id: string; isActive: boolean }) => {
      const { error } = await supabase.from("team_custom_fields").update({ is_active: isActive }).eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["custom-fields"] }),
  });

  return (
    <div className="space-y-4">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Settings2 className="h-5 w-5 text-primary" />
            Campos Adicionais por Time
          </CardTitle>
          <CardDescription>Configure KPIs personalizados para cada time</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <Label>Selecione o Time</Label>
            <Select value={selectedTeam} onValueChange={setSelectedTeam}>
              <SelectTrigger>
                <SelectValue placeholder="Escolha um time..." />
              </SelectTrigger>
              <SelectContent>
                {teams.map((t: { id: string; name: string }) => (
                  <SelectItem key={t.id} value={t.id}>{t.name}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {selectedTeam && (
            <>
              <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
                <div>
                  <Label>Label</Label>
                  <Input placeholder="Ex: Meta Mensal" value={fieldLabel} onChange={(e) => setFieldLabel(e.target.value)} />
                </div>
                <div>
                  <Label>Chave (ID)</Label>
                  <Input placeholder="Ex: meta_mensal" value={fieldKey} onChange={(e) => setFieldKey(e.target.value)} />
                </div>
                <div>
                  <Label>Tipo</Label>
                  <Select value={fieldType} onValueChange={setFieldType}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="number">Número</SelectItem>
                      <SelectItem value="text">Texto</SelectItem>
                      <SelectItem value="boolean">Sim/Não</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="flex items-end">
                  <Button onClick={() => createField.mutate()} disabled={createField.isPending} className="w-full">
                    <Plus className="h-4 w-4 mr-2" />
                    Adicionar
                  </Button>
                </div>
              </div>

              <ScrollArea className="h-[300px]">
                <div className="space-y-2">
                  {isLoading ? (
                    <p className="text-sm text-muted-foreground">Carregando...</p>
                  ) : fields.length === 0 ? (
                    <p className="text-sm text-muted-foreground">Nenhum campo adicional para este time</p>
                  ) : (
                    fields.map((field: { field_label: string; field_type: string; field_key: string; id: string }, i: number) => (
                      <motion.div
                        key={field.id}
                        initial={{ opacity: 0, y: 5 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: i * 0.04 }}
                        className="flex items-center justify-between p-3 rounded-lg border bg-card"
                      >
                        <div className="flex items-center gap-3">
                          <Badge variant="outline">{field.field_type}</Badge>
                          <div>
                            <p className="text-sm font-medium">{field.field_label}</p>
                            <p className="text-xs text-muted-foreground font-mono">{field.field_key}</p>
                          </div>
                        </div>
                        <Switch
                          checked={field.is_active}
                          onCheckedChange={(checked) => toggleField.mutate({ id: field.id, isActive: checked })}
                        />
                      </motion.div>
                    ))
                  )}
                </div>
              </ScrollArea>
            </>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
