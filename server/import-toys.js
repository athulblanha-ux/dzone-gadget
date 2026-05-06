require('dotenv').config();
const mongoose = require('mongoose');
const Product = require('./src/models/Product');
const Category = require('./src/models/Category');
const connectDB = require('./src/config/db');

const toys = [
  // Image 1
  { title: "CRAWLER CYBERTREK WITH CAMERA (BIG SIZE)", description: "Tesla cybertrek", price: 1999, originalPrice: 2899, img: "/images/products/batch1_1.jpg" },
  { title: "LAMBORGHINI METAL DIECAST (1:32)", description: "Lamborghini", price: 680, originalPrice: 1199, img: "/images/products/batch1_2.jpg" },
  { title: "AUDI Q8", description: "Metal", price: 199, originalPrice: 999, img: "/images/products/batch1_3.jpg" },
  { title: "G WAGON (1:36) METAL DIE CAST", description: "Pull back function", price: 199, originalPrice: 999, img: "/images/products/batch1_4.jpg" },
  { title: "Diecast (1:36)", description: "Metal diecast", price: 199, originalPrice: 599, img: "/images/products/batch1_5.jpg" },

  // Image 2
  { title: "Coupe benz old model diecast (1:32)", description: "Benz", price: 680, originalPrice: 999, img: "/images/products/batch2_1.jpg" },
  { title: "Die cast model benz classic (1:32)", description: "Metal car", price: 680, originalPrice: 999, img: "/images/products/batch2_2.jpg" },
  { title: "4*4 BIG MOKA CROWLER", description: "Big moka crowler", price: 1350, originalPrice: 2399, img: "/images/products/batch2_3.jpg" },
  { title: "Rc car", description: "Gun remote", price: 1099, originalPrice: 1999, img: "/images/products/batch2_4.jpg" },
  { title: "RC offroad SUV", description: "Remote control suv with light spray", price: 799, originalPrice: 1399, img: "/images/products/batch2_5.jpg" },
  { title: "RC Defender", description: "Remote control defender 1:16", price: 849, originalPrice: 1300, img: "/images/products/batch2_6.jpg" },
  { title: "Wall climbing lizard", description: "Wall climbing versatile game play", price: 1299, originalPrice: 2999, img: "/images/products/batch2_7.jpg" },

  // Image 3
  { title: "Bubble Gun", description: "With bubble water", price: 249, originalPrice: 399, img: "/images/products/batch3_1.jpg" },
  { title: "Rc rock crowler metal", description: "Rc rock crowler", price: 649, originalPrice: 1399, img: "/images/products/batch3_2.jpg" },
  { title: "Video walkie talkie", description: "Video walkie talkie for kids", price: 899, originalPrice: 1899, img: "/images/products/batch3_3.jpg" },
  { title: "Children's digital camera", description: "Childrens digital camera", price: 390, originalPrice: 699, img: "/images/products/batch3_4.jpg" },
  { title: "Fighter jet", description: "Combat aircraft remote control", price: 849, originalPrice: 1999, img: "/images/products/batch3_5.jpg" },
  { title: "E88 drone 4k hd camera (dual camera)", description: "4k hd camera", price: 1299, originalPrice: 1999, img: "/images/products/batch3_6.jpg" }
];

async function importToys() {
  await connectDB();
  
  try {
    // 1. Delete all existing products to clear out the incorrect Shopify imports
    await Product.deleteMany({});
    console.log('✅ Cleared all old products from the database.');

    // 2. Ensure a default category exists for toys
    let category = await Category.findOne({ slug: 'toys' });
    if (!category) {
      category = await Category.create({ name: 'Toys', slug: 'toys', isActive: true, description: 'All toys' });
    }

    // 3. Insert the 18 toy products
    for (const item of toys) {
      const product = new Product({
        name: item.title,
        description: item.description,
        price: item.price,
        // Since originalPrice isn't in schema, we'll store images and active status
        images: [{ url: item.img, publicId: `local_${item.title.replace(/\s+/g, '_')}` }],
        category: category._id,
        stock: 50,
        isActive: true,
      });

      await product.save();
      console.log(`Imported: ${item.title} (₹${item.price})`);
    }

    console.log(`🎉 Successfully imported all ${toys.length} toys!`);
  } catch (err) {
    console.error('❌ Failed to import toys:', err);
  } finally {
    mongoose.connection.close();
  }
}

importToys();
