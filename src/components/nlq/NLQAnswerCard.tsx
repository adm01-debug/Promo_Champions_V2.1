import { motion } from "framer-motion";
import ReactMarkdown from "react-markdown";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Sparkles, Database } from "lucide-react";
import { NLQDataChart } from "./NLQDataChart";
import { formatPeriodLabel, type NLQResponse } from "./nlqHelpers";

interface Props { response: NLQResponse }

export function NLQAnswerCard({ response }: Props) {
  const periodLabel = formatPeriodLabel(response.period);
  const primary = response.data[0];

  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.25, ease: "easeOut" }}
    >
      <Card className="overflow-hidden">
        <CardHeader className="pb-3">
          <CardTitle className="flex items-center gap-2 text-base">
            <Sparkles className="h-4 w-4 text-primary" /> Resposta da IA
          </CardTitle>
          <div className="flex flex-wrap gap-2 pt-1">
            {response.tool_calls.map((tc, i) => (
              <Badge key={i} variant="outline" className="gap-1 text-[10px]">
                <Database className="h-3 w-3" /> {tc.tool}
              </Badge>
            ))}
            {periodLabel && (
              <Badge variant="secondary" className="text-[10px]">{periodLabel}</Badge>
            )}
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="prose prose-sm dark:prose-invert max-w-none [&_strong]:text-primary [&_p]:text-foreground [&_p]:leading-relaxed">
            <ReactMarkdown>{response.answer}</ReactMarkdown>
          </div>

          {primary && primary.rows.length > 1 && (
            <div className="border-t border-border/60 pt-4 space-y-2">
              <div className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
                Dados ({primary.rows.length} registros)
              </div>
              <NLQDataChart dataset={primary} />
            </div>
          )}
        </CardContent>
      </Card>
    </motion.div>
  );
}
