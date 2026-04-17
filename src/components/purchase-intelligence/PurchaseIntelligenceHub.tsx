import { useState } from "react";
import { Helmet } from "react-helmet-async";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Brain, Flame, CalendarDays, Users } from "lucide-react";
import { ClientSelector } from "./ClientSelector";
import { PurchaseHeatmapGrid } from "./PurchaseHeatmapGrid";
import { PurchasePredictionCard } from "./PurchasePredictionCard";
import { SeasonalityHeatmap } from "./SeasonalityHeatmap";

export function PurchaseIntelligenceHub() {
  const [clientId, setClientId] = useState<string | undefined>();

  return (
    <div className="container mx-auto py-6 space-y-6">
      <Helmet>
        <title>Inteligência de Compras 360° | Promo Champions</title>
        <meta
          name="description"
          content="Mapa de calor temporal de compras + análise preditiva 360° por cliente: passado, presente e futuro."
        />
      </Helmet>

      <header className="space-y-1">
        <h1 className="text-page-title flex items-center gap-2">
          <Brain className="h-7 w-7 text-primary" />
          Inteligência de Compras 360°
        </h1>
        <p className="text-muted-foreground">
          Histórico real cruzado com IA preditiva — visualize padrões, sazonalidade e a janela ideal para cada cliente.
        </p>
      </header>

      <Tabs defaultValue="client" className="space-y-4">
        <TabsList>
          <TabsTrigger value="client" className="gap-1">
            <Users className="h-4 w-4" /> Visão por Cliente
          </TabsTrigger>
          <TabsTrigger value="global" className="gap-1">
            <Flame className="h-4 w-4" /> Heatmap Global
          </TabsTrigger>
          <TabsTrigger value="seasonality" className="gap-1">
            <CalendarDays className="h-4 w-4" /> Sazonalidade
          </TabsTrigger>
        </TabsList>

        <TabsContent value="client" className="space-y-4">
          <ClientSelector value={clientId} onChange={setClientId} />
          <div className="grid lg:grid-cols-2 gap-4">
            <PurchasePredictionCard clientId={clientId} />
            <PurchaseHeatmapGrid clientId={clientId} months={24} />
          </div>
        </TabsContent>

        <TabsContent value="global">
          <PurchaseHeatmapGrid months={18} />
        </TabsContent>

        <TabsContent value="seasonality">
          <SeasonalityHeatmap />
        </TabsContent>
      </Tabs>
    </div>
  );
}
