require('dotenv').config();
const mongoose = require('mongoose');
const Product = require('./src/models/Product');
const Category = require('./src/models/Category');

mongoose.connect(process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/dzonegadget').then(async () => {
  const products = await Product.find().select('name category isFeatured').limit(5).populate('category', 'name');
  console.log('Sample products:', JSON.stringify(products, null, 2));
  process.exit(0);
}).catch(console.error);
