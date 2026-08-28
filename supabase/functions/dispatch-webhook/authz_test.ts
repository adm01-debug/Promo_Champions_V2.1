// Guard-rail estático: disparos externos não podem voltar a aceitar somente
// um header Authorization sem validar JWT e a role admin/manager.
import {
  assert,
  assertStringIncludes,
} from "https://deno.land/std@0.224.0/assert/mod.ts";

const sourceUrl = new URL("./index.ts", import.meta.url);

Deno.test("dispatch-webhook valida JWT e role antes de criar client de serviço", async () => {
  const source = await Deno.readTextFile(sourceUrl);
  assertStringIncludes(source, "getUserClient(req)");
  assertStringIncludes(source, "'is_admin_or_manager'");
  assertStringIncludes(source, "getServiceClient(");
  assert(
    source.indexOf("getUserClient(req)") < source.indexOf("getServiceClient("),
    "o client de serviço só pode ser criado após validar o JWT",
  );
  assert(
    source.indexOf("'is_admin_or_manager'") <
      source.indexOf("getServiceClient("),
    "o RBAC deve ocorrer antes de disparar webhooks com service_role",
  );
});

Deno.test("dispatch-webhook rejeita chamador sem role operacional", async () => {
  const source = await Deno.readTextFile(sourceUrl);
  assertStringIncludes(source, "role de administrador ou gestor é obrigatória");
  assertStringIncludes(source, "status: 403");
  assertStringIncludes(source, "req.method !== 'POST'");
});
