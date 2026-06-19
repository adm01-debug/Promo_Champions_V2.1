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

const ROLE_QUERY_TIMEOUT_MS = 8_000;

function withRoleTimeout<T>(promise: Promise<T>, label: string): Promise<T | null> {
  let timeoutId: ReturnType<typeof setTimeout>;

  return Promise.race([
    promise.finally(() => clearTimeout(timeoutId)),
    new Promise<null>((resolve) => {
      timeoutId = setTimeout(() => {
        if (import.meta.env.DEV) {
          console.warn(`${label} timed out after ${ROLE_QUERY_TIMEOUT_MS}ms`);
        }
        resolve(null);
      }, ROLE_QUERY_TIMEOUT_MS);
    }),
  ]);
}

export function useUserRoles() {
  const { user, salesperson } = useAuth();
  const queryClient = useQueryClient();

  // Get current user's role
  const { data: currentUserRole, isLoading: isLoadingCurrentRole } = useQuery({
    queryKey: ["user-role", user?.id],
    queryFn: async () => {
      if (!user?.id) return null;
      
      const roleResult = await withRoleTimeout(
        supabase
          .from("user_roles")
          .select("*")
          .eq("user_id", user.id)
          .order("role")
          .limit(1)
          .maybeSingle(),
        "user_roles lookup"
      );

      const data = roleResult?.data;
      const error = roleResult?.error;

      // Fallback: If no role found in user_roles but exists as salesperson
      if (!data && !error && user?.id) {
        const salespersonResult = await withRoleTimeout(
          supabase
            .from("salespeople")
            .select("role")
            .eq("auth_user_id", user.id)
            .maybeSingle(),
          "salespeople role fallback"
        );
        const spData = salespersonResult?.data;
        
        if (spData) {
          return {
            id: 'temp-' + user.id,
            user_id: user.id,
            role: 'salesperson',
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString()
          } as UserRole;
        }
      }

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
  const isSDR = salesperson?.role === "sdr";
  const isCloser = salesperson?.role === "closer";
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
    isSDR,
    isCloser,
    isHybrid,
    isAdminOrManager,
    hasRole,
    canManageRoles,
    canViewReports,
    canEditGoals,
    canDeleteData,
  };
}
