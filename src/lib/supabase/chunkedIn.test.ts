import { describe, it, expect, vi } from "vitest";
import { chunkedIn, type PostgrestLike } from "./chunkedIn";

function ok<T>(data: T[]): PostgrestLike<T> {
  return Promise.resolve({ data, error: null });
}
function fail<T>(msg: string): PostgrestLike<T> {
  return Promise.resolve({ data: null, error: { message: msg } });
}

describe("chunkedIn", () => {
  it("short-circuits on empty array", async () => {
    const runner = vi.fn();
    const result = await chunkedIn([], runner as never);
    expect(result).toEqual([]);
    expect(runner).not.toHaveBeenCalled();
  });

  it("splits into chunks of chunkSize and concatenates data", async () => {
    const ids = Array.from({ length: 250 }, (_, i) => `id-${i}`);
    const seen: string[][] = [];
    const runner = (chunk: Array<string | number>) => {
      seen.push(chunk as string[]);
      return ok(chunk.map((c) => ({ id: c })));
    };
    const rows = await chunkedIn<{ id: string | number }>(ids, runner, { chunkSize: 100 });
    expect(seen).toHaveLength(3);
    expect(seen[0]).toHaveLength(100);
    expect(seen[1]).toHaveLength(100);
    expect(seen[2]).toHaveLength(50);
    expect(rows).toHaveLength(250);
    expect(rows[0]).toEqual({ id: "id-0" });
    expect(rows[249]).toEqual({ id: "id-249" });
  });

  it("preserves order in sequential mode", async () => {
    const ids = ["a", "b", "c", "d", "e"];
    const rows = await chunkedIn<{ v: string }>(
      ids,
      (chunk) => ok(chunk.map((c) => ({ v: String(c) }))),
      { chunkSize: 2 },
    );
    expect(rows.map((r) => r.v)).toEqual(["a", "b", "c", "d", "e"]);
  });

  it("propagates errors from any chunk", async () => {
    const ids = Array.from({ length: 30 }, (_, i) => i);
    let calls = 0;
    await expect(
      chunkedIn<{ id: number }>(
        ids,
        (chunk) => {
          calls++;
          if (calls === 2) return fail("boom");
          return ok((chunk as number[]).map((id) => ({ id })));
        },
        { chunkSize: 10, label: "test" },
      ),
    ).rejects.toThrow(/test: boom/);
  });

  it("supports parallel execution", async () => {
    const ids = Array.from({ length: 300 }, (_, i) => `x${i}`);
    let inflight = 0;
    let maxInflight = 0;
    const runner = async (chunk: Array<string | number>) => {
      inflight++;
      maxInflight = Math.max(maxInflight, inflight);
      await new Promise((r) => setTimeout(r, 5));
      inflight--;
      return { data: chunk.map((c) => ({ id: c })), error: null };
    };
    const rows = await chunkedIn<{ id: string | number }>(ids, runner, {
      chunkSize: 100,
      parallel: true,
    });
    expect(rows).toHaveLength(300);
    expect(maxInflight).toBeGreaterThan(1);
  });
});
