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
  /\btext-(2xl|3xl|4xl)\b/g,
  /\bfont-(bold|extrabold|black)\b/g,
  /\btracking-(tight|tighter)\b/g,
  /\bleading-(none|tight)\b/g,
  /\bfont-display\b/g,
];
const stripSection = [
  /\btext-(base|lg|xl|2xl)\b/g,
  /\bfont-(semibold|bold)\b/g,
  /\btracking-tight\b/g,
  /\bleading-(snug|tight)\b/g,
  /\bfont-display\b/g,
];
const stripLabel = [/\btext-sm\b/g, /\bfont-medium\b/g, /\bleading-none\b/g];

// Regras por tag.
//  - force: aplica token sem exigir size+weight (componentes já-semânticos)
const tagRules = {
  // HTML básicos — exigem assinatura
  h1: { token: "text-page-title", strip: stripPage,
        size: /\btext-(2xl|3xl|4xl)\b/, weight: /\bfont-(bold|extrabold|black)\b/ },
  h2: { token: "text-section-title", strip: stripSection,
        size: /\btext-(base|lg|xl|2xl)\b/, weight: /\bfont-(semibold|bold)\b/ },
  h3: { token: "text-section-title", strip: stripSection,
        size: /\btext-(base|lg|xl|2xl)\b/, weight: /\bfont-(semibold|bold)\b/ },
  h4: { token: "text-section-title", strip: stripSection,
        size: /\btext-(base|lg|xl)\b/, weight: /\bfont-(semibold|bold|medium)\b/ },
  label: { token: "text-label", strip: stripLabel,
           size: /\btext-sm\b/, weight: /\bfont-medium\b/ },
  Label: { token: "text-label", strip: stripLabel,
           size: /\btext-sm\b/, weight: /\bfont-medium\b/ },

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
    out = out.replace(re, (m, open, classes, close) => {
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
