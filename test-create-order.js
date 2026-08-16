const { MongoClient } = require('mongodb');

const MONGO_URI = 'mongodb+srv://athulblanha_db_user:qsILgZQ4UButXi7s@cluster0.fy2syya.mongodb.net/dzone-gadget?retryWrites=true&w=majority';

async function testAtlas() {
  console.log('Connecting via MongoClient...');
  const client = new MongoClient(MONGO_URI);
  await client.connect();
  console.log('Connected!');
  const db = client.db('dzone-gadget');
  const products = await db.collection('products').find({ isActive: true }).toArray();
  console.log('Products count:', products.length);
  if (products.length > 0) {
    console.log('Sample product:', products[0].name, products[0]._id);
  }
  await client.close();
}

testAtlas().catch(console.error);
