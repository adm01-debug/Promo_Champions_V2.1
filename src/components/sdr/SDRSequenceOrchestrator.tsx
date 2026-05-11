
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { 
  Mail, 
  Phone, 
  Linkedin, 
  ArrowRight, 
  CheckCircle2, 
  Clock,
  AlertCircle
} from "lucide-react";
import { motion } from "framer-motion";

const sequences = [
  {
    id: 1,
    name: "Enterprise Outbound - Tier 1",
    leads: 24,
    completed: 18,
    status: "active",
    nextStep: "Call (Step 4)",
    urgency: "high"
  },
  {
    id: 2,
    name: "Inbound MQL Follow-up",
    leads: 156,
    completed: 142,
    status: "active",
    nextStep: "Email (Step 2)",
    urgency: "medium"
  },
  {
    id: 3,
    name: "LinkedIn Social Selling",
    leads: 45,
    completed: 12,
    status: "paused",
    nextStep: "Connect (Step 1)",
    urgency: "low"
  }
];

const bestActions = [
  {
    lead: "Empresa XPTO",
    action: "Fazer ligação de acompanhamento",
    type: "call",
    reason: "Abriu e-mail 3 vezes nas últimas 2h"
  },
  {
    lead: "João Silva (TechCorp)",
    action: "Enviar convite LinkedIn",
    type: "linkedin",
    reason: "Lead de alta intenção (Score 92)"
  }
];

export const SDRSequenceOrchestrator = () => {
  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
      <Card className="md:col-span-2 glass border-primary/10 overflow-hidden relative">
        <div className="absolute top-0 right-0 p-4">
          <Badge variant="outline" className="bg-primary/5 text-primary border-primary/20 animate-pulse">
            Live Orchestrator
          </Badge>
        </div>
        <CardHeader>
          <CardTitle className="text-lg font-bold flex items-center gap-2">
            <ArrowRight className="h-5 w-5 text-primary" />
            Sequências Ativas
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          {sequences.map((seq) => (
            <div key={seq.id} className="space-y-2">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className={`p-2 rounded-lg ${
                    seq.status === 'active' ? 'bg-primary/10 text-primary' : 'bg-muted text-muted-foreground'
                  }`}>
                    {seq.name.includes('Email') ? <Mail className="h-4 w-4" /> : 
                     seq.name.includes('LinkedIn') ? <Linkedin className="h-4 w-4" /> : 
                     <Phone className="h-4 w-4" />}
                  </div>
                  <div>
                    <p className="text-sm font-semibold">{seq.name}</p>
                    <p className="text-xs text-muted-foreground">{seq.leads} leads ativos • {seq.nextStep}</p>
                  </div>
                </div>
                <div className="text-right">
                  <Badge variant={seq.urgency === 'high' ? 'destructive' : seq.urgency === 'medium' ? 'default' : 'secondary'} className="text-[10px]">
                    {seq.urgency.toUpperCase()}
                  </Badge>
                </div>
              </div>
              <div className="flex items-center gap-4">
                <Progress value={(seq.completed / seq.leads) * 100} className="h-1.5 flex-1" />
                <span className="text-[10px] font-mono font-medium text-muted-foreground">
                  {Math.round((seq.completed / seq.leads) * 100)}%
                </span>
              </div>
            </div>
          ))}
        </CardContent>
      </Card>

      <Card className="glass border-primary/10 bg-gradient-to-br from-primary/5 to-transparent">
        <CardHeader>
          <CardTitle className="text-sm font-bold flex items-center gap-2">
            <CheckCircle2 className="h-4 w-4 text-green-500" />
            Melhores Próximas Ações
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {bestActions.map((action, i) => (
            <motion.div 
              key={i}
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: i * 0.1 }}
              className="p-3 rounded-xl border border-primary/10 bg-background/50 space-y-2 hover:border-primary/30 transition-colors cursor-pointer group"
            >
              <div className="flex items-center justify-between">
                <p className="text-xs font-bold truncate max-w-[120px]">{action.lead}</p>
                <div className="p-1 rounded bg-primary/10">
                  {action.type === 'call' ? <Phone className="h-3 w-3 text-primary" /> : <Linkedin className="h-3 w-3 text-primary" />}
                </div>
              </div>
              <p className="text-[11px] font-medium leading-tight group-hover:text-primary transition-colors">{action.action}</p>
              <div className="flex items-center gap-1 text-[9px] text-muted-foreground">
                <AlertCircle className="h-2.5 w-2.5 text-amber-500" />
                <span>{action.reason}</span>
              </div>
            </motion.div>
          ))}
          <Button variant="outline" className="w-full text-[10px] h-8 mt-2 border-primary/20 hover:bg-primary/10">
            Ver todas as tarefas
          </Button>
        </CardContent>
      </Card>
    </div>
  );
};
