require('dotenv').config();
const mongoose = require('mongoose');
const Product = require('./src/models/Product');

mongoose.connect(process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/dstore').then(async () => {
  const products = await Product.find().select('name stock isActive isFeatured').limit(5);
  console.log('Sample products:', JSON.stringify(products, null, 2));
  process.exit(0);
}).catch(console.error);
