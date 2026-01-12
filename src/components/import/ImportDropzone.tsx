import { FC, useState, useRef, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Upload, 
  FileSpreadsheet, 
  FileText, 
  X, 
  Check, 
  AlertCircle,
  Loader2 
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { cn } from '@/lib/utils';

interface ImportDialogProps {
  onImport: (file: File) => Promise<{ success: boolean; message?: string; count?: number }>;
  accept?: string;
  maxSize?: number; // in MB
  className?: string;
}

/**
 * ImportDropzone - Drag and drop file import component
 */
export const ImportDropzone: FC<ImportDialogProps> = ({
  onImport,
  accept = '.csv,.xlsx,.xls',
  maxSize = 10,
  className,
}) => {
  const [isDragging, setIsDragging] = useState(false);
  const [file, setFile] = useState<File | null>(null);
  const [status, setStatus] = useState<'idle' | 'uploading' | 'success' | 'error'>('idle');
  const [message, setMessage] = useState('');
  const [progress, setProgress] = useState(0);
  const inputRef = useRef<HTMLInputElement>(null);

  const handleDragEnter = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(true);
  }, []);

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
  }, []);

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
  }, []);

  const validateFile = useCallback((file: File): string | null => {
    const extension = file.name.split('.').pop()?.toLowerCase();
    const validExtensions = accept.split(',').map(ext => ext.trim().replace('.', ''));
    
    if (!validExtensions.includes(extension || '')) {
      return `Formato inválido. Use: ${accept}`;
    }
    
    const sizeMB = file.size / (1024 * 1024);
    if (sizeMB > maxSize) {
      return `Arquivo muito grande. Máximo: ${maxSize}MB`;
    }
    
    return null;
  }, [accept, maxSize]);

  const processFile = useCallback(async (selectedFile: File) => {
    const error = validateFile(selectedFile);
    if (error) {
      setStatus('error');
      setMessage(error);
      return;
    }

    setFile(selectedFile);
    setStatus('uploading');
    setProgress(0);

    // Simulate progress
    const progressInterval = setInterval(() => {
      setProgress(prev => Math.min(prev + 10, 90));
    }, 200);

    try {
      const result = await onImport(selectedFile);
      clearInterval(progressInterval);
      setProgress(100);
      
      if (result.success) {
        setStatus('success');
        setMessage(result.message || `${result.count || 0} registros importados`);
      } else {
        setStatus('error');
        setMessage(result.message || 'Erro ao importar arquivo');
      }
    } catch (err) {
      clearInterval(progressInterval);
      setStatus('error');
      setMessage('Erro ao processar arquivo');
    }
  }, [onImport, validateFile]);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);

    const droppedFile = e.dataTransfer.files[0];
    if (droppedFile) {
      processFile(droppedFile);
    }
  }, [processFile]);

  const handleFileSelect = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0];
    if (selectedFile) {
      processFile(selectedFile);
    }
  }, [processFile]);

  const reset = useCallback(() => {
    setFile(null);
    setStatus('idle');
    setMessage('');
    setProgress(0);
    if (inputRef.current) {
      inputRef.current.value = '';
    }
  }, []);

  const getFileIcon = () => {
    if (!file) return Upload;
    const ext = file.name.split('.').pop()?.toLowerCase();
    return ext === 'csv' ? FileText : FileSpreadsheet;
  };

  const FileIcon = getFileIcon();

  return (
    <div className={cn("space-y-4", className)}>
      <div
        onDragEnter={handleDragEnter}
        onDragLeave={handleDragLeave}
        onDragOver={handleDragOver}
        onDrop={handleDrop}
        onClick={() => status === 'idle' && inputRef.current?.click()}
        className={cn(
          "relative border-2 border-dashed rounded-xl p-8 text-center cursor-pointer transition-all",
          isDragging && "border-primary bg-primary/5",
          status === 'idle' && "hover:border-primary/50 hover:bg-muted/50",
          status === 'success' && "border-green-500 bg-green-500/5",
          status === 'error' && "border-destructive bg-destructive/5",
          status === 'uploading' && "cursor-default"
        )}
      >
        <input
          ref={inputRef}
          type="file"
          accept={accept}
          onChange={handleFileSelect}
          className="hidden"
        />

        <AnimatePresence mode="wait">
          {status === 'idle' && (
            <motion.div
              key="idle"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="space-y-4"
            >
              <div className="w-16 h-16 mx-auto rounded-full bg-muted flex items-center justify-center">
                <Upload className="h-8 w-8 text-muted-foreground" />
              </div>
              <div>
                <p className="font-medium">Arraste um arquivo ou clique para selecionar</p>
                <p className="text-sm text-muted-foreground mt-1">
                  Formatos aceitos: {accept} (máx. {maxSize}MB)
                </p>
              </div>
            </motion.div>
          )}

          {status === 'uploading' && (
            <motion.div
              key="uploading"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="space-y-4"
            >
              <div className="w-16 h-16 mx-auto rounded-full bg-primary/10 flex items-center justify-center">
                <FileIcon className="h-8 w-8 text-primary" />
              </div>
              <div>
                <p className="font-medium">{file?.name}</p>
                <Progress value={progress} className="mt-3 h-2" />
                <p className="text-sm text-muted-foreground mt-2">
                  Processando... {progress}%
                </p>
              </div>
            </motion.div>
          )}

          {status === 'success' && (
            <motion.div
              key="success"
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0 }}
              className="space-y-4"
            >
              <div className="w-16 h-16 mx-auto rounded-full bg-green-500/10 flex items-center justify-center">
                <Check className="h-8 w-8 text-green-500" />
              </div>
              <div>
                <p className="font-medium text-green-600">Importação concluída!</p>
                <p className="text-sm text-muted-foreground mt-1">{message}</p>
              </div>
              <Button variant="outline" size="sm" onClick={reset}>
                Importar outro arquivo
              </Button>
            </motion.div>
          )}

          {status === 'error' && (
            <motion.div
              key="error"
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0 }}
              className="space-y-4"
            >
              <div className="w-16 h-16 mx-auto rounded-full bg-destructive/10 flex items-center justify-center">
                <AlertCircle className="h-8 w-8 text-destructive" />
              </div>
              <div>
                <p className="font-medium text-destructive">Erro na importação</p>
                <p className="text-sm text-muted-foreground mt-1">{message}</p>
              </div>
              <Button variant="outline" size="sm" onClick={reset}>
                Tentar novamente
              </Button>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
};
