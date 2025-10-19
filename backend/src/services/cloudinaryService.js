const cloudinary = require('../config/cloudinary');
const streamifier = require('streamifier');

/**
 * Upload image buffer to Cloudinary
 * @param {Buffer} fileBuffer - Image file buffer from multer
 * @param {String} folder - Cloudinary folder name (e.g., 'products')
 * @returns {Object} - { url, publicId }
 */
const uploadToCloudinary = (fileBuffer, folder = 'products') => {
  return new Promise((resolve, reject) => {
    const uploadStream = cloudinary.uploader.upload_stream(
      {
        folder: folder,
        resource_type: 'auto',
        transformation: [
          { width: 1000, height: 1000, crop: 'limit' }, // Max dimensions
          { quality: 'auto' }, // Auto optimize quality
          { fetch_format: 'auto' } // Auto format (WebP if supported)
        ]
      },
      (error, result) => {
        if (error) {
          reject(error);
        } else {
          resolve({
            url: result.secure_url,
            publicId: result.public_id
          });
        }
      }
    );

    streamifier.createReadStream(fileBuffer).pipe(uploadStream);
  });
};

/**
 * Delete image from Cloudinary
 * @param {String} publicId - Cloudinary public ID
 */
const deleteFromCloudinary = async (publicId) => {
  try {
    await cloudinary.uploader.destroy(publicId);
    return { success: true };
  } catch (error) {
    throw new Error('Failed to delete image from Cloudinary');
  }
};

module.exports = {
  uploadToCloudinary,
  deleteFromCloudinary
};