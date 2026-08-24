import { motion } from "framer-motion";
import { Zap, Brain } from "lucide-react";
import { Card } from "@/components/ui/card";

interface Recommendation {
  name: string;
  reason: string;
}

interface EmpiricalRecommendationsProps {
  data: Recommendation[];
}

export function EmpiricalRecommendations({ data }: EmpiricalRecommendationsProps) {
  return (
    <Card className="p-8 border-border/40 bg-card/30 backdrop-blur-xl relative overflow-hidden group rounded-3xl h-full">
      <div className="absolute top-0 right-0 p-6 opacity-5 group-hover:rotate-12 transition-transform">
        <Zap className="size-24 text-primary" />
      </div>
      <h3 className="text-lg font-black uppercase italic tracking-tighter flex items-center gap-2 mb-8">
        <Zap className="size-5 text-primary" /> Sugestão do <span className="text-primary">Especialista</span>
      </h3>
      <div className="space-y-4 relative z-10">
        {data.map((item, i) => (
          <motion.div 
            key={i} 
            initial={{ opacity: 0, x: 20 }} 
            animate={{ opacity: 1, x: 0 }} 
            transition={{ delay: i * 0.1 }} 
            className="group/item flex flex-col gap-2 p-4 bg-white/5 rounded-2xl border border-white/5 hover:border-primary/40 transition-all cursor-pointer"
          >
            <div className="flex items-center gap-3">
              <div className="size-10 bg-primary/20 rounded-xl flex items-center justify-center text-primary group-hover/item:scale-110 transition-transform">
                <Brain className="size-5" />
              </div>
              <p className="text-sm font-black uppercase tracking-tighter">{item.name}</p>
            </div>
            <p className="text-[10px] text-muted-foreground leading-relaxed italic">{item.reason}</p>
          </motion.div>
        ))}
      </div>
    </Card>
  );
}
