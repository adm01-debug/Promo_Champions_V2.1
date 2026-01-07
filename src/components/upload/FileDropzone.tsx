import React, { useState, useRef, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Upload, X, File, Image, FileText, Film, Music } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';

interface FileDropzoneProps {
  accept?: string;
  multiple?: boolean;
  maxSize?: number; // in MB
  maxFiles?: number;
  onFilesSelected: (files: File[]) => void;
  onError?: (error: string) => void;
  className?: string;
  disabled?: boolean;
}

const getFileIcon = (type: string) => {
  if (type.startsWith('image/')) return Image;
  if (type.startsWith('video/')) return Film;
  if (type.startsWith('audio/')) return Music;
  if (type.includes('pdf') || type.includes('document')) return FileText;
  return File;
};

const formatFileSize = (bytes: number): string => {
  if (bytes === 0) return '0 B';
  const k = 1024;
  const sizes = ['B', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(1)) + ' ' + sizes[i];
};

export const FileDropzone: React.FC<FileDropzoneProps> = ({
  accept,
  multiple = false,
  maxSize = 10,
  maxFiles = 5,
  onFilesSelected,
  onError,
  className,
  disabled = false,
}) => {
  const [isDragging, setIsDragging] = useState(false);
  const [files, setFiles] = useState<File[]>([]);
  const inputRef = useRef<HTMLInputElement>(null);

  const validateFiles = useCallback(
    (fileList: FileList | File[]): File[] => {
      const validFiles: File[] = [];
      const fileArray = Array.from(fileList);

      for (const file of fileArray) {
        if (file.size > maxSize * 1024 * 1024) {
          onError?.(`${file.name} excede ${maxSize}MB`);
          continue;
        }
        if (accept) {
          const acceptedTypes = accept.split(',').map(t => t.trim());
          const isValid = acceptedTypes.some(type => {
            if (type.startsWith('.')) return file.name.endsWith(type);
            if (type.endsWith('/*')) return file.type.startsWith(type.replace('/*', ''));
            return file.type === type;
          });
          if (!isValid) {
            onError?.(`${file.name} não é um tipo válido`);
            continue;
          }
        }
        validFiles.push(file);
      }

      if (!multiple && validFiles.length > 1) return [validFiles[0]];
      if (validFiles.length > maxFiles) {
        onError?.(`Máximo de ${maxFiles} arquivos`);
        return validFiles.slice(0, maxFiles);
      }

      return validFiles;
    },
    [accept, maxSize, maxFiles, multiple, onError]
  );

  const handleDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault();
      setIsDragging(false);
      if (disabled) return;
      const validFiles = validateFiles(e.dataTransfer.files);
      if (validFiles.length) {
        setFiles(prev => (multiple ? [...prev, ...validFiles] : validFiles));
        onFilesSelected(validFiles);
      }
    },
    [disabled, multiple, validateFiles, onFilesSelected]
  );

  const handleChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      if (!e.target.files?.length) return;
      const validFiles = validateFiles(e.target.files);
      if (validFiles.length) {
        setFiles(prev => (multiple ? [...prev, ...validFiles] : validFiles));
        onFilesSelected(validFiles);
      }
    },
    [multiple, validateFiles, onFilesSelected]
  );

  const removeFile = (index: number) => {
    setFiles(prev => prev.filter((_, i) => i !== index));
  };

  return (
    <div className={cn('space-y-3', className)}>
      <motion.div
        onDragOver={e => { e.preventDefault(); setIsDragging(true); }}
        onDragLeave={() => setIsDragging(false)}
        onDrop={handleDrop}
        onClick={() => inputRef.current?.click()}
        animate={{ scale: isDragging ? 1.02 : 1 }}
        className={cn(
          'relative border-2 border-dashed rounded-lg p-8 text-center cursor-pointer transition-colors',
          isDragging ? 'border-primary bg-primary/5' : 'border-muted-foreground/30 hover:border-primary/50',
          disabled && 'opacity-50 cursor-not-allowed'
        )}
      >
        <input
          ref={inputRef}
          type="file"
          accept={accept}
          multiple={multiple}
          onChange={handleChange}
          disabled={disabled}
          className="hidden"
        />
        <Upload className={cn('mx-auto h-10 w-10 mb-3', isDragging ? 'text-primary' : 'text-muted-foreground')} />
        <p className="text-sm font-medium">
          {isDragging ? 'Solte aqui' : 'Arraste arquivos ou clique para selecionar'}
        </p>
        <p className="text-xs text-muted-foreground mt-1">
          Máx. {maxSize}MB {multiple && `• Até ${maxFiles} arquivos`}
        </p>
      </motion.div>

      <AnimatePresence>
        {files.map((file, index) => {
          const Icon = getFileIcon(file.type);
          return (
            <motion.div
              key={`${file.name}-${index}`}
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              className="flex items-center gap-3 p-3 bg-muted/50 rounded-lg"
            >
              <Icon className="h-5 w-5 text-muted-foreground flex-shrink-0" />
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium truncate">{file.name}</p>
                <p className="text-xs text-muted-foreground">{formatFileSize(file.size)}</p>
              </div>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => removeFile(index)}
                className="h-7 w-7 p-0"
              >
                <X className="h-4 w-4" />
              </Button>
            </motion.div>
          );
        })}
      </AnimatePresence>
    </div>
  );
};

interface UploadProgressProps {
  fileName: string;
  progress: number;
  onCancel?: () => void;
}

export const UploadProgress: React.FC<UploadProgressProps> = ({
  fileName,
  progress,
  onCancel,
}) => {
  return (
    <div className="flex items-center gap-3 p-3 bg-muted/50 rounded-lg">
      <File className="h-5 w-5 text-muted-foreground flex-shrink-0" />
      <div className="flex-1 min-w-0 space-y-1">
        <p className="text-sm font-medium truncate">{fileName}</p>
        <Progress value={progress} className="h-1" />
      </div>
      <span className="text-xs text-muted-foreground">{progress}%</span>
      {onCancel && progress < 100 && (
        <Button variant="ghost" size="sm" onClick={onCancel} className="h-7 w-7 p-0">
          <X className="h-4 w-4" />
        </Button>
      )}
    </div>
  );
};
