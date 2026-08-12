require('dotenv').config();
const mongoose = require('mongoose');
const Category = require('./src/models/Category');

mongoose.connect(process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/dzonegadget').then(async () => {
  const toyCategory = await Category.findOne({ name: 'Toys' });
  if (toyCategory) {
    toyCategory.isFeatured = true;
    toyCategory.icon = '🎯'; // Set an icon so it looks good on the frontend Category Grid
    await toyCategory.save();
    console.log('Fixed Toys category visibility');
  } else {
    console.log('Toys category not found');
  }
  process.exit(0);
}).catch(console.error);
