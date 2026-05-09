const fs = require('fs');
const content = fs.readFileSync('src/components/dashboard/FuturisticSpeedometerDashboard.tsx', 'utf8');
const lines = content.split('\n');

let balance = 0;
const stack = [];

const tagRegex = /<([a-zA-Z0-9.]+)|<\/([a-zA-Z0-9.]+)>|(\/>)/g;

lines.forEach((line, i) => {
  let match;
  while ((match = tagRegex.exec(line)) !== null) {
    if (match[1]) { // Open tag
      if (!line.includes('/>') || line.indexOf('/>') > match.index) {
        // Only push if it doesn't self-close on the same line (rough check)
        // Better: check if the tag itself is self-closing in the regex
        const tag = match[1];
        if (!['img', 'br', 'hr', 'input'].includes(tag.toLowerCase())) {
            // Need to check if it has a closing /> later in the string
            const remaining = line.slice(match.index);
            const closeIndex = remaining.indexOf('>');
            if (remaining.slice(0, closeIndex + 1).endsWith('/>')) {
                // Self-closing
            } else {
                stack.push({ tag, line: i + 1 });
            }
        }
      }
    } else if (match[2]) { // Close tag
      const tag = match[2];
      const last = stack.pop();
      if (last && last.tag !== tag) {
        console.log(`Mismatch at line ${i + 1}: expected </${last.tag}> but found </${tag}> (opened at line ${last.line})`);
      } else if (!last) {
        console.log(`Unexpected closing tag </${tag}> at line ${i + 1}`);
      }
    }
  }
});

if (stack.length > 0) {
  console.log(`Unclosed tags:`);
  stack.forEach(s => console.log(`  <${s.tag}> opened at line ${s.line}`));
}
