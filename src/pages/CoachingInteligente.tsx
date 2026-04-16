import { ProtectedRoute } from "@/components/auth/ProtectedRoute";
import { PageTransition } from "@/components/transitions/PageTransition";
import { CoachingIntelligenceHub } from "@/components/coaching/CoachingIntelligenceHub";

export default function CoachingInteligente() {
  return (
    <ProtectedRoute requireAdminOrManager>
      <PageTransition>
        <CoachingIntelligenceHub />
      </PageTransition>
    </ProtectedRoute>
  );
}
