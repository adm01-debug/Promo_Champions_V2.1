import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Slider } from "@/components/ui/slider";
import { Calculator, TrendingUp, DollarSign, Target } from "lucide-react";
import { motion } from "framer-motion";

export function TargetSimulator() {
  const [activityIncrease, setActivityIncrease] = useState(10);
  
  const currentLeads = 450;
  const currentConv = 12; // 12%
  const avgCommissionPerMeeting = 150;

  const projectedMeetings = Math.round((currentLeads * (1 + activityIncrease / 100)) * (currentConv / 100));
  const currentMeetings = Math.round(currentLeads * (currentConv / 100));
  const extraMeetings = projectedMeetings - currentMeetings;
  const extraCommission = extraMeetings * avgCommissionPerMeeting;

  return (
    <Card className="glass border-primary/20 overflow-hidden">
      <CardHeader className="pb-3 border-b border-border/50 bg-primary/5">
        <div className="flex items-center justify-between">
          <CardTitle className="text-sm font-bold flex items-center gap-2">
            <Calculator className="h-4 w-4 text-primary" />
            Simulador de Metas Premium
          </CardTitle>
          <Badge variant="outline" className="text-[10px] bg-primary/10 text-primary border-primary/30">
            PROJETADO
          </Badge>
        </div>
      </CardHeader>
      <CardContent className="pt-6 space-y-6">
        <div className="space-y-4">
          <div className="flex justify-between items-center">
            <label className="text-xs font-medium text-muted-foreground flex items-center gap-2">
              <TrendingUp className="h-3.5 w-3.5" />
              Aumento de Atividade (%)
            </label>
            <span className="text-sm font-bold text-primary">+{activityIncrease}%</span>
          </div>
          <Slider 
            value={[activityIncrease]} 
            onValueChange={(val) => setActivityIncrease(val[0])}
            max={100}
            step={5}
            className="py-4"
          />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div className="p-4 rounded-xl bg-background/50 border border-border/50 text-center space-y-1">
            <div className="flex justify-center mb-1">
              <Target className="h-4 w-4 text-primary" />
            </div>
            <p className="text-[10px] uppercase tracking-tighter text-muted-foreground font-bold">Novas Reuniões</p>
            <p className="text-xl font-bold text-foreground">{projectedMeetings}</p>
            <p className="text-[10px] text-success font-medium">+{extraMeetings} vs atual</p>
          </div>

          <div className="p-4 rounded-xl bg-primary/10 border border-primary/20 text-center space-y-1">
            <div className="flex justify-center mb-1">
              <DollarSign className="h-4 w-4 text-primary" />
            </div>
            <p className="text-[10px] uppercase tracking-tighter text-primary font-bold">Comissão Extra</p>
            <p className="text-xl font-bold text-primary">R$ {extraCommission.toLocaleString()}</p>
            <p className="text-[10px] text-primary/70 font-medium">Bônus estimado</p>
          </div>
        </div>

        <div className="p-3 rounded-lg bg-success/10 border border-success/20">
          <p className="text-[10px] text-success-foreground text-center font-medium">
            "Com +{activityIncrease}% de esforço, você atinge o próximo acelerador de 1.5x!"
          </p>
        </div>
      </CardContent>
    </Card>
  );
}
