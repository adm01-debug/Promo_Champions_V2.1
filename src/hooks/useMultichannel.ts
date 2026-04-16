import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

export type Channel = 'whatsapp' | 'email' | 'linkedin' | 'sms' | 'phone';
export type InteractionStatus = 'sent' | 'delivered' | 'read' | 'replied' | 'failed' | 'scheduled';
export type Direction = 'inbound' | 'outbound';

export interface MessageTemplate {
  id: string;
  salesperson_id: string;
  name: string;
  channel: Channel;
  subject: string | null;
  body: string;
  variables: string[];
  category: string;
  is_active: boolean;
  usage_count: number;
  created_at: string;
  updated_at: string;
}

export interface ChannelInteraction {
  id: string;
  salesperson_id: string;
  channel: Channel;
  direction: Direction;
  contact_name: string;
  contact_info: string | null;
  message_preview: string | null;
  status: InteractionStatus;
  template_id: string | null;
  deal_id: string | null;
  metadata: Record<string, unknown>;
  created_at: string;
}

// ─── Templates ─────────────────────────────────────────────────────
export const useMessageTemplates = (channel?: Channel) => {
  return useQuery({
    queryKey: ['message-templates', channel],
    queryFn: async () => {
      let query = supabase
        .from('message_templates')
        .select('*')
        .order('usage_count', { ascending: false });

      if (channel) query = query.eq('channel', channel);

      const { data, error } = await query;
      if (error) throw error;
      return (data || []) as unknown as MessageTemplate[];
    },
  });
};

export const useCreateTemplate = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (template: {
      name: string;
      channel: Channel;
      subject?: string;
      body: string;
      variables?: string[];
      category?: string;
      salesperson_id: string;
    }) => {
      const { data, error } = await supabase
        .from('message_templates')
        .insert(template)
        .select()
        .single();
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['message-templates'] });
      toast.success('Template criado com sucesso');
    },
    onError: () => toast.error('Erro ao criar template'),
  });
};

export const useUpdateTemplate = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, ...updates }: { id: string } & Partial<MessageTemplate>) => {
      const { error } = await supabase
        .from('message_templates')
        .update(updates)
        .eq('id', id);
      if (error) throw error;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['message-templates'] });
      toast.success('Template atualizado');
    },
    onError: () => toast.error('Erro ao atualizar template'),
  });
};

export const useDeleteTemplate = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from('message_templates').delete().eq('id', id);
      if (error) throw error;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['message-templates'] });
      toast.success('Template excluído');
    },
    onError: () => toast.error('Erro ao excluir template'),
  });
};

// ─── Channel Interactions ──────────────────────────────────────────
export const useChannelInteractions = (filters?: {
  channel?: Channel;
  days?: number;
}) => {
  return useQuery({
    queryKey: ['channel-interactions', filters],
    queryFn: async () => {
      let query = supabase
        .from('channel_interactions')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(200);

      if (filters?.channel) query = query.eq('channel', filters.channel);
      if (filters?.days) {
        const since = new Date();
        since.setDate(since.getDate() - filters.days);
        query = query.gte('created_at', since.toISOString());
      }

      const { data, error } = await query;
      if (error) throw error;
      return (data || []) as unknown as ChannelInteraction[];
    },
  });
};

export const useCreateInteraction = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (interaction: {
      channel: Channel;
      direction: Direction;
      contact_name: string;
      contact_info?: string;
      message_preview?: string;
      status?: InteractionStatus;
      template_id?: string;
      deal_id?: string;
      salesperson_id: string;
    }) => {
      const { data, error } = await supabase
        .from('channel_interactions')
        .insert(interaction)
        .select()
        .single();
      if (error) throw error;

      // If template was used, increment usage count
      if (interaction.template_id) {
        try {
          const { data: tpl } = await supabase
            .from('message_templates')
            .select('usage_count')
            .eq('id', interaction.template_id)
            .single();
          if (tpl) {
            await supabase
              .from('message_templates')
              .update({ usage_count: (tpl.usage_count || 0) + 1 })
              .eq('id', interaction.template_id);
          }
        } catch {
          // Silent fail — usage count is non-critical
        }
      }

      return data;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['channel-interactions'] });
      qc.invalidateQueries({ queryKey: ['message-templates'] });
      toast.success('Interação registrada');
    },
    onError: () => toast.error('Erro ao registrar interação'),
  });
};

// ─── Channel Stats ─────────────────────────────────────────────────
export const useChannelStats = (days = 30) => {
  return useQuery({
    queryKey: ['channel-stats', days],
    queryFn: async () => {
      const since = new Date();
      since.setDate(since.getDate() - days);

      const { data, error } = await supabase
        .from('channel_interactions')
        .select('channel, direction, status, created_at')
        .gte('created_at', since.toISOString());

      if (error) throw error;
      const interactions = (data || []) as unknown as Pick<ChannelInteraction, 'channel' | 'direction' | 'status' | 'created_at'>[];

      const channels: Channel[] = ['whatsapp', 'email', 'linkedin', 'sms', 'phone'];
      const stats = channels.map(ch => {
        const chData = interactions.filter(i => i.channel === ch);
        return {
          channel: ch,
          total: chData.length,
          outbound: chData.filter(i => i.direction === 'outbound').length,
          inbound: chData.filter(i => i.direction === 'inbound').length,
          replied: chData.filter(i => i.status === 'replied').length,
          failed: chData.filter(i => i.status === 'failed').length,
          responseRate: chData.length > 0
            ? Math.round((chData.filter(i => i.status === 'replied').length / chData.length) * 100)
            : 0,
        };
      });

      return {
        stats,
        total: interactions.length,
        byDay: groupByDay(interactions),
      };
    },
  });
};

function groupByDay(interactions: Pick<ChannelInteraction, 'channel' | 'created_at'>[]) {
  const map = new Map<string, Record<string, number>>();
  interactions.forEach(i => {
    const day = i.created_at.split('T')[0];
    if (!map.has(day)) map.set(day, {});
    const entry = map.get(day)!;
    entry[i.channel] = (entry[i.channel] || 0) + 1;
  });
  return Array.from(map.entries())
    .map(([date, channels]) => ({ date, ...channels }))
    .sort((a, b) => a.date.localeCompare(b.date));
}
