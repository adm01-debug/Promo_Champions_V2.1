import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "sonner";
import { CONFIG_QUERY_OPTIONS } from "@/config/queryOptions";

export type AppRole = "admin" | "manager" | "salesperson";

export interface UserRole {
  id: string;
  user_id: string;
  role: AppRole;
  created_at: string;
  updated_at: string;
}

export function useUserRoles() {
  const { user, salesperson } = useAuth();
  const queryClient = useQueryClient();

  // Get current user's role
  const { data: currentUserRole, isLoading: isLoadingCurrentRole } = useQuery({
    queryKey: ["user-role", user?.id],
    queryFn: async () => {
      if (!user?.id) return null;
      
      const { data, error } = await supabase
        .from("user_roles")
        .select("*")
        .eq("user_id", user.id)
        .order("role")
        .limit(1)
        .maybeSingle();

      if (error) {
        if (import.meta.env.DEV) {
          console.error("Error fetching user role:", error);
        }
        return null;
      }

      return data as UserRole | null;
    },
    enabled: !!user?.id,
    ...CONFIG_QUERY_OPTIONS,
  });

  // Get all user roles (for admin management)
  const { data: allUserRoles, isLoading: isLoadingAllRoles } = useQuery({
    queryKey: ["all-user-roles"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("user_roles")
        .select("*")
        .order("created_at", { ascending: false });

      if (error) {
        if (import.meta.env.DEV) {
          console.error("Error fetching all user roles:", error);
        }
        return [];
      }

      return data as UserRole[];
    },
    enabled: currentUserRole?.role === "admin",
  });

  // Update a user's role
  const updateRoleMutation = useMutation({
    mutationFn: async ({ userId, newRole }: { userId: string; newRole: AppRole }) => {
      const { data, error } = await supabase
        .from("user_roles")
        .update({ role: newRole })
        .eq("user_id", userId)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["all-user-roles"] });
      queryClient.invalidateQueries({ queryKey: ["user-role"] });
      toast.success("Role atualizada com sucesso");
    },
    onError: (error) => {
      if (import.meta.env.DEV) {
        console.error("Error updating role:", error);
      }
      toast.error("Erro ao atualizar role. Apenas admins podem fazer isso.");
    },
  });

  // Helper functions
  const isAdmin = currentUserRole?.role === "admin";
  const isManager = currentUserRole?.role === "manager";
  const isHybrid = salesperson?.role === "hybrid";
  const isAdminOrManager = isAdmin || isManager;

  const hasRole = (role: AppRole) => currentUserRole?.role === role;
  
  const canManageRoles = isAdmin;
  const canViewReports = isAdminOrManager;
  const canEditGoals = isAdminOrManager;
  const canDeleteData = isAdmin;

  return {
    currentUserRole,
    allUserRoles,
    isLoadingCurrentRole,
    isLoadingAllRoles,
    updateRole: updateRoleMutation.mutate,
    isUpdatingRole: updateRoleMutation.isPending,
    isAdmin,
    isManager,
    isHybrid,
    isAdminOrManager,
    hasRole,
    canManageRoles,
    canViewReports,
    canEditGoals,
    canDeleteData,
  };
}
