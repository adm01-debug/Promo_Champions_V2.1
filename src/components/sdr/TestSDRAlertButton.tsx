import { useState } from "react";
import { Button } from "@/components/ui/button";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { Bell, Loader2, CheckCircle2 } from "lucide-react";
import { useQueryClient } from "@tanstack/react-query";

export function TestSDRAlertButton() {
  const [isTesting, setIsTesting] = useState(false);
  const queryClient = useQueryClient();

  const handleTest = async () => {
    setIsTesting(true);
    try {
      const { data, error } = await supabase.functions.invoke("sdr-consecutive-alerts", {
        body: { triggered_by: "manual" },
      });

      if (error) throw error;

      if (data.count === 0) {
        toast.info("Nenhum SDR abaixo da meta por dias consecutivos", {
          description: "Todos os SDRs estão dentro das metas configuradas.",
        });
      } else {
        toast.success(`Alertas enviados para ${data.count} SDR(s)`, {
          description: data.sdrs?.join(", "),
        });
      }

      // Invalidate history to show new entry
      queryClient.invalidateQueries({ queryKey: ["sdr-alert-history"] });
    } catch (error: any) {
      toast.error("Erro ao testar alertas", {
        description: error.message,
      });
    } finally {
      setIsTesting(false);
    }
  };

  return (
    <Button
      variant="outline"
      size="sm"
      onClick={handleTest}
      disabled={isTesting}
      className="gap-2"
    >
      {isTesting ? (
        <>
          <Loader2 className="h-4 w-4 animate-spin" />
          Verificando...
        </>
      ) : (
        <>
          <Bell className="h-4 w-4" />
          Testar Alertas SDR
        </>
      )}
    </Button>
  );
}
