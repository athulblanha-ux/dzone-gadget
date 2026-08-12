require('dotenv').config({ path: 'server/.env' });
const mongoose = require('./server/node_modules/mongoose');
const Product = require('./server/src/models/Product');

mongoose.connect(process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/dzonegadget').then(async () => {
  const count = await Product.countDocuments();
  const products = await Product.find().select('name isActive').limit(5);
  console.log('Total products:', count);
  console.log('Sample products:', products);
  process.exit(0);
}).catch(console.error);
