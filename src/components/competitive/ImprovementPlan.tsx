import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { CheckCircle2, ArrowRight, Zap, Target, BarChart3, Users, Search, Database, Mail, Link as LinkIcon, MessageSquare } from "lucide-react";

export const ImprovementPlan = () => {
  const steps = [
    {
      step: "01",
      title: "Base de Dados Nativa (Big Data)",
      description: "Implementar repositório próprio de decisores B2B para eliminar dependência de buscas externas manuais.",
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
      title: "Cadência Multicanal Integrada",
      description: "Unificar fluxos de E-mail, WhatsApp e LinkedIn em uma única linha do tempo automatizada.",
      focus: "Automation",
      impact: "Critical",
      effort: "High",
      icon: LinkIcon
    },
    {
      step: "05",
      title: "Gestão de Bounce & Limpeza de Base",
      description: "Automatizar a remoção de e-mails inválidos para proteger a reputação do domínio de envio.",
      focus: "Deliverability",
      impact: "Medium",
      effort: "Low",
      icon: Mail
    },
    {
      step: "06",
      title: "Templates Dinâmicos por Persona",
      description: "Sugestão de textos baseada no cargo e setor do lead usando modelos de linguagem (LLM).",
      focus: "Personalization",
      impact: "High",
      effort: "Medium",
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
    <div className="space-y-6 animate-fade-in">
      <div className="flex flex-col space-y-2">
        <h2 className="text-3xl font-black italic tracking-tighter uppercase gradient-text">Plano de Melhorias: 10 Etapas</h2>
        <p className="text-muted-foreground font-medium">Roteiro estratégico para atingir a paridade e superar a concorrência.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {steps.map((item) => (
          <Card key={item.step} className="group hover:border-primary/50 transition-all duration-300 bg-card/50 backdrop-blur-sm">
            <CardHeader className="pb-2">
              <div className="flex justify-between items-start">
                <div className="flex items-center gap-3">
                  <div className="h-10 w-10 rounded-xl bg-primary/10 flex items-center justify-center text-primary group-hover:scale-110 transition-transform">
                    <item.icon className="h-5 w-5" />
                  </div>
                  <div>
                    <span className="text-[10px] font-bold text-primary/60 uppercase tracking-widest leading-none">Passo {item.step}</span>
                    <CardTitle className="text-lg font-bold leading-tight">{item.title}</CardTitle>
                  </div>
                </div>
                <Badge variant="outline" className="text-[10px] uppercase font-bold border-primary/20 bg-primary/5">
                  {item.impact} Impact
                </Badge>
              </div>
            </CardHeader>
            <CardContent className="space-y-3">
              <CardDescription className="text-sm leading-relaxed min-h-[40px]">
                {item.description}
              </CardDescription>
              <div className="flex items-center justify-between pt-2 border-t border-border/50">
                <div className="flex items-center gap-2">
                  <Badge className="bg-muted text-muted-foreground text-[10px] hover:bg-muted">
                    {item.focus}
                  </Badge>
                  <span className="text-[10px] text-muted-foreground font-medium italic">Esforço: {item.effort}</span>
                </div>
                <ArrowRight className="h-4 w-4 text-primary/40 group-hover:text-primary group-hover:translate-x-1 transition-all" />
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
};