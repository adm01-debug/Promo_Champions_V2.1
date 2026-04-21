import { useState } from "react";
import { Button } from "@/components/ui/button";
import { FileText, Loader2 } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import type { WinLossFilterState } from "./winLossFiltersHelpers";

interface Props {
  filters: WinLossFilterState;
}

export function ExportPdfButton({ filters }: Props) {
  const [loading, setLoading] = useState(false);

  const handle = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase.functions.invoke("export-winloss-pdf", { body: { filters } });
      if (error) throw error;
      const result = data as { url?: string; error?: string };
      if (result.error) throw new Error(result.error);
      if (result.url) {
        window.open(result.url, "_blank", "noopener,noreferrer");
        toast.success("Relatório PDF gerado");
      } else {
        toast.message("Relatório em fila — disponível em instantes");
      }
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Falha ao gerar PDF");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Button size="sm" variant="outline" onClick={handle} disabled={loading} aria-label="Exportar relatório PDF">
      {loading ? <Loader2 className="h-3.5 w-3.5 mr-1.5 animate-spin" /> : <FileText className="h-3.5 w-3.5 mr-1.5" />}
      PDF
    </Button>
  );
}
