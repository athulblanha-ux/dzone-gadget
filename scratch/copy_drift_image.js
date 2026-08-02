const fs = require('fs');
try {
  fs.copyFileSync('/Users/zeus/.gemini/antigravity/brain/be6c6c92-26e9-4bd2-979d-89495289d4ab/.user_uploaded/media__1785673040295.png', 'client/public/images/banners/drift_rc.png');
  console.log('✅ Copied Drift RC image to client/public/images/banners/drift_rc.png');
} catch (err) {
  console.error('❌ Error copying image:', err.message);
}
