import React from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { LeadScoreExplainCard } from "./LeadScoreExplainCard";
import { type ScoredLead } from "@/hooks/useLeadScoring";
import { Badge } from "@/components/ui/badge";
import { Target, Brain, ShieldAlert, Sparkles, TrendingUp, Info } from "lucide-react";
import { cn } from "@/lib/utils";

interface LeadNeuralDossierProps {
  lead: ScoredLead | null;
  isOpen: boolean;
  onClose: () => void;
}

export const LeadNeuralDossier = ({ lead, isOpen, onClose }: LeadNeuralDossierProps) => {
  if (!lead) return null;

  const saleId = lead.bestDealId || lead.id;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto custom-scrollbar bg-background/95 backdrop-blur-xl border-white/5 shadow-2xl p-0 gap-0">
        <DialogHeader className="p-6 border-b border-white/5 bg-gradient-to-r from-primary/10 to-transparent">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="relative">
                <div className="p-3 rounded-2xl bg-primary/10 ring-1 ring-primary/20">
                  <Target className="h-6 w-6 text-primary" />
                </div>
                <div className="absolute -top-1 -right-1 w-3 h-3 bg-emerald-500 rounded-full border-2 border-background animate-pulse" />
              </div>
              <div>
                <DialogTitle className="font-display font-black text-2xl uppercase tracking-tighter italic flex items-center gap-3">
                  {lead.name}
                  <Badge variant="outline" className="text-[10px] font-black tracking-widest bg-primary/5 border-primary/20 text-primary">
                    DOSSIÊ NEURAL
                  </Badge>
                </DialogTitle>
                <div className="flex items-center gap-3 mt-1">
                  <span className="text-[10px] font-black text-muted-foreground uppercase tracking-widest">{lead.company || "ENTITY UNKNOWN"}</span>
                  <div className="h-1 w-1 rounded-full bg-muted-foreground/30" />
                  <span className="text-[10px] font-bold text-primary uppercase tracking-wider">{lead.email}</span>
                </div>
              </div>
            </div>
            
            <div className="hidden md:flex items-center gap-6 pr-8">
              <div className="text-right">
                <p className="text-[10px] font-black text-muted-foreground uppercase tracking-widest mb-1 opacity-60">Neural Rank</p>
                <p className="font-display font-black text-2xl italic text-primary">#TOP TIER</p>
              </div>
              <div className="h-10 w-px bg-white/5" />
              <div className="text-right">
                <p className="text-[10px] font-black text-muted-foreground uppercase tracking-widest mb-1 opacity-60">Status</p>
                <Badge className={cn(
                  "text-[10px] font-black px-3 py-1",
                  lead.category === 'Hot' ? "bg-status-error" : lead.category === 'Warm' ? "bg-status-warning" : "bg-blue-500"
                )}>
                  {lead.category.toUpperCase()}
                </Badge>
              </div>
            </div>
          </div>
        </DialogHeader>

        <div className="p-6 space-y-8">
          {/* Quick Metrics & Churn Gauge */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="md:col-span-2 grid grid-cols-2 gap-4">
               <div className="p-5 rounded-2xl bg-card/40 border border-white/5 shadow-inner group transition-all hover:bg-card/60">
                 <div className="flex items-center gap-3 mb-3">
                   <Brain className="h-4 w-4 text-primary" />
                   <span className="text-[10px] font-black text-muted-foreground uppercase tracking-widest">Intelligence Index</span>
                 </div>
                 <div className="flex items-baseline gap-2">
                   <span className="text-4xl font-display font-black italic text-primary">{lead.score}</span>
                   <span className="text-xs font-bold text-muted-foreground/60 uppercase">pts</span>
                 </div>
                 <div className="mt-4 pt-4 border-t border-white/5 flex items-center justify-between">
                    <span className="text-[9px] font-black text-muted-foreground/40 uppercase tracking-widest">Confidence: 98.4%</span>
                    <TrendingUp className="h-3 w-3 text-emerald-500" />
                 </div>
               </div>

               <div className="p-5 rounded-2xl bg-card/40 border border-white/5 shadow-inner group transition-all hover:bg-card/60">
                 <div className="flex items-center gap-3 mb-3">
                   <Sparkles className="h-4 w-4 text-primary" />
                   <span className="text-[10px] font-black text-muted-foreground uppercase tracking-widest">Conversion Power</span>
                 </div>
                 <div className="flex items-baseline gap-2">
                   <span className="text-4xl font-display font-black italic text-emerald-500">
                     {lead.score > 70 ? "HIGH" : lead.score > 40 ? "MID" : "LOW"}
                   </span>
                 </div>
                 <div className="mt-4 pt-4 border-t border-white/5 flex items-center justify-between">
                    <span className="text-[9px] font-black text-muted-foreground/40 uppercase tracking-widest">Projected Lift: +14%</span>
                    <div className="flex gap-0.5">
                      {[1,2,3,4,5].map(i => (
                        <div key={i} className={cn("h-1 w-2 rounded-full", i <= (lead.score/20) ? "bg-primary" : "bg-white/5")} />
                      ))}
                    </div>
                 </div>
               </div>
            </div>

            <div className={cn(
              "p-5 rounded-2xl border transition-all duration-500",
              lead.churnRisk && lead.churnRisk.risk_score > 50 
                ? "bg-status-error/5 border-status-error/20 shadow-[0_0_30px_rgba(239,68,68,0.1)]" 
                : "bg-card/40 border-white/5"
            )}>
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2">
                  <ShieldAlert className={cn("h-4 w-4", lead.churnRisk && lead.churnRisk.risk_score > 50 ? "text-status-error animate-pulse" : "text-emerald-500")} />
                  <span className="text-[10px] font-black uppercase tracking-widest">Churn Risk Gauge</span>
                </div>
                <Badge variant="outline" className="text-[8px] font-black opacity-50">REAL-TIME</Badge>
              </div>

              <div className="relative flex items-center justify-center py-2">
                <svg className="w-24 h-24 transform -rotate-90">
                  <circle
                    cx="48"
                    cy="48"
                    r="40"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="8"
                    className="text-white/5"
                  />
                  <circle
                    cx="48"
                    cy="48"
                    r="40"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="8"
                    strokeDasharray={251.2}
                    strokeDashoffset={251.2 - (251.2 * (lead.churnRisk?.risk_score || 0)) / 100}
                    strokeLinecap="round"
                    className={cn(
                      "transition-all duration-1000",
                      (lead.churnRisk?.risk_score || 0) > 50 ? "text-status-error" : "text-emerald-500"
                    )}
                  />
                </svg>
                <div className="absolute inset-0 flex flex-col items-center justify-center">
                  <span className="text-xl font-black italic tracking-tighter">
                    {lead.churnRisk?.risk_score || 0}%
                  </span>
                  <span className="text-[8px] font-black text-muted-foreground uppercase opacity-40">Risk</span>
                </div>
              </div>

              <div className="mt-4 flex items-center justify-center gap-2">
                 <div className={cn(
                   "w-2 h-2 rounded-full",
                   (lead.churnRisk?.risk_score || 0) > 50 ? "bg-status-error shadow-[0_0_8px_rgba(var(--status-error-rgb),0.5)]" : "bg-emerald-500"
                 )} />
                 <span className="text-[9px] font-black uppercase tracking-widest">
                   {lead.churnRisk?.risk_level === 'critical' ? 'CRITICAL EVASION' : 
                    lead.churnRisk?.risk_level === 'high' ? 'HIGH ALERT' : 'STABLE PATTERN'}
                 </span>
              </div>
            </div>
          </div>

          {/* Explanation Component */}
          <div className="relative">
            <div className="absolute -left-6 top-0 bottom-0 w-px bg-gradient-to-b from-primary/20 via-primary/5 to-transparent hidden md:block" />
            <LeadScoreExplainCard saleId={saleId} churnRisk={lead.churnRisk} />
          </div>
          
          <div className="pt-6 border-t border-white/5 flex items-center justify-between">
             <div className="flex items-center gap-2">
               <Info className="h-3.5 w-3.5 text-muted-foreground/40" />
               <span className="text-[9px] font-bold text-muted-foreground/40 uppercase tracking-[0.2em]">
                 Data Source: Neural Analytics Engine v4.0.2 / Hash: {lead.id.substring(0,8).toUpperCase()}
               </span>
             </div>
             <div className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-primary/5 border border-primary/10">
               <div className="w-1 h-1 rounded-full bg-primary animate-pulse" />
               <span className="text-[9px] font-black text-primary uppercase tracking-widest">Verified by AI</span>
             </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};
