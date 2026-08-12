const Banner = require('../models/Banner');
const { asyncHandler } = require('../middleware/errorHandler');
const { uploadToCloudinary, deleteFromCloudinary } = require('../config/cloudinary');

exports.getBanners = asyncHandler(async (req, res) => {
  const now = new Date();
  const filter = { isActive: true };
  if (req.query.position) filter.position = req.query.position;
  // Only show scheduled banners that are within date range
  filter.$or = [
    { scheduledStart: null, scheduledEnd: null },
    { scheduledStart: { $lte: now }, scheduledEnd: { $gte: now } },
    { scheduledStart: { $lte: now }, scheduledEnd: null },
  ];
  const banners = await Banner.find(filter).sort({ order: 1 }).lean();
  res.json({ success: true, banners });
});

exports.getAllBannersAdmin = asyncHandler(async (req, res) => {
  const banners = await Banner.find().sort({ order: 1 }).lean();
  res.json({ success: true, banners });
});

exports.createBanner = asyncHandler(async (req, res) => {
  const data = { ...req.body };
  if (req.file) {
    const result = await uploadToCloudinary(req.file.buffer, 'dzone-gadget/banners');
    data.image = { url: result.secure_url, publicId: result.public_id };
  }
  const banner = await Banner.create(data);
  res.status(201).json({ success: true, banner });
});

exports.updateBanner = asyncHandler(async (req, res) => {
  const data = { ...req.body };
  if (req.file) {
    const existing = await Banner.findById(req.params.id);
    if (existing?.image?.publicId) await deleteFromCloudinary(existing.image.publicId);
    const result = await uploadToCloudinary(req.file.buffer, 'dzone-gadget/banners');
    data.image = { url: result.secure_url, publicId: result.public_id };
  }
  const banner = await Banner.findByIdAndUpdate(req.params.id, data, { new: true });
  if (!banner) return res.status(404).json({ success: false, message: 'Banner not found.' });
  res.json({ success: true, banner });
});

exports.deleteBanner = asyncHandler(async (req, res) => {
  const banner = await Banner.findById(req.params.id);
  if (!banner) return res.status(404).json({ success: false, message: 'Banner not found.' });
  if (banner.image?.publicId) await deleteFromCloudinary(banner.image.publicId);
  await banner.deleteOne();
  res.json({ success: true, message: 'Banner deleted.' });
});
