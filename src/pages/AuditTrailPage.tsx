import { useAuditTrail } from '@/hooks/useAuditTrail';
import { useState } from 'react';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';

export function AuditTrailPage() {
  const [page, setPage] = useState(1);
  const { data, isLoading } = useAuditTrail({ page });

  return (
    <div className="container mx-auto p-6">
      <h1 className="text-3xl font-bold mb-6">Trilha de Auditoria</h1>
      {isLoading ? <div>Carregando...</div> : (
        <Card className="p-6">
          {data?.events.map((event) => (
            <div key={event.id} className="border-b pb-4">
              <Badge>{event.action}</Badge>
              <p>{event.resource_type}</p>
            </div>
          ))}
        </Card>
      )}
    </div>
  );
}
