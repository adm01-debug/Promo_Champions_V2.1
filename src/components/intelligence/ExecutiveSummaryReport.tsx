import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { motion, AnimatePresence } from "framer-motion";
import { 
  FileText, 
  TrendingUp, 
  Users, 
  Target, 
  Zap, 
  AlertTriangle, 
  CheckCircle2, 
  Download, 
  Share2, 
  Printer,
  Sparkles,
  ChevronRight,
  TrendingDown
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { cn } from "@/lib/utils";

interface Props {
  isOpen: boolean;
  onClose: () => void;
}

export function ExecutiveSummaryReport({ isOpen, onClose }: Props) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-background/80 backdrop-blur-sm animate-in fade-in duration-300">
      <motion.div 
        initial={{ opacity: 0, scale: 0.95, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95, y: 20 }}
        className="relative w-full max-w-5xl max-h-[90vh] overflow-hidden bg-card border border-border/50 shadow-2xl rounded-2xl flex flex-col"
      >
        {/* Header / Toolbar */}
        <div className="flex items-center justify-between p-6 border-b border-border/20 bg-muted/30">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-xl bg-primary/10 text-primary">
              <FileText className="h-6 w-6" />
            </div>
            <div>
              <h2 className="text-xl font-display font-bold">Relatório Executivo (CEO-Ready)</h2>
              <p className="text-xs text-muted-foreground uppercase tracking-widest font-medium">Gerado por IA • {new Date().toLocaleDateString('pt-BR', { month: 'long', year: 'numeric' })}</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Button variant="outline" size="sm" className="h-9 gap-2 text-xs">
              <Download className="h-3.5 w-3.5" /> PDF
            </Button>
            <Button variant="outline" size="sm" className="h-9 gap-2 text-xs">
              <Share2 className="h-3.5 w-3.5" /> Compartilhar
            </Button>
            <Button variant="ghost" size="sm" onClick={onClose} className="h-9 w-9 p-0">
              <ChevronRight className="h-5 w-5 rotate-90" />
            </Button>
          </div>
        </div>

        {/* Content - Scrollable */}
        <div className="flex-1 overflow-y-auto p-8 space-y-10 custom-scrollbar">
          {/* Executive Overview */}
          <section className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            <div className="lg:col-span-2 space-y-6">
              <div className="space-y-2">
                <Badge variant="outline" className="text-primary border-primary/20 bg-primary/5 uppercase tracking-tighter text-[10px]">Resumo de Alto Nível</Badge>
                <h3 className="text-3xl font-display font-black tracking-tight leading-tight">
                  Crescimento Acelerado com <span className="text-primary italic">Foco em Blindagem de Contas</span>
                </h3>
                <p className="text-muted-foreground leading-relaxed">
                  O trimestre atual apresenta uma performance superior em 15% comparado ao período anterior. A tração é impulsionada pela vertical de Tecnologia e Varejo. Identificamos uma oportunidade de expansão de R$ 1.2M nas contas Tier 1 através de cross-selling.
                </p>
              </div>

              <div className="grid grid-cols-3 gap-4">
                <SummaryStat label="Pipeline Total" value="R$ 12.4M" trend="+8%" tone="good" />
                <SummaryStat label="Win Rate Médio" value="34.2%" trend="+2.1%" tone="good" />
                <SummaryStat label="LTV/CAC" value="4.8x" trend="-0.2" tone="neutral" />
              </div>
            </div>

            <div className="p-6 rounded-2xl bg-primary/5 border border-primary/10 space-y-4">
              <h4 className="font-bold flex items-center gap-2 text-xs uppercase tracking-widest">
                <Sparkles className="h-3.5 w-3.5 text-primary" /> IA Strategic Pulse
              </h4>
              <div className="space-y-3">
                <InsightRow icon={Target} text="Projeção de fechamento: R$ 2.8M (102% da meta)" />
                <InsightRow icon={AlertTriangle} text="3 deals de alto valor com risco de estagnação" tone="warn" />
                <InsightRow icon={TrendingUp} text="Sentimento médio dos leads subiu de 68 para 74" tone="good" />
                <InsightRow icon={Zap} text="Ação Prioritária: Blindagem da conta Acme Corp" />
              </div>
            </div>
          </section>

          {/* Detailed Analysis Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 pt-6 border-t border-border/20">
            {/* Revenue Health */}
            <div className="space-y-4">
              <h4 className="font-bold text-sm flex items-center gap-2">
                <TrendingUp className="h-4 w-4 text-emerald-500" /> Saúde da Receita
              </h4>
              <div className="space-y-4 p-5 rounded-xl border border-border/30 bg-card">
                <div className="space-y-2">
                  <div className="flex justify-between text-xs font-medium">
                    <span>Atingimento da Meta</span>
                    <span className="font-bold">84%</span>
                  </div>
                  <Progress value={84} className="h-2 bg-emerald-500/10" />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="p-3 rounded-lg bg-secondary/30">
                    <p className="text-[10px] text-muted-foreground uppercase">Receita Recorrente</p>
                    <p className="text-lg font-bold">R$ 840k</p>
                  </div>
                  <div className="p-3 rounded-lg bg-secondary/30">
                    <p className="text-[10px] text-muted-foreground uppercase">Expansão</p>
                    <p className="text-lg font-bold">R$ 120k</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Competitive Landscape */}
            <div className="space-y-4">
              <h4 className="font-bold text-sm flex items-center gap-2">
                <ShieldCheck className="h-4 w-4 text-blue-500" /> Paisagem Competitiva
              </h4>
              <div className="space-y-4 p-5 rounded-xl border border-border/30 bg-card">
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-xs">Win-Rate vs. NexGen</span>
                    <Badge className="bg-emerald-500/10 text-emerald-500 border-emerald-500/20">Superior (62%)</Badge>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-xs">Presença em Deals</span>
                    <span className="text-xs font-bold text-muted-foreground">32% dos deals</span>
                  </div>
                  <div className="pt-2">
                    <p className="text-[10px] font-bold text-muted-foreground uppercase mb-2">Principais motivos de perda</p>
                    <div className="flex flex-wrap gap-2">
                      <Badge variant="secondary" className="text-[9px]">Preço (42%)</Badge>
                      <Badge variant="secondary" className="text-[9px]">Feature Gap (28%)</Badge>
                      <Badge variant="secondary" className="text-[9px]">Timing (15%)</Badge>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Action Plan */}
          <div className="pt-6 border-t border-border/20">
            <h4 className="font-bold text-sm flex items-center gap-2 mb-4">
              <CheckCircle2 className="h-4 w-4 text-primary" /> Plano de Ação Estratégico
            </h4>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <ActionCard title="Blindagem de Q2" desc="Focar nas 5 maiores renovações para garantir o baseline da receita." priority="Alta" />
              <ActionCard title="Otimização de Funil" desc="Reduzir o tempo médio de 'Discovery' para 'Proposta' em 15%." priority="Média" />
              <ActionCard title="Capacitação Técnica" desc="Treinar time de vendas na nova feature de Integração Multi-Cloud." priority="Baixa" />
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="p-6 border-t border-border/20 bg-muted/30 text-center">
          <p className="text-[10px] text-muted-foreground uppercase tracking-widest font-bold">
            CONFIDENCIAL • APENAS PARA USO EXECUTIVO • PROMO CHAMPIONS INTELLIGENCE
          </p>
        </div>
      </motion.div>
    </div>
  );
}

