const Setting = require('../models/Setting');
const { asyncHandler } = require('../middleware/errorHandler');

exports.getPublicSettings = asyncHandler(async (req, res) => {
  const settings = await Setting.find({ isPublic: true }).lean();
  const map = {};
  settings.forEach(s => { map[s.key] = s.value; });
  res.json({ success: true, settings: map });
});

exports.getAllSettings = asyncHandler(async (req, res) => {
  const settings = await Setting.find({});
  res.json({ success: true, settings });
});


exports.getSettingsByGroup = asyncHandler(async (req, res) => {
  const settings = await Setting.find({ group: req.params.group }).lean();
  res.json({ success: true, settings });
});

exports.upsertSetting = asyncHandler(async (req, res) => {
  const { key, value, label, group, type, isPublic } = req.body;
  const setting = await Setting.findOneAndUpdate(
    { key },
    { value, label, group, type, isPublic },
    { new: true, upsert: true, runValidators: true }
  );
  res.json({ success: true, setting });
});

exports.bulkUpsertSettings = asyncHandler(async (req, res) => {
  const { settings } = req.body; // [{ key, value, ... }]
  const ops = settings.map(s => ({
    updateOne: { filter: { key: s.key }, update: { $set: s }, upsert: true },
  }));
  await Setting.bulkWrite(ops);
  res.json({ success: true, message: 'Settings saved.' });
});
