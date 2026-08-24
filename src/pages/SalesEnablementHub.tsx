import { Helmet } from "react-helmet-async";
import { SalesEnablementHub } from "@/components/enablement/SalesEnablementHub";

const SalesEnablementHubPage = () => {
  return (
    <>
      <Helmet>
        <title>Sales Enablement Hub | Promo Champions</title>
        <meta name="description" content="Centralize materiais de venda, propostas, cases e treinamentos com tracking de uso." />
        <link rel="canonical" href="/sales-enablement" />
      </Helmet>
      <main className="container mx-auto p-4 md:p-6">
        <SalesEnablementHub />
      </main>
    </>
  );
};

export default SalesEnablementHubPage;