function SummaryStat({ label, value, trend, tone }: { label: string, value: string, trend: string, tone: "good" | "bad" | "neutral" }) {
  const trendColor = tone === "good" ? "text-emerald-500" : tone === "bad" ? "text-destructive" : "text-muted-foreground";
  const TrendIcon = trend.startsWith('+') ? TrendingUp : TrendingDown;
  
  return (
    <div className="p-4 rounded-xl border border-border/30 bg-card hover:border-primary/30 transition-all">
      <p className="text-[10px] text-muted-foreground uppercase font-bold tracking-tight mb-1">{label}</p>
      <div className="flex items-baseline justify-between">
        <span className="text-xl font-black">{value}</span>
        <div className={cn("flex items-center gap-0.5 text-[10px] font-bold", trendColor)}>
          <TrendIcon className="h-2.5 w-2.5" /> {trend}
        </div>
      </div>
    </div>
  );
}

function InsightRow({ icon: Icon, text, tone = "default" }: { icon: any, text: string, tone?: "default" | "good" | "warn" }) {
  const colors = {
    default: "text-primary",
    good: "text-emerald-500",
    warn: "text-amber-500"
  };
  return (
    <div className="flex items-start gap-2">
      <Icon className={cn("h-3.5 w-3.5 mt-0.5 shrink-0", colors[tone])} />
      <p className="text-[11px] leading-snug">{text}</p>
    </div>
  );
}

function ActionCard({ title, desc, priority }: { title: string, desc: string, priority: string }) {
  return (
    <div className="p-4 rounded-xl border border-border/30 bg-card hover:border-primary/30 transition-all flex flex-col justify-between h-full">
      <div>
        <div className="flex justify-between items-start mb-2">
          <h5 className="text-xs font-bold">{title}</h5>
          <Badge className={cn(
            "text-[8px] uppercase font-black px-1.5 h-4",
            priority === 'Alta' ? "bg-destructive/10 text-destructive border-destructive/20" : 
            priority === 'Média' ? "bg-amber-500/10 text-amber-500 border-amber-500/20" : "bg-emerald-500/10 text-emerald-500 border-emerald-500/20"
          )}>{priority}</Badge>
        </div>
        <p className="text-[10px] text-muted-foreground leading-relaxed">{desc}</p>
      </div>
      <Button variant="link" className="p-0 h-auto text-[10px] font-bold text-primary justify-start mt-3">
        Detalhes <ChevronRight className="h-3 w-3" />
      </Button>
    </div>
  );
}

function ShieldCheck(props: any) {
  return (
    <svg
      {...props}
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10" />
      <path d="m9 12 2 2 4-4" />
    </svg>
  );
}
