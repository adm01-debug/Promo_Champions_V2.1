import {
  assert,
  assertMatch,
  assertNotMatch,
  assertStringIncludes,
} from "jsr:@std/assert@1";

const names = [
  "calculate-committee-coverage",
  "calibrate-win-probabilities",
  "calibrate-win-probability",
  "coaching-impact-summary",
  "nlq-query",
] as const;

const readFunction = (name: string) =>
  Deno.readTextFile(new URL(`../${name}/index.ts`, import.meta.url));

Deno.test("handlers reparados são parseáveis e usam contrato HTTP explícito", async () => {
  for (const name of names) {
    const source = await readFunction(name);
    // deno-lint-ignore no-control-regex -- o teste procura control chars no source de propósito
    assertNotMatch(source, /[\x00-\x08\x0b\x0c\x0e-\x1f\x7f]/);
    assertStringIncludes(source, `withRequestId("${name}"`.replaceAll('"', source.includes(`withRequestId('${name}'`) ? "'" : '"'));
    assertMatch(source, /req\.method\s*!==\s*["']POST["']/);
  }

  const nlq = await readFunction("nlq-query");
  assertNotMatch(nlq, /import\s*\{\s*import\s*\{/);
  assertMatch(nlq, /import\s*\{\s*fetchWithTimeout\s*\}/);
});

Deno.test("funções globais provam autorização antes do service_role", async () => {
  const committee = await readFunction("calculate-committee-coverage");
  const committeeGate = committee.indexOf("await getUserClient(req)");
  const committeeAdmin = committee.indexOf("SUPABASE_SERVICE_ROLE_KEY");
  assert(
    committeeGate >= 0 && committeeGate < committeeAdmin,
    "comitê deve provar acesso RLS antes de criar client admin",
  );

  for (const name of ["calibrate-win-probabilities", "calibrate-win-probability"]) {
    const source = await readFunction(name);
    const roleGate = source.indexOf("is_admin_or_manager");
    const adminClient = source.indexOf("const supabase = createClient");
    assert(roleGate >= 0 && roleGate < adminClient, `${name}: RBAC ocorre tarde demais`);
    assertMatch(source, /error:\s*["']forbidden["']/);
    assertMatch(source, /error:\s*["']unauthorized["']/);
  }
});
