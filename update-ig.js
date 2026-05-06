const fs = require('fs');
const path = require('path');
const mongoose = require('mongoose');
require('dotenv').config({ path: path.join(__dirname, 'server/.env') });

const oldUrl = 'https://instagram.com/d-store.store';
const newUrl = 'https://www.instagram.com/dstore.in/';

const files = [
  'client/src/pages/Home.jsx',
  'client/src/components/layout/Footer.jsx',
  'server/src/seed.js'
];

// Update files
files.forEach(file => {
  const fullPath = path.join(__dirname, file);
  if (fs.existsSync(fullPath)) {
    let content = fs.readFileSync(fullPath, 'utf8');
    const newContent = content.replace(new RegExp(oldUrl.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'g'), newUrl);
    if (content !== newContent) {
      fs.writeFileSync(fullPath, newContent, 'utf8');
      console.log(`Updated ${file}`);
    }
  }
});

// Update database
async function updateDB() {
  try {
    await mongoose.connect(process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/toyverse');
    const Setting = require('./server/src/models/Setting');
    
    await Setting.findOneAndUpdate(
      { key: 'instagram_url' },
      { value: newUrl }
    );
    await Setting.findOneAndUpdate(
      { key: 'instagram_handle' },
      { value: 'dstore.in' }
    );
    console.log('Database updated successfully');
  } catch (error) {
    console.error('Error updating DB:', error.message);
  } finally {
    process.exit(0);
  }
}

updateDB();
