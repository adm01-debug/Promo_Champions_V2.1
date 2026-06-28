#!/usr/bin/env node
/**
 * Codemod: aplica tokens tipográficos semânticos
 *  - text-page-title    → <h1> com text-2xl/3xl font-bold/extrabold
 *  - text-section-title → <h2>/<h3> com text-lg/xl font-semibold/bold
 *  - text-label         → <Label>/<label> com text-sm font-medium
 *
 * Conservador: só atua dentro de className="..." de tags-alvo,
 * preservando classes utilitárias não-tipográficas.
 *
 * Uso: node scripts/codemod-typography.mjs [--write]
 */
import { readFileSync, writeFileSync } from "node:fs";
import { execSync } from "node:child_process";

const WRITE = process.argv.includes("--write");

const files = execSync(
  `grep -rEl --include='*.tsx' '<(h1|h2|h3|label|Label)[^>]*className=' src/`
)
  .toString()
  .trim()
  .split("\n")
  .filter(Boolean);

// Classes que compõem cada "assinatura" tipográfica
const SIG = {
  pageTitle: {
    size: /\btext-(2xl|3xl)\b/,
    weight: /\bfont-(bold|extrabold|black)\b/,
    token: "text-page-title",
    strip: [
      /\btext-(2xl|3xl)\b/g,
      /\bfont-(bold|extrabold|black)\b/g,
      /\btracking-(tight|tighter)\b/g,
      /\bleading-(none|tight)\b/g,
      /\bfont-display\b/g,
    ],
  },
  sectionTitle: {
    size: /\btext-(lg|xl)\b/,
    weight: /\bfont-(semibold|bold)\b/,
    token: "text-section-title",
    strip: [
      /\btext-(lg|xl)\b/g,
      /\bfont-(semibold|bold)\b/g,
      /\btracking-tight\b/g,
      /\bleading-(snug|tight)\b/g,
      /\bfont-display\b/g,
    ],
  },
  label: {
    size: /\btext-sm\b/,
    weight: /\bfont-medium\b/,
    token: "text-label",
    strip: [/\btext-sm\b/g, /\bfont-medium\b/g, /\bleading-none\b/g],
  },
};

const tagRules = {
  h1: SIG.pageTitle,
  h2: SIG.sectionTitle,
  h3: SIG.sectionTitle,
  label: SIG.label,
  Label: SIG.label,
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
      if (!rule.size.test(classes) || !rule.weight.test(classes)) return m;
      let next = classes;
      for (const p of rule.strip) next = next.replace(p, "");
      next = cleanup(`${rule.token} ${next}`);
      return `${open}${next}${close}`;
    });
  }

  if (out !== original) {
    const diffLines = out.split("\n").length - original.split("\n").length;
    const changes = (out.match(/text-(page-title|section-title|label)/g) || [])
      .length -
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
