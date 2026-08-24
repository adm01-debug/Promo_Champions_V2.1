import { CustomizableDashboard } from "@/components/dashboard/CustomizableDashboard";
import { Helmet } from "react-helmet-async";
import { PageTransition } from "@/components/transitions/PageTransition";

export default function DashboardCustom() {
  return (
    <>
      <Helmet>
        <title>Dashboard Personalizado | PROMO CHAMPIONS</title>
        <meta name="description" content="Monte seu próprio dashboard arrastando widgets personalizados" />
      </Helmet>
      <PageTransition>
        <CustomizableDashboard />
      </PageTransition>
    </>
  );
}
