import { describe, it, expect } from "vitest";
import { validateReplayIds, MAX_REPLAY_IDS } from "../validateReplayIds";

const uuid = (n: number) => {
  // Builds a deterministic, RFC 4122-compliant v4-like UUID string.
  const hex = n.toString(16).padStart(12, "0");
  return `00000000-0000-4000-8000-${hex}`;
};

describe("validateReplayIds", () => {
  describe("vazio", () => {
    it("rejeita lista vazia", () => {
      const r = validateReplayIds([]);
      expect(r.ok).toBe(false);
      if (!r.ok) expect(r.message).toMatch(/ao menos 1/i);
    });

    it("rejeita undefined/null como entrada efetivamente vazia", () => {
      // @ts-expect-error — testando defesa contra null acidental
      const r = validateReplayIds(null);
      expect(r.ok).toBe(false);
    });

    it("rejeita após dedupe se sobrar 0", () => {
      // Strings vazias são inválidas; mas se todas duplicadas e únicas vazias → 1 entrada inválida.
      // Caso real de "0 após dedupe": só ocorre com input vazio.
      const r = validateReplayIds([]);
      expect(r.ok).toBe(false);
    });
  });

  describe("limite >50", () => {
    it("aceita exatamente MAX_REPLAY_IDS", () => {
      const ids = Array.from({ length: MAX_REPLAY_IDS }, (_, i) => uuid(i + 1));
      const r = validateReplayIds(ids);
      expect(r.ok).toBe(true);
      if (r.ok) expect(r.ids).toHaveLength(MAX_REPLAY_IDS);
    });

    it("rejeita MAX_REPLAY_IDS + 1 com mensagem informando o total", () => {
      const ids = Array.from({ length: MAX_REPLAY_IDS + 1 }, (_, i) => uuid(i + 1));
      const r = validateReplayIds(ids);
      expect(r.ok).toBe(false);
      if (!r.ok) {
        expect(r.message).toContain(String(MAX_REPLAY_IDS));
        expect(r.message).toContain(String(MAX_REPLAY_IDS + 1));
      }
    });

    it("aplica limite APÓS dedupe (51 com duplicatas que reduz para 50 → ok)", () => {
      const base = Array.from({ length: MAX_REPLAY_IDS }, (_, i) => uuid(i + 1));
      const r = validateReplayIds([...base, base[0]]); // 51 com 1 duplicado
      expect(r.ok).toBe(true);
      if (r.ok) expect(r.ids).toHaveLength(MAX_REPLAY_IDS);
    });
  });

  describe("deduplicação", () => {
    it("remove duplicatas exatas preservando ordem do primeiro encontro", () => {
      const a = uuid(1);
      const b = uuid(2);
      const c = uuid(3);
      const r = validateReplayIds([a, b, a, c, b, a]);
      expect(r.ok).toBe(true);
      if (r.ok) expect(r.ids).toEqual([a, b, c]);
    });

    it("Set dedupe é case-sensitive (documenta comportamento atual)", () => {
      // O regex aceita ambas as caixas, e o Set diferencia por bytes,
      // então 'aaaa…' e 'AAAA…' contam como 2 entradas.
      const lower = uuid(0xabcdef); // garante chars a-f
      const upper = lower.toUpperCase();
      expect(lower).not.toBe(upper);
      const r = validateReplayIds([lower, lower, upper, upper]);
      expect(r.ok).toBe(true);
      if (r.ok) expect(r.ids).toEqual([lower, upper]);
    });
  });

  describe("UUIDs inválidos", () => {
    it("rejeita string não-UUID", () => {
      const r = validateReplayIds(["not-a-uuid"]);
      expect(r.ok).toBe(false);
      if (!r.ok) {
        expect(r.message).toMatch(/inválido/i);
        expect(r.message).toContain("not-a-ui"); // primeiros 8 chars
      }
    });

    it("rejeita número/boolean disfarçado (defesa runtime)", () => {
      // @ts-expect-error — testando defesa runtime
      const r = validateReplayIds([123, true]);
      expect(r.ok).toBe(false);
    });

    it("mostra até 3 IDs no sample com indicador (+N)", () => {
      const valid = uuid(1);
      const invalid = ["bad-id-aaa", "bad-id-bbb", "bad-id-ccc", "bad-id-ddd", "bad-id-eee"];
      const r = validateReplayIds([valid, ...invalid]);
      expect(r.ok).toBe(false);
      if (!r.ok) {
        expect(r.message).toContain("bad-id-a");
        expect(r.message).toContain("bad-id-b");
        expect(r.message).toContain("bad-id-c");
        expect(r.message).not.toContain("bad-id-ddd"); // truncado
        expect(r.message).toContain("(+2)");
      }
    });

    it("aceita UUID v4 maiúsculo (case-insensitive)", () => {
      const id = uuid(99).toUpperCase();
      const r = validateReplayIds([id]);
      expect(r.ok).toBe(true);
    });

    it("rejeita UUID com tamanho errado", () => {
      const r = validateReplayIds(["00000000-0000-4000-8000-000000000"]);
      expect(r.ok).toBe(false);
    });

    it("rejeita UUID com caracteres fora de [0-9a-f]", () => {
      const r = validateReplayIds(["zzzzzzzz-0000-4000-8000-000000000001"]);
      expect(r.ok).toBe(false);
    });

    it("orienta o usuário a desmarcar entradas inválidas", () => {
      const r = validateReplayIds(["bad"]);
      expect(r.ok).toBe(false);
      if (!r.ok) expect(r.message).toMatch(/desmarque/i);
    });
  });

  describe("caso feliz", () => {
    it("retorna ok com IDs deduplicados quando tudo é válido", () => {
      const ids = [uuid(1), uuid(2), uuid(3)];
      const r = validateReplayIds(ids);
      expect(r.ok).toBe(true);
      if (r.ok) expect(r.ids).toEqual(ids);
    });
  });
});
