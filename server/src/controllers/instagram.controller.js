const { asyncHandler } = require('../middleware/errorHandler');
const axios = require('axios');
const Product = require('../models/Product');

/**
 * @route   GET /api/instagram/feed
 * Fetches recent media from Instagram Graph API.
 * Falls back to the latest uploaded products from database if token not set.
 */
exports.getInstagramFeed = asyncHandler(async (req, res) => {
  const token = process.env.INSTAGRAM_ACCESS_TOKEN;
  const accountId = process.env.INSTAGRAM_BUSINESS_ACCOUNT_ID;

  // Query latest 6 products as fallback
  let fallbackPosts = [];
  try {
    const products = await Product.find({ isActive: true })
      .sort({ createdAt: -1 })
      .limit(6)
      .lean();
      
    fallbackPosts = products.map((p, i) => ({
      id: p._id.toString(),
      media_type: 'IMAGE',
      media_url: p.images?.[0]?.url || '/logo.png',
      permalink: 'https://www.instagram.com/dstore.in/',
      caption: `${p.name} — ${p.description ? p.description.replace(/<[^>]*>/g, '').substring(0, 120) : 'Premium toys online'}... DM for orders! 🧸✨`,
      timestamp: p.createdAt || new Date().toISOString()
    }));
  } catch (dbErr) {
    // Hardcoded fallback if database query fails
    fallbackPosts = [
      {
        id: 'mock_post_1',
        media_type: 'IMAGE',
        media_url: '/images/products/batch1_1.jpg',
        permalink: 'https://www.instagram.com/dstore.in/',
        caption: 'Unleash the beast! The CRAWLER CYBERTREK with camera. Large scale off-road performance.',
        timestamp: new Date().toISOString()
      }
    ];
  }

  if (!token || !accountId) {
    // Return latest products as fallback — since admin didn't configure Graph API
    return res.json({ success: true, posts: fallbackPosts, manual: true });
  }

  try {
    const fields = 'id,media_type,media_url,thumbnail_url,permalink,caption,timestamp';
    const url = `https://graph.instagram.com/${accountId}/media?fields=${fields}&limit=12&access_token=${token}`;
    const { data } = await axios.get(url);
    res.json({ success: true, posts: data.data && data.data.length ? data.data : fallbackPosts, manual: false });
  } catch (err) {
    // If token expired, return latest products as fallback
    res.json({ success: true, posts: fallbackPosts, error: 'Instagram token may be expired.', manual: true });
  }
});
