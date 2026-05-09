import { motion, AnimatePresence } from "framer-motion";
import { useDealStakeholders, type DealStakeholder } from "@/hooks/deal-intelligence/useDealStakeholders";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Users, Heart, Star, Shield, Zap, TrendingUp, TrendingDown, Eye, AlertCircle, Search } from "lucide-react";
import { cn } from "@/lib/utils";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { useState } from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

interface Props {
  saleId: string | null | undefined;
}

export function RelationshipHealthGraph({ saleId }: Props) {
  const { data: stakeholders, isLoading } = useDealStakeholders(saleId);
  const [selectedStakeholder, setSelectedStakeholder] = useState<DealStakeholder | null>(null);

  if (isLoading) {
    return (
      <Card className="glass border-border/40 overflow-hidden">
        <CardHeader><Skeleton className="h-6 w-48" /></CardHeader>
        <CardContent><Skeleton className="h-[300px] w-full" /></CardContent>
      </Card>
    );
  }

  if (!stakeholders || stakeholders.length === 0) {
    return (
      <Card className="glass border-border/40">
        <CardHeader>
          <CardTitle className="text-sm font-semibold flex items-center gap-2">
            <Users className="h-4 w-4 text-primary" />
            Grafo de Relacionamento
          </CardTitle>
        </CardHeader>
        <CardContent className="h-[300px] flex flex-col items-center justify-center text-center space-y-4">
          <div className="p-4 rounded-full bg-muted/20 border border-dashed border-border/50">
            <Users className="h-10 w-10 text-muted-foreground opacity-20" />
          </div>
          <p className="text-sm text-muted-foreground max-w-xs">
            Adicione stakeholders ao comitê de compra para visualizar o mapa de influência e saúde.
          </p>
        </CardContent>
      </Card>
    );
  }

  // Calculate layout positions (simple circle for now)
  const centerX = 200;
  const centerY = 150;
  const radius = 100;

  return (
    <Card className="glass border-border/40 overflow-hidden card-elevated">
      <CardHeader className="pb-2">
        <div className="flex justify-between items-center">
          <CardTitle className="text-sm font-semibold flex items-center gap-2">
            <Shield className="h-4 w-4 text-primary" />
            Mapa de Influência & Saúde
          </CardTitle>
          <div className="flex items-center gap-4 text-[10px] text-muted-foreground uppercase tracking-widest">
            <div className="flex items-center gap-1"><div className="w-2 h-2 rounded-full bg-emerald-500" /> Positivo</div>
            <div className="flex items-center gap-1"><div className="w-2 h-2 rounded-full bg-amber-500" /> Neutro</div>
            <div className="flex items-center gap-1"><div className="w-2 h-2 rounded-full bg-destructive" /> Detrator</div>
          </div>
        </div>
      </CardHeader>
      <CardContent className="relative h-[350px] bg-gradient-to-b from-transparent to-primary/5 rounded-b-xl overflow-hidden">
        {/* Background Grid Lines */}
        <div className="absolute inset-0 opacity-[0.03] pointer-events-none" 
             style={{ backgroundImage: 'radial-gradient(circle at 1px 1px, currentColor 1px, transparent 0)', backgroundSize: '24px 24px' }} />
        
        <svg className="absolute inset-0 w-full h-full">
          {/* Central Node (The Deal) */}
          <motion.circle
            cx={centerX}
            cy={centerY}
            r={15}
            fill="currentColor"
            className="text-primary/20"
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
          />
          <Zap className="absolute h-5 w-5 text-primary opacity-50" style={{ left: centerX - 10, top: centerY - 10 }} />

          {/* Lines to Stakeholders */}
          {stakeholders.map((s, i) => {
            const angle = (i / stakeholders.length) * 2 * Math.PI;
            const x = centerX + radius * Math.cos(angle);
            const y = centerY + radius * Math.sin(angle);
            
            return (
              <motion.line
                key={`line-${s.id}`}
                x1={centerX}
                y1={centerY}
                x2={x}
                y2={y}
                stroke="currentColor"
                strokeWidth={s.influence_level === 'high' ? 2 : 1}
                className={cn(
                  "opacity-20",
                  s.sentiment === 'positive' ? "text-emerald-500" : 
                  s.sentiment === 'negative' ? "text-destructive" : "text-amber-500"
                )}
                initial={{ pathLength: 0 }}
                animate={{ pathLength: 1 }}
                transition={{ delay: 0.2 + i * 0.1 }}
              />
            );
          })}
        </svg>

        {/* Stakeholder Nodes */}
        <TooltipProvider>
          {stakeholders.map((s, i) => {
            const angle = (i / stakeholders.length) * 2 * Math.PI;
            const x = centerX + radius * Math.cos(angle);
            const y = centerY + radius * Math.sin(angle);
            
            return (
              <div 
                key={s.id}
                className="absolute transform -translate-x-1/2 -translate-y-1/2"
                style={{ left: x, top: y }}
              >
                <Tooltip>
                  <TooltipTrigger asChild>
                    <motion.div
                      initial={{ scale: 0, opacity: 0 }}
                      animate={{ scale: 1, opacity: 1 }}
                      transition={{ type: "spring", stiffness: 260, damping: 20, delay: i * 0.1 }}
                      className={cn(
                        "relative p-2 rounded-full border-2 bg-card cursor-pointer shadow-lg transition-all",
                        selectedStakeholder?.id === s.id ? "scale-125 z-50 ring-2 ring-primary ring-offset-2 ring-offset-background" : "hover:scale-110",
                        s.sentiment === 'positive' ? "border-emerald-500/50 shadow-emerald-500/10" : 
                        s.sentiment === 'negative' ? "border-destructive/50 shadow-destructive/10" : "border-amber-500/50 shadow-amber-500/10"
                      )}
                      onClick={() => setSelectedStakeholder(selectedStakeholder?.id === s.id ? null : s)}
                    >
                      <StakeholderIcon role={s.dmu_role} className="h-5 w-5" />
                      
                      {/* Sentiment Indicator Dot */}
                      <span className={cn(
                        "absolute -top-1 -right-1 h-3 w-3 rounded-full border border-card shadow-sm",
                        s.sentiment === 'positive' ? "bg-emerald-500" : 
                        s.sentiment === 'negative' ? "bg-destructive" : "bg-amber-500"
                      )} />

                      {/* Influence Label */}
                      <div className="absolute top-full mt-2 left-1/2 transform -translate-x-1/2 whitespace-nowrap">
                        <p className="text-[10px] font-bold text-foreground leading-none">{s.name.split(' ')[0]}</p>
                        <p className="text-[8px] text-muted-foreground leading-none mt-1 uppercase tracking-tighter">{s.dmu_role}</p>
                      </div>
                    </motion.div>
                  </TooltipTrigger>
                  <TooltipContent side="top" className="p-3 max-w-[200px] glass">
                    <div className="space-y-1.5">
                      <p className="text-xs font-bold">{s.name}</p>
                      <p className="text-[10px] text-muted-foreground uppercase">{s.role_title || s.dmu_role}</p>
                      <div className="flex items-center gap-2 pt-1">
                        <div className="flex-1 h-1 bg-secondary rounded-full overflow-hidden">
                          <div className="h-full bg-primary" style={{ width: `${s.engagement_score}%` }} />
                        </div>
                        <span className="text-[10px] font-bold">{s.engagement_score}% Engajado</span>
                      </div>
                      {s.notes && <p className="text-[10px] italic text-muted-foreground line-clamp-2 mt-1">"{s.notes}"</p>}
                    </div>
                  </TooltipContent>
                </Tooltip>
              </div>
            );
          })}
        </TooltipProvider>

        {/* Stakeholder Details Overlay */}
        <AnimatePresence>
          {selectedStakeholder && (
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 20 }}
              className="absolute right-4 top-4 bottom-4 w-64 glass p-4 rounded-xl border border-white/10 z-50 overflow-y-auto space-y-4 shadow-2xl"
            >
              <div className="flex justify-between items-start">
                <div>
                  <h4 className="font-black uppercase italic tracking-tighter text-sm">{selectedStakeholder.name}</h4>
                  <p className="text-[10px] text-muted-foreground uppercase font-bold">{selectedStakeholder.role_title || selectedStakeholder.dmu_role}</p>
                </div>
                <Button 
                  variant="ghost" 
                  size="icon" 
                  className="size-6 h-auto" 
                  onClick={() => setSelectedStakeholder(null)}
                >
                  <Users className="size-3" />
                </Button>
              </div>

              <div className="space-y-3">
                <div className="p-3 rounded-lg bg-black/40 border border-white/5">
                  <p className="text-[9px] font-black uppercase tracking-widest text-primary mb-2 flex items-center gap-1">
                    <AlertCircle className="size-3" /> Blind Spot Analysis
                  </p>
                  <p className="text-[11px] text-muted-foreground leading-relaxed">
                    Nenhuma interação direta via email nos últimos 12 dias. Risco de desalinhamento com {selectedStakeholder.name.split(' ')[0]}.
                  </p>
                </div>

                <div className="space-y-2">
                  <div className="flex justify-between items-center text-[10px] font-black uppercase">
                    <span className="text-muted-foreground">Engajamento</span>
                    <span>{selectedStakeholder.engagement_score}%</span>
                  </div>
                  <div className="h-1 w-full bg-white/5 rounded-full overflow-hidden">
                    <div 
                      className="h-full bg-primary" 
                      style={{ width: `${selectedStakeholder.engagement_score}%` }} 
                    />
                  </div>
                </div>

                <Button size="sm" className="w-full h-8 text-[10px] font-bold uppercase tracking-widest gap-2 bg-primary">
                  <Search className="size-3" /> Ver Timeline
                </Button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Legend/Summary Overlay */}
        <div className="absolute bottom-4 left-4 right-4 grid grid-cols-2 gap-4">
          <div className="p-2 rounded-lg bg-card/50 border border-border/20 backdrop-blur-md flex items-center gap-3">
            <div className="p-1.5 rounded-full bg-emerald-500/10 text-emerald-500">
              <TrendingUp className="h-3.5 w-3.5" />
            </div>
            <div>
              <p className="text-[10px] text-muted-foreground leading-none">Champion Ativo</p>
              <p className="text-xs font-bold">Influência Crítica</p>
            </div>
          </div>
          <div className="p-2 rounded-lg bg-card/50 border border-border/20 backdrop-blur-md flex items-center gap-3">
            <div className="p-1.5 rounded-full bg-destructive/10 text-destructive">
              <TrendingDown className="h-3.5 w-3.5" />
            </div>
            <div>
              <p className="text-[10px] text-muted-foreground leading-none">Risco de Perda</p>
              <p className="text-xs font-bold">Detrator na DMU</p>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

function StakeholderIcon({ role, className }: { role: string, className?: string }) {
  if (role.includes('champion')) return <Star className={className} />;
  if (role.includes('economic')) return <Zap className={className} />;
  if (role.includes('technical')) return < Shield className={className} />;
  return <Heart className={className} />;
}
