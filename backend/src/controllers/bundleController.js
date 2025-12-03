// backend/src/controllers/bundleController.js
// Complete Bundle Controller with all functionalities

const supabase = require('../config/supabaseClient');
const { uploadToCloudinary, deleteFromCloudinary } = require('../services/cloudinaryService');
const { extractPublicIdFromUrl } = require('../utils/cloudinaryHelpers');
const {
  calculateBundlePrice,
  calculateDiscountAndMarkup,
  validateBundleStock,
  validateBundleItems
} = require('../services/bundleHelpers');

// ========================================
// PUBLIC ROUTES (Customer-facing)
// ========================================

/**
 * Get all bundles with pagination, filters, and search
 * GET /api/bundles
 * 
 * FEATURES:
 * - Proper sort handling (price_asc, price_desc, etc.)
 * - Stock filtering (in_stock parameter)
 * - Price range filtering
 * - Search by title
 * - TAG FILTERING (NEW!) - filter by bundle tags
 * - Pagination with metadata
 */
const getAllBundles = async (req, res) => {
  try {
    const {
      active,
      page = 1,
      limit = 20,
      sort = 'created_at',
      order = 'desc',
      search = '',
      min_price = '',
      max_price = '',
      in_stock = '',
      tags = '' // NEW: tag filtering parameter
    } = req.query;

    console.log('📥 Get bundles request:', { 
      active, 
      page, 
      limit, 
      sort, 
      order, 
      search, 
      min_price, 
      max_price, 
      in_stock,
      tags // Log tags parameter
    });

    // Build base query
    let query = supabase
      .from('Bundles')
      .select(`
        *,
        Bundle_items (
          id,
          quantity,
          product_id,
          product_variant_id,
          Products (
            id,
            title,
            price,
            img_url,
            sku
          ),
          Product_variants (
            id,
            sku,
            attributes,
            price,
            stock,
            img_url
          )
        )
      `, { count: 'exact' });

    // Filter by active status
    if (active === 'true') {
      query = query.eq('is_active', true);
    }

    // ========================================
    // TAG FILTERING (NEW!)
    // ========================================
    if (tags && tags.trim()) {
      // Parse comma-separated tag names
      const tagArray = tags
        .split(',')
        .map(t => t.trim().toLowerCase())
        .filter(t => t.length > 0);

      console.log(`🏷️ Filtering by tags:`, tagArray);

      if (tagArray.length > 0) {
        // Filter bundles where the 'tags' JSONB array contains ANY of the specified tags
        // Using OR condition: bundle must have at least one of the tags
        
        // Build filter condition for JSONB array overlap
        // This requires checking if the bundle's tags array contains any of the specified tags
        let tagFilters = tagArray.map(tag => `tags.cs.["${tag}"]`).join(',');
        
        query = query.or(tagFilters);
        
        console.log(`✅ Applied tag filter - bundles must contain at least one of: ${tagArray.join(', ')}`);
      }
    }

    // Filter by stock availability
    if (in_stock === 'true') {
      // Exclude bundles with stock_limit = 0 or null
      query = query.not('stock_limit', 'is', null);
      query = query.gt('stock_limit', 0);
      console.log('📦 Filtering for in-stock bundles only');
    }

    // Search filter
    if (search && search.trim()) {
      query = query.ilike('title', `%${search.trim()}%`);
      console.log(`🔍 Searching for: ${search}`);
    }

    // Price range filters
    if (min_price) {
      query = query.gte('price', parseInt(min_price));
    }
    if (max_price) {
      query = query.lte('price', parseInt(max_price));
    }

    // Sorting with proper ascending/descending
    const validSorts = ['created_at', 'title', 'price', 'discount_percent', 'updated_at'];
    const sortField = validSorts.includes(sort) ? sort : 'created_at';
    
    // Determine sort order
    let ascending = order === 'asc';
    
    // Special handling for different sort types
    if (sortField === 'created_at' || sortField === 'updated_at') {
      // For dates, default to descending (newest first)
      ascending = order === 'asc' ? true : false;
    } else if (sortField === 'price') {
      // For price: ascending = low to high, descending = high to low
      ascending = order === 'asc' ? true : false;
    } else if (sortField === 'title') {
      // For title: ascending = A to Z
      ascending = true;
    } else if (sortField === 'discount_percent') {
      // For discount: descending = highest first
      ascending = false;
    }
    
    console.log(`🔄 Sorting by ${sortField} (${ascending ? 'ascending' : 'descending'})`);
    query = query.order(sortField, { ascending });

    // Pagination
    const pageNum = parseInt(page);
    const limitNum = parseInt(limit);
    const from = (pageNum - 1) * limitNum;
    const to = from + limitNum - 1;
    query = query.range(from, to);

    const { data: bundles, error, count } = await query;

    if (error) {
      console.error('❌ Query error:', error);
      throw error;
    }

    // Add stock status and product count for each bundle
    const bundlesWithExtras = (bundles || []).map(bundle => {
      const stockLimit = bundle.stock_limit;
      const isOutOfStock = stockLimit === 0 || stockLimit === null;
      
      return {
        ...bundle,
        product_count: bundle.Bundle_items?.length || 0,
        savings: bundle.original_price ? bundle.original_price - bundle.price : 0,
        stock_status: {
          in_stock: !isOutOfStock,
          stock_limit: stockLimit,
          is_low_stock: stockLimit !== null && stockLimit > 0 && stockLimit < 5
        }
      };
    });

    // Calculate metadata
    const totalPages = Math.ceil(count / limitNum);

    console.log(`✅ Returning ${bundlesWithExtras.length} bundles (page ${pageNum}/${totalPages})`);

    res.status(200).json({
      success: true,
      data: bundlesWithExtras,
      metadata: {
        totalCount: count,
        totalPages,
        currentPage: pageNum,
        limit: limitNum,
        hasMore: pageNum < totalPages
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
 * Get single bundle by ID with full details
 * GET /api/bundles/:id
 */
const getBundleById = async (req, res) => {
  try {
    const { id } = req.params;

    const { data: bundle, error } = await supabase
      .from('Bundles')
      .select(`
        *,
        Bundle_items (
          id,
          quantity,
          product_id,
          product_variant_id,
          Products (
            id,
            title,
            description,
            price,
            stock,
            img_url,
            sku,
            has_variants
          ),
          Product_variants (
            id,
            sku,
            attributes,
            price,
            stock,
            img_url
          )
        )
      `)
      .eq('id', id)
      .single();

    if (error) {
      if (error.code === 'PGRST116') {
        return res.status(404).json({
          success: false,
          message: 'Bundle not found'
        });
      }
      throw error;
    }

    // Add stock status
    const stockLimit = bundle.stock_limit;
    const isOutOfStock = stockLimit === 0 || stockLimit === null;
    
    // Calculate savings
    const savings = bundle.original_price ? bundle.original_price - bundle.price : 0;

    res.status(200).json({
      success: true,
      data: {
        ...bundle,
        savings,
        product_count: bundle.Bundle_items?.length || 0,
        stock_status: {
          in_stock: !isOutOfStock,
          stock_limit: stockLimit,
          is_low_stock: stockLimit !== null && stockLimit > 0 && stockLimit < 5
        }
      }
    });

  } catch (error) {
    console.error('❌ Get bundle error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch bundle',
      error: error.message
    });
  }
};

/**
 * Get bundle with detailed items (alternative endpoint)
 * GET /api/bundles/:id/details
 */
const getBundleDetails = async (req, res) => {
  try {
    const { id } = req.params;

    const { data: bundle, error } = await supabase
      .from('Bundles')
      .select(`
        *,
        Bundle_items (
          id,
          quantity,
          product_id,
          product_variant_id,
          Products (
            id,
            title,
            description,
            price,
            stock,
            img_url,
            sku,
            has_variants,
            category_id
          ),
          Product_variants (
            id,
            sku,
            attributes,
            price,
            stock,
            img_url
          )
        )
      `)
      .eq('id', id)
      .single();

    if (error) {
      if (error.code === 'PGRST116') {
        return res.status(404).json({
          success: false,
          message: 'Bundle not found'
        });
      }
      throw error;
    }

    // Add stock status
    const stockLimit = bundle.stock_limit;
    const isOutOfStock = stockLimit === 0 || stockLimit === null;
    
    // Calculate total savings
    const savings = bundle.original_price ? bundle.original_price - bundle.price : 0;

    res.status(200).json({
      success: true,
      data: {
        ...bundle,
        savings,
        product_count: bundle.Bundle_items?.length || 0,
        stock_status: {
          in_stock: !isOutOfStock,
          stock_limit: stockLimit,
          is_low_stock: stockLimit !== null && stockLimit > 0 && stockLimit < 5
        }
      }
    });

  } catch (error) {
    console.error('❌ Get bundle details error:', error);
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

    // First check bundle's stock_limit
    const { data: bundle, error: bundleError } = await supabase
      .from('Bundles')
      .select('stock_limit')
      .eq('id', id)
      .single();

    if (bundleError) throw bundleError;

    const stockLimit = bundle.stock_limit;
    const isOutOfStock = stockLimit === 0 || stockLimit === null;

    // If out of stock at bundle level, return immediately
    if (isOutOfStock) {
      return res.status(200).json({
        success: true,
        data: {
          available: false,
          stock_limit: stockLimit,
          message: 'Bundle is out of stock'
        }
      });
    }

    // Fetch bundle items to check individual product stock
    const { data: bundleItems, error } = await supabase
      .from('Bundle_items')
      .select('product_id, product_variant_id, quantity')
      .eq('bundle_id', id);

    if (error) throw error;

    if (!bundleItems || bundleItems.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Bundle not found or has no items'
      });
    }

    // Check stock availability of individual items
    const stockCheck = await validateBundleStock(bundleItems);

    res.status(200).json({
      success: true,
      data: {
        available: stockCheck.available && !isOutOfStock,
        stock_limit: stockLimit,
        items_stock: stockCheck.items_stock,
        out_of_stock: stockCheck.out_of_stock
      }
    });

  } catch (error) {
    console.error('❌ Get bundle stock error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to check bundle stock',
      error: error.message
    });
  }
};

// ========================================
// ADMIN ROUTES (Bundle Management)
// ========================================

/**
 * Create a new bundle
 * POST /api/bundles/admin
 */
const createBundle = async (req, res) => {
  try {
    const { title, description, price, stock_limit, items, tags } = req.body;

    // Validate required fields
    if (!title || !title.trim()) {
      return res.status(400).json({
        success: false,
        message: 'Bundle title is required'
      });
    }

    if (!price || price <= 0) {
      return res.status(400).json({
        success: false,
        message: 'Bundle price must be greater than 0'
      });
    }

    // Parse items if sent as JSON string
    let bundleItems;
    try {
      bundleItems = typeof items === 'string' ? JSON.parse(items) : items;
    } catch (error) {
      return res.status(400).json({
        success: false,
        message: 'Invalid items format. Must be valid JSON array.'
      });
    }

    // Validate bundle items
    const validation = validateBundleItems(bundleItems);
    if (!validation.valid) {
      return res.status(400).json({
        success: false,
        message: 'Bundle validation failed',
        errors: validation.errors
      });
    }

    // Parse and validate tags if provided
    let bundleTags = [];
    let primaryTag = null;
    
    if (tags) {
      try {
        // Parse tags JSON string
        bundleTags = typeof tags === 'string' ? JSON.parse(tags) : tags;
        
        // Validate it's an array
        if (!Array.isArray(bundleTags)) {
          return res.status(400).json({
            success: false,
            message: 'Tags must be an array'
          });
        }
        
        // Normalize tag names (lowercase, trim) and remove empty strings
        bundleTags = bundleTags
          .map(tag => tag.toLowerCase().trim())
          .filter(tag => tag.length > 0);
        
        // Set primary tag (first tag in array)
        primaryTag = bundleTags.length > 0 ? bundleTags[0] : null;
        
        console.log('📌 Parsed tags:', bundleTags, '| Primary tag:', primaryTag);
      } catch (error) {
        console.error('❌ Tags parsing error:', error);
        return res.status(400).json({
          success: false,
          message: 'Invalid tags format. Must be valid JSON array.'
        });
      }
    }

    // Calculate original price from items
    const { original_price, items_with_prices } = await calculateBundlePrice(bundleItems);

    // Calculate discount/markup percentages (can be positive or negative)
    const { discount_percent, markup_percent } = calculateDiscountAndMarkup(
      original_price,
      parseInt(price)
    );

    // Validate stock availability
    const stockCheck = await validateBundleStock(bundleItems);
    if (!stockCheck.available) {
      return res.status(400).json({
        success: false,
        message: 'Some items are out of stock',
        out_of_stock: stockCheck.out_of_stock
      });
    }

    // Upload bundle image to Cloudinary if provided
    let img_url = null;
    if (req.file) {
      const cloudinaryResult = await uploadToCloudinary(req.file.buffer, 'bundles');
      img_url = cloudinaryResult.url;
    }

    // Insert bundle into database
    const bundleData = {
      title: title.trim(),
      description: description?.trim() || null,
      price: parseInt(price),
      original_price,
      discount_percent: discount_percent !== null ? Math.round(discount_percent) : null,
      markup_percent: markup_percent !== null ? Math.round(markup_percent) : null,
      img_url,
      stock_limit: stock_limit ? parseInt(stock_limit) : null,
      tags: bundleTags.length > 0 ? bundleTags : [], // Store as JSONB array
      primary_tag: primaryTag, // Store primary tag (first tag)
      is_active: true
    };

    console.log('💾 Creating bundle with data:', {
      title: bundleData.title,
      tags: bundleData.tags,
      primary_tag: bundleData.primary_tag
    });

    const { data: bundle, error: bundleError } = await supabase
      .from('Bundles')
      .insert([bundleData])
      .select()
      .single();

    if (bundleError) {
      console.error('❌ Bundle insert error:', bundleError);
      // Rollback: Delete uploaded image if bundle creation fails
      if (img_url) {
        const publicId = extractPublicIdFromUrl(img_url);
        if (publicId) await deleteFromCloudinary(publicId);
      }
      throw bundleError;
    }

    // Insert bundle items
    const bundleItemsData = bundleItems.map(item => ({
      bundle_id: bundle.id,
      product_id: item.product_id,
      product_variant_id: item.variant_id || null,
      quantity: item.quantity || 1
    }));

    const { data: insertedItems, error: itemsError } = await supabase
      .from('Bundle_items')
      .insert(bundleItemsData)
      .select();

    if (itemsError) {
      console.error('❌ Bundle items insert error:', itemsError);
      // Rollback: Delete bundle and image if items insertion fails
      await supabase.from('Bundles').delete().eq('id', bundle.id);
      if (img_url) {
        const publicId = extractPublicIdFromUrl(img_url);
        if (publicId) await deleteFromCloudinary(publicId);
      }
      throw itemsError;
    }

    console.log(`✅ Bundle created successfully: ${bundle.id}`);
    console.log(`   Tags: ${bundle.tags?.join(', ') || 'none'}`);
    console.log(`   Primary tag: ${bundle.primary_tag || 'none'}`);

    res.status(201).json({
      success: true,
      message: 'Bundle created successfully',
      data: {
        ...bundle,
        items: insertedItems,
        savings: original_price - parseInt(price)
      }
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
    const { title, description, price, stock_limit, items, tags } = req.body;

    // Check if bundle exists
    const { data: existingBundle, error: fetchError } = await supabase
      .from('Bundles')
      .select('img_url, original_price, tags, primary_tag')
      .eq('id', id)
      .single();

    if (fetchError || !existingBundle) {
      return res.status(404).json({
        success: false,
        message: 'Bundle not found'
      });
    }

    console.log(`📝 Updating bundle: ${id}`);
    console.log(`   Current tags:`, existingBundle.tags);

    // Prepare update data
    const updateData = {};
    
    if (title) updateData.title = title.trim();
    if (description !== undefined) updateData.description = description?.trim() || null;
    if (stock_limit !== undefined) updateData.stock_limit = stock_limit ? parseInt(stock_limit) : null;

    // Handle tags update
    if (tags !== undefined) {
      try {
        let bundleTags = typeof tags === 'string' ? JSON.parse(tags) : tags;
        
        if (!Array.isArray(bundleTags)) {
          return res.status(400).json({
            success: false,
            message: 'Tags must be an array'
          });
        }
        
        // Normalize tag names
        bundleTags = bundleTags
          .map(tag => tag.toLowerCase().trim())
          .filter(tag => tag.length > 0);
        
        updateData.tags = bundleTags.length > 0 ? bundleTags : [];
        updateData.primary_tag = bundleTags.length > 0 ? bundleTags[0] : null;
        
        console.log('📌 Updated tags:', bundleTags);
        console.log('   New primary tag:', updateData.primary_tag);
      } catch (error) {
        console.error('❌ Tags parsing error:', error);
        return res.status(400).json({
          success: false,
          message: 'Invalid tags format'
        });
      }
    }

    // Handle items update if provided
    if (items) {
      let bundleItems;
      try {
        bundleItems = typeof items === 'string' ? JSON.parse(items) : items;
      } catch (error) {
        return res.status(400).json({
          success: false,
          message: 'Invalid items format'
        });
      }

      // Validate items
      const validation = validateBundleItems(bundleItems);
      if (!validation.valid) {
        return res.status(400).json({
          success: false,
          message: 'Bundle validation failed',
          errors: validation.errors
        });
      }

      // Recalculate prices
      const { original_price } = await calculateBundlePrice(bundleItems);
      updateData.original_price = original_price;

      // If price is provided, validate and calculate discount
      if (price) {
        const bundlePrice = parseInt(price);
        const { discount_percent, markup_percent } = calculateDiscountAndMarkup(
          original_price,
          bundlePrice
        );

        updateData.price = bundlePrice;
        updateData.discount_percent = discount_percent !== null ? Math.round(discount_percent) : null;
        updateData.markup_percent = markup_percent !== null ? Math.round(markup_percent) : null;
      }

      // Delete old bundle items
      await supabase.from('Bundle_items').delete().eq('bundle_id', id);

      // Insert new bundle items
      const bundleItemsData = bundleItems.map(item => ({
        bundle_id: id,
        product_id: item.product_id,
        product_variant_id: item.variant_id || null,
        quantity: item.quantity || 1
      }));

      await supabase.from('Bundle_items').insert(bundleItemsData);

    } else if (price) {
      // Only price updated, recalculate discount
      const bundlePrice = parseInt(price);
      const { discount_percent, markup_percent } = calculateDiscountAndMarkup(
        existingBundle.original_price || bundlePrice,
        bundlePrice
      );
      updateData.price = bundlePrice;
      updateData.discount_percent = discount_percent !== null ? Math.round(discount_percent) : null;
      updateData.markup_percent = markup_percent !== null ? Math.round(markup_percent) : null;
    }

    // Handle image upload
    if (req.file) {
      const cloudinaryResult = await uploadToCloudinary(req.file.buffer, 'bundles');
      updateData.img_url = cloudinaryResult.url;

      // Delete old image
      if (existingBundle.img_url) {
        const oldPublicId = extractPublicIdFromUrl(existingBundle.img_url);
        if (oldPublicId) {
          await deleteFromCloudinary(oldPublicId).catch(err => 
            console.error('Failed to delete old image:', err)
          );
        }
      }
    }

    // Update bundle
    updateData.updated_at = new Date().toISOString();

    console.log('💾 Updating bundle with data:', {
      tags: updateData.tags,
      primary_tag: updateData.primary_tag
    });

    const { data: updatedBundle, error: updateError } = await supabase
      .from('Bundles')
      .update(updateData)
      .eq('id', id)
      .select()
      .single();

    if (updateError) {
      console.error('❌ Bundle update error:', updateError);
      throw updateError;
    }

    console.log(`✅ Bundle updated successfully: ${id}`);
    console.log(`   New tags: ${updatedBundle.tags?.join(', ') || 'none'}`);
    console.log(`   New primary tag: ${updatedBundle.primary_tag || 'none'}`);

    res.status(200).json({
      success: true,
      message: 'Bundle updated successfully',
      data: updatedBundle
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
 * Delete bundle (with cascading delete of items)
 * DELETE /api/bundles/admin/:id
 */
const deleteBundle = async (req, res) => {
  try {
    const { id } = req.params;

    // Fetch bundle to get image URL
    const { data: bundle, error: fetchError } = await supabase
      .from('Bundles')
      .select('img_url')
      .eq('id', id)
      .single();

    if (fetchError) {
      if (fetchError.code === 'PGRST116') {
        return res.status(404).json({
          success: false,
          message: 'Bundle not found'
        });
      }
      throw fetchError;
    }

    // Delete all bundle items first (to avoid foreign key constraint issues)
    const { error: itemsDeleteError } = await supabase
      .from('Bundle_items')
      .delete()
      .eq('bundle_id', id);

    if (itemsDeleteError) {
      throw itemsDeleteError;
    }

    // Delete the bundle itself
    const { error: deleteError } = await supabase
      .from('Bundles')
      .delete()
      .eq('id', id);

    if (deleteError) throw deleteError;

    // Delete image from Cloudinary
    if (bundle.img_url) {
      const publicId = extractPublicIdFromUrl(bundle.img_url);
      if (publicId) {
        await deleteFromCloudinary(publicId).catch(err =>
          console.error('Failed to delete bundle image:', err)
        );
      }
    }

    console.log(`✅ Bundle deleted successfully: ${id}`);

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
 * Duplicate bundle with all items
 * POST /api/bundles/admin/:id/duplicate
 */
const duplicateBundle = async (req, res) => {
  try {
    const { id } = req.params;

    // Fetch original bundle with items
    const { data: originalBundle, error: fetchError } = await supabase
      .from('Bundles')
      .select(`
        *,
        Bundle_items (
          product_id,
          product_variant_id,
          quantity
        )
      `)
      .eq('id', id)
      .single();

    if (fetchError || !originalBundle) {
      return res.status(404).json({
        success: false,
        message: 'Bundle not found'
      });
    }

    // Create new bundle with "(Copy)" suffix
    const newBundleData = {
      title: `${originalBundle.title} (Copy)`,
      description: originalBundle.description,
      price: originalBundle.price,
      original_price: originalBundle.original_price,
      discount_percent: originalBundle.discount_percent,
      markup_percent: originalBundle.markup_percent,
      img_url: originalBundle.img_url, // Reuse same image
      stock_limit: originalBundle.stock_limit,
      is_active: false // Set to inactive by default
    };

    const { data: newBundle, error: createError } = await supabase
      .from('Bundles')
      .insert([newBundleData])
      .select()
      .single();

    if (createError) throw createError;

    // Duplicate bundle items
    const newItemsData = originalBundle.Bundle_items.map(item => ({
      bundle_id: newBundle.id,
      product_id: item.product_id,
      product_variant_id: item.product_variant_id,
      quantity: item.quantity
    }));

    await supabase.from('Bundle_items').insert(newItemsData);

    console.log(`✅ Bundle duplicated successfully: ${newBundle.id}`);

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

// ========================================
// EXPORTS
// ========================================

module.exports = {
  // Public routes
  getAllBundles,
  getBundleById,
  getBundleDetails,
  getBundleStock,
  
  // Admin routes
  createBundle,
  updateBundle,
  deleteBundle,
  toggleBundleStatus,
  duplicateBundle
};