// backend/src/routes/products.js
const express = require('express');
const router = express.Router();
const upload = require('../config/multer');
const { 
  getAllProducts, 
  getProductById,
  createProduct,
  updateProduct,
  deleteProduct,
  getProductStats,
  getInventoryAnalytics,
  addProductImages,
  deleteProductImage,
  setPrimaryProductImage
} = require('../controllers/productController');
const supabase = require('../config/supabaseClient');

// ========================================
// PUBLIC ROUTES (Customer-facing)
// ========================================

/**
 * GET /api/products
 * Get all products with optional filters
 * NOW RETURNS: images array with each product
 */
router.get('/', getAllProducts);

/**
 * GET /api/products/:id
 * Get single product details
 * NOW RETURNS: images array included
 */
router.get('/:id', getProductById);

// ========================================
// ADMIN ROUTES (Product Management)
// ========================================

/**
 * POST /api/products/admin
 * Create new product
 * UPDATED: Now accepts multiple images
 * 
 * Content-Type: multipart/form-data
 * 
 * Form Fields:
 *   - images: file[] (NEW: array of images, 1-8 files)
 *   - image: file (BACKWARD COMPATIBLE: single image still works)
 *   - title: string (required)
 *   - description: string (required)
 *   - price: number (required)
 *   - cost_price: number (optional)
 *   - stock: number (required)
 *   - sku: string (required)
 *   - category_id: uuid (optional)
 *   - has_variants: boolean (optional)
 * 
 * First image becomes primary by default
 */
router.post('/admin', upload.array('images', 8), createProduct);

/**
 * PUT /api/products/admin/:id
 * Update existing product
 * UPDATED: Now accepts multiple new images
 * 
 * Form Fields:
 *   - images: file[] (NEW: add new images)
 *   - image: file (BACKWARD COMPATIBLE: single image)
 *   - delete_image_ids: JSON string (array of image IDs to delete)
 *   - ... other fields same as POST
 */
router.put('/admin/:id', upload.array('images', 8), updateProduct);

/**
 * DELETE /api/products/admin/:id
 * Delete product (CASCADE deletes variants and product_images)
 * UPDATED: Now deletes all images from Cloudinary
 */
router.delete('/admin/:id', deleteProduct);

/**
 * POST /api/products/admin/:id/duplicate
 * Duplicate existing product
 * UPDATED: Preserves all images from original product
 */
router.post('/admin/:id/duplicate', async (req, res) => {
  try {
    const { id } = req.params;
    
    // Get original product
    const { data: original, error: fetchError } = await supabase
      .from('Products')
      .select('*')
      .eq('id', id)
      .single();

    if (fetchError || !original) {
      return res.status(404).json({ 
        success: false,
        message: 'Product not found' 
      });
    }
    
    // Create duplicate product data
    const duplicateData = {
      title: `${original.title} (Copy)`,
      description: original.description,
      price: original.price,
      cost_price: original.cost_price,
      stock: original.stock,
      sku: `${original.sku}-COPY-${Date.now()}`,
      category_id: original.category_id,
      img_url: original.img_url, // Will be updated after image duplication
      has_variants: false, // Don't duplicate variants
      margin_percent: original.margin_percent,
      markup_percent: original.markup_percent
    };

    // Insert duplicate product
    const { data: duplicate, error: createError } = await supabase
      .from('Products')
      .insert([duplicateData])
      .select()
      .single();

    if (createError) throw createError;

    // ✅ NEW: Duplicate images from original product
    const { data: originalImages, error: imagesError } = await supabase
      .from('Product_images')
      .select('*')
      .eq('product_id', id)
      .order('display_order', { ascending: true });

    if (!imagesError && originalImages && originalImages.length > 0) {
      const duplicateImages = originalImages.map(img => ({
        product_id: duplicate.id,
        img_url: img.img_url, // Reuse same Cloudinary URLs
        display_order: img.display_order,
        is_primary: img.is_primary
      }));

      await supabase
        .from('Product_images')
        .insert(duplicateImages);

      console.log(`✅ Duplicated ${originalImages.length} images for product ${duplicate.id}`);
    }
    
    res.status(201).json({
      success: true,
      message: 'Product duplicated successfully',
      data: duplicate
    });
  } catch (error) {
    console.error('Duplicate product error:', error);
    res.status(500).json({ 
      success: false,
      message: error.message 
    });
  }
});

// ========================================
// NEW: IMAGE-SPECIFIC ADMIN ROUTES
// ========================================

/**
 * POST /api/products/admin/:id/images
 * Add images to existing product
 * Body (multipart): images[] - array of image files (max 8 total)
 */
router.post('/admin/:id/images', upload.array('images', 8), addProductImages);

/**
 * DELETE /api/products/admin/:id/images/:imageId
 * Delete single image from product
 * Automatically sets new primary if deleted image was primary
 */
router.delete('/admin/:id/images/:imageId', deleteProductImage);

/**
 * PATCH /api/products/admin/:id/images/:imageId/primary
 * Set image as primary
 * Automatically unsets other primary images
 */
router.patch('/admin/:id/images/:imageId/primary', setPrimaryProductImage);

// ========================================
// ANALYTICS & STATS ROUTES
// ========================================

/**
 * GET /api/products/stats
 * Get product statistics (total, in stock, out of stock, price range)
 */
router.get('/stats', getProductStats);

/**
 * GET /api/products/analytics/inventory
 * Get comprehensive inventory analytics
 * (investment, revenue, profit, margins, category breakdown)
 */
router.get('/analytics/inventory', getInventoryAnalytics);

module.exports = router;