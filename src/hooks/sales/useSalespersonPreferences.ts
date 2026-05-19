import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from 'sonner';
import { VoiceId, VOICE_OPTIONS } from "@/hooks/useElevenLabsVoice";

export type ResponseMode = 'text' | 'audio' | 'both';

export interface SalespersonPreferences {
  id: string;
  salesperson_id: string;
  ai_assistant_name: string;
  ai_assistant_avatar: string | null;
  response_mode: ResponseMode;
  voice_id: string;
  voice_name: string;
  created_at: string;
  updated_at: string;
}

const DEFAULT_AI_NAME = 'Coach IA';
const DEFAULT_RESPONSE_MODE: ResponseMode = 'text';
const DEFAULT_VOICE_ID = 'CwhRBWXzGAHq8TQ4Fs17';
const DEFAULT_VOICE_NAME = 'Roger';

export function useSalespersonPreferences() {
  const { salesperson } = useAuth();
  const queryClient = useQueryClient();

  const query = useQuery({
    queryKey: ['salesperson-preferences', salesperson?.id],
    queryFn: async (): Promise<SalespersonPreferences | null> => {
      if (!salesperson?.id) return null;

      const { data, error } = await supabase
        .from('salesperson_preferences')
        .select('*')
        .eq('salesperson_id', salesperson.id)
        .maybeSingle();

      if (error) {
        if (import.meta.env.DEV) {
          console.error('Error fetching preferences:', error);
        }
        return null;
      }

      return data as SalespersonPreferences;
    },
    enabled: !!salesperson?.id,
  });

  const updatePreferences = useMutation({
    mutationFn: async (updates: { 
      ai_assistant_name?: string; 
      ai_assistant_avatar?: string | null;
      response_mode?: ResponseMode;
      voice_id?: string;
      voice_name?: string;
    }) => {
      if (!salesperson?.id) throw new Error('No salesperson');

      // Check if preferences exist
      const { data: existing } = await supabase
        .from('salesperson_preferences')
        .select('id')
        .eq('salesperson_id', salesperson.id)
        .maybeSingle();

      if (existing) {
        // Update existing
        const { error } = await supabase
          .from('salesperson_preferences')
          .update(updates)
          .eq('salesperson_id', salesperson.id);

        if (error) throw error;
      } else {
        // Insert new
        const { error } = await supabase
          .from('salesperson_preferences')
          .insert({
            salesperson_id: salesperson.id,
            ...updates,
          });

        if (error) throw error;
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['salesperson-preferences'] });
      toast.success('Preferências atualizadas!');
    },
    onError: (error) => {
      if (import.meta.env.DEV) {
        console.error('Error updating preferences:', error);
      }
      toast.error('Erro ao atualizar preferências');
    },
  });

  const aiAssistantName = query.data?.ai_assistant_name || DEFAULT_AI_NAME;
  const responseMode = query.data?.response_mode || DEFAULT_RESPONSE_MODE;
  const voiceId = (query.data?.voice_id || DEFAULT_VOICE_ID) as VoiceId;
  const voiceName = query.data?.voice_name || DEFAULT_VOICE_NAME;

  return {
    preferences: query.data,
    aiAssistantName,
    responseMode,
    voiceId,
    voiceName,
    isLoading: query.isLoading,
    updatePreferences: updatePreferences.mutate,
    isUpdating: updatePreferences.isPending,
    VOICE_OPTIONS,
  };
}
