// Smoke test: garante que o helper chunkedIn (Deno) suporta payloads realistas
// (250 UUIDs) sem estourar limites — 3 chunks emitidos, resultados concatenados,
// modo paralelo respeita ordem via concat, modo sequencial preserva ordem.
import { assertEquals } from "https://deno.land/std@0.224.0/assert/mod.ts";
import { chunkedIn } from "./chunked-in.ts";

function fakeUuid(i: number): string {
  const hex = i.toString(16).padStart(12, "0");
  return `00000000-0000-4000-8000-${hex}`;
}

Deno.test("chunkedIn: 250 UUIDs em 3 chunks, ordem preservada (sequencial)", async () => {
  const ids = Array.from({ length: 250 }, (_, i) => fakeUuid(i));
  const chunkSizes: number[] = [];
  const rows = await chunkedIn<{ id: string }>(
    ids,
    (chunk) => {
      chunkSizes.push(chunk.length);
      return Promise.resolve({ data: chunk.map((id) => ({ id })), error: null });
    },
    { chunkSize: 100 },
  );
  assertEquals(chunkSizes, [100, 100, 50]);
  assertEquals(rows.length, 250);
  assertEquals(rows[0].id, ids[0]);
  assertEquals(rows[249].id, ids[249]);
});

Deno.test("chunkedIn: propaga erro com label", async () => {
  let attempted = 0;
  try {
    await chunkedIn<{ id: string }>(
      ["a", "b", "c"],
      () => {
        attempted++;
        return Promise.resolve({ data: null, error: { message: "boom" } });
      },
      { chunkSize: 1, label: "smoke" },
    );
    throw new Error("should have thrown");
  } catch (e) {
    if (!(e instanceof Error) || !e.message.includes("smoke: boom")) {
      throw new Error(`expected smoke: boom, got: ${e}`);
    }
    assertEquals(attempted, 1);
  }
});

Deno.test("chunkedIn: paralelo dispara N calls concorrentes", async () => {
  const ids = Array.from({ length: 300 }, (_, i) => fakeUuid(i));
  let inflight = 0;
  let peak = 0;
  const rows = await chunkedIn<{ id: string }>(
    ids,
    async (chunk) => {
      inflight++;
      peak = Math.max(peak, inflight);
      await new Promise((r) => setTimeout(r, 5));
      inflight--;
      return { data: chunk.map((id) => ({ id })), error: null };
    },
    { chunkSize: 100, parallel: true },
  );
  assertEquals(rows.length, 300);
  if (peak < 2) throw new Error(`expected concurrency > 1, got peak=${peak}`);
});

Deno.test("chunkedIn: short-circuit em array vazio (0 calls)", async () => {
  let called = 0;
  const rows = await chunkedIn<{ id: string }>(
    [],
    () => {
      called++;
      return Promise.resolve({ data: [], error: null });
    },
  );
  assertEquals(rows.length, 0);
  assertEquals(called, 0);
});
