const User = require('../models/User');
const { asyncHandler } = require('../middleware/errorHandler');
const { uploadToCloudinary, deleteFromCloudinary } = require('../config/cloudinary');

exports.getProfile = asyncHandler(async (req, res) => {
  const user = await User.findById(req.user._id).populate('wishlist', 'name images price salePrice slug');
  res.json({ success: true, user });
});

exports.updateProfile = asyncHandler(async (req, res) => {
  const { name, phone, notificationPreferences } = req.body;
  const update = {};
  if (name) update.name = name;
  if (phone) update.phone = phone;
  if (notificationPreferences) update.notificationPreferences = notificationPreferences;

  if (req.file) {
    const user = await User.findById(req.user._id);
    if (user.avatar?.publicId) await deleteFromCloudinary(user.avatar.publicId);
    const result = await uploadToCloudinary(req.file.buffer, 'dzone-gadget/avatars');
    update.avatar = { url: result.secure_url, publicId: result.public_id };
  }

  const user = await User.findByIdAndUpdate(req.user._id, update, { new: true, runValidators: true });
  res.json({ success: true, user });
});

exports.changePassword = asyncHandler(async (req, res) => {
  const { currentPassword, newPassword } = req.body;
  const user = await User.findById(req.user._id).select('+password');
  if (!user.password) return res.status(400).json({ success: false, message: 'No password set. Use Google login.' });
  const isMatch = await user.comparePassword(currentPassword);
  if (!isMatch) return res.status(400).json({ success: false, message: 'Current password is incorrect.' });
  user.password = newPassword;
  await user.save();
  res.json({ success: true, message: 'Password updated.' });
});

exports.addAddress = asyncHandler(async (req, res) => {
  const user = await User.findById(req.user._id);
  if (req.body.isDefault) user.addresses.forEach(a => a.isDefault = false);
  user.addresses.push(req.body);
  await user.save();
  res.json({ success: true, addresses: user.addresses });
});

exports.updateAddress = asyncHandler(async (req, res) => {
  const user = await User.findById(req.user._id);
  const address = user.addresses.id(req.params.addressId);
  if (!address) return res.status(404).json({ success: false, message: 'Address not found.' });
  if (req.body.isDefault) user.addresses.forEach(a => a.isDefault = false);
  Object.assign(address, req.body);
  await user.save();
  res.json({ success: true, addresses: user.addresses });
});

exports.deleteAddress = asyncHandler(async (req, res) => {
  await User.findByIdAndUpdate(req.user._id, { $pull: { addresses: { _id: req.params.addressId } } });
  res.json({ success: true, message: 'Address removed.' });
});

exports.toggleWishlist = asyncHandler(async (req, res) => {
  const user = await User.findById(req.user._id);
  const productId = req.params.productId;
  const idx = user.wishlist.indexOf(productId);
  if (idx === -1) {
    user.wishlist.push(productId);
  } else {
    user.wishlist.splice(idx, 1);
  }
  await user.save();
  res.json({ success: true, wishlist: user.wishlist, added: idx === -1 });
});

// Admin: get all users
exports.getAllUsers = asyncHandler(async (req, res) => {
  const page = parseInt(req.query.page) || 1;
  const limit = parseInt(req.query.limit) || 20;
  const search = req.query.search ? { $or: [{ name: { $regex: req.query.search, $options: 'i' } }, { email: { $regex: req.query.search, $options: 'i' } }] } : {};
  const [users, total] = await Promise.all([
    User.find(search).sort({ createdAt: -1 }).skip((page - 1) * limit).limit(limit).lean(),
    User.countDocuments(search),
  ]);
  res.json({ success: true, users, pagination: { page, limit, total, pages: Math.ceil(total / limit) } });
});

exports.toggleUserStatus = asyncHandler(async (req, res) => {
  const user = await User.findById(req.params.id);
  if (!user) return res.status(404).json({ success: false, message: 'User not found.' });
  user.isActive = !user.isActive;
  await user.save();
  res.json({ success: true, isActive: user.isActive });
});
