import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { CheckCircle2, ClipboardCheck, XCircle, Timer, Wallet, UserCog, AlertCircle, ArrowRightLeft, UserPlus } from "lucide-react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { useSalespeopleList } from "@/hooks/useSalespeopleList";
import { useQueryClient } from "@tanstack/react-query";

interface MQLQualificationFormProps {
  saleId?: string | null;
  clientName?: string | null;
}

export function MQLQualificationForm({ saleId, clientName }: MQLQualificationFormProps) {
  const queryClient = useQueryClient();
  const { data: salespeople } = useSalespeopleList();
  const [status, setStatus] = useState("pending");
  const [loading, setLoading] = useState(false);
  const [closerId, setCloserId] = useState<string>("");
  const [formData, setFormData] = useState({
    budget: "",
    authority: "",
    timing: "",
    pains: ""
  });

  // Filter closers only
  const closers = salespeople?.filter(s => s.role === 'closer' || s.role === 'hybrid') || [];

  const handleSave = async () => {
    if (!saleId) {
      toast.error("Nenhum lead selecionado", {
        description: "Selecione um prospect na lista ao lado para qualificar."
      });
      return;
    }

    if (!formData.budget || !formData.authority || !formData.pains) {
      toast.error("Preencha os campos obrigatórios", {
        description: "Orçamento, Autoridade e Dores são necessários para a qualificação."
      });
      return;
    }

    if (status === 'qualified' && !closerId) {
      toast.error("Handoff necessário", {
        description: "Selecione um Closer para assumir este lead qualificado."
      });
      return;
    }

    setLoading(true);
    try {
      // Update Sale
      const { error: saleError } = await supabase
        .from("sales")
        .update({
          status: status === 'qualified' ? 'qualified' : 'lead',
          closer_id: status === 'qualified' ? closerId : null,
          salesperson_id: status === 'qualified' ? closerId : undefined, // Transfer ownership if qualified
          enrichment_data: {
            ...formData,
            qualification_date: new Date().toISOString()
          }
        })
        .eq("id", saleId);

      if (saleError) throw saleError;

      // Create Notification for Closer
      if (status === 'qualified' && closerId) {
        const selectedCloser = closers.find(c => c.id === closerId);
        
        // Find auth_user_id for closer to send notification
        const { data: closerData } = await supabase
          .from("salespeople")
          .select("auth_user_id")
          .eq("id", closerId)
          .single();

        if (closerData?.auth_user_id) {
          await supabase.from("notifications").insert({
            user_id: closerData.auth_user_id,
            type: "lead_handoff",
            category: "sales",
            priority: "high",
            title: "🚀 Novo Lead Qualificado (MQL)",
            message: `O SDR prospectou ${clientName || 'um novo cliente'} e ele está pronto para você!`,
            icon: "Zap",
            action_label: "Ver Deal",
            metadata: { sale_id: saleId }
          });
        }
      }

      toast.success(status === 'qualified' ? "Lead Qualificado e Enviado!" : "Análise Salva", {
        description: status === 'qualified' ? `Handoff realizado com sucesso para o Closer.` : "A qualificação foi registrada."
      });

      // Invalidate queries to refresh UI
      queryClient.invalidateQueries({ queryKey: ["recent-prospects"] });
      queryClient.invalidateQueries({ queryKey: ["sdr-metrics"] });
      
    } catch (error: any) {
      console.error("Error saving qualification:", error);
      toast.error("Erro ao salvar qualificação: " + error.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card className="glass border-primary/20 hover:border-primary/40 transition-all">
      <CardHeader className="pb-3 border-b border-white/5 bg-primary/5">
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2 text-base font-display">
            <ClipboardCheck className="h-5 w-5 text-primary" />
            Qualificação MQL {clientName ? `- ${clientName}` : ""}
          </CardTitle>
          <Badge variant="outline" className="bg-primary/10 text-primary border-primary/20">BANT Analysis</Badge>
        </div>
      </CardHeader>
      <CardContent className="space-y-5 pt-6">
        {!saleId && (
          <div className="bg-primary/10 border border-primary/20 rounded-lg p-4 flex items-center gap-3 text-sm text-primary animate-pulse">
            <AlertCircle className="h-5 w-5" />
            <p>Selecione um prospect na lista de "Prospects Recentes" para iniciar a qualificação.</p>
          </div>
        )}

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="space-y-2">
            <Label className="text-[10px] uppercase font-bold text-muted-foreground flex items-center gap-1">
              <Wallet className="h-3 w-3" /> Orçamento (Budget)
            </Label>
            <Select onValueChange={(v) => setFormData({...formData, budget: v})} disabled={!saleId}>
              <SelectTrigger className="h-9 bg-background/50 border-white/10">
                <SelectValue placeholder="Selecione..." />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="low">Baixo (&lt; R$ 5k)</SelectItem>
                <SelectItem value="mid">Médio (R$ 5k - 20k)</SelectItem>
                <SelectItem value="high">Alto (&gt; R$ 20k)</SelectItem>
              </SelectContent>
            </Select>
          </div>
          
          <div className="space-y-2">
            <Label className="text-[10px] uppercase font-bold text-muted-foreground flex items-center gap-1">
              <UserCog className="h-3 w-3" /> Autoridade
            </Label>
            <Select onValueChange={(v) => setFormData({...formData, authority: v})} disabled={!saleId}>
              <SelectTrigger className="h-9 bg-background/50 border-white/10">
                <SelectValue placeholder="Selecione..." />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="influencer">Influenciador</SelectItem>
                <SelectItem value="decision_maker">Tomador de Decisão</SelectItem>
                <SelectItem value="gatekeeper">Gatekeeper</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label className="text-[10px] uppercase font-bold text-muted-foreground flex items-center gap-1">
              <Timer className="h-3 w-3" /> Tempo (Timing)
            </Label>
            <Select onValueChange={(v) => setFormData({...formData, timing: v})} disabled={!saleId}>
              <SelectTrigger className="h-9 bg-background/50 border-white/10">
                <SelectValue placeholder="Selecione..." />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="urgent">Imediato (1 mês)</SelectItem>
                <SelectItem value="short">Curto Prazo (3 meses)</SelectItem>
                <SelectItem value="long">Longo Prazo (6+ meses)</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <Label className="text-[10px] uppercase font-bold text-muted-foreground flex items-center gap-1">
              <AlertCircle className="h-3 w-3" /> Dores Principais (Pain Points)
            </Label>
            <span className="text-[10px] text-muted-foreground">Obrigatório para MQL</span>
          </div>
          <Textarea 
            placeholder="Descreva as dores identificadas, problemas atuais e necessidades..." 
            className="min-h-[100px] bg-background/50 text-sm border-white/10 focus:border-primary/50"
            value={formData.pains}
            onChange={(e) => setFormData({...formData, pains: e.target.value})}
            disabled={!saleId}
          />
        </div>

        {status === 'qualified' && (
          <div className="p-4 rounded-xl bg-primary/5 border border-primary/20 space-y-4 animate-in fade-in slide-in-from-top-2">
            <div className="flex items-center gap-2">
              <ArrowRightLeft className="h-4 w-4 text-primary" />
              <h4 className="text-sm font-display font-medium">Handoff para Closer</h4>
            </div>
            <div className="space-y-2">
              <Label className="text-[10px] uppercase font-bold text-muted-foreground flex items-center gap-1">
                <UserPlus className="h-3 w-3" /> Selecionar Closer Especialista
              </Label>
              <Select value={closerId} onValueChange={setCloserId}>
                <SelectTrigger className="h-10 bg-background/80 border-primary/20">
                  <SelectValue placeholder="Escolha um closer..." />
                </SelectTrigger>
                <SelectContent>
                  {closers.map(closer => (
                    <SelectItem key={closer.id} value={closer.id}>
                      {closer.name} {closer.role === 'hybrid' ? '(Híbrido)' : ''}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
        )}

        <div className="flex flex-col sm:flex-row items-center justify-between gap-4 pt-2">
          <div className="flex gap-2 w-full sm:w-auto">
            <Button 
              size="sm" 
              variant={status === 'qualified' ? 'default' : 'outline'}
              className={status === 'qualified' ? 'bg-success hover:bg-success/90 h-9 gap-1.5 flex-1' : 'h-9 gap-1.5 flex-1'}
              onClick={() => setStatus('qualified')}
              disabled={!saleId}
            >
              <CheckCircle2 className="h-4 w-4" />
              Qualificar
            </Button>
            <Button 
              size="sm" 
              variant={status === 'unqualified' ? 'destructive' : 'outline'}
              className="h-9 gap-1.5 flex-1"
              onClick={() => setStatus('unqualified')}
              disabled={!saleId}
            >
              <XCircle className="h-4 w-4" />
              Descartar
            </Button>
          </div>
          <Button 
            size="sm" 
            onClick={handleSave} 
            disabled={loading || !saleId}
            className="h-9 px-8 bg-primary hover:bg-primary/90 w-full sm:w-auto"
          >
            {loading ? "Processando..." : (status === 'qualified' ? "Finalizar e Enviar" : "Salvar Rascunho")}
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
