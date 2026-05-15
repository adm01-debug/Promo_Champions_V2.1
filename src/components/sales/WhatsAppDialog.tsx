import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { MessageCircle, Send, Loader2 } from "lucide-react";
import { useWhatsApp } from "@/hooks/useWhatsApp";
import { Textarea } from "@/components/ui/textarea";

interface WhatsAppDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  sale: any;
}

export function WhatsAppDialog({ open, onOpenChange, sale }: WhatsAppDialogProps) {
  const { sendMessage, isSending } = useWhatsApp();
  const [message, setMessage] = useState(`Olá ${sale.cliente}, notei que estamos avançando com o ${sale.produto}. Gostaria de agendar uma breve call?`);

  const handleSend = async () => {
    const success = await sendMessage(sale.fullId, message);
    if (success) {
      onOpenChange(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md bg-background/95 backdrop-blur-xl border-emerald-500/20 rounded-3xl">
        <DialogHeader>
          <DialogTitle className="text-xl font-black uppercase tracking-tighter italic flex items-center gap-2">
            <MessageCircle className="h-5 w-5 text-emerald-500" />
            WhatsApp Tactical Dispatch
          </DialogTitle>
        </DialogHeader>
        
        <div className="space-y-4 py-4">
          <div className="p-4 rounded-2xl bg-emerald-500/5 border border-emerald-500/10">
            <span className="text-[10px] font-black uppercase tracking-widest text-muted-foreground/60 mb-2 block">Mensagem para {sale.cliente}</span>
            <Textarea 
              className="min-h-[120px] bg-background/50 border-emerald-500/10"
              value={message}
              onChange={(e) => setMessage(e.target.value)}
            />
          </div>
          
          <Button 
            onClick={handleSend} 
            disabled={isSending || !message.trim()}
            className="w-full bg-emerald-600 hover:bg-emerald-700 text-white font-black uppercase tracking-widest py-6 rounded-2xl"
          >
            {isSending ? <Loader2 className="h-5 w-5 animate-spin mr-2" /> : <Send className="h-5 w-5 mr-2" />}
            Disparar Agora
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
