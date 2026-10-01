import { describe, expect, it } from "vitest";
import { maskDoc, maskEmail, maskFreeText, maskPhone } from "./pii";

describe("maskEmail", () => {
  it("preserva primeira e última letra do local + domínio", () => {
    expect(maskEmail("maria.silva@empresa.com")).toBe("m***a@empresa.com");
  });

  it("retorna vazio para entrada nula e *** para formato inválido", () => {
    expect(maskEmail(null)).toBe("");
    expect(maskEmail("")).toBe("");
    expect(maskEmail("nao-e-email")).toBe("***");
  });
});

describe("maskPhone", () => {
  it("preserva só os 4 últimos dígitos", () => {
    expect(maskPhone("+55 (11) 98765-4321")).toBe("***4321");
  });

  it("não expõe número curto", () => {
    expect(maskPhone("123")).toBe("***");
    expect(maskPhone(undefined)).toBe("");
  });
});

describe("maskDoc", () => {
  it("CPF preserva só os 2 últimos dígitos", () => {
    expect(maskDoc("123.456.789-34")).toBe("***.***.***-34");
    expect(maskDoc("12345678934")).toBe("***.***.***-34");
  });

  it("CNPJ preserva só os 2 últimos dígitos", () => {
    expect(maskDoc("12.345.678/0001-90")).toBe("**.***.***/****-90");
  });
});

describe("maskFreeText", () => {
  it("mascara email, telefone e CPF embutidos em texto livre", () => {
    const out = maskFreeText(
      "Falar com joao@cliente.com ou (11) 98888-7777, CPF 123.456.789-34",
    );
    expect(out).toContain("j***o@cliente.com");
    expect(out).toContain("***7777");
    expect(out).toContain("***.***.***-34");
    expect(out).not.toContain("joao@cliente.com");
    expect(out).not.toContain("123.456.789-34");
  });

  it("retorna vazio para entrada nula", () => {
    expect(maskFreeText(null)).toBe("");
  });
});
