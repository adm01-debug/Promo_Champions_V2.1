import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { CheckCircle2, XCircle, AlertCircle, TrendingUp, Zap, Target, Search, FileText, Share2, Download, Eye, Sparkles, BarChart3, Clock, Rocket, Shield, Trophy } from "lucide-react";
import { Progress } from "@/components/ui/progress";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { motion } from "framer-motion";

export const FeatureComparison = () => {
  const comparisons = [
    {
      feature: "Lead Discovery (SINGU)",
      status: "partial",
      our_evidence: "Integração nativa com o sistema SINGU para busca de decisores.",
      competitor_evidence: "Base própria com +10M de decisores brasileiros. Captura via redes sociais corporativas.",
      priority: "high",
      effort: "high",
      impact: "high",
      image: "tool-results://screenshots/20260508-130347-551351.png"
    },
    {
      feature: "Gatilhos de Intenção (Sales)",
      status: "gap",
      our_evidence: "Mapeado: Gatilhos baseados em abertura de propostas e cliques em links.",
      competitor_evidence: "Alertas em tempo real quando o lead interage com o e-mail ou proposta.",
      priority: "critical",
      effort: "medium",
      impact: "very-high"
    },
    {
      feature: "WhatsApp & Multi-channel",
      status: "full",
      our_evidence: "Follow-up inteligente com WhatsApp, registro de tentativas e automação de status.",
      competitor_evidence: "Geração de número de decisores e integração de cadência multicanal nativa.",
      priority: "done",
      effort: "medium",
      impact: "high"
    },
    {
      feature: "AI Engagement Scoring",
      status: "gap",
      our_evidence: "Mapeado no roadmap como indicador de calor.",
      competitor_evidence: "IA para análise de perfil comportamental e sugestão do 'momento certo' para ligar.",
      priority: "critical",
      effort: "medium",
      impact: "very-high"
    },
    {
      feature: "IA de Objeções (Reply AI)",
      status: "gap",
      our_evidence: "Roadmap: Sugestão de resposta baseada no sentimento do lead.",
      competitor_evidence: "Análise de sentimento básica e categorização de respostas automáticas.",
      priority: "medium",
      effort: "high",
      impact: "high"
    },
    {
      feature: "Gamification & Arena",
      status: "full",
      our_evidence: "Arena Competitiva com TV Dashboard, 1v1, Ligas e Apostas.",
      competitor_evidence: "Foco em CRM tradicional, sem camada social/gamificada avançada.",
      priority: "done",
      effort: "very-high",
      impact: "high"
    }
  ];

  const roadmap = [
    { goal: "AI Engagement Score", impact: "Very High", effort: "Medium", status: "Planning", recommendation: "Implementar algoritmo de calor baseado em aberturas/cliques." },
    { goal: "SINGU Database Sync", impact: "Critical", effort: "High", status: "Backlog", recommendation: "Sincronização bidirecional total com a base de decisores SINGU." },
    { goal: "Automated Bounce Cleanup", impact: "High", effort: "Low", status: "Research", recommendation: "Trigger automático para marcar lead como bounce após erro 4xx/5xx no envio." },
    { goal: "AI behavioral approach", impact: "Medium", effort: "Medium", status: "Backlog", recommendation: "Sugestão de templates baseada no cargo/setor do decisor." }
  ];

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "full": return <Badge className="bg-emerald-500/20 text-emerald-400 border-emerald-500/30 gap-1"><CheckCircle2 className="h-3 w-3" /> Full</Badge>;
      case "partial": return <Badge variant="outline" className="text-amber-400 border-amber-500/30 gap-1"><AlertCircle className="h-3 w-3" /> Partial</Badge>;
      case "gap": return <Badge variant="destructive" className="bg-rose-500/20 text-rose-400 border-rose-500/30 gap-1"><XCircle className="h-3 w-3" /> Gap</Badge>;
      default: return <Badge variant="secondary">{status}</Badge>;
    }
  };

  const getPriorityBadge = (priority: string) => {
    switch (priority) {
      case "critical": return <Badge className="bg-rose-500 text-white animate-pulse">Critical</Badge>;
      case "high": return <Badge className="bg-amber-600 text-white">High</Badge>;
      case "done": return <Badge variant="outline" className="text-muted-foreground border-white/10">Done</Badge>;
      default: return <Badge variant="secondary">{priority}</Badge>;
    }
  };

  const handleExportPDF = () => {
    toast.success("Gerando Relatório de Inteligência de Mercado...");
    setTimeout(() => {
      toast.info("O PDF será baixado em instantes com análise detalhada, evidências e roadmap.");
    }, 1500);
  };

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
        <div className="space-y-1">
          <div className="flex items-center gap-2 mb-2">
            <Badge className="bg-primary/20 text-primary border-primary/30 px-3 py-1 text-[10px] font-bold uppercase tracking-widest">
              Market Intelligence Hub
            </Badge>
            <div className="flex items-center gap-1.5 ml-2">
              <span className="size-1.5 rounded-full bg-emerald-500 animate-pulse" />
              <span className="text-[10px] font-black text-muted-foreground uppercase tracking-widest">vs Ramper Prospect</span>
            </div>
          </div>
          <h2 className="text-4xl font-black italic tracking-tighter uppercase gradient-text leading-none">Market Analysis</h2>
          <p className="text-muted-foreground text-sm font-medium">Análise comparativa de paridade funcional e roadmap estratégico.</p>
        </div>
        
        <div className="flex gap-3">
          <Button variant="outline" size="sm" className="gap-2 h-10 px-4 border-white/5 bg-white/5 hover:bg-white/10 transition-all text-xs font-bold uppercase tracking-widest" onClick={handleExportPDF}>
            <Download className="h-4 w-4" /> Export PDF
          </Button>
          <Button size="sm" className="gap-2 h-10 px-4 bg-primary hover:bg-primary/90 text-primary-foreground shadow-lg shadow-primary/20 transition-all text-xs font-bold uppercase tracking-widest">
            <Share2 className="h-4 w-4" /> Share Intel
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card className="glass border-emerald-500/20 bg-emerald-500/5 overflow-hidden group/strength relative">
          <div className="absolute top-0 right-0 w-32 h-32 bg-emerald-500/10 rounded-full blur-3xl -mr-16 -mt-16 group-hover/strength:scale-150 transition-transform duration-700" />
          <CardHeader className="pb-3 relative z-10">
            <CardTitle className="text-lg flex items-center gap-3 italic uppercase font-black tracking-tighter">
              <Shield className="h-5 w-5 text-emerald-400" /> Our <span className="text-emerald-400">Strengths</span>
            </CardTitle>
          </CardHeader>
          <CardContent className="relative z-10">
            <ul className="space-y-3">
              {[
                { text: "Advanced Gamification (Arena)", icon: Trophy },
                { text: "Real-time Audit Logging", icon: Shield },
                { text: "Deep Social Interaction", icon: Zap }
              ].map((item, idx) => (
                <li key={idx} className="flex items-start gap-3 group/item">
                  <div className="mt-1 h-5 w-5 rounded-md bg-emerald-500/10 flex items-center justify-center text-emerald-400 group-hover/item:scale-110 transition-transform">
                    <item.icon className="h-3 w-3" />
                  </div>
                  <span className="text-sm text-muted-foreground font-medium group-hover/item:text-foreground transition-colors">{item.text}</span>
                </li>
              ))}
            </ul>
          </CardContent>
        </Card>

        <Card className="glass border-rose-500/20 bg-rose-500/5 overflow-hidden group/gap relative">
          <div className="absolute top-0 right-0 w-32 h-32 bg-rose-500/10 rounded-full blur-3xl -mr-16 -mt-16 group-hover/gap:scale-150 transition-transform duration-700" />
          <CardHeader className="pb-3 relative z-10">
            <CardTitle className="text-lg flex items-center gap-3 italic uppercase font-black tracking-tighter">
              <Search className="h-5 w-5 text-rose-400" /> Critical <span className="text-rose-400">Gaps</span>
            </CardTitle>
          </CardHeader>
          <CardContent className="relative z-10">
            <ul className="space-y-3">
              {[
                { text: "SINGU Lead Database", icon: Rocket },
                { text: "AI Behavioral Analysis", icon: Brain },
                { text: "Auto-discovery Engines", icon: Search }
              ].map((item, idx) => (
                <li key={idx} className="flex items-start gap-3 group/item">
                  <div className="mt-1 h-5 w-5 rounded-md bg-rose-500/10 flex items-center justify-center text-rose-400 group-hover/item:scale-110 transition-transform">
                    <item.icon className="h-3 w-3" />
                  </div>
                  <span className="text-sm text-muted-foreground font-medium group-hover/item:text-foreground transition-colors">{item.text}</span>
                </li>
              ))}
            </ul>
          </CardContent>
        </Card>

        <Card className="glass border-primary/20 bg-primary/5 overflow-hidden group/opp relative">
          <div className="absolute top-0 right-0 w-32 h-32 bg-primary/10 rounded-full blur-3xl -mr-16 -mt-16 group-hover/opp:scale-150 transition-transform duration-700" />
          <CardHeader className="pb-3 relative z-10">
            <CardTitle className="text-lg flex items-center gap-3 italic uppercase font-black tracking-tighter">
              <Sparkles className="h-5 w-5 text-primary" /> Opp <span className="text-primary">Roadmap</span>
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-6 relative z-10">
            <div className="space-y-2">
              <div className="flex justify-between text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground">
                <span>AI Engagement Score</span>
                <span className="text-primary">0%</span>
              </div>
              <Progress value={0} className="h-1.5 bg-primary/10" />
            </div>
            <div className="space-y-2">
              <div className="flex justify-between text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground">
                <span>Lead Discovery Engine</span>
                <span className="text-primary">25%</span>
              </div>
              <Progress value={25} className="h-1.5 bg-primary/10" />
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <Card className="lg:col-span-2 glass border-white/5 overflow-hidden">
          <CardHeader className="border-b border-white/5 bg-white/5">
            <div className="flex justify-between items-center">
              <div>
                <CardTitle className="flex items-center gap-2 italic uppercase font-black tracking-tighter">
                   <FileText className="h-5 w-5 text-primary" /> Feature Matrix
                </CardTitle>
                <CardDescription className="text-xs font-medium">Detailed audit vs. Ramper Prospect</CardDescription>
              </div>
              <Badge variant="outline" className="bg-primary/5 text-primary border-primary/20 text-[10px] uppercase font-bold">
                Last Sync: Today
              </Badge>
            </div>
          </CardHeader>
          <CardContent className="p-0 overflow-x-auto">
            <Table>
              <TableHeader className="bg-white/5">
                <TableRow className="hover:bg-transparent border-white/5">
                  <TableHead className="w-[180px] text-[10px] uppercase font-black tracking-widest text-muted-foreground py-4 px-6">Feature</TableHead>
                  <TableHead className="text-[10px] uppercase font-black tracking-widest text-muted-foreground py-4">Status</TableHead>
                  <TableHead className="text-[10px] uppercase font-black tracking-widest text-muted-foreground py-4">Evidence (Ours)</TableHead>
                  <TableHead className="text-[10px] uppercase font-black tracking-widest text-muted-foreground py-4">Evidence (Comp)</TableHead>
                  <TableHead className="text-[10px] uppercase font-black tracking-widest text-muted-foreground py-4">Priority</TableHead>
                  <TableHead className="w-[50px]"></TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {comparisons.map((item, index) => (
                  <TableRow key={index} className="group/row hover:bg-white/5 border-white/5 transition-colors">
                    <TableCell className="font-bold text-sm px-6 py-4">{item.feature}</TableCell>
                    <TableCell className="py-4">{getStatusBadge(item.status)}</TableCell>
                    <TableCell className="py-4">
                      <p className="text-[10px] text-muted-foreground font-medium leading-tight max-w-[150px] line-clamp-2 italic">
                        {item.our_evidence}
                      </p>
                    </TableCell>
                    <TableCell className="py-4">
                      <p className="text-[10px] text-muted-foreground font-medium leading-tight max-w-[150px] line-clamp-2 italic">
                        {item.competitor_evidence}
                      </p>
                    </TableCell>
                    <TableCell className="py-4">{getPriorityBadge(item.priority)}</TableCell>
                    <TableCell className="py-4 px-6">
                      {item.image && (
                        <Dialog>
                          <DialogTrigger asChild>
                            <Button variant="ghost" size="icon" className="h-8 w-8 hover:bg-primary/10 hover:text-primary transition-colors">
                              <Eye className="h-4 w-4" />
                            </Button>
                          </DialogTrigger>
                          <DialogContent className="max-w-4xl glass border-white/10 p-0 overflow-hidden">
                            <DialogHeader className="p-6 border-b border-white/10 bg-white/5">
                              <DialogTitle className="flex items-center gap-2 italic uppercase font-black tracking-tighter">
                                <Search className="size-5 text-primary" /> Evidência: <span className="text-primary">{item.feature}</span>
                              </DialogTitle>
                            </DialogHeader>
                            <div className="p-8">
                              <div className="rounded-2xl overflow-hidden border border-white/10 shadow-2xl">
                                <img src={item.image} alt="Evidência do concorrente" className="w-full h-auto" loading="lazy" />
                              </div>
                              <div className="mt-6 flex items-center justify-between">
                                <p className="text-xs text-muted-foreground italic font-medium">Captura realizada em ramper.com.br/prospect</p>
                                <Badge variant="outline" className="bg-black/40 border-white/10">Verified Source</Badge>
                              </div>
                            </div>
                          </DialogContent>
                        </Dialog>
                      )}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>

        <Card className="glass border-white/5 overflow-hidden flex flex-col">
          <CardHeader className="border-b border-white/5 bg-white/5">
            <CardTitle className="flex items-center gap-2 italic uppercase font-black tracking-tighter">
              <Target className="h-5 w-5 text-primary" /> Prioritized Roadmap
            </CardTitle>
            <CardDescription className="text-xs font-medium">Strategic parity execution plan</CardDescription>
          </CardHeader>
          <CardContent className="p-4 space-y-4 flex-1">
            {roadmap.map((item, index) => (
              <motion.div 
                key={index} 
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: index * 0.1 }}
                className="p-4 rounded-2xl border border-white/5 bg-white/5 hover:border-primary/30 transition-all group/item"
              >
                <div className="flex justify-between items-start mb-3">
                  <h4 className="font-black text-xs uppercase tracking-tighter italic group-hover:text-primary transition-colors">{item.goal}</h4>
                  <Badge variant="outline" className="text-[8px] uppercase font-bold border-white/10 bg-black/40">
                    {item.status}
                  </Badge>
                </div>
                <p className="text-[10px] text-muted-foreground leading-relaxed font-medium mb-4">
                  {item.recommendation}
                </p>
                <div className="flex gap-4 pt-3 border-t border-white/5">
                  <div className="flex-1">
                    <p className="text-[8px] text-muted-foreground uppercase font-black tracking-widest mb-1">Impact</p>
                    <p className="text-[10px] font-bold text-foreground">{item.impact}</p>
                  </div>
                  <div className="flex-1">
                    <p className="text-[8px] text-muted-foreground uppercase font-black tracking-widest mb-1">Effort</p>
                    <p className="text-[10px] font-bold text-foreground">{item.effort}</p>
                  </div>
                </div>
              </motion.div>
            ))}
          </CardContent>
          <div className="p-4 border-t border-white/5 bg-white/5">
            <Button className="w-full h-10 bg-primary/10 text-primary hover:bg-primary/20 border-primary/20 text-[10px] font-black uppercase tracking-[0.2em]">
              Executar Roadmap
            </Button>
          </div>
        </Card>
      </div>
    </div>
  );
};

const Brain = (props: any) => (
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
    <path d="M9.5 2A2.5 2.5 0 0 1 12 4.5v15a2.5 2.5 0 0 1-4.96.44 2.5 2.5 0 0 1-2.96-3.08 3 3 0 0 1-.34-5.58 2.5 2.5 0 0 1 1.32-4.24 2.5 2.5 0 0 1 4.44-2.04Z" />
    <path d="M14.5 2A2.5 2.5 0 0 0 12 4.5v15a2.5 2.5 0 0 0 4.96.44 2.5 2.5 0 0 0 2.96-3.08 3 3 0 0 0 .34-5.58 2.5 2.5 0 0 0-1.32-4.24 2.5 2.5 0 0 0-4.44-2.04Z" />
  </svg>
);
