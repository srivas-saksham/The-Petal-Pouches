// backend/src/controllers/bundleController.js - MODIFIED

const supabase = require('../config/supabaseClient');
const cloudinary = require('../config/cloudinary');
const streamifier = require('streamifier');
const BundleModel = require('../models/bundleModel');

/**
 * Bundle Controller
 * Handles bundle operations with items
 */

// ========================================
// PUBLIC ROUTES (Customer-facing)
// ========================================

/**
 * Get all bundles with pagination and filters
 * GET /api/bundles
 */
const getAllBundles = async (req, res) => {
  try {
    const {
      page = 1,
      limit = 12,
      sort = 'created_at',
      active = 'true',
      search = '',
      min_price = '',
      max_price = ''
    } = req.query;

    let result;

    // Handle search
    if (search) {
      result = await BundleModel.searchBundles(search, {
        page: parseInt(page),
        limit: parseInt(limit)
      });
    }
    // Handle price range
    else if (min_price || max_price) {
      result = await BundleModel.getBundlesByPriceRange(
        min_price ? parseInt(min_price) : null,
        max_price ? parseInt(max_price) : null,
        {
          page: parseInt(page),
          limit: parseInt(limit)
        }
      );
    }
    // Default: get all bundles
    else {
      result = await BundleModel.getAllBundles({
        page: parseInt(page),
        limit: parseInt(limit),
        sort,
        active_only: active === 'true'
      });
    }

    res.status(200).json({
      success: true,
      data: result.bundles,
      metadata: {
        currentPage: result.page,
        totalPages: result.totalPages,
        total: result.total,
        hasMore: result.page < result.totalPages
      }
    });

  } catch (error) {
    console.error('❌ Get all bundles error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch bundles',
      error: error.message
    });
  }
};

/**
 * Get single bundle by ID with basic info only
 * GET /api/bundles/:id
 */
const getBundleById = async (req, res) => {
  try {
    const { id } = req.params;

    const bundle = await BundleModel.getBundleById(id);

    res.status(200).json({
      success: true,
      data: bundle
    });

  } catch (error) {
    console.error('❌ Get bundle error:', error);

    if (error.code === 'BUNDLE_NOT_FOUND') {
      return res.status(404).json({
        success: false,
        message: 'Bundle not found'
      });
    }

    res.status(500).json({
      success: false,
      message: 'Failed to fetch bundle',
      error: error.message
    });
  }
};

/**
 * Get bundle with all items and product details
 * GET /api/bundles/:id/details
 */
const getBundleDetails = async (req, res) => {
  try {
    const { id } = req.params;

    const bundleWithItems = await BundleModel.getBundleWithItems(id);

    res.status(200).json({
      success: true,
      data: bundleWithItems
    });

  } catch (error) {
    console.error('❌ Get bundle details error:', error);

    if (error.code === 'BUNDLE_NOT_FOUND') {
      return res.status(404).json({
        success: false,
        message: 'Bundle not found'
      });
    }

    res.status(500).json({
      success: false,
      message: 'Failed to fetch bundle details',
      error: error.message
    });
  }
};

/**
 * Check bundle stock availability
 * GET /api/bundles/:id/stock
 */
const getBundleStock = async (req, res) => {
  try {
    const { id } = req.params;

    const stockStatus = await BundleModel.checkBundleStock(id);

    res.status(200).json({
      success: true,
      data: stockStatus
    });

  } catch (error) {
    console.error('❌ Check bundle stock error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to check stock',
      error: error.message
    });
  }
};

// ========================================
// ADMIN ROUTES (Bundle Management)
// ========================================

/**
 * Create new bundle
 * POST /api/bundles/admin
 */
