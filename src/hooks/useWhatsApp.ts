import { useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

export function useWhatsApp() {
  const [isSending, setIsSending] = useState(false);

  const sendMessage = async (saleId: string, body: string, clientId?: string | null) => {
    setIsSending(true);
    try {
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (!user) throw new Error('Sessão expirada — faça login novamente.');

      let to: string | null = null;
      if (clientId) {
        const { data: client } = await supabase
          .from('clients')
          .select('phone')
          .eq('id', clientId)
          .maybeSingle();
        to = client?.phone ?? null;
      }
      if (!to) {
        toast.error('Cliente sem telefone cadastrado para receber WhatsApp.');
        return false;
      }

      const { data, error } = await supabase.functions.invoke(
        'send-multichannel-message',
        {
          body: { ownerId: user.id, channel: 'whatsapp', to, body },
        }
      );
      if (error) throw error;
      if (data?.error) throw new Error(data.error);

      await supabase.from('whatsapp_conversations').insert({
        sale_id: saleId,
        direction: 'outbound',
        body,
        status: 'sent',
        sent_at: new Date().toISOString(),
      });

      await supabase
        .from('sales')
        .update({
          whatsapp_last_interaction: new Date().toISOString(),
          whatsapp_status: 'active',
        })
        .eq('id', saleId);

      toast.success('Mensagem enviada via WhatsApp!');
      return true;
    } catch (err) {
      toast.error(
        `Falha ao enviar mensagem via WhatsApp: ${err instanceof Error ? err.message : 'erro'}`
      );
      return false;
    } finally {
      setIsSending(false);
    }
  };

  return { sendMessage, isSending };
}
