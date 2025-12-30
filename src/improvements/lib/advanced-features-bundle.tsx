// ============================================================================
// REAL-TIME NOTIFICATIONS
// src/hooks/useRealtimeNotifications.ts
// ============================================================================

import { useEffect, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

export const useRealtimeNotifications = () => {
  const [notifications, setNotifications] = useState([]);

  useEffect(() => {
    const channel = supabase
      .channel('notifications')
      .on('postgres_changes', {
        event: 'INSERT',
        schema: 'public',
        table: 'notifications',
        filter: `user_id=eq.${supabase.auth.getUser().then(u => u.data.user?.id)}`,
      }, (payload) => {
        setNotifications(prev => [payload.new, ...prev]);
        toast.info(payload.new.title, {
          description: payload.new.message,
        });
      })
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  return notifications;
};

// ============================================================================
// EMAIL TEMPLATES
// src/lib/email-templates.ts
// ============================================================================

export const EMAIL_TEMPLATES = {
  welcome: (name: string) => ({
    subject: `Bem-vindo ao SalesPro, ${name}!`,
    html: `
      <h1>Olá ${name}!</h1>
      <p>Bem-vindo ao SalesPro. Estamos felizes em tê-lo conosco.</p>
      <a href="{{app_url}}/onboarding">Começar Agora</a>
    `,
  }),

  dealWon: (dealTitle: string, value: number) => ({
    subject: `🎉 Deal Fechado: ${dealTitle}`,
    html: `
      <h1>Parabéns!</h1>
      <p>Você fechou o deal: <strong>${dealTitle}</strong></p>
      <p>Valor: R$ ${value.toLocaleString('pt-BR')}</p>
    `,
  }),

  reminderFollowUp: (clientName: string) => ({
    subject: `Lembrete: Follow-up com ${clientName}`,
    html: `
      <h1>Ação Pendente</h1>
      <p>Não esqueça de fazer follow-up com ${clientName} hoje.</p>
    `,
  }),
};

// ============================================================================
// ADVANCED REPORTS
// src/hooks/useAdvancedReports.ts
// ============================================================================

import { useQuery } from '@tanstack/react-query';

export const useAdvancedReports = (reportType: string, params: any) => {
  return useQuery({
    queryKey: ['advanced-report', reportType, params],
    queryFn: async () => {
      const { data, error } = await supabase.rpc(`report_${reportType}`, params);
      if (error) throw error;
      return data;
    },
  });
};

// Report types
export const REPORT_TYPES = {
  salesByPeriod: 'sales_by_period',
  conversionFunnel: 'conversion_funnel',
  teamPerformance: 'team_performance',
  clientSegmentation: 'client_segmentation',
  productAnalysis: 'product_analysis',
  revenueForecasting: 'revenue_forecasting',
};

// ============================================================================
// BATCH OPERATIONS
// src/hooks/useBatchOperations.ts
// ============================================================================

import { useMutation, useQueryClient } from '@tanstack/react-query';

export const useBatchOperations = () => {
  const queryClient = useQueryClient();

  const batchUpdate = useMutation({
    mutationFn: async ({ table, ids, updates }: any) => {
      const promises = ids.map((id: string) =>
        supabase.from(table).update(updates).eq('id', id)
      );
      return Promise.all(promises);
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: [variables.table] });
      toast.success(`${variables.ids.length} registros atualizados`);
    },
  });

  const batchDelete = useMutation({
    mutationFn: async ({ table, ids }: any) => {
      const { error } = await supabase
        .from(table)
        .delete()
        .in('id', ids);
      if (error) throw error;
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: [variables.table] });
      toast.success(`${variables.ids.length} registros excluídos`);
    },
  });

  return { batchUpdate, batchDelete };
};

// ============================================================================
// FILE UPLOAD
// src/hooks/useFileUpload.ts
// ============================================================================

export const useFileUpload = () => {
  const [progress, setProgress] = useState(0);

  const upload = async (file: File, bucket: string) => {
    const fileExt = file.name.split('.').pop();
    const fileName = `${Date.now()}.${fileExt}`;

    const { data, error } = await supabase.storage
      .from(bucket)
      .upload(fileName, file, {
        cacheControl: '3600',
        upsert: false,
      });

    if (error) throw error;

    const { data: { publicUrl } } = supabase.storage
      .from(bucket)
      .getPublicUrl(fileName);

    return { path: data.path, url: publicUrl };
  };

  return { upload, progress };
};

// ============================================================================
// ACTIVITY TIMELINE
// src/components/shared/ActivityTimeline.tsx
// ============================================================================

interface TimelineItem {
  id: string;
  type: 'call' | 'email' | 'meeting' | 'note';
  title: string;
  description: string;
  user: { name: string; avatar: string };
  timestamp: string;
}

export const ActivityTimeline = ({ items }: { items: TimelineItem[] }) => (
  <div className="space-y-4">
    {items.map((item, i) => (
      <div key={item.id} className="flex gap-4">
        <div className="flex flex-col items-center">
          <div className="h-8 w-8 rounded-full bg-primary flex items-center justify-center">
            <span className="text-xs text-white">{item.type[0].toUpperCase()}</span>
          </div>
          {i < items.length - 1 && <div className="w-px h-full bg-border" />}
        </div>
        <div className="flex-1 pb-4">
          <div className="flex justify-between mb-1">
            <p className="font-medium">{item.title}</p>
            <span className="text-xs text-muted-foreground">{item.timestamp}</span>
          </div>
          <p className="text-sm text-muted-foreground">{item.description}</p>
        </div>
      </div>
    ))}
  </div>
);

// ============================================================================
// COLLABORATIVE EDITING
// src/hooks/useCollaboration.ts
// ============================================================================

export const useCollaboration = (documentId: string) => {
  const [activeUsers, setActiveUsers] = useState([]);

  useEffect(() => {
    const presence = supabase.channel(`doc:${documentId}`)
      .on('presence', { event: 'sync' }, () => {
        const state = presence.presenceState();
        setActiveUsers(Object.values(state).flat());
      })
      .subscribe(async (status) => {
        if (status === 'SUBSCRIBED') {
          await presence.track({
            user_id: (await supabase.auth.getUser()).data.user?.id,
            online_at: new Date().toISOString(),
          });
        }
      });

    return () => {
      presence.unsubscribe();
    };
  }, [documentId]);

  return { activeUsers };
};
