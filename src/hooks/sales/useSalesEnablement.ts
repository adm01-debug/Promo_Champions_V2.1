import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { useSendNotification } from "@/hooks/useNotifications";

export interface AssetEfficiency {
  total_views: number;
  deals_influenced: number;
  win_rate_influenced: number;
  total_revenue_influenced: number;
}

export interface EnablementAsset {
  id: string;
  title: string;
  description: string | null;
  category: string;
  asset_type: string;
  file_url: string | null;
  thumbnail_url: string | null;
  tags: string[];
  funnel_stage: string | null;
  is_active: boolean;
  view_count: number;
  created_at: string;
  updated_at: string;
  efficiency?: AssetEfficiency;
}

export interface Playbook {
  id: string;
  title: string;
  description: string | null;
  stage: string | null;
  created_at: string;
  items: PlaybookItem[];
}

export interface PlaybookItem {
  id: string;
  playbook_id: string;
  content: string;
  item_type: 'text' | 'asset' | 'checklist';
  asset_id: string | null;
  item_order: number;
  is_required: boolean;
}

export const useEnablementAssets = (category?: string) => {
  return useQuery({
    queryKey: ["enablement-assets", category],
    queryFn: async () => {
      let q = supabase
        .from("sales_enablement_assets")
        .select("*")
        .eq("is_active", true)
        .order("view_count", { ascending: false });
      if (category && category !== "all") q = q.eq("category", category);
      const { data, error } = await q;
      if (error) throw error;
      return (data ?? []) as EnablementAsset[];
    },
  });
};

export const usePlaybooks = (stage?: string) => {
  return useQuery({
    queryKey: ["playbooks", stage],
    queryFn: async () => {
      let q = supabase
        .from("playbooks")
        .select(`
          *,
          items:playbook_items(*)
        `)
        .order("created_at", { ascending: false });
      
      if (stage) q = q.eq("stage", stage);
      
      const { data, error } = await q;
      if (error) throw error;
      return (data ?? []) as Playbook[];
    },
  });
};

export const useAssetEfficiency = (assetId: string) => {
  return useQuery({
    queryKey: ["asset-efficiency", assetId],
    queryFn: async () => {
      const { data, error } = await supabase.rpc("calculate_asset_efficiency", {
        _asset_id: assetId
      });
      if (error) throw error;
      return data[0] as AssetEfficiency;
    },
  });
};

export const useLogAssetUsage = () => {
  const qc = useQueryClient();
  const sendNotification = useSendNotification();

  return useMutation({
    mutationFn: async (params: { asset_id: string; action?: string; deal_id?: string; asset_title?: string }) => {
      const { data: userData } = await supabase.auth.getUser();
      if (!userData.user) throw new Error("Não autenticado");

      const { error } = await supabase.from("asset_usage_logs").insert({
        asset_id: params.asset_id,
        user_id: userData.user.id,
        action: params.action ?? "view",
        deal_id: params.deal_id,
      });
      if (error) throw error;

      // Check for milestones in efficiency after logging usage
      const { data: efficiencyData, error: effError } = await supabase.rpc("calculate_asset_efficiency", {
        _asset_id: params.asset_id
      });

      if (!effError && efficiencyData?.[0]) {
        const efficiency = efficiencyData[0] as AssetEfficiency;
        
        // Notify milestone: Influence milestone (e.g., every 10 deals)
        if (efficiency.deals_influenced > 0 && efficiency.deals_influenced % 10 === 0) {
          sendNotification.mutate({
            user_id: userData.user.id,
            type: "sales_milestone",
            title: "🚀 Novo Marco de Influência!",
            message: `O material "${params.asset_title || 'Ativo de Vendas'}" acaba de influenciar seu ${efficiency.deals_influenced}º deal!`,
            category: "sales",
            priority: "high",
            metadata: { asset_id: params.asset_id, count: efficiency.deals_influenced }
          });
        }
      }
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["enablement-assets"] });
    },
  });
};

export const useCreateAsset = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (asset: Partial<EnablementAsset>) => {
      const { data: userData } = await supabase.auth.getUser();
      const { error } = await supabase.from("sales_enablement_assets").insert({
        title: asset.title ?? "Novo material",
        description: asset.description,
        category: asset.category ?? "general",
        asset_type: asset.asset_type ?? "document",
        file_url: asset.file_url,
        tags: asset.tags ?? [],
        funnel_stage: asset.funnel_stage,
        created_by: userData.user?.id,
      });
      if (error) throw error;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["enablement-assets"] });
      toast.success("Material criado");
    },
    onError: (e: Error) => toast.error(e.message),
  });
};

export const usePlaybookProgress = (playbookId?: string, saleId?: string) => {
  return useQuery({
    queryKey: ["playbook-progress", playbookId, saleId],
    enabled: !!playbookId && !!saleId,
    queryFn: async () => {
      const { data, error } = await supabase
        .from("playbook_progress")
        .select("*")
        .eq("playbook_item_id", playbookId!)
        .eq("sale_id", saleId!)
        .maybeSingle();
      
      if (error && error.code !== 'PGRST116') throw error;
      return data;
    },
  });
};

export const useTogglePlaybookItem = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (params: { playbook_item_id: string; sale_id: string; completed: boolean }) => {
      const { data: userData } = await supabase.auth.getUser();
      if (!userData.user) throw new Error("Não autenticado");

      if (params.completed) {
        const { error } = await supabase.from("playbook_progress").insert({
          playbook_item_id: params.playbook_item_id,
          sale_id: params.sale_id,
          completed_by: userData.user.id,
        });
        if (error) throw error;
      } else {
        const { error } = await supabase
          .from("playbook_progress")
          .delete()
          .eq("playbook_item_id", params.playbook_item_id)
          .eq("sale_id", params.sale_id);
        if (error) throw error;
      }
    },
    onSuccess: (_, variables) => {
      qc.invalidateQueries({ queryKey: ["playbook-progress-all", variables.sale_id] });
      toast.success(variables.completed ? "Etapa concluída!" : "Etapa desmarcada");
    },
  });
};

export const useAllPlaybookProgress = (saleId?: string) => {
  return useQuery({
    queryKey: ["playbook-progress-all", saleId],
    enabled: !!saleId,
    queryFn: async () => {
      const { data, error } = await supabase
        .from("playbook_progress")
        .select("playbook_item_id")
        .eq("sale_id", saleId!);
      if (error) throw error;
      return new Set(data.map(d => d.playbook_item_id));
    },
  });
};
