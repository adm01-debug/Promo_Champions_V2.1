import { assertEquals } from "https://deno.land/std@0.224.0/assert/mod.ts";
import {
  BatchBodySchema,
  DEFAULT_CHUNK_SIZE,
  MAX_BATCH_TOTAL,
  MAX_CHUNK_SIZE,
} from "./schema.ts";

const uuid = () => crypto.randomUUID();

Deno.test("accepts dead_letter_ids with default chunk_size", () => {
  const ids = [uuid(), uuid()];
  const r = BatchBodySchema.safeParse({ dead_letter_ids: ids });
  assertEquals(r.success, true);
  if (r.success) {
    assertEquals(r.data.dead_letter_ids, ids);
    assertEquals(r.data.chunk_size, undefined);
  }
});

Deno.test("accepts delivery_ids with custom chunk_size + stop_on_error", () => {
  const ids = [uuid(), uuid(), uuid()];
  const r = BatchBodySchema.safeParse({
    delivery_ids: ids,
    chunk_size: 10,
    stop_on_error: true,
  });
  assertEquals(r.success, true);
  if (r.success) {
    assertEquals(r.data.delivery_ids, ids);
    assertEquals(r.data.chunk_size, 10);
    assertEquals(r.data.stop_on_error, true);
  }
});

Deno.test("rejects when both id arrays are present (XOR)", () => {
  const r = BatchBodySchema.safeParse({
    dead_letter_ids: [uuid()],
    delivery_ids: [uuid()],
  });
  assertEquals(r.success, false);
});

Deno.test("rejects when neither id array is present", () => {
  const r = BatchBodySchema.safeParse({ chunk_size: 5 });
  assertEquals(r.success, false);
});

Deno.test("rejects non-uuid ids", () => {
  const r = BatchBodySchema.safeParse({ dead_letter_ids: ["not-a-uuid"] });
  assertEquals(r.success, false);
});

Deno.test("rejects chunk_size above MAX_CHUNK_SIZE", () => {
  const r = BatchBodySchema.safeParse({
    dead_letter_ids: [uuid()],
    chunk_size: MAX_CHUNK_SIZE + 1,
  });
  assertEquals(r.success, false);
});

Deno.test("rejects chunk_size below 1", () => {
  const r = BatchBodySchema.safeParse({
    dead_letter_ids: [uuid()],
    chunk_size: 0,
  });
  assertEquals(r.success, false);
});

Deno.test("rejects total ids above MAX_BATCH_TOTAL", () => {
  const ids = Array.from({ length: MAX_BATCH_TOTAL + 1 }, () => uuid());
  const r = BatchBodySchema.safeParse({ dead_letter_ids: ids });
  assertEquals(r.success, false);
});

Deno.test("accepts total ids exactly at MAX_BATCH_TOTAL", () => {
  const ids = Array.from({ length: MAX_BATCH_TOTAL }, () => uuid());
  const r = BatchBodySchema.safeParse({ dead_letter_ids: ids });
  assertEquals(r.success, true);
});

Deno.test("DEFAULT_CHUNK_SIZE is within bounds", () => {
  assertEquals(DEFAULT_CHUNK_SIZE >= 1 && DEFAULT_CHUNK_SIZE <= MAX_CHUNK_SIZE, true);
});
