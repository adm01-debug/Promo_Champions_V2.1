import { useState, useMemo, useCallback } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import Fuse from "fuse.js";
import { supabase } from "@/integrations/supabase/client";
import { useUserRoles, AppRole } from "@/hooks/useUserRoles";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { Skeleton } from "@/components/ui/skeleton";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";
import { Shield, Search, CheckCircle2, XCircle, ToggleLeft, ToggleRight } from "lucide-react";
import { PermissionRoleCards, roleConfig, resourceLabels, actionLabels } from "./PermissionRoleCards";
import { PermissionComparisonTable } from "./PermissionComparisonTable";

interface Permission {
  id: string;
  name: string;
  description: string;
  resource: string;
  action: string;
}

interface RolePermission {
  id: string;
  role: AppRole;
  permission_id: string;
}

export function PermissionMatrix() {
  const { isAdmin } = useUserRoles();
  const queryClient = useQueryClient();
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedRole, setSelectedRole] = useState<AppRole>("admin");

  const { data: permissions, isLoading: loadingPermissions } = useQuery({
    queryKey: ["all-permissions"],
    queryFn: async () => {
      const { data, error } = await supabase.from("permissions").select("*").order("resource", { ascending: true });
      if (error) throw error;
      return data as Permission[];
    },
  });

  const { data: rolePermissions, isLoading: loadingRolePermissions } = useQuery({
    queryKey: ["all-role-permissions"],
    queryFn: async () => {
      const { data, error } = await supabase.from("role_permissions").select("*");
      if (error) throw error;
      return data as RolePermission[];
    },
  });

  const togglePermissionMutation = useMutation({
    mutationFn: async ({ role, permissionId, hasPermission }: { role: AppRole; permissionId: string; hasPermission: boolean }) => {
      if (hasPermission) {
        const { error } = await supabase.from("role_permissions").delete().eq("role", role).eq("permission_id", permissionId);
        if (error) throw error;
      } else {
        const { error } = await supabase.from("role_permissions").insert({ role, permission_id: permissionId });
        if (error) throw error;
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["all-role-permissions"] });
      queryClient.invalidateQueries({ queryKey: ["user-permissions"] });
      toast.success("Permissão atualizada");
    },
    onError: (error) => {
      console.error("Error toggling permission:", error);
      toast.error("Erro ao atualizar permissão");
    },
  });

  const bulkToggleMutation = useMutation({
    mutationFn: async ({ role, resource, enable }: { role: AppRole; resource: string; enable: boolean }) => {
      const resourcePerms = permissions?.filter(p => p.resource === resource) ?? [];
      for (const perm of resourcePerms) {
        const hasPerm = hasRolePermission(role, perm.id);
        if (enable && !hasPerm) {
          const { error } = await supabase.from("role_permissions").insert({ role, permission_id: perm.id });
          if (error) throw error;
        } else if (!enable && hasPerm) {
          const { error } = await supabase.from("role_permissions").delete().eq("role", role).eq("permission_id", perm.id);
          if (error) throw error;
        }
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["all-role-permissions"] });
      queryClient.invalidateQueries({ queryKey: ["user-permissions"] });
      toast.success("Permissões atualizadas");
    },
    onError: (error) => {
      console.error("Error bulk toggling:", error);
      toast.error("Erro ao atualizar permissões");
    },
  });

  const hasRolePermission = useCallback((role: AppRole, permissionId: string): boolean => {
    return rolePermissions?.some((rp) => rp.role === role && rp.permission_id === permissionId) ?? false;
  }, [rolePermissions]);

  const getPermissionStats = useCallback((role: AppRole) => {
    const total = permissions?.length ?? 0;
    const granted = permissions?.filter(p => hasRolePermission(role, p.id)).length ?? 0;
    return { total, granted, percentage: total > 0 ? Math.round((granted / total) * 100) : 0 };
  }, [permissions, hasRolePermission]);

  const getResourcePermissionCount = (role: AppRole, resource: string) => {
    const resourcePerms = permissions?.filter(p => p.resource === resource) ?? [];
    const granted = resourcePerms.filter(p => hasRolePermission(role, p.id)).length;
    return { total: resourcePerms.length, granted };
  };

  const fuse = useMemo(() => {
    if (!permissions || permissions.length === 0) return null;
    return new Fuse(permissions, { keys: ["name", "description", "resource", "action"], threshold: 0.4, ignoreLocation: true, minMatchCharLength: 1 });
  }, [permissions]);

  const filteredPermissions = useMemo(() => {
    if (!permissions) return [];
    if (!searchTerm.trim()) return permissions;
    if (!fuse) return permissions;
    return fuse.search(searchTerm).map(result => result.item);
  }, [permissions, fuse, searchTerm]);

  const groupedPermissions = filteredPermissions?.reduce((acc, perm) => {
    if (!acc[perm.resource]) acc[perm.resource] = [];
    acc[perm.resource].push(perm);
    return acc;
  }, {} as Record<string, Permission[]>) ?? {};

  if (loadingPermissions || loadingRolePermissions) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-32 w-full" />
        <Skeleton className="h-64 w-full" />
      </div>
    );
  }

  const roles: AppRole[] = ["admin", "manager", "salesperson"];

  return (
    <div className="space-y-6">
      <PermissionRoleCards roles={roles} selectedRole={selectedRole} onSelectRole={setSelectedRole} getPermissionStats={getPermissionStats} />

      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Shield className="h-5 w-5 text-primary" />
              <div>
                <CardTitle>Permissões: {roleConfig[selectedRole].label}</CardTitle>
                <CardDescription>Gerencie as permissões para a role selecionada</CardDescription>
              </div>
            </div>
            <Badge className={roleConfig[selectedRole].color}>
              {roleConfig[selectedRole].icon}
              <span className="ml-1">{roleConfig[selectedRole].label}</span>
            </Badge>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input placeholder="Buscar permissões..." value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} className="pl-10" />
          </div>

          <div className="space-y-4">
            {Object.entries(groupedPermissions).map(([resource, perms]) => {
              const { total, granted } = getResourcePermissionCount(selectedRole, resource);
              const allEnabled = granted === total;

              return (
                <Card key={resource} className="border">
                  <CardHeader className="py-3 px-4 bg-muted/30">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <h4 className="font-semibold">{resourceLabels[resource] || resource}</h4>
                        <Badge variant="outline" className="text-xs">{granted}/{total} ativas</Badge>
                      </div>
                      {isAdmin && (
                        <div className="flex items-center gap-2">
                          <Button variant="ghost" size="sm" onClick={() => bulkToggleMutation.mutate({ role: selectedRole, resource, enable: true })} disabled={allEnabled || bulkToggleMutation.isPending} className="text-xs">
                            <ToggleRight className="h-3 w-3 mr-1" />Ativar Todas
                          </Button>
                          <Button variant="ghost" size="sm" onClick={() => bulkToggleMutation.mutate({ role: selectedRole, resource, enable: false })} disabled={granted === 0 || bulkToggleMutation.isPending} className="text-xs">
                            <ToggleLeft className="h-3 w-3 mr-1" />Desativar Todas
                          </Button>
                        </div>
                      )}
                    </div>
                  </CardHeader>
                  <CardContent className="py-2 px-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-2">
                      {perms.map((perm) => {
                        const hasPerm = hasRolePermission(selectedRole, perm.id);
                        const isDisabled = !isAdmin || (selectedRole === "admin" && perm.name === "manage_roles");

                        return (
                          <div key={perm.id} className={`flex items-center gap-3 p-3 rounded-lg border transition-colors ${hasPerm ? "bg-success/10 dark:bg-success/10/20 border-success/30 dark:border-success/30" : "bg-background border-border"}`}>
                            {isAdmin ? (
                              <Checkbox id={perm.id} checked={hasPerm} disabled={isDisabled || togglePermissionMutation.isPending} onCheckedChange={() => { if (!isDisabled) togglePermissionMutation.mutate({ role: selectedRole, permissionId: perm.id, hasPermission: hasPerm }); }} />
                            ) : hasPerm ? (
                              <CheckCircle2 className="h-4 w-4 text-success shrink-0" />
                            ) : (
                              <XCircle className="h-4 w-4 text-muted-foreground shrink-0" />
                            )}
                            <label htmlFor={perm.id} className="flex-1 cursor-pointer">
                              <span className="font-medium text-sm">{actionLabels[perm.action] || perm.action}</span>
                              <p className="text-xs text-muted-foreground line-clamp-1">{perm.description}</p>
                            </label>
                          </div>
                        );
                      })}
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </CardContent>
      </Card>

      <PermissionComparisonTable roles={roles} groupedPermissions={groupedPermissions} hasRolePermission={hasRolePermission} />
    </div>
  );
}
