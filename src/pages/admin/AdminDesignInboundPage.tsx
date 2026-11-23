import { Helmet } from 'react-helmet-async';
import { useDesignsInbound } from '@/hooks/designs-inbound/useDesignsInbound';
import { ProtectedRoute } from '@/components/auth/ProtectedRoute';
import { PageTransition } from '@/components/transitions/PageTransition';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Button } from '@/components/ui/button';
import { Palette, RefreshCw } from 'lucide-react';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';

function AdminDesignInboundContent() {
  const { data = [], isLoading, refetch, isFetching } = useDesignsInbound();

  return (
    <>
      <Helmet>
        <title>Designs recebidos | Promo Champions</title>
        <meta
          name="description"
          content="Ultimos designs criados ou alterados no Promo Design e espelhados no CRM."
        />
      </Helmet>
      <div className="p-6 space-y-6">
        <div className="flex items-start justify-between gap-4 flex-wrap">
          <div className="flex items-start gap-3">
            <div className="p-2 rounded-lg bg-primary/10">
              <Palette className="h-6 w-6 text-primary" />
            </div>
            <div>
              <h1 className="text-page-title gradient-text">Designs do Promo Design</h1>
              <p className="text-muted-foreground mt-1">
                Ultimos 100 designs recebidos em <code>/receive-design-sync</code>.
              </p>
            </div>
          </div>
          <Button
            variant="outline"
            size="sm"
            onClick={() => refetch()}
            disabled={isFetching}
          >
            <RefreshCw className={`h-4 w-4 mr-2 ${isFetching ? 'animate-spin' : ''}`} />
            Atualizar
          </Button>
        </div>

        <Card>
          <CardHeader>
            <CardTitle className="text-section-title">
              {isLoading ? 'Carregando...' : `${data.length} design(s) recebido(s)`}
            </CardTitle>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <div className="text-sm text-muted-foreground py-4 text-center">
                Carregando...
              </div>
            ) : data.length === 0 ? (
              <div className="text-sm text-muted-foreground py-8 text-center">
                Nenhum design recebido do Promo Design ainda.
              </div>
            ) : (
              <ScrollArea className="h-[600px]">
                <div className="space-y-2 pr-2">
                  {data.map(row => (
                    <div
                      key={row.id}
                      className="flex items-start gap-3 p-3 rounded-lg border bg-card"
                    >
                      {row.thumbnail_url ? (
                        <img
                          src={row.thumbnail_url}
                          alt=""
                          className="h-12 w-12 rounded object-cover border"
                          loading="lazy"
                        />
                      ) : (
                        <div className="h-12 w-12 rounded border bg-muted flex items-center justify-center">
                          <Palette className="h-5 w-5 text-muted-foreground" />
                        </div>
                      )}
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 flex-wrap">
                          <span className="text-sm font-medium">
                            {row.name ?? row.design_id.slice(0, 8)}
                          </span>
                          {row.last_event && (
                            <Badge variant="outline" className="text-xs">
                              {row.last_event}
                            </Badge>
                          )}
                          <span className="text-xs text-muted-foreground ml-auto">
                            {format(new Date(row.received_at), 'dd/MM/yyyy HH:mm', {
                              locale: ptBR,
                            })}
                          </span>
                        </div>
                        <div className="text-xs text-muted-foreground mt-1 flex flex-wrap gap-3">
                          {row.product_name && <span>Produto: {row.product_name}</span>}
                          {row.product_sku && <span>SKU: {row.product_sku}</span>}
                          {row.seller_email && <span>Vendedor: {row.seller_email}</span>}
                          <span>Origem: {row.source}</span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </ScrollArea>
            )}
          </CardContent>
        </Card>
      </div>
    </>
  );
}

export default function AdminDesignInboundPage() {
  return (
    <ProtectedRoute requiredRole="admin">
      <PageTransition>
        <AdminDesignInboundContent />
      </PageTransition>
    </ProtectedRoute>
  );
}
