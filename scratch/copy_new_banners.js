const fs = require('fs');
try {
  fs.copyFileSync('/Users/zeus/.gemini/antigravity/brain/be6c6c92-26e9-4bd2-979d-89495289d4ab/.user_uploaded/media__1785681037011.jpg', 'client/public/images/banners/toys.jpg');
  fs.copyFileSync('/Users/zeus/.gemini/antigravity/brain/be6c6c92-26e9-4bd2-979d-89495289d4ab/.user_uploaded/media__1785681046109.jpg', 'client/public/images/banners/hotwheels.jpg');
  fs.copyFileSync('/Users/zeus/.gemini/antigravity/brain/be6c6c92-26e9-4bd2-979d-89495289d4ab/.user_uploaded/media__1785681051178.jpg', 'client/public/images/banners/gadgets.jpg');
  console.log('✅ Successfully copied new banner backgrounds:');
  console.log('- client/public/images/banners/toys.jpg');
  console.log('- client/public/images/banners/hotwheels.jpg');
  console.log('- client/public/images/banners/gadgets.jpg');
} catch (err) {
  console.error('❌ Error copying images:', err.message);
}
