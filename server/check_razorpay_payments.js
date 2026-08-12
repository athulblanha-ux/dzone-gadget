const Razorpay = require('razorpay');
const mongoose = require('mongoose');
const dotenv = require('dotenv');
const path = require('path');

// Load environment variables
dotenv.config({ path: path.join(__dirname, '.env') });

const keyId = process.env.RAZORPAY_KEY_ID;
const keySecret = process.env.RAZORPAY_KEY_SECRET;
const mongoUri = process.env.MONGO_URI;

if (!keyId || !keySecret) {
  console.error('❌ Razorpay credentials missing in server/.env');
  process.exit(1);
}

const razorpay = new Razorpay({ key_id: keyId, key_secret: keySecret });

const checkPayments = async () => {
  try {
    let hasDb = false;
    let Order;

    try {
      console.log('Connecting to database...');
      await mongoose.connect(mongoUri, { serverSelectionTimeoutMS: 5000 });
      console.log('✅ Connected to MongoDB');
      hasDb = true;

      const orderSchema = new mongoose.Schema({
        orderNumber: String,
        paymentId: String,
        paymentOrderId: String,
        total: Number,
        status: String,
        paymentStatus: String,
        shippingAddress: {
          fullName: String,
          email: String,
          phone: String
        },
        createdAt: Date
      }, { collection: 'orders' });

      Order = mongoose.models.Order || mongoose.model('Order', orderSchema);
    } catch (dbErr) {
      console.log('⚠️ Could not connect to MongoDB database. Running in standalone Razorpay reporting mode.\n');
    }

    console.log('Fetching payments from Razorpay (last 24 hours)...');
    
    // Last 24 hours timestamp
    const oneDayAgo = Math.floor((Date.now() - 24 * 60 * 60 * 1000) / 1000);
    
    const response = await razorpay.payments.all({
      from: oneDayAgo,
      count: 100
    });

    const payments = response.items || [];
    console.log(`Fetched ${payments.length} payment attempts from Razorpay.\n`);

    console.log('==================================================');
    console.log('RAZORPAY PAYMENT VERIFICATION REPORT (LAST 24 HOURS)');
    console.log('==================================================\n');

    let issuesCount = 0;

    for (const payment of payments) {
      const paymentId = payment.id;
      const paymentOrderId = payment.order_id;
      const amount = payment.amount / 100;
      const email = payment.email;
      const phone = payment.contact;
      const status = payment.status;
      const createdAt = new Date(payment.created_at * 1000).toLocaleString('en-IN');

      // Skip failed payment attempts to focus on actual money received
      if (status !== 'captured' && status !== 'authorized') {
        continue;
      }

      console.log(`💳 Payment ID: ${paymentId}`);
      console.log(`   - Amount: ₹${amount}`);
      console.log(`   - Customer: ${email} | ${phone}`);
      console.log(`   - Date: ${createdAt}`);
      console.log(`   - Razorpay Status: ${status.toUpperCase()}`);

      if (hasDb) {
        // Find order by payment ID or payment order ID
        const order = await Order.findOne({
          $or: [
            { paymentId: paymentId },
            { paymentOrderId: paymentOrderId }
          ]
        });

        if (order) {
          const isPaid = ['paid', 'partially_paid'].includes(order.paymentStatus);
          const isConfirmed = order.status !== 'placed';
          
          if (isPaid && isConfirmed) {
            console.log(`   - Verification: ✅ REFLECTED (Order #${order.orderNumber}, Status: ${order.status.toUpperCase()}, Payment Status: ${order.paymentStatus.toUpperCase()})`);
          } else {
            issuesCount++;
            console.log(`   - Verification: ⚠️ PENDING REFLECTION (Order #${order.orderNumber} found in DB, but Status is ${order.status.toUpperCase()} and Payment is ${order.paymentStatus.toUpperCase()})`);
          }
        } else {
          issuesCount++;
          console.log(`   - Verification: ❌ NOT FOUND IN DATABASE (Potential orphaned payment!)`);
        }
      } else {
        console.log(`   - Verification: ℹ️ DB disconnected. Check if Order with Razorpay Payment ID (${paymentId}) or Order ID (${paymentOrderId}) is marked paid.`);
      }
      console.log();
    }

    if (hasDb) {
      console.log('==================================================');
      console.log(`Analysis complete. Found ${issuesCount} unresolved payment issues.`);
      console.log('==================================================');
    }

    process.exit(0);
  } catch (err) {
    console.error('❌ Error executing verification check:', err);
    process.exit(1);
  }
};

checkPayments();
