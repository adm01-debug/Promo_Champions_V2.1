import { Helmet } from "react-helmet-async";
import { TerritoryOptimizationHub } from "@/components/territory-optimization/TerritoryOptimizationHub";

const TerritoryOptimizationHubPage = () => {
  return (
    <>
      <Helmet>
        <title>Territory Optimization | Promo Champions</title>
        <meta
          name="description"
          content="IA para otimização de territórios: cobertura, balanceamento de carteiras e recomendações de realocação."
        />
        <link rel="canonical" href="/territory-optimization" />
      </Helmet>
      <main className="container mx-auto p-4 md:p-6">
        <TerritoryOptimizationHub />
      </main>
    </>
  );
};

export default TerritoryOptimizationHubPage;
