import { EmailTrackingDashboard } from "@/components/email/EmailTrackingDashboard";
import { Helmet } from "react-helmet-async";
import { PageTransition } from "@/components/transitions/PageTransition";

export default function EmailTracking() {
  return (
    <>
      <Helmet>
        <title>Rastreamento de Email | PROMO CHAMPIONS</title>
        <meta name="description" content="Acompanhe aberturas, cliques e respostas dos seus emails em tempo real" />
      </Helmet>
      <PageTransition>
        <EmailTrackingDashboard />
      </PageTransition>
    </>
  );
}
