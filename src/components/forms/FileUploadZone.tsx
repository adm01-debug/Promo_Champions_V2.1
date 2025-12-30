import { FC, useState, useCallback, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Upload, X, File, Image, FileText, CheckCircle, AlertCircle, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { cn } from '@/lib/utils';

interface UploadedFile {
  id: string;
  file: File;
  progress: number;
  status: 'uploading' | 'success' | 'error';
  error?: string;
  url?: string;
}

interface FileUploadZoneProps {
  accept?: string;
  maxSize?: number; // in bytes
  maxFiles?: number;
  multiple?: boolean;
  onUpload: (files: File[]) => Promise<void>;
  onRemove?: (fileId: string) => void;
  disabled?: boolean;
  className?: string;
}

export const FileUploadZone: FC<FileUploadZoneProps> = ({
  accept = '*/*',
  maxSize = 10 * 1024 * 1024, // 10MB default
  maxFiles = 5,
  multiple = true,
  onUpload,
  onRemove,
  disabled,
  className
}) => {
  const [isDragging, setIsDragging] = useState(false);
  const [files, setFiles] = useState<UploadedFile[]>([]);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const formatFileSize = (bytes: number) => {
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
  };

  const getFileIcon = (type: string) => {
    if (type.startsWith('image/')) return Image;
    if (type.includes('pdf') || type.includes('document')) return FileText;
    return File;
  };

  const validateFile = (file: File): string | null => {
    if (file.size > maxSize) {
      return `Arquivo muito grande. Máximo: ${formatFileSize(maxSize)}`;
    }
    return null;
  };

  const handleFiles = useCallback(async (fileList: FileList | null) => {
    if (!fileList || disabled) return;

    const newFiles: UploadedFile[] = [];
    const validFiles: File[] = [];

    Array.from(fileList).slice(0, maxFiles - files.length).forEach((file) => {
      const error = validateFile(file);
      const uploadedFile: UploadedFile = {
        id: `${Date.now()}-${Math.random()}`,
        file,
        progress: error ? 0 : 0,
        status: error ? 'error' : 'uploading',
        error
      };
      newFiles.push(uploadedFile);
      if (!error) validFiles.push(file);
    });

    setFiles(prev => [...prev, ...newFiles]);

    if (validFiles.length > 0) {
      try {
        // Simulate progress
        const interval = setInterval(() => {
          setFiles(prev => prev.map(f => 
            f.status === 'uploading' && f.progress < 90
              ? { ...f, progress: f.progress + 10 }
              : f
          ));
        }, 200);

        await onUpload(validFiles);
        
        clearInterval(interval);
        
        // Mark as success
        setFiles(prev => prev.map(f => 
          f.status === 'uploading'
            ? { ...f, progress: 100, status: 'success' }
            : f
        ));
      } catch (error) {
        setFiles(prev => prev.map(f => 
          f.status === 'uploading'
            ? { ...f, status: 'error', error: 'Erro ao fazer upload' }
            : f
        ));
      }
    }
  }, [disabled, files.length, maxFiles, maxSize, onUpload]);

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    if (!disabled) setIsDragging(true);
  }, [disabled]);

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  }, []);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    handleFiles(e.dataTransfer.files);
  }, [handleFiles]);

  const removeFile = (id: string) => {
    setFiles(prev => prev.filter(f => f.id !== id));
    onRemove?.(id);
  };

  return (
    <div className={cn('space-y-4', className)}>
      {/* Drop zone */}
      <div
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        onClick={() => fileInputRef.current?.click()}
        className={cn(
          'relative border-2 border-dashed rounded-lg p-8 text-center transition-all cursor-pointer',
          isDragging
            ? 'border-primary bg-primary/5'
            : 'border-border hover:border-primary/50 hover:bg-muted/50',
          disabled && 'opacity-50 cursor-not-allowed'
        )}
      >
        <input
          ref={fileInputRef}
          type="file"
          accept={accept}
          multiple={multiple}
          onChange={(e) => handleFiles(e.target.files)}
          disabled={disabled}
          className="hidden"
        />

        <motion.div
          animate={{ scale: isDragging ? 1.05 : 1 }}
          className="flex flex-col items-center gap-2"
        >
          <div className={cn(
            'p-4 rounded-full transition-colors',
            isDragging ? 'bg-primary/10' : 'bg-muted'
          )}>
            <Upload className={cn(
              'w-8 h-8',
              isDragging ? 'text-primary' : 'text-muted-foreground'
            )} />
          </div>
          
          <div>
            <p className="font-medium">
              {isDragging ? 'Solte os arquivos aqui' : 'Arraste arquivos ou clique para selecionar'}
            </p>
            <p className="text-sm text-muted-foreground mt-1">
              Máximo {maxFiles} arquivos, {formatFileSize(maxSize)} cada
            </p>
          </div>
        </motion.div>
      </div>

      {/* File list */}
      <AnimatePresence>
        {files.map((file) => {
          const FileIcon = getFileIcon(file.file.type);
          
          return (
            <motion.div
              key={file.id}
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, x: -10 }}
              className={cn(
                'flex items-center gap-3 p-3 rounded-lg border',
                file.status === 'error' ? 'border-destructive/50 bg-destructive/5' : 'border-border'
              )}
            >
              <div className={cn(
                'p-2 rounded-lg',
                file.status === 'error' ? 'bg-destructive/10' : 'bg-muted'
              )}>
                <FileIcon className={cn(
                  'w-5 h-5',
                  file.status === 'error' ? 'text-destructive' : 'text-muted-foreground'
                )} />
              </div>

              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium truncate">{file.file.name}</p>
                <p className="text-xs text-muted-foreground">
                  {formatFileSize(file.file.size)}
                </p>
                
                {file.status === 'uploading' && (
                  <Progress value={file.progress} className="h-1 mt-2" />
                )}
                
                {file.status === 'error' && file.error && (
                  <p className="text-xs text-destructive mt-1">{file.error}</p>
                )}
              </div>

              <div className="flex items-center gap-2">
                {file.status === 'uploading' && (
                  <Loader2 className="w-5 h-5 text-primary animate-spin" />
                )}
                {file.status === 'success' && (
                  <CheckCircle className="w-5 h-5 text-success" />
                )}
                {file.status === 'error' && (
                  <AlertCircle className="w-5 h-5 text-destructive" />
                )}
                
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-8 w-8"
                  onClick={() => removeFile(file.id)}
                >
                  <X className="w-4 h-4" />
                </Button>
              </div>
            </motion.div>
          );
        })}
      </AnimatePresence>
    </div>
  );
};
