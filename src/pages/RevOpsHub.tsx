import { Helmet } from "react-helmet-async";
import { RevOpsHub } from "@/components/revops/RevOpsHub";

export default function RevOpsHubPage() {
  return (
    <>
      <Helmet>
        <title>Revenue Operations Hub | Promo Champions</title>
        <meta name="description" content="Cockpit executivo de Revenue Operations: pipeline, forecast ponderado, win rate, sales velocity e saúde comercial em tempo real." />
      </Helmet>
      <div className="container mx-auto py-6 px-4">
        <RevOpsHub />
      </div>
    </>
  );
}
