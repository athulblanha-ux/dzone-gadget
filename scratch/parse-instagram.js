const fs = require('fs');
const path = require('path');

const contentPath = '/Users/zeus/Desktop/DSTORE/scratch/embed.html';
const text = fs.readFileSync(contentPath, 'utf8');

// Search for shortcode or display urls or images
const urls = [];
const regex = /https:\/\/scontent[^"'\s>]+/g;
let match;
while ((match = regex.exec(text)) !== null) {
  urls.push(match[0]);
}

console.log('Found scontent URLs:', urls.length);
console.log('Sample:', urls.slice(0, 20));

// Let's also look for shortcodes: "shortcode":"..." or shortcode: "..."
const shortcodes = [];
const scRegex = /"shortcode":"([^"]+)"/g;
while ((match = scRegex.exec(text)) !== null) {
  shortcodes.push(match[1]);
}
console.log('Found shortcodes:', shortcodes.length);
console.log('Sample shortcodes:', shortcodes.slice(0, 10));

// Let's look for "display_url":"..."
const displayUrls = [];
const duRegex = /"display_url":"([^"]+)"/g;
while ((match = duRegex.exec(text)) !== null) {
  displayUrls.push(match[1].replace(/\\u0026/g, '&'));
}
console.log('Found display_urls:', displayUrls.length);
console.log('Sample display_urls:', displayUrls.slice(0, 10));
