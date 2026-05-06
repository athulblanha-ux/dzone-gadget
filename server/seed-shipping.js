require('dotenv').config();
const mongoose = require('mongoose');
const ShippingRule = require('./src/models/ShippingRule');

mongoose.connect(process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/dstore').then(async () => {
  await ShippingRule.deleteMany({});
  await ShippingRule.create({ state: 'Default', baseFee: 49, freeShippingThreshold: 499 });
  console.log('Seeded default shipping rule');
  process.exit(0);
}).catch(console.error);
