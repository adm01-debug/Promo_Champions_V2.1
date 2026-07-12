import { memo } from "react";
import { motion } from "framer-motion";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  BookOpen,
  PlusCircle,
  ListChecks,
  Target,
  BarChart3,
  Sparkles,
} from "lucide-react";
import { cn } from "@/lib/utils";

interface PlaybookEmptyStateProps {
  stageLabel: string;
  isSearching?: boolean;
  onCreate?: () => void;
  onClearSearch?: () => void;
}

const steps = [
  {
    id: 1,
    icon: PlusCircle,
    title: "Crie um Playbook",
    description: "Dê um título claro e escolha a etapa do funil que ele vai apoiar.",
  },
  {
    id: 2,
    icon: ListChecks,
    title: "Adicione itens",
    description: "Checklist, roteiros de ligação, perguntas SPIN e materiais de apoio.",
  },
  {
    id: 3,
    icon: Target,
    title: "Aplique nos deals",
    description: "Vincule a deals dentro da etapa correspondente para guiar o vendedor.",
  },
  {
    id: 4,
    icon: BarChart3,
    title: "Acompanhe aderência",
    description: "Monitore quem seguiu o playbook e o impacto na conversão da etapa.",
  },
];

/**
 * Empty state guiado com passos numerados.
 * Substitui o card genérico "Nenhum playbook para esta etapa".
 */
export const PlaybookEmptyState = memo(function PlaybookEmptyState({
  stageLabel,
  isSearching = false,
  onCreate,
  onClearSearch,
}: PlaybookEmptyStateProps) {
  if (isSearching) {
    return (
      <Card className="glass border-border/40">
        <CardContent className="flex flex-col items-center justify-center py-12 text-center gap-3">
          <div className="p-4 rounded-full bg-muted/40">
            <BookOpen className="h-10 w-10 text-muted-foreground opacity-60" aria-hidden="true" />
          </div>
          <div>
            <p className="text-foreground font-semibold">Nenhum resultado encontrado</p>
            <p className="text-sm text-muted-foreground mt-1">
              Tente ajustar os termos ou limpar o filtro.
            </p>
          </div>
          {onClearSearch && (
            <Button variant="outline" size="sm" onClick={onClearSearch} className="mt-2">
              Limpar busca
            </Button>
          )}
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="glass border-border/40 overflow-hidden">
      <CardContent className="p-6 md:p-8">
        <div className="flex flex-col md:flex-row md:items-center gap-4 mb-6">
          <div className="p-3 rounded-xl bg-gradient-to-br from-primary to-accent shadow-lg shadow-primary/20">
            <Sparkles className="h-5 w-5 text-primary-foreground" aria-hidden="true" />
          </div>
          <div className="flex-1">
            <h3 className="text-lg font-bold text-foreground">
              Comece seu primeiro playbook de <span className="text-primary">{stageLabel}</span>
            </h3>
            <p className="text-sm text-muted-foreground mt-1">
              Em 4 passos você padroniza a operação e mede aderência do time.
            </p>
          </div>
          {onCreate && (
            <Button
              onClick={onCreate}
              className="min-h-11 gap-2 shrink-0"
              aria-label={`Criar playbook para ${stageLabel}`}
            >
              <PlusCircle className="h-4 w-4" aria-hidden="true" />
              Criar Playbook
            </Button>
          )}
        </div>

        <ol className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3" aria-label="Passos para começar">
          {steps.map((step, idx) => {
            const Icon = step.icon;
            return (
              <motion.li
                key={step.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 + idx * 0.08, duration: 0.35 }}
                className={cn(
                  "relative p-4 rounded-xl bg-background/40 border border-border/40",
                  "hover:border-primary/40 hover:bg-background/60 transition-colors"
                )}
              >
                <div className="flex items-start gap-3">
                  <div className="relative shrink-0">
                    <div className="p-2 rounded-lg bg-primary/10 text-primary">
                      <Icon className="h-4 w-4" aria-hidden="true" />
                    </div>
                    <span
                      className="absolute -top-1.5 -right-1.5 h-5 w-5 rounded-full bg-primary text-primary-foreground text-[10px] font-black flex items-center justify-center shadow"
                      aria-hidden="true"
                    >
                      {step.id}
                    </span>
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-semibold text-foreground leading-tight">
                      {step.title}
                    </p>
                    <p className="text-xs text-muted-foreground mt-1 leading-snug">
                      {step.description}
                    </p>
                  </div>
                </div>
              </motion.li>
            );
          })}
        </ol>
      </CardContent>
    </Card>
  );
});
