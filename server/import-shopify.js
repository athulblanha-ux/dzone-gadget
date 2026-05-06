require('dotenv').config();
const mongoose = require('mongoose');
const Product = require('./src/models/Product');
const Category = require('./src/models/Category');
const connectDB = require('./src/config/db');

async function importShopifyCatalog() {
  await connectDB();
  
  try {
    const fs = require('fs');
    const dataPath = '/tmp/products.json';
    
    if (!fs.existsSync(dataPath)) {
      console.error('Error: products.json not found!');
      process.exit(1);
    }
    
    const data = JSON.parse(fs.readFileSync(dataPath, 'utf-8'));
    const catalog = data.products || [];
    console.log(`Found ${catalog.length} products to import.`);

    let defaultCategory = await Category.findOne();
    if (!defaultCategory) {
      defaultCategory = await Category.create({ name: 'General', slug: 'general', isActive: true });
    }

    for (const item of catalog) {
      const name = item.title;
      // Get price from first variant
      const price = parseFloat(item.variants?.[0]?.price) || 0;
      const comparePrice = parseFloat(item.variants?.[0]?.compare_at_price) || 0;
      
      const images = (item.images || []).map(img => ({
        url: img.src,
        publicId: `shopify_${img.id}`
      }));

      // Check if product already exists to avoid duplicates
      const existing = await Product.findOne({ name });
      if (existing) {
        console.log(`Skipping "${name}" - already exists.`);
        continue;
      }

      // Convert Shopify HTML description to plain text or keep HTML if your frontend supports it
      // The frontend might use dangerouslySetInnerHTML or we can strip tags. Let's keep HTML.
      const description = item.body_html || `Imported product from catalog.`;

      const product = new Product({
        name,
        description,
        price,
        images,
        category: defaultCategory._id,
        stock: 50, // Default stock
        isActive: true,
      });

      // If there's a compare_at_price, calculate discount logic or just set it (schema doesn't have compareAtPrice, maybe we can add a fake review or tags)
      if (item.tags && item.tags.length > 0) {
        product.tags = item.tags;
      }

      await product.save();
      console.log(`Imported: ${name} (₹${price})`);
    }

    console.log('Import completed successfully!');
  } catch (err) {
    console.error('Failed to import catalog:', err);
  } finally {
    mongoose.connection.close();
  }
}

importShopifyCatalog();
