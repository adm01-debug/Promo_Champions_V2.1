/**
 * Valida destinos que chegam do banco ou de integrações antes de entregá-los
 * ao roteador. Rotas internas não precisam de barras invertidas nem de origem
 * própria, então rejeitamos essas formas para evitar open redirect por URL
 * protocol-relative ou normalização de backslash.
 */
// Para valores já tipados como string, o retorno é booleano simples. O overload
// evita que o TypeScript conclua incorretamente que o ramo falso é `never`.
// Para dados externos, o segundo overload ainda faz o estreitamento necessário.
export function isSafeInternalPath(value: string): boolean;
export function isSafeInternalPath(value: unknown): value is string;
export function isSafeInternalPath(value: unknown): boolean {
  if (typeof value !== 'string' || value.length === 0 || value.trim() !== value) {
    return false;
  }

  if (!value.startsWith('/') || value.startsWith('//') || value.includes('\\')) {
    return false;
  }

  try {
    const decoded = decodeURIComponent(value);
    return !decoded.startsWith('//') && !decoded.includes('\\');
  } catch {
    return false;
  }
}

export function isSafeExternalHttpUrl(value: string): boolean;
export function isSafeExternalHttpUrl(value: unknown): value is string;
export function isSafeExternalHttpUrl(value: unknown): boolean {
  if (typeof value !== 'string') return false;

  try {
    const url = new URL(value);
    return url.protocol === 'https:' || url.protocol === 'http:';
  } catch {
    return false;
  }
}

export function safeNavigationHref(value: string): string {
  if (isSafeInternalPath(value) || isSafeExternalHttpUrl(value) || value.startsWith('#')) {
    return value;
  }

  return '#';
}
