// backend/src/services/cloudinaryService.js
// UPDATED: Added batch upload and delete functions for multiple bundle images

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

// ==================== NEW: BATCH OPERATIONS ====================

/**
 * Upload multiple images to Cloudinary
 * @param {Array} fileBuffers - Array of image file buffers from multer
 * @param {String} folder - Cloudinary folder name (e.g., 'bundles')
 * @returns {Promise<Array>} - Array of { url, publicId, index, success, error? }
 */
const uploadMultipleToCloudinary = async (fileBuffers, folder = 'bundles') => {
  try {
    if (!fileBuffers || fileBuffers.length === 0) {
      return [];
    }

    console.log(`[Cloudinary] Uploading ${fileBuffers.length} images to folder: ${folder}`);

    const uploadPromises = fileBuffers.map((buffer, index) =>
      uploadToCloudinary(buffer, folder)
        .then(result => ({
          ...result,
          index,
          success: true
        }))
        .catch(error => ({
          index,
          success: false,
          error: error.message
        }))
    );

    const results = await Promise.all(uploadPromises);

    const successCount = results.filter(r => r.success).length;
    const failureCount = results.filter(r => !r.success).length;

    console.log(`[Cloudinary] Upload complete: ${successCount} success, ${failureCount} failed`);

    // If any failed, rollback successful uploads
    if (failureCount > 0) {
      console.warn('[Cloudinary] Some uploads failed, rolling back successful uploads...');
      const successfulUploads = results.filter(r => r.success);
      
      if (successfulUploads.length > 0) {
        await deleteMultipleFromCloudinary(
          successfulUploads.map(r => r.publicId)
        );
      }

      throw new Error(`Failed to upload ${failureCount} images`);
    }

    return results;

  } catch (error) {
    console.error('[Cloudinary] Batch upload error:', error);
    throw error;
  }
};

/**
 * Delete multiple images from Cloudinary
 * @param {Array} publicIds - Array of Cloudinary public IDs
 * @returns {Promise<Object>} - { success: number, failed: number, errors: Array }
 */
const deleteMultipleFromCloudinary = async (publicIds) => {
  try {
    if (!publicIds || publicIds.length === 0) {
      return { success: 0, failed: 0, errors: [] };
    }

    console.log(`[Cloudinary] Deleting ${publicIds.length} images`);

    const deletePromises = publicIds.map(publicId =>
      cloudinary.uploader.destroy(publicId)
        .then(() => ({ publicId, success: true }))
        .catch(error => ({
          publicId,
          success: false,
          error: error.message
        }))
    );

    const results = await Promise.all(deletePromises);

    const successCount = results.filter(r => r.success).length;
    const failedCount = results.filter(r => !r.success).length;
    const errors = results.filter(r => !r.success);

    console.log(`[Cloudinary] Deletion complete: ${successCount} success, ${failedCount} failed`);

    if (failedCount > 0) {
      console.warn('[Cloudinary] Failed deletions:', errors);
    }

    return {
      success: successCount,
      failed: failedCount,
      errors
    };

  } catch (error) {
    console.error('[Cloudinary] Batch delete error:', error);
    throw error;
  }
};

/**
 * Upload single file from multer file object
 * Convenience wrapper for handling multer file objects
 * @param {Object} file - Multer file object with buffer
 * @param {String} folder - Cloudinary folder
 * @returns {Promise<Object>} - { url, publicId }
 */
const uploadFileToCloudinary = async (file, folder = 'bundles') => {
  if (!file || !file.buffer) {
    throw new Error('Invalid file object - buffer is required');
  }

  return await uploadToCloudinary(file.buffer, folder);
};

/**
 * Upload multiple files from multer file array
 * Convenience wrapper for handling multer file array
 * @param {Array} files - Array of multer file objects
 * @param {String} folder - Cloudinary folder
 * @returns {Promise<Array>} - Array of upload results
 */
const uploadFilesToCloudinary = async (files, folder = 'bundles') => {
  if (!files || files.length === 0) {
    return [];
  }

  const buffers = files.map(file => file.buffer);
  return await uploadMultipleToCloudinary(buffers, folder);
};

module.exports = {
  uploadToCloudinary,
  deleteFromCloudinary,
  uploadMultipleToCloudinary,    // NEW
  deleteMultipleFromCloudinary,  // NEW
  uploadFileToCloudinary,        // NEW: Convenience function
  uploadFilesToCloudinary        // NEW: Convenience function
};