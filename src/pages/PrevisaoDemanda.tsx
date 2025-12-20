import { Helmet } from "react-helmet-async";
import { DemandForecastDashboard } from "@/components/analytics/DemandForecastDashboard";

export default function PrevisaoDemanda() {
  return (
    <>
      <Helmet>
        <title>Previsão de Demanda | SalesPro</title>
        <meta name="description" content="Análise preditiva de demanda de produtos e gestão de estoque" />
      </Helmet>
      <div className="min-h-screen bg-background">
        <div className="max-w-[1600px] mx-auto p-6 lg:p-8">
          <DemandForecastDashboard />
        </div>
      </div>
    </>
  );
}
