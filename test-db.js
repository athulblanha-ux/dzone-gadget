require('dotenv').config({ path: './server/.env' });
const mongoose = require('mongoose');

async function test() {
  console.log('Connecting to:', process.env.MONGO_URI);
  try {
    await mongoose.connect(process.env.MONGO_URI, { serverSelectionTimeoutMS: 5000 });
    console.log('Connected!');
    const collections = await mongoose.connection.db.listCollections().toArray();
    console.log('Collections:', collections.map(c => c.name));
    process.exit(0);
  } catch (err) {
    console.error('Failed:', err);
    process.exit(1);
  }
}

test();
