import { Helmet } from "react-helmet-async";
import { RevenueForecastHub } from "@/components/forecast/RevenueForecastHub";
import { PageTransition } from "@/components/transitions/PageTransition";

export default function RevenueForecast() {
  return (
    <PageTransition>
      <>
        <Helmet>
          <title>Revenue Forecast | Promo Champions</title>
          <meta
            name="description"
            content="Projeção de receita 30/60/90 dias com cenários pessimista, realista e otimista, ciclo médio, gap vs meta e insights de IA."
          />
        </Helmet>
        <div className="container mx-auto py-6 px-4">
          <RevenueForecastHub />
        </div>
      </>
    </PageTransition>
  );
}
