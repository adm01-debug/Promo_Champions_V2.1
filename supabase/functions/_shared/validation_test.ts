/**
 * Testes do validador compartilhado de payloads (AUD-VALIDACAO).
 * Cobre o contrato das regras usadas pelas edge functions que gravam.
 */
import { assertEquals } from 'https://deno.land/std@0.224.0/assert/mod.ts';
import {
  collectErrors,
  validateEnum,
  validateNumber,
  validateString,
  validateUUID,
  validationErrorResponse,
} from './validation.ts';

Deno.test('validateString — obrigatório, tipo e limites', () => {
  assertEquals(validateString(undefined, 'campo', { required: true }) !== null, true);
  assertEquals(validateString(null, 'campo', { required: true }) !== null, true);
  assertEquals(validateString(123, 'campo') !== null, true);
  assertEquals(
    validateString('x'.repeat(300), 'campo', { maxLength: 200 }) !== null,
    true
  );
  assertEquals(validateString('valor ok', 'campo', { required: true }), null);
  // Campo opcional ausente passa.
  assertEquals(validateString(undefined, 'campo'), null);
});

Deno.test('validateUUID — formato e obrigatoriedade', () => {
  assertEquals(validateUUID(undefined, 'id'), null);
  assertEquals(validateUUID(undefined, 'id', true) !== null, true);
  assertEquals(validateUUID('nao-e-uuid', 'id') !== null, true);
  assertEquals(validateUUID(42, 'id') !== null, true);
  assertEquals(validateUUID('550e8400-e29b-41d4-a716-446655440000', 'id', true), null);
});

Deno.test('validateNumber — tipo, inteiro e faixa', () => {
  assertEquals(validateNumber(undefined, 'n'), null);
  assertEquals(validateNumber(undefined, 'n', { required: true }) !== null, true);
  assertEquals(validateNumber('10', 'n') !== null, true);
  assertEquals(validateNumber(Number.NaN, 'n') !== null, true);
  assertEquals(validateNumber(Infinity, 'n') !== null, true);
  assertEquals(validateNumber(1.5, 'n', { integer: true }) !== null, true);
  assertEquals(validateNumber(0, 'n', { min: 1 }) !== null, true);
  assertEquals(validateNumber(20001, 'n', { max: 10_000 }) !== null, true);
  assertEquals(validateNumber(250, 'n', { integer: true, min: 1, max: 10_000 }), null);
});

Deno.test('validateEnum — conjunto permitido', () => {
  assertEquals(validateEnum(undefined, 'action', ['a']), null);
  assertEquals(validateEnum(undefined, 'action', ['a'], true) !== null, true);
  assertEquals(validateEnum('x', 'action', ['a', 'b'], true) !== null, true);
  assertEquals(validateEnum('a', 'action', ['a', 'b'], true), null);
  assertEquals(validateEnum(1, 'action', ['a'], true) !== null, true);
});

Deno.test('collectErrors — filtra nulos e preserva ordem', () => {
  const errors = collectErrors([
    validateString(undefined, 'a', { required: true }),
    validateUUID('550e8400-e29b-41d4-a716-446655440000', 'b'),
    validateNumber('x', 'c'),
  ]);
  assertEquals(errors.length, 2);
  assertEquals(errors[0].field, 'a');
  assertEquals(errors[1].field, 'c');
});

Deno.test('validationErrorResponse — 400 JSON com detalhes e CORS', async () => {
  const errors = collectErrors([validateString(undefined, 'campo', { required: true })]);
  const res = validationErrorResponse(errors, {
    'Access-Control-Allow-Origin': 'https://app.example',
  });
  assertEquals(res.status, 400);
  assertEquals(res.headers.get('Access-Control-Allow-Origin'), 'https://app.example');
  const body = await res.json();
  assertEquals(body.error, 'Dados inválidos');
  assertEquals(body.details.length, 1);
  assertEquals(body.details[0].field, 'campo');
});
