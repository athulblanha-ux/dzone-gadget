require('dotenv').config();
require('dotenv').config();
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const User = require('./models/User');
const Category = require('./models/Category');
const Product = require('./models/Product');
const Setting = require('./models/Setting');
const HomepageSection = require('./models/HomepageSection');
const FAQ = require('./models/FAQ');
const Banner = require('./models/Banner');
const Testimonial = require('./models/Testimonial');

const seed = async () => {
  await mongoose.connect(process.env.MONGO_URI);
  console.log('✅ Connected to MongoDB');

  // Clear existing data (dev only)
  await Promise.all([
    User.deleteMany({}),
    Category.deleteMany({}),
    Product.deleteMany({}),
    Setting.deleteMany({}),
    HomepageSection.deleteMany({}),
    FAQ.deleteMany({}),
    Banner.deleteMany({}),
    Testimonial.deleteMany({}),
  ]);
  console.log('🗑️  Cleared existing data');

  // ─── Admin User ────────────────────────────────────────────────────────────
  await User.create({
    name: 'D-STORE Admin',
    email: process.env.ADMIN_EMAIL || 'admin@d-store.store',
    password: process.env.ADMIN_PASSWORD || 'Admin@123456',
    role: 'superadmin',
    isActive: true,
    isEmailVerified: true,
  });
  console.log('👤 Admin user created');

  // ─── Categories ─────────────────────────────────────────────────────────────
  const categoryData = [
    { name: 'Action Figures', icon: '🦸', order: 1, isFeatured: true },
    { name: 'Building & Blocks', icon: '🧱', order: 2, isFeatured: true },
    { name: 'Educational Toys', icon: '📚', order: 3, isFeatured: true },
    { name: 'Dolls & Accessories', icon: '🪆', order: 4, isFeatured: true },
    { name: 'Outdoor & Sports', icon: '⚽', order: 5, isFeatured: true },
    { name: 'Puzzles & Games', icon: '🧩', order: 6, isFeatured: true },
    { name: 'Remote Control', icon: '🚗', order: 7, isFeatured: false },
    { name: 'Arts & Crafts', icon: '🎨', order: 8, isFeatured: false },
  ];
  const categories = [];
  for (const cat of categoryData) {
    categories.push(await Category.create(cat));
  }
  console.log(`📦 ${categories.length} categories created`);

  // ─── Sample Products ────────────────────────────────────────────────────────
  const productData = [
    {
      name: 'Super Hero Action Figure Set',
      description: 'A premium set of 6 superhero action figures with detailed painting and movable joints. Perfect for kids aged 4+.',
      shortDescription: 'Set of 6 superhero figures with movable joints.',
      price: 1299,
      salePrice: 999,
      category: categories[0]._id,
      stock: 50,
      images: [{ url: 'https://images.unsplash.com/photo-1608889825205-eebdb9fc5806?w=800&q=80', alt: 'Action Figure Set' }],
      tags: ['superhero', 'action', 'figures'],
      ageGroup: '3-5',
      isFeatured: true,
      isTrending: true,
      isNewArrival: true,
      gstRate: 18,
    },
    {
      name: 'Rainbow Building Blocks 200pcs',
      description: 'Colorful, non-toxic building blocks that stimulate creativity and fine motor skills. Includes 200 pieces in 12 vibrant colors.',
      shortDescription: '200 colorful building blocks for creative play.',
      price: 799,
      category: categories[1]._id,
      stock: 80,
      images: [{ url: 'https://images.unsplash.com/photo-1587654780291-39c9404d746b?w=800&q=80', alt: 'Building Blocks' }],
      tags: ['blocks', 'building', 'colorful'],
      ageGroup: '0-2',
      isFeatured: true,
      gstRate: 12,
    },
    {
      name: 'STEM Science Explorer Kit',
      description: 'An exciting science kit with 30+ experiments covering chemistry, physics, and biology. Comes with guide book.',
      shortDescription: '30+ science experiments in one kit.',
      price: 1599,
      salePrice: 1299,
      category: categories[2]._id,
      stock: 35,
      images: [{ url: 'https://images.unsplash.com/photo-1532094349884-543bc11b234d?w=800&q=80', alt: 'Science Kit' }],
      tags: ['stem', 'science', 'educational'],
      ageGroup: '6-8',
      isFeatured: true,
      isTrending: true,
      gstRate: 18,
    },
  ];
  const products = [];
  for (const prod of productData) {
    products.push(await Product.create(prod));
  }
  console.log(`${products.length} products created`);

  // ─── Site Settings ──────────────────────────────────────────────────────────
  await Setting.insertMany([
    { key: 'site_name', value: 'D-STORE', label: 'Site Name', group: 'general', type: 'text' },
    { key: 'site_tagline', value: 'Where Play Comes to Life', label: 'Tagline', group: 'general', type: 'text' },
    { key: 'contact_email', value: 'support@d-store.store', label: 'Support Email', group: 'contact', type: 'text' },
    { key: 'contact_phone', value: '+91 94953 02826', label: 'Phone', group: 'contact', type: 'text' },
    { key: 'contact_address', value: '123, Toy Street, Mumbai, Maharashtra - 400001', label: 'Address', group: 'contact', type: 'textarea' },
    { key: 'whatsapp_number', value: '919495302826', label: 'WhatsApp Number', group: 'contact', type: 'text' },
    { key: 'instagram_handle', value: 'dstore.in', label: 'Instagram Handle', group: 'social', type: 'text' },
    { key: 'instagram_url', value: 'https://www.instagram.com/dstore.in/', label: 'Instagram URL', group: 'social', type: 'text' },
    { key: 'facebook_url', value: 'https://facebook.com/d-store', label: 'Facebook URL', group: 'social', type: 'text' },
    { key: 'free_shipping_threshold', value: 499, label: 'Free Shipping Above (₹)', group: 'shipping', type: 'number' },
    { key: 'shipping_fee', value: 49, label: 'Standard Shipping Fee (₹)', group: 'shipping', type: 'number' },
    { key: 'gst_number', value: '27AABCT1332L1Z8', label: 'GST Number', group: 'general', type: 'text' },
    { key: 'privacy_policy', value: 'Your privacy is important to us...', label: 'Privacy Policy', group: 'policies', type: 'textarea', isPublic: false },
    { key: 'terms_conditions', value: 'By using our website...', label: 'Terms & Conditions', group: 'policies', type: 'textarea', isPublic: false },
    { key: 'return_policy', value: 'We accept returns within 7 days...', label: 'Return Policy', group: 'policies', type: 'textarea' },
    { key: 'shipping_policy', value: 'Orders are shipped within 1-2 business days...', label: 'Shipping Policy', group: 'policies', type: 'textarea' },
  ]);
  console.log('⚙️  Site settings seeded');

  // ─── Homepage Sections ──────────────────────────────────────────────────────
  await HomepageSection.insertMany([
    { type: 'hero_banner', title: 'Hero Banner', order: 1, isActive: true },
    { type: 'featured_categories', title: 'Shop by Category', order: 2, isActive: true, settings: { limit: 8 } },
    { type: 'featured_products', title: 'Featured Toys', subtitle: 'Handpicked just for you', order: 3, isActive: true, settings: { limit: 8 } },
    { type: 'flash_sale', title: '⚡ Flash Sale', subtitle: 'Limited time offers!', order: 4, isActive: true, settings: { showTimer: true } },
    { type: 'trending_products', title: 'Trending Now 🔥', order: 5, isActive: true, settings: { limit: 8 } },
    { type: 'instagram_feed', title: 'Follow Us on Instagram', subtitle: '@dstore.in', order: 6, isActive: true },
    { type: 'testimonials', title: 'Happy Little Customers', order: 7, isActive: true },
    { type: 'newsletter', title: 'Get Exclusive Deals!', subtitle: 'Subscribe for 10% off your first order', order: 8, isActive: true },
  ]);
  console.log('🏠 Homepage sections seeded');

  // ─── FAQs ───────────────────────────────────────────────────────────────────
  await FAQ.insertMany([
    { question: 'What age groups are your toys suitable for?', answer: 'We carry toys for all age groups from 0-2 years to 13+. Every product has an age recommendation.', category: 'products', order: 1 },
    { question: 'Do you offer free shipping?', answer: 'Yes! Orders above ₹499 qualify for free shipping.', category: 'shipping', order: 1 },
    { question: 'What is your return policy?', answer: 'We accept returns within 7 days of delivery for unused, undamaged products in original packaging.', category: 'returns', order: 1 },
    { question: 'How can I track my order?', answer: 'Once your order is shipped, you\'ll receive a tracking link via email and SMS.', category: 'orders', order: 1 },
    { question: 'Which payment methods do you accept?', answer: 'We accept Razorpay (UPI, cards, netbanking), Stripe, and Cash on Delivery.', category: 'payments', order: 1 },
  ]);
  console.log('❓ FAQs seeded');

  // ─── Testimonials ───────────────────────────────────────────────────────────
  await Testimonial.insertMany([
    { name: 'Priya Sharma', role: 'Mother of 2', rating: 5, comment: 'My kids absolutely love the toys from D-STORE! Great quality and fast delivery.', isFeatured: true, order: 1 },
    { name: 'Rahul Mehta', role: 'Verified Buyer', rating: 5, comment: 'Bought the STEM kit for my 7-year-old. She hasn\'t put it down since! Amazing value.', isFeatured: true, order: 2 },
    { name: 'Anita Patel', role: 'Parent', rating: 4, comment: 'Beautiful packaging and great quality. The building blocks set is perfect.', isFeatured: true, order: 3 },
  ]);
  console.log('💬 Testimonials seeded');

  console.log('\n✅ Database seeded successfully!');
  console.log(`📧 Admin login: ${process.env.ADMIN_EMAIL || 'admin@d-store.store'}`);
  console.log(`🔑 Admin password: ${process.env.ADMIN_PASSWORD || 'Admin@123456'}`);
  process.exit(0);
};

seed().catch((err) => {
  console.error('❌ Seed failed:', err);
  process.exit(1);
});
