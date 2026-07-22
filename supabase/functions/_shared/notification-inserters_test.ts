// Guard-rail estático (Onda L Fase 5):
// Todo edge function que insere em `notifications` DEVE passar por
// `partitionNotificationBatch` — evita regressão da CHECK constraint
// `notifications_category_check` que já quebrou produção no passado.
import { assertEquals } from "https://deno.land/std@0.224.0/assert/mod.ts";
import { walk } from "https://deno.land/std@0.224.0/fs/walk.ts";

const FUNCTIONS_ROOT = new URL("../", import.meta.url).pathname;

// Files that legitimately insert into notifications WITHOUT the helper
// (e.g. tests, or already-refactored inserters going through a wrapper).
const ALLOWLIST = new Set<string>([
  // Add file names here with justification if a false-positive appears.
]);

Deno.test("all notification inserters use partitionNotificationBatch", async () => {
  const offenders: Array<{ file: string; line: number; snippet: string }> = [];

  for await (const entry of walk(FUNCTIONS_ROOT, {
    exts: [".ts"],
    skip: [/_test\.ts$/, /\.test\.ts$/, /_shared\/notification-categories\.ts$/],
  })) {
    if (!entry.isFile) continue;
    const rel = entry.path.replace(FUNCTIONS_ROOT, "");
    if (ALLOWLIST.has(rel)) continue;

    const src = await Deno.readTextFile(entry.path);
    // Heuristic: look for `.from('notifications')` followed within ~400 chars
    // by `.insert(` — flag if `partitionNotificationBatch` is NOT present in
    // the file.
    const notifIdx = src.indexOf(".from('notifications')");
    const notifIdx2 = src.indexOf('.from("notifications")');
    const hasNotif = notifIdx >= 0 || notifIdx2 >= 0;
    if (!hasNotif) continue;

    const anchor = notifIdx >= 0 ? notifIdx : notifIdx2;
    const window = src.slice(anchor, anchor + 400);
    if (!window.includes(".insert(") && !window.includes(".upsert(")) continue;

    if (src.includes("partitionNotificationBatch")) continue;

    // Compute line number for the anchor.
    const line = src.slice(0, anchor).split("\n").length;
    offenders.push({
      file: rel,
      line,
      snippet: window.split("\n").slice(0, 3).join("\n"),
    });
  }

  if (offenders.length > 0) {
    const msg = offenders
      .map((o) => `  ${o.file}:${o.line}\n    ${o.snippet.replace(/\n/g, "\n    ")}`)
      .join("\n");
    throw new Error(
      `${offenders.length} edge function(s) inserem em notifications sem partitionNotificationBatch:\n${msg}\n` +
        `Importe de _shared/notification-categories.ts ou adicione o arquivo ao ALLOWLIST com justificativa.`,
    );
  }
  assertEquals(offenders.length, 0);
});
