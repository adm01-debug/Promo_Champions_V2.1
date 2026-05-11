import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { CheckCircle2, ClipboardCheck, XCircle, Timer, Wallet, UserCog, AlertCircle } from "lucide-react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";

export function MQLQualificationForm() {
  const [status, setStatus] = useState("pending");
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    budget: "",
    authority: "",
    timing: "",
    pains: ""
  });

  const handleSave = async () => {
    if (!formData.budget || !formData.authority) {
      toast.error("Preencha os campos obrigatórios", {
        description: "Orçamento e Autoridade são necessários para a qualificação."
      });
      return;
    }

    setLoading(true);
    try {
      // In a real scenario, we would pass a saleId as a prop. 
      // For now, we simulate the save.
      await new Promise(resolve => setTimeout(resolve, 800));
      
      toast.success("Qualificação MQL Salva!", {
        description: `Lead marcado como ${status === 'qualified' ? 'Qualificado' : 'Pendente'}.`
      });
    } catch (error) {
      toast.error("Erro ao salvar qualificação");
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
            Qualificação Profunda (MQL)
          </CardTitle>
          <Badge variant="outline" className="bg-primary/10 text-primary border-primary/20">BANT Analysis</Badge>
        </div>
      </CardHeader>
      <CardContent className="space-y-5 pt-6">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="space-y-2">
            <Label className="text-[10px] uppercase font-bold text-muted-foreground flex items-center gap-1">
              <Wallet className="h-3 w-3" /> Orçamento (Budget)
            </Label>
            <Select onValueChange={(v) => setFormData({...formData, budget: v})}>
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
            <Select onValueChange={(v) => setFormData({...formData, authority: v})}>
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
            <Select onValueChange={(v) => setFormData({...formData, timing: v})}>
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
          />
        </div>

        <div className="flex flex-col sm:flex-row items-center justify-between gap-4 pt-2">
          <div className="flex gap-2 w-full sm:w-auto">
            <Button 
              size="sm" 
              variant={status === 'qualified' ? 'default' : 'outline'}
              className={status === 'qualified' ? 'bg-success hover:bg-success/90 h-9 gap-1.5 flex-1' : 'h-9 gap-1.5 flex-1'}
              onClick={() => setStatus('qualified')}
            >
              <CheckCircle2 className="h-4 w-4" />
              Qualificar
            </Button>
            <Button 
              size="sm" 
              variant={status === 'unqualified' ? 'destructive' : 'outline'}
              className="h-9 gap-1.5 flex-1"
              onClick={() => setStatus('unqualified')}
            >
              <XCircle className="h-4 w-4" />
              Descartar
            </Button>
          </div>
          <Button 
            size="sm" 
            onClick={handleSave} 
            disabled={loading}
            className="h-9 px-8 bg-primary hover:bg-primary/90 w-full sm:w-auto"
          >
            {loading ? "Salvando..." : "Finalizar Análise"}
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}