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
    { key: 'return_policy', value: `Effective Date: 26-05-2026
At D-STORE, we aim to offer a seamless shopping experience with fast and reliable delivery, high-quality products, and customer-friendly support policies. Please read the following carefully to understand how we handle shipping, delivery, warranty, returns, and cancellations.

### Shipping Partners
To ensure timely and safe delivery, we only ship through reputed courier partners such as DTDC, Delhivery, and others available at checkout. On special requests and for remote locations, we may use India Post EMS Speed Post. However, we cannot guarantee EMS requests as post offices often reject shipments they consider fragile or non-compliant.

### Shipping Timelines
- Same-Day Shipping for orders placed before 12 PM (Mon-Sat).
- Orders placed after the cutoff or on Sundays/Public Holidays will be shipped the next working day.
- Expected delivery time: 2–5 business days depending on location.
- Same-day delivery in select areas is possible between 3 PM – 10 PM.
Note: While we make every effort to ensure timely delivery, there may occasionally be a dispatch delay of 1–2 days due to factors such as courier service delays, truck unavailability, or other unexpected operational issues. We are not liable for such delays caused by courier operations, weather, or circumstances beyond our control. Kindly plan your orders in advance.

### Unboxing Video Requirement
For your protection and ours:
- Always take a clear unboxing video showing the sealed package being opened.
- This helps us process claims for damages, missing parts, or wrong items.
- No replacement or refund will be approved without proper video evidence.

### Damaged or Tampered Deliveries
If the package appears damaged or tampered, do not accept it. Immediately contact our customer support with your Order ID and evidence.

### Invoice Policy
All shipments include a tax invoice as per Indian regulations, including for gifts.

### Warranty Policy
All D-STORE products carry a standard warranty against manufacturing defects (unless otherwise stated on the product page). If you encounter issues:
- Notify us promptly of receiving the item.
- Share relevant images/videos with your complaint.
- Upon verification, we will offer free repair/replacement or 100% refund if the item is unavailable.
- Replaced product will be delivered as soon as possible.
Warranty Exclusions: Misuse, accidental damage, soldered/modified items, static discharge, or negligence voids warranty.

Products that develop issues due to normal usage, wear and tear, or aging of components are not covered without warranty. This includes, but is not limited to:
- Scratches, dents, faded paint
- Worn-out tires, gears, shafts, bearings, motors, or servos
- Damage caused by long-term usage
- Battery degradation over time
- Loose screws, connectors, or cosmetic damage from regular handling
Since these issues arise from regular use and are not manufacturing defects, free replacements cannot be provided.
However, D-STORE offers:
- Paid replacement parts at genuine prices
- Repair service support if needed
- Guidance on installation or troubleshooting
Shipping charges for replacement parts or repairs will be borne by the customer.

### Return Conditions
- Must be initiated within the return eligibility window.
- Item must be unused, in original condition, with original packaging and invoice.
- An RMA (Return Merchandise Authorization) number will be provided after verification.

### Return Process
1. Raise a return ticket via the Support page.
2. Share photos/unboxing video of the item.
3. After internal verification, we’ll provide an RMA number.
4. Pack the item carefully (do not write on product box).
5. Ship it back to us.
You are responsible for return shipping. We will reimburse the return shipping cost once the issue is confirmed.
Please note: if we charged ₹50 for shipping at the time of dispatch, we will reimburse ₹100 for the return shipment as compensation, once the issue is verified.

Please note that spare parts, electronic components, upgrade parts, and accessories are non-returnable and non-refundable once delivered, except in cases where the item is defective or incorrect.
This includes but is not limited to:
- Motors and brushless systems
- Servos and ESCs
- Gear sets, shafts, bearings, and drivetrain parts
- Batteries and electronic components
- Upgrade kits and modification parts
- Screws, mounts, connectors, and small hardware

### Important Notes
- Customers must verify compatibility with their model before placing an order.
- Returns will not be accepted for wrong selection, incompatibility, or change of mind.
- Once parts are installed, soldered, modified, or used, they become ineligible for replacement or refund.

### If the Item Arrives Defective
If a spare part arrives damaged, non-functional, or incorrect, please:
1. Notify us within 48 hours of delivery.
2. Share a clear unboxing video and product photos.
3. After verification, we will provide a replacement or store credit if the issue is confirmed.
Please note that minor cosmetic marks on spare parts do not qualify as defects.

### Cancellation Conditions
- You may request cancellation by email only (before order status moves to “Processing”).
- Orders in “Pending” or “Payment Verification” status can be cancelled.
- Orders already packed/shipped cannot be cancelled.
Cancellation may incur a 5% fee based on your payment gateway, as they deduct fees on all transactions (even refunds).

### If a Shipment is Rejected or Refused by the Customer
If you reject or refuse delivery after the product has been shipped, you will be liable for the following deductions from your refund amount:
- Packing and material charges
- Forward and Return shipping charges
- 5% Payment Gateway fee
- Any transit damage or theft loss during return
- Operational handling fee (up to ₹2000) for order processing and cancellation effort (depending on the product).
- Business loss compensation fee (up to 10% of product value) in cases where the rejection was found intentional or without a valid reason, such as “change of mind” after shipment.
This policy is in place to cover unavoidable logistics and handling expenses already incurred once your order is dispatched.

### Refund Policy
- If the product cannot be repaired or replaced, we offer a 100% refund.
- Refunds are issued once we receive and verify the returned product.
- If a refund is approved (only for defective items), the amount will be credited to your original payment method within 7 business days.

### Limits of Responsibility
D-STORE is not responsible for:
- Improper use, modification, or incorrect installation of products.
- Polarity or voltage issues in electrical components.
- Damage from user error or neglect.

### Customer Support
Need help? Contact us:
Phone / WhatsApp: 📱 +91 94953 02826
Email: 📧 support@d-store.store

### Our Address
D-STORE, Mumbai, Maharashtra, India
🌐 www.dstoreindia.com`, label: 'Return Policy', group: 'policies', type: 'textarea' },
    { key: 'shipping_policy', value: `Orders are shipped within 1-2 business days. Delivery takes 2-5 business days depending on location. Free shipping above ₹499.`, label: 'Shipping Policy', group: 'policies', type: 'textarea' },
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
    { question: 'What is your return policy?', answer: 'Please refer to our Return Policy page for details on returns and eligibility.', category: 'returns', order: 1 },
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
