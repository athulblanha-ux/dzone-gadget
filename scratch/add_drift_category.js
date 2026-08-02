require('dotenv').config({ path: './server/.env' });
const mongoose = require('mongoose');
const Category = require('./server/src/models/Category');

async function run() {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log('✅ Connected to MongoDB');

    const name = 'Drift RC';
    const slug = 'drift-rc';

    let exists = await Category.findOne({ slug });
    if (exists) {
      console.log('ℹ️ Category "Drift RC" already exists, updating it...');
      exists.isFeatured = true;
      exists.isActive = true;
      exists.icon = '🏎️';
      await exists.save();
      console.log('✅ Category "Drift RC" updated!');
    } else {
      console.log('🆕 Creating new category "Drift RC"...');
      const maxOrderCat = await Category.findOne().sort({ order: -1 });
      const nextOrder = maxOrderCat ? maxOrderCat.order + 1 : 1;

      const newCat = await Category.create({
        name,
        slug,
        icon: '🏎️',
        isFeatured: true,
        isActive: true,
        order: nextOrder,
        description: 'Premium remote control drift cars and parts.'
      });
      console.log('✅ Created category:', newCat);
    }

    const allCats = await Category.find({}).sort({ order: 1 });
    console.log('\n--- All Categories ---');
    allCats.forEach(c => {
      console.log(`- ${c.name} (${c.slug}) | Featured: ${c.isFeatured} | Icon: ${c.icon} | Order: ${c.order}`);
    });

    process.exit(0);
  } catch (err) {
    console.error('❌ Error:', err);
    process.exit(1);
  }
}

run();
