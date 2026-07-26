/**
 * Controle de vazão (throttle) para envios em massa de e-mail.
 *
 * Objetivo: nunca estourar o limite por minuto do provedor nem monopolizar a
 * fila compartilhada. Implementa uma janela deslizante simples: a cada N envios
 * (tamanho do lote) esperamos o tempo restante da janela corrente.
 *
 * Puro e determinístico: o relógio e o `sleep` são injetáveis para teste.
 */

export interface ThrottleConfig {
  /** Máximo de mensagens enfileiradas por minuto. */
  maxPerMinute: number;
  /** Quantidade de envios entre pausas. */
  batchSize: number;
}

export const DEFAULT_THROTTLE: ThrottleConfig = { maxPerMinute: 120, batchSize: 20 };

/** Converte um valor de env em inteiro positivo, com fallback seguro. */
export function parsePositiveInt(raw: string | null | undefined, fallback: number): number {
  if (raw === null || raw === undefined) return fallback;
  const trimmed = String(raw).trim();
  if (trimmed === "") return fallback;
  const n = Number(trimmed);
  if (!Number.isFinite(n)) return fallback;
  const i = Math.floor(n);
  return i > 0 ? i : fallback;
}

/**
 * Resolve a configuração a partir do ambiente.
 * `BULK_EMAIL_MAX_PER_MINUTE` e `BULK_EMAIL_BATCH_SIZE`.
 */
export function resolveThrottle(
  getEnv: (key: string) => string | undefined,
): ThrottleConfig {
  const maxPerMinute = parsePositiveInt(
    getEnv("BULK_EMAIL_MAX_PER_MINUTE"),
    DEFAULT_THROTTLE.maxPerMinute,
  );
  // O lote nunca pode exceder a cota da janela, senão a pausa vira inútil.
  const batchSize = Math.min(
    parsePositiveInt(getEnv("BULK_EMAIL_BATCH_SIZE"), DEFAULT_THROTTLE.batchSize),
    maxPerMinute,
  );
  return { maxPerMinute, batchSize };
}

/**
 * Calcula quanto esperar (ms) após `sentInWindow` envios iniciados em
 * `windowStart`. Retorna 0 quando ainda há cota ou a janela já expirou.
 */
export function computeDelayMs(
  config: ThrottleConfig,
  sentInWindow: number,
  windowStart: number,
  now: number,
): number {
  if (sentInWindow < config.maxPerMinute) {
    // Dentro da cota: só pausa a cada lote, e nunca mais que o resto da janela.
    if (sentInWindow === 0 || sentInWindow % config.batchSize !== 0) return 0;
  }
  const elapsed = now - windowStart;
  if (elapsed >= 60_000) return 0;
  const remaining = 60_000 - elapsed;
  if (sentInWindow >= config.maxPerMinute) return remaining;
  // Pausa proporcional entre lotes para distribuir os envios na janela.
  const perBatchMs = Math.ceil((60_000 * config.batchSize) / config.maxPerMinute);
  return Math.min(perBatchMs, remaining);
}

export type Sleep = (ms: number) => Promise<void>;

const defaultSleep: Sleep = (ms) => new Promise((r) => setTimeout(r, ms));

/** Marcador de vazão com estado de janela deslizante. */
export class SendPacer {
  private sent = 0;
  private windowStart: number;

  constructor(
    private readonly config: ThrottleConfig,
    private readonly now: () => number = () => Date.now(),
    private readonly sleep: Sleep = defaultSleep,
  ) {
    this.windowStart = this.now();
  }

  /** Chame após cada envio bem-sucedido; pausa quando necessário. */
  async afterSend(): Promise<number> {
    this.sent++;
    const delay = computeDelayMs(this.config, this.sent, this.windowStart, this.now());
    if (delay > 0) {
      await this.sleep(delay);
      this.windowStart = this.now();
      this.sent = 0;
    } else if (this.now() - this.windowStart >= 60_000) {
      this.windowStart = this.now();
      this.sent = 0;
    }
    return delay;
  }
}
