const mongoose = require('mongoose');

const mongoUri = 'mongodb://127.0.0.1:27017/d-store';

const fetchOrder = async () => {
  try {
    console.log('Connecting to database...');
    await mongoose.connect(mongoUri);
    console.log('✅ Connected to MongoDB');

    const orderSchema = new mongoose.Schema({}, { strict: false, collection: 'orders' });
    const Order = mongoose.model('Order', orderSchema);

    console.log('Fetching order TV2087290007...');
    const order = await Order.findOne({ orderNumber: 'TV2087290007' });

    if (order) {
      console.log('\n==================================================');
      console.log('ORDER DETAILS FOUND IN DATABASE');
      console.log('==================================================');
      console.log(JSON.stringify(order.toObject(), null, 2));
      console.log('==================================================\n');
    } else {
      console.log('❌ Order TV2087290007 not found in database.');
    }
    process.exit(0);
  } catch (err) {
    console.error('❌ Error:', err.message);
    process.exit(1);
  }
};

fetchOrder();
