const mongoose = require('mongoose');

// We can read MONGO_URI from process.env
const mongoUri = process.env.MONGO_URI;

if (!mongoUri) {
  console.error('❌ MONGO_URI environment variable is missing.');
  console.error('Usage: MONGO_URI="mongodb+srv://your-username:your-password@your-cluster.mongodb.net/your-db" node confirm_order_prod.js');
  process.exit(1);
}

const confirmOrder = async () => {
  try {
    console.log('Connecting to MongoDB Atlas...');
    await mongoose.connect(mongoUri, { serverSelectionTimeoutMS: 10000 });
    console.log('✅ Connected successfully to production database!');

    const orderSchema = new mongoose.Schema({
      orderNumber: String,
      status: String,
      paymentStatus: String,
      paymentId: String,
      paymentOrderId: String,
      statusHistory: Array
    }, { collection: 'orders' });

    const Order = mongoose.models.Order || mongoose.model('Order', orderSchema);

    const targetOrder = 'TV2087290007';
    console.log(`Searching for order ${targetOrder}...`);
    const order = await Order.findOne({ orderNumber: targetOrder });

    if (!order) {
      console.error(`❌ Order ${targetOrder} was not found in this database.`);
      console.log('Check if you are connected to the correct database (d-store / toyverse).');
      process.exit(1);
    }

    console.log(`Order found! Current Status: "${order.status}", Payment Status: "${order.paymentStatus}"`);
    
    order.status = 'confirmed';
    order.paymentStatus = 'partially_paid';
    order.paymentId = 'pay_TLFNa8DXAPsVQI';
    order.paymentOrderId = 'order_TLFNTRhbNad5r5';
    
    if (!order.statusHistory) {
      order.statusHistory = [];
    }
    
    order.statusHistory.push({
      status: 'confirmed',
      message: 'Partial COD advance of ₹335 received via Razorpay (Manually confirmed via utility script).',
      createdAt: new Date()
    });

    await order.save();
    console.log(`\n✅ Order ${targetOrder} successfully updated to CONFIRMED and PARTIALLY_PAID!`);
    console.log('Please refresh your admin dashboard. The order will now be displayed in the list.');
    process.exit(0);
  } catch (err) {
    console.error('❌ Error executing update:', err.message);
    process.exit(1);
  }
};

confirmOrder();
