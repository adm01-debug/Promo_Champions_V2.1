// Guard-rail estático para impedir que esta edge volte a enviar propostas
// usando service_role sem validar JWT e ownership do orçamento.
import {
  assert,
  assertStringIncludes,
} from "https://deno.land/std@0.224.0/assert/mod.ts";

const sourceUrl = new URL("./index.ts", import.meta.url);

Deno.test("send-quote-to-client valida JWT antes do client privilegiado", async () => {
  const source = await Deno.readTextFile(sourceUrl);
  assertStringIncludes(source, "getUserClient(req)");
  assertStringIncludes(source, "getServiceClient(");
  const rlsLookupAt = source.search(/auth\.client\s*\.from\(["']quotes["']\)/);
  assert(rlsLookupAt >= 0, "a edge deve consultar quotes com o client sujeito a RLS");
  assert(
    source.indexOf("getUserClient(req)") < source.indexOf("getServiceClient("),
    "o client de serviço só pode ser criado após validar o JWT",
  );
  assert(
    rlsLookupAt < source.indexOf("getServiceClient("),
    "a autorização por RLS deve ocorrer antes de consultar o orçamento com service_role",
  );
  assert(
    !source.includes("createClient("),
    "a edge deve usar os clients compartilhados",
  );
});

Deno.test("send-quote-to-client confere role operacional ou ownership do vendedor", async () => {
  const source = await Deno.readTextFile(sourceUrl);
  assertStringIncludes(source, '"is_admin_or_manager"');
  assertStringIncludes(source, '.from("salespeople")');
  assertStringIncludes(source, '.eq("auth_user_id", auth.userId)');
  assertStringIncludes(source, "salesperson.id !== quote.created_by");
  assertStringIncludes(source, "status: 403");
});
