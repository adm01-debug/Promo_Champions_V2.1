import { describe, expect, it } from 'vitest';
import { isValidCPF, isValidCNPJ, isValidCpfOrCnpj } from './brDocuments';

describe('isValidCPF', () => {
  it.each(['111.444.777-35', '52998224725', ' 529.982.247-25 '])(
    'aceita CPF válido: %s',
    value => {
      expect(isValidCPF(value)).toBe(true);
    }
  );

  it.each(['111.444.777-34', '52998224724'])(
    'rejeita CPF com dígito verificador errado: %s',
    value => {
      expect(isValidCPF(value)).toBe(false);
    }
  );

  it.each(Array.from({ length: 10 }, (_, d) => String(d).repeat(11)))(
    'rejeita CPF com todos os dígitos iguais: %s',
    value => {
      expect(isValidCPF(value)).toBe(false);
    }
  );

  it.each(['1234567890', '123456789012', '', '   ', 'abc.def.ghi-jk'])(
    'rejeita CPF com tamanho ou conteúdo inválido: %s',
    value => {
      expect(isValidCPF(value)).toBe(false);
    }
  );

  it.each([null, undefined] as unknown as string[])(
    'degrada para false em vez de lançar exceção para %s',
    value => {
      expect(isValidCPF(value)).toBe(false);
    }
  );
});

describe('isValidCNPJ', () => {
  it.each(['11.222.333/0001-81', '04252011000110', ' 04.252.011/0001-10 '])(
    'aceita CNPJ válido: %s',
    value => {
      expect(isValidCNPJ(value)).toBe(true);
    }
  );

  it.each(['11.222.333/0001-80', '04252011000111'])(
    'rejeita CNPJ com dígito verificador errado: %s',
    value => {
      expect(isValidCNPJ(value)).toBe(false);
    }
  );

  it.each(Array.from({ length: 10 }, (_, d) => String(d).repeat(14)))(
    'rejeita CNPJ com todos os dígitos iguais: %s',
    value => {
      expect(isValidCNPJ(value)).toBe(false);
    }
  );

  it.each(['123456789012', '123456789012345', '', '   '])(
    'rejeita CNPJ com tamanho inválido: %s',
    value => {
      expect(isValidCNPJ(value)).toBe(false);
    }
  );

  it.each([null, undefined] as unknown as string[])(
    'degrada para false em vez de lançar exceção para %s',
    value => {
      expect(isValidCNPJ(value)).toBe(false);
    }
  );
});

describe('isValidCpfOrCnpj', () => {
  it('roteia por tamanho: 11 dígitos como CPF', () => {
    expect(isValidCpfOrCnpj('111.444.777-35')).toBe(true);
    expect(isValidCpfOrCnpj('111.444.777-34')).toBe(false);
  });

  it('roteia por tamanho: 14 dígitos como CNPJ', () => {
    expect(isValidCpfOrCnpj('11.222.333/0001-81')).toBe(true);
    expect(isValidCpfOrCnpj('11.222.333/0001-80')).toBe(false);
  });

  it.each(['', '123456789012'])(
    'rejeita tamanho que não é nem CPF nem CNPJ: %s',
    value => {
      expect(isValidCpfOrCnpj(value)).toBe(false);
    }
  );
});
