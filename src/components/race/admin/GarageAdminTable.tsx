import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Car } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useQuery } from '@tanstack/react-query';

interface CarRow {
  id: string;
  car_number: number;
  primary_color: string;
  secondary_color: string;
  car_style: string;
  nickname: string | null;
  salesperson_id: string;
}

export function GarageAdminTable() {
  const { data = [], isLoading } = useQuery({
    queryKey: ['admin-race-cars'],
    queryFn: async (): Promise<CarRow[]> => {
      const { data, error } = await supabase
        .from('race_cars')
        .select('id,car_number,primary_color,secondary_color,car_style,nickname,salesperson_id')
        .order('car_number');
      if (error) throw error;
      return (data ?? []) as CarRow[];
    },
  });

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2"><Car className="w-5 h-5" /> Garagem ({data.length})</CardTitle>
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <div className="space-y-2">{[1, 2, 3].map((i) => <Skeleton key={i} className="h-10" />)}</div>
        ) : data.length === 0 ? (
          <p className="text-sm text-muted-foreground py-6 text-center">Nenhum carro cadastrado.</p>
        ) : (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-12">#</TableHead>
                <TableHead>Apelido</TableHead>
                <TableHead>Estilo</TableHead>
                <TableHead>Cores</TableHead>
                <TableHead>Vendedor</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {data.map((c) => (
                <TableRow key={c.id}>
                  <TableCell className="font-bold tabular-nums">#{c.car_number}</TableCell>
                  <TableCell>{c.nickname ?? <span className="text-muted-foreground">—</span>}</TableCell>
                  <TableCell><Badge variant="outline">{c.car_style}</Badge></TableCell>
                  <TableCell>
                    <div className="flex items-center gap-1.5">
                      <div className="w-5 h-5 rounded border" style={{ background: c.primary_color }} />
                      <div className="w-5 h-5 rounded border" style={{ background: c.secondary_color }} />
                    </div>
                  </TableCell>
                  <TableCell className="text-xs text-muted-foreground font-mono">{c.salesperson_id.slice(0, 8)}…</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        )}
      </CardContent>
    </Card>
  );
}
