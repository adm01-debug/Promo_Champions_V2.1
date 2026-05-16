import { ReactNode, useRef } from "react";
import { Navigate, useLocation } from "react-router-dom";
import { useUserRoles, AppRole } from "@/hooks/useUserRoles";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { SmartSkeleton } from "@/components/skeletons/SmartSkeleton";

interface ProtectedRouteProps {
  children: ReactNode;
  requiredRole?: AppRole | AppRole[];
  requireAdminOrManager?: boolean;
  fallbackPath?: string;
}

export function ProtectedRoute({
  children,
  requiredRole,
  requireAdminOrManager = false,
  fallbackPath = "/acesso-negado",
}: ProtectedRouteProps) {
  const { user, isLoading: isAuthLoading } = useAuth();
  const { currentUserRole, isLoadingCurrentRole, isAdminOrManager } = useUserRoles();
  const location = useLocation();
  const hasLoggedRef = useRef(false);

  // Log access denied attempt
  const logAccessDenied = async (requiredRoleLabel: string) => {
    if (!user || hasLoggedRef.current) return;
    hasLoggedRef.current = true;
    
    try {
      await supabase.from("access_denied_logs").insert({
        user_id: user.id,
        user_email: user.email,
        attempted_path: location.pathname,
        user_role: currentUserRole?.role || "unknown",
        required_role: requiredRoleLabel,
        user_agent: navigator.userAgent,
      });
    } catch (error) {
      if (import.meta.env.DEV) {
        console.error("Failed to log access denied:", error);
      }
    }
  };

  // Show loading state while checking auth and roles
  if (isAuthLoading || isLoadingCurrentRole) {
    return <SmartSkeleton />;
  }

  // Redirect to auth if not logged in
  if (!user) {
    return <Navigate to="/auth" replace />;
  }

  // Check for admin or manager requirement
  if (requireAdminOrManager && !isAdminOrManager) {
    logAccessDenied("admin ou manager");
    return <Navigate to={fallbackPath} replace />;
  }

  // Check for specific role requirement
  if (requiredRole) {
    const roles = Array.isArray(requiredRole) ? requiredRole : [requiredRole];
    const hasRequiredRole = roles.some(role => currentUserRole?.role === role);
    
    if (!hasRequiredRole) {
      logAccessDenied(roles.join(" ou "));
      return <Navigate to={fallbackPath} replace />;
    }
  }

  return <>{children}</>;
}
