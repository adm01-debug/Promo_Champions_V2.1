// Wrappers zod sobre os validadores BR de brDocuments.ts, para uso direto nos
// schemas de formulário (react-hook-form + zodResolver).
//
// Todos toleram campo vazio ('' / undefined tratado fora): os formulários
// tratam esses campos como opcionais — quando preenchidos, exigem formato
// válido (DDD real, dígito verificador, etc.) com mensagem em pt-BR.

import { z } from 'zod';
import { isValidCEP, isValidCNPJ, isValidCpfOrCnpj, isValidPhoneBR } from './brDocuments';

const isEmptyField = (value: string) => value.trim() === '';

/** Telefone BR opcional: E.164 (+55) ou local com DDD real. */
export const brPhoneField = (maxLength = 20) =>
  z
    .string()
    .trim()
    .max(maxLength, `Telefone deve ter no máximo ${maxLength} caracteres`)
    .refine(v => isEmptyField(v) || isValidPhoneBR(v), 'Telefone inválido');

/** CPF ou CNPJ opcional: dígito verificador conforme o tamanho (11/14). */
export const brCpfOrCnpjField = (maxLength = 18) =>
  z
    .string()
    .trim()
    .max(maxLength, `Documento deve ter no máximo ${maxLength} caracteres`)
    .refine(v => isEmptyField(v) || isValidCpfOrCnpj(v), 'CPF ou CNPJ inválido');

/** CNPJ opcional (14 dígitos numéricos com dígito verificador). */
export const brCnpjField = (maxLength = 18) =>
  z
    .string()
    .trim()
    .max(maxLength, `CNPJ deve ter no máximo ${maxLength} caracteres`)
    .refine(v => isEmptyField(v) || isValidCNPJ(v), 'CNPJ inválido');

/** CEP opcional (8 dígitos; formato, não existência nos Correios). */
export const brCepField = () =>
  z
    .string()
    .trim()
    .max(9, 'CEP deve ter no máximo 9 caracteres')
    .refine(v => isEmptyField(v) || isValidCEP(v), 'CEP inválido');
