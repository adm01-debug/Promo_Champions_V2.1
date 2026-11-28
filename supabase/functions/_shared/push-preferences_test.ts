import { isSuppressed, suppressReasons } from "./push-preferences.ts";

const sourceUrl = new URL("../send-push-notification/index.ts", import.meta.url);

function readFunctionSource(): string {
  return Deno.readTextFileSync(sourceUrl);
}

function assertEquals<T>(actual: T, expected: T, message: string) {
  const a = JSON.stringify(actual);
  const e = JSON.stringify(expected);
  if (a !== e) throw new Error(`${message}: esperado ${e}, recebido ${a}`);
}

// Data local explicita: a regra usa hora local do servidor.
const at = (hh: number, mm = 0) => new Date(2026, 0, 15, hh, mm, 0, 0);

Deno.test("sem preferencia gravada o push passa", () => {
  assertEquals(suppressReasons(undefined, "milestones", at(3)), null, "sem prefs");
  assertEquals(suppressReasons(null, "milestones", at(3)), null, "prefs nulas");
});

Deno.test("categoria desligada suprime so aquela categoria", () => {
  const prefs = { categories: { milestones: false } };
  assertEquals(suppressReasons(prefs, "milestones", at(12)), "category", "milestones off");
  assertEquals(suppressReasons(prefs, "streaks", at(12)), null, "outra categoria");
  assertEquals(suppressReasons(prefs, undefined, at(12)), null, "sem categoria no payload");
});

Deno.test("horario de silencio dentro do mesmo dia", () => {
  const prefs = { quietHoursEnabled: true, quietHoursStart: "12:00", quietHoursEnd: "14:00" };
  assertEquals(isSuppressed(prefs, undefined, at(11, 59)), false, "antes");
  assertEquals(isSuppressed(prefs, undefined, at(12)), true, "inicio inclusivo");
  assertEquals(isSuppressed(prefs, undefined, at(13, 30)), true, "no meio");
  assertEquals(isSuppressed(prefs, undefined, at(14)), false, "fim exclusivo");
});

Deno.test("janela que cruza a meia-noite e continua", () => {
  const prefs = { quietHoursEnabled: true, quietHoursStart: "22:00", quietHoursEnd: "07:00" };
  assertEquals(isSuppressed(prefs, undefined, at(23)), true, "22h+");
  assertEquals(isSuppressed(prefs, undefined, at(3)), true, "madrugada");
  assertEquals(isSuppressed(prefs, undefined, at(6, 59)), true, "antes das 7");
  assertEquals(isSuppressed(prefs, undefined, at(7)), false, "as 7 libera");
  assertEquals(isSuppressed(prefs, undefined, at(12)), false, "meio-dia");
});

Deno.test("janela invalida ou desligada nao suprime", () => {
  assertEquals(
    isSuppressed({ quietHoursEnabled: true, quietHoursStart: "25:00", quietHoursEnd: "07:00" }, undefined, at(3)),
    false,
    "hora invalida",
  );
  assertEquals(
    isSuppressed({ quietHoursEnabled: true, quietHoursStart: "10:00", quietHoursEnd: "10:00" }, undefined, at(10)),
    false,
    "janela vazia",
  );
  assertEquals(
    isSuppressed({ quietHoursEnabled: false, quietHoursStart: "22:00", quietHoursEnd: "07:00" }, undefined, at(23)),
    false,
    "desligado",
  );
});

Deno.test("a function consulta as preferencias so em chamada de servico", async () => {
  const source = readFunctionSource();
  const block = source.slice(source.indexOf("let targets: string[] = user_ids;"));
  const gate = block.slice(0, block.indexOf("const subscriptions"));
  if (!/if \(isServiceCall\) \{/.test(gate)) {
    throw new Error("o filtro de preferencias deve rodar apenas em chamadas service_role");
  }
  if (!gate.includes("resolveSuppressedUsers(")) {
    throw new Error("o filtro deve consultar user_app_settings");
  }
  if (!gate.includes("data?.category")) {
    throw new Error("a categoria deve vir de data.category");
  }
  if (!/from\('user_app_settings'\)/.test(source)) {
    throw new Error("a fonte das preferencias deve ser user_app_settings");
  }
});