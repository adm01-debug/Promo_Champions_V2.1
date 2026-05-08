import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { CheckCircle2, XCircle, Eye, MessageSquare, Mail, Phone, Clock, User } from "lucide-react";
import type { PendingAction } from "@/types/sales";
import { toast } from "sonner";
import { cn } from "@/lib/utils";

const MOCK_PENDING: PendingAction[] = [
  {
    id: "1",
    lead_id: "lead_123",
    lead_name: "Gabriel Medeiros",
    template_id: "temp_1",
    template_name: "Follow-up Intenção de Compra",
    type: "whatsapp",
    content: "Olá Gabriel! Vi que você acessou os preços da proposta VIP agora pouco. Ficou alguma dúvida sobre os itens que conversamos?",
    status: "pending",
    created_at: new Date().toISOString(),
  },
  {
    id: "2",
    lead_id: "lead_456",
    lead_name: "Juliana Silva",
    template_id: "temp_2",
    template_name: "Script de Reativação SINGU",
    type: "call",
    content: "Ligar para Juliana (SINGU VIP). Última compra há 45 dias. Oferecer 10% de desconto no serviço preferido (Manicure).",
    status: "pending",
    created_at: new Date(Date.now() - 3600000).toISOString(),
  }
];

export function ApprovalQueue() {
  const [queue, setQueue] = useState<PendingAction[]>(MOCK_PENDING);

  const handleApprove = (id: string) => {
    setQueue(prev => prev.filter(a => a.id !== id));
    toast.success("Mensagem aprovada e enviada.");
  };

  const handleReject = (id: string) => {
    setQueue(prev => prev.filter(a => a.id !== id));
    toast.error("Mensagem descartada.");
  };

  return (
    <Card className="h-full flex flex-col">
      <CardHeader>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <CheckCircle2 className="h-5 w-5 text-status-success" />
            <CardTitle>Fila de Aprovação</CardTitle>
          </div>
          <Badge variant="secondary" className="animate-pulse">
            {queue.length} pendentes
          </Badge>
        </div>
        <CardDescription>
          Revise as mensagens antes que sejam enviadas aos leads.
        </CardDescription>
      </CardHeader>
      <CardContent className="flex-1 overflow-hidden p-0">
        <ScrollArea className="h-[500px]">
          <div className="p-4 space-y-4">
            {queue.length === 0 ? (
              <div className="text-center py-20 opacity-40">
                <CheckCircle2 className="h-12 w-12 mx-auto mb-4" />
                <p className="font-medium">Tudo limpo por aqui!</p>
                <p className="text-sm">Nenhuma mensagem aguardando aprovação.</p>
              </div>
            ) : (
              queue.map((item) => (
                <div 
                  key={item.id} 
                  className={cn(
                    "group relative border rounded-xl p-4 transition-all hover:shadow-md bg-background",
                    "border-l-4",
                    item.type === 'whatsapp' ? "border-l-green-500" : 
                    item.type === 'email' ? "border-l-blue-500" : "border-l-orange-500"
                  )}
                >
                  <div className="flex justify-between items-start mb-3">
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-sm">{item.lead_name}</span>
                        <Badge variant="outline" className="text-[10px] py-0 h-4">
                          {item.type.toUpperCase()}
                        </Badge>
                      </div>
                      <div className="flex items-center gap-1.5 text-[11px] text-muted-foreground">
                        <Clock className="h-3 w-3" />
                        {new Date(item.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                        <span>•</span>
                        <User className="h-3 w-3" />
                        {item.template_name}
                      </div>
                    </div>
                    <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                      <Button 
                        size="icon-sm" 
                        variant="ghost" 
                        className="text-status-success hover:bg-status-success/10"
                        onClick={() => handleApprove(item.id)}
                      >
                        <CheckCircle2 className="h-4 w-4" />
                      </Button>
                      <Button 
                        size="icon-sm" 
                        variant="ghost" 
                        className="text-destructive hover:bg-destructive/10"
                        onClick={() => handleReject(item.id)}
                      >
                        <XCircle className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                  
                  <div className="bg-muted/30 rounded-lg p-3 text-sm text-muted-foreground italic relative">
                    <div className="absolute top-0 right-0 p-1 opacity-20">
                      {item.type === 'whatsapp' && <MessageSquare className="h-4 w-4" />}
                      {item.type === 'email' && <Mail className="h-4 w-4" />}
                      {item.type === 'call' && <Phone className="h-4 w-4" />}
                    </div>
                    {item.content}
                  </div>

                  <div className="mt-3 flex gap-2">
                    <Button variant="outline" size="sm" className="flex-1 text-xs h-8">
                      <Eye className="h-3.5 w-3.5 mr-1.5" />
                      Visualizar Lead
                    </Button>
                    <Button variant="outline" size="sm" className="flex-1 text-xs h-8">
                      Editar Texto
                    </Button>
                  </div>
                </div>
              ))
            )}
          </div>
        </ScrollArea>
      </CardContent>
    </Card>
  );
}
