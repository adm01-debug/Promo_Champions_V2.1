import { WeightedForecastDashboard } from "@/components/analytics/WeightedForecastDashboard";
import { Helmet } from "react-helmet-async";

export default function ForecastPonderado() {
  return (
    <>
      <Helmet>
        <title>Forecast Ponderado | Sales Arena</title>
        <meta name="description" content="Previsão de receita ponderada por probabilidade e estágio do pipeline" />
      </Helmet>
      <WeightedForecastDashboard />
    </>
  );
}
