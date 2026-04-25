import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { updatePayload } from "@/lib/supabase/typed-payloads";
import { useEffect, useState } from "react";
import { Clock } from "lucide-react";

interface Settings {
  id: string;
  interval_minutes: number;
  failure_window_minutes: number;
  enabled: boolean;
}

function useAutotestSettings() {
  return useQuery({
    queryKey: ["integration-autotest-settings"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("integration_autotest_settings")
        .select("id, interval_minutes, failure_window_minutes, enabled")
        .limit(1)
        .maybeSingle();
      if (error) throw error;
      return data as Settings | null;
    },
  });
}

export function AutoTestIntervalCard() {
  const qc = useQueryClient();
  const { data } = useAutotestSettings();
  const [val, setVal] = useState(60);
  const [enabled, setEnabled] = useState(true);

  useEffect(() => {
    if (data) {
      setVal(data.interval_minutes);
      setEnabled(data.enabled);
    }
  }, [data]);

  const save = useMutation({
    mutationFn: async (next: { interval_minutes?: number; enabled?: boolean }) => {
      if (!data) return;
      const patch = updatePayload("integration_autotest_settings", next);
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
          <Clock className="h-4 w-4 text-primary" /> Intervalo de auto-teste
        </CardTitle>
        <CardDescription>De 5 a 1440 minutos.</CardDescription>
      </CardHeader>
      <CardContent className="space-y-3">
        <div className="flex items-center justify-between">
          <Label htmlFor="autotest-enabled" className="text-sm">Auto-teste ativo</Label>
          <Switch
            id="autotest-enabled"
            checked={enabled}
            onCheckedChange={(v) => { setEnabled(v); save.mutate({ enabled: v }); }}
          />
        </div>
        <div>
          <Label className="text-xs text-muted-foreground">Minutos</Label>
          <Input
            type="number"
            min={5}
            max={1440}
            value={val}
            onChange={(e) => setVal(Number(e.target.value))}
            onBlur={() => save.mutate({ interval_minutes: Math.min(1440, Math.max(5, val)) })}
          />
        </div>
      </CardContent>
    </Card>
  );
}
