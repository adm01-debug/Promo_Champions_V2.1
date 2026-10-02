import { describe, expect, it } from 'vitest';
import { brCepField, brCnpjField, brCpfOrCnpjField, brPhoneField } from './brSchemas';

const firstIssueMessage = (
  schema: {
    safeParse: (v: string) => {
      success: boolean;
      error?: { issues: { message: string }[] };
    };
  },
  value: string
) => {
  const result = schema.safeParse(value);
  expect(result.success).toBe(false);
  return result.error?.issues[0]?.message;
};

describe('brPhoneField', () => {
  const schema = brPhoneField();

  it.each(['(11) 99999-8888', '11999998888', '+5511999998888', '(11) 3333-4444'])(
    'aceita telefone válido: %s',
    value => {
      expect(schema.safeParse(value).success).toBe(true);
    }
  );

  it.each(['', '   '])('aceita campo vazio (opcional): "%s"', value => {
    expect(schema.safeParse(value).success).toBe(true);
  });

  it.each([
    '(20) 99999-8888', // DDD inexistente
    '(11) 0999-8888', // celular não pode começar com 0
    '9999-8888', // sem DDD
    '(11) 9999-888', // faltando dígito
  ])('rejeita telefone inválido com mensagem pt-BR: %s', value => {
    expect(firstIssueMessage(schema, value)).toBe('Telefone inválido');
  });
});

describe('brCpfOrCnpjField', () => {
  const schema = brCpfOrCnpjField();

  it.each(['111.444.777-35', '52998224725', '11.222.333/0001-81', '04252011000110'])(
    'aceita documento válido: %s',
    value => {
      expect(schema.safeParse(value).success).toBe(true);
    }
  );

  it.each(['', '   '])('aceita campo vazio (opcional): "%s"', value => {
    expect(schema.safeParse(value).success).toBe(true);
  });

  it.each([
    '111.111.111-11', // todos os dígitos iguais
    '111.444.777-34', // dígito verificador errado
    '11.222.333/0001-80', // CNPJ com DV errado
  ])('rejeita documento inválido com mensagem pt-BR: %s', value => {
    expect(firstIssueMessage(schema, value)).toBe('CPF ou CNPJ inválido');
  });
});

describe('brCnpjField', () => {
  const schema = brCnpjField();

  it.each(['11.222.333/0001-81', '04252011000110'])('aceita CNPJ válido: %s', value => {
    expect(schema.safeParse(value).success).toBe(true);
  });

  it.each([
    '11.222.333/0001-80',
    '111.444.777-35', // CPF não é CNPJ
  ])('rejeita CNPJ inválido com mensagem pt-BR: %s', value => {
    expect(firstIssueMessage(schema, value)).toBe('CNPJ inválido');
  });
});

describe('brCepField', () => {
  const schema = brCepField();

  it.each(['01310-100', '01310100'])('aceita CEP válido: %s', value => {
    expect(schema.safeParse(value).success).toBe(true);
  });

  it.each(['', '   '])('aceita campo vazio (opcional): "%s"', value => {
    expect(schema.safeParse(value).success).toBe(true);
  });

  it.each(['00000-000', '01310-10', 'abcdefghi'])(
    'rejeita CEP inválido com mensagem pt-BR: %s',
    value => {
      expect(firstIssueMessage(schema, value)).toBe('CEP inválido');
    }
  );
});
