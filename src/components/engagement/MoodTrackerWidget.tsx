import { useState, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import { Heart, Sparkles } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { format } from "date-fns";
import { toast } from "sonner";

const MOODS = [
  { emoji: "😡", label: "Péssimo", value: 1, color: "bg-destructive/20 hover:bg-destructive/30 border-destructive/30" },
  { emoji: "😟", label: "Ruim", value: 2, color: "bg-orange-500/20 hover:bg-orange-500/30 border-orange-500/30" },
  { emoji: "😐", label: "Neutro", value: 3, color: "bg-muted hover:bg-muted/80 border-border" },
  { emoji: "😊", label: "Bom", value: 4, color: "bg-primary/20 hover:bg-primary/30 border-primary/30" },
  { emoji: "🤩", label: "Excelente", value: 5, color: "bg-green-500/20 hover:bg-green-500/30 border-green-500/30" },
];

export function MoodTrackerWidget({ className }: { className?: string }) {
  const { salesperson } = useAuth();
  const queryClient = useQueryClient();
  const [selectedMood, setSelectedMood] = useState<number | null>(null);
  const [hasSubmitted, setHasSubmitted] = useState(false);

  const today = format(new Date(), "yyyy-MM-dd");

  const { data: todayMood } = useQuery({
    queryKey: ["mood-today", salesperson?.id, today],
    queryFn: async () => {
      if (!salesperson?.id) return null;
      const { data, error } = await supabase
        .from("mood_entries" as any)
        .select("mood_value")
        .eq("salesperson_id", salesperson.id)
        .eq("entry_date", today)
        .maybeSingle();
      if (error || !data) return null;
      return (data as any).mood_value as number;
    },
    enabled: !!salesperson?.id,
  });

  const submitMood = useMutation({
    mutationFn: async (moodValue: number) => {
      if (!salesperson?.id) throw new Error("Not authenticated");
      const { error } = await supabase.from("mood_entries" as any).upsert(
        { salesperson_id: salesperson.id, entry_date: today, mood_value: moodValue } as any,
        { onConflict: "salesperson_id,entry_date" }
      );
      if (error) throw error;
    },
    onSuccess: () => {
      setHasSubmitted(true);
      queryClient.invalidateQueries({ queryKey: ["mood-today"] });
      toast.success("Humor registrado! 💪");
    },
  });

  const currentMood = todayMood ?? selectedMood;
  const alreadySubmitted = todayMood !== null || hasSubmitted;

  const handleSelect = useCallback((value: number) => {
    if (alreadySubmitted) return;
    setSelectedMood(value);
    submitMood.mutate(value);
  }, [alreadySubmitted, submitMood]);

  return (
    <Card className={cn("overflow-hidden", className)}>
      <CardHeader className="pb-2">
        <CardTitle className="text-sm font-semibold flex items-center gap-2">
          <Heart className="h-4 w-4 text-primary" />
          Como você está hoje?
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="flex items-center justify-between gap-1.5" role="radiogroup" aria-label="Selecione seu humor de hoje">
          {MOODS.map((mood) => (
            <motion.button
              key={mood.value}
              whileHover={{ scale: alreadySubmitted ? 1 : 1.15 }}
              whileTap={{ scale: alreadySubmitted ? 1 : 0.9 }}
              onClick={() => handleSelect(mood.value)}
              disabled={alreadySubmitted}
              className={cn(
                "flex flex-col items-center gap-1 p-2 rounded-xl border transition-all flex-1",
                mood.color,
                currentMood === mood.value && "ring-2 ring-primary shadow-md scale-110",
                alreadySubmitted && currentMood !== mood.value && "opacity-40"
              )}
            >
              <span className="text-xl sm:text-2xl">{mood.emoji}</span>
              <span className="text-[10px] font-medium text-foreground/70">{mood.label}</span>
            </motion.button>
          ))}
        </div>

        <AnimatePresence>
          {alreadySubmitted && (
            <motion.div
              initial={{ opacity: 0, y: 5 }}
              animate={{ opacity: 1, y: 0 }}
              className="mt-3 text-center"
            >
              <p className="text-xs text-muted-foreground flex items-center justify-center gap-1">
                <Sparkles className="h-3 w-3 text-primary" />
                Registrado! Volte amanhã para novo check-in.
              </p>
            </motion.div>
          )}
        </AnimatePresence>
      </CardContent>
    </Card>
  );
}
