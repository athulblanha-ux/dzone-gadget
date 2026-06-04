const fs = require('fs');
const path = require('path');

const contentPath = '/Users/zeus/.gemini/antigravity/brain/76705e5b-9122-4671-95c4-afb44ffcbbeb/.system_generated/steps/1253/content.md';
const text = fs.readFileSync(contentPath, 'utf8');

// Find all script tags
const scriptRegex = /<script\b[^>]*>([\s\S]*?)<\/script>/gi;
let match;
let count = 0;
while ((match = scriptRegex.exec(text)) !== null) {
  const content = match[1].trim();
  if (content.length > 50) {
    count++;
    console.log(`Script ${count} length:`, content.length);
    console.log(`Script ${count} preview:`, content.substring(0, 100));
    
    // Check if it looks like JSON
    if (content.startsWith('{') || content.includes('_sharedData') || content.includes('__additionalData') || content.includes('entry_data')) {
      console.log('  -> Found possible state data!');
      // Write to a file to examine
      fs.writeFileSync(`scratch/script_${count}.js`, content);
    }
  }
}
