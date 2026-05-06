// Run this snippet in your WhatsApp Web browser console
// Make sure you have the catalog open and scrolled to the bottom before running.

(() => {
  const products = [];
  // WhatsApp web catalog items usually have specific container elements
  // We'll look for images and nearby text that looks like a price/title
  
  // NOTE: WhatsApp DOM changes frequently, so this is a heuristic approach
  const items = document.querySelectorAll('div[role="button"]'); 
  
  items.forEach(item => {
    const textNodes = Array.from(item.querySelectorAll('span, div')).filter(n => n.childNodes.length === 1 && n.childNodes[0].nodeType === 3);
    const texts = textNodes.map(n => n.textContent.trim()).filter(Boolean);
    
    // Attempt to find a price (contains ₹)
    const priceText = texts.find(t => t.includes('₹') || t.includes('Rs'));
    if (!priceText) return; // Not a product item if no price
    
    // The title is usually the longest string or the first string before the price
    const titleText = texts.find(t => t !== priceText && t.length > 3) || "Unknown Product";
    
    // Attempt to find image
    const img = item.querySelector('img');
    const bgImg = item.querySelector('div[style*="background-image"]');
    let imageUrl = '';
    if (img) imageUrl = img.src;
    else if (bgImg) {
      const match = bgImg.style.backgroundImage.match(/url\("?(.+?)"?\)/);
      if (match) imageUrl = match[1];
    }
    
    products.push({
      title: titleText,
      price: priceText,
      image: imageUrl
    });
  });

  // Deduplicate
  const uniqueProducts = [];
  const titles = new Set();
  products.forEach(p => {
    if (!titles.has(p.title)) {
      titles.add(p.title);
      uniqueProducts.push(p);
    }
  });

  console.log(`Found ${uniqueProducts.length} products!`);
  console.log(JSON.stringify(uniqueProducts, null, 2));
  
  // Create a download link for the JSON
  const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(uniqueProducts, null, 2));
  const downloadAnchorNode = document.createElement('a');
  downloadAnchorNode.setAttribute("href",     dataStr);
  downloadAnchorNode.setAttribute("download", "whatsapp_catalog.json");
  document.body.appendChild(downloadAnchorNode);
  downloadAnchorNode.click();
  downloadAnchorNode.remove();
})();
