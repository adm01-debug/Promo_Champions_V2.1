import { FC, useState } from 'react';
import { 
  Download, 
  FileSpreadsheet, 
  FileText, 
  FileJson, 
  ChevronDown,
  Loader2 
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { cn } from '@/lib/utils';

type ExportFormat = 'csv' | 'xlsx' | 'pdf' | 'json';

interface ExportButtonProps {
  onExport: (format: ExportFormat) => void | Promise<void>;
  formats?: ExportFormat[];
  isLoading?: boolean;
  disabled?: boolean;
  className?: string;
  variant?: 'default' | 'outline' | 'ghost';
  size?: 'default' | 'sm' | 'lg' | 'icon';
  label?: string;
}

const formatConfig: Record<ExportFormat, { label: string; icon: FC<{ className?: string }> }> = {
  csv: { label: 'CSV', icon: FileText },
  xlsx: { label: 'Excel', icon: FileSpreadsheet },
  pdf: { label: 'PDF', icon: FileText },
  json: { label: 'JSON', icon: FileJson },
};

/**
 * ExportButton - Dropdown button for exporting data in various formats
 */
export const ExportButton: FC<ExportButtonProps> = ({
  onExport,
  formats = ['csv', 'xlsx', 'pdf'],
  isLoading = false,
  disabled = false,
  className,
  variant = 'outline',
  size = 'default',
  label = 'Exportar',
}) => {
  const [exportingFormat, setExportingFormat] = useState<ExportFormat | null>(null);

  const handleExport = async (format: ExportFormat) => {
    setExportingFormat(format);
    try {
      await onExport(format);
    } finally {
      setExportingFormat(null);
    }
  };

  // If only one format, show simple button
  if (formats.length === 1) {
    const format = formats[0];
    const config = formatConfig[format];
    
    return (
      <Button
        variant={variant}
        size={size}
        onClick={() => handleExport(format)}
        disabled={disabled || isLoading}
        className={cn("gap-2", className)}
      >
        {isLoading ? (
          <Loader2 className="h-4 w-4 animate-spin" />
        ) : (
          <config.icon className="h-4 w-4" />
        )}
        {label} ({config.label})
      </Button>
    );
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          variant={variant}
          size={size}
          disabled={disabled || isLoading}
          className={cn("gap-2", className)}
        >
          {isLoading ? (
            <Loader2 className="h-4 w-4 animate-spin" />
          ) : (
            <Download className="h-4 w-4" />
          )}
          {label}
          <ChevronDown className="h-3.5 w-3.5 opacity-50" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-40">
        {formats.map(format => {
          const config = formatConfig[format];
          return (
            <DropdownMenuItem
              key={format}
              onClick={() => handleExport(format)}
              disabled={exportingFormat !== null}
              className="gap-2"
            >
              {exportingFormat === format ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <config.icon className="h-4 w-4" />
              )}
              {config.label}
            </DropdownMenuItem>
          );
        })}
      </DropdownMenuContent>
    </DropdownMenu>
  );
};

interface QuickExportButtonsProps {
  onExport: (format: ExportFormat) => void | Promise<void>;
  formats?: ExportFormat[];
  isLoading?: boolean;
  disabled?: boolean;
  className?: string;
}

/**
 * QuickExportButtons - Row of individual export buttons
 */
export const QuickExportButtons: FC<QuickExportButtonsProps> = ({
  onExport,
  formats = ['csv', 'xlsx', 'pdf'],
  isLoading = false,
  disabled = false,
  className,
}) => {
  const [exportingFormat, setExportingFormat] = useState<ExportFormat | null>(null);

  const handleExport = async (format: ExportFormat) => {
    setExportingFormat(format);
    try {
      await onExport(format);
    } finally {
      setExportingFormat(null);
    }
  };

  return (
    <div className={cn("flex items-center gap-2", className)}>
      {formats.map(format => {
        const config = formatConfig[format];
        const isExporting = exportingFormat === format;
        
        return (
          <Button
            key={format}
            variant="ghost"
            size="sm"
            onClick={() => handleExport(format)}
            disabled={disabled || isLoading}
            className="gap-1.5"
          >
            {isExporting ? (
              <Loader2 className="h-3.5 w-3.5 animate-spin" />
            ) : (
              <config.icon className="h-3.5 w-3.5" />
            )}
            {config.label}
          </Button>
        );
      })}
    </div>
  );
};
