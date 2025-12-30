// ============================================================================
// BULK IMPORT - IMPORTAÇÃO EM MASSA
// src/components/shared/BulkImport.tsx
// ============================================================================

import { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import * as XLSX from 'xlsx';
import { toast } from 'sonner';
import { Upload, FileSpreadsheet, AlertCircle } from 'lucide-react';

interface BulkImportProps {
  entity: 'clients' | 'products' | 'deals' | 'activities';
  onImport: (data: any[]) => Promise<void>;
  schema: Record<string, string>;
  isOpen: boolean;
  onClose: () => void;
}

export const BulkImport: React.FC<BulkImportProps> = ({
  entity,
  onImport,
  schema,
  isOpen,
  onClose,
}) => {
  const [file, setFile] = useState<File | null>(null);
  const [preview, setPreview] = useState<any[]>([]);
  const [mapping, setMapping] = useState<Record<string, string>>({});
  const [csvColumns, setCsvColumns] = useState<string[]>([]);
  const [isImporting, setIsImporting] = useState(false);

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      const data = await file.arrayBuffer();
      const workbook = XLSX.read(data);
      const worksheet = workbook.Sheets[workbook.SheetNames[0]];
      const json = XLSX.utils.sheet_to_json(worksheet) as any[];

      if (json.length === 0) {
        toast.error('Arquivo vazio');
        return;
      }

      const columns = Object.keys(json[0]);
      setCsvColumns(columns);

      // Auto-mapear
      const autoMapping: Record<string, string> = {};
      columns.forEach(col => {
        const normalized = col.toLowerCase().trim();
        Object.keys(schema).forEach(dbCol => {
          if (normalized.includes(dbCol.toLowerCase())) {
            autoMapping[col] = dbCol;
          }
        });
      });
      setMapping(autoMapping);

      setPreview(json.slice(0, 5));
      setFile(file);

      toast.success(`${json.length} linhas detectadas`);
    } catch (error) {
      console.error('File parse error:', error);
      toast.error('Erro ao ler arquivo');
    }
  };

  const handleImport = async () => {
    if (!file || preview.length === 0) return;

    const requiredFields = Object.keys(schema).filter(
      key => schema[key].includes('required')
    );
    const missingFields = requiredFields.filter(field => !Object.values(mapping).includes(field));

    if (missingFields.length > 0) {
      toast.error(`Campos obrigatórios: ${missingFields.join(', ')}`);
      return;
    }

    setIsImporting(true);

    try {
      const data = await file.arrayBuffer();
      const workbook = XLSX.read(data);
      const worksheet = workbook.Sheets[workbook.SheetNames[0]];
      const json = XLSX.utils.sheet_to_json(worksheet) as any[];

      const mapped = json.map(row => {
        const mappedRow: any = {};
        Object.entries(mapping).forEach(([csvCol, dbCol]) => {
          mappedRow[dbCol] = row[csvCol];
        });
        return mappedRow;
      });

      const batchSize = 100;
      let imported = 0;

      for (let i = 0; i < mapped.length; i += batchSize) {
        const batch = mapped.slice(i, i + batchSize);
        await onImport(batch);
        imported += batch.length;

        toast.loading(`Importando... ${imported}/${mapped.length}`);
      }

      toast.success(`${mapped.length} registros importados!`);

      setFile(null);
      setPreview([]);
      setMapping({});
      setCsvColumns([]);
      onClose();
    } catch (error) {
      console.error('Import error:', error);
      toast.error('Erro ao importar');
    } finally {
      setIsImporting(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-auto">
        <DialogHeader>
          <DialogTitle>Importação em Massa - {entity}</DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
          <div>
            <Label>1. Selecione o arquivo (CSV ou Excel)</Label>
            <Input
              type="file"
              accept=".csv,.xlsx,.xls"
              onChange={handleFileUpload}
              className="mt-2"
            />
          </div>

          {csvColumns.length > 0 && (
            <div>
              <Label>2. Mapeie as colunas</Label>
              <div className="grid grid-cols-2 gap-4 mt-2">
                {csvColumns.map(col => (
                  <div key={col} className="flex items-center gap-2">
                    <span className="text-sm font-medium w-1/2">{col}</span>
                    <Select
                      value={mapping[col]}
                      onValueChange={value =>
                        setMapping(prev => ({ ...prev, [col]: value }))
                      }
                    >
                      <SelectTrigger className="w-1/2">
                        <SelectValue placeholder="Campo" />
                      </SelectTrigger>
                      <SelectContent>
                        {Object.keys(schema).map(field => (
                          <SelectItem key={field} value={field}>
                            {field} {schema[field].includes('required') && '*'}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                ))}
              </div>
            </div>
          )}

          {preview.length > 0 && (
            <div>
              <Label>3. Preview</Label>
              <div className="mt-2 border rounded-lg overflow-auto max-h-60">
                <Table>
                  <TableHeader>
                    <TableRow>
                      {Object.values(mapping).map((dbCol, i) => (
                        <TableHead key={i}>{dbCol}</TableHead>
                      ))}
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {preview.map((row, i) => (
                      <TableRow key={i}>
                        {Object.keys(mapping).map((csvCol, j) => (
                          <TableCell key={j}>{row[csvCol]}</TableCell>
                        ))}
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            </div>
          )}

          <div className="flex justify-end gap-2">
            <Button variant="outline" onClick={onClose}>
              Cancelar
            </Button>
            <Button
              onClick={handleImport}
              disabled={!file || Object.keys(mapping).length === 0 || isImporting}
            >
              {isImporting ? 'Importando...' : 'Importar'}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

// ============================================================================
// WEBHOOKS - MIGRATION SQL
// supabase/migrations/YYYYMMDD_webhooks.sql
// ============================================================================

/*
-- Tabela de webhooks
CREATE TABLE IF NOT EXISTS webhooks (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  url TEXT NOT NULL,
  events TEXT[] NOT NULL,
  secret TEXT NOT NULL,
  active BOOLEAN DEFAULT true,
  headers JSONB,
  retry_config JSONB DEFAULT '{"max_retries": 3, "backoff_seconds": [10, 60, 300]}'::jsonb,
  created_by UUID REFERENCES auth.users NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Tabela de deliveries
CREATE TABLE IF NOT EXISTS webhook_deliveries (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  webhook_id UUID REFERENCES webhooks NOT NULL,
  event_type TEXT NOT NULL,
  payload JSONB NOT NULL,
  attempt_number INTEGER DEFAULT 1,
  response_status INTEGER,
  response_body TEXT,
  delivered_at TIMESTAMP WITH TIME ZONE,
  next_retry_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Triggers para eventos
CREATE OR REPLACE FUNCTION notify_webhook_deal_created()
RETURNS TRIGGER AS $$
BEGIN
  PERFORM trigger_webhooks('deal.created', to_jsonb(NEW));
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER webhook_deal_created
  AFTER INSERT ON deals
  FOR EACH ROW
  EXECUTE FUNCTION notify_webhook_deal_created();
*/

// ============================================================================
// WEBHOOKS - HOOK & COMPONENTE
// src/hooks/useWebhooks.ts
// ============================================================================

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

interface Webhook {
  id: string;
  name: string;
  url: string;
  events: string[];
  active: boolean;
  created_at: string;
}

export const useWebhooks = () => {
  return useQuery({
    queryKey: ['webhooks'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('webhooks')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      return data as Webhook[];
    },
  });
};

export const useCreateWebhook = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (webhook: Omit<Webhook, 'id' | 'created_at'>) => {
      const { data, error } = await supabase
        .from('webhooks')
        .insert(webhook)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['webhooks'] });
      toast.success('Webhook criado');
    },
  });
};

// ============================================================================
// VIRTUAL SCROLLING
// src/components/pipeline/VirtualizedPipelineColumn.tsx
// ============================================================================

import { FixedSizeList } from 'react-window';
import AutoSizer from 'react-virtualized-auto-sizer';

interface VirtualizedListProps<T> {
  items: T[];
  itemHeight: number;
  renderItem: (item: T, index: number) => React.ReactNode;
  overscanCount?: number;
}

export function VirtualizedList<T>({
  items,
  itemHeight,
  renderItem,
  overscanCount = 3,
}: VirtualizedListProps<T>) {
  const Row = ({ index, style }: { index: number; style: React.CSSProperties }) => (
    <div style={style}>
      {renderItem(items[index], index)}
    </div>
  );

  return (
    <div className="h-full">
      <AutoSizer>
        {({ height, width }) => (
          <FixedSizeList
            height={height}
            width={width}
            itemCount={items.length}
            itemSize={itemHeight}
            overscanCount={overscanCount}
          >
            {Row}
          </FixedSizeList>
        )}
      </AutoSizer>
    </div>
  );
}

// Uso em Pipeline
export const VirtualizedPipelineColumn = ({ deals }: { deals: Deal[] }) => {
  return (
    <VirtualizedList
      items={deals}
      itemHeight={120}
      renderItem={(deal) => <DealCard deal={deal} />}
    />
  );
};
