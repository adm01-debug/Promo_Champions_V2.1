import { Button } from "@/components/ui/button";
import { RefreshCw } from "lucide-react";
import { useQueryClient } from "@tanstack/react-query";
import { useState } from "react";
import { toast } from "sonner";

interface Props {
  onRefreshed?: () => void;
}

export function GlobalRefreshFromDbButton({ onRefreshed }: Props) {
  const qc = useQueryClient();
  const [loading, setLoading] = useState(false);

  const handle = async () => {
    setLoading(true);
    try {
      await Promise.all([
        qc.invalidateQueries({ queryKey: ["integration-connections"] }),
        qc.invalidateQueries({ queryKey: ["integration-health"] }),
        qc.invalidateQueries({ queryKey: ["webhooks"] }),
        qc.invalidateQueries({ queryKey: ["bitrix24-status"] }),
      ]);
      onRefreshed?.();
      toast.success("Atualizado a partir do banco");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Button variant="outline" size="sm" onClick={handle} disabled={loading} className="gap-2">
      <RefreshCw className={`h-4 w-4 ${loading ? "animate-spin" : ""}`} />
      Atualizar do banco
    </Button>
  );
}
