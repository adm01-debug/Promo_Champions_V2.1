import { assertEquals, assertThrows } from 'jsr:@std/assert@1';
import {
  base64urlToBytes,
  bytesToBase64url,
  expectedOrigins,
} from './webauthn-helpers.ts';

Deno.test('base64url: roundtrip preserva bytes arbitrários', () => {
  const bytes = new Uint8Array(256).map((_, i) => i);
  const encoded = bytesToBase64url(bytes);

  assertEquals(/^[A-Za-z0-9_-]+$/.test(encoded), true);
  assertEquals(encoded.includes('='), false);
  assertEquals([...base64urlToBytes(encoded)], [...bytes]);
});

Deno.test('base64url: decode aceita padding e caracteres +/', () => {
  // ">>>" (0xfb 0xef 0xbe) — bytes que geram + e / em base64 padrão.
  const bytes = new Uint8Array([0xfb, 0xef, 0xbe]);
  assertEquals([...base64urlToBytes(bytesToBase64url(bytes))], [...bytes]);
  assertEquals([...base64urlToBytes('aGVsbG8=')], [...base64urlToBytes('aGVsbG8')]);
});

Deno.test('base64url: decode rejeita input inválido', () => {
  assertThrows(() => base64urlToBytes('!!!'));
});

Deno.test('expectedOrigins: sempre inclui https do rpId', () => {
  assertEquals(expectedOrigins(null, 'app.promobrindes.com.br'), [
    'https://app.promobrindes.com.br',
  ]);
});

Deno.test('expectedOrigins: aceita Origin cujo host casa com o rpId', () => {
  const origins = expectedOrigins(
    'https://app.promobrindes.com.br',
    'app.promobrindes.com.br'
  );
  assertEquals(origins, ['https://app.promobrindes.com.br']);

  const subdomain = expectedOrigins(
    'https://sub.app.promobrindes.com.br',
    'app.promobrindes.com.br'
  );
  assertEquals(subdomain, [
    'https://app.promobrindes.com.br',
    'https://sub.app.promobrindes.com.br',
  ]);
});

Deno.test('expectedOrigins: aceita localhost para desenvolvimento', () => {
  const origins = expectedOrigins('http://localhost:5173', 'localhost');
  assertEquals(origins, ['https://localhost', 'http://localhost:5173']);
});

Deno.test('expectedOrigins: rejeita Origin de host estranho ao rpId', () => {
  const origins = expectedOrigins('https://evil.example.com', 'app.promobrindes.com.br');
  assertEquals(origins, ['https://app.promobrindes.com.br']);
});

Deno.test('expectedOrigins: Origin malformado não quebra o cálculo', () => {
  const origins = expectedOrigins('not-a-url', 'app.promobrindes.com.br');
  assertEquals(origins, ['https://app.promobrindes.com.br']);
});
