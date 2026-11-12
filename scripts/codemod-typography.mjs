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
import { readFileSync, writeFileSync } from "node:fs";

let ultimoFonte = null, ultimasFaixas = [];
function faixasDeComentario(src) {
  const faixas = [];
  for (let i = 0; i < src.length; i++) {
    const c = src[i], d = src[i + 1];
    if (c === '"' || c === "'" || c === "`") {
      for (i++; i < src.length && src[i] !== c; i++) if (src[i] === "\\") i++;
    } else if (c === "/" && d === "/") {
      const fim = src.indexOf("\n", i); faixas.push([i, fim < 0 ? src.length : fim]); i = fim < 0 ? src.length : fim;
    } else if (c === "/" && d === "*") {
      const fim = src.indexOf("*/", i + 2); faixas.push([i, fim < 0 ? src.length : fim + 2]); i = fim < 0 ? src.length : fim + 1;
    }
  }
  return faixas;
}
function dentroDeComentario(src, pos) {
  if (src !== ultimoFonte) { ultimoFonte = src; ultimasFaixas = faixasDeComentario(src); }
  return ultimasFaixas.some(([a, b]) => pos >= a && pos < b);
}
import { execSync } from "node:child_process";

const WRITE = process.argv.includes("--write");

const TAGS = [
  "h1", "h2", "h3", "h4", "label", "Label",
  "CardTitle", "DialogTitle", "SheetTitle", "AlertDialogTitle",
  "DrawerTitle", "PopoverTitle", "AlertTitle", "SectionTitle", "PageTitle",
  "TypographyH1", "TypographyH2", "TypographyH3", "TypographyH4",
  "FormLabel",
];

const files = execSync(
  `grep -rEl --include='*.tsx' '<(${TAGS.join("|")})[^>]*className=' src/`,
  { maxBuffer: 32 * 1024 * 1024 }
)
  .toString()
  .trim()
  .split("\n")
  .filter(Boolean);

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

const cleanup = (s) =>
  s.replace(/\s{2,}/g, " ").replace(/"\s+/g, '"').replace(/\s+"/g, '"').trim();

let totalChanges = 0;
const touched = [];

for (const file of files) {
  const original = readFileSync(file, "utf8");
  let out = original;

  for (const [tag, rule] of Object.entries(tagRules)) {
    const re = new RegExp(
      `(<${tag}\\b[^>]*?className=")([^"]+)("[^>]*>)`,
      "g"
    );
    out = out.replace(re, (m, open, classes, close, offset, whole) => {
      // (12/11) JSX dentro de comentário (// ou /* … */) é exemplo/documentação: não reescrever. Faixas calculadas por
      // um léxico que respeita strings/template literals ("./**/*.tsx" num glob NÃO abre comentário).
      if (dentroDeComentario(whole, offset)) return m;
      if (classes.includes(rule.token)) return m;
      if (!rule.force) {
        if (!rule.size.test(classes) || !rule.weight.test(classes)) return m;
      }
      let next = classes;
      for (const p of rule.strip) next = next.replace(p, "");
      next = cleanup(`${rule.token} ${next}`);
      return `${open}${next}${close}`;
    });
  }

  if (out !== original) {
    const changes =
      (out.match(/text-(page-title|section-title|label)/g) || []).length -
      (original.match(/text-(page-title|section-title|label)/g) || []).length;
    totalChanges += changes;
    touched.push({ file, changes });
    if (WRITE) writeFileSync(file, out);
  }
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
