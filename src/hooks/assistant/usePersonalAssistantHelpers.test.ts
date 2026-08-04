import { describe, it, expect } from "vitest";
import {
  drainSSEChunk,
  getAssistantErrorMessage,
  makeMessageId,
  parseSSELine,
} from "./usePersonalAssistantHelpers";

describe("parseSSELine", () => {
  it("extrai delta.content de linha data:", () => {
    const line = 'data: {"choices":[{"delta":{"content":"Olá"}}]}';
    expect(parseSSELine(line)).toBe("Olá");
  });

  it("retorna string vazia para [DONE]", () => {
    expect(parseSSELine("data: [DONE]")).toBe("");
  });

  it("retorna string vazia para linha sem prefixo data:", () => {
    expect(parseSSELine("event: message")).toBe("");
  });

  it("resiste a JSON inválido sem lançar", () => {
    expect(parseSSELine("data: {invalid")).toBe("");
  });

  it("retorna vazio quando delta.content é undefined", () => {
    expect(parseSSELine('data: {"choices":[{"delta":{}}]}')).toBe("");
  });
});

describe("drainSSEChunk", () => {
  it("agrega deltas de múltiplas linhas completas", () => {
    const chunk =
      'data: {"choices":[{"delta":{"content":"Bom "}}]}\n' +
      'data: {"choices":[{"delta":{"content":"dia"}}]}\n';
    const r = drainSSEChunk(chunk, "");
    expect(r.text).toBe("Bom dia");
    expect(r.buffer).toBe("");
  });

  it("preserva linha incompleta no buffer", () => {
    const chunk = 'data: {"choices":[{"delta":{"content":"A"}}]}\ndata: {"choices":';
    const r = drainSSEChunk(chunk, "");
    expect(r.text).toBe("A");
    expect(r.buffer).toContain("data: {");
  });

  it("concatena buffer prévio com novo chunk", () => {
    const first = drainSSEChunk('data: {"choices":[{"delta":{"content":"X"', "");
    expect(first.text).toBe("");
    const second = drainSSEChunk('}}]}\n', first.buffer);
    expect(second.text).toBe("X");
  });
});

describe("makeMessageId", () => {
  it("gera IDs únicos com prefixo msg_", () => {
    const a = makeMessageId();
    const b = makeMessageId();
    expect(a).toMatch(/^msg_/);
    expect(a).not.toBe(b);
  });
});

describe("getAssistantErrorMessage", () => {
  it("traduz o 403 específico de IA desabilitada", () => {
    expect(
      getAssistantErrorMessage(403, '{"title":"Lovable AI is disabled for this workspace"}'),
    ).toContain("IA está desabilitada");
  });

  it("não expõe detalhes internos em erros inesperados", () => {
    const message = getAssistantErrorMessage(502, "stack trace secreto");
    expect(message).toBe("O assistente está temporariamente indisponível. Tente novamente em instantes.");
    expect(message).not.toContain("stack trace");
  });

  it.each([
    [401, "sessão expirou"],
    [402, "limite de uso"],
    [429, "muitas solicitações"],
  ])("mapeia status %i para mensagem acionável", (status, expected) => {
    expect(getAssistantErrorMessage(status, "")).toContain(expected);
  });
});
