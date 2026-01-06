// backend/src/models/productImageModel.js
const supabase = require('../config/supabaseClient');

const ProductImageModel = {
  /**
   * Get all images for a product
   */
  getImagesByProductId: async (productId) => {
    const { data, error } = await supabase
      .from('Product_images')
      .select('*')
      .eq('product_id', productId)
      .order('display_order', { ascending: true });

    if (error) throw error;
    return data;
  },

  /**
   * Get single image by ID
   */
  getImageById: async (imageId) => {
    const { data, error } = await supabase
      .from('Product_images')
      .select('*')
      .eq('id', imageId)
      .single();

    if (error) throw error;
    return data;
  },

  /**
   * Add multiple images
   */
  addImages: async (productId, imagesData) => {
    const imagesToInsert = imagesData.map(img => ({
      product_id: productId,
      img_url: img.img_url,
      display_order: img.display_order,
      is_primary: img.is_primary
    }));

    const { data, error } = await supabase
      .from('Product_images')
      .insert(imagesToInsert)
      .select();

    if (error) throw error;
    return data;
  },

  /**
   * Delete image
   */
  deleteImage: async (imageId, productId) => {
    const { error } = await supabase
      .from('Product_images')
      .delete()
      .eq('id', imageId)
      .eq('product_id', productId);

    if (error) throw error;
    return true;
  },

  /**
   * Delete all images for product
   */
  deleteAllByProductId: async (productId) => {
    const { error } = await supabase
      .from('Product_images')
      .delete()
      .eq('product_id', productId);

    if (error) throw error;
    return true;
  },

  /**
   * Set image as primary
   */
  setPrimaryImage: async (productId, imageId) => {
    // Unset all primary images for this product
    await supabase
      .from('Product_images')
      .update({ is_primary: false })
      .eq('product_id', productId);

    // Set new primary
    const { data, error } = await supabase
      .from('Product_images')
      .update({ is_primary: true })
      .eq('id', imageId)
      .eq('product_id', productId)
      .select()
      .single();

    if (error) {
      if (error.code === 'PGRST116') throw new Error('IMAGE_NOT_FOUND');
      throw error;
    }

    return data;
  },

  /**
   * Reorder images
   */
  reorderImages: async (productId, orderArray) => {
    const updates = orderArray.map(({ image_id, display_order }) =>
      supabase
        .from('Product_images')
        .update({ display_order })
        .eq('id', image_id)
        .eq('product_id', productId)
    );

    await Promise.all(updates);
    return true;
  },

  /**
   * Check if product has primary image
   */
  hasPrimaryImage: async (productId) => {
    const { data, error } = await supabase
      .from('Product_images')
      .select('id')
      .eq('product_id', productId)
      .eq('is_primary', true)
      .single();

    return !!data;
  }
};

module.exports = ProductImageModel;