import { ProtectedRoute } from "@/components/auth/ProtectedRoute";
import { PageTransition } from "@/components/transitions/PageTransition";
import { CustomerSuccess360Hub } from "@/components/customer-success/CustomerSuccess360Hub";

export default function CustomerSuccess360Page() {
  return (
    <ProtectedRoute requireAdminOrManager>
      <PageTransition>
        <CustomerSuccess360Hub />
      </PageTransition>
    </ProtectedRoute>
  );
}
