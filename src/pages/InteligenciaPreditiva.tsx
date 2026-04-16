import { PageTransition } from "@/components/transitions/PageTransition";
import { PredictiveIntelligenceDashboard } from "@/components/predictive/PredictiveIntelligenceDashboard";

export default function InteligenciaPreditiva() {
  return (
    <PageTransition>
      <PredictiveIntelligenceDashboard />
    </PageTransition>
  );
}
