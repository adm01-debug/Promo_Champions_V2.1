// Cenários do codemod de tipografia (12/11/2026): roda o script de verdade numa pasta temporária com src/ de fixture.
import test from "node:test";
import assert from "node:assert/strict";
import { mkdtempSync, mkdirSync, writeFileSync, readFileSync, rmSync } from "node:fs";
import { tmpdir } from "node:os";
import { join, dirname } from "node:path";
import { spawnSync } from "node:child_process";
import { fileURLToPath } from "node:url";

const SCRIPT = join(dirname(fileURLToPath(import.meta.url)), "codemod-typography.mjs");
function rodar(conteudo, ...args) {
  const dir = mkdtempSync(join(tmpdir(), "tipografia-"));
  try {
    mkdirSync(join(dir, "src"));
    writeFileSync(join(dir, "src/t.tsx"), conteudo);
    const r = spawnSync(process.execPath, [SCRIPT, ...args], { cwd: dir, encoding: "utf8" });
    assert.equal(r.status, 0, r.stderr);
    return readFileSync(join(dir, "src/t.tsx"), "utf8");
  } finally { rmSync(dir, { recursive: true, force: true }); }
}
const h1 = (cls) => `export const X = () => <h1 className="${cls}">T</h1>;\n`;
const classes = (out) => /className="([^"]*)"/.exec(out)[1].split(" ").sort();

test("sem --write: só simula", () => {
  assert.equal(rodar(h1("text-3xl font-bold")), h1("text-3xl font-bold"));
});
test("h1 com tamanho+peso vira o token", () => {
  assert.deepEqual(classes(rodar(h1("text-3xl font-bold"), "--write")), ["text-page-title"]);
});
test("classes de layout e cor são mantidas", () => {
  assert.deepEqual(classes(rodar(h1("mt-4 text-3xl font-bold text-primary"), "--write")), ["mt-4", "text-page-title", "text-primary"].sort());
});
test("variantes com prefixo (md:, hover:, !) ficam INTEIRAS — antes sobrava 'md:' quebrado", () => {
  const out = rodar(h1("text-3xl font-bold md:text-4xl hover:font-black !font-bold"), "--write");
  const cs = classes(out);
  assert.ok(cs.includes("md:text-4xl"), out);
  assert.ok(cs.includes("hover:font-black"), out);
  assert.ok(cs.includes("!font-bold"), out);
  assert.ok(!cs.some((c) => /:$|^!$/.test(c)), `classe quebrada: ${out}`);
});
test("tamanho com altura de linha (text-xl/7) não é cortado pela metade", () => {
  const out = rodar(`export const X = () => <h2 className="text-xl/7 font-semibold">S</h2>;\n`, "--write");
  assert.ok(!/className="[^"]*(^|\s)\/7/.test(out), out);
});
test("className dinâmico (cn) e texto/comentário não são tocados", () => {
  const src = `import { cn } from "@/lib/utils";\nexport const C = (x: boolean) => <h1 className={cn("mt-2", x && "o")}>T</h1>;\n// <h1 className="text-3xl font-bold"> comentário\n`;
  assert.equal(rodar(src, "--write"), src);
});
test("revisão: tracking-* com prefixo também fica inteiro", () => {
  const cs = classes(rodar(h1("text-3xl font-bold md:tracking-tight lg:tracking-tighter"), "--write"));
  assert.ok(cs.includes("md:tracking-tight") && cs.includes("lg:tracking-tighter"), cs.join(" "));
  assert.ok(!cs.some((c) => /:$/.test(c)), cs.join(" "));
});
test("revisão: '/*' dentro de string (glob) não desliga o codemod no resto do arquivo", () => {
  const out = rodar(`const pages = import.meta.glob("./pages/**/*.tsx");\n` + h1("text-3xl font-bold"), "--write");
  assert.match(out, /className="text-page-title"/);
});
test("revisão: comentário no FIM da linha não é reescrito", () => {
  const src = `export const y = 1; // <h1 className="text-3xl font-bold"> exemplo\n`;
  assert.equal(rodar(src, "--write"), src);
});
test("idempotente", () => {
  const um = rodar(h1("mt-4 text-3xl font-bold md:text-4xl"), "--write");
  assert.equal(rodar(um, "--write"), um);
});

// (13/11) Casos achados na revisão adversarial: o léxico manual confundia texto JSX, regex literal e template.
const H1 = `<h1 className="text-3xl font-bold">T</h1>`;
const intacto = (src) => assert.equal(rodar(src, "--write"), src);
const converte = (src) => assert.match(rodar(src, "--write"), /className="text-page-title"/);
test("apóstrofo em texto JSX não engole o comentário seguinte", () => intacto(`export const A = () => <p>Don't</p>;\n// ${H1}\n`));
test("regex literal com aspas não engole o comentário seguinte", () => intacto(`const r = /"/;\n// ${H1}\n`));
test("template com crase dentro de \${} não engole o comentário seguinte", () => intacto("const t = `a ${'`'} b`;\n// " + H1 + "\n"));
test("regex literal com /* não desliga o resto do arquivo", () => converte(`const r = /a\\/*b/;\nexport const X = () => ${H1};\n`));
test("regex literal com \\/\\/ na mesma linha", () => converte(`const r = /https?:\\/\\//; export const X = () => ${H1};\n`));
test("// em texto JSX na mesma linha", () => converte(`export const X = () => <div><a>http://x</a>${H1}</div>;\n`));
test("/* aberto em texto JSX não desliga o resto", () => converte(`export const A = () => <code>dir/*.ts</code>;\nexport const X = () => ${H1};\n`));
test("token procurado como classe inteira (text-label-muted não é text-label)", () => {
  assert.match(rodar(`export const X = () => <FormLabel className="text-label-muted text-sm">L</FormLabel>;\n`, "--write"), /className="text-label text-label-muted"/);
});
test("tag em várias linhas (formato do Prettier)", () => converte(`export const X = () => (\n  <h1\n    className="text-3xl font-bold"\n  >\n    T\n  </h1>\n);\n`));
test("=> antes do className", () => converte(`export const X = ({ f }: { f: () => void }) => <h1 onClick={() => f()} className="text-3xl font-bold">T</h1>;\n`));
test("nenhum arquivo com alvo: sai 0 sem quebrar", () => intacto(`export const y = 1;\n`));
test("comentário JSX {/* */} não é tocado", () => intacto(`export const X = () => <div>{/* ${H1} */}</div>;\n`));
