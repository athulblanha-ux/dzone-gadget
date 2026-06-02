require('dotenv').config({ path: './server/.env' });
const mongoose = require('mongoose');

async function run() {
  console.log('Connecting to:', process.env.MONGO_URI);
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log('Connected to MongoDB.');

    const db = mongoose.connection.db;
    const settingsCollection = db.collection('settings');
    const faqsCollection = db.collection('faqs');

    // 1. Update Return Policy Setting
    const setting = await settingsCollection.findOne({ key: 'return_policy' });
    if (setting) {
      let val = setting.value;
      val = val.replace(/within 7 days of receiving/gi, 'promptly after receiving');
      val = val.replace(/within 7 days of delivery/gi, 'within the return eligibility window');
      val = val.replace(/delivered within 7 days/gi, 'delivered as soon as possible');
      
      await settingsCollection.updateOne({ _id: setting._id }, { $set: { value: val } });
      console.log('✅ Updated return_policy setting text.');
    } else {
      console.log('⚠️ Could not find return_policy setting.');
    }

    // 2. Update FAQ
    const faq = await faqsCollection.findOne({ question: /return policy/i });
    if (faq) {
      const newAnswer = 'Please refer to our Return Policy page for details on returns and eligibility.';
      await faqsCollection.updateOne({ _id: faq._id }, { $set: { answer: newAnswer } });
      console.log('✅ Updated return policy FAQ answer.');
    } else {
      console.log('⚠️ Could not find return policy FAQ.');
    }

    console.log('🎉 DB update complete!');
    process.exit(0);
  } catch (err) {
    console.error('❌ Failed:', err);
    process.exit(1);
  }
}

run();
