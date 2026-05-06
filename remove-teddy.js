const fs = require('fs');
const path = require('path');

const replacements = [
  { file: 'server/src/app.js', from: /🧸 /g, to: '' },
  { file: 'client/src/pages/Home.jsx', from: /emoji: '🧸'/g, to: "emoji: '🎮'" },
  { file: 'client/src/pages/Home.jsx', from: /\|\| '🧸'/g, to: "|| ''" },
  { file: 'client/src/pages/Home.jsx', from: /<div className="w-full h-full flex items-center justify-center text-3xl">🧸<\/div>/g, to: '<div className="w-full h-full flex items-center justify-center"><img src="/logo.png" className="w-12 h-12 object-contain opacity-50" alt="logo" /></div>' },
  { file: 'client/src/pages/Register.jsx', from: / 🧸/g, to: '' },
  { file: 'client/src/pages/Register.jsx', from: /<Link to="\/" className="text-4xl">🧸<\/Link>/g, to: '<Link to="/"><img src="/logo.png" className="h-12 w-auto object-contain" alt="logo" /></Link>' },
  { file: 'client/src/pages/Cart.jsx', from: /<div className="w-full h-full flex items-center justify-center text-2xl">🧸<\/div>/g, to: '<div className="w-full h-full flex items-center justify-center"><img src="/logo.png" className="w-12 h-12 object-contain opacity-50" alt="logo" /></div>' },
  { file: 'client/src/pages/Login.jsx', from: / 🧸/g, to: '' },
  { file: 'client/src/pages/Login.jsx', from: /<Link to="\/" className="text-4xl">🧸<\/Link>/g, to: '<Link to="/"><img src="/logo.png" className="h-12 w-auto object-contain" alt="logo" /></Link>' },
  { file: 'client/src/pages/ForgotPassword.jsx', from: /<Link to="\/" className="text-4xl">🧸<\/Link>/g, to: '<Link to="/"><img src="/logo.png" className="h-12 w-auto object-contain" alt="logo" /></Link>' },
  { file: 'client/src/pages/OrderDetail.jsx', from: /<div className="w-full h-full flex items-center justify-center text-2xl">🧸<\/div>/g, to: '<div className="w-full h-full flex items-center justify-center"><img src="/logo.png" className="w-8 h-8 object-contain opacity-50" alt="logo" /></div>' },
  { file: 'client/src/pages/About.jsx', from: / 🧸/g, to: '' },
  { file: 'client/src/pages/ProductDetail.jsx', from: /<div className="w-full h-full flex items-center justify-center text-7xl">🧸<\/div>/g, to: '<div className="w-full h-full flex items-center justify-center"><img src="/logo.png" className="w-32 h-32 object-contain opacity-50" alt="logo" /></div>' },
  { file: 'admin/src/pages/Login.jsx', from: /<span className="text-5xl">🧸<\/span>/g, to: '<img src="/logo.png" className="h-16 w-auto object-contain mx-auto" alt="logo" />' },
  { file: 'admin/src/pages/Dashboard.jsx', from: /<div className="w-full h-full flex items-center justify-center">🧸<\/div>/g, to: '<div className="w-full h-full flex items-center justify-center"><img src="/logo.png" className="w-6 h-6 object-contain opacity-50" alt="logo" /></div>' },
  { file: 'admin/src/pages/Categories.jsx', from: /'🧸'/g, to: "''" },
  { file: 'admin/src/pages/Categories.jsx', from: /placeholder="🧸"/g, to: 'placeholder="🎮"' },
  { file: 'client/src/components/layout/Footer.jsx', from: /<span className="text-3xl">🧸<\/span>/g, to: '<img src="/logo.png" className="h-10 w-auto object-contain" alt="logo" />' },
  { file: 'client/src/components/product/ProductCard.jsx', from: /<div className="w-full h-full flex items-center justify-center text-5xl">🧸<\/div>/g, to: '<div className="w-full h-full flex items-center justify-center"><img src="/logo.png" className="w-20 h-20 object-contain opacity-50" alt="logo" /></div>' },
  { file: 'client/src/components/ui/WhatsAppButton.jsx', from: / 🧸/g, to: '' },
  { file: 'server/src/seed.js', from: /🧸 /g, to: '' }
];

replacements.forEach(({ file, from, to }) => {
  const fullPath = path.join(__dirname, file);
  if (fs.existsSync(fullPath)) {
    let content = fs.readFileSync(fullPath, 'utf8');
    const newContent = content.replace(from, to);
    if (content !== newContent) {
      fs.writeFileSync(fullPath, newContent, 'utf8');
      console.log(`Updated ${file}`);
    }
  }
});
