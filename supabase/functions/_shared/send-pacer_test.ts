import { assert, assertEquals } from "https://deno.land/std@0.224.0/assert/mod.ts";
import {
  computeDelayMs,
  DEFAULT_THROTTLE,
  parsePositiveInt,
  resolveThrottle,
  SendPacer,
} from "./send-pacer.ts";

Deno.test("parsePositiveInt trata lixo, zero e negativos", () => {
  assertEquals(parsePositiveInt(undefined, 10), 10);
  assertEquals(parsePositiveInt("", 10), 10);
  assertEquals(parsePositiveInt("abc", 10), 10);
  assertEquals(parsePositiveInt("0", 10), 10);
  assertEquals(parsePositiveInt("-5", 10), 10);
  assertEquals(parsePositiveInt("7.9", 10), 7);
  assertEquals(parsePositiveInt(" 42 ", 10), 42);
});

Deno.test("resolveThrottle usa defaults e limita lote à cota", () => {
  const env: Record<string, string> = {};
  assertEquals(resolveThrottle((k) => env[k]), DEFAULT_THROTTLE);

  env.BULK_EMAIL_MAX_PER_MINUTE = "10";
  env.BULK_EMAIL_BATCH_SIZE = "500";
  assertEquals(resolveThrottle((k) => env[k]), { maxPerMinute: 10, batchSize: 10 });
});

Deno.test("computeDelayMs não pausa antes de fechar um lote", () => {
  const c = { maxPerMinute: 60, batchSize: 10 };
  for (let i = 1; i < 10; i++) {
    assertEquals(computeDelayMs(c, i, 0, 1_000), 0);
  }
  assert(computeDelayMs(c, 10, 0, 1_000) > 0);
});

Deno.test("computeDelayMs espera o restante da janela ao estourar a cota", () => {
  const c = { maxPerMinute: 20, batchSize: 5 };
  assertEquals(computeDelayMs(c, 20, 0, 15_000), 45_000);
  // Janela já vencida: segue sem pausa.
  assertEquals(computeDelayMs(c, 20, 0, 61_000), 0);
});

Deno.test("simulação: 500 envios respeitam a cota por minuto", async () => {
  const config = { maxPerMinute: 60, batchSize: 10 };
  let clock = 0;
  const pacer = new SendPacer(config, () => clock, async (ms) => {
    clock += ms;
  });

  const timestamps: number[] = [];
  for (let i = 0; i < 500; i++) {
    clock += 5; // custo simulado do enqueue
    timestamps.push(clock);
    await pacer.afterSend();
  }

  // Nenhuma janela de 60s pode conter mais que a cota.
  for (let i = 0; i < timestamps.length; i++) {
    const windowEnd = timestamps[i] + 60_000;
    let count = 0;
    for (let j = i; j < timestamps.length && timestamps[j] < windowEnd; j++) count++;
    assert(
      count <= config.maxPerMinute + config.batchSize,
      `janela em ${timestamps[i]} teve ${count} envios`,
    );
  }
  assert(clock > 400_000, `esperava pacing real, relógio em ${clock}`);
});

Deno.test("simulação: lote menor que a cota nunca dorme", async () => {
  let clock = 0;
  let slept = 0;
  const pacer = new SendPacer({ maxPerMinute: 120, batchSize: 20 }, () => clock, async (ms) => {
    slept += ms;
    clock += ms;
  });
  for (let i = 0; i < 19; i++) {
    clock += 1;
    await pacer.afterSend();
  }
  assertEquals(slept, 0);
});
