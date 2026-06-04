const fs = require('fs');
const path = require('path');

const content = fs.readFileSync('scratch/embed.html', 'utf8');
console.log('Length:', content.length);
console.log('Start:', content.substring(0, 1000));
console.log('End:', content.substring(content.length - 1000));
