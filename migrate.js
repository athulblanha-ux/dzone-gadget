require('dotenv').config({ path: './server/.env' });
const mongoose = require('mongoose');

async function migrate() {
  console.log('🚀 Starting migration...');
  try {
    await mongoose.connect(process.env.MONGO_URI, { serverSelectionTimeoutMS: 5000 });
    console.log('✅ Connected to MongoDB');

    const Setting = require('./server/src/models/Setting');

    const updates = [
      { key: 'contact_phone', value: '+91 94953 02826' },
      { key: 'whatsapp_number', value: '919495302826' },
      { key: 'instagram_handle', value: 'dstore.in' },
      { key: 'instagram_url', value: 'https://www.instagram.com/dstore.in/' }
    ];

    for (const update of updates) {
      const res = await Setting.findOneAndUpdate({ key: update.key }, { value: update.value }, { new: true, upsert: true });
      if (res) {
        console.log(`✨ Updated ${update.key} to ${update.value}`);
      } else {
        console.log(`⚠️ Failed to update ${update.key}`);
      }
    }

    console.log('🎉 Migration completed successfully!');
    process.exit(0);
  } catch (err) {
    console.error('❌ Migration failed:', err);
    process.exit(1);
  }
}

migrate();
