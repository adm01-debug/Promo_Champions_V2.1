import { FC, useState } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { 
  Upload, 
  File, 
  Image, 
  FileText, 
  Trash2, 
  Download, 
  Eye,
  X,
  CheckCircle2,
  AlertCircle,
  Loader2 
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { motion, AnimatePresence } from 'framer-motion';

interface FileItem {
  id: string;
  name: string;
  size: number;
  type: string;
  url?: string;
  uploadProgress?: number;
  status: 'uploading' | 'complete' | 'error';
  errorMessage?: string;
}

interface FileListProps {
  files: FileItem[];
  onRemove?: (file: FileItem) => void;
  onDownload?: (file: FileItem) => void;
  onPreview?: (file: FileItem) => void;
  className?: string;
}

const formatFileSize = (bytes: number): string => {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
};

const getFileIcon = (type: string) => {
  if (type.startsWith('image/')) return Image;
  if (type.includes('pdf') || type.includes('document')) return FileText;
  return File;
};

export const FileList: FC<FileListProps> = ({
  files,
  onRemove,
  onDownload,
  onPreview,
  className,
}) => {
  if (files.length === 0) return null;

  return (
    <div className={cn('space-y-2', className)}>
      <AnimatePresence>
        {files.map(file => {
          const Icon = getFileIcon(file.type);
          
          return (
            <motion.div
              key={file.id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, x: -20 }}
              className={cn(
                'flex items-center gap-3 p-3 rounded-lg border',
                file.status === 'error' && 'border-destructive/50 bg-destructive/5'
              )}
            >
              <div className={cn(
                'p-2 rounded-lg',
                file.status === 'error' ? 'bg-destructive/10' : 'bg-muted'
              )}>
                <Icon size={20} className={file.status === 'error' ? 'text-destructive' : ''} />
              </div>

              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <p className="font-medium text-sm truncate">{file.name}</p>
                  {file.status === 'complete' && (
                    <CheckCircle2 size={14} className="text-green-500 shrink-0" />
                  )}
                  {file.status === 'error' && (
                    <AlertCircle size={14} className="text-destructive shrink-0" />
                  )}
                </div>
                <p className="text-xs text-muted-foreground">
                  {formatFileSize(file.size)}
                </p>
                {file.status === 'uploading' && file.uploadProgress !== undefined && (
                  <Progress value={file.uploadProgress} className="h-1 mt-1" />
                )}
                {file.status === 'error' && file.errorMessage && (
                  <p className="text-xs text-destructive mt-1">{file.errorMessage}</p>
                )}
              </div>

              <div className="flex gap-1 shrink-0">
                {file.status === 'uploading' ? (
                  <Loader2 size={16} className="animate-spin text-muted-foreground" />
                ) : (
                  <>
                    {file.url && onPreview && (
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8"
                        onClick={() => onPreview(file)}
                      >
                        <Eye size={14} />
                      </Button>
                    )}
                    {file.url && onDownload && (
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8"
                        onClick={() => onDownload(file)}
                      >
                        <Download size={14} />
                      </Button>
                    )}
                    {onRemove && (
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8 text-destructive hover:text-destructive"
                        onClick={() => onRemove(file)}
                      >
                        <Trash2 size={14} />
                      </Button>
                    )}
                  </>
                )}
              </div>
            </motion.div>
          );
        })}
      </AnimatePresence>
    </div>
  );
};

interface FileDropZoneProps {
  onFilesSelected: (files: File[]) => void;
  accept?: string;
  maxSize?: number;
  maxFiles?: number;
  disabled?: boolean;
  className?: string;
}

export const FileDropZone: FC<FileDropZoneProps> = ({
  onFilesSelected,
  accept,
  maxSize = 10 * 1024 * 1024, // 10MB
  maxFiles = 5,
  disabled = false,
  className,
}) => {
  const [isDragging, setIsDragging] = useState(false);

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    if (!disabled) setIsDragging(true);
  };

  const handleDragLeave = () => {
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    
    if (disabled) return;
    
    const files = Array.from(e.dataTransfer.files).slice(0, maxFiles);
    const validFiles = files.filter(f => f.size <= maxSize);
    
    if (validFiles.length > 0) {
      onFilesSelected(validFiles);
    }
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      const files = Array.from(e.target.files).slice(0, maxFiles);
      const validFiles = files.filter(f => f.size <= maxSize);
      
      if (validFiles.length > 0) {
        onFilesSelected(validFiles);
      }
    }
  };

  return (
    <div
      onDragOver={handleDragOver}
      onDragLeave={handleDragLeave}
      onDrop={handleDrop}
      className={cn(
        'border-2 border-dashed rounded-lg p-6 text-center transition-colors',
        isDragging && 'border-primary bg-primary/5',
        disabled && 'opacity-50 cursor-not-allowed',
        !disabled && !isDragging && 'hover:border-muted-foreground/50 cursor-pointer',
        className
      )}
    >
      <input
        type="file"
        accept={accept}
        multiple={maxFiles > 1}
        onChange={handleFileSelect}
        disabled={disabled}
        className="hidden"
        id="file-upload"
      />
      <label htmlFor="file-upload" className="cursor-pointer">
        <Upload size={32} className="mx-auto text-muted-foreground mb-2" />
        <p className="font-medium">
          {isDragging ? 'Solte os arquivos aqui' : 'Arraste arquivos ou clique para selecionar'}
        </p>
        <p className="text-xs text-muted-foreground mt-1">
          Máx. {maxFiles} arquivos, {formatFileSize(maxSize)} cada
        </p>
      </label>
    </div>
  );
};
