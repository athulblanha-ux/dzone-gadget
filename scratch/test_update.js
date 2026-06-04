require('dotenv').config({ path: 'server/.env' });
const mongoose = require('mongoose');
const Product = require('../server/src/models/Product');

async function run() {
  await mongoose.connect(process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/dstore');
  
  // Find a product
  const product = await Product.findOne();
  if (!product) {
    console.log('No products found to test update');
    process.exit(0);
  }
  
  console.log('Original images:', product.images);
  
  // Simulate data update
  const data = {
    images: [
      { url: 'https://example.com/test1.jpg', publicId: 'test1' }
    ]
  };
  
  const updated = await Product.findByIdAndUpdate(product._id, data, {
    new: true,
    runValidators: true
  });
  
  console.log('Updated images in DB:', updated.images);
  
  // Revert back
  await Product.findByIdAndUpdate(product._id, { images: product.images });
  
  process.exit(0);
}

run().catch(console.error);
