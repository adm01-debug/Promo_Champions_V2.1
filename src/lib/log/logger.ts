// CONSOLE-ENVELOPE — Envelope estruturado de log do frontend.
//
// Único ponto de saída para logs de aplicação (a regra eslint `no-console`
// bloqueia console.* direto no restante de src/). Produz linhas JSON
// correlacionáveis com os logs das edge functions (campos ts/level/fn/msg).
//
// Uso:
//   import { logger } from '@/lib/log/logger';
//   const log = logger.for('usePushNotifications');
//   log.info('service_worker_registered', { scope: registration.scope });
//
// `debug`/`info` só emitem em DEV; `warn`/`error` sempre emitem (e `error`
// alimenta o errorTracking/Sentry).

/* eslint-disable no-console -- ponto único de saída do envelope de log */
import { captureError } from '../errorTracking';

export type LogLevel = 'debug' | 'info' | 'warn' | 'error';

export interface LogEntry {
  ts: string;
  level: LogLevel;
  fn: string;
  msg: string;
  [key: string]: unknown;
}

export interface ScopedLogger {
  debug: (msg: string, extra?: Record<string, unknown>) => void;
  info: (msg: string, extra?: Record<string, unknown>) => void;
  warn: (msg: string, extra?: Record<string, unknown>) => void;
  error: (msg: string, extra?: Record<string, unknown>) => void;
}

function emit(
  scope: string,
  level: LogLevel,
  msg: string,
  extra?: Record<string, unknown>
): void {
  const entry: LogEntry = {
    ts: new Date().toISOString(),
    level,
    fn: scope,
    msg,
    ...extra,
  };
  const line = JSON.stringify(entry);
  if (level === 'error') console.error(line);
  else if (level === 'warn') console.warn(line);
  else if (level === 'info') console.info(line);
  else console.debug(line);

  if (level === 'error') {
    captureError(msg, { component: scope, metadata: extra });
  }
}

export const logger = {
  for(scope: string): ScopedLogger {
    const isDev = import.meta.env.DEV;
    return {
      debug: (msg, extra) => {
        if (isDev) emit(scope, 'debug', msg, extra);
      },
      info: (msg, extra) => {
        if (isDev) emit(scope, 'info', msg, extra);
      },
      warn: (msg, extra) => emit(scope, 'warn', msg, extra),
      error: (msg, extra) => emit(scope, 'error', msg, extra),
    };
  },
};
