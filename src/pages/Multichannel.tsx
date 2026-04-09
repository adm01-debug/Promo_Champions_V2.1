import { Helmet } from "react-helmet-async";
import { MultichannelDashboard } from "@/components/multichannel/MultichannelDashboard";
import { PageTransition } from "@/components/ui/page-transition";

export default function Multichannel() {
  return (
    <PageTransition>
    <>
      <Helmet>
        <title>Multichannel | Promo Champions</title>
        <meta name="description" content="Comunicação multicanal com clientes" />
      </Helmet>
      <MultichannelDashboard />
    </>
    </PageTransition>
  );
}
