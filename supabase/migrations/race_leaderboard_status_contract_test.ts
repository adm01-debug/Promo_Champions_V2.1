import { assert, assertMatch } from "jsr:@std/assert@1";

const migrationUrl = new URL(
  "./20260830000000_fix_race_leaderboard_status.sql",
  import.meta.url,
);

Deno.test("fix da leaderboard preserva dependências e o contrato público", async () => {
  const source = await Deno.readTextFile(migrationUrl);

  assert(
    !/\bDROP\s+VIEW\b/i.test(source),
    "a migration não pode remover views dependentes",
  );
  assertMatch(
    source,
    /CREATE\s+OR\s+REPLACE\s+VIEW\s+public\.race_leaderboard_view/i,
  );
  assertMatch(
    source,
    /GRANT\s+SELECT\s+ON\s+public\.race_spectator_view\s+TO\s+anon,\s*authenticated;/i,
  );
  assertMatch(
    source,
    /s\.status\s*=\s*ANY\s*\(\s*ARRAY\['won'::text,\s*'completed'::text\]\)/i,
  );
  assertMatch(
    source,
    /\(\(sp\.role\)::text\s*=\s*rs\.role_type\)\s+OR\s+\(\(sp\.role\)::text\s*=\s*'hybrid'::text\)/i,
  );
});