const createBundle = async (req, res) => {
  try {
    const { title, description, price, stock_limit, items } = req.body;
    let img_url = null;

    // Validation
    if (!title || !price) {
      return res.status(400).json({
        success: false,
        message: 'Title and price are required'
      });
    }

    // Parse items if string
    let bundleItems = items;
    if (typeof items === 'string') {
      try {
        bundleItems = JSON.parse(items);
      } catch (e) {
        return res.status(400).json({
          success: false,
          message: 'Invalid items format. Must be valid JSON array.'
        });
      }
    }

    if (!bundleItems || !Array.isArray(bundleItems) || bundleItems.length === 0) {
      return res.status(400).json({
        success: false,
        message: 'At least one item is required'
      });
    }

    // Upload image to Cloudinary if provided
    if (req.file) {
      const uploadStream = cloudinary.uploader.upload_stream(
        { folder: 'bundles' },
        (error, result) => {
          if (error) throw error;
        }
      );

      const uploadResult = await new Promise((resolve, reject) => {
        const stream = streamifier.createReadStream(req.file.buffer);
        stream.pipe(uploadStream);
        uploadStream.on('finish', () => resolve(uploadStream));
        uploadStream.on('error', reject);
      });

      img_url = uploadResult.url;
    }

    // Insert bundle
    const { data: bundle, error: bundleError } = await supabase
      .from('Bundles')
      .insert([{
        title: title.trim(),
        description: description?.trim() || null,
        price: parseInt(price),
        stock_limit: stock_limit ? parseInt(stock_limit) : null,
        img_url,
        is_active: true
      }])
      .select()
      .single();

    if (bundleError) throw bundleError;

    // Insert bundle items
    const itemsToInsert = bundleItems.map(item => ({
      bundle_id: bundle.id,
      product_id: item.product_id || null,
      product_variant_id: item.variant_id || null,
      quantity: parseInt(item.quantity) || 1
    }));

    const { error: itemsError } = await supabase
      .from('Bundle_items')
      .insert(itemsToInsert);

    if (itemsError) throw itemsError;

    console.log(`✅ Bundle created: ${bundle.id}`);

    res.status(201).json({
      success: true,
      message: 'Bundle created successfully',
      data: bundle
    });

  } catch (error) {
    console.error('❌ Create bundle error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to create bundle',
      error: error.message
    });
  }
};

/**
 * Update existing bundle
 * PUT /api/bundles/admin/:id
 */
const updateBundle = async (req, res) => {
  try {
    const { id } = req.params;
    const { title, description, price, stock_limit, items } = req.body;

    // Get existing bundle
    const { data: existingBundle, error: fetchError } = await supabase
      .from('Bundles')
      .select('*')
      .eq('id', id)
      .single();

    if (fetchError || !existingBundle) {
      return res.status(404).json({
        success: false,
        message: 'Bundle not found'
      });
    }

    let img_url = existingBundle.img_url;

    // Upload new image if provided
    if (req.file) {
      // Delete old image from Cloudinary
      if (img_url) {
        const publicId = img_url.split('/').pop().split('.')[0];
        await cloudinary.uploader.destroy(`bundles/${publicId}`);
      }

      const uploadStream = cloudinary.uploader.upload_stream(
        { folder: 'bundles' },
        (error, result) => {
          if (error) throw error;
        }
      );

      const uploadResult = await new Promise((resolve, reject) => {
        const stream = streamifier.createReadStream(req.file.buffer);
        stream.pipe(uploadStream);
        uploadStream.on('finish', () => resolve(uploadStream));
        uploadStream.on('error', reject);
      });

      img_url = uploadResult.url;
    }

    // Build update object
    const updateData = {
      updated_at: new Date().toISOString()
    };

    if (title) updateData.title = title.trim();
    if (description !== undefined) updateData.description = description?.trim() || null;
    if (price) updateData.price = parseInt(price);
    if (stock_limit !== undefined) updateData.stock_limit = stock_limit ? parseInt(stock_limit) : null;
    if (img_url !== existingBundle.img_url) updateData.img_url = img_url;

    // Update bundle
    const { data: bundle, error: updateError } = await supabase
      .from('Bundles')
      .update(updateData)
      .eq('id', id)
      .select()
      .single();

    if (updateError) throw updateError;

    // Update items if provided
    if (items) {
      let bundleItems = items;
      if (typeof items === 'string') {
        bundleItems = JSON.parse(items);
      }

      // Delete existing items
      await supabase
        .from('Bundle_items')
        .delete()
        .eq('bundle_id', id);

      // Insert new items
      const itemsToInsert = bundleItems.map(item => ({
        bundle_id: id,
        product_id: item.product_id || null,
        product_variant_id: item.variant_id || null,
        quantity: parseInt(item.quantity) || 1
      }));

      const { error: itemsError } = await supabase
        .from('Bundle_items')
        .insert(itemsToInsert);

      if (itemsError) throw itemsError;
    }

    console.log(`✅ Bundle updated: ${id}`);

    res.status(200).json({
      success: true,
      message: 'Bundle updated successfully',
      data: bundle
    });

  } catch (error) {
    console.error('❌ Update bundle error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to update bundle',
      error: error.message
    });
  }
};

