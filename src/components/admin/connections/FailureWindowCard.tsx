import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { updatePayload } from "@/lib/supabase/typed-payloads";
import { useEffect, useState } from "react";
import { AlertTriangle } from "lucide-react";

interface Settings { id: string; failure_window_minutes: number; }

export function FailureWindowCard() {
  const qc = useQueryClient();
  const { data } = useQuery({
    queryKey: ["integration-autotest-settings"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("integration_autotest_settings")
        .select("id, failure_window_minutes")
        .limit(1)
        .maybeSingle();
      if (error) throw error;
      return data as Settings | null;
    },
  });
  const [val, setVal] = useState(15);
  useEffect(() => { if (data) setVal(data.failure_window_minutes); }, [data]);

  const save = useMutation({
    mutationFn: async (failure_window_minutes: number) => {
      if (!data) return;
      const patch = updatePayload("integration_autotest_settings", { failure_window_minutes });
      const { error } = await supabase
        .from("integration_autotest_settings")
        .update(patch)
        .eq("id", data.id);
      if (error) throw error;
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["integration-autotest-settings"] }),
  });

  return (
    <Card className="glass border-border/40">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 font-display text-base">
          <AlertTriangle className="h-4 w-4 text-warning" /> Janela de falha
        </CardTitle>
        <CardDescription>Tempo (min) tolerado antes de marcar como degradado.</CardDescription>
      </CardHeader>
      <CardContent>
        <Label className="text-xs text-muted-foreground">Minutos</Label>
        <Input
          type="number"
          min={1}
          max={240}
          value={val}
          onChange={(e) => setVal(Number(e.target.value))}
          onBlur={() => save.mutate(Math.min(240, Math.max(1, val)))}
        />
      </CardContent>
    </Card>
  );
}
