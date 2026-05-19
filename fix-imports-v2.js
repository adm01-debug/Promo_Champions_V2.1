import fs from 'fs';
import path from 'path';

const hooksDir = 'src/hooks';
const hookMap = new Map();

// 1. Scan all hooks and map them to their relative path from @/hooks/
function scanHooks(dir) {
  const files = fs.readdirSync(dir);
  for (const file of files) {
    const fullPath = path.join(dir, file);
    if (fs.statSync(fullPath).isDirectory()) {
      scanHooks(fullPath);
    } else if (file.startsWith('use') && file.endsWith('.ts')) {
      const hookName = file.replace('.ts', '');
      const relativeToHooks = path.relative(hooksDir, dir);
      const hookPath = relativeToHooks ? `hooks/${relativeToHooks}/${hookName}` : `hooks/${hookName}`;
      hookMap.set(hookName, hookPath);
    }
  }
}

scanHooks(hooksDir);

// 2. Fix all imports in the project
function fixAll(dir) {
  const files = fs.readdirSync(dir);
  for (const file of files) {
    const fullPath = path.join(dir, file);
    if (fs.statSync(fullPath).isDirectory()) {
      fixAll(fullPath);
    } else if (file.endsWith('.tsx') || file.endsWith('.ts')) {
      let content = fs.readFileSync(fullPath, 'utf8');
      let changed = false;

      // Handle both @/hooks and relative ./use or ../use
      // First, replace relative imports with a temporary absolute-like placeholder
      if (fullPath.startsWith(hooksDir)) {
        content = content.replace(/from ["']\.\.?\/(use\w+)["']/g, (match, hook) => {
          if (hookMap.has(hook)) {
            changed = true;
            return `from "@/hooks/${hook}"`;
          }
          return match;
        });
      }

      // Now replace all @/hooks/use... with their correct subfolder path
      hookMap.forEach((newPath, hookName) => {
        // Regex to match @/hooks/useHook or @/hooks/subfolder/useHook
        // and replace it with @/hooks/correct_subfolder/useHook
        const regex = new RegExp(`@/hooks/([^'"]*)${hookName}(?=['"])`, 'g');
        if (regex.test(content)) {
          content = content.replace(regex, `@/${newPath}`);
          changed = true;
        }
      });

      if (changed) {
        fs.writeFileSync(fullPath, content);
      }
    }
  }
}

fixAll('src');
console.log(`Updated imports for ${hookMap.size} hooks.`);
