#!/usr/bin/env node
/**
 * Codemod: aplica tokens tipográficos semânticos
 *  - text-page-title    → <h1>, PageTitle
 *  - text-section-title → <h2>/<h3>/<h4>, CardTitle, DialogTitle, SheetTitle,
 *                         AlertDialogTitle, DrawerTitle, PopoverTitle, AlertTitle,
 *                         SectionTitle, TypographyH2/H3/H4
 *  - text-label         → <Label>/<label>, FormLabel
 *
 * Estratégia:
 *  - Tags HTML básicas (h1-h4, label): exigem assinatura (size+weight) para evitar
 *    falsos positivos em textos comuns.
 *  - Componentes nomeados (CardTitle, DialogTitle, FormLabel, …): aplicam o token
 *    sempre que possuem className, pois já são semanticamente o alvo.
 *
 * Uso: node scripts/codemod-typography.mjs [--write]
 */
import { readFileSync, writeFileSync, readdirSync } from "node:fs";
import { join } from "node:path";
import { createRequire } from "node:module";

// (13/11) Lê a árvore de sintaxe do TypeScript em vez de regex/léxico sobre o texto: comentários, regex literais,
// texto JSX (Don't, http://x, dir/*.ts), tags em várias linhas e props com "=>" deixam de enganar o codemod.
function carregarTs() {
  for (const base of [import.meta.url, join(process.cwd(), "package.json")]) {
    try { return createRequire(base)("typescript"); } catch { /* tenta a próxima origem */ }
  }
  console.error("codemod-typography: pacote 'typescript' não encontrado (rode npm ci).");
  process.exit(2);
}
const ts = carregarTs();
const WRITE = process.argv.includes("--write");

function arquivosTsx(dir) {
  const lista = [];
  let entradas = [];
  try { entradas = readdirSync(dir, { withFileTypes: true }); } catch { return lista; }
  for (const e of entradas) {
    if (e.name === "node_modules" || e.name.startsWith(".")) continue;
    const p = join(dir, e.name);
    if (e.isDirectory()) lista.push(...arquivosTsx(p));
    else if (e.isFile() && e.name.endsWith(".tsx")) lista.push(p);
  }
  return lista.sort();
}
const files = arquivosTsx("src");

const stripPage = [
  /(?<!\S)text-(2xl|3xl|4xl)(?!\S)/g,
  /(?<!\S)font-(bold|extrabold|black)(?!\S)/g,
  /(?<!\S)tracking-(tight|tighter)(?!\S)/g,
  /(?<!\S)leading-(none|tight)(?!\S)/g,
  /(?<!\S)font-display(?!\S)/g,
];
const stripSection = [
  /(?<!\S)text-(base|lg|xl|2xl)(?!\S)/g,
  /(?<!\S)font-(semibold|bold)(?!\S)/g,
  /(?<!\S)tracking-tight(?!\S)/g,
  /(?<!\S)leading-(snug|tight)(?!\S)/g,
  /(?<!\S)font-display(?!\S)/g,
];
const stripLabel = [/(?<!\S)text-sm(?!\S)/g, /(?<!\S)font-medium(?!\S)/g, /(?<!\S)leading-none(?!\S)/g];

