import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Upload, AlertCircle, CheckCircle2 } from 'lucide-react';
import { useState } from 'react';
import { importCSV, ImportResult } from '@/lib/csvImporter';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Progress } from '@/components/ui/progress';
import { z } from 'zod';

export function CSVImporter<T>({ schema, onImport }: { schema: z.ZodSchema<T>; onImport: (d: T[]) => Promise<void> }) {
  const [result, setResult] = useState<ImportResult<T> | null>(null);
  const [loading, setLoading] = useState(false);
  const [progress, setProgress] = useState(0);

  const handleFile = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const f = e.target.files?.[0];
    if (!f) return;
    setLoading(true);
    setProgress(10);
    const r = await importCSV(f, schema);
    setResult(r);
    setProgress(50);
    setLoading(false);
  };

  const handleImport = async () => {
    if (!result?.success.length) return;
    setLoading(true);
    setProgress(60);
    await onImport(result.success);
    setProgress(100);
    setTimeout(() => { setResult(null); setProgress(0); }, 2000);
    setLoading(false);
  };

  return (
    <div className="space-y-4">
      <Input type="file" accept=".csv" onChange={handleFile} disabled={loading} />
      {loading && <Progress value={progress} />}
      {result && (
        <>
          <Alert variant={result.errors.length > 0 ? 'destructive' : 'default'}>
            {result.errors.length === 0 ? <CheckCircle2 className="h-4 w-4" /> : <AlertCircle className="h-4 w-4" />}
            <AlertDescription>{result.success.length} válidos, {result.errors.length} erros</AlertDescription>
          </Alert>
          {result.success.length > 0 && (
            <Button onClick={handleImport} disabled={loading} className="w-full">
              <Upload className="h-4 w-4 mr-2" />
              Importar {result.success.length}
            </Button>
          )}
        </>
      )}
    </div>
  );
}
