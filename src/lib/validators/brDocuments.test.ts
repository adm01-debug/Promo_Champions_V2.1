import { describe, expect, it } from 'vitest';
import {
  isValidCPF,
  isValidCNPJ,
  isValidCpfOrCnpj,
  isValidCEP,
  isValidPhoneBR,
} from './brDocuments';

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

  // eslint-disable-next-line no-restricted-syntax
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

  // eslint-disable-next-line no-restricted-syntax
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

describe('isValidCEP', () => {
  it.each(['01310-100', '01310100', ' 20040-020 '])(
    'aceita CEP com formato válido: %s',
    value => {
      expect(isValidCEP(value)).toBe(true);
    }
  );

  it.each(Array.from({ length: 10 }, (_, d) => String(d).repeat(8)))(
    'rejeita CEP com todos os dígitos iguais: %s',
    value => {
      expect(isValidCEP(value)).toBe(false);
    }
  );

  it.each(['1234567', '123456789', '', 'abcdefgh'])(
    'rejeita CEP com tamanho ou conteúdo inválido: %s',
    value => {
      expect(isValidCEP(value)).toBe(false);
    }
  );
});

describe('isValidPhoneBR', () => {
  it.each([
    '+5511987654321', // celular E.164
    '5511987654321', // celular sem +
    '11987654321', // celular local
    '1132654321', // fixo local (SP)
    '+551132654321', // fixo E.164
    '(11) 98765-4321', // celular formatado
  ])('aceita telefone BR válido: %s', value => {
    expect(isValidPhoneBR(value)).toBe(true);
  });

  it.each([
    '11123654321', // 11 dígitos mas o 3º (1º do assinante) não é 9 — não é celular válido
    '118765432', // 9 dígitos — curto demais para fixo (10) ou celular (11)
    '2087654321', // DDD 20 não existe
    '119876543210', // 12 dígitos locais — não bate com nenhum formato
    '',
    'abc',
  ])('rejeita telefone BR inválido: %s', value => {
    expect(isValidPhoneBR(value)).toBe(false);
  });

  it('rejeita fixo começando em 0 ou 1 (faixas reservadas)', () => {
    expect(isValidPhoneBR('1102654321')).toBe(false);
    expect(isValidPhoneBR('1112654321')).toBe(false);
  });

  // eslint-disable-next-line no-restricted-syntax
  it.each([null, undefined] as unknown as string[])(
    'degrada para false em vez de lançar exceção para %s',
    value => {
      expect(isValidPhoneBR(value)).toBe(false);
    }
  );
});
