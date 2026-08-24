import React from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog";
import { Send, CheckCircle2, XCircle, Clock, Trash2, Link2, Eye } from "lucide-react";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import { cn } from "@/lib/utils";
import { QUOTE_STATUSES, type Quote } from "@/hooks/useQuotes";
import { differenceInDays } from "date-fns";
import { EnrollQuoteCadenceDialog } from "@/components/cadences/quote/EnrollQuoteCadenceDialog";

interface QuoteCardProps {
  quote: Quote;
  onView: (quote: Quote) => void;
  onUpdateStatus: (params: { id: string; status: string }) => void;
  onDelete: (id: string) => void;
}

const getStatusConfig = (status: string) =>
  QUOTE_STATUSES.find(s => s.value === status) || QUOTE_STATUSES[0];

const getExpirationInfo = (validUntil: string | null, status: string) => {
  if (!validUntil || (status !== "sent" && status !== "draft")) return null;
  const days = differenceInDays(new Date(validUntil), new Date());
  if (days < 0) return { label: "Expirado", color: "text-destructive", urgent: true };
  if (days <= 3) return { label: `Expira em ${days}d`, color: "text-status-warning", urgent: true };
  return { label: `Válido por ${days}d`, color: "text-muted-foreground", urgent: false };
};

export const QuoteCard = React.memo(function QuoteCard({ quote, onView, onUpdateStatus, onDelete }: QuoteCardProps) {
  const statusConfig = getStatusConfig(quote.status);
  const expiration = getExpirationInfo(quote.valid_until, quote.status);

  return (
    <Card className="p-4 hover:bg-muted/20 transition-colors">
      <div className="flex items-start justify-between gap-4">
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-1">
            <h3 className="font-semibold truncate">{quote.title}</h3>
            <Badge className={cn("text-xs", statusConfig.color)} variant="outline">{statusConfig.label}</Badge>
            {expiration?.urgent && (
              <span className={cn("text-xs font-medium flex items-center gap-1", expiration.color)}>
                <Clock className="h-3 w-3" />{expiration.label}
              </span>
            )}
          </div>
          <div className="flex items-center gap-4 text-sm text-muted-foreground">
            <span>{quote.client_name}</span>
            <span className="font-semibold text-foreground">{Number(quote.total_value).toLocaleString("pt-BR", { style: "currency", currency: "BRL" })}</span>
            {quote.external_reference && <span className="flex items-center gap-1 text-xs"><Link2 className="h-3 w-3" />{quote.external_reference}</span>}
            {quote.valid_until && <span className="text-xs">Validade: {format(new Date(quote.valid_until), "dd/MM/yyyy")}</span>}
          </div>
          {quote.description && <p className="text-xs text-muted-foreground mt-1 line-clamp-1">{quote.description}</p>}
          <p className="text-xs text-muted-foreground/60 mt-1">
            Criado em {format(new Date(quote.created_at), "dd MMM yyyy", { locale: ptBR })}
            {quote.salespeople?.name && ` por ${quote.salespeople.name}`}
          </p>
        </div>

        <div className="flex items-center gap-1 flex-shrink-0">
          <Button size="sm" variant="outline" className="gap-1 text-xs" onClick={() => onView(quote)}><Eye className="h-3 w-3" />Detalhes</Button>
          {quote.status === "draft" && (
            <Button size="sm" variant="outline" className="gap-1 text-xs" onClick={() => onUpdateStatus({ id: quote.id, status: "sent" })}><Send className="h-3 w-3" />Enviar</Button>
          )}
          {quote.status === "sent" && (
            <>
              <EnrollQuoteCadenceDialog quoteId={quote.id} clientName={quote.client_name} />
              <Button size="sm" variant="outline" className="gap-1 text-xs text-status-success border-status-success/30" onClick={() => onUpdateStatus({ id: quote.id, status: "approved" })}><CheckCircle2 className="h-3 w-3" />Aprovar</Button>
              <Button size="sm" variant="outline" className="gap-1 text-xs text-destructive border-destructive/30" onClick={() => onUpdateStatus({ id: quote.id, status: "rejected" })}><XCircle className="h-3 w-3" />Rejeitar</Button>
            </>
          )}
          <AlertDialog>
            <AlertDialogTrigger asChild>
              <Button size="sm" variant="ghost" className="text-muted-foreground hover:text-destructive"><Trash2 className="h-3.5 w-3.5" /></Button>
            </AlertDialogTrigger>
            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle>Excluir orçamento?</AlertDialogTitle>
                <AlertDialogDescription>Esta ação não pode ser desfeita. O orçamento "{quote.title}" será removido permanentemente.</AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel>Cancelar</AlertDialogCancel>
                <AlertDialogAction onClick={() => onDelete(quote.id)}>Excluir</AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
        </div>
      </div>
    </Card>
  );
});
