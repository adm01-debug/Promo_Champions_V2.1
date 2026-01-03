// CRUD Toolkit - Índice de Exports
// Copie este arquivo para src/lib/crud/index.ts em cada sistema

// Hooks
export { useCRUD } from '@/hooks/useCRUD';
export { useSavedFilters } from '@/hooks/useSavedFilters';
export { useDuplicate } from '@/hooks/useDuplicate';
export { useInfiniteScroll } from '@/hooks/useInfiniteScroll';
export { useBulkActions } from '@/hooks/useBulkActions';

// Components
export { DataImporter } from '@/components/DataImporter';
export { BulkActionsBar } from '@/components/BulkActionsBar';
export { DuplicateButton } from '@/components/DuplicateButton';
export { VersionHistory } from '@/components/VersionHistory';

// Utilities
export { importCSV } from '@/lib/csvImporter';
export { importExcel } from '@/lib/excelImporter';
