
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useProspectCadences } from "@/hooks/cadences/useCadenceQueries";
import { Users, Flame, UserCheck, CalendarCheck, ArrowRight } from "lucide-react";
import { motion } from "framer-motion";

const STAGES = [
  { id: "new", label: "Novo", icon: Users, color: "bg-blue-500", textColor: "text-blue-500" },
  { id: "high_interest", label: "Interesse Alto", icon: Flame, color: "bg-orange-500", textColor: "text-orange-500" },
  { id: "waiting_approval", label: "Aguardando Aprovação", icon: UserCheck, color: "bg-purple-500", textColor: "text-purple-500" },
  { id: "scheduled", label: "Agendado", icon: CalendarCheck, color: "bg-green-500", textColor: "text-green-500" },
];

export function CadenceFunnel() {
  const { data: prospects } = useProspectCadences();

  const getStageCount = (stageId: string) => {
    if (!prospects) return 0;
    return prospects.filter(p => p.funnel_stage === stageId).length;
  };

  const total = STAGES.reduce((acc, stage) => acc + getStageCount(stage.id), 0);

  return (
    <Card className="glass border-border/40 overflow-hidden">
      <CardHeader className="pb-2">
        <CardTitle className="text-sm font-medium flex items-center gap-2">
          <Users className="h-4 w-4 text-primary" />
          Funil da Cadência em Tempo Real
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="relative mt-4 flex flex-col md:flex-row items-stretch gap-2 md:gap-4">
          {STAGES.map((stage, index) => {
            const count = getStageCount(stage.id);
            const percentage = total > 0 ? (count / total) * 100 : 0;

            return (
              <div key={stage.id} className="flex-1 flex flex-col items-center group relative">
                <motion.div 
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.1 }}
                  className="w-full"
                >
                  <div className="flex flex-col items-center p-4 rounded-xl glass border border-border/30 hover:border-primary/30 transition-all hover-lift-sm">
                    <div className={`p-2 rounded-lg ${stage.color}/10 mb-3`}>
                      <stage.icon className={`h-5 w-5 ${stage.textColor}`} />
                    </div>
                    <span className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground mb-1">
                      {stage.label}
                    </span>
                    <span className="text-2xl font-bold gradient-text">{count}</span>
                    
                    <div className="w-full h-1 bg-muted/30 rounded-full mt-3 overflow-hidden">
                      <motion.div 
                        initial={{ width: 0 }}
                        animate={{ width: `${percentage}%` }}
                        className={`h-full ${stage.color}`}
                      />
                    </div>
                  </div>
                </motion.div>

                {index < STAGES.length - 1 && (
                  <div className="hidden md:flex absolute -right-3 top-1/2 -translate-y-1/2 z-10 text-muted-foreground/30">
                    <ArrowRight className="h-4 w-4" />
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </CardContent>
    </Card>
  );
}
