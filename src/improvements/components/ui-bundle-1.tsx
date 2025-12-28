// ============================================================================
// ERROR BOUNDARIES
// src/components/errors/ErrorBoundary.tsx
// ============================================================================

import { Component, ReactNode } from 'react';
import { Button } from '@/components/ui/button';
import { AlertTriangle, RefreshCw, Home } from 'lucide-react';

interface ErrorBoundaryProps {
  children: ReactNode;
  fallback?: ReactNode;
  onReset?: () => void;
  level?: 'page' | 'component' | 'critical';
}

interface ErrorBoundaryState {
  hasError: boolean;
  error?: Error;
  errorInfo?: any;
}

export class ErrorBoundary extends Component<ErrorBoundaryProps, ErrorBoundaryState> {
  constructor(props: ErrorBoundaryProps) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: any) {
    // Log error (usar Logger se disponível)
    console.error('[ErrorBoundary]', {
      error,
      errorInfo,
      level: this.props.level || 'component',
    });

    // Enviar para serviço de monitoramento (ex: Sentry)
    if (import.meta.env.PROD) {
      // window.Sentry?.captureException(error, { contexts: { react: errorInfo } });
    }
  }

  handleReset = () => {
    this.setState({ hasError: false, error: undefined, errorInfo: undefined });
    this.props.onReset?.();
  };

  handleReload = () => {
    window.location.reload();
  };

  handleGoHome = () => {
    window.location.href = '/dashboard';
  };

  render() {
    if (this.state.hasError) {
      // Custom fallback
      if (this.props.fallback) {
        return this.props.fallback;
      }

      // Default fallback baseado no level
      const { level = 'component' } = this.props;

      if (level === 'critical') {
        return (
          <div className="min-h-screen flex items-center justify-center bg-background p-6">
            <div className="max-w-md w-full space-y-6 text-center">
              <div className="flex justify-center">
                <div className="rounded-full bg-destructive/10 p-6">
                  <AlertTriangle className="h-12 w-12 text-destructive" />
                </div>
              </div>

              <div className="space-y-2">
                <h1 className="text-2xl font-bold">Erro Crítico</h1>
                <p className="text-muted-foreground">
                  Ocorreu um erro inesperado que impediu o carregamento da aplicação.
                </p>
              </div>

              {import.meta.env.DEV && this.state.error && (
                <details className="text-left p-4 bg-muted rounded-lg">
                  <summary className="cursor-pointer font-semibold mb-2">
                    Detalhes do Erro (DEV)
                  </summary>
                  <pre className="text-xs overflow-auto max-h-60">
                    {this.state.error.stack}
                  </pre>
                </details>
              )}

              <div className="flex gap-2 justify-center">
                <Button onClick={this.handleReload} variant="default">
                  <RefreshCw className="mr-2 h-4 w-4" />
                  Recarregar Página
                </Button>
                <Button onClick={this.handleGoHome} variant="outline">
                  <Home className="mr-2 h-4 w-4" />
                  Ir para Home
                </Button>
              </div>
            </div>
          </div>
        );
      }

      // Page or component level
      return (
        <div className="flex flex-col items-center justify-center min-h-[400px] p-6">
          <AlertTriangle className="h-12 w-12 text-destructive mb-4" />
          <h2 className="text-2xl font-bold mb-2">Algo deu errado</h2>
          <p className="text-muted-foreground mb-6 text-center max-w-md">
            Ocorreu um erro ao carregar este {level === 'page' ? 'página' : 'componente'}.
          </p>

          <div className="flex gap-2">
            <Button onClick={this.handleReset}>
              Tentar Novamente
            </Button>
            {level === 'page' && (
              <Button variant="outline" onClick={this.handleReload}>
                Recarregar Página
              </Button>
            )}
          </div>

          {import.meta.env.DEV && this.state.error && (
            <details className="mt-6 p-4 bg-muted rounded-lg max-w-2xl w-full">
              <summary className="cursor-pointer font-semibold">
                Detalhes do Erro (DEV)
              </summary>
              <pre className="mt-2 text-xs overflow-auto">
                {this.state.error.stack}
              </pre>
            </details>
          )}
        </div>
      );
    }

    return this.props.children;
  }
}

// ============================================================================
// INFINITE SCROLL
// src/hooks/useInfiniteScroll.ts
// ============================================================================

import { useInfiniteQuery } from '@tanstack/react-query';
import { useEffect } from 'react';
import { useInView } from 'react-intersection-observer';
import { supabase } from '@/integrations/supabase/client';

interface InfiniteScrollOptions<T> {
  queryKey: readonly unknown[];
  table: string;
  pageSize?: number;
  select?: string;
  orderBy?: { column: string; ascending?: boolean };
  filters?: Record<string, any>;
}

