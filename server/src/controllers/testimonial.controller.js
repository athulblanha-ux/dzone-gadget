const Testimonial = require('../models/Testimonial');
const { asyncHandler } = require('../middleware/errorHandler');
const { uploadToCloudinary } = require('../config/cloudinary');

exports.getTestimonials = asyncHandler(async (req, res) => {
  const filter = { isActive: true };
  if (req.query.featured === 'true') filter.isFeatured = true;
  const testimonials = await Testimonial.find(filter).sort({ order: 1 }).lean();
  res.json({ success: true, testimonials });
});

exports.createTestimonial = asyncHandler(async (req, res) => {
  const data = { ...req.body };
  if (req.file) {
    const result = await uploadToCloudinary(req.file.buffer, 'dzone-gadget/testimonials');
    data.avatar = { url: result.secure_url, publicId: result.public_id };
  }
  const testimonial = await Testimonial.create(data);
  res.status(201).json({ success: true, testimonial });
});

exports.updateTestimonial = asyncHandler(async (req, res) => {
  const testimonial = await Testimonial.findByIdAndUpdate(req.params.id, req.body, { new: true });
  if (!testimonial) return res.status(404).json({ success: false, message: 'Testimonial not found.' });
  res.json({ success: true, testimonial });
});

exports.deleteTestimonial = asyncHandler(async (req, res) => {
  await Testimonial.findByIdAndDelete(req.params.id);
  res.json({ success: true, message: 'Testimonial deleted.' });
});
