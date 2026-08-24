import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

export function useApiTokens() {
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data: tokens = [], isLoading } = useQuery({
    queryKey: ["api-tokens"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("api_tokens")
        .select("*")
        .order("created_at", { ascending: false });
      if (error) throw error;
      return data;
    },
  });

  const createToken = useMutation({
    mutationFn: async ({ companyName, teamId }: { companyName: string; teamId?: string }) => {
      const { data: tokenStr, error: genErr } = await supabase.rpc("generate_api_token");
      if (genErr) throw genErr;

      const { data: { user }, error: authError } = await supabase.auth.getUser();
      if (authError || !user) throw new Error("Não autenticado");

      const { data, error } = await supabase.from("api_tokens").insert({
        token: tokenStr,
        company_name: companyName,
        team_id: teamId || null,
        created_by: user.id,
      }).select().single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["api-tokens"] });
      toast({ title: "Token criado", description: "Token de API gerado com sucesso" });
    },
    onError: (err: Error) => {
      toast({ title: "Erro", description: err.message, variant: "destructive" });
    },
  });

  const toggleToken = useMutation({
    mutationFn: async ({ id, isActive }: { id: string; isActive: boolean }) => {
      const { error } = await supabase.from("api_tokens").update({ is_active: isActive }).eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["api-tokens"] });
      toast({ title: "Token atualizado" });
    },
  });

  return { tokens, isLoading, createToken, toggleToken };
}
