/**
 * Guarda de console dos testes (etapa 149 / achado A-145).
 *
 * Antes, a suíte não olhava o console: erro do React (chave duplicada,
 * atualização em componente desmontado) e consulta devolvendo `undefined`
 * passavam em silêncio. Aqui cada `console.error`/`console.warn` é registrado e,
 * ao fim do teste, o `setup.ts` reprova o que não foi declarado como esperado
 * com `allowConsoleError`/`allowConsoleWarn`.
 *
 * A saída original continua indo para o console — a guarda não esconde o log,
 * só o transforma em falha quando ele não era o objeto do teste.
 */
export type ConsoleLevel = 'error' | 'warn';

type Matcher = string | RegExp;

const MAX_MESSAGE = 500;
const LEVELS: ConsoleLevel[] = ['error', 'warn'];

const allowed: Record<ConsoleLevel, Matcher[]> = { error: [], warn: [] };
const captured: Record<ConsoleLevel, string[]> = { error: [], warn: [] };
let installed = false;

/** Serializa os argumentos do console numa linha legível e limitada. */
export function formatConsoleArgs(args: unknown[]): string {
  const text = args
    .map(arg => {
      if (arg instanceof Error) return `${arg.name}: ${arg.message}`;
      if (typeof arg === 'string') return arg;
      if (arg === null || arg === undefined) return String(arg);
      try {
        return JSON.stringify(arg) ?? String(arg);
      } catch {
        return String(arg);
      }
    })
    .join(' ');
  return text.length > MAX_MESSAGE ? `${text.slice(0, MAX_MESSAGE)}…` : text;
}

function isAllowed(level: ConsoleLevel, text: string): boolean {
  return allowed[level].some(matcher =>
    typeof matcher === 'string' ? text.includes(matcher) : matcher.test(text)
  );
}

/** Declara, para o teste em curso, um erro de console esperado. */
export function allowConsoleError(matcher: Matcher): void {
  allowed.error.push(matcher);
}

/** Declara, para o teste em curso, um aviso de console esperado. */
export function allowConsoleWarn(matcher: Matcher): void {
  allowed.warn.push(matcher);
}

/** Zera capturas e declarações — chamado antes de cada teste pelo `setup.ts`. */
export function resetConsoleGuard(): void {
  for (const level of LEVELS) {
    allowed[level] = [];
    captured[level] = [];
  }
}

/** Saída de console que não foi declarada como esperada, prefixada pelo nível. */
export function unexpectedConsoleOutput(): string[] {
  return LEVELS.flatMap(level =>
    captured[level]
      .filter(text => !isAllowed(level, text))
      .map(text => `console.${level}: ${text}`)
  );
}

/** Envolve `console.error`/`console.warn` uma única vez por arquivo de teste. */
export function installConsoleGuard(): void {
  if (installed) return;
  installed = true;

  for (const level of LEVELS) {
    const original = console[level].bind(console);
    console[level] = (...args: unknown[]) => {
      captured[level].push(formatConsoleArgs(args));
      original(...args);
    };
  }
}
