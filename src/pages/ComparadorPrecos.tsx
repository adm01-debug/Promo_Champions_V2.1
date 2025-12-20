import { Helmet } from "react-helmet-async";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from "@/components/ui/table";
import { 
  Scale, 
  TrendingDown, 
  TrendingUp, 
  Star,
  Package,
  DollarSign
} from "lucide-react";
import { useSuppliers } from "@/hooks/useSuppliers";
import { useProducts } from "@/hooks/useProducts";

export default function ComparadorPrecos() {
  const { supplierProducts, productsLoading, getPriceComparison, getBestSupplier } = useSuppliers();
  const { products: productsData } = useProducts();
  const products = productsData || [];
  const productGroups = products?.map(product => {
    const comparison = getPriceComparison(product.id);
    const best = getBestSupplier(product.id);
    
    const priceRange = comparison.length > 0 
      ? {
          min: Math.min(...comparison.map(c => c.unit_price)),
          max: Math.max(...comparison.map(c => c.unit_price)),
        }
      : null;

    const savings = priceRange 
      ? ((priceRange.max - priceRange.min) / priceRange.max * 100).toFixed(1)
      : 0;

    return {
      product,
      comparison,
      best,
      priceRange,
      savings,
      supplierCount: comparison.length,
    };
  }).filter(g => g.supplierCount > 0) || [];

  const totalProducts = productGroups.length;
  const avgSavings = productGroups.length > 0
    ? (productGroups.reduce((sum, g) => sum + parseFloat(String(g.savings)), 0) / productGroups.length).toFixed(1)
    : 0;

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(value);
  };

  return (
    <>
      <Helmet>
        <title>Comparador de Preços | SalesPro</title>
        <meta name="description" content="Compare preços entre fornecedores e encontre as melhores ofertas" />
      </Helmet>
      
      <div className="min-h-screen bg-background">
        <div className="max-w-[1600px] mx-auto p-6 lg:p-8 space-y-6">
          {/* Header */}
          <div>
            <h1 className="text-2xl font-bold flex items-center gap-2">
              <Scale className="h-6 w-6 text-primary" />
              Comparador de Preços
            </h1>
            <p className="text-muted-foreground">
              Compare preços entre fornecedores e otimize suas compras
            </p>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <Card className="glass border-border/40">
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
                  <Package className="h-4 w-4" />
                  Produtos Comparados
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{totalProducts}</div>
              </CardContent>
            </Card>

            <Card className="glass border-border/40">
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
                  <DollarSign className="h-4 w-4" />
                  Total de Cotações
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{supplierProducts?.length || 0}</div>
              </CardContent>
            </Card>

            <Card className="glass border-status-success/30 bg-status-success/5">
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium text-status-success flex items-center gap-2">
                  <TrendingDown className="h-4 w-4" />
                  Economia Média
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-status-success">{avgSavings}%</div>
              </CardContent>
            </Card>

            <Card className="glass border-border/40">
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
                  <Star className="h-4 w-4" />
                  Fornecedores Ativos
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {new Set(supplierProducts?.map(sp => sp.supplier_id)).size}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Price Comparison by Product */}
          <Card className="glass border-border/40">
            <CardHeader>
              <CardTitle>Comparação por Produto</CardTitle>
              <CardDescription>
                Veja todos os fornecedores e preços para cada produto
              </CardDescription>
            </CardHeader>
            <CardContent>
              {productsLoading ? (
                <div className="space-y-3">
                  {[...Array(5)].map((_, i) => (
                    <Skeleton key={i} className="h-20 w-full" />
                  ))}
                </div>
              ) : productGroups.length > 0 ? (
                <div className="space-y-6">
                  {productGroups.map(({ product, comparison, best, priceRange, savings }) => (
                    <div key={product.id} className="border border-border/30 rounded-lg p-4">
                      <div className="flex items-center justify-between mb-4">
                        <div>
                          <h3 className="font-semibold text-lg">{product.name}</h3>
                          <div className="flex items-center gap-2 text-sm text-muted-foreground">
                            <span>{comparison.length} fornecedores</span>
                            {priceRange && (
                              <>
                                <span>•</span>
                                <span>
                                  {formatCurrency(priceRange.min)} - {formatCurrency(priceRange.max)}
                                </span>
                              </>
                            )}
                          </div>
                        </div>
                        {parseFloat(String(savings)) > 0 && (
                          <Badge className="bg-status-success">
                            <TrendingDown className="h-3 w-3 mr-1" />
                            Economia de {savings}%
                          </Badge>
                        )}
                      </div>

                      <Table>
                        <TableHeader>
                          <TableRow>
                            <TableHead>Fornecedor</TableHead>
                            <TableHead className="text-right">Preço Unitário</TableHead>
                            <TableHead className="text-center">Qtd. Mínima</TableHead>
                            <TableHead className="text-center">Lead Time</TableHead>
                            <TableHead className="text-center">Confiabilidade</TableHead>
                            <TableHead className="text-center">Recomendação</TableHead>
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          {comparison.map((sp: any, index: number) => (
                            <TableRow key={sp.id} className={best?.id === sp.id ? 'bg-status-success/10' : ''}>
                              <TableCell className="font-medium">
                                {sp.suppliers?.name}
                                {sp.is_preferred && (
                                  <Badge variant="outline" className="ml-2">Preferido</Badge>
                                )}
                              </TableCell>
                              <TableCell className="text-right font-mono">
                                {formatCurrency(sp.unit_price)}
                                {index === 0 && comparison.length > 1 && (
                                  <Badge className="ml-2 bg-status-success text-xs">Menor</Badge>
                                )}
                              </TableCell>
                              <TableCell className="text-center">
                                {sp.min_order_quantity} un
                              </TableCell>
                              <TableCell className="text-center">
                                {sp.suppliers?.lead_time_days || '-'} dias
                              </TableCell>
                              <TableCell className="text-center">
                                {Math.round((sp.suppliers?.reliability_score || 0) * 100)}%
                              </TableCell>
                              <TableCell className="text-center">
                                {best?.id === sp.id && (
                                  <Badge className="bg-primary">
                                    <Star className="h-3 w-3 mr-1" />
                                    Melhor Opção
                                  </Badge>
                                )}
                              </TableCell>
                            </TableRow>
                          ))}
                        </TableBody>
                      </Table>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-12 text-muted-foreground">
                  <Scale className="h-12 w-12 mx-auto mb-4 opacity-50" />
                  <p>Nenhuma cotação de fornecedor cadastrada.</p>
                  <p className="text-sm">Vincule produtos aos fornecedores para comparar preços.</p>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </>
  );
}
