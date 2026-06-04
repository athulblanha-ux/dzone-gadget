// INSTRUCTIONS FOR USER:
// 1. Open your web browser and navigate to https://www.instagram.com/dstore.in/
// 2. Open the Developer Tools Console (Right-click -> Inspect -> Console, or press F12 / Cmd+Option+I)
// 3. Copy and paste the script below into the Console and press Enter:
// 4. Copy the resulting JSON output and paste it in the chat response!

(() => {
  const posts = [];
  // Find all post images in the feed grid
  const images = Array.from(document.querySelectorAll('main article img'));
  
  images.forEach((img, i) => {
    if (posts.length >= 6) return;
    const a = img.closest('a');
    if (!a) return;
    
    posts.push({
      id: `real_post_${posts.length + 1}`,
      media_type: 'IMAGE',
      media_url: img.src,
      permalink: a.href,
      caption: img.alt || 'D-STORE Premium Toys',
      timestamp: new Date().toISOString()
    });
  });

  if (posts.length === 0) {
    console.error('No posts found. Make sure you are on the Instagram profile page and the grid is loaded!');
  } else {
    console.log('\n=== COPY THE JSON BELOW ===\n');
    console.log(JSON.stringify(posts, null, 2));
    console.log('\n===========================\n');
  }
})();
