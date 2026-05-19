import fs from 'fs';
import path from 'path';

const hooksDir = 'src/hooks';
const hookMap = new Map();

function scanHooks(dir) {
  const files = fs.readdirSync(dir);
  for (const file of files) {
    const fullPath = path.join(dir, file);
    if (fs.statSync(fullPath).isDirectory()) {
      scanHooks(fullPath);
    } else if (file.startsWith('use') && file.endsWith('.ts')) {
      const hookName = file.replace('.ts', '');
      const relativeDir = path.relative(hooksDir, dir);
      if (relativeDir !== '') {
        hookMap.set(hookName, `hooks/${relativeDir}/${hookName}`);
      }
    }
  }
}

scanHooks(hooksDir);

function updateImports(dir) {
  const files = fs.readdirSync(dir);
  for (const file of files) {
    const fullPath = path.join(dir, file);
    if (fs.statSync(fullPath).isDirectory()) {
      updateImports(fullPath);
    } else if (file.endsWith('.tsx') || file.endsWith('.ts')) {
      let content = fs.readFileSync(fullPath, 'utf8');
      let changed = false;
      
      hookMap.forEach((newPath, hookName) => {
        const regex = new RegExp(`@/hooks/${hookName}(?=['"])`, 'g');
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

updateImports('src');
console.log(`Updated imports for ${hookMap.size} hooks.`);
