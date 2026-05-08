import { useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";

const LAST_DASHBOARD_SECTION_KEY = "last_dashboard_section";

export const useDashboardRedirect = () => {
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    // Check if we are at exactly /dashboard or /dashboard/ or root /
    if (location.pathname === "/dashboard" || location.pathname === "/dashboard/" || location.pathname === "/") {
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
      // We don't necessarily need to save "visao-geral" as it's the default, 
      // but let's clear or save it for consistency.
      localStorage.removeItem(LAST_DASHBOARD_SECTION_KEY);
    }
  }, [location.pathname, navigate]);
};
