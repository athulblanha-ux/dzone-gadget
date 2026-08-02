const mongoose = require('mongoose');

/**
 * Connect to MongoDB with retry logic
 */
const connectDB = async () => {
  try {
    const conn = await mongoose.connect(process.env.MONGO_URI, {
      serverSelectionTimeoutMS: 5000,
    });

    console.log(`✅ MongoDB Connected: ${conn.connection.host}`);

    // Seed default categories if they don't exist
    try {
      const Category = require('../models/Category');
      const defaultCategories = [
        { name: 'Hobbygrade', slug: 'hobbygrade', icon: '⚙️', order: 9, isFeatured: true },
        { name: 'Diecast', slug: 'diecast', icon: '🚗', order: 10, isFeatured: true },
        { name: 'Drift RC', slug: 'drift-rc', icon: '🏎️', order: 11, isFeatured: true }
      ];

      for (const cat of defaultCategories) {
        const exists = await Category.findOne({ slug: cat.slug || cat.name.toLowerCase() });
        if (!exists) {
          await Category.create(cat);
          console.log(`🌱 Seeded missing category: ${cat.name}`);
        }
      }
    } catch (seedErr) {
      console.error('❌ Failed to seed default categories:', seedErr);
    }

    mongoose.connection.on('error', (err) => {
      console.error('❌ MongoDB connection error:', err);
    });

    mongoose.connection.on('disconnected', () => {
      console.warn('⚠️  MongoDB disconnected. Attempting to reconnect...');
    });
  } catch (error) {
    console.error(`❌ MongoDB connection failed: ${error.message}`);
    process.exit(1);
  }
};

module.exports = connectDB;
