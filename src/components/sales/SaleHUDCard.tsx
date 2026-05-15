import { useState, memo } from "react";
import { ShoppingCart, History, BrainCircuit, MessageCircle, Mail } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { ActivityLogForm } from "@/components/activities/ActivityLogForm";
import { AIEmailDialog } from "@/components/sales/AIEmailDialog";
import { WhatsAppDialog } from "@/components/sales/WhatsAppDialog";

const statusColors: Record<string, string> = {
  completed: "bg-status-success/20 text-status-success border-status-success/30",
  pending: "bg-warning/20 text-warning border-warning/30",
  lost: "bg-destructive/20 text-destructive border-destructive/30",
  qualified: "bg-primary/20 text-primary border-primary/30",
  proposal: "bg-secondary/20 text-secondary border-secondary/30",
  negotiation: "bg-accent/20 text-accent border-accent/30",
};

export const SaleHUDCard = memo(({ sale, index }: { sale: any; index: number }) => {
  const [showLog, setShowLog] = useState(false);
  const [showAIInsights, setShowAIInsights] = useState(false);
  const [showAIEmail, setShowAIEmail] = useState(false);
  const [showWhatsApp, setShowWhatsApp] = useState(false);

  const getPredictionColor = (score: number) => {
    if (score >= 80) return "text-emerald-500";
    if (score >= 50) return "text-amber-500";
    return "text-rose-500";
  };

  return (
    <div 
      className="group relative overflow-hidden bg-gradient-to-r from-card/80 to-card/40 border border-border/20 shadow-xl backdrop-blur-md rounded-2xl p-5 transition-all duration-300 hover:scale-[1.01] hover:border-primary/30"
      style={{ animationDelay: `${200 + index * 30}ms` }}
    >
      <div className="absolute top-0 left-0 w-1 h-full bg-primary/40 group-hover:bg-primary transition-colors" />
      
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
        <div className="flex items-center gap-4 min-w-[300px]">
          <div className="flex flex-col">
            <span className="text-[10px] font-black text-primary font-mono tracking-widest uppercase">ID: {sale.id}</span>
            <h3 className="font-display font-black text-lg uppercase tracking-tighter truncate group-hover:text-primary transition-colors">
              {sale.cliente}
            </h3>
          </div>
        </div>

        <div className="flex-1">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-xl bg-accent/20 border border-white/5">
              <ShoppingCart className="h-4 w-4 text-muted-foreground/70" />
            </div>
            <div>
              <p className="text-[10px] font-black text-muted-foreground/50 uppercase tracking-widest">Produto / SKU</p>
              <p className="text-sm font-bold truncate">
                {sale.produto} <span className="text-[10px] font-mono text-muted-foreground ml-2 opacity-60">[{sale.sku || "NO-SKU"}]</span>
              </p>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-8 min-w-[250px]">
          <div className="flex flex-col items-end">
            <span className="text-[10px] font-black text-muted-foreground/50 uppercase tracking-widest mb-1">Status</span>
            <Badge variant="outline" className={cn("px-3 py-1 text-[10px] font-black uppercase tracking-widest", statusColors[sale.status] || statusColors.pending)}>
              {sale.statusLabel || sale.status}
            </Badge>
          </div>
          <div className="flex flex-col items-end min-w-[100px]">
            <span className="text-[10px] font-black text-muted-foreground/50 uppercase tracking-widest mb-1">Criado em</span>
            <span className="text-sm font-bold text-muted-foreground">{sale.data}</span>
          </div>
        </div>

        <div className="flex items-center justify-end min-w-[180px] gap-4">
          <div className="flex flex-col items-end">
            <span className="text-[10px] font-black text-muted-foreground/50 uppercase tracking-widest mb-1">Volume Bruto</span>
            <span className="text-2xl font-display font-black tracking-tighter text-primary">
              R$ {sale.valor.toLocaleString("pt-BR", { minimumFractionDigits: 2 })}
            </span>
          </div>
          <div className="flex gap-2">
            <Button
              variant="ghost"
              size="icon"
              className="h-10 w-10 rounded-xl bg-blue-500/10 border border-blue-500/20 hover:bg-blue-500/20 group-hover:scale-110 transition-all"
              onClick={() => setShowAIEmail(true)}
              title="Hyper-Personalização Email"
            >
              <Mail className="h-4 w-4 text-blue-500" />
            </Button>
            <Button
              variant="ghost"
              size="icon"
              className="h-10 w-10 rounded-xl bg-emerald-500/10 border border-emerald-500/20 hover:bg-emerald-500/20 group-hover:scale-110 transition-all"
              onClick={() => setShowWhatsApp(true)}
              title="Integrar WhatsApp"
            >
              <MessageCircle className="h-4 w-4 text-emerald-500" />
            </Button>
            <Button
              variant="ghost"
              size="icon"
              className="h-10 w-10 rounded-xl bg-purple-500/10 border border-purple-500/20 hover:bg-purple-500/20 group-hover:scale-110 transition-all"
              onClick={() => setShowAIInsights(true)}
              title="Predição de IA"
            >
              <BrainCircuit className="h-4 w-4 text-purple-500" />
            </Button>
            <Button
              variant="ghost"
              size="icon"
              className="h-10 w-10 rounded-xl bg-primary/10 border border-primary/20 hover:bg-primary/20 group-hover:scale-110 transition-all"
              onClick={() => setShowLog(true)}
              title="Registrar Atividade"
            >
              <History className="h-4 w-4 text-primary" />
            </Button>
          </div>
        </div>
      </div>

      <Dialog open={showLog} onOpenChange={setShowLog}>
        <DialogContent className="max-w-md bg-background/95 backdrop-blur-xl border-primary/20 rounded-3xl">
          <DialogHeader>
            <DialogTitle className="text-xl font-black uppercase tracking-tighter italic">Registrar Atividade Tática</DialogTitle>
          </DialogHeader>
          <ActivityLogForm 
            saleId={sale.fullId} 
            clientId={sale.client_id}
            onSuccess={() => setShowLog(false)} 
          />
        </DialogContent>
      </Dialog>

      <Dialog open={showAIInsights} onOpenChange={setShowAIInsights}>
        <DialogContent className="max-w-md bg-background/95 backdrop-blur-xl border-purple-500/20 rounded-3xl">
          <DialogHeader>
            <DialogTitle className="text-xl font-black uppercase tracking-tighter italic flex items-center gap-2">
              <BrainCircuit className="h-5 w-5 text-purple-500" />
              Inteligência Preditiva (IA)
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="p-4 rounded-2xl bg-purple-500/5 border border-purple-500/10">
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs font-black uppercase tracking-widest text-muted-foreground/60">Score de Fechamento</span>
                <span className={cn("text-2xl font-black font-display", getPredictionColor(sale.ai_prediction_score || 0))}>
                  {sale.ai_prediction_score || 0}%
                </span>
              </div>
              <div className="w-full bg-muted/30 h-2 rounded-full overflow-hidden">
                <div 
                  className="h-full bg-purple-500 transition-all duration-1000" 
                  style={{ width: `${sale.ai_prediction_score || 0}%` }}
                />
              </div>
            </div>
            <div className="space-y-2">
              <span className="text-xs font-black uppercase tracking-widest text-muted-foreground/60">Análise de Comportamento</span>
              <p className="text-sm leading-relaxed text-muted-foreground/80">
                {sale.ai_prediction_reasoning || "A IA está processando os dados deste lead para gerar uma predição precisa."}
              </p>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      <AIEmailDialog 
        open={showAIEmail} 
        onOpenChange={setShowAIEmail} 
        sale={sale} 
      />

      <WhatsAppDialog
        open={showWhatsApp}
        onOpenChange={setShowWhatsApp}
        sale={sale}
      />
    </div>
  );
});

SaleHUDCard.displayName = "SaleHUDCard";
