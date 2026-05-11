import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { CheckCircle2, ClipboardCheck, XCircle } from "lucide-react";
import { toast } from "sonner";

export function MQLQualificationForm() {
  const [status, setStatus] = useState("pending");

  const handleSave = () => {
    toast.success("Qualificação salva com sucesso!");
  };

  return (
    <Card className="glass border-primary/20">
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center gap-2 text-base font-display">
          <ClipboardCheck className="h-5 w-5 text-primary" />
          Qualificação Profunda (MQL)
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label className="text-xs">Orçamento (Budget)</Label>
            <Select>
              <SelectTrigger className="h-9 bg-background/50">
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
            <Label className="text-xs">Autoridade</Label>
            <Select>
              <SelectTrigger className="h-9 bg-background/50">
                <SelectValue placeholder="Selecione..." />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="influencer">Influenciador</SelectItem>
                <SelectItem value="decision_maker">Tomador de Decisão</SelectItem>
                <SelectItem value="gatekeeper">Gatekeeper</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        <div className="space-y-2">
          <Label className="text-xs">Dores Principais (Pain Points)</Label>
          <Textarea 
            placeholder="Descreva as dores identificadas..." 
            className="min-h-[80px] bg-background/50 text-sm"
          />
        </div>

        <div className="flex items-center justify-between pt-2">
          <div className="flex gap-2">
            <Button 
              size="sm" 
              variant={status === 'qualified' ? 'default' : 'outline'}
              className="h-8 gap-1.5"
              onClick={() => setStatus('qualified')}
            >
              <CheckCircle2 className="h-3.5 w-3.5" />
              Qualificar
            </Button>
            <Button 
              size="sm" 
              variant={status === 'unqualified' ? 'destructive' : 'outline'}
              className="h-8 gap-1.5"
              onClick={() => setStatus('unqualified')}
            >
              <XCircle className="h-3.5 w-3.5" />
              Desqualificar
            </Button>
          </div>
          <Button size="sm" onClick={handleSave} className="h-8">Salvar Análise</Button>
        </div>
      </CardContent>
    </Card>
  );
}
