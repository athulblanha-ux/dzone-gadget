require('dotenv').config({ path: './server/.env' });
const mongoose = require('mongoose');

async function run() {
  console.log('Connecting to:', process.env.MONGO_URI);
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log('Connected to MongoDB.');

    const db = mongoose.connection.db;
    const faqsCollection = db.collection('faqs');

    // Update Payment FAQ
    const faq = await faqsCollection.findOne({ question: /payment methods/i });
    if (faq) {
      const newAnswer = 'We accept secure online payments via Razorpay (UPI, credit/debit cards, netbanking).';
      await faqsCollection.updateOne({ _id: faq._id }, { $set: { answer: newAnswer } });
      console.log('✅ Updated payment methods FAQ answer.');
    } else {
      console.log('⚠️ Could not find payment methods FAQ.');
    }

    console.log('🎉 DB update complete!');
    process.exit(0);
  } catch (err) {
    console.error('❌ Failed:', err);
    process.exit(1);
  }
}

run();
