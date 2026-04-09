import { WeightedForecastDashboard } from "@/components/analytics/WeightedForecastDashboard";
import { Helmet } from "react-helmet-async";
import { PageTransition } from "@/components/transitions/PageTransition";

export default function ForecastPonderado() {
  return (
    <PageTransition>
    <>
      <Helmet>
        <title>Forecast Ponderado | PROMO CHAMPIONS</title>
        <meta name="description" content="Previsão de receita ponderada por probabilidade e estágio do pipeline" />
      </Helmet>
      <WeightedForecastDashboard />
    </>
    </PageTransition>
  );
}
