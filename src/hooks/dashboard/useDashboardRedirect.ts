import { useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { useUserRoles } from "@/hooks/useUserRoles";

const LAST_DASHBOARD_SECTION_KEY = "last_dashboard_section";

export const useDashboardRedirect = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { salesperson } = useAuth();
  const { isAdminOrManager } = useUserRoles();

  useEffect(() => {
    // Determine the optimal landing page based on role if at root/dashboard
    if (location.pathname === "/dashboard" || location.pathname === "/dashboard/" || location.pathname === "/") {
      
      // If it's a salesperson (SDR or Closer), send them to their dedicated dashboard
      if (!isAdminOrManager && salesperson) {
        if (salesperson.role === 'sdr') {
          navigate("/sdr", { replace: true });
          return;
        } else if (salesperson.role === 'closer' || salesperson.role === 'hybrid') {
          navigate("/closer", { replace: true });
          return;
        }
      }

      // Default logic for managers/admins or unknown roles
      const lastSection = localStorage.getItem(LAST_DASHBOARD_SECTION_KEY);
      
      if (lastSection) {
        navigate(`/dashboard/${lastSection}`, { replace: true });
      } else {
        navigate("/dashboard/visao-geral", { replace: true });
      }
    }
    
    // If we are in a valid section, save it
    const match = location.pathname.match(/^\/dashboard\/([^/]+)$/);
    if (match && match[1] && match[1] !== "visao-geral") {
      localStorage.setItem(LAST_DASHBOARD_SECTION_KEY, match[1]);
    } else if (match && match[1] === "visao-geral") {
      localStorage.removeItem(LAST_DASHBOARD_SECTION_KEY);
    }
  }, [location.pathname, navigate, salesperson, isAdminOrManager]);
};
