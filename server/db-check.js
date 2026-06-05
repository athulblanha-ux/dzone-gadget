const mongoose = require('mongoose');

async function check() {
  const uri = 'mongodb://127.0.0.1:27017/toyverse';
  console.log('Connecting to:', uri);
  try {
    await mongoose.connect(uri, { serverSelectionTimeoutMS: 5000 });
    console.log('Connected successfully!');
    
    const collections = await mongoose.connection.db.listCollections().toArray();
    console.log('Collections:', collections.map(c => c.name));
    
    // Check products
    const Product = mongoose.model('Product', new mongoose.Schema({}, { strict: false }));
    const count = await Product.countDocuments();
    console.log('Total products:', count);
    
    const sample = await Product.findOne();
    console.log('Sample product:', sample);
    
    process.exit(0);
  } catch (err) {
    console.error('Connection failed:', err);
    process.exit(1);
  }
}

check();
