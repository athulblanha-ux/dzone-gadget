require('dotenv').config({ path: './server/.env' });
const mongoose = require('mongoose');

const updatePhone = async () => {
  await mongoose.connect(process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/toyverse');
  const Setting = require('./server/src/models/Setting');
  
  await Setting.findOneAndUpdate({ key: 'contact_phone' }, { value: '+91 94953 02826' });
  await Setting.findOneAndUpdate({ key: 'whatsapp_number' }, { value: '919495302826' });
  
  console.log('Phone numbers updated in DB!');
  process.exit(0);
};

updatePhone().catch(console.error);
