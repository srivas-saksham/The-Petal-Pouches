// backend/src/routes/products.js
const express = require('express');
const router = express.Router();
const upload = require('../config/multer');
const { verifyAdminToken } = require('../middleware/adminAuth'); // ⭐ ADD THIS
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
 * @route   GET /api/products
 * @desc    Get all products with optional filters
 * @access  Public
 * @returns Array of products with images
 */
router.get('/', getAllProducts);

/**
 * @route   GET /api/products/:id
 * @desc    Get single product details
 * @access  Public
 * @returns Product object with images array
 */
router.get('/:id', getProductById);

// ========================================
// ADMIN ROUTES (Product Management)
// ⭐ SECURITY: All admin routes protected
// ========================================

/**
 * @route   POST /api/products/admin
 * @desc    Create new product with images
 * @access  Private (Admin only)
 * @body    Form-data with images[] and product fields
 */
router.post('/admin', verifyAdminToken, upload.array('images', 8), createProduct);

/**
 * @route   PUT /api/products/admin/:id
 * @desc    Update existing product
 * @access  Private (Admin only)
 * @body    Form-data with optional new images[]
 */
router.put('/admin/:id', verifyAdminToken, upload.array('images', 8), updateProduct);

/**
 * @route   DELETE /api/products/admin/:id
 * @desc    Delete product (CASCADE deletes variants and images)
 * @access  Private (Admin only)
 */
router.delete('/admin/:id', verifyAdminToken, deleteProduct);

/**
 * @route   POST /api/products/admin/:id/duplicate
 * @desc    Duplicate existing product with all images
 * @access  Private (Admin only)
 */
router.post('/admin/:id/duplicate', verifyAdminToken, async (req, res) => {
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
      img_url: original.img_url,
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

    // ✅ Duplicate images from original product
    const { data: originalImages, error: imagesError } = await supabase
      .from('Product_images')
      .select('*')
      .eq('product_id', id)
      .order('display_order', { ascending: true });

    if (!imagesError && originalImages && originalImages.length > 0) {
      const duplicateImages = originalImages.map(img => ({
        product_id: duplicate.id,
        img_url: img.img_url,
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
    console.error('❌ Duplicate product error:', error);
    res.status(500).json({ 
      success: false,
      message: 'Failed to duplicate product',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
});

// ========================================
// IMAGE-SPECIFIC ADMIN ROUTES
// ⭐ SECURITY: All image management protected
// ========================================

/**
 * @route   POST /api/products/admin/:id/images
 * @desc    Add images to existing product
 * @access  Private (Admin only)
 */
router.post('/admin/:id/images', verifyAdminToken, upload.array('images', 8), addProductImages);

/**
 * @route   DELETE /api/products/admin/:id/images/:imageId
 * @desc    Delete single image from product
 * @access  Private (Admin only)
 */
router.delete('/admin/:id/images/:imageId', verifyAdminToken, deleteProductImage);

/**
 * @route   PATCH /api/products/admin/:id/images/:imageId/primary
 * @desc    Set image as primary
 * @access  Private (Admin only)
 */
router.patch('/admin/:id/images/:imageId/primary', verifyAdminToken, setPrimaryProductImage);

// ========================================
// ANALYTICS & STATS ROUTES
// ⭐ SECURITY: Admin-only analytics
// ========================================

/**
 * @route   GET /api/products/stats
 * @desc    Get product statistics
 * @access  Private (Admin only)
 */
router.get('/stats', verifyAdminToken, getProductStats);

/**
 * @route   GET /api/products/analytics/inventory
 * @desc    Get comprehensive inventory analytics
 * @access  Private (Admin only)
 */
router.get('/analytics/inventory', verifyAdminToken, getInventoryAnalytics);

module.exports = router;