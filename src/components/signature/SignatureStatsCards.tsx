import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { FileSignature, Clock, CheckCircle2 } from "lucide-react";

interface SignatureStatsCardsProps {
  total: number;
  pending: number;
  signed: number;
  drafts: number;
  isLoading: boolean;
}

export const SignatureStatsCards = React.memo(function SignatureStatsCards({ total, pending, signed, drafts, isLoading }: SignatureStatsCardsProps) {
  const cards = [
    { icon: FileSignature, label: "Total de Documentos", value: total, className: "glass border-border/40" },
    { icon: Clock, label: "Aguardando Assinatura", value: pending, className: "glass border-status-warning/30 bg-status-warning/5", textColor: "text-status-warning" },
    { icon: CheckCircle2, label: "Assinados", value: signed, className: "glass border-status-success/30 bg-status-success/5", textColor: "text-status-success" },
    { icon: FileSignature, label: "Rascunhos", value: drafts, className: "glass border-border/40" },
  ];

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
      {cards.map(({ icon: Icon, label, value, className, textColor }) => (
        <Card key={label} className={className}>
          <CardHeader className="pb-2">
            <CardTitle className={`text-sm font-medium flex items-center gap-2 ${textColor || 'text-muted-foreground'}`}>
              <Icon className="h-4 w-4" />{label}
            </CardTitle>
          </CardHeader>
          <CardContent>
            {isLoading ? <Skeleton className="h-8 w-16" /> : <div className={`text-2xl font-bold ${textColor || ''}`}>{value}</div>}
          </CardContent>
        </Card>
      ))}
    </div>
  );
});
