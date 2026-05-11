import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { CheckCircle2, ArrowRight, Zap, Target, BarChart3, Users, Search, Database, Mail, Link as LinkIcon, MessageSquare, Sparkles } from "lucide-react";
import { motion } from "framer-motion";

export const ImprovementPlan = () => {
  const steps = [
    {
      step: "01",
      title: "Base de Dados Nativa (SINGU)",
      description: "Integrar a base de dados do sistema SINGU para eliminar a dependência de buscas externas manuais e centralizar decisores B2B.",
      focus: "Lead Discovery",
      impact: "High",
      effort: "Critical",
      icon: Database
    },
    {
      step: "02",
      title: "Enriquecimento Automático via IA",
      description: "Desenvolver scraper inteligente que valide e-mails e telefones em tempo real ao capturar leads do LinkedIn.",
      focus: "Data Quality",
      impact: "Very High",
      effort: "Medium",
      icon: Search
    },
    {
      step: "03",
      title: "Score de Engajamento Preditivo",
      description: "Criar algoritmo que priorize leads baseado em interações anteriores (aberturas, cliques, tempo de resposta).",
      focus: "AI Analytics",
      impact: "High",
      effort: "Medium",
      icon: BarChart3
    },
    {
      step: "04",
      title: "Gatilhos de Intenção (Sales-Led)",
      description: "Iniciar cadências ou criar tarefas de alta prioridade automaticamente quando um lead interage com propostas ou abre anexos repetidamente.",
      focus: "Conversion",
      impact: "Critical",
      effort: "High",
      icon: Zap
    },
    {
      step: "05",
      title: "Cadência Multicanal (WhatsApp/Call/LI)",
      description: "Integrar tarefas manuais de ligação e mensagens de voz no WhatsApp dentro do fluxo, garantindo uma abordagem humana e persistente.",
      focus: "Sales Results",
      impact: "High",
      effort: "Medium",
      icon: LinkIcon
    },
    {
      step: "06",
      title: "IA de Contorno de Objeções",
      description: "Análise de sentimentos em respostas para sugerir automaticamente scripts de contorno de objeções baseados em cases de sucesso.",
      focus: "Closing",
      impact: "High",
      effort: "High",
      icon: MessageSquare
    },
    {
      step: "07",
      title: "Dashboard de ROI Competitivo",
      description: "Visualização clara do custo por lead vs. fechamento em comparação com benchmarks do mercado.",
      focus: "Management",
      impact: "High",
      effort: "Medium",
      icon: Target
    },
    {
      step: "08",
      title: "Sincronização Bidirecional com CRMs",
      description: "Melhorar conectores com Salesforce, HubSpot e Pipedrive para evitar duplicidade de dados.",
      focus: "Integrations",
      impact: "Very High",
      effort: "High",
      icon: Users
    },
    {
      step: "09",
      title: "Gamificação de Prospecção Ativa",
      description: "Transformar a descoberta de leads em missões diárias na Arena Competitiva com recompensas reais.",
      focus: "Performance",
      impact: "High",
      effort: "Medium",
      icon: Zap
    },
    {
      step: "10",
      title: "Relatórios de Inteligência Executiva",
      description: "Geração automática de PDFs mensais com gaps de produtividade e sugestões de melhoria de script.",
      focus: "Strategy",
      impact: "Medium",
      effort: "Low",
      icon: CheckCircle2
    }
  ];

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
      <div className="flex flex-col space-y-2">
        <div className="flex items-center gap-2 mb-2">
          <Badge className="bg-primary/20 text-primary border-primary/30 px-3 py-1 text-[10px] font-bold uppercase tracking-widest">
            Strategic Roadmap
          </Badge>
          <div className="flex items-center gap-1.5 ml-2">
            <span className="size-1.5 rounded-full bg-primary animate-pulse" />
            <span className="text-[10px] font-black text-muted-foreground uppercase tracking-widest">Execution Mode: Active</span>
          </div>
        </div>
        <h2 className="text-4xl font-black italic tracking-tighter uppercase gradient-text leading-none">Plano de 10 Etapas</h2>
        <p className="text-muted-foreground text-sm font-medium">Roteiro estratégico para atingir a paridade e superar a concorrência.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {steps.map((item, idx) => (
          <motion.div
            key={item.step}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: idx * 0.05 }}
          >
            <Card className="group hover:border-primary/40 transition-all duration-500 glass overflow-hidden relative">
              <div className="absolute top-0 right-0 w-24 h-24 bg-primary/5 rounded-full blur-2xl -mr-12 -mt-12 group-hover:bg-primary/10 transition-colors" />
              <CardHeader className="pb-2 relative z-10">
                <div className="flex justify-between items-start">
                  <div className="flex items-center gap-4">
                    <div className="h-12 w-12 rounded-2xl bg-primary/10 flex items-center justify-center text-primary group-hover:scale-110 group-hover:rotate-3 transition-all duration-500 border border-primary/20 shadow-lg shadow-primary/5">
                      <item.icon className="h-6 w-6" />
                    </div>
                    <div>
                      <span className="text-[10px] font-black text-primary uppercase tracking-[0.2em] leading-none mb-1 block">Passo {item.step}</span>
                      <CardTitle className="text-lg font-bold leading-tight group-hover:text-primary transition-colors italic uppercase tracking-tighter">{item.title}</CardTitle>
                    </div>
                  </div>
                  <Badge variant="outline" className="text-[9px] uppercase font-black border-primary/20 bg-primary/5 px-2 py-0.5">
                    {item.impact} Impact
                  </Badge>
                </div>
              </CardHeader>
              <CardContent className="space-y-4 relative z-10">
                <CardDescription className="text-sm leading-relaxed text-muted-foreground font-medium min-h-[40px]">
                  {item.description}
                </CardDescription>
                <div className="flex items-center justify-between pt-4 border-t border-white/5">
                  <div className="flex items-center gap-3">
                    <Badge className="bg-white/5 text-muted-foreground text-[10px] font-bold uppercase hover:bg-white/10 border-white/5">
                      {item.focus}
                    </Badge>
                    <div className="flex items-center gap-1.5">
                      <Clock className="size-3 text-muted-foreground/60" />
                      <span className="text-[10px] text-muted-foreground/60 font-bold uppercase tracking-tighter">Esforço: {item.effort}</span>
                    </div>
                  </div>
                  <div className="flex items-center gap-1 text-primary/40 group-hover:text-primary transition-all group-hover:translate-x-1">
                    <span className="text-[9px] font-black uppercase tracking-widest opacity-0 group-hover:opacity-100 transition-opacity">Details</span>
                    <ArrowRight className="h-4 w-4" />
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        ))}
      </div>
      
      <div className="pt-6 border-t border-white/5 flex justify-center">
        <Button className="bg-primary/10 text-primary hover:bg-primary/20 border-primary/20 px-10 h-12 text-xs font-black uppercase tracking-[0.3em] rounded-full shadow-2xl shadow-primary/10">
          <Sparkles className="size-4 mr-2" /> Iniciar Transformação Digital
        </Button>
      </div>
    </div>
  );
};
