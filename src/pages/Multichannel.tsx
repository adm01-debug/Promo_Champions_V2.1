import { Helmet } from "react-helmet-async";
import { MultichannelDashboard } from "@/components/multichannel/MultichannelDashboard";
import { SequenceSendsWidget } from "@/components/multichannel/SequenceSendsWidget";
import { ChannelCredentialsManager } from "@/components/multichannel/ChannelCredentialsManager";
import { PageTransition } from "@/components/transitions/PageTransition";

export default function Multichannel() {
  return (
    <PageTransition>
    <>
      <Helmet>
        <title>Multichannel | Promo Champions</title>
        <meta name="description" content="Comunicação multicanal com clientes" />
      </Helmet>
      <div className="space-y-6">
        <MultichannelDashboard />
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <SequenceSendsWidget />
          <ChannelCredentialsManager />
        </div>
      </div>
    </>
    </PageTransition>
  );
}
