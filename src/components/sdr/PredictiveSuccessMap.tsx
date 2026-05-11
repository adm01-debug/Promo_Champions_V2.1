import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Brain, Clock, Zap, TrendingUp, Calendar } from "lucide-react";
import { motion } from "framer-motion";

const hourlySuccessData = [
  { hour: "08:00", probability: 45, status: "low" },
  { hour: "09:00", probability: 78, status: "high" },
  { hour: "10:00", probability: 85, status: "high" },
  { hour: "11:00", probability: 62, status: "medium" },
  { hour: "12:00", probability: 30, status: "low" },
  { hour: "14:00", probability: 92, status: "critical" },
  { hour: "15:00", probability: 88, status: "high" },
  { hour: "16:00", probability: 75, status: "high" },
  { hour: "17:00", probability: 55, status: "medium" },
];

export function PredictiveSuccessMap() {
  return (
    <Card className="glass border-primary/20 overflow-hidden">
      <CardHeader className="pb-2 border-b border-border/50">
        <div className="flex items-center justify-between">
          <CardTitle className="text-sm font-bold flex items-center gap-2">
            <Brain className="h-4 w-4 text-primary" />
            Mapa Preditivo de Sucesso
          </CardTitle>
          <Badge variant="outline" className="text-[10px] bg-primary/5 text-primary border-primary/20">
            Tempo Real
          </Badge>
        </div>
      </CardHeader>
      <CardContent className="pt-4 space-y-6">
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Clock className="h-4 w-4 text-muted-foreground" />
              <span className="text-xs font-medium">Melhores horários para hoje</span>
            </div>
            <span className="text-[10px] text-muted-foreground italic">Baseado em 2.4k interações</span>
          </div>

          <div className="grid grid-cols-3 sm:grid-cols-9 gap-2">
            {hourlySuccessData.map((data, index) => (
              <motion.div
                key={data.hour}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.05 }}
                className="flex flex-col items-center gap-1.5"
              >
                <div 
                  className={`w-full h-12 rounded-md flex items-center justify-center relative overflow-hidden group cursor-help transition-all duration-300 ${
                    data.status === 'critical' ? 'bg-primary/30 border border-primary/50' :
                    data.status === 'high' ? 'bg-success/20 border border-success/30' :
                    data.status === 'medium' ? 'bg-warning/20 border border-warning/30' :
                    'bg-muted/30 border border-border/50'
                  }`}
                >
                  <span className={`text-[10px] font-bold ${
                    data.status === 'critical' ? 'text-primary' :
                    data.status === 'high' ? 'text-success-foreground' :
                    data.status === 'medium' ? 'text-warning-foreground' :
                    'text-muted-foreground'
                  }`}>
                    {data.probability}%
                  </span>
                  
                  {data.status === 'critical' && (
                    <motion.div 
                      className="absolute inset-0 bg-primary/20"
                      animate={{ opacity: [0.2, 0.5, 0.2] }}
                      transition={{ duration: 2, repeat: Infinity }}
                    />
                  )}
                </div>
                <span className="text-[9px] text-muted-foreground font-mono">{data.hour}</span>
              </motion.div>
            ))}
          </div>
        </div>

        <div className="p-4 rounded-xl bg-gradient-to-br from-primary/10 to-transparent border border-primary/10 space-y-3">
          <div className="flex items-center gap-2">
            <Zap className="h-4 w-4 text-primary" />
            <span className="text-xs font-bold uppercase tracking-wider text-primary">Insight de Ouro</span>
          </div>
          <p className="text-xs leading-relaxed text-foreground/80">
            Leads do setor <span className="font-bold text-primary">Tecnologia</span> têm 3.4x mais chance de converter entre <span className="font-bold">14:00 e 15:30</span>. Priorize sua fila do Power Dialer para este bloco.
          </p>
          <div className="flex items-center gap-4 pt-1">
            <div className="flex items-center gap-1">
              <TrendingUp className="h-3 w-3 text-success" />
              <span className="text-[10px] text-success font-medium">+24% conversão esperada</span>
            </div>
            <div className="flex items-center gap-1">
              <Calendar className="h-3 w-3 text-primary" />
              <span className="text-[10px] text-primary font-medium">Agendar Bloco</span>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
