import { motion } from "framer-motion";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import { ChevronDown, AlertTriangle, TrendingUp, Users, ListChecks } from "lucide-react";
import { formatDistanceToNow } from "date-fns";
import { ptBR } from "date-fns/locale";
import {
  sentimentMeta,
  sourceMeta,
  type ConversationAnalysis,
} from "./conversationHelpers";

interface Props {
  analysis: ConversationAnalysis;
}

export const AnalysisResultCard = ({ analysis }: Props) => {
  const s = sentimentMeta[analysis.sentiment];
  const src = sourceMeta[analysis.source];

  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.25 }}
    >
      <Card className="hover:shadow-md transition-shadow">
        <CardHeader className="pb-3">
          <div className="flex items-start justify-between gap-3">
            <div className="space-y-1.5">
              <div className="flex items-center gap-2">
                <Badge variant="outline" className="gap-1">
                  <span>{src.emoji}</span>
                  {src.label}
                </Badge>
                <Badge className={`gap-1 border ${s.className}`} variant="outline">
                  <span>{s.emoji}</span> {s.label}
                </Badge>
              </div>
              <CardTitle className="text-sm font-medium leading-snug">
                {analysis.summary || "Sem resumo gerado."}
              </CardTitle>
            </div>
            <span className="text-xs text-muted-foreground whitespace-nowrap">
              {formatDistanceToNow(new Date(analysis.created_at), { locale: ptBR, addSuffix: true })}
            </span>
          </div>
        </CardHeader>
        <CardContent className="space-y-2 pt-0">
          <Section
            icon={<AlertTriangle className="h-3.5 w-3.5 text-destructive" />}
            title="Objeções"
            count={analysis.objections.length}
          >
            <ul className="space-y-1 text-sm">
              {analysis.objections.map((o, i) => (
                <li key={i} className="flex gap-2">
                  <Badge variant="outline" className="text-[10px] uppercase">{o.category}</Badge>
                  <span className="text-muted-foreground">{o.text}</span>
                </li>
              ))}
            </ul>
          </Section>
          <Section
            icon={<ListChecks className="h-3.5 w-3.5 text-primary" />}
            title="Próximos passos"
            count={analysis.next_steps.length}
          >
            <ul className="space-y-1 text-sm">
              {analysis.next_steps.map((n, i) => (
                <li key={i} className="text-muted-foreground">
                  • {n.text}{n.deadline_hint ? ` — ${n.deadline_hint}` : ""}
                </li>
              ))}
            </ul>
          </Section>
          <Section
            icon={<TrendingUp className="h-3.5 w-3.5 text-status-success" />}
            title="Sinais de compra"
            count={analysis.buying_signals.length}
          >
            <div className="flex flex-wrap gap-1">
              {analysis.buying_signals.map((b, i) => (
                <Badge key={i} variant="outline" className="bg-status-success/10 text-status-success border-status-success/30">
                  {b}
                </Badge>
              ))}
            </div>
          </Section>
          <Section
            icon={<AlertTriangle className="h-3.5 w-3.5 text-status-warning" />}
            title="Sinais de risco"
            count={analysis.risk_signals.length}
          >
            <div className="flex flex-wrap gap-1">
              {analysis.risk_signals.map((r, i) => (
                <Badge key={i} variant="outline" className="bg-status-warning/10 text-status-warning border-status-warning/30">
                  {r}
                </Badge>
              ))}
            </div>
          </Section>
          <Section
            icon={<Users className="h-3.5 w-3.5 text-accent-foreground" />}
            title="Decisores mencionados"
            count={analysis.decision_makers.length}
          >
            <div className="flex flex-wrap gap-1">
              {analysis.decision_makers.map((d, i) => (
                <Badge key={i} variant="secondary">{d}</Badge>
              ))}
            </div>
          </Section>
        </CardContent>
      </Card>
    </motion.div>
  );
};

const Section = ({
  icon,
  title,
  count,
  children,
}: {
  icon: React.ReactNode;
  title: string;
  count: number;
  children: React.ReactNode;
}) => {
  if (count === 0) return null;
  return (
    <Collapsible>
      <CollapsibleTrigger className="group flex w-full items-center justify-between rounded-md py-1.5 px-2 hover:bg-muted/50 transition-colors">
        <span className="flex items-center gap-2 text-xs font-medium">
          {icon}
          {title}
          <Badge variant="secondary" className="text-[10px] h-4 px-1.5">{count}</Badge>
        </span>
        <ChevronDown className="h-3.5 w-3.5 text-muted-foreground transition-transform group-data-[state=open]:rotate-180" />
      </CollapsibleTrigger>
      <CollapsibleContent className="px-2 pb-2 pt-1">{children}</CollapsibleContent>
    </Collapsible>
  );
};
