const { uploadToCloudinary } = require('../config/cloudinary');
const { asyncHandler } = require('../middleware/errorHandler');

/**
 * @route   POST /api/upload/single
 * @access  Admin
 */
exports.uploadSingle = asyncHandler(async (req, res) => {
  if (!req.file) return res.status(400).json({ success: false, message: 'No file uploaded.' });
  const folder = req.query.folder || 'd-store/general';
  const result = await uploadToCloudinary(req.file.buffer, folder);
  res.json({ success: true, url: result.secure_url, publicId: result.public_id });
});

/**
 * @route   POST /api/upload/multiple
 * @access  Admin
 */
exports.uploadMultiple = asyncHandler(async (req, res) => {
  if (!req.files?.length) return res.status(400).json({ success: false, message: 'No files uploaded.' });
  const folder = req.query.folder || 'd-store/general';
  const results = await Promise.all(req.files.map(f => uploadToCloudinary(f.buffer, folder)));
  const files = results.map(r => ({ url: r.secure_url, publicId: r.public_id }));
  res.json({ success: true, files });
});
