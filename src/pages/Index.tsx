import { DashboardHeader } from "@/components/dashboard/DashboardHeader";
import { PersonaDashboard } from "@/components/dashboard/PersonaDashboard";
import { useDashboardKPIs } from "@/hooks/useDashboardKPIs";
import { useSalesRealtime } from "@/hooks/useSalesRealtime";
import { useAuth } from "@/contexts/AuthContext";
import { DashboardLoadingSkeleton } from "@/components/skeletons/PageLoadingSkeleton";
import { SkeletonTransition } from "@/components/skeletons/SkeletonTransition";
import { motion } from "framer-motion";
import { PageTransition } from "@/components/transitions/PageTransition";

const Index = () => {
  const { data: kpis, isLoading } = useDashboardKPIs();
  const { salesperson } = useAuth();
  
  // Subscribe to real-time sales notifications (segmented by role)
  useSalesRealtime(salesperson?.id, salesperson?.role as "sdr" | "closer" | "hybrid" | undefined);

  return (
    <SkeletonTransition
      isLoading={isLoading}
      skeleton={<DashboardLoadingSkeleton />}
      duration={400}
    >
      <PageTransition>
        <div className="min-h-screen bg-background" suppressHydrationWarning>
          {/* Mobile-optimized padding */}
          <div className="max-w-[1600px] mx-auto px-3 py-4 sm:px-4 sm:py-6 lg:px-8 lg:py-8 space-y-4 sm:space-y-6 lg:space-y-8">
            {/* Header */}
            <motion.div
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, ease: [0.4, 0, 0.2, 1] }}
            >
              <DashboardHeader />
            </motion.div>

            {/* Persona-based Dashboard */}
            <PersonaDashboard />
          </div>
        </div>
      </PageTransition>
    </SkeletonTransition>
  );
};

export default Index;
