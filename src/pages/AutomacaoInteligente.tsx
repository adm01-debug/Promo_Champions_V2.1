import { ProtectedRoute } from "@/components/auth/ProtectedRoute";
import { PageTransition } from "@/components/transitions/PageTransition";
import { AutomationIntelligenceHub } from "@/components/automation/AutomationIntelligenceHub";

export default function AutomacaoInteligente() {
  return (
    <ProtectedRoute requireAdminOrManager>
      <PageTransition>
        <AutomationIntelligenceHub />
      </PageTransition>
    </ProtectedRoute>
  );
}
