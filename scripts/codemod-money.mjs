#!/usr/bin/env node
/**
 * Codemod MONEY — centraliza formatação monetária em @/lib/money.
 *
 * Fase 1 (por arquivo): remove defs locais `const formatBRL|formatCurrency|
 * formatMoney|fmtBRL|fmtCurrency = ...` e reescreve chamadas para o helper
 * canônico, preservando casas decimais/compact do helper removido. Defs
 * `export` viram delegação fina (mantém API).
 *
 * Fase 2 (scanner balanceado):
 *   R$ {expr.toLocaleString('pt-BR'[, {opts}])}                -> {formatBRL(expr[, {decimals}])}
 *   R$ ${expr.toLocaleString('pt-BR'[, {opts}])}               -> ${formatBRL(expr...)}
 *   expr.toLocaleString('pt-BR', {...currency:'BRL'...})       -> formatBRL(expr...)
 *   new Intl.NumberFormat('pt-BR', {...BRL...}).format(expr)   -> formatBRL/Compact(expr)
 *
 * formatBRL default = 0 casas (convenção do produto).
 * --dry para relatório sem escrever.
 */
import { readFileSync, writeFileSync, readdirSync, statSync } from 'node:fs';
import { join } from 'node:path';

const SRC = join(process.cwd(), 'src');
const DRY = process.argv.includes('--dry');

function* walk(dir) {
  for (const e of readdirSync(dir)) {
    const f = join(dir, e);
    const s = statSync(f);
    if (s.isDirectory()) yield* walk(f);
    else if (/\.(ts|tsx)$/.test(e)) yield f;
  }
}

