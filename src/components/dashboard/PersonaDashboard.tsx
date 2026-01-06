import { FC } from "react";
import { motion } from "framer-motion";
import { useAuth } from "@/contexts/AuthContext";
import { SDRDashboard } from "./persona/SDRDashboard";
import { CloserDashboard } from "./persona/CloserDashboard";
import { GestorDashboard } from "./persona/GestorDashboard";
import { containerVariants } from "@/components/transitions/PageTransition";

export type PersonaType = "sdr" | "closer" | "gestao" | "hybrid";

interface PersonaDashboardProps {
  className?: string;
}

export const PersonaDashboard: FC<PersonaDashboardProps> = ({ className }) => {
  const { salesperson } = useAuth();
  const role = (salesperson?.role as PersonaType) || "hybrid";

  const renderDashboard = () => {
    switch (role) {
      case "sdr":
        return <SDRDashboard />;
      case "closer":
        return <CloserDashboard />;
      case "gestao":
        return <GestorDashboard />;
      case "hybrid":
      default:
        // Hybrid sees a combination - default to Closer view with SDR elements
        return <CloserDashboard showSDRMetrics />;
    }
  };

  return (
    <motion.div
      className={className}
      variants={containerVariants}
      initial="hidden"
      animate="visible"
    >
      {renderDashboard()}
    </motion.div>
  );
};
