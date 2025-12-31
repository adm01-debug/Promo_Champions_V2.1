import { ReactNode } from "react";
import { usePermissions, PermissionCheck } from "@/hooks/usePermissions";
import { Skeleton } from "@/components/ui/skeleton";

interface PermissionGateProps {
  children: ReactNode;
  /** Single permission check */
  permission?: PermissionCheck;
  /** Multiple permissions - user needs ANY of these */
  anyOf?: PermissionCheck[];
  /** Multiple permissions - user needs ALL of these */
  allOf?: PermissionCheck[];
  /** Content to show if user lacks permission */
  fallback?: ReactNode;
  /** Show loading skeleton while checking permissions */
  showLoading?: boolean;
}

export function PermissionGate({
  children,
  permission,
  anyOf,
  allOf,
  fallback = null,
  showLoading = false,
}: PermissionGateProps) {
  const { hasPermission, hasAnyPermission, hasAllPermissions, isLoading } = usePermissions();

  if (isLoading) {
    if (showLoading) {
      return <Skeleton className="h-8 w-24" />;
    }
    return null;
  }

  let hasAccess = false;

  if (permission) {
    hasAccess = hasPermission(permission.resource, permission.action);
  } else if (anyOf && anyOf.length > 0) {
    hasAccess = hasAnyPermission(anyOf);
  } else if (allOf && allOf.length > 0) {
    hasAccess = hasAllPermissions(allOf);
  } else {
    // No permission requirements specified, grant access
    hasAccess = true;
  }

  if (!hasAccess) {
    return <>{fallback}</>;
  }

  return <>{children}</>;
}

// HOC version for wrapping components
export function withPermission<P extends object>(
  WrappedComponent: React.ComponentType<P>,
  permission: PermissionCheck
) {
  return function WithPermissionComponent(props: P) {
    return (
      <PermissionGate permission={permission}>
        <WrappedComponent {...props} />
      </PermissionGate>
    );
  };
}
