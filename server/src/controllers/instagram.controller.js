const { asyncHandler } = require('../middleware/errorHandler');
const axios = require('axios');

/**
 * @route   GET /api/instagram/feed
 * Fetches recent media from Instagram Graph API.
 * Falls back to manually configured posts in settings if token not set.
 */
exports.getInstagramFeed = asyncHandler(async (req, res) => {
  const token = process.env.INSTAGRAM_ACCESS_TOKEN;
  const accountId = process.env.INSTAGRAM_BUSINESS_ACCOUNT_ID;

  if (!token || !accountId) {
    // Return empty — admin will add posts manually via settings
    return res.json({ success: true, posts: [], manual: true });
  }

  try {
    const fields = 'id,media_type,media_url,thumbnail_url,permalink,caption,timestamp';
    const url = `https://graph.instagram.com/${accountId}/media?fields=${fields}&limit=12&access_token=${token}`;
    const { data } = await axios.get(url);
    res.json({ success: true, posts: data.data || [], manual: false });
  } catch (err) {
    // If token expired, don't crash — just return empty
    res.json({ success: true, posts: [], error: 'Instagram token may be expired.', manual: true });
  }
});