export function useInfiniteScroll<T>({
  queryKey,
  table,
  pageSize = 20,
  select = '*',
  orderBy = { column: 'created_at', ascending: false },
  filters = {},
}: InfiniteScrollOptions<T>) {
  return useInfiniteQuery({
    queryKey: [...queryKey, filters],
    queryFn: async ({ pageParam = 0 }) => {
      const from = pageParam;
      const to = from + pageSize - 1;

      let query = supabase
        .from(table)
        .select(select, { count: 'exact' })
        .range(from, to)
        .order(orderBy.column, { ascending: orderBy.ascending ?? false });

      // Aplicar filtros
      Object.entries(filters).forEach(([key, value]) => {
        if (value !== undefined && value !== null) {
          query = query.eq(key, value);
        }
      });

      const { data, error, count } = await query;
      if (error) throw error;

      return {
        items: (data || []) as T[],
        nextCursor: to + 1,
        hasMore: (count || 0) > to + 1,
        total: count || 0,
      };
    },
    getNextPageParam: (lastPage) =>
      lastPage.hasMore ? lastPage.nextCursor : undefined,
    initialPageParam: 0,
  });
}

// Hook para trigger automático
export function useInfiniteScrollTrigger(
  hasNextPage: boolean | undefined,
  isFetchingNextPage: boolean,
  fetchNextPage: () => void
) {
  const { ref, inView } = useInView({
    threshold: 0.1,
    rootMargin: '100px',
  });

  useEffect(() => {
    if (inView && hasNextPage && !isFetchingNextPage) {
      fetchNextPage();
    }
  }, [inView, hasNextPage, isFetchingNextPage, fetchNextPage]);

  return { ref, inView };
}

// ============================================================================
// DATA EXPORT
// src/lib/export.ts
// ============================================================================

import * as XLSX from 'xlsx';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import { saveAs } from 'file-saver';

export class DataExporter {
  /**
   * Exportar para Excel (.xlsx)
   */
  static toExcel(data: any[], filename: string, options?: {
    sheetName?: string;
    autoWidth?: boolean;
  }) {
    const ws = XLSX.utils.json_to_sheet(data);

    // Auto-width columns
    if (options?.autoWidth !== false) {
      const colWidths = Object.keys(data[0] || {}).map(key => ({
        wch: Math.max(key.length, ...data.map(row => String(row[key] || '').length)) + 2,
      }));
      ws['!cols'] = colWidths;
    }

    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, options?.sheetName || 'Dados');

    XLSX.writeFile(wb, `${filename}.xlsx`);
  }

  /**
   * Exportar para CSV
   */
  static toCSV(data: any[], filename: string) {
    const ws = XLSX.utils.json_to_sheet(data);
    const csv = XLSX.utils.sheet_to_csv(ws);

    const blob = new Blob(['\ufeff' + csv], { type: 'text/csv;charset=utf-8;' });
    saveAs(blob, `${filename}.csv`);
  }

  /**
   * Exportar para PDF
   */
  static toPDF(
    data: any[],
    columns: { header: string; dataKey: string }[],
    filename: string,
    options?: {
      title?: string;
      orientation?: 'portrait' | 'landscape';
      fontSize?: number;
    }
  ) {
    const doc = new jsPDF({
      orientation: options?.orientation || 'portrait',
    });

    // Título
    if (options?.title) {
      doc.setFontSize(16);
      doc.text(options.title, 14, 15);
    }

    // Tabela
    autoTable(doc, {
      head: [columns.map(col => col.header)],
      body: data.map(row => columns.map(col => row[col.dataKey])),
      startY: options?.title ? 25 : 15,
      styles: {
        fontSize: options?.fontSize || 8,
        cellPadding: 2,
      },
      headStyles: {
        fillColor: [79, 129, 189],
        fontStyle: 'bold',
      },
    });

    doc.save(`${filename}.pdf`);
  }

  /**
   * Exportar múltiplas sheets em um Excel
   */
  static toExcelMultiSheet(
    sheets: { name: string; data: any[] }[],
    filename: string
  ) {
    const wb = XLSX.utils.book_new();

    sheets.forEach(sheet => {
      const ws = XLSX.utils.json_to_sheet(sheet.data);
      XLSX.utils.book_append_sheet(wb, ws, sheet.name);
    });

    XLSX.writeFile(wb, `${filename}.xlsx`);
  }
}

// ============================================================================
// EXPORT BUTTON COMPONENT
// src/components/shared/ExportButton.tsx
// ============================================================================

import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Download, FileSpreadsheet, FileText, File } from 'lucide-react';

interface ExportButtonProps {
  data: any[];
  filename: string;
  columns?: { header: string; dataKey: string }[];
  title?: string;
  disabled?: boolean;
}

export const ExportButton: React.FC<ExportButtonProps> = ({
  data,
  filename,
  columns,
  title,
  disabled = false,
}) => {
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="outline" size="sm" disabled={disabled || !data?.length}>
          <Download className="mr-2 h-4 w-4" />
          Exportar
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        <DropdownMenuItem onClick={() => DataExporter.toExcel(data, filename)}>
          <FileSpreadsheet className="mr-2 h-4 w-4" />
          Excel (.xlsx)
        </DropdownMenuItem>
        <DropdownMenuItem onClick={() => DataExporter.toCSV(data, filename)}>
          <File className="mr-2 h-4 w-4" />
          CSV (.csv)
        </DropdownMenuItem>
        {columns && (
          <DropdownMenuItem
            onClick={() => DataExporter.toPDF(data, columns, filename, { title })}
          >
            <FileText className="mr-2 h-4 w-4" />
            PDF (.pdf)
          </DropdownMenuItem>
        )}
      </DropdownMenuContent>
    </DropdownMenu>
  );
};
