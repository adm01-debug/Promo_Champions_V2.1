import React, { FC, memo } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";
import { cn } from "@/lib/utils";
import { Trophy, Package, Building, User } from "lucide-react";
import { motion } from "framer-motion";
import { useBITopClients, TopClientData, SupplierSalesData, TopCompanyData } from "@/hooks/bi/useBITopClients";

const formatCurrency = (value: number) =>
  `R$ ${value.toLocaleString("pt-BR", { maximumFractionDigits: 0 })}`;

const RANK_COLORS = [
  "bg-rank-gold",
  "bg-rank-silver", 
  "bg-rank-bronze",
  "bg-chart-2",
  "bg-chart-3",
  "bg-chart-4",
  "bg-chart-5",
  "bg-primary",
  "bg-accent",
  "bg-muted-foreground",
];

const BAR_COLORS = [
  "from-rank-gold to-rank-gold/60",
  "from-rank-silver to-rank-silver/60",
  "from-rank-bronze to-rank-bronze/60",
  "from-chart-2 to-chart-2/60",
  "from-chart-3 to-chart-3/60",
  "from-chart-4 to-chart-4/60",
  "from-chart-5 to-chart-5/60",
  "from-primary to-primary/60",
  "from-accent to-accent/60",
  "from-muted-foreground to-muted-foreground/60",
];

// Top Clients Card
const TopClientsCard: FC<{ clients: TopClientData[]; maxValue: number }> = ({ clients, maxValue }) => (
  <Card className="glass-card">
    <CardHeader className="pb-3">
      <CardTitle className="text-lg font-display flex items-center gap-2">
        <div className="p-2 rounded-lg bg-primary/10">
          <Trophy className="h-4 w-4 text-primary" />
        </div>
        <span className="gradient-text">Top Clientes por Faturamento</span>
      </CardTitle>
    </CardHeader>
    <CardContent>
      <ScrollArea className="h-[380px]">
        <div className="space-y-3 pr-2">
          {clients.map((client, idx) => (
            <motion.div
              key={`${client.name}-${idx}`}
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: idx * 0.04 }}
              className="space-y-1.5"
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2 min-w-0 flex-1">
                  <span className="font-semibold text-sm truncate">{client.name}</span>
                  {client.company && (
                    <span className="text-xs text-muted-foreground truncate">({client.company})</span>
                  )}
                </div>
                <div className="flex items-center gap-2 shrink-0 ml-2">
                  <span className="font-bold text-sm">{formatCurrency(client.totalValue)}</span>
                  <span className="text-xs text-muted-foreground">({client.ordersCount} ped.)</span>
                </div>
              </div>
              <div className="w-full h-1.5 rounded-full bg-muted/50 overflow-hidden">
                <div
                  className={cn("h-full rounded-full bg-gradient-to-r transition-all duration-700", BAR_COLORS[idx % BAR_COLORS.length])}
                  style={{ width: `${maxValue > 0 ? (client.totalValue / maxValue) * 100 : 0}%` }}
                />
              </div>
            </motion.div>
          ))}
          {clients.length === 0 && (
            <div className="text-center py-8 text-muted-foreground">
              <User className="h-8 w-8 mx-auto mb-2 opacity-50" />
              <p className="text-sm">Nenhum cliente encontrado</p>
            </div>
          )}
        </div>
      </ScrollArea>
    </CardContent>
  </Card>
);

