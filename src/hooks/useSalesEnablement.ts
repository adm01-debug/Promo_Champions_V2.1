import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

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
  return useMutation({
    mutationFn: async (params: { asset_id: string; action?: string; deal_id?: string }) => {
      const { data: userData } = await supabase.auth.getUser();
      if (!userData.user) throw new Error("Não autenticado");
      const { error } = await supabase.from("asset_usage_logs").insert({
        asset_id: params.asset_id,
        user_id: userData.user.id,
        action: params.action ?? "view",
        deal_id: params.deal_id,
      });
      if (error) throw error;
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
