import { useState, useMemo } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { toast } from "sonner";
import { Loader2, Save, MessageCircle, Clock, Zap, History, RotateCcw, AlertCircle } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { useAuth } from "@/contexts/AuthContext";
import { ScrollArea } from "@/components/ui/scroll-area";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";

const REQUIRED_VARIABLES = ["{{client_name}}", "{{product_name}}", "{{status}}"];

export function FollowUpSettings() {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const [whatsappTemplate, setWhatsappTemplate] = useState("");
  const [cadenceDays, setCadenceDays] = useState("");
  const [autoReactivate, setAutoReactivate] = useState(false);

  const { data: userRole } = useQuery({
    queryKey: ["user-role", user?.id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("user_roles")
        .select("role")
        .eq("user_id", user?.id || "")
        .maybeSingle();
      if (error) throw error;
      return data?.role;
    },
    enabled: !!user?.id,
  });

  const isAdmin = userRole === "admin";

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

  const { data: versions = [] } = useQuery({
    queryKey: ["template-versions", settings?.id],
    queryFn: async () => {
      if (!settings?.id) return [];
      const { data, error } = await supabase
        .from("whatsapp_template_versions")
        .select("*")
        .eq("template_id", settings.id)
        .order("version_number", { ascending: false });
      if (error) throw error;
      return data;
    },
    enabled: !!settings?.id,
  });

  const missingVariables = useMemo(() => {
    return REQUIRED_VARIABLES.filter(v => !whatsappTemplate.includes(v));
  }, [whatsappTemplate]);

  const updateSettings = useMutation({
    mutationFn: async (newTemplate?: string) => {
      if (!isAdmin) throw new Error("Apenas administradores podem alterar as configurações.");
      
      const days = cadenceDays.split(",").map(d => parseInt(d.trim())).filter(d => !isNaN(d));
      const { error } = await supabase
        .from("follow_up_settings")
        .update({
          whatsapp_template: newTemplate !== undefined ? newTemplate : whatsappTemplate,
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
      queryClient.invalidateQueries({ queryKey: ["template-versions"] });
    },
    onError: (error: any) => {
      toast.error("Erro ao atualizar configurações: " + error.message);
    },
  });

  const handleRevert = (versionBody: string) => {
    setWhatsappTemplate(versionBody);
    toast.info("Template restaurado do histórico. Salve para aplicar.");
  };

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
      {!isAdmin && (
        <div className="bg-amber-50 border border-amber-200 p-4 rounded-lg flex items-start gap-3 text-amber-800">
          <AlertCircle className="h-5 w-5 shrink-0" />
          <p className="text-sm">
            Você está em modo de visualização. Apenas usuários com perfil <strong>Administrador</strong> podem alterar estas configurações.
          </p>
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-lg">
                <MessageCircle className="h-5 w-5 text-green-500" />
                Template do WhatsApp
              </CardTitle>
              <CardDescription>
                Personalize a mensagem padrão enviada para os leads.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <div className="flex justify-between items-center">
                  <Label htmlFor="template">Mensagem</Label>
                  {missingVariables.length > 0 && (
                    <Badge variant="destructive" className="text-[10px] uppercase font-black px-1 h-5">
                      Faltam Variáveis
                    </Badge>
                  )}
                </div>
                <Textarea
                  id="template"
                  value={whatsappTemplate}
                  onChange={(e) => setWhatsappTemplate(e.target.value)}
                  placeholder="Ex: Olá {{client_name}}..."
                  className={`min-h-[120px] ${missingVariables.length > 0 ? 'border-destructive focus-visible:ring-destructive' : ''}`}
                  disabled={!isAdmin}
                />
                
                {missingVariables.length > 0 && (
                  <p className="text-[10px] text-destructive flex items-center gap-1 font-medium">
                    <AlertCircle className="h-3 w-3" />
                    Variáveis obrigatórias ausentes: {missingVariables.join(", ")}
                  </p>
                )}

                <p className="text-[10px] text-muted-foreground">
                  Variáveis disponíveis: {REQUIRED_VARIABLES.map(v => (
                    <code key={v} className="bg-muted px-1 rounded mx-0.5">{v}</code>
                  ))}
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
              <CardTitle className="flex items-center gap-2 text-lg">
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
                  disabled={!isAdmin}
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
                  disabled={!isAdmin}
                />
              </div>
            </CardContent>
          </Card>
        </div>

        <Card className="h-full">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-lg">
              <History className="h-5 w-5 text-muted-foreground" />
              Histórico de Versões
            </CardTitle>
            <CardDescription>
              Acompanhe e reverta para versões anteriores do template.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <ScrollArea className="h-[500px] pr-4">
              <div className="space-y-4">
                {versions.length === 0 && (
                  <p className="text-sm text-muted-foreground text-center py-8">Nenhuma versão anterior registrada.</p>
                )}
                {versions.map((v) => (
                  <div key={v.id} className="p-3 border rounded-lg hover:border-primary/30 transition-colors group">
                    <div className="flex justify-between items-start mb-2">
                      <div>
                    <Badge variant="outline" className="text-[10px] mb-1">Versão {v.version_number}</Badge>
                    <p className="text-[10px] text-muted-foreground">
                      {format(new Date(v.created_at), "dd/MM/yyyy 'às' HH:mm", { locale: ptBR })}
                    </p>
                  </div>
                      {isAdmin && (
                        <Button 
                          size="icon" 
                          variant="ghost" 
                          className="h-7 w-7 opacity-0 group-hover:opacity-100 transition-opacity"
                          onClick={() => handleRevert(v.body)}
                          title="Restaurar esta versão"
                        >
                          <RotateCcw className="h-3.5 w-3.5" />
                        </Button>
                      )}
                    </div>
                    <p className="text-xs text-muted-foreground line-clamp-3 italic">"{v.body}"</p>
                  </div>
                ))}
              </div>
            </ScrollArea>
          </CardContent>
        </Card>
      </div>

      {isAdmin && (
        <div className="flex justify-end">
          <Button 
            onClick={() => updateSettings.mutate(undefined)} 
            disabled={updateSettings.isPending || missingVariables.length > 0}
            className="gap-2"
          >
            {updateSettings.isPending ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
            Salvar Configurações
          </Button>
        </div>
      )}
    </div>
  );
}
