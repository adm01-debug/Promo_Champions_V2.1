#!/usr/bin/env node
/** Fix CORS: replace static corsHeaders with getCorsHeaders(req) in all edge functions. */
const { readFileSync, writeFileSync, readdirSync } = require("fs");
const { join, relative } = require("path");

const ROOT = join(__dirname, "..");
const IMPORT_RE = /import \{([^}]+)\} from ["']\.\.\/_shared\/cors\.ts["'];?/;
const HEADERS_RE = /\{\s*(?:\.\.\.)?corsHeaders\b/g;

function fixFile(filePath) {
  let content = readFileSync(filePath, "utf8");
  const original = content;

  // Skip if already using getCorsHeaders exclusively
  if (content.includes("getCorsHeaders") && !content.match(/[^\w]corsHeaders[^\w]/)) return false;

  // Fix import: add getCorsHeaders
  content = content.replace(IMPORT_RE, (m, names) => {
    const trimmed = names.trim();
    if (trimmed.includes("getCorsHeaders")) return m;
    return `import { ${trimmed}, getCorsHeaders } from "../_shared/cors.ts";`;
  });

  // Fix all corsHeaders usages in header objects
  content = content.replace(HEADERS_RE, (m) => m.replace("corsHeaders", "getCorsHeaders(req)"));

  if (content !== original) {
    writeFileSync(filePath, content, "utf8");
    return true;
  }
  return false;
}

function walkDir(dir) {
  const results = [];
  for (const entry of readdirSync(dir, { withFileTypes: true })) {
    if (!entry.isDirectory()) {
      if (entry.name === "index.ts" || entry.name.endsWith(".test.ts")) {
        results.push(join(dir, entry.name));
      }
      continue;
    }
    // Skip _shared and node_modules
    if (entry.name === "_shared" || entry.name === "node_modules") continue;
    results.push(...walkDir(join(dir, entry.name)));
  }
  return results;
}

const functionsDir = join(ROOT, "supabase", "functions");
const files = walkDir(functionsDir);

let fixed = 0, skipped = 0;
for (const file of files) {
  if (fixFile(file)) {
    console.log(`  FIXED ${relative(ROOT, file)}`);
    fixed++;
  } else {
    skipped++;
  }
}

console.log(`\nTotal fixed: ${fixed}, skipped: ${skipped}`);
