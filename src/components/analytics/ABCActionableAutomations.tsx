import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Play, Zap, Bot, Calendar, MessageSquare, Mail } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";

interface Automation {
  id: string;
  title: string;
  description: string;
  target: string;
  impact: string;
  type: "retention" | "expansion" | "reactivation";
}

interface ABCActionableAutomationsProps {
  automations: Automation[];
}

export function ABCActionableAutomations({ automations }: ABCActionableAutomationsProps) {
  const runAutomation = (title: string) => {
    toast.promise(new Promise(resolve => setTimeout(resolve, 1500)), {
      loading: `Iniciando automação: ${title}...`,
      success: `Automação executada com sucesso!`,
      error: 'Falha ao executar automação.',
    });
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2 mb-2">
        <Bot className="h-5 w-5 text-primary" />
        <h3 className="text-lg font-display font-bold gradient-text">Actionable Automations</h3>
      </div>
      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
        {automations.map((auto) => (
          <Card key={auto.id} className="glass border-border/40 hover:bg-primary/5 transition-all group border-l-4" style={{ 
            borderLeftColor: auto.type === 'retention' ? 'hsl(var(--status-success))' : 
                            auto.type === 'expansion' ? 'hsl(var(--primary))' : 
                            'hsl(var(--status-warning))'
          }}>
            <CardHeader className="pb-2">
              <div className="flex justify-between items-start">
                <Badge variant="secondary" className="text-[10px] uppercase font-bold tracking-widest mb-2">
                  {auto.type}
                </Badge>
                <div className="flex gap-1 opacity-40">
                  <Mail className="h-3 w-3" />
                  <MessageSquare className="h-3 w-3" />
                  <Calendar className="h-3 w-3" />
                </div>
              </div>
              <CardTitle className="text-sm font-display font-bold group-hover:text-primary transition-colors">
                {auto.title}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-xs text-muted-foreground mb-4 leading-relaxed">
                {auto.description}
              </p>
              <div className="p-2 rounded-lg bg-muted/30 mb-4 border border-border/10">
                <div className="flex justify-between text-[10px] mb-1">
                  <span className="text-muted-foreground">Target Segment</span>
                  <span className="font-bold">{auto.target}</span>
                </div>
                <div className="flex justify-between text-[10px]">
                  <span className="text-muted-foreground">Predicted Impact</span>
                  <span className="font-bold text-status-success">{auto.impact}</span>
                </div>
              </div>
              <Button 
                onClick={() => runAutomation(auto.title)}
                size="sm" 
                className="w-full gap-2 bg-gradient-to-r from-primary to-accent hover:shadow-lg hover:shadow-primary/20 transition-all"
              >
                <Zap className="h-3.5 w-3.5" />
                Executar Agora
              </Button>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
