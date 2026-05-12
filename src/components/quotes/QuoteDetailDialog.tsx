import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Quote, parseQuoteItems, QUOTE_STATUSES } from "@/hooks/useQuotes";
import { FileDown, Building2, User, Clock, Link2, Package } from "lucide-react";
import { format, differenceInDays } from "date-fns";
import { ptBR } from "date-fns/locale";
import { cn } from "@/lib/utils";
import { generateQuotePDF } from "@/lib/quotePdfExporter";

interface QuoteDetailDialogProps {
  quote: Quote | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function QuoteDetailDialog({ quote, open, onOpenChange }: QuoteDetailDialogProps) {
  if (!quote) return null;

  const items = parseQuoteItems(quote.items);
  const statusConfig = QUOTE_STATUSES.find(s => s.value === quote.status) || QUOTE_STATUSES[0];

  const personalizationTotal = items.reduce(
    (sum, item) => sum + item.personalizations.reduce((ps, p) => ps + p.total_cost, 0),
    0
  );
  const productSubtotal = items.reduce((sum, item) => sum + item.quantity * item.unit_price, 0);
  const discountAmount = quote.discount_amount || 0;
  const discountPercent = productSubtotal > 0 ? ((discountAmount / (productSubtotal + personalizationTotal)) * 100).toFixed(0) : "0";

  const expirationDays = quote.valid_until && (quote.status === "sent" || quote.status === "draft")
    ? differenceInDays(new Date(quote.valid_until), new Date())
    : null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <div className="flex items-center justify-between gap-4">
            <div>
              <DialogTitle className="text-xl flex items-center gap-2">
                {quote.quote_number ? `Orçamento ${quote.quote_number}` : quote.title}
                <Badge className={cn("text-xs", statusConfig.color)} variant="outline">
                  {statusConfig.label}
                </Badge>
              </DialogTitle>
              <p className="text-sm text-muted-foreground mt-1">
                Criado em {format(new Date(quote.created_at), "dd 'de' MMMM 'de' yyyy", { locale: ptBR })}
              </p>
            </div>
            <div className="flex items-center gap-2 flex-shrink-0">
              {expirationDays !== null && (
                <Badge variant="outline" className={cn(
                  "gap-1",
                  expirationDays < 0 ? "text-destructive border-destructive/30" :
                  expirationDays <= 3 ? "text-coins border-coins/30" :
                  "text-muted-foreground"
                )}>
                  <Clock className="h-3 w-3" />
                  {expirationDays < 0 ? "Expirado" : `Expira em ${expirationDays}d`}
                </Badge>
              )}
              {quote.pdf_url ? (
                <Button size="sm" variant="outline" className="gap-1" asChild>
                  <a href={quote.pdf_url} target="_blank" rel="noopener noreferrer">
                    <FileDown className="h-4 w-4" />
                    PDF Original
                  </a>
                </Button>
              ) : (
                <Button size="sm" variant="outline" className="gap-1" onClick={() => generateQuotePDF(quote, items)}>
                  <FileDown className="h-4 w-4" />
                  Gerar PDF
                </Button>
              )}
            </div>
          </div>
        </DialogHeader>

        {/* Company & Contact */}
        <div className="grid grid-cols-2 gap-4 mt-2">
          <Card className="p-4 space-y-1">
            <div className="flex items-center gap-2 text-xs font-semibold text-muted-foreground uppercase tracking-wider">
              <Building2 className="h-3.5 w-3.5" />
              Cliente
            </div>
            <p className="font-semibold">{quote.client_name}</p>
            {quote.external_reference && (
              <p className="text-xs text-muted-foreground flex items-center gap-1">
                <Link2 className="h-3 w-3" />
                Ref: {quote.external_reference}
              </p>
            )}
          </Card>
          <Card className="p-4 space-y-1">
            <div className="flex items-center gap-2 text-xs font-semibold text-muted-foreground uppercase tracking-wider">
              <User className="h-3.5 w-3.5" />
              Vendedor
            </div>
            <p className="font-semibold">{quote.salespeople?.name || "—"}</p>
            {quote.valid_until && (
              <p className="text-xs text-muted-foreground">
                Válido até {format(new Date(quote.valid_until), "dd/MM/yyyy")}
              </p>
            )}
          </Card>
        </div>

        {quote.description && (
          <p className="text-sm text-muted-foreground">{quote.description}</p>
        )}

        {/* Items Table */}
        {items.length > 0 && (
          <div className="space-y-2">
            <h3 className="font-semibold flex items-center gap-2">
              <Package className="h-4 w-4" />
              Itens do Orçamento
            </h3>
            <Card className="overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b bg-muted/30">
                      <th className="text-left p-3 text-primary font-semibold">Produto</th>
                      <th className="text-left p-3 text-primary font-semibold">Personalização</th>
                      <th className="text-right p-3 text-primary font-semibold">Qtd</th>
                      <th className="text-right p-3 text-primary font-semibold">Unitário</th>
                      <th className="text-right p-3 text-primary font-semibold">Total</th>
                    </tr>
                  </thead>
                  <tbody>
                    {items.map((item, idx) => (
                      <tr key={idx} className="border-b last:border-0">
                        <td className="p-3">
                          <div>
                            {item.product_sku && (
                              <span className="text-xs bg-muted rounded px-1.5 py-0.5 mr-1">
                                {item.product_sku}
                              </span>
                            )}
                            {item.color_name && (
                              <span className="text-xs text-muted-foreground">• {item.color_name}</span>
                            )}
                          </div>
                          <p className="mt-0.5">{item.product_name}</p>
                        </td>
                        <td className="p-3">
                          {item.personalizations.length > 0 ? (
                            <div className="space-y-1">
                              {item.personalizations.map((p, pi) => (
                                <div key={pi} className="text-xs">
                                  <span className="font-medium text-primary">✦ {p.technique_name}</span>
                                  <br />
                                  <span className="text-muted-foreground">
                                    {p.colors_count} cor{p.colors_count > 1 ? "es" : ""} · {p.positions_count} posição
                                  </span>
                                </div>
                              ))}
                            </div>
                          ) : (
                            <span className="text-muted-foreground text-xs">—</span>
                          )}
                        </td>
                        <td className="p-3 text-right font-medium">{item.quantity}</td>
                        <td className="p-3 text-right">
                          {item.unit_price.toLocaleString("pt-BR", { style: "currency", currency: "BRL" })}
                        </td>
                        <td className="p-3 text-right font-semibold">
                          {item.subtotal.toLocaleString("pt-BR", { style: "currency", currency: "BRL" })}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </Card>
          </div>
        )}

        {/* Summary */}
        <Card className="p-4 ml-auto max-w-sm w-full space-y-1 text-sm">
          {items.length > 0 && (
            <>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Subtotal produtos:</span>
                <span>{productSubtotal.toLocaleString("pt-BR", { style: "currency", currency: "BRL" })}</span>
              </div>
              {personalizationTotal > 0 && (
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Personalização:</span>
                  <span>{personalizationTotal.toLocaleString("pt-BR", { style: "currency", currency: "BRL" })}</span>
                </div>
              )}
              {discountAmount > 0 && (
                <div className="flex justify-between text-destructive">
                  <span>Desconto ({discountPercent}%):</span>
                  <span>-{discountAmount.toLocaleString("pt-BR", { style: "currency", currency: "BRL" })}</span>
                </div>
              )}
              <Separator className="my-2" />
            </>
          )}
          <div className="flex justify-between font-bold text-base">
            <span>Total:</span>
            <span className="text-primary">
              {Number(quote.total_value).toLocaleString("pt-BR", { style: "currency", currency: "BRL" })}
            </span>
          </div>
        </Card>

        {/* Notes */}
        {quote.notes && (
          <div className="text-sm">
            <p className="font-semibold mb-1">Observações</p>
            <p className="text-muted-foreground">{quote.notes}</p>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
