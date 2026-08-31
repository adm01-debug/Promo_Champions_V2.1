import {
  assert,
  assertMatch,
  assertNotMatch,
  assertStringIncludes,
} from "jsr:@std/assert@1";

const functions = [
  ["notify-v4-quote-status", '.from("v4_callback_dead_letters")'],
  ["check-v4-callback-alerts", '.from("v4_callback_alert_settings")'],
  ["cron-failure-alerter", "fn_admin_get_new_cron_failures"],
  ["process-call-recording-ingest", "dequeue_call_recording_ingest_jobs"],
  ["edge-retry-threshold-alert", '.from("edge_retry_events")'],
] as const;

const readFunction = (name: string) =>
  Deno.readTextFile(new URL(`../${name}/index.ts`, import.meta.url));

Deno.test("jobs operacionais autenticam antes de acessar dados privilegiados", async () => {
  for (const [name, firstBusinessOperation] of functions) {
    const source = await readFunction(name);
    const executableSource = source.replace(/\/\/.*$/gm, "");

    assertMatch(source, /req\.method\s*!==\s*["']POST["']/);
    assertStringIncludes(source, "isAuthorizedCronRequest(req");
    assertMatch(source, /\.eq\(["']key["'],\s*["']coaching_cron_secret["']\)/);
    assertMatch(source, /error:\s*["']unauthorized["']/);
    assertNotMatch(source, /[\x00-\x08\x0b\x0c\x0e-\x1f\x7f]/);

    const authGate = executableSource.indexOf("isAuthorizedCronRequest(req");
    const businessOperation = executableSource.indexOf(firstBusinessOperation);
    assert(authGate >= 0, `${name}: gate de autenticação ausente`);
    assert(
      businessOperation > authGate,
      `${name}: operação privilegiada ocorre antes da autenticação`,
    );
  }
});

Deno.test("handlers operacionais usam middleware com nome explícito", async () => {
  for (const [name] of functions) {
    const source = await readFunction(name);
    assertStringIncludes(source, `withRequestId("${name}"`);
  }
});

Deno.test("callback V4 desabilitado não derruba o worker no boot", async () => {
  const source = await readFunction("notify-v4-quote-status");
  assertNotMatch(source, /throw new Error\(["']V4_CALLBACK_/);
  assertMatch(source, /callback disabled \(missing config\)/);
});

Deno.test("configuração delega JWT ao gate interno dos cinco handlers", async () => {
  const config = await Deno.readTextFile(
    new URL("../../config.toml", import.meta.url),
  );
  for (const [name] of functions) {
    assertMatch(
      config,
      new RegExp(`\\[functions\\.${name}\\]\\s+verify_jwt\\s*=\\s*false`),
    );
  }
});
