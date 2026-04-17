import { useParams } from "react-router-dom";
import { Helmet } from "react-helmet-async";
import { useEmbeddedReportPreview } from "@/hooks/reporting/useEmbeddedReportPreview";
import { EmbeddedReportView } from "@/components/reporting/EmbeddedReportView";
import { Card } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { AlertCircle, Crown } from "lucide-react";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";

export default function EmbedReportPage() {
  const { token } = useParams<{ token: string }>();
  const { data, isLoading, error } = useEmbeddedReportPreview(token);

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <Helmet>
        <title>{data?.name ?? "Relatório embutido"}</title>
        <meta name="robots" content="noindex, nofollow" />
      </Helmet>

      <main className="flex-1 max-w-6xl w-full mx-auto p-4 sm:p-6 space-y-4">
        {isLoading && (
          <>
            <Skeleton className="h-8 w-64" />
            <Skeleton className="h-[400px] w-full" />
          </>
        )}

        {error && (
          <Card className="p-12 border-destructive/40 text-center">
            <AlertCircle className="h-10 w-10 mx-auto text-destructive mb-3" />
            <h2 className="font-display text-lg">Não foi possível carregar o relatório</h2>
            <p className="text-sm text-muted-foreground mt-1">
              {error instanceof Error ? error.message : "Erro desconhecido"}
            </p>
          </Card>
        )}

        {data && (
          <>
            <header>
              <h1 className="font-display text-2xl font-bold tracking-tight">{data.name}</h1>
              <p className="text-xs text-muted-foreground mt-1">
                Gerado em {format(new Date(data.generated_at), "dd/MM/yyyy 'às' HH:mm", { locale: ptBR })} · {data.rows.length} registros
              </p>
            </header>
            <EmbeddedReportView payload={data} />
          </>
        )}
      </main>

      <footer className="border-t border-border/40 py-3 px-6 flex items-center justify-center gap-2 text-xs text-muted-foreground">
        <span className="inline-flex h-5 w-5 items-center justify-center rounded bg-primary/10">
          <Crown className="h-3 w-3 text-primary" />
        </span>
        <span>Powered by <span className="font-medium text-foreground">Promo Champions</span></span>
      </footer>
    </div>
  );
}
