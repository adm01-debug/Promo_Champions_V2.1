import React from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Shield, Check, X } from "lucide-react";
import { AppRole } from "@/hooks/useUserRoles";
import { roleConfig, resourceLabels, actionLabels } from "./PermissionRoleCards";

interface Permission {
  id: string;
  name: string;
  description: string;
  resource: string;
  action: string;
}

interface PermissionComparisonTableProps {
  roles: AppRole[];
  groupedPermissions: Record<string, Permission[]>;
  hasRolePermission: (role: AppRole, permissionId: string) => boolean;
}

export const PermissionComparisonTable = React.memo(function PermissionComparisonTable({
  roles,
  groupedPermissions,
  hasRolePermission,
}: PermissionComparisonTableProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Shield className="h-5 w-5" />
          Visão Comparativa
        </CardTitle>
        <CardDescription>Compare permissões entre todas as roles</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="overflow-x-auto">
          <table className="w-full border-collapse text-sm">
            <thead>
              <tr className="border-b">
                <th className="text-left py-3 px-4 font-medium">Permissão</th>
                {roles.map((role) => (
                  <th key={role} className="text-center py-3 px-4">
                    <Badge className={roleConfig[role].color}>
                      {roleConfig[role].icon}
                      <span className="ml-1">{roleConfig[role].label}</span>
                    </Badge>
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {Object.entries(groupedPermissions).map(([resource, perms]) => (
                <React.Fragment key={resource}>
                  <tr className="bg-muted/50">
                    <td colSpan={4} className="py-2 px-4 font-semibold">
                      {resourceLabels[resource] || resource}
                    </td>
                  </tr>
                  {perms.map((perm) => (
                    <tr key={perm.id} className="border-b hover:bg-muted/30 transition-colors">
                      <td className="py-2 px-4">
                        <span className="font-medium">{actionLabels[perm.action] || perm.action}</span>
                      </td>
                      {roles.map((role) => {
                        const hasPerm = hasRolePermission(role, perm.id);
                        return (
                          <td key={role} className="text-center py-2 px-4">
                            {hasPerm ? (
                              <Check className="h-4 w-4 text-success mx-auto" />
                            ) : (
                              <X className="h-4 w-4 text-muted-foreground mx-auto" />
                            )}
                          </td>
                        );
                      })}
                    </tr>
                  ))}
                </React.Fragment>
              ))}
            </tbody>
          </table>
        </div>
      </CardContent>
    </Card>
  );
});
