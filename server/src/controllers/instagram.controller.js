const { asyncHandler } = require('../middleware/errorHandler');
const axios = require('axios');

const fallbackPosts = [
  {
    id: 'mock_post_1',
    media_type: 'IMAGE',
    media_url: '/images/products/batch1_1.jpg',
    permalink: 'https://www.instagram.com/dstore.in/',
    caption: 'Unleash the beast! The CRAWLER CYBERTREK with camera. Large scale off-road performance. 🚙📸 DM for orders! #rccars #cybertrek #toys',
    timestamp: new Date().toISOString()
  },
  {
    id: 'mock_post_2',
    media_type: 'IMAGE',
    media_url: '/images/products/batch1_2.jpg',
    permalink: 'https://www.instagram.com/dstore.in/',
    caption: 'Exquisite details. Lamborghini metal diecast (1:32 scale model) with openable doors and sound. 🏎️🔥 #diecast #lamborghini',
    timestamp: new Date().toISOString()
  },
  {
    id: 'mock_post_3',
    media_type: 'IMAGE',
    media_url: '/images/products/batch2_3.jpg',
    permalink: 'https://www.instagram.com/dstore.in/',
    caption: 'Tackle any terrain with the 4*4 BIG MOKA CRAWLER. Heavy duty shocks and high-grip tires! 🛞⛰️ #crawler #rccars',
    timestamp: new Date().toISOString()
  },
  {
    id: 'mock_post_4',
    media_type: 'IMAGE',
    media_url: '/images/products/batch3_6.jpg',
    permalink: 'https://www.instagram.com/dstore.in/',
    caption: 'Fly high and capture everything. E88 Drone with dual 4K HD cameras. Stable flight and easy control! 🛸📸 #drone #quadcopter',
    timestamp: new Date().toISOString()
  },
  {
    id: 'mock_post_5',
    media_type: 'IMAGE',
    media_url: '/images/products/batch2_6.jpg',
    permalink: 'https://www.instagram.com/dstore.in/',
    caption: 'Classic design meets remote control power. RC Defender 1:16 scale SUV. Order yours today! 🚙✨ #defender #rccars',
    timestamp: new Date().toISOString()
  },
  {
    id: 'mock_post_6',
    media_type: 'IMAGE',
    media_url: '/images/products/batch3_5.jpg',
    permalink: 'https://www.instagram.com/dstore.in/',
    caption: 'Take to the skies. RC Fighter Jet combat aircraft with ultra-stable flight controls! 🛩️🚀 #rcplane #fighterjet',
    timestamp: new Date().toISOString()
  }
];

/**
 * @route   GET /api/instagram/feed
 * Fetches recent media from Instagram Graph API.
 * Falls back to manually configured posts in settings if token not set.
 */
exports.getInstagramFeed = asyncHandler(async (req, res) => {
  const token = process.env.INSTAGRAM_ACCESS_TOKEN;
  const accountId = process.env.INSTAGRAM_BUSINESS_ACCOUNT_ID;

  if (!token || !accountId) {
    // Return mock posts — since admin didn't configure Graph API
    return res.json({ success: true, posts: fallbackPosts, manual: true });
  }

  try {
    const fields = 'id,media_type,media_url,thumbnail_url,permalink,caption,timestamp';
    const url = `https://graph.instagram.com/${accountId}/media?fields=${fields}&limit=12&access_token=${token}`;
    const { data } = await axios.get(url);
    res.json({ success: true, posts: data.data || fallbackPosts, manual: false });
  } catch (err) {
    // If token expired, don't crash — return fallback posts
    res.json({ success: true, posts: fallbackPosts, error: 'Instagram token may be expired.', manual: true });
  }
});
