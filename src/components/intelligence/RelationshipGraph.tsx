import { motion } from "framer-motion";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Share2, Users, Briefcase, Zap, Globe, Shield } from "lucide-react";

const nodes = [
  { id: 1, x: 50, y: 50, icon: Shield, label: "HQ Security", color: "text-blue-500", bg: "bg-blue-500/10" },
  { id: 2, x: 150, y: 20, icon: Users, label: "Acme Corp", color: "text-emerald-500", bg: "bg-emerald-500/10" },
  { id: 3, x: 250, y: 80, icon: Briefcase, label: "Global Tech", color: "text-purple-500", bg: "bg-purple-500/10" },
  { id: 4, x: 120, y: 120, icon: Zap, label: "NexGen Deal", color: "text-amber-500", bg: "bg-amber-500/10" },
  { id: 5, x: 200, y: 150, icon: Globe, label: "Cloud Infra", color: "text-primary", bg: "bg-primary/10" },
];

const connections = [
  { from: 1, to: 2 },
  { from: 2, to: 4 },
  { from: 3, to: 4 },
  { from: 4, to: 5 },
  { from: 1, to: 5 },
];

export const RelationshipGraph = () => {
  return (
    <Card className="border-border/40 bg-card/50 backdrop-blur-sm relative overflow-hidden h-full">
      <CardHeader className="pb-2">
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="text-sm font-black uppercase tracking-widest flex items-center gap-2">
              <Share2 className="size-4 text-primary" />
              Insight <span className="text-primary">Relationship Graph</span>
            </CardTitle>
            <CardDescription className="text-[10px] uppercase font-bold opacity-60">Visualizando Conexões Estratégicas</CardDescription>
          </div>
        </div>
      </CardHeader>
      <CardContent className="h-[300px] relative p-0 overflow-hidden">
        <svg className="absolute inset-0 w-full h-full pointer-events-none opacity-20">
          {connections.map((conn, i) => {
            const from = nodes.find(n => n.id === conn.from)!;
            const to = nodes.find(n => n.id === conn.to)!;
            return (
              <motion.line
                key={i}
                x1={`${(from.x / 300) * 100}%`}
                y1={`${(from.y / 180) * 100}%`}
                x2={`${(to.x / 300) * 100}%`}
                y2={`${(to.y / 180) * 100}%`}
                stroke="currentColor"
                strokeWidth="1"
                initial={{ pathLength: 0 }}
                animate={{ pathLength: 1 }}
                transition={{ duration: 2, repeat: Infinity, repeatType: "reverse" }}
              />
            );
          })}
        </svg>

        {nodes.map((node) => (
          <motion.div
            key={node.id}
            className={`absolute p-2 rounded-xl border border-white/5 backdrop-blur-md shadow-xl flex items-center gap-2 cursor-pointer z-10 ${node.bg}`}
            style={{ 
              left: `${(node.x / 300) * 100}%`, 
              top: `${(node.y / 180) * 100}%`,
              transform: 'translate(-50%, -50%)' 
            }}
            whileHover={{ scale: 1.1, zIndex: 20 }}
          >
            <node.icon className={`size-3 ${node.color}`} />
            <span className="text-[9px] font-black uppercase tracking-tighter whitespace-nowrap">{node.label}</span>
          </motion.div>
        ))}

        <div className="absolute bottom-4 left-4 right-4 p-3 rounded-lg bg-black/60 border border-white/5 backdrop-blur-md">
          <p className="text-[9px] font-medium text-muted-foreground leading-snug">
            <span className="text-primary font-black uppercase">AI Discovery:</span> "Global Tech" e "Acme Corp" compartilham o mesmo stakeholder técnico. Risco de cross-deal detectado.
          </p>
        </div>
      </CardContent>
    </Card>
  );
};