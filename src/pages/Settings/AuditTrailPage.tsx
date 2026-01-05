import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useAuditTrail } from '@/hooks/useAuditTrail';
import { Shield, Filter, Download, ChevronLeft, ChevronRight } from 'lucide-react';
import { format } from 'date-fns';

export const AuditTrailPage = () => {
  const [filters, setFilters] = useState({
    table_name: '',
    action: '',
    page: 1,
  });

  const { entries, total, page, totalPages, isLoading } = useAuditTrail(filters);

  const handleExport = () => {
    const csv = [
      ['Data', 'Usuário', 'Ação', 'Tabela', 'ID'].join(','),
      ...entries.map((e) =>
        [
          format(e.created_at, 'dd/MM/yyyy HH:mm'),
          e.user_email,
          e.action,
          e.table_name,
          e.record_id,
        ].join(',')
      ),
    ].join('\n');

    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `audit-trail-${Date.now()}.csv`;
    a.click();
  };

  return (
    <div className="container mx-auto py-8 space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Shield className="w-5 h-5" />
            Trilha de Auditoria
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex gap-4">
            <Select
              value={filters.table_name}
              onValueChange={(value) =>
                setFilters({ ...filters, table_name: value, page: 1 })
              }
            >
              <SelectTrigger className="w-48">
                <SelectValue placeholder="Tabela" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="">Todas</SelectItem>
                <SelectItem value="deals">Negócios</SelectItem>
                <SelectItem value="clients">Clientes</SelectItem>
                <SelectItem value="users">Usuários</SelectItem>
                <SelectItem value="activities">Atividades</SelectItem>
              </SelectContent>
            </Select>

            <Select
              value={filters.action}
              onValueChange={(value) =>
                setFilters({ ...filters, action: value, page: 1 })
              }
            >
              <SelectTrigger className="w-48">
                <SelectValue placeholder="Ação" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="">Todas</SelectItem>
                <SelectItem value="INSERT">Criação</SelectItem>
                <SelectItem value="UPDATE">Atualização</SelectItem>
                <SelectItem value="DELETE">Exclusão</SelectItem>
              </SelectContent>
            </Select>

            <Button onClick={handleExport} variant="outline">
              <Download className="w-4 h-4 mr-2" />
              Exportar
            </Button>
          </div>

          <div className="border rounded-lg">
            <table className="w-full">
              <thead className="bg-muted">
                <tr>
                  <th className="text-left p-3">Data/Hora</th>
                  <th className="text-left p-3">Usuário</th>
                  <th className="text-left p-3">Ação</th>
                  <th className="text-left p-3">Tabela</th>
                  <th className="text-left p-3">ID Registro</th>
                </tr>
              </thead>
              <tbody>
                {isLoading ? (
                  <tr>
                    <td colSpan={5} className="text-center p-8">
                      Carregando...
                    </td>
                  </tr>
                ) : entries.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="text-center p-8 text-muted-foreground">
                      Nenhum registro encontrado
                    </td>
                  </tr>
                ) : (
                  entries.map((entry) => (
                    <tr key={entry.id} className="border-t hover:bg-muted/50">
                      <td className="p-3">
                        {format(entry.created_at, 'dd/MM/yyyy HH:mm')}
                      </td>
                      <td className="p-3">{entry.user_email}</td>
                      <td className="p-3">
                        <span
                          className={`px-2 py-1 rounded text-xs ${
                            entry.action === 'INSERT'
                              ? 'bg-green-100 text-green-800'
                              : entry.action === 'UPDATE'
                              ? 'bg-blue-100 text-blue-800'
                              : 'bg-red-100 text-red-800'
                          }`}
                        >
                          {entry.action}
                        </span>
                      </td>
                      <td className="p-3">{entry.table_name}</td>
                      <td className="p-3 font-mono text-sm">
                        {entry.record_id.substring(0, 8)}...
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>

          {totalPages > 1 && (
            <div className="flex items-center justify-between">
              <p className="text-sm text-muted-foreground">
                Total: {total} registros
              </p>
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  disabled={page === 1}
                  onClick={() => setFilters({ ...filters, page: page - 1 })}
                >
                  <ChevronLeft className="w-4 h-4" />
                </Button>
                <span className="flex items-center px-3 text-sm">
                  {page} / {totalPages}
                </span>
                <Button
                  variant="outline"
                  size="sm"
                  disabled={page === totalPages}
                  onClick={() => setFilters({ ...filters, page: page + 1 })}
                >
                  <ChevronRight className="w-4 h-4" />
                </Button>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};
