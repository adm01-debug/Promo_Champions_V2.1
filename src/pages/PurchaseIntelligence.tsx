import { PageTransition } from "@/components/transitions/PageTransition";
import { PurchaseIntelligenceHub } from "@/components/purchase-intelligence/PurchaseIntelligenceHub";

export default function PurchaseIntelligence() {
  return (
    <PageTransition>
      <PurchaseIntelligenceHub />
    </PageTransition>
  );
}
