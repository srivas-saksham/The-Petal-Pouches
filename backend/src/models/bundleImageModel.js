// backend/src/models/bundleImageModel.js

const supabase = require('../config/supabaseClient');

/**
 * Bundle Image Model
 * Handles all Bundle_images table operations
 */
const BundleImageModel = {

  // ==================== CREATE OPERATIONS ====================

  /**
   * Add multiple images to a bundle
   * @param {string} bundleId - Bundle UUID
   * @param {Array} imagesData - Array of { img_url, display_order, is_primary }
   * @returns {Promise<Array>} Created image records
   */
  async addImages(bundleId, imagesData) {
    try {
      if (!imagesData || imagesData.length === 0) {
        throw new Error('No images data provided');
      }

      const insertData = imagesData.map((img, index) => ({
        bundle_id: bundleId,
        img_url: img.img_url,
        display_order: img.display_order !== undefined ? img.display_order : index,
        is_primary: img.is_primary || false,
        created_at: new Date().toISOString()
      }));

      const { data: images, error } = await supabase
        .from('Bundle_images')
        .insert(insertData)
        .select();

      if (error) throw error;

      console.log(`[BundleImageModel] Added ${images.length} images to bundle ${bundleId}`);
      return images || [];

    } catch (error) {
      console.error('[BundleImageModel] Error adding images:', error);
      throw error;
    }
  },

  /**
   * Add single image to bundle
   * @param {string} bundleId - Bundle UUID
   * @param {Object} imageData - { img_url, display_order?, is_primary? }
   * @returns {Promise<Object>} Created image record
   */
  async addSingleImage(bundleId, imageData) {
    try {
      const { data: image, error } = await supabase
        .from('Bundle_images')
        .insert([{
          bundle_id: bundleId,
          img_url: imageData.img_url,
          display_order: imageData.display_order || 0,
          is_primary: imageData.is_primary || false,
          created_at: new Date().toISOString()
        }])
        .select()
        .single();

      if (error) throw error;

      console.log(`[BundleImageModel] Added image ${image.id} to bundle ${bundleId}`);
      return image;

    } catch (error) {
      console.error('[BundleImageModel] Error adding single image:', error);
      throw error;
    }
  },

  // ==================== READ OPERATIONS ====================

  /**
   * Get all images for a bundle
   * @param {string} bundleId - Bundle UUID
   * @returns {Promise<Array>} Array of images ordered by display_order
   */
  async getImagesByBundleId(bundleId) {
    try {
      const { data: images, error } = await supabase
        .from('Bundle_images')
        .select('*')
        .eq('bundle_id', bundleId)
        .order('display_order', { ascending: true })
        .order('created_at', { ascending: true });

      if (error) throw error;

      return images || [];

    } catch (error) {
      console.error('[BundleImageModel] Error getting images:', error);
      throw error;
    }
  },

  /**
   * Get primary image for a bundle
   * @param {string} bundleId - Bundle UUID
   * @returns {Promise<Object|null>} Primary image or null
   */
  async getPrimaryImage(bundleId) {
    try {
      const { data: image, error } = await supabase
        .from('Bundle_images')
        .select('*')
        .eq('bundle_id', bundleId)
        .eq('is_primary', true)
        .single();

      if (error && error.code !== 'PGRST116') throw error;

      return image || null;

    } catch (error) {
      console.error('[BundleImageModel] Error getting primary image:', error);
      throw error;
    }
  },

  /**
   * Get single image by ID
   * @param {string} imageId - Image UUID
   * @returns {Promise<Object|null>} Image record or null
   */
  async getImageById(imageId) {
    try {
      const { data: image, error } = await supabase
        .from('Bundle_images')
        .select('*')
        .eq('id', imageId)
        .single();

      if (error && error.code !== 'PGRST116') throw error;

      return image || null;

    } catch (error) {
      console.error('[BundleImageModel] Error getting image by ID:', error);
      throw error;
    }
  },

  // ==================== UPDATE OPERATIONS ====================

  /**
   * Set image as primary (unsets other primary images for the bundle)
   * @param {string} bundleId - Bundle UUID
   * @param {string} imageId - Image UUID to set as primary
   * @returns {Promise<Object>} Updated image record
   */
  async setPrimaryImage(bundleId, imageId) {
    try {
      // First, verify the image belongs to this bundle
      const image = await this.getImageById(imageId);
      if (!image || image.bundle_id !== bundleId) {
        throw new Error('IMAGE_NOT_FOUND');
      }

      // Unset all primary flags for this bundle
      await supabase
        .from('Bundle_images')
        .update({ is_primary: false })
        .eq('bundle_id', bundleId)
        .eq('is_primary', true);

      // Set new primary
      const { data: updatedImage, error } = await supabase
        .from('Bundle_images')
        .update({ is_primary: true })
        .eq('id', imageId)
        .eq('bundle_id', bundleId)
        .select()
        .single();

      if (error) throw error;

      console.log(`[BundleImageModel] Set primary image ${imageId} for bundle ${bundleId}`);
      return updatedImage;

    } catch (error) {
      console.error('[BundleImageModel] Error setting primary image:', error);
      throw error;
    }
  },

  /**
   * Reorder images for a bundle
   * @param {string} bundleId - Bundle UUID
   * @param {Array} orderArray - Array of { image_id, display_order }
   * @returns {Promise<boolean>} Success status
   */
  async reorderImages(bundleId, orderArray) {
    try {
      if (!orderArray || orderArray.length === 0) {
        throw new Error('Order array is required');
      }

      // Update each image's display_order
      const updatePromises = orderArray.map(({ image_id, display_order }) =>
        supabase
          .from('Bundle_images')
          .update({ display_order })
          .eq('id', image_id)
          .eq('bundle_id', bundleId)
      );

      await Promise.all(updatePromises);

      console.log(`[BundleImageModel] Reordered ${orderArray.length} images for bundle ${bundleId}`);
      return true;

    } catch (error) {
      console.error('[BundleImageModel] Error reordering images:', error);
      throw error;
    }
  },

  // ==================== DELETE OPERATIONS ====================

  /**
   * Delete single image
   * @param {string} imageId - Image UUID
   * @param {string} bundleId - Bundle UUID (for verification)
   * @returns {Promise<Object>} Deleted image record
   */
  async deleteImage(imageId, bundleId) {
    try {
      const { data: deletedImage, error } = await supabase
        .from('Bundle_images')
        .delete()
        .eq('id', imageId)
        .eq('bundle_id', bundleId)
        .select()
        .single();

      if (error) {
        if (error.code === 'PGRST116') {
          throw new Error('IMAGE_NOT_FOUND');
        }
        throw error;
      }

      console.log(`[BundleImageModel] Deleted image ${imageId} from bundle ${bundleId}`);
      return deletedImage;

    } catch (error) {
      console.error('[BundleImageModel] Error deleting image:', error);
      throw error;
    }
  },

  /**
   * Delete all images for a bundle
   * @param {string} bundleId - Bundle UUID
   * @returns {Promise<Array>} Deleted image records
   */
  async deleteAllByBundleId(bundleId) {
    try {
      const { data: deletedImages, error } = await supabase
        .from('Bundle_images')
        .delete()
        .eq('bundle_id', bundleId)
        .select();

      if (error) throw error;

      const count = deletedImages ? deletedImages.length : 0;
      console.log(`[BundleImageModel] Deleted ${count} images for bundle ${bundleId}`);
      
      return deletedImages || [];

    } catch (error) {
      console.error('[BundleImageModel] Error deleting all images:', error);
      throw error;
    }
  },

  // ==================== UTILITY OPERATIONS ====================

  /**
   * Get image count for a bundle
   * @param {string} bundleId - Bundle UUID
   * @returns {Promise<number>} Count of images
   */
  async getImageCount(bundleId) {
    try {
      const { count, error } = await supabase
        .from('Bundle_images')
        .select('*', { count: 'exact', head: true })
        .eq('bundle_id', bundleId);

      if (error) throw error;

      return count || 0;

    } catch (error) {
      console.error('[BundleImageModel] Error counting images:', error);
      throw error;
    }
  },

  /**
   * Check if bundle has a primary image
   * @param {string} bundleId - Bundle UUID
   * @returns {Promise<boolean>} True if has primary image
   */
  async hasPrimaryImage(bundleId) {
    try {
      const { count, error } = await supabase
        .from('Bundle_images')
        .select('*', { count: 'exact', head: true })
        .eq('bundle_id', bundleId)
        .eq('is_primary', true);

      if (error) throw error;

      return count > 0;

    } catch (error) {
      console.error('[BundleImageModel] Error checking primary image:', error);
      throw error;
    }
  }

};

module.exports = BundleImageModel;