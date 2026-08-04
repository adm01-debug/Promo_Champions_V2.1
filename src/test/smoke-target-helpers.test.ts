import { describe, it, expect } from "vitest";
import {
  isAccessDenied,
  anonReadIsIsolated,
  summarize,
  exitCodeFor,
  formatLine,
  type CheckResult,
} from "../../scripts/smokeTargetHelpers";

const check = (over: Partial<CheckResult> = {}): CheckResult => ({
  id: "x",
  phase: "data",
  status: "pass",
  message: "ok",
  ...over,
});

describe("isAccessDenied", () => {
  it("detecta códigos de negação do PostgREST", () => {
    expect(isAccessDenied({ code: "42501" })).toBe(true);
    expect(isAccessDenied({ code: "PGRST301" })).toBe(true);
  });

  it("detecta mensagens de RLS/JWT", () => {
    expect(isAccessDenied({ message: "new row violates row-level security policy" })).toBe(true);
    expect(isAccessDenied({ message: "permission denied for table sales" })).toBe(true);
    expect(isAccessDenied({ message: "JWT expired" })).toBe(true);
  });

  it("ignora erros não relacionados a acesso", () => {
    expect(isAccessDenied({ code: "22P02", message: "invalid input syntax" })).toBe(false);
    expect(isAccessDenied(null)).toBe(false);
    expect(isAccessDenied(undefined)).toBe(false);
  });
});

describe("anonReadIsIsolated", () => {
  it("aprova quando o acesso é negado", () => {
    expect(anonReadIsIsolated({ code: "42501" }, 0)).toBe(true);
  });

  it("aprova quando não há erro mas zero linhas", () => {
    expect(anonReadIsIsolated(null, 0)).toBe(true);
  });

  it("reprova quando linhas vazam para anônimo", () => {
    expect(anonReadIsIsolated(null, 3)).toBe(false);
  });
});

describe("summarize/exitCodeFor", () => {
  it("é verde apenas sem falhas e com ao menos um pass", () => {
    const results = [check(), check({ status: "skip" })];
    expect(summarize(results)).toMatchObject({ total: 2, passed: 1, failed: 0, skipped: 1, ok: true });
    expect(exitCodeFor(results)).toBe(0);
  });

  it("é vermelho com qualquer falha", () => {
    const results = [check(), check({ status: "fail" })];
    expect(summarize(results).ok).toBe(false);
    expect(exitCodeFor(results)).toBe(1);
  });

  it("é vermelho quando tudo foi pulado", () => {
    expect(exitCodeFor([check({ status: "skip" })])).toBe(1);
  });
});

describe("formatLine", () => {
  it("inclui ícone, fase, id e duração", () => {
    expect(formatLine(check({ id: "auth.login", phase: "auth", durationMs: 12 }))).toBe(
      "✅ [auth] auth.login: ok (12ms)",
    );
  });
});
