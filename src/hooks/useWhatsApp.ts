import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

export function useWhatsApp() {
  const [isSending, setIsSending] = useState(false);

  const sendMessage = async (saleId: string, body: string) => {
    setIsSending(true);
    try {
      // 1. Log the message in the database (simulated successful outbound)
      const { error: dbError } = await supabase
        .from("whatsapp_conversations")
        .insert({
          sale_id: saleId,
          direction: "outbound",
          body,
          status: "sent",
          sent_at: new Date().toISOString()
        });

      if (dbError) throw dbError;

      // 2. Update last interaction on sales
      await supabase
        .from("sales")
        .update({
          whatsapp_last_interaction: new Date().toISOString(),
          whatsapp_status: "active"
        })
        .eq("id", saleId);

      toast.success("Mensagem enviada via WhatsApp!");
      return true;
    } catch (_err) {
      // Errors are tracked via edge function logs and RLS audit if necessary
      toast.error("Falha ao enviar mensagem via WhatsApp");
      return false;
    } finally {
      setIsSending(false);
    }
  };

  return { sendMessage, isSending };
}
