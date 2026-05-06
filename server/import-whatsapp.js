require('dotenv').config();
const mongoose = require('mongoose');
const Product = require('./src/models/Product');
const connectDB = require('./src/config/db');

async function importCatalog() {
  await connectDB();
  
  try {
    const fs = require('fs');
    const path = require('path');
    const dataPath = path.join(__dirname, '../whatsapp_catalog.json');
    
    if (!fs.existsSync(dataPath)) {
      console.error('Error: whatsapp_catalog.json not found!');
      process.exit(1);
    }
    
    const catalog = JSON.parse(fs.readFileSync(dataPath, 'utf-8'));
    console.log(`Found ${catalog.length} products to import.`);

    for (const item of catalog) {
      // Basic formatting of the extracted data
      const name = item.title || item.name;
      const rawPrice = item.price ? item.price.toString().replace(/[^0-9.]/g, '') : '0';
      const price = parseFloat(rawPrice) || 0;
      const imageUrl = item.image || item.imageUrl;

      // Check if product already exists to avoid duplicates
      const existing = await Product.findOne({ name });
      if (existing) {
        console.log(`Skipping "${name}" - already exists.`);
        continue;
      }

      const product = new Product({
        name,
        description: item.description || `Extracted from WhatsApp Catalog`,
        price,
        images: imageUrl ? [{ url: imageUrl, publicId: 'whatsapp_extract' }] : [],
        category: null,
        stock: 10, // Default stock
        isActive: true,
      });

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

importCatalog();
