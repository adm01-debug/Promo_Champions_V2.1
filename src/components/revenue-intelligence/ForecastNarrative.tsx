import { FC, useState } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Sparkles, RefreshCw, AlertCircle } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useMutation } from "@tanstack/react-query";
import { toast } from "sonner";
import { motion, AnimatePresence } from "framer-motion";

interface Props {
  forecastId: string | undefined;
  cachedNarrative?: string | null;
}

interface NarrativeResponse {
  narrative: string;
  generated_at: string;
}

export const ForecastNarrative: FC<Props> = ({ forecastId, cachedNarrative }) => {
  const [narrative, setNarrative] = useState<string | null>(cachedNarrative ?? null);

  const gen = useMutation({
    mutationFn: async (): Promise<NarrativeResponse> => {
      if (!forecastId) throw new Error("Forecast ainda não calculado");
      const { data, error } = await supabase.functions.invoke<NarrativeResponse>(
        "forecast-narrative",
        { body: { forecast_id: forecastId } },
      );
      if (error) throw error;
      if (!data?.narrative) throw new Error("Resposta vazia da IA");
      return data;
    },
    onSuccess: (data) => {
      setNarrative(data.narrative);
      toast.success("Narrativa gerada");
    },
    onError: (err: Error) => {
      toast.error(err.message || "Falha ao gerar narrativa");
    },
  });

  const isDisabled = !forecastId || gen.isPending;

  return (
    <Card className="glass border-border/40 p-4 space-y-3">
      <div className="flex items-center justify-between gap-3">
        <div className="flex items-center gap-2">
          <Sparkles className="h-4 w-4 text-primary" />
          <h3 className="text-sm font-semibold text-foreground">Narrativa executiva</h3>
        </div>
        <Button
          size="sm"
          variant={narrative ? "outline" : "default"}
          onClick={() => gen.mutate()}
          disabled={isDisabled}
          aria-label={narrative ? "Regenerar narrativa" : "Gerar narrativa"}
        >
          <RefreshCw className={`h-3.5 w-3.5 mr-2 ${gen.isPending ? "animate-spin" : ""}`} />
          {narrative ? "Regenerar" : "Explicar forecast"}
        </Button>
      </div>

      <AnimatePresence mode="wait">
        {gen.isPending ? (
          <motion.div
            key="loading"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="space-y-2"
          >
            <Skeleton className="h-3 w-full" />
            <Skeleton className="h-3 w-11/12" />
            <Skeleton className="h-3 w-4/5" />
            <Skeleton className="h-3 w-3/4" />
          </motion.div>
        ) : narrative ? (
          <motion.div
            key="content"
            initial={{ opacity: 0, y: 6 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            className="text-sm text-muted-foreground leading-relaxed whitespace-pre-line"
          >
            {narrative}
          </motion.div>
        ) : (
          <motion.div
            key="empty"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="flex items-start gap-2 text-xs text-muted-foreground"
          >
            <AlertCircle className="h-3.5 w-3.5 mt-0.5 flex-shrink-0" />
            <span>
              Clique em <strong className="text-foreground">Explicar forecast</strong> para uma leitura
              executiva em português com drivers, riscos e recomendação acionável.
            </span>
          </motion.div>
        )}
      </AnimatePresence>
    </Card>
  );
};
