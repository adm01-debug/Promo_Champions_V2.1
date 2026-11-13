import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from '@/components/ui/card';
import { CheckCircle2 } from 'lucide-react';

/**
 * Fila de aprovação de mensagens de cadência.
 *
 * Ainda não existe backend que retenha mensagens de cadência para aprovação
 * (`cadence_steps.needs_approval` é só uma marcação; nada é enviado nem retido
 * por ela). Por isso a fila mostra estado vazio honesto em vez de itens
 * fictícios e não oferece botões de aprovar/rejeitar sem efeito real.
 */
export function ApprovalQueue() {
  return (
    <Card className="h-full flex flex-col">
      <CardHeader>
        <div className="flex items-center gap-2">
          <CheckCircle2 className="h-5 w-5 text-status-success" />
          <CardTitle>Fila de Aprovação</CardTitle>
        </div>
        <CardDescription>
          Revise as mensagens antes que sejam enviadas aos leads.
        </CardDescription>
      </CardHeader>
      <CardContent className="flex-1">
        <div className="text-center py-20 text-muted-foreground">
          <CheckCircle2 className="h-12 w-12 mx-auto mb-4 opacity-40" />
          <p className="font-medium">Nenhuma mensagem aguardando aprovação.</p>
          <p className="text-sm">
            As cadências ainda não enviam mensagens que dependam de aprovação.
          </p>
        </div>
      </CardContent>
    </Card>
  );
}