// Regras por tag.
//  - force: aplica token sem exigir size+weight (componentes já-semânticos)
const tagRules = {
  // HTML básicos — exigem assinatura
  h1: { token: "text-page-title", strip: stripPage,
        size: /(?<!\S)text-(2xl|3xl|4xl)(?!\S)/, weight: /(?<!\S)font-(bold|extrabold|black)(?!\S)/ },
  h2: { token: "text-section-title", strip: stripSection,
        size: /(?<!\S)text-(base|lg|xl|2xl)(?!\S)/, weight: /(?<!\S)font-(semibold|bold)(?!\S)/ },
  h3: { token: "text-section-title", strip: stripSection,
        size: /(?<!\S)text-(base|lg|xl|2xl)(?!\S)/, weight: /(?<!\S)font-(semibold|bold)(?!\S)/ },
  h4: { token: "text-section-title", strip: stripSection,
        size: /(?<!\S)text-(base|lg|xl)(?!\S)/, weight: /(?<!\S)font-(semibold|bold|medium)(?!\S)/ },
  label: { token: "text-label", strip: stripLabel,
           size: /(?<!\S)text-sm(?!\S)/, weight: /(?<!\S)font-medium(?!\S)/ },
  Label: { token: "text-label", strip: stripLabel,
           size: /(?<!\S)text-sm(?!\S)/, weight: /(?<!\S)font-medium(?!\S)/ },

  // Componentes semânticos — token aplicado sempre
  PageTitle:        { token: "text-page-title",    strip: stripPage,    force: true },
  TypographyH1:     { token: "text-page-title",    strip: stripPage,    force: true },
  CardTitle:        { token: "text-section-title", strip: stripSection, force: true },
  DialogTitle:      { token: "text-section-title", strip: stripSection, force: true },
  SheetTitle:       { token: "text-section-title", strip: stripSection, force: true },
  AlertDialogTitle: { token: "text-section-title", strip: stripSection, force: true },
  DrawerTitle:      { token: "text-section-title", strip: stripSection, force: true },
  PopoverTitle:     { token: "text-section-title", strip: stripSection, force: true },
  AlertTitle:       { token: "text-section-title", strip: stripSection, force: true },
  SectionTitle:     { token: "text-section-title", strip: stripSection, force: true },
  TypographyH2:     { token: "text-section-title", strip: stripSection, force: true },
  TypographyH3:     { token: "text-section-title", strip: stripSection, force: true },
  TypographyH4:     { token: "text-section-title", strip: stripSection, force: true },
  FormLabel:        { token: "text-label",         strip: stripLabel,   force: true },
};

const temClasse = (classes, token) => classes.split(/\s+/).includes(token);
const limpar = (s) => s.split(/\s+/).filter(Boolean).join(" ");

// Reescreve as classes de UM className="…" conforme a regra; null = não mexe.
function reescrever(classes, rule) {
  if (temClasse(classes, rule.token)) return null;
  if (!rule.force && (!rule.size.test(classes) || !rule.weight.test(classes))) return null;
  let next = classes;
  for (const p of rule.strip) next = next.replace(p, "");
  return limpar(`${rule.token} ${next}`);
}

let totalChanges = 0;
const touched = [];

for (const file of files) {
  const original = readFileSync(file, "utf8");
  const sf = ts.createSourceFile(file, original, ts.ScriptTarget.Latest, true, ts.ScriptKind.TSX);
  const trocas = [];
  (function visita(no) {
    if (ts.isJsxOpeningElement(no) || ts.isJsxSelfClosingElement(no)) {
      const rule = Object.prototype.hasOwnProperty.call(tagRules, no.tagName.getText(sf)) ? tagRules[no.tagName.getText(sf)] : null;
      if (rule) {
        for (const at of no.attributes.properties) {
          if (!ts.isJsxAttribute(at) || at.name.getText(sf) !== "className" || !at.initializer || !ts.isStringLiteral(at.initializer)) continue;
          const ini = at.initializer.getStart(sf) + 1, fim = at.initializer.getEnd() - 1;
          const novo = reescrever(original.slice(ini, fim), rule);
          if (novo !== null && novo !== original.slice(ini, fim)) trocas.push({ ini, fim, novo });
        }
      }
    }
    ts.forEachChild(no, visita);
  })(sf);
  if (!trocas.length) continue;
  let out = original;
  for (const t of trocas.sort((x, y) => y.ini - x.ini)) out = out.slice(0, t.ini) + t.novo + out.slice(t.fim);
  totalChanges += trocas.length;
  touched.push({ file, changes: trocas.length });
  if (WRITE) writeFileSync(file, out);
}

console.log(
  `${WRITE ? "Aplicado" : "Dry-run"}: ${totalChanges} substituições em ${
    touched.length
  } arquivos.`
);
for (const t of touched.slice(0, 30))
  console.log(`  ${t.file}  (+${t.changes})`);
if (touched.length > 30) console.log(`  …e mais ${touched.length - 30}`);
if (!WRITE) console.log("\nRode com --write para aplicar.");
