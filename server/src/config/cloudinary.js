const cloudinary = require('cloudinary').v2;

/**
 * Configure Cloudinary for image uploads
 */
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
  secure: true,
});

/**
 * Helper to check if Cloudinary is configured
 */
const checkConfig = () => {
  if (!process.env.CLOUDINARY_CLOUD_NAME || !process.env.CLOUDINARY_API_KEY || !process.env.CLOUDINARY_API_SECRET) {
    throw new Error('Cloudinary credentials are not configured in your server/.env file. Please add CLOUDINARY_CLOUD_NAME, CLOUDINARY_API_KEY, and CLOUDINARY_API_SECRET.');
  }
};

/**
 * Upload a buffer/stream to Cloudinary
 * @param {Buffer} fileBuffer - File buffer
 * @param {string} folder - Cloudinary folder
 * @returns {Promise<object>} Upload result
 */
const uploadToCloudinary = (fileBuffer, folder = 'd-store') => {
  try {
    checkConfig();
  } catch (error) {
    return Promise.reject(error);
  }

  return new Promise((resolve, reject) => {
    const uploadStream = cloudinary.uploader.upload_stream(
      {
        folder,
        resource_type: 'auto',
      },
      (error, result) => {
        if (error) reject(error);
        else resolve(result);
      }
    );
    uploadStream.end(fileBuffer);
  });
};

/**
 * Delete an image from Cloudinary by public_id
 * @param {string} publicId - Cloudinary public ID
 */
const deleteFromCloudinary = async (publicId) => {
  checkConfig();
  return await cloudinary.uploader.destroy(publicId);
};

module.exports = { cloudinary, uploadToCloudinary, deleteFromCloudinary };

