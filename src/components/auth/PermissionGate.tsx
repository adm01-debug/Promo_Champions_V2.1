import { ReactNode } from "react";
import { usePermissions } from "@/hooks/usePermissions";
import { Skeleton } from "@/components/ui/skeleton";

export interface PermissionCheck {
  resource: string;
  action: 'read' | 'write' | 'delete';
}

interface PermissionGateProps {
  children: ReactNode;
  permission?: PermissionCheck;
  anyOf?: PermissionCheck[];
  allOf?: PermissionCheck[];
  fallback?: ReactNode;
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
  const { canAccess, hasAnyPermission, hasAllPermissions, isLoading } = usePermissions();

  if (isLoading) {
    if (showLoading) {
      return <Skeleton className="h-8 w-24" />;
    }
    return null;
  }

  let hasAccess = false;

  if (permission) {
    hasAccess = canAccess(permission.resource, permission.action);
  } else if (anyOf && anyOf.length > 0) {
    hasAccess = hasAnyPermission(anyOf.map(p => `${p.resource}:${p.action}`));
  } else if (allOf && allOf.length > 0) {
    hasAccess = hasAllPermissions(allOf.map(p => `${p.resource}:${p.action}`));
  } else {
    hasAccess = true;
  }

  if (!hasAccess) {
    return <>{fallback}</>;
  }

  return <>{children}</>;
}

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
