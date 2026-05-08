import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { toast } from "sonner";
import { Loader2, Save, MessageCircle, Clock, Zap } from "lucide-react";
import { Badge } from "@/components/ui/badge";

export function FollowUpSettings() {
  const queryClient = useQueryClient();
  const [whatsappTemplate, setWhatsappTemplate] = useState("");
  const [cadenceDays, setCadenceDays] = useState("");
  const [autoReactivate, setAutoReactivate] = useState(false);

  const { data: settings, isLoading } = useQuery({
    queryKey: ["follow-up-settings"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("follow_up_settings")
        .select("*")
        .maybeSingle();

      if (error) throw error;
      
      if (data) {
        setWhatsappTemplate(data.whatsapp_template || "");
        setCadenceDays(data.cadence_days?.join(", ") || "");
        setAutoReactivate(data.auto_reactivate_class_a || false);
      }
      return data;
    },
  });

  const updateSettings = useMutation({
    mutationFn: async () => {
      const days = cadenceDays.split(",").map(d => parseInt(d.trim())).filter(d => !isNaN(d));
      const { error } = await supabase
        .from("follow_up_settings")
        .update({
          whatsapp_template: whatsappTemplate,
          cadence_days: days,
          auto_reactivate_class_a: autoReactivate,
          updated_at: new Date().toISOString(),
        })
        .eq("id", settings?.id || "");

      if (error) throw error;
    },
    onSuccess: () => {
      toast.success("Configurações atualizadas com sucesso!");
      queryClient.invalidateQueries({ queryKey: ["follow-up-settings"] });
    },
    onError: (error) => {
      toast.error("Erro ao atualizar configurações: " + error.message);
    },
  });

  if (isLoading) {
    return (
      <div className="flex items-center justify-center p-8">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  const previewMessage = whatsappTemplate
    .replace("{{client_name}}", "João Silva")
    .replace("{{product_name}}", "Plano Premium")
    .replace("{{status}}", "Negociação");

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <MessageCircle className="h-5 w-5 text-green-500" />
              Template do WhatsApp
            </CardTitle>
            <CardDescription>
              Personalize a mensagem padrão enviada para os leads.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="template">Mensagem</Label>
              <Textarea
                id="template"
                value={whatsappTemplate}
                onChange={(e) => setWhatsappTemplate(e.target.value)}
                placeholder="Ex: Olá {{client_name}}..."
                className="min-h-[120px]"
              />
              <p className="text-[10px] text-muted-foreground">
                Variáveis disponíveis: <code className="bg-muted px-1 rounded">{"{{client_name}}"}</code>, 
                <code className="bg-muted px-1 rounded">{"{{product_name}}"}</code>, 
                <code className="bg-muted px-1 rounded">{"{{status}}"}</code>
              </p>
            </div>

            <div className="p-3 bg-muted rounded-lg border border-dashed">
              <Label className="text-[10px] uppercase font-bold text-muted-foreground mb-2 block">Preview Real</Label>
              <div className="text-sm italic text-foreground whitespace-pre-wrap">
                "{previewMessage}"
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Clock className="h-5 w-5 text-blue-500" />
              Cadências de Follow-up
            </CardTitle>
            <CardDescription>
              Defina os dias de inatividade para disparar alertas.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="space-y-2">
              <Label htmlFor="cadence">Dias de Cadência (separados por vírgula)</Label>
              <Input
                id="cadence"
                value={cadenceDays}
                onChange={(e) => setCadenceDays(e.target.value)}
                placeholder="Ex: 3, 5, 15"
              />
              <div className="flex gap-2 mt-2">
                {cadenceDays.split(",").map((d, i) => d.trim() && (
                  <Badge key={i} variant="secondary">D+{d.trim()}</Badge>
                ))}
              </div>
            </div>

            <div className="flex items-center justify-between p-4 bg-primary/5 rounded-xl border border-primary/10">
              <div className="space-y-0.5">
                <Label className="text-sm font-bold flex items-center gap-2">
                  <Zap className="h-4 w-4 text-amber-500" />
                  Reativação Automática (Classe A)
                </Label>
                <p className="text-[11px] text-muted-foreground">
                  Gerar tarefa automaticamente para leads Classe A congelados.
                </p>
              </div>
              <Switch
                checked={autoReactivate}
                onCheckedChange={setAutoReactivate}
              />
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="flex justify-end">
        <Button 
          onClick={() => updateSettings.mutate()} 
          disabled={updateSettings.isPending}
          className="gap-2"
        >
          {updateSettings.isPending ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
          Salvar Configurações
        </Button>
      </div>
    </div>
  );
}
