require('dotenv').config({ path: './server/.env' });
const { MongoClient } = require('mongodb');

async function migrate() {
  console.log('🚀 Starting raw migration...');
  const client = new MongoClient(process.env.MONGO_URI);
  try {
    await client.connect();
    console.log('✅ Connected to MongoDB');
    const db = client.db();
    const collection = db.collection('settings');

    const updates = [
      { key: 'contact_phone', value: '+91 94953 02826' },
      { key: 'whatsapp_number', value: '919495302826' },
      { key: 'instagram_handle', value: 'dzonegadget.in' },
      { key: 'instagram_url', value: 'https://www.instagram.com/dzonegadget.in/' }
    ];

    for (const update of updates) {
      const res = await collection.findOneAndUpdate(
        { key: update.key },
        { $set: { value: update.value } },
        { upsert: true }
      );
      console.log(`✨ Updated ${update.key} to ${update.value}`);
    }

    console.log('🎉 Migration completed successfully!');
    process.exit(0);
  } catch (err) {
    console.error('❌ Migration failed:', err);
    process.exit(1);
  } finally {
    await client.close();
  }
}

migrate();
