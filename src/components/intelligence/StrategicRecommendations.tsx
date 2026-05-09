import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Zap, ArrowRight, Shield, Target, Users } from "lucide-react";

const recommendations = [
  {
    id: 1,
    title: "Blindagem Acme Corp",
    impact: "+R$ 1.2M",
    risk: "Medium",
    desc: "Agendar QBR com stakeholders nível C para mitigar risco de churn.",
    icon: Shield,
    color: "text-blue-500",
    bg: "bg-blue-500/10"
  },
  {
    id: 2,
    title: "Expansão Global Tech",
    impact: "+R$ 450k",
    risk: "Low",
    desc: "Apresentar nova feature de Multi-Region para o CTO.",
    icon: Target,
    color: "text-emerald-500",
    bg: "bg-emerald-500/10"
  },
  {
    id: 3,
    title: "Recuperação SDR João",
    impact: "+15% Win Rate",
    risk: "High",
    desc: "Coaching específico em objeções de preço baseado em 12 calls.",
    icon: Users,
    color: "text-purple-500",
    bg: "bg-purple-500/10"
  }
];

export const StrategicRecommendations = () => {
  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-[10px] font-black uppercase tracking-[0.2em] text-primary flex items-center gap-2">
          <Zap className="size-3" /> One-Click Strategy Recommendations
        </h3>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {recommendations.map((rec, i) => (
          <motion.div 
            key={rec.id}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.1 }}
            className="p-4 rounded-2xl bg-white/5 border border-white/10 hover:border-primary/50 transition-all group cursor-pointer relative overflow-hidden"
          >
            <div className={`absolute top-0 right-0 p-4 opacity-5 group-hover:opacity-10 transition-opacity`}>
              <rec.icon className="size-12" />
            </div>
            
            <div className="flex justify-between items-start mb-3">
              <Badge className={`${rec.bg} ${rec.color} border-none text-[8px] font-black uppercase tracking-widest`}>
                Impact: {rec.impact}
              </Badge>
            </div>
            
            <h4 className="text-sm font-black uppercase italic tracking-tighter mb-1">{rec.title}</h4>
            <p className="text-[11px] text-muted-foreground leading-snug mb-4">{rec.desc}</p>
            
            <Button size="sm" className="w-full h-8 text-[9px] font-black uppercase tracking-widest gap-2 bg-primary/10 text-primary hover:bg-primary group/btn">
              Execute Action <ArrowRight className="size-3 group-hover/btn:translate-x-1 transition-transform" />
            </Button>
          </motion.div>
        ))}
      </div>
    </div>
  );
};