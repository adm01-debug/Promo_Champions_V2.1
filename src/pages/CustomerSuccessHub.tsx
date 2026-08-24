import { ProtectedRoute } from "@/components/auth/ProtectedRoute";
import { PageTransition } from "@/components/transitions/PageTransition";
import { CustomerSuccessHub } from "@/components/customer-success/CustomerSuccessHub";

export default function CustomerSuccessHubPage() {
  return (
    <ProtectedRoute requireAdminOrManager>
      <PageTransition>
        <CustomerSuccessHub />
      </PageTransition>
    </ProtectedRoute>
  );
}
