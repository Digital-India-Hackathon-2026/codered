const fs = require('fs');
const path = require('path');

const PREFIX = '';
const BOM = '\uFEFF';

function walk(dir) {
  let results = [];
  const list = fs.readdirSync(dir);
  for (const file of list) {
    if (file === 'node_modules' || file === '.git' || file === 'android' || file === 'ios') continue;
    const full = path.join(dir, file);
    const stat = fs.statSync(full);
    if (stat.isDirectory()) {
      results = results.concat(walk(full));
    } else if (/\.(ts|tsx|js|json)$/.test(file)) {
      results.push(full);
    }
  }
  return results;
}

const files = walk('c:\\Users\\varun\\Downloads\\LifeLens');
let fixed = 0;
for (const f of files) {
  let content = fs.readFileSync(f, 'utf8');
  if (content.includes(PREFIX)) {
    content = content.replace(BOM, '').replace(PREFIX, '');
    fs.writeFileSync(f, content, 'utf8');
    console.log('Fixed:', f);
    fixed++;
  }
}
console.log(`Done! Fixed ${fixed} files.`);
