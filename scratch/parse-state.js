const fs = require('fs');

const script13 = fs.readFileSync('scratch/script_13.js', 'utf8');
const script31 = fs.readFileSync('scratch/script_31.js', 'utf8');

function findLinks(text, name) {
  console.log(`\n--- Searching in ${name} ---`);
  // Let's find any URLs that contain "scontent"
  const urls = [];
  const regex = /https:\\\/\\\/scontent[^"'\s>]+/g;
  let match;
  while ((match = regex.exec(text)) !== null) {
    urls.push(match[0].replace(/\\\//g, '/'));
  }
  console.log('Total scontent URLs:', urls.length);
  console.log('Sample URLs:', urls.slice(0, 10));

  // Find mentions of "Dstore_kerala" or "dstore"
  const count = (text.match(/Dstore_kerala/gi) || []).length;
  console.log('Mentions of Dstore_kerala:', count);

  // Let's find any text containing display_url or thumbnail
  const keys = ['display_url', 'thumbnail_src', 'display_resources', 'video_url', 'shortcode', 'permalink'];
  keys.forEach(k => {
    const idx = text.indexOf(k);
    if (idx !== -1) {
      console.log(`Found key: "${k}" at position ${idx}`);
      console.log('Context:', text.substring(idx - 50, idx + 200));
    }
  });
}

findLinks(script13, 'Script 13');
findLinks(script31, 'Script 31');
