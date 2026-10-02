// Guard-rail estático: o envio de link de redefinição de senha exige JWT
// válido (401), role admin (403) e rate limit por usuário — nunca um 500
// genérico para falhas de autenticação/autorização, e o corpo de erro
// externo não pode vazar detalhes internos.
import {
  assert,
  assertStringIncludes,
} from 'https://deno.land/std@0.224.0/assert/mod.ts';

const sourceUrl = new URL('./index.ts', import.meta.url);

Deno.test(
  'send-password-reset autentica o chamador antes de criar o client de serviço',
  async () => {
    const source = await Deno.readTextFile(sourceUrl);
    assertStringIncludes(source, 'getUserClient(req)');
    assertStringIncludes(source, 'UnauthorizedError');
    assert(
      source.indexOf('getUserClient(req)') < source.indexOf('SUPABASE_SERVICE_ROLE_KEY'),
      'o client de serviço só pode ser criado após validar o JWT'
    );
  }
);

Deno.test(
  'send-password-reset distingue 401 (token) de 403 (não-admin) e limita por usuário',
  async () => {
    const source = await Deno.readTextFile(sourceUrl);
    assertStringIncludes(source, '401');
    assertStringIncludes(source, '403');
    assertStringIncludes(source, '"has_role"');
    assertStringIncludes(source, 'enforceRateLimit');
    assertStringIncludes(source, 'key: authCtx.userId');
    assert(
      source.indexOf('getUserClient(req)') < source.indexOf('enforceRateLimit(req,'),
      'o rate limit deve usar a identidade autenticada'
    );
  }
);

Deno.test('send-password-reset não vaza detalhes internos no corpo de erro', async () => {
  const source = await Deno.readTextFile(sourceUrl);
  assertStringIncludes(source, '"internal_error"');
  assert(
    !source.includes('error instanceof Error ? error.message'),
    'o catch externo não pode devolver error.message cru'
  );
});
