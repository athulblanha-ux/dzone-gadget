require('dotenv').config();
const mongoose = require('mongoose');
const Category = require('./src/models/Category');

mongoose.connect(process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/dzonegadget').then(async () => {
  const categories = await Category.find({ name: /toy/i });
  console.log('Toy categories:', JSON.stringify(categories, null, 2));
  process.exit(0);
}).catch(console.error);
