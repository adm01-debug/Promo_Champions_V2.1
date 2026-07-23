/**
 * Utilitário RFC 4180 para geração de CSV compatível com Excel pt-BR.
 * - Separador ';' (padrão pt-BR)
 * - UTF-8 BOM para acentuação
 * - Escapa aspas duplicando-as e envolve campos com vírgula/quebra em aspas
 */
export type CsvCell = string | number | boolean | null | undefined | Date;

export interface CsvColumn<T> {
  header: string;
  value: (row: T) => CsvCell;
}

const BOM = '\ufeff';
const SEP = ';';
const EOL = '\r\n';

function escape(cell: CsvCell): string {
  if (cell === null || cell === undefined) return '';
  const raw = cell instanceof Date ? cell.toISOString() : String(cell);
  const needsQuote = /[";\r\n]/.test(raw) || raw.includes(SEP);
  const escaped = raw.replace(/"/g, '""');
  return needsQuote ? `"${escaped}"` : escaped;
}

export function buildCsv<T>(rows: T[], columns: CsvColumn<T>[]): string {
  const head = columns.map((c) => escape(c.header)).join(SEP);
  const body = rows
    .map((r) => columns.map((c) => escape(c.value(r))).join(SEP))
    .join(EOL);
  return `${BOM}${head}${EOL}${body}${EOL}`;
}

export function downloadCsv(filename: string, csv: string): void {
  const blob = new Blob([csv], { type: 'text/csv;charset=utf-8' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}
