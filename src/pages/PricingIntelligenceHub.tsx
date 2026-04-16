import { Helmet } from "react-helmet-async";
import { PricingIntelligenceHub } from "@/components/pricing/PricingIntelligenceHub";

const PricingIntelligenceHubPage = () => {
  return (
    <>
      <Helmet>
        <title>Pricing Intelligence | Promo Champions</title>
        <meta
          name="description"
          content="Análise de descontos, margem e elasticidade de preços com recomendações de IA para proteger receita."
        />
        <link rel="canonical" href="/pricing-intelligence" />
      </Helmet>
      <main className="container mx-auto p-4 md:p-6">
        <PricingIntelligenceHub />
      </main>
    </>
  );
};

export default PricingIntelligenceHubPage;
