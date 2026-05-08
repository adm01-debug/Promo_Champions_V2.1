import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { CheckCircle2, XCircle, AlertCircle, TrendingUp, Zap, Target, Search } from "lucide-react";
import { Progress } from "@/components/ui/progress";

export const FeatureComparison = () => {
  const comparisons = [
    {
      feature: "Big Data & Lead Discovery",
      status: "partial",
      our_evidence: "Integração via API com fontes externas e busca semântica básica.",
      competitor_evidence: "Base própria com +10M de decisores e descoberta de e-mail/WhatsApp nativa.",
      priority: "high",
      effort: "high",
      impact: "high"
    },
    {
      feature: "WhatsApp & Multi-channel",
      status: "full",
      our_evidence: "Follow-up inteligente com WhatsApp, registro de tentativas e automação de status.",
      competitor_evidence: "Geração de número e integração de cadência multicanal.",
      priority: "done",
      effort: "medium",
      impact: "high"
    },
    {
      feature: "AI Engagement Scoring",
      status: "gap",
      our_evidence: "Ainda não implementado (Mapeado no roadmap).",
      competitor_evidence: "Sugestão de momento certo para ligar baseado em sinais de interesse.",
      priority: "critical",
      effort: "medium",
      impact: "very-high"
    },
    {
      feature: "Cadence Automation",
      status: "full",
      our_evidence: "Sistema de cadências robusto com auditoria detalhada.",
      competitor_evidence: "Fluxos automatizados de prospecção ativa.",
      priority: "done",
      effort: "high",
      impact: "high"
    },
    {
      feature: "Gamification & Arena",
      status: "full",
      our_evidence: "Arena Competitiva com TV Dashboard, 1v1, Ligas e Apostas.",
      competitor_evidence: "Foco em relatórios tradicionais, menos focado em gamificação de vendas.",
      priority: "done",
      effort: "very-high",
      impact: "high"
    },
    {
      feature: "Inbound Prospecting",
      status: "partial",
      our_evidence: "Fluxos de recepção de leads básicos.",
      competitor_evidence: "Conversão de inbound para prospecção ativa automatizada.",
      priority: "medium",
      effort: "medium",
      impact: "medium"
    }
  ];

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "full": return <Badge className="bg-green-500/20 text-green-500 hover:bg-green-500/30 gap-1"><CheckCircle2 className="h-3 w-3" /> Full</Badge>;
      case "partial": return <Badge variant="outline" className="text-amber-500 border-amber-500/50 gap-1"><AlertCircle className="h-3 w-3" /> Partial</Badge>;
      case "gap": return <Badge variant="destructive" className="gap-1"><XCircle className="h-3 w-3" /> Gap</Badge>;
      default: return <Badge variant="secondary">{status}</Badge>;
    }
  };

  const getPriorityBadge = (priority: string) => {
    switch (priority) {
      case "critical": return <Badge className="bg-red-500 text-white animate-pulse">Critical</Badge>;
      case "high": return <Badge className="bg-orange-500 text-white">High</Badge>;
      case "done": return <Badge variant="outline" className="text-muted-foreground">Done</Badge>;
      default: return <Badge variant="secondary">{priority}</Badge>;
    }
  };

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card className="bg-primary/5 border-primary/20">
          <CardHeader className="pb-2">
            <CardTitle className="text-lg flex items-center gap-2">
              <TrendingUp className="h-5 w-5 text-primary" /> Our Strengths
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ul className="text-sm space-y-2 text-muted-foreground">
              <li className="flex items-center gap-2"><div className="h-1 w-1 rounded-full bg-primary" /> Advanced Gamification (Arena)</li>
              <li className="flex items-center gap-2"><div className="h-1 w-1 rounded-full bg-primary" /> Real-time Audit Logging</li>
              <li className="flex items-center gap-2"><div className="h-1 w-1 rounded-full bg-primary" /> Deep Social Interaction (Competitive Chat)</li>
            </ul>
          </CardContent>
        </Card>

        <Card className="bg-amber-500/5 border-amber-500/20">
          <CardHeader className="pb-2">
            <CardTitle className="text-lg flex items-center gap-2">
              <Search className="h-5 w-5 text-amber-500" /> Main Gaps (vs Ramper)
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ul className="text-sm space-y-2 text-muted-foreground">
              <li className="flex items-center gap-2"><div className="h-1 w-1 rounded-full bg-amber-500" /> Native Lead/Decision Maker Database</li>
              <li className="flex items-center gap-2"><div className="h-1 w-1 rounded-full bg-amber-500" /> AI Behavioral Analysis</li>
              <li className="flex items-center gap-2"><div className="h-1 w-1 rounded-full bg-amber-500" /> Auto-discovery of Emails/Phones</li>
            </ul>
          </CardContent>
        </Card>

        <Card className="bg-blue-500/5 border-blue-500/20">
          <CardHeader className="pb-2">
            <CardTitle className="text-lg flex items-center gap-2">
              <Zap className="h-5 w-5 text-blue-500" /> Opportunity Roadmap
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-1">
              <div className="flex justify-between text-[10px] font-bold uppercase tracking-wider">
                <span>AI Engagement Score</span>
                <span>0%</span>
              </div>
              <Progress value={0} className="h-1.5" />
            </div>
            <div className="space-y-1">
              <div className="flex justify-between text-[10px] font-bold uppercase tracking-wider">
                <span>Lead Discovery Engine</span>
                <span>25%</span>
              </div>
              <Progress value={25} className="h-1.5" />
            </div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Feature Comparison Matrix</CardTitle>
          <CardDescription>Detailed audit of our system vs. Ramper Prospect</CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-[200px]">Feature</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Evidence (Ours)</TableHead>
                <TableHead>Evidence (Ramper)</TableHead>
                <TableHead>Priority</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {comparisons.map((item, index) => (
                <TableRow key={index}>
                  <TableCell className="font-semibold">{item.feature}</TableCell>
                  <TableCell>{getStatusBadge(item.status)}</TableCell>
                  <TableCell className="text-xs text-muted-foreground italic">{item.our_evidence}</TableCell>
                  <TableCell className="text-xs text-muted-foreground italic">{item.competitor_evidence}</TableCell>
                  <TableCell>{getPriorityBadge(item.priority)}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
};
