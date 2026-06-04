const { asyncHandler } = require('../middleware/errorHandler');
const axios = require('axios');

const fallbackPosts = [
  {
    id: 'mock_post_1',
    media_type: 'IMAGE',
    media_url: 'https://images.unsplash.com/photo-1594787318286-3d835c1d207f?auto=format&fit=crop&w=600&q=80',
    permalink: 'https://www.instagram.com/dstore.in/',
    caption: 'Unleash the speed with our latest Hobbygrade RC Sports Cars! 🏎️💨 #rccars #hobbygrade #dstore',
    timestamp: new Date().toISOString()
  },
  {
    id: 'mock_post_2',
    media_type: 'IMAGE',
    media_url: 'https://images.unsplash.com/photo-1581235720704-06d3acfcb36f?auto=format&fit=crop&w=600&q=80',
    permalink: 'https://www.instagram.com/dstore.in/',
    caption: 'Precision scale and details. Check out our new Diecast models range! 🚗✨ #diecast #scalemodels',
    timestamp: new Date().toISOString()
  },
  {
    id: 'mock_post_3',
    media_type: 'IMAGE',
    media_url: 'https://images.unsplash.com/photo-1587654780291-39c9404d746b?auto=format&fit=crop&w=600&q=80',
    permalink: 'https://www.instagram.com/dstore.in/',
    caption: 'Build your imagination block by block. Premium building sets now in stock! 🧱🏰 #buildingblocks #blocks',
    timestamp: new Date().toISOString()
  },
  {
    id: 'mock_post_4',
    media_type: 'IMAGE',
    media_url: 'https://images.unsplash.com/photo-1608889175123-8ec330b86f84?auto=format&fit=crop&w=600&q=80',
    permalink: 'https://www.instagram.com/dstore.in/',
    caption: 'Action figures and robotic collectibles for the ultimate fans. Get yours today! 🤖🛡️ #actionfigures #toys',
    timestamp: new Date().toISOString()
  },
  {
    id: 'mock_post_5',
    media_type: 'IMAGE',
    media_url: 'https://images.unsplash.com/photo-1517524206127-48bbd363f3d7?auto=format&fit=crop&w=600&q=80',
    permalink: 'https://www.instagram.com/dstore.in/',
    caption: 'Retro classics never fade. Add this vintage Beetle scale model to your collection! 🚘❤️ #vintagecars #diecast',
    timestamp: new Date().toISOString()
  },
  {
    id: 'mock_post_6',
    media_type: 'IMAGE',
    media_url: 'https://images.unsplash.com/photo-1596461404969-9ae70f2830c1?auto=format&fit=crop&w=600&q=80',
    permalink: 'https://www.instagram.com/dstore.in/',
    caption: 'Creative learning and STEM play for growing minds. Explore educational toys! 🧠🎒 #stem #educationaltoys',
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
