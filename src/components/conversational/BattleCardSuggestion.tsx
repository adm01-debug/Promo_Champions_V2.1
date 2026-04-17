import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Shield, ExternalLink, Copy } from "lucide-react";
import { toast } from "sonner";

interface Props {
  battleCardId: string;
  competitorName: string;
}

interface AssetSummary {
  id: string;
  title: string;
  description: string | null;
  content: string | null;
  url: string | null;
}

export function BattleCardSuggestion({ battleCardId, competitorName }: Props) {
  const { data: asset, isLoading } = useQuery({
    queryKey: ["sales-enablement-asset", battleCardId],
    queryFn: async (): Promise<AssetSummary | null> => {
      const { data, error } = await supabase
        .from("sales_enablement_assets")
        .select("id, title, description, content, url")
        .eq("id", battleCardId)
        .maybeSingle();
      if (error) throw error;
      return (data as AssetSummary) ?? null;
    },
  });

  if (isLoading || !asset) return null;

  const copyTalkingPoints = async () => {
    const text = asset.content ?? asset.description ?? asset.title;
    await navigator.clipboard.writeText(text);
    toast.success("Talking points copiados");
  };

  return (
    <Card className="p-3 bg-primary/5 border-primary/20 space-y-2">
      <div className="flex items-start gap-2">
        <Shield className="h-4 w-4 text-primary shrink-0 mt-0.5" />
        <div className="flex-1 min-w-0">
          <p className="text-xs font-semibold text-primary">
            Battle Card sugerido vs {competitorName}
          </p>
          <p className="text-sm font-medium truncate">{asset.title}</p>
          {asset.description && (
            <p className="text-xs text-muted-foreground line-clamp-2 mt-1">
              {asset.description}
            </p>
          )}
        </div>
      </div>
      <div className="flex gap-2">
        <Button size="sm" variant="outline" onClick={copyTalkingPoints} className="h-7 text-xs">
          <Copy className="h-3 w-3 mr-1" />
          Copiar
        </Button>
        {asset.url && (
          <Button size="sm" variant="outline" asChild className="h-7 text-xs">
            <a href={asset.url} target="_blank" rel="noopener noreferrer">
              <ExternalLink className="h-3 w-3 mr-1" />
              Abrir
            </a>
          </Button>
        )}
      </div>
    </Card>
  );
}
