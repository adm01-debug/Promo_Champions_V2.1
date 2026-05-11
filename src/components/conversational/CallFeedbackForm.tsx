import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Slider } from "@/components/ui/slider";
import { MessageSquare, Star, Send } from "lucide-react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";

interface Props {
  recordingId: string;
  clientId?: string | null;
  onSuccess?: () => void;
}

export function CallFeedbackForm({ recordingId, clientId, onSuccess }: Props) {
  const [rating, setRating] = useState([50]);
  const [feedback, setFeedback] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async () => {
    if (!feedback.trim()) {
      toast.error("Por favor, adicione um comentário.");
      return;
    }

    setIsSubmitting(true);
    try {
      // Registrar log detalhado de feedback manual
      const { error } = await (supabase as any).from('lead_detailed_logs').insert({
        event_type: 'call_feedback',
        client_id: clientId || undefined,
        action: 'Manual Manager Feedback',
        details: { 
          recording_id: recordingId,
          score: rating[0],
          comment: feedback 
        }
      });

      if (error) throw error;

      toast.success("Feedback enviado com sucesso!");
      setFeedback("");
      onSuccess?.();
    } catch (err) {
      console.error(err);
      toast.error("Erro ao enviar feedback.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Card className="glass border-border/40">
      <CardHeader className="pb-3">
        <CardTitle className="text-sm font-medium flex items-center gap-2">
          <MessageSquare className="h-4 w-4 text-primary" />
          Feedback do Gestor
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <Label className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Avaliação da Call</Label>
            <span className="text-lg font-black text-primary">{rating[0]}%</span>
          </div>
          <Slider 
            value={rating} 
            onValueChange={setRating} 
            max={100} 
            step={1}
            className="py-4"
          />
          <div className="flex justify-between text-[10px] font-bold text-muted-foreground uppercase tracking-widest">
            <span>Crítico</span>
            <span>Regular</span>
            <span>Excepcional</span>
          </div>
        </div>

        <div className="space-y-1.5">
          <Label className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Comentários & Coaching</Label>
          <Textarea 
            value={feedback}
            onChange={(e) => setFeedback(e.target.value)}
            placeholder="Destaque pontos positivos ou oportunidades de melhoria..."
            className="min-h-[80px] text-xs resize-none bg-background/50"
          />
        </div>

        <Button 
          className="w-full h-8 text-xs font-bold gap-2" 
          onClick={handleSubmit}
          disabled={isSubmitting}
        >
          <Send className="h-3 w-3" />
          {isSubmitting ? "Enviando..." : "Registrar Feedback"}
        </Button>
      </CardContent>
    </Card>
  );
}
