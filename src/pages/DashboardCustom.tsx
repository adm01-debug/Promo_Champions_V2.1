import { CustomizableDashboard } from "@/components/dashboard/CustomizableDashboard";
import { Helmet } from "react-helmet-async";

export default function DashboardCustom() {
  return (
    <>
      <Helmet>
        <title>Dashboard Personalizado | Sales Arena</title>
        <meta name="description" content="Monte seu próprio dashboard arrastando widgets personalizados" />
      </Helmet>
      <CustomizableDashboard />
    </>
  );
}
