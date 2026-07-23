import { FC, useMemo } from "react";
import { motion } from "framer-motion";
import ReactMarkdown from "react-markdown";
import { Bot, Loader2, MessageSquare, Sparkles } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/atoms/skeleton";
import { usePersonalAssistant } from "@/hooks/assistant/usePersonalAssistant";
import { useAuth } from "@/contexts/AuthContext";
import { useEffect } from "react";

interface Props {
  onOpenChat?: () => void;
  onOpenHub?: () => void;
}

/**
 * Card resumo do Assistente Pessoal — exibido no topo do VendedorDashboard.
 * Chama a mesma edge function em modo 'briefing' via streaming.
 */
export const PersonalAssistantSummaryCard: FC<Props> = ({ onOpenChat, onOpenHub }) => {
  const { salesperson } = useAuth();
  const salespersonId = salesperson?.id ?? null;
  const { briefing, isBriefingLoading, error, refreshBriefing } = usePersonalAssistant(salespersonId);

  useEffect(() => {
    if (salespersonId) void refreshBriefing();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [salespersonId]);

  const displayName = useMemo(() => salesperson?.name?.split(" ")[0] ?? "Vendedor", [salesperson?.name]);

  if (!salespersonId) return null;

  return (
    <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.3 }}>
      <Card className="relative overflow-hidden border-primary/20 bg-gradient-to-br from-card via-card to-primary/5 p-5">
        <div className="flex items-start justify-between gap-4">
          <div className="flex items-start gap-3 flex-1 min-w-0">
            <div className="h-10 w-10 rounded-xl bg-primary/15 flex items-center justify-center shrink-0">
              <Sparkles className="h-5 w-5 text-primary" />
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 mb-1">
                <h3 className="text-sm font-bold text-foreground">Assistente do Dia</h3>
                <Badge variant="outline" className="text-[10px] px-1.5 py-0 border-primary/30 text-primary">
                  IA · {displayName}
                </Badge>
              </div>

              {isBriefingLoading && !briefing ? (
                <div className="space-y-2">
                  <Skeleton className="h-3 w-11/12" />
                  <Skeleton className="h-3 w-9/12" />
                  <Skeleton className="h-3 w-10/12" />
                </div>
              ) : error ? (
                <p className="text-xs text-destructive">Não consegui gerar o briefing agora. Tente novamente.</p>
              ) : (
                <div className="prose prose-sm dark:prose-invert max-w-none text-sm text-muted-foreground leading-relaxed line-clamp-6">
                  <ReactMarkdown>{briefing || "Preparando seu resumo do dia…"}</ReactMarkdown>
                </div>
              )}
            </div>
          </div>

          <div className="flex flex-col gap-2 shrink-0">
            {onOpenChat && (
              <Button size="sm" variant="outline" onClick={onOpenChat} className="gap-1.5">
                <MessageSquare className="h-3.5 w-3.5" /> Chat
              </Button>
            )}
            {onOpenHub && (
              <Button size="sm" onClick={onOpenHub} className="gap-1.5">
                <Bot className="h-3.5 w-3.5" /> Abrir Hub
              </Button>
            )}
            {isBriefingLoading && (
              <span className="text-[10px] text-muted-foreground flex items-center gap-1">
                <Loader2 className="h-3 w-3 animate-spin" /> gerando…
              </span>
            )}
          </div>
        </div>
      </Card>
    </motion.div>
  );
};

export default PersonalAssistantSummaryCard;