// Supplier Sales Card
const SupplierSalesCard: FC<{ suppliers: SupplierSalesData[]; maxValue: number }> = ({ suppliers, maxValue }) => (
  <Card className="glass-card">
    <CardHeader className="pb-3">
      <CardTitle className="text-lg font-display flex items-center gap-2">
        <div className="p-2 rounded-lg bg-warning/10">
          <Package className="h-4 w-4 text-warning" />
        </div>
        Vendas por Fornecedor
      </CardTitle>
    </CardHeader>
    <CardContent>
      <ScrollArea className="h-[380px]">
        <div className="space-y-3 pr-2">
          {suppliers.map((supplier, idx) => (
            <motion.div
              key={`${supplier.supplierName}-${idx}`}
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: idx * 0.04 }}
              className="space-y-1.5"
            >
              <div className="flex items-center justify-between">
                <span className="font-semibold text-sm truncate flex-1">{supplier.supplierName}</span>
                <div className="flex items-center gap-2 shrink-0 ml-2">
                  <span className="font-bold text-sm">{formatCurrency(supplier.totalValue)}</span>
                  <span className="text-xs text-muted-foreground">
                    {supplier.productsCount} prod. · {supplier.itemsCount} itens
                  </span>
                </div>
              </div>
              <div className="w-full h-1.5 rounded-full bg-muted/50 overflow-hidden">
                <div
                  className={cn("h-full rounded-full bg-gradient-to-r transition-all duration-700", BAR_COLORS[idx % BAR_COLORS.length])}
                  style={{ width: `${maxValue > 0 ? (supplier.totalValue / maxValue) * 100 : 0}%` }}
                />
              </div>
            </motion.div>
          ))}
          {suppliers.length === 0 && (
            <div className="text-center py-8 text-muted-foreground">
              <Package className="h-8 w-8 mx-auto mb-2 opacity-50" />
              <p className="text-sm">Nenhum fornecedor encontrado</p>
            </div>
          )}
        </div>
      </ScrollArea>
    </CardContent>
  </Card>
);

// Top Companies Card
const TopCompaniesCard: FC<{ companies: TopCompanyData[]; maxValue: number }> = ({ companies, maxValue }) => (
  <Card className="glass-card">
    <CardHeader className="pb-3">
      <CardTitle className="text-lg font-display flex items-center gap-2">
        <div className="p-2 rounded-lg bg-success/10">
          <Building className="h-4 w-4 text-success" />
        </div>
        Top Clientes por Faturamento
      </CardTitle>
    </CardHeader>
    <CardContent>
      <ScrollArea className="h-[200px]">
        <div className="space-y-3 pr-2">
          {companies.map((company, idx) => (
            <motion.div
              key={`${company.company}-${idx}`}
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: idx * 0.04 }}
              className="space-y-1.5"
            >
              <div className="flex items-center justify-between">
                <span className="font-semibold text-sm truncate flex-1">{company.company}</span>
                <span className="text-xs text-muted-foreground shrink-0 ml-2">
                  {company.ordersCount} pedidos · {formatCurrency(company.totalValue)}
                </span>
              </div>
              <div className="w-full h-1.5 rounded-full bg-muted/50 overflow-hidden">
                <div
                  className={cn("h-full rounded-full bg-gradient-to-r transition-all duration-700", BAR_COLORS[idx % BAR_COLORS.length])}
                  style={{ width: `${maxValue > 0 ? (company.totalValue / maxValue) * 100 : 0}%` }}
                />
              </div>
            </motion.div>
          ))}
          {companies.length === 0 && (
            <div className="text-center py-8 text-muted-foreground">
              <Building className="h-8 w-8 mx-auto mb-2 opacity-50" />
              <p className="text-sm">Nenhuma empresa encontrada</p>
            </div>
          )}
        </div>
      </ScrollArea>
    </CardContent>
  </Card>
);

export const BITopClientsSection = memo(({ className }: { className?: string }) => {
  const { data, isLoading } = useBITopClients();

  if (isLoading) {
    return (
      <div className={cn("grid grid-cols-1 lg:grid-cols-2 gap-6", className)}>
        {[1, 2].map(i => (
          <Card key={i} className="glass-card">
            <CardContent className="p-6">
              <div className="animate-pulse space-y-4">
                <div className="h-6 bg-muted rounded w-1/3" />
                {[1, 2, 3, 4].map(j => (
                  <div key={j} className="space-y-2">
                    <div className="h-4 bg-muted rounded w-full" />
                    <div className="h-1.5 bg-muted rounded w-3/4" />
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  const topClients = data?.topClients || [];
  const supplierSales = data?.supplierSales || [];
  const topCompanies = data?.topCompanies || [];

  const maxClientValue = topClients[0]?.totalValue || 0;
  const maxSupplierValue = supplierSales[0]?.totalValue || 0;
  const maxCompanyValue = topCompanies[0]?.totalValue || 0;

  return (
    <div className={cn("space-y-6", className)}>
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <TopClientsCard clients={topClients} maxValue={maxClientValue} />
        <SupplierSalesCard suppliers={supplierSales} maxValue={maxSupplierValue} />
      </div>
      <TopCompaniesCard companies={topCompanies} maxValue={maxCompanyValue} />
    </div>
  );
});

BITopClientsSection.displayName = "BITopClientsSection";
