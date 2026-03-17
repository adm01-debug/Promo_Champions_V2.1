import { EmailTrackingDashboard } from "@/components/email/EmailTrackingDashboard";
import { Helmet } from "react-helmet-async";

export default function EmailTracking() {
  return (
    <>
      <Helmet>
        <title>Rastreamento de Email | Sales Arena</title>
        <meta name="description" content="Acompanhe aberturas, cliques e respostas dos seus emails em tempo real" />
      </Helmet>
      <EmailTrackingDashboard />
    </>
  );
}
