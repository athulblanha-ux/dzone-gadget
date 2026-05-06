const fs = require('fs');
const path = require('path');

const dirs = ['client/src', 'client/public', 'admin/src', 'admin/public', 'server/src', 'server/utils', 'server/config', 'server/middleware'];
const rootFiles = ['package.json', 'server/.env', 'client/index.html', 'admin/index.html', 'client/package.json', 'admin/package.json', 'server/package.json'];

function replaceInFile(filePath) {
  if (!fs.existsSync(filePath)) return;
  const content = fs.readFileSync(filePath, 'utf8');
  let newContent = content
    .replace(/ToyVerse/g, 'D-STORE')
    .replace(/toyverse/g, 'd-store')
    .replace(/TOYVERSE/g, 'D_STORE');
    
  if (content !== newContent) {
    fs.writeFileSync(filePath, newContent, 'utf8');
    console.log(`Updated: ${filePath}`);
  }
}

function walkDir(dir) {
  if (!fs.existsSync(dir)) return;
  const files = fs.readdirSync(dir);
  for (const file of files) {
    const fullPath = path.join(dir, file);
    if (fs.statSync(fullPath).isDirectory()) {
      walkDir(fullPath);
    } else {
      // Only process text files
      if (/\.(js|jsx|ts|tsx|json|html|css|md|env)$/i.test(fullPath)) {
        replaceInFile(fullPath);
      }
    }
  }
}

for (const dir of dirs) walkDir(path.join(__dirname, dir));
for (const file of rootFiles) replaceInFile(path.join(__dirname, file));

console.log("Done replacing.");
