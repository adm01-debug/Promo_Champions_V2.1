import { PageTransition } from "@/components/transitions/PageTransition";
import IntelligenceCockpit from "@/components/intelligence/IntelligenceCockpit";
import { Helmet } from "react-helmet-async";

export default function Intelligence() {
  return (
    <>
      <Helmet>
        <title>Intelligence Cockpit | Promo Champions</title>
        <meta name="description" content="Central de comando unificada de inteligência de dados e IA." />
      </Helmet>
      <PageTransition>
        <div className="container mx-auto p-6">
          <IntelligenceCockpit />
        </div>
      </PageTransition>
    </>
  );
}
