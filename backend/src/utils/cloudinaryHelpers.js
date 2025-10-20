// backend/src/utils/cloudinaryHelpers.js

/**
 * Extract Cloudinary public ID from full URL
 * Example: https://res.cloudinary.com/drmza0a9d/image/upload/v1234567890/products/abc123.jpg
 * Returns: products/abc123
 */
const extractPublicIdFromUrl = (cloudinaryUrl) => {
  if (!cloudinaryUrl || typeof cloudinaryUrl !== 'string') {
    return null;
  }

  try {
    // Pattern: /upload/v{version}/{publicId}.{extension}
    const matches = cloudinaryUrl.match(/\/upload\/(?:v\d+\/)?(.+)\.\w+$/);
    if (matches && matches[1]) {
      return matches[1];
    }

    // Alternative pattern without version
    const altMatches = cloudinaryUrl.match(/\/upload\/(.+)\.\w+$/);
    if (altMatches && altMatches[1]) {
      return altMatches[1];
    }

    return null;
  } catch (error) {
    console.error('Error extracting public ID:', error);
    return null;
  }
};

/**
 * Validate if URL is from Cloudinary domain
 */
const validateImageUrl = (url) => {
  if (!url || typeof url !== 'string') {
    return false;
  }

  try {
    const urlObj = new URL(url);
    return urlObj.hostname.includes('cloudinary.com');
  } catch (error) {
    return false;
  }
};

/**
 * Generate optimized Cloudinary URL with transformations
 * @param {string} publicId - Cloudinary public ID
 * @param {object} transformations - Transformation options
 * @returns {string} - Optimized Cloudinary URL
 */
const getOptimizedUrl = (publicId, transformations = {}) => {
  const cloudName = process.env.CLOUDINARY_CLOUD_NAME;
  
  if (!cloudName || !publicId) {
    return null;
  }

  // Default transformations
  const defaults = {
    quality: 'auto',
    fetch_format: 'auto',
    width: 800
  };

  const options = { ...defaults, ...transformations };
  
  // Build transformation string
  const transformParts = [];
  if (options.width) transformParts.push(`w_${options.width}`);
  if (options.height) transformParts.push(`h_${options.height}`);
  if (options.quality) transformParts.push(`q_${options.quality}`);
  if (options.fetch_format) transformParts.push(`f_${options.fetch_format}`);
  if (options.crop) transformParts.push(`c_${options.crop}`);

  const transformString = transformParts.join(',');

  return `https://res.cloudinary.com/${cloudName}/image/upload/${transformString}/${publicId}`;
};

/**
 * Get thumbnail URL (small size)
 */
const getThumbnailUrl = (publicId) => {
  return getOptimizedUrl(publicId, {
    width: 200,
    height: 200,
    crop: 'fill',
    quality: 'auto'
  });
};

/**
 * Get product card URL (medium size)
 */
const getProductCardUrl = (publicId) => {
  return getOptimizedUrl(publicId, {
    width: 400,
    height: 400,
    crop: 'fill',
    quality: 'auto'
  });
};

/**
 * Get full product image URL (large size)
 */
const getFullImageUrl = (publicId) => {
  return getOptimizedUrl(publicId, {
    width: 1000,
    quality: 'auto'
  });
};

module.exports = {
  extractPublicIdFromUrl,
  validateImageUrl,
  getOptimizedUrl,
  getThumbnailUrl,
  getProductCardUrl,
  getFullImageUrl
};