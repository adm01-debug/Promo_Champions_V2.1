import React from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Truck, Mail, Phone } from "lucide-react";

interface Supplier {
  id: string;
  name: string;
  cnpj: string | null;
  contact_name: string | null;
  email: string | null;
  phone: string | null;
  lead_time_days: number | null;
  payment_terms: string | null;
  reliability_score: number | null;
  is_active: boolean;
}

interface SupplierTableProps {
  suppliers: Supplier[] | undefined;
  isLoading: boolean;
}

const getReliabilityBadge = (score: number | null) => {
  if (!score) return <Badge variant="outline">N/A</Badge>;
  if (score >= 0.9) return <Badge className="bg-status-success">Excelente</Badge>;
  if (score >= 0.7) return <Badge className="bg-status-info">Bom</Badge>;
  if (score >= 0.5) return <Badge variant="secondary">Regular</Badge>;
  return <Badge variant="destructive">Baixo</Badge>;
};

export const SupplierTable = React.memo(function SupplierTable({ suppliers, isLoading }: SupplierTableProps) {
  return (
    <Card className="glass border-border/40">
      <CardHeader>
        <CardTitle>Lista de Fornecedores</CardTitle>
        <CardDescription>Todos os fornecedores cadastrados no sistema</CardDescription>
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <div className="space-y-3">{[...Array(5)].map((_, i) => <Skeleton key={i} className="h-16 w-full" />)}</div>
        ) : suppliers && suppliers.length > 0 ? (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Fornecedor</TableHead>
                <TableHead>Contato</TableHead>
                <TableHead className="text-center">Lead Time</TableHead>
                <TableHead className="text-center">Pagamento</TableHead>
                <TableHead className="text-center">Confiabilidade</TableHead>
                <TableHead className="text-center">Status</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {suppliers.map((supplier) => (
                <TableRow key={supplier.id}>
                  <TableCell>
                    <div>
                      <div className="font-medium">{supplier.name}</div>
                      {supplier.cnpj && <div className="text-xs text-muted-foreground">{supplier.cnpj}</div>}
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="space-y-1">
                      {supplier.contact_name && <div className="text-sm">{supplier.contact_name}</div>}
                      <div className="flex items-center gap-3 text-xs text-muted-foreground">
                        {supplier.email && <span className="flex items-center gap-1"><Mail className="h-3 w-3" />{supplier.email}</span>}
                        {supplier.phone && <span className="flex items-center gap-1"><Phone className="h-3 w-3" />{supplier.phone}</span>}
                      </div>
                    </div>
                  </TableCell>
                  <TableCell className="text-center">{supplier.lead_time_days} dias</TableCell>
                  <TableCell className="text-center">{supplier.payment_terms}</TableCell>
                  <TableCell className="text-center">{getReliabilityBadge(supplier.reliability_score)}</TableCell>
                  <TableCell className="text-center">
                    <Badge variant={supplier.is_active ? "default" : "secondary"}>{supplier.is_active ? "Ativo" : "Inativo"}</Badge>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        ) : (
          <div className="text-center py-12 text-muted-foreground">
            <Truck className="h-12 w-12 mx-auto mb-4 opacity-50" />
            <p>Nenhum fornecedor cadastrado.</p>
            <p className="text-sm">Clique em "Novo Fornecedor" para começar.</p>
          </div>
        )}
      </CardContent>
    </Card>
  );
});
