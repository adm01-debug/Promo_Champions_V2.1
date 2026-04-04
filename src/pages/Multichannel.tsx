import { Helmet } from "react-helmet-async";
import { MultichannelDashboard } from "@/components/multichannel/MultichannelDashboard";

export default function Multichannel() {
  return (
    <>
      <Helmet>
        <title>Multichannel | Promo Champions</title>
        <meta name="description" content="Comunicação multicanal com clientes" />
      </Helmet>
      <MultichannelDashboard />
    </>
  );
}
