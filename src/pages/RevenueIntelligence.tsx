import { Helmet } from "react-helmet-async";
import { RevenueIntelligenceHub } from "@/components/revenue-intelligence/RevenueIntelligenceHub";
import { PageTransition } from "@/components/transitions/PageTransition";

export default function RevenueIntelligence() {
  return (
    <PageTransition>
      <>
        <Helmet>
          <title>Revenue Intelligence | Promo Champions</title>
          <meta
            name="description"
            content="Forecast por categoria (Commit/Best Case/Pipeline), pipeline coverage, comitê de compra, inspeção e QBR automático com IA."
          />
        </Helmet>
        <div className="container mx-auto py-6 px-4">
          <RevenueIntelligenceHub />
        </div>
      </>
    </PageTransition>
  );
}
