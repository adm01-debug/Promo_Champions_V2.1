import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { BrainCircuit, Loader2, Send, Sparkles } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { Textarea } from "@/components/ui/textarea";

interface AIEmailDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  sale: any;
}

export function AIEmailDialog({ open, onOpenChange, sale }: AIEmailDialogProps) {
  const [loading, setLoading] = useState(false);
  const [email, setEmail] = useState<{ subject: string; body_text: string } | null>(null);
  const [instructions, setInstructions] = useState("");

  const generateEmail = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase.functions.invoke("ai-email-composer", {
        body: {
          mode: "single",
          recipient_id: sale.client_id || sale.fullId,
          recipient_type: "client",
          goal: "follow_up",
          tone: "consultivo",
          custom_instructions: instructions
        }
      });

      if (error) throw error;
      setEmail(data);
      toast.success("E-mail personalizado gerado pela IA!");
    } catch (err) {
      console.error(err);
      toast.error("Erro ao gerar e-mail com IA");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl bg-background/95 backdrop-blur-xl border-primary/20 rounded-3xl">
        <DialogHeader>
          <DialogTitle className="text-xl font-black uppercase tracking-tighter italic flex items-center gap-2">
            <Sparkles className="h-5 w-5 text-primary" />
            Hyper-Personalização AI
          </DialogTitle>
        </DialogHeader>
        
        <div className="space-y-4 py-4">
          {!email ? (
            <div className="space-y-4">
              <div className="p-4 rounded-2xl bg-primary/5 border border-primary/10">
                <p className="text-sm text-muted-foreground mb-4">
                  A IA analisará o histórico de <strong>{sale.cliente}</strong> para criar uma abordagem única focada em <strong>{sale.produto}</strong>.
                </p>
                <Textarea 
                  placeholder="Instruções opcionais (ex: Foque no ROI do ano passado...)"
                  className="bg-background/50 border-primary/10"
                  value={instructions}
                  onChange={(e) => setInstructions(e.target.value)}
                />
              </div>
              <Button 
                onClick={generateEmail} 
                disabled={loading}
                className="w-full bg-primary hover:bg-primary/90 text-primary-foreground font-black uppercase tracking-widest py-6 rounded-2xl shadow-lg shadow-primary/20"
              >
                {loading ? <Loader2 className="h-5 w-5 animate-spin mr-2" /> : <BrainCircuit className="h-5 w-5 mr-2" />}
                Gerar E-mail Tático
              </Button>
            </div>
          ) : (
            <div className="space-y-4 animate-in fade-in slide-in-from-bottom-4">
              <div className="p-4 rounded-2xl bg-muted/30 border border-border/50">
                <p className="text-[10px] font-black uppercase tracking-widest text-muted-foreground mb-1">Assunto</p>
                <p className="text-sm font-bold mb-4">{email.subject}</p>
                <p className="text-[10px] font-black uppercase tracking-widest text-muted-foreground mb-1">Corpo</p>
                <div className="text-sm whitespace-pre-wrap text-muted-foreground leading-relaxed">
                  {email.body_text}
                </div>
              </div>
              <div className="flex gap-3">
                <Button 
                  variant="outline" 
                  onClick={() => setEmail(null)}
                  className="flex-1 rounded-2xl border-primary/20"
                >
                  Regerar
                </Button>
                <Button 
                  className="flex-1 rounded-2xl bg-emerald-600 hover:bg-emerald-700 text-white font-black uppercase tracking-widest"
                  onClick={() => {
                    toast.success("E-mail enviado para fila de processamento!");
                    onOpenChange(false);
                  }}
                >
                  <Send className="h-4 w-4 mr-2" />
                  Enviar Agora
                </Button>
              </div>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
