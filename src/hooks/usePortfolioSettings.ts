import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

export interface PortfolioSetting {
  id: string;
  setting_key: string;
  setting_value: string;
  description: string | null;
  updated_at: string;
}

const DEFAULT_SETTINGS = {
  inactivity_threshold_days: '365',
  rotation_strategy: 'top_performer',
  auto_reassign_inactive: 'false',
  min_days_before_reassign: '30',
};

export function usePortfolioSettings() {
  return useQuery({
    queryKey: ['portfolio-settings'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('portfolio_settings')
        .select('*');

      if (error) throw error;

      // Convert array to object for easier access
      const settingsMap: Record<string, PortfolioSetting> = {};
      (data || []).forEach((setting: PortfolioSetting) => {
        settingsMap[setting.setting_key] = setting;
      });

      return settingsMap;
    },
  });
}

export function useUpdatePortfolioSetting() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ key, value, description }: { key: string; value: string; description?: string }) => {
      // Check if setting exists
      const { data: existing } = await supabase
        .from('portfolio_settings')
        .select('id')
        .eq('setting_key', key)
        .single();

      if (existing) {
        // Update existing
        const { error } = await supabase
          .from('portfolio_settings')
          .update({ 
            setting_value: value,
            description: description || null,
            updated_at: new Date().toISOString()
          })
          .eq('setting_key', key);

        if (error) throw error;
      } else {
        // Insert new
        const { error } = await supabase
          .from('portfolio_settings')
          .insert({ 
            setting_key: key, 
            setting_value: value,
            description: description || null
          });

        if (error) throw error;
      }

      return { key, value };
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['portfolio-settings'] });
      toast.success('Configuração salva com sucesso');
    },
    onError: (error) => {
      if (import.meta.env.DEV) {
        console.error('Error updating setting:', error);
      }
      toast.error('Erro ao salvar configuração');
    },
  });
}

export function getSettingValue(
  settings: Record<string, PortfolioSetting> | undefined,
  key: keyof typeof DEFAULT_SETTINGS
): string {
  return settings?.[key]?.setting_value || DEFAULT_SETTINGS[key];
}
