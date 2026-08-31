import {
  isExpectedServiceRoleAuthorization,
  isExpectedSharedSecret,
} from "./internal-service-auth.ts";

function assert(condition: unknown, message: string): asserts condition {
  if (!condition) throw new Error(message);
}

Deno.test("reconhece somente o bearer de serviço esperado", () => {
  assert(
    isExpectedServiceRoleAuthorization("Bearer chave-interna", "chave-interna"),
    "deve aceitar o bearer correto",
  );
  assert(
    !isExpectedServiceRoleAuthorization(
      "Bearer chave-externa",
      "chave-interna",
    ),
    "não deve aceitar bearer diferente",
  );
  assert(
    !isExpectedServiceRoleAuthorization("Basic chave-interna", "chave-interna"),
    "não deve aceitar outro esquema",
  );
  assert(
    !isExpectedServiceRoleAuthorization(null, "chave-interna"),
    "não deve aceitar cabeçalho ausente",
  );
  assert(
    !isExpectedServiceRoleAuthorization("Bearer chave-interna", undefined),
    "não deve aceitar segredo ausente",
  );
});

Deno.test("compara segredo compartilhado sem aceitar ausências ou prefixos", () => {
  assert(
    isExpectedSharedSecret("segredo-completo", "segredo-completo"),
    "deve aceitar igualdade",
  );
  assert(
    !isExpectedSharedSecret("segredo", "segredo-completo"),
    "não deve aceitar prefixo",
  );
  assert(
    !isExpectedSharedSecret("segredo-completo-x", "segredo-completo"),
    "não deve aceitar sufixo",
  );
  assert(
    !isExpectedSharedSecret(null, "segredo-completo"),
    "não deve aceitar valor ausente",
  );
  assert(
    !isExpectedSharedSecret("segredo-completo", undefined),
    "não deve aceitar esperado ausente",
  );
});