/**
 * Delete bundle
 * DELETE /api/bundles/admin/:id
 */
const deleteBundle = async (req, res) => {
  try {
    const { id } = req.params;

    // Get bundle
    const { data: bundle, error: fetchError } = await supabase
      .from('Bundles')
      .select('img_url')
      .eq('id', id)
      .single();

    if (fetchError || !bundle) {
      return res.status(404).json({
        success: false,
        message: 'Bundle not found'
      });
    }

    // Delete image from Cloudinary
    if (bundle.img_url) {
      const publicId = bundle.img_url.split('/').pop().split('.')[0];
      await cloudinary.uploader.destroy(`bundles/${publicId}`);
    }

    // Delete bundle (CASCADE will delete items)
    const { error: deleteError } = await supabase
      .from('Bundles')
      .delete()
      .eq('id', id);

    if (deleteError) throw deleteError;

    console.log(`✅ Bundle deleted: ${id}`);

    res.status(200).json({
      success: true,
      message: 'Bundle deleted successfully'
    });

  } catch (error) {
    console.error('❌ Delete bundle error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to delete bundle',
      error: error.message
    });
  }
};

/**
 * Toggle bundle active status
 * PATCH /api/bundles/admin/:id/toggle
 */
const toggleBundleStatus = async (req, res) => {
  try {
    const { id } = req.params;

    // Get current status
    const { data: bundle, error: fetchError } = await supabase
      .from('Bundles')
      .select('is_active')
      .eq('id', id)
      .single();

    if (fetchError || !bundle) {
      return res.status(404).json({
        success: false,
        message: 'Bundle not found'
      });
    }

    // Toggle status
    const { data: updatedBundle, error: updateError } = await supabase
      .from('Bundles')
      .update({
        is_active: !bundle.is_active,
        updated_at: new Date().toISOString()
      })
      .eq('id', id)
      .select()
      .single();

    if (updateError) throw updateError;

    console.log(`✅ Bundle ${id} toggled to ${updatedBundle.is_active ? 'active' : 'inactive'}`);

    res.status(200).json({
      success: true,
      message: `Bundle ${updatedBundle.is_active ? 'activated' : 'deactivated'} successfully`,
      data: updatedBundle
    });

  } catch (error) {
    console.error('❌ Toggle bundle status error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to toggle bundle status',
      error: error.message
    });
  }
};

/**
 * Duplicate bundle
 * POST /api/bundles/admin/:id/duplicate
 */
const duplicateBundle = async (req, res) => {
  try {
    const { id } = req.params;

    // Get original bundle
    const originalBundle = await BundleModel.getBundleWithItems(id);

    // Create duplicate
    const { data: newBundle, error: bundleError } = await supabase
      .from('Bundles')
      .insert([{
        title: `${originalBundle.title} (Copy)`,
        description: originalBundle.description,
        price: originalBundle.price,
        stock_limit: originalBundle.stock_limit,
        img_url: originalBundle.img_url,
        is_active: false
      }])
      .select()
      .single();

    if (bundleError) throw bundleError;

    // Duplicate items
    const itemsToInsert = originalBundle.items.map(item => ({
      bundle_id: newBundle.id,
      product_id: item.product_id,
      product_variant_id: item.product_variant_id,
      quantity: item.quantity
    }));

    const { error: itemsError } = await supabase
      .from('Bundle_items')
      .insert(itemsToInsert);

    if (itemsError) throw itemsError;

    console.log(`✅ Bundle duplicated: ${newBundle.id}`);

    res.status(201).json({
      success: true,
      message: 'Bundle duplicated successfully',
      data: newBundle
    });

  } catch (error) {
    console.error('❌ Duplicate bundle error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to duplicate bundle',
      error: error.message
    });
  }
};

module.exports = {
  getAllBundles,
  getBundleById,
  getBundleDetails,
  getBundleStock,
  createBundle,
  updateBundle,
  deleteBundle,
  toggleBundleStatus,
  duplicateBundle
};