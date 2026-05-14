
import { readFileSync, writeFileSync, readdirSync, statSync } from 'fs';
import { join, relative, dirname } from 'path';

const functionsDir = 'supabase/functions';
const sharedCorsPath = '_shared/cors.ts';

function walk(dir: string): string[] {
  let results: string[] = [];
  const list = readdirSync(dir);
  list.forEach((file) => {
    const filePath = join(dir, file);
    const stat = statSync(filePath);
    if (stat && stat.isDirectory()) {
      results = results.concat(walk(filePath));
    } else if (filePath.endsWith('.ts')) {
      results.push(filePath);
    }
  });
  return results;
}

const allFiles = walk(functionsDir);

allFiles.forEach((filePath) => {
  const relPath = relative(functionsDir, filePath);
  if (relPath === sharedCorsPath || relPath === '_shared/cors_lint_test.ts') return;

  let content = readFileSync(filePath, 'utf-8');
  
  // Regex to match the corsHeaders declaration block
  // It usually looks like: export const corsHeaders = { ... };
  // or const corsHeaders = { ... };
  const declarationRegex = /(?:export\s+)?(?:const|let|var)\s+corsHeaders\s*:\s*Record<string,\s*string>\s*=\s*\{[\s\S]*?\};/g;
  const simpleRegex = /(?:export\s+)?(?:const|let|var)\s+corsHeaders\s*=\s*\{[\s\S]*?\};/g;

  let modified = false;
  if (declarationRegex.test(content)) {
    content = content.replace(declarationRegex, '');
    modified = true;
  } else if (simpleRegex.test(content)) {
    content = content.replace(simpleRegex, '');
    modified = true;
  }

  if (modified) {
    // Add import if not present
    if (!content.includes('import { corsHeaders }')) {
      const depth = relPath.split('/').length - 1;
      const importPath = '../'.repeat(depth) + '_shared/cors.ts';
      content = `import { corsHeaders } from "${importPath}";\n` + content;
    }
    writeFileSync(filePath, content);
    console.log(`Updated ${filePath}`);
  }
});
