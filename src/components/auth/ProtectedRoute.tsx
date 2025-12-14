import { ReactNode } from "react";
import { Navigate } from "react-router-dom";
import { useUserRoles, AppRole } from "@/hooks/useUserRoles";
import { useAuth } from "@/contexts/AuthContext";
import { Skeleton } from "@/components/ui/skeleton";

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
  fallbackPath = "/",
}: ProtectedRouteProps) {
  const { user, isLoading: isAuthLoading } = useAuth();
  const { currentUserRole, isLoadingCurrentRole, isAdmin, isAdminOrManager } = useUserRoles();

  // Show loading state while checking auth and roles
  if (isAuthLoading || isLoadingCurrentRole) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="space-y-4 w-full max-w-md p-8">
          <Skeleton className="h-8 w-3/4" />
          <Skeleton className="h-4 w-1/2" />
          <Skeleton className="h-32 w-full" />
        </div>
      </div>
    );
  }

  // Redirect to auth if not logged in
  if (!user) {
    return <Navigate to="/auth" replace />;
  }

  // Check for admin or manager requirement
  if (requireAdminOrManager && !isAdminOrManager) {
    return <Navigate to={fallbackPath} replace />;
  }

  // Check for specific role requirement
  if (requiredRole) {
    const roles = Array.isArray(requiredRole) ? requiredRole : [requiredRole];
    const hasRequiredRole = roles.some(role => currentUserRole?.role === role);
    
    if (!hasRequiredRole) {
      return <Navigate to={fallbackPath} replace />;
    }
  }

  return <>{children}</>;
}
