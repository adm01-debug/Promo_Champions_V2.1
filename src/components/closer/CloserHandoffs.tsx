import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { supabase } from "@/integrations/supabase/client";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { formatDistanceToNow } from "date-fns";
import { ptBR } from "date-fns/locale";
import { Zap, Clock, ArrowRight, UserCheck, MessageSquare, Briefcase } from "lucide-react";
import { toast } from "sonner";
import { useAuth } from "@/hooks/useAuth";

export function CloserHandoffs() {
  const { user } = useAuth();
  const queryClient = useQueryClient();

  const { data: handoffs, isLoading } = useQuery({
    queryKey: ["closer-handoffs"],
    queryFn: async () => {
      // Get current salesperson id
      const { data: sp } = await supabase
        .from("salespeople")
        .select("id")
        .eq("auth_user_id", user?.id)
        .single();

      if (!sp) return [];

      const { data, error } = await supabase
        .from("sales")
        .select("*, salespeople!sdr_id(name)")
        .eq("closer_id", sp.id)
        .eq("status", "qualified")
        .order("updated_at", { ascending: false });

      if (error) throw error;
      return data || [];
    },
    enabled: !!user?.id
  });

  const acceptLead = async (saleId: string) => {
    try {
      const { error } = await supabase
        .from("sales")
        .update({ status: "proposal" })
        .eq("id", saleId);

      if (error) throw error;
      
      toast.success("Lead aceito!", {
        description: "O lead foi movido para o seu pipeline de propostas."
      });
      
      queryClient.invalidateQueries({ queryKey: ["closer-handoffs"] });
      queryClient.invalidateQueries({ queryKey: ["closer-metrics"] });
      queryClient.invalidateQueries({ queryKey: ["closer-pipeline"] });
    } catch (error) {
      toast.error("Erro ao aceitar lead");
    }
  };

  if (isLoading) return <div className="h-48 flex items-center justify-center"><div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div></div>;

  return (
    <Card className="glass border-primary/20 overflow-hidden">
      <CardHeader className="pb-3 bg-primary/5 border-b border-white/5">
        <div className="flex items-center justify-between">
          <CardTitle className="text-sm font-display font-medium flex items-center gap-2">
            <Zap className="h-4 w-4 text-primary animate-pulse" />
            Novos Handoffs (SDR)
          </CardTitle>
          <Badge variant="secondary" className="bg-primary/10 text-primary">
            {handoffs?.length || 0} pendentes
          </Badge>
        </div>
      </CardHeader>
      <CardContent className="p-0">
        <ScrollArea className="h-[300px]">
          {handoffs?.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-12 text-muted-foreground px-4 text-center">
              <div className="p-3 rounded-full bg-muted/20 mb-3">
                <Briefcase className="h-8 w-8 opacity-40" />
              </div>
              <p className="text-sm">Nenhum novo lead qualificado aguardando.</p>
              <p className="text-[10px] mt-1">Os leads prospectados pelo SDR aparecerão aqui.</p>
            </div>
          ) : (
            <div className="divide-y divide-white/5">
              {handoffs?.map((lead) => (
                <div key={lead.id} className="p-4 hover:bg-white/5 transition-colors group">
                  <div className="flex items-start justify-between gap-4">
                    <div className="space-y-1">
                      <h4 className="text-sm font-medium group-hover:text-primary transition-colors">{lead.client_name}</h4>
                      <div className="flex items-center gap-2 text-[10px] text-muted-foreground">
                        <UserCheck className="h-3 w-3" />
                        <span>SDR: {lead.salespeople?.name || "Desconhecido"}</span>
                        <span className="opacity-30">•</span>
                        <Clock className="h-3 w-3" />
                        <span>{formatDistanceToNow(new Date(lead.updated_at), { addSuffix: true, locale: ptBR })}</span>
                      </div>
                    </div>
                    <Badge className="bg-success/20 text-success border-success/30 hover:bg-success/30">MQL</Badge>
                  </div>
                  
                  {lead.enrichment_data?.pains && (
                    <div className="mt-3 p-2 rounded-lg bg-background/40 border border-white/5 text-[10px] text-muted-foreground italic line-clamp-2">
                      <MessageSquare className="h-3 w-3 inline mr-1 opacity-50" />
                      "{lead.enrichment_data.pains}"
                    </div>
                  )}

                  <div className="mt-4 flex items-center gap-2">
                    <Button 
                      size="sm" 
                      className="h-8 text-[10px] font-bold uppercase tracking-wider bg-primary hover:bg-primary/90 flex-1"
                      onClick={() => acceptLead(lead.id)}
                    >
                      Aceitar & Abrir Proposta
                      <ArrowRight className="h-3 w-3 ml-2" />
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </ScrollArea>
      </CardContent>
    </Card>
  );
}
