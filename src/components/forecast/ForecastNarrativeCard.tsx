import { FC } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { AlertTriangle, Lightbulb, Sparkles, BrainCircuit, ShieldAlert, Zap } from "lucide-react";
import { motion } from "framer-motion";

interface Props {
  narrative: string;
  risks: string[];
  opportunities: string[];
}

export const ForecastNarrativeCard: FC<Props> = ({ narrative, risks, opportunities }) => {
  if (!narrative && !risks.length && !opportunities.length) return null;

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.98 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.5 }}
    >
      <Card className="glass border-primary/20 bg-gradient-to-br from-primary/5 via-transparent to-transparent relative overflow-hidden group">
        <div className="absolute top-0 right-0 p-8 opacity-5 -mr-4 -mt-4 group-hover:rotate-12 transition-transform duration-700">
          <BrainCircuit className="h-24 w-24" />
        </div>
        
        <CardHeader className="pb-4 relative z-10">
          <div className="flex items-center justify-between">
            <CardTitle className="text-sm font-black uppercase tracking-widest flex items-center gap-2.5">
              <div className="p-1.5 rounded-lg bg-primary/20 text-primary">
                <BrainCircuit className="h-4 w-4" />
              </div>
              Análise Preditiva Neural
            </CardTitle>
            <Badge variant="live" className="h-5 px-2 bg-primary/10 text-primary border-primary/20 text-[8px] font-black uppercase tracking-tighter">
              IA Vision v2.4
            </Badge>
          </div>
        </CardHeader>

        <CardContent className="space-y-6 relative z-10">
          {narrative && (
            <div className="relative">
              <div className="absolute -left-3 top-0 bottom-0 w-1 bg-primary/20 rounded-full" />
              <p className="text-sm text-muted-foreground leading-relaxed pl-3 italic font-medium">
                "{narrative}"
              </p>
            </div>
          )}

          <div className="grid gap-6 md:grid-cols-2">
            {risks.length > 0 && (
              <div className="space-y-3 p-4 rounded-xl bg-destructive/5 border border-destructive/10 hover:bg-destructive/10 transition-colors">
                <div className="flex items-center gap-2.5">
                  <div className="p-1.5 rounded-lg bg-destructive/20 text-destructive">
                    <ShieldAlert className="h-4 w-4" />
                  </div>
                  <span className="text-[10px] font-black uppercase tracking-widest text-destructive">Vulnerabilidades</span>
                </div>
                <ul className="space-y-2.5">
                  {risks.map((r, i) => (
                    <motion.li 
                      key={i} 
                      initial={{ opacity: 0, x: -10 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: i * 0.1 }}
                      className="text-xs text-muted-foreground flex gap-3 group/item"
                    >
                      <span className="text-destructive font-black mt-0.5 group-hover/item:scale-150 transition-transform">•</span>
                      <span className="leading-tight group-hover/item:text-foreground transition-colors">{r}</span>
                    </motion.li>
                  ))}
                </ul>
              </div>
            )}

            {opportunities.length > 0 && (
              <div className="space-y-3 p-4 rounded-xl bg-emerald-500/5 border border-emerald-500/10 hover:bg-emerald-500/10 transition-colors">
                <div className="flex items-center gap-2.5">
                  <div className="p-1.5 rounded-lg bg-emerald-500/20 text-emerald-500">
                    <Zap className="h-4 w-4" />
                  </div>
                  <span className="text-[10px] font-black uppercase tracking-widest text-emerald-500">Pontos de Alavancagem</span>
                </div>
                <ul className="space-y-2.5">
                  {opportunities.map((o, i) => (
                    <motion.li 
                      key={i} 
                      initial={{ opacity: 0, x: 10 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: i * 0.1 }}
                      className="text-xs text-muted-foreground flex gap-3 group/item"
                    >
                      <span className="text-emerald-500 font-black mt-0.5 group-hover/item:scale-150 transition-transform">★</span>
                      <span className="leading-tight group-hover/item:text-foreground transition-colors">{o}</span>
                    </motion.li>
                  ))}
                </ul>
              </div>
            )}
          </div>
          
          <div className="pt-4 border-t border-white/5 flex items-center justify-between opacity-50">
            <span className="text-[8px] font-bold uppercase tracking-widest">Processado em tempo real via Neural Link</span>
            <div className="flex gap-1">
              <div className="w-1 h-1 rounded-full bg-primary animate-ping" />
              <div className="w-1 h-1 rounded-full bg-primary animate-ping delay-75" />
              <div className="w-1 h-1 rounded-full bg-primary animate-ping delay-150" />
            </div>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
};
