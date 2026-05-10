import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Sparkles, ArrowRight, TrendingUp, AlertCircle, Clock } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { motion } from "framer-motion";

const recommendations = [
  {
    id: 1,
    lead: "Acme Corp",
    reason: "Engajamento alto (3 aberturas de email)",
    priority: "high",
    action: "Ligar agora",
    score: 92
  },
  {
    id: 2,
    lead: "TechFlow Solutions",
    reason: "Lead qualificado sem contato há 48h",
    priority: "medium",
    action: "Enviar WhatsApp",
    score: 78
  },
  {
    id: 3,
    lead: "Global Logistics",
    reason: "Visita repetida à página de preços",
    priority: "high",
    action: "Enviar Case de Sucesso",
    score: 85
  }
];

export function SDRIntelligenceHighlights() {
  return (
    <Card className="border-primary/20 bg-primary/5 overflow-hidden relative">
      <div className="absolute top-0 right-0 p-4 opacity-10 pointer-events-none">
        <Sparkles className="h-24 w-24 text-primary" />
      </div>
      
      <CardHeader className="pb-2">
        <div className="flex items-center justify-between">
          <CardTitle className="text-base font-bold flex items-center gap-2">
            <Sparkles className="h-4 w-4 text-primary animate-pulse" />
            Insights de Inteligência
          </CardTitle>
          <Badge variant="outline" className="text-[10px] uppercase tracking-tighter border-primary/30 text-primary">
            AI Powered
          </Badge>
        </div>
      </CardHeader>
      
      <CardContent className="space-y-4">
        {recommendations.map((rec, index) => (
          <motion.div
            key={rec.id}
            initial={{ opacity: 0, x: -10 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: index * 0.1 }}
            className="group relative p-3 rounded-lg bg-background/50 border border-border/50 hover:border-primary/30 transition-all cursor-pointer"
          >
            <div className="flex items-start justify-between gap-3">
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <span className="font-semibold text-sm">{rec.lead}</span>
                  <Badge className={`text-[10px] h-4 px-1 ${
                    rec.priority === 'high' ? 'bg-red-500/10 text-red-500 border-red-500/20' : 'bg-orange-500/10 text-orange-500 border-orange-500/20'
                  }`}>
                    Score {rec.score}
                  </Badge>
                </div>
                <p className="text-xs text-muted-foreground flex items-center gap-1.5">
                  <AlertCircle className="h-3 w-3" />
                  {rec.reason}
                </p>
              </div>
              <Button size="icon" variant="ghost" className="h-8 w-8 rounded-full group-hover:bg-primary group-hover:text-primary-foreground">
                <ArrowRight className="h-4 w-4" />
              </Button>
            </div>
            
            <div className="mt-2 flex items-center gap-3">
              <span className="text-[10px] font-medium text-primary uppercase tracking-wider bg-primary/10 px-1.5 py-0.5 rounded">
                Ação Sugerida: {rec.action}
              </span>
              <div className="flex items-center gap-1 text-[10px] text-muted-foreground ml-auto">
                <Clock className="h-3 w-3" />
                Agir agora
              </div>
            </div>
          </motion.div>
        ))}

        <div className="pt-2">
          <Button variant="ghost" size="sm" className="w-full text-xs text-primary hover:bg-primary/5 gap-2">
            Ver todas recomendações
            <TrendingUp className="h-3 w-3" />
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