const decimalsFrom = opts => {
  if (!opts) return null;
  const max = /maximumFractionDigits\s*:\s*(\d+)/.exec(opts)?.[1];
  const min = /minimumFractionDigits\s*:\s*(\d+)/.exec(opts)?.[1];
  return max !== undefined ? Number(max) : min !== undefined ? Number(min) : null;
};
const isCompact = opts => /notation\s*:\s*['"]compact['"]/.test(opts || '');
const brlCall = (expr, decimals) =>
  decimals === 0 || decimals === null
    ? `formatBRL(${expr})`
    : `formatBRL(${expr}, { decimals: ${decimals} })`;
const mkCall = (expr, opts, defDec) =>
  isCompact(opts) ? `formatBRLCompact(${expr})` : brlCall(expr, decimalsFrom(opts) ?? defDec);

// posição do ')' que fecha o '(' em openIdx (balanceado, ignora strings)
function callEnd(src, openIdx) {
  let depth = 0;
  for (let i = openIdx; i < src.length; i++) {
    const c = src[i];
    if (c === '(' || c === '[' || c === '{') depth++;
    else if (c === ')' || c === ']' || c === '}') {
      depth--;
      if (depth === 0) return i;
    } else if (c === "'" || c === '"' || c === '`') {
      const q = c;
      i++;
      while (i < src.length && src[i] !== q) i += src[i] === '\\' ? 2 : 1;
    }
  }
  return -1;
}

// retrocede sobre um grupo balanceado ')' ou ']' terminando em i-1
function skipBalancedBackward(src, i) {
  let depth = 0;
  for (let k = i - 1; k >= 0; k--) {
    if (src[k] === ')' || src[k] === ']') depth++;
    else if (src[k] === '(' || src[k] === '[') {
      depth--;
      if (depth === 0) return k;
    } else if (src[k] === "'" || src[k] === '"' || src[k] === '`') {
      k--;
      while (k >= 0 && src[k] !== src[i - 1]) k--;
    }
  }
  return -1;
}

// início da expressão que antecede o '.' em dotIdx (member/call chain + unary)
function exprStart(src, dotIdx) {
  let i = dotIdx;
  while (i > 0 && /[ \t\n]/.test(src[i - 1])) i--;
  while (i > 0) {
    const c = src[i - 1];
    if (c === ')' || c === ']') {
      const k = skipBalancedBackward(src, i);
      i = k < 0 ? i - 1 : k;
      continue;
    }
    if (/[\w$.]/.test(c)) {
      i--;
      continue;
    }
    break;
  }
  // prefixos unários/keywords
  const before = src.slice(Math.max(0, i - 8), i);
  const kw = /(typeof|await|new)\s+$/.exec(before);
  if (kw) i -= kw[0].length;
  while (i > 0 && (src[i - 1] === '!' || src[i - 1] === '~')) i--;
  return i;
}

// aplica substituições com spans (start,end,replacement) — executa de trás pra frente
function applySpans(src, spans) {
  spans.sort((a, b) => b.start - a.start);
  let out = src;
  for (const s of spans) out = out.slice(0, s.start) + s.repl + out.slice(s.end);
  return out;
}

const TOL_RE = /\.toLocaleString\(\s*['"]pt-BR['"]\s*(?:,\s*(\{[\s\S]*?\}))?\s*\)/g;
const INTL_RE =
  /new\s+Intl\.NumberFormat\(\s*['"]pt-BR['"]\s*,\s*\{([^{}]*['"]BRL['"][^{}]*)\}\s*\)\s*\.format\s*\(/g;
const RPREFIX_RE = /R\$\s*(\$\{|\{)\s*/g;

const KW = /^(return|const|let|var|if|else|for|while|do|case|throw|switch|new|typeof|await|yield|break|continue|default|import|export|function|class|extends|in|of|void|delete)\s+$/;

function phase2(src, file, pending) {
  const spans = [];
  const uses = new Set();
  const mark = (repl, span) => {
    uses.add(repl.includes('formatBRLCompact') ? 'formatBRLCompact' : 'formatBRL');
    spans.push(span);
  };

  // 4) new Intl.NumberFormat(...BRL...).format(expr)
  for (const m of src.matchAll(INTL_RE)) {
    const openIdx = m.index + m[0].length - 1;
    const end = callEnd(src, openIdx);
    if (end === -1) continue;
    const expr = src.slice(openIdx + 1, end).trim();
    mark(mkCall(expr, m[1], 2), { start: m.index, end: end + 1, repl: mkCall(expr, m[1], 2) });
  }

  // helper: acha `.toLocaleString('pt-BR'...)` — `\??` cobre optional chaining `a?.toLocaleString`
  const innerTL = /^([\s\S]*?)\??\.toLocaleString\(\s*['"]pt-BR['"]\s*(?:,\s*(\{[\s\S]*\}))?\s*\)$/;

  // 1/2) R$ { ... } ou R$ ${ ... }
  for (const m of src.matchAll(RPREFIX_RE)) {
    const braceIdx = m.index + m[0].lastIndexOf('{');
    const end = callEnd(src, braceIdx);
    if (end === -1) continue;
    const inner = src.slice(braceIdx + 1, end).trim();
    const t = innerTL.exec(inner);
    if (!t) continue; // não é formatação de moeda
    if (spans.some(s => m.index >= s.start && end + 1 <= s.end)) continue;
    const expr = t[1].trim();
    const wrapped = m[1] === '${' ? `\${${mkCall(expr, t[2], 0)}}` : `{${mkCall(expr, t[2], 0)}}`;
    mark(wrapped, { start: m.index, end: end + 1, repl: wrapped });
  }

  // 3) expr.toLocaleString('pt-BR', {currency...}) — sem prefixo R$
  for (const m of src.matchAll(TOL_RE)) {
    if (!m[1] || !/['"]currency['"]/.test(m[1])) continue; // só moeda explícita
    const start = exprStart(src, m.index); // m.index é o '.'
    const expr = src.slice(start, m.index).trim();
    if (!expr) continue;
    if (/^(?:return|case|throw|const|let|var|new)\b/.test(expr)) continue;
    if (spans.some(s => start >= s.start && m.index + m[0].length <= s.end)) continue;
    mark(mkCall(expr, m[1], 2), {
      start,
      end: m.index + m[0].length,
      repl: mkCall(expr, m[1], 2),
    });
  }

  let out = applySpans(src, spans);

  // limpa duplo prefixo: "R$ {formatBRL(" -> "{formatBRL("
  out = out.replace(/R\$\s*\{(\s*formatBRL(?:Compact)?\()/g, '{$1');
  out = out.replace(/R\$\s*\$\{(\s*formatBRL(?:Compact)?\()/g, '${$1');

  return { out, n: spans.length, uses };
}

// ---------------- fase 1 ----------------
// fim da def (após arrow): bloco balanceado ou expressão até ';'
function defEndAt(src, afterArrow, arrowWs) {
  let defEnd;
  if (src[afterArrow + arrowWs] === '{') {
    let depth = 0,
      i = afterArrow + arrowWs;
    for (; i < src.length; i++) {
      if (src[i] === '{') depth++;
      else if (src[i] === '}') {
        depth--;
        if (depth === 0) break;
      }
    }
    defEnd = i + 1;
  } else {
    defEnd = afterArrow;
    while (defEnd < src.length && src[defEnd] !== ';') defEnd++;
  }
  while (defEnd < src.length && src[defEnd] === ';') defEnd++;
  while (defEnd < src.length && src[defEnd] === '\n') defEnd++;
  return defEnd;
}

function stripLocalDef(src, pending, file) {
  const defRe =
    /^[ \t]*(?:export\s+)?const\s+(formatBRL|formatCurrency|formatMoney|fmtBRL|fmtCurrency)\s*=\s*(?:\([^)]*\)|[A-Za-z_$][\w$]*)\s*(?::\s*[^=\n]*)?=>/m;
  const m = defRe.exec(src);
  if (!m || src.includes("from '@/lib/money'")) return { src, defs: [] };
  const name = m[1];
  const isExported = /\bexport\b/.test(src.slice(m.index, m.index + 30));
  const defStart = m.index;
  const afterArrow = m.index + m[0].length;
  const arrowWs = /^[ \t]*/.exec(src.slice(afterArrow))[0].length;
  const defEnd = defEndAt(src, afterArrow, arrowWs);
  const defText = src.slice(defStart, defEnd);

  if (/toFixed|\/\s*1000|\$\{[^}]*\}\s*k/i.test(defText)) {
    pending.push(`${file}: def custom de ${name} (formato k/arredondamento) — revisar`);
    return { src, defs: [] };
  }
  const compact = isCompact(defText);
  const dec = compact ? 'compact' : (decimalsFrom(defText) ?? (/['"]currency['"]/.test(defText) ? 2 : 0));
  const params = /\(([^)]*)\)/.exec(m[0])?.[1] ?? '';
  const argName = /^\s*([A-Za-z_$][\w$]*)\s*(?::[^=]*)?$/.exec(params)?.[1];
  if (!argName) {
    pending.push(`${file}: def de ${name} com params não triviais — revisar`);
    return { src, defs: [] };
  }

  if (isExported) {
    // preserva API: delega ao canônico via alias (evita autorrecursão em `formatBRL`)
    const base = compact ? 'formatBRLCompact' : 'formatBRL';
    const alias = `__${base}`;
    const repl =
      m[0] +
      ' ' +
      (dec === 0 || compact ? `${alias}(${argName})` : `${alias}(${argName}, { decimals: ${dec} })`) +
      ';\n';
    return {
      src: src.slice(0, defStart) + repl + src.slice(defEnd),
      defs: [],
      keptUses: [`${base} as ${alias}`],
    };
  }
  src = src.slice(0, defStart) + src.slice(defEnd);
  return { src, defs: [{ name, compact, dec }] };
}

const pending = [];
const changed = [];

for (const file of walk(SRC)) {
  const original = readFileSync(file, 'utf-8');
  let out = original;
  let n = 0;
  const uses = new Set();

  const { src: afterDefs, defs, keptUses } = stripLocalDef(out, pending, file);
  out = afterDefs;
  (keptUses || []).forEach(u => uses.add(u));
  for (const d of defs) {
    let rebuilt = '';
    let i = 0;
    const callRe = new RegExp(`\\b${d.name}\\s*\\(`, 'g');
    let m;
    while ((m = callRe.exec(out)) !== null) {
      const openIdx = m.index + m[0].length - 1;
      const end = callEnd(out, openIdx);
      if (end === -1) {
        pending.push(`${file}: chamada não fechada de ${d.name}`);
        break;
      }
      const arg = out.slice(openIdx + 1, end).trim();
      n++;
      rebuilt += out.slice(i, m.index);
      rebuilt += d.compact
        ? `formatBRLCompact(${arg})`
        : d.dec === 0
          ? `formatBRL(${arg})`
          : `formatBRL(${arg}, { decimals: ${d.dec} })`;
      uses.add(d.compact ? 'formatBRLCompact' : 'formatBRL');
      i = end + 1;
      callRe.lastIndex = end + 1;
    }
    out = rebuilt + out.slice(i);
  }

  const p2 = phase2(out, file, pending);
  out = p2.out;
  n += p2.n;
  p2.uses.forEach(u => uses.add(u));

  if (out === original) continue;

  const names = [...uses].sort();
  const hasMoneyImport = /from\s+['"]@\/lib\/money['"]/.test(out);
  const otherFormatImport = /import[^;]*\bformatBRL\b[^;]*from\s+['"](?!@\/lib\/money)/.test(out);
  if (hasMoneyImport) {
    out = out.replace(/import\s*\{([^}]*)\}\s*from\s*['"]@\/lib\/money['"];?/, (mm, cur) => {
      const set = new Set(cur.split(',').map(s => s.trim()).filter(Boolean));
      names.forEach(x => set.add(x));
      return `import { ${[...set].join(', ')} } from '@/lib/money';`;
    });
  } else if (otherFormatImport) {
    pending.push(`${file}: importa formatBRL de outro módulo — revisar`);
  } else if (names.length) {
    const lastImport = [...out.matchAll(/^import[\s\S]*?from\s+['"][^'"]+['"];?\s*$/gm)].pop();
    if (lastImport) {
      const at = lastImport.index + lastImport[0].length;
      out = out.slice(0, at) + `\nimport { ${names.join(', ')} } from '@/lib/money';` + out.slice(at);
    } else {
      out = `import { ${names.join(', ')} } from '@/lib/money';\n` + out;
    }
  }

  changed.push({ file, n });
  if (!DRY) writeFileSync(file, out);
}

console.log(`${changed.length} arquivos, ${changed.reduce((a, c) => a + c.n, 0)} substituições${DRY ? ' (dry-run)' : ''}`);
if (pending.length) {
  console.log('\nPENDENTES:');
  [...new Set(pending)].forEach(p => console.log('  • ' + p));
}
