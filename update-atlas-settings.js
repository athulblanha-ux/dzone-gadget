const { MongoClient } = require('mongodb');

const MONGO_URI = 'mongodb+srv://athulblanha_db_user:qsILgZQ4UButXi7s@cluster0.fy2syya.mongodb.net/dzone-gadget?retryWrites=true&w=majority';

async function updateAtlasSettings() {
  console.log('Connecting via MongoClient to MongoDB Atlas...');
  const client = new MongoClient(MONGO_URI);
  await client.connect();
  console.log('Connected to MongoDB Atlas!');

  const db = client.db('dzone-gadget');
  const collection = db.collection('settings');

  // Update return policy string to use new phone number
  const returnPolicyDoc = await collection.findOne({ key: 'return_policy' });
  if (returnPolicyDoc && returnPolicyDoc.value) {
    const updatedPolicy = returnPolicyDoc.value.replace(/94953 02826/g, '94959 61840');
    await collection.updateOne({ key: 'return_policy' }, { $set: { value: updatedPolicy } });
    console.log('Updated return_policy text!');
  }

  console.log('Atlas database settings updated successfully!');
  await client.close();
  process.exit(0);
}

updateAtlasSettings().catch(err => {
  console.error('Failed to update Atlas:', err);
  process.exit(1);
});
