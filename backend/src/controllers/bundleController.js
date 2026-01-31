// backend/src/controllers/bundleController.js - PART 1: IMPORTS & HELPERS
// UPDATED: Added multiple image support

const supabase = require('../config/supabaseClient');
const { uploadToCloudinary, deleteFromCloudinary, uploadFilesToCloudinary, deleteMultipleFromCloudinary } = require('../services/cloudinaryService');
const { extractPublicIdFromUrl } = require('../utils/cloudinaryHelpers');
const {
  calculateBundlePrice,
  calculateDiscountAndMarkup,
  validateBundleStock,
  validateBundleItems,
  validateBundleImages,        // NEW
  validateImageUpdate          // NEW
} = require('../services/bundleHelpers');
const BundleImageModel = require('../models/bundleImageModel'); // NEW

// ========================================
// NEW: HELPER FUNCTIONS FOR IMAGES
// ========================================

/**
 * Helper: Upload multiple images and create database records
 * @param {string} bundleId - Bundle UUID
 * @param {Array} files - Multer files array
 * @param {number} startOrder - Starting display_order
 * @param {boolean} firstIsPrimary - Set first image as primary
 * @returns {Promise<Array>} Created image records
 */
const uploadAndCreateImages = async (bundleId, files, startOrder = 0, firstIsPrimary = false) => {
  try {
    if (!files || files.length === 0) {
      return [];
    }

    // Upload to Cloudinary
    const uploadResults = await uploadFilesToCloudinary(files, 'bundles');

    // Prepare database records
    const imagesData = uploadResults.map((result, index) => ({
      img_url: result.url,
      display_order: startOrder + index,
      is_primary: firstIsPrimary && index === 0
    }));

    // Save to database
    const images = await BundleImageModel.addImages(bundleId, imagesData);

    console.log(`✅ Uploaded and created ${images.length} images for bundle ${bundleId}`);
    return images;

  } catch (error) {
    console.error('❌ Error uploading images:', error);
    throw error;
  }
};

/**
 * Helper: Delete images from both Cloudinary and database
 * @param {Array} imageRecords - Array of image records from database
 * @returns {Promise<void>}
 */
const deleteImagesComplete = async (imageRecords) => {
  try {
    if (!imageRecords || imageRecords.length === 0) {
      return;
    }

    // Extract public IDs
    const publicIds = imageRecords
      .map(img => extractPublicIdFromUrl(img.img_url))
      .filter(id => id !== null);

    // Delete from Cloudinary
    if (publicIds.length > 0) {
      await deleteMultipleFromCloudinary(publicIds);
    }

    console.log(`✅ Deleted ${imageRecords.length} images from Cloudinary`);

  } catch (error) {
    console.error('❌ Error deleting images:', error);
    // Don't throw - we still want to continue with database deletion
  }
};

/**
 * Helper: Get images for a bundle and attach to bundle object
 * @param {string} bundleId - Bundle UUID
 * @returns {Promise<Array>} Images array
 */
const getBundleImages = async (bundleId) => {
  try {
    const images = await BundleImageModel.getImagesByBundleId(bundleId);
    return images || [];
  } catch (error) {
    console.error('❌ Error getting bundle images:', error);
    return [];
  }
};

/**
 * Helper: Attach images to bundle object with backward compatibility
 * @param {Object} bundle - Bundle object
 * @param {Array} images - Images array
 * @returns {Object} Bundle with images attached
 */
const attachImagesToBundle = (bundle, images) => {
  const primaryImage = images.find(img => img.is_primary);
  
  return {
    ...bundle,
    images: images || [],
    img_url: primaryImage ? primaryImage.img_url : (bundle.img_url || null) // Backward compatibility
  };
};

// backend/src/controllers/bundleController.js - PART 2: getAllBundles
// UPDATED: Now includes images array

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
      tags = ''
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
      tags
    });

    // Build base query - SELECT bundles only (images loaded separately)
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

    // Tag filtering (AND logic)
    if (tags && tags.trim()) {
      const tagArray = tags
        .split(',')
        .map(t => t.trim().toLowerCase())
        .filter(t => t.length > 0);

      console.log(`🏷️ Filtering by tags (AND logic):`, tagArray);

      if (tagArray.length > 0) {
        tagArray.forEach(tag => {
          const jsonArrayString = `["${tag}"]`;
          query = query.filter('tags', 'cs', jsonArrayString);
          console.log(`✅ Added AND filter: tags @> '${jsonArrayString}'`);
        });
        
        console.log(`✅ Applied ${tagArray.length} AND filters - bundles must have ALL tags`);
      }
    }

    // Stock filter
    if (in_stock === 'true') {
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

    // Sorting
    const validSorts = ['created_at', 'title', 'price', 'discount_percent', 'updated_at'];
    const sortField = validSorts.includes(sort) ? sort : 'created_at';
    
    let ascending = order === 'asc';
    
    if (sortField === 'created_at' || sortField === 'updated_at') {
      ascending = order === 'asc' ? true : false;
    } else if (sortField === 'price') {
      ascending = order === 'asc' ? true : false;
    } else if (sortField === 'title') {
      ascending = true;
    } else if (sortField === 'discount_percent') {
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

    console.log('📊 Query results:', {
      bundlesFound: bundles?.length,
      totalCount: count
    });

    // ========================================
    // NEW: Fetch images for all bundles
    // ========================================
    const bundlesWithImages = await Promise.all(
      (bundles || []).map(async (bundle) => {
        // Get images for this bundle
        const images = await getBundleImages(bundle.id);
        
        // Calculate extras
        const stockLimit = bundle.stock_limit;
        const isOutOfStock = stockLimit === 0 || stockLimit === null;
        
        return attachImagesToBundle({
          ...bundle,
          product_count: bundle.Bundle_items?.length || 0,
          savings: bundle.original_price ? bundle.original_price - bundle.price : 0,
          stock_status: {
            in_stock: !isOutOfStock,
            stock_limit: stockLimit,
            is_low_stock: stockLimit !== null && stockLimit > 0 && stockLimit < 5
          }
        }, images);
      })
    );

    // Calculate metadata
    const totalPages = Math.ceil(count / limitNum);

    console.log(`✅ Returning ${bundlesWithImages.length} bundles with images (page ${pageNum}/${totalPages})`);

    res.status(200).json({
      success: true,
      data: bundlesWithImages,
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

// backend/src/controllers/bundleController.js - PART 3: getBundleById & getBundleDetails
// UPDATED: Now includes images array

/**
 * Get single bundle by ID with full details
 * GET /api/bundles/:id
 * UPDATED: Now includes images array
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

    // NEW: Get images for this bundle
    const images = await getBundleImages(id);

    // Add stock status
    const stockLimit = bundle.stock_limit;
    const isOutOfStock = stockLimit === 0 || stockLimit === null;
    
    // Calculate savings
    const savings = bundle.original_price ? bundle.original_price - bundle.price : 0;

    const bundleWithImages = attachImagesToBundle({
      ...bundle,
      savings,
      product_count: bundle.Bundle_items?.length || 0,
      stock_status: {
        in_stock: !isOutOfStock,
        stock_limit: stockLimit,
        is_low_stock: stockLimit !== null && stockLimit > 0 && stockLimit < 5
      }
    }, images);

    res.status(200).json({
      success: true,
      data: bundleWithImages
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
 * UPDATED: Now includes images array
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

    // NEW: Get images for this bundle
    const images = await getBundleImages(id);

    // Add stock status
    const stockLimit = bundle.stock_limit;
    const isOutOfStock = stockLimit === 0 || stockLimit === null;
    
    // Calculate total savings
    const savings = bundle.original_price ? bundle.original_price - bundle.price : 0;

    const bundleWithImages = attachImagesToBundle({
      ...bundle,
      savings,
      product_count: bundle.Bundle_items?.length || 0,
      stock_status: {
        in_stock: !isOutOfStock,
        stock_limit: stockLimit,
        is_low_stock: stockLimit !== null && stockLimit > 0 && stockLimit < 5
      }
    }, images);

    res.status(200).json({
      success: true,
      data: bundleWithImages
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

// backend/src/controllers/bundleController.js - PART 4: createBundle
// UPDATED: Now handles multiple images

/**
 * Create a new bundle
 * POST /api/bundles/admin
 * UPDATED: Now accepts multiple images (req.files) or single image (req.file)
 */
const createBundle = async (req, res) => {
  try {
    const { title, description, price, stock_limit, items, tags, weight } = req.body;

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

    // Parse items
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

    // ========================================
    // NEW: Handle multiple images
    // ========================================
    const files = req.files || (req.file ? [req.file] : []);
    
    // Validate images
    const imageValidation = validateBundleImages(files);
    if (!imageValidation.valid) {
      return res.status(400).json({
        success: false,
        message: 'Image validation failed',
        errors: imageValidation.errors
      });
    }

    // Parse tags
    let bundleTags = [];
    let primaryTag = null;
    
    if (tags) {
      try {
        bundleTags = typeof tags === 'string' ? JSON.parse(tags) : tags;
        
        if (!Array.isArray(bundleTags)) {
          return res.status(400).json({
            success: false,
            message: 'Tags must be an array'
          });
        }
        
        bundleTags = bundleTags
          .map(tag => tag.toLowerCase().trim())
          .filter(tag => tag.length > 0);
        
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

    // Calculate prices
    const { original_price, items_with_prices } = await calculateBundlePrice(bundleItems);
    const { discount_percent, markup_percent } = calculateDiscountAndMarkup(
      original_price,
      parseInt(price)
    );

    // Validate stock
    const stockCheck = await validateBundleStock(bundleItems);
    if (!stockCheck.available) {
      return res.status(400).json({
        success: false,
        message: 'Some items are out of stock',
        out_of_stock: stockCheck.out_of_stock
      });
    }

    // Create bundle (without img_url for now)
    const bundleData = {
      title: title.trim(),
      description: description?.trim() || null,
      price: parseInt(price),
      original_price,
      discount_percent: discount_percent !== null ? Math.round(discount_percent) : null,
      markup_percent: markup_percent !== null ? Math.round(markup_percent) : null,
      img_url: null, // Will be set to primary image URL after upload
      stock_limit: stock_limit ? parseInt(stock_limit) : null,
      tags: bundleTags.length > 0 ? bundleTags : [],
      primary_tag: primaryTag,
      is_active: true,
      weight: weight ? parseInt(weight) : 0 
    };

    console.log('💾 Creating bundle:', bundleData.title);

    const { data: bundle, error: bundleError } = await supabase
      .from('Bundles')
      .insert([bundleData])
      .select()
      .single();

    if (bundleError) {
      console.error('❌ Bundle insert error:', bundleError);
      throw bundleError;
    }

    console.log('✅ Bundle created:', bundle.id);

    // ========================================
    // NEW: Upload and save images
    // ========================================
    let uploadedImages = [];
    if (files.length > 0) {
      try {
        // Upload all images and create records (first one is primary)
        uploadedImages = await uploadAndCreateImages(bundle.id, files, 0, true);
        
        // Update bundle with primary image URL (for backward compatibility)
        if (uploadedImages.length > 0) {
          const primaryImage = uploadedImages.find(img => img.is_primary) || uploadedImages[0];
          await supabase
            .from('Bundles')
            .update({ img_url: primaryImage.img_url })
            .eq('id', bundle.id);
          
          bundle.img_url = primaryImage.img_url;
        }
        
        console.log(`✅ Uploaded ${uploadedImages.length} images for bundle`);
      } catch (imageError) {
        console.error('❌ Image upload error:', imageError);
        
        // Rollback: Delete bundle
        await supabase.from('Bundles').delete().eq('id', bundle.id);
        
        return res.status(500).json({
          success: false,
          message: 'Failed to upload images. Bundle creation rolled back.',
          error: imageError.message
        });
      }
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
      
      // Rollback: Delete bundle and images
      await supabase.from('Bundles').delete().eq('id', bundle.id);
      if (uploadedImages.length > 0) {
        await deleteImagesComplete(uploadedImages);
      }
      
      throw itemsError;
    }

    console.log(`✅ Bundle created successfully: ${bundle.id} with ${uploadedImages.length} images`);

    res.status(201).json({
      success: true,
      message: 'Bundle created successfully',
      data: attachImagesToBundle({
        ...bundle,
        items: insertedItems,
        savings: original_price - parseInt(price)
      }, uploadedImages)
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

// backend/src/controllers/bundleController.js - PART 5: updateBundle
// UPDATED: Now handles multiple images and image deletions

/**
 * Update existing bundle
 * PUT /api/bundles/admin/:id
 * UPDATED: Now handles adding new images and deleting existing ones
 */
const updateBundle = async (req, res) => {
  try {
    const { id } = req.params;
    const { title, description, price, stock_limit, items, tags, delete_image_ids, weight } = req.body;

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

    // Prepare update data
    const updateData = {};
    
    if (title) updateData.title = title.trim();
    if (description !== undefined) updateData.description = description?.trim() || null;
    if (stock_limit !== undefined) updateData.stock_limit = stock_limit ? parseInt(stock_limit) : null;

    // ✅ NEW: Handle weight
    if (weight !== undefined) {
      updateData.weight = parseInt(weight) || 0;
    }
    
    // ========================================
    // NEW: Handle image deletions
    // ========================================
    let imagesToDelete = [];
    if (delete_image_ids) {
      try {
        imagesToDelete = typeof delete_image_ids === 'string' 
          ? JSON.parse(delete_image_ids) 
          : delete_image_ids;
        
        if (!Array.isArray(imagesToDelete)) {
          return res.status(400).json({
            success: false,
            message: 'delete_image_ids must be an array'
          });
        }
      } catch (error) {
        return res.status(400).json({
          success: false,
          message: 'Invalid delete_image_ids format'
        });
      }
    }

    // ========================================
    // NEW: Validate image operations
    // ========================================
    const files = req.files || (req.file ? [req.file] : []);
    const currentImages = await getBundleImages(id);
    const currentImageCount = currentImages.length;
    const newImagesCount = files.length;
    const deleteCount = imagesToDelete.length;

    // Validate images
    if (files.length > 0) {
      const imageValidation = validateBundleImages(files);
      if (!imageValidation.valid) {
        return res.status(400).json({
          success: false,
          message: 'Image validation failed',
          errors: imageValidation.errors
        });
      }
    }

    // Validate final image count
    const updateValidation = validateImageUpdate(
      currentImageCount, 
      newImagesCount, 
      deleteCount,
      { maxCount: 8, minCount: 0 } // Allow 0 for backward compatibility
    );

    if (!updateValidation.valid) {
      return res.status(400).json({
        success: false,
        message: 'Image update validation failed',
        errors: updateValidation.errors
      });
    }

    console.log(`📸 Image changes: Current: ${currentImageCount}, Adding: ${newImagesCount}, Deleting: ${deleteCount}, Final: ${updateValidation.finalCount}`);

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
        
        bundleTags = bundleTags
          .map(tag => tag.toLowerCase().trim())
          .filter(tag => tag.length > 0);
        
        updateData.tags = bundleTags.length > 0 ? bundleTags : [];
        updateData.primary_tag = bundleTags.length > 0 ? bundleTags[0] : null;
        
        console.log('📌 Updated tags:', bundleTags);
      } catch (error) {
        console.error('❌ Tags parsing error:', error);
        return res.status(400).json({
          success: false,
          message: 'Invalid tags format'
        });
      }
    }

    // Handle items update
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

      const validation = validateBundleItems(bundleItems);
      if (!validation.valid) {
        return res.status(400).json({
          success: false,
          message: 'Bundle validation failed',
          errors: validation.errors
        });
      }

      const { original_price } = await calculateBundlePrice(bundleItems);
      updateData.original_price = original_price;

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

      await supabase.from('Bundle_items').delete().eq('bundle_id', id);

      const bundleItemsData = bundleItems.map(item => ({
        bundle_id: id,
        product_id: item.product_id,
        product_variant_id: item.variant_id || null,
        quantity: item.quantity || 1
      }));

      await supabase.from('Bundle_items').insert(bundleItemsData);

    } else if (price) {
      const bundlePrice = parseInt(price);
      const { discount_percent, markup_percent } = calculateDiscountAndMarkup(
        existingBundle.original_price || bundlePrice,
        bundlePrice
      );
      updateData.price = bundlePrice;
      updateData.discount_percent = discount_percent !== null ? Math.round(discount_percent) : null;
      updateData.markup_percent = markup_percent !== null ? Math.round(markup_percent) : null;
    }

    // ========================================
    // NEW: Delete images if requested
    // ========================================
    if (imagesToDelete.length > 0) {
      console.log(`🗑️ Deleting ${imagesToDelete.length} images`);
      
      for (const imageId of imagesToDelete) {
        try {
          const imageRecord = await BundleImageModel.getImageById(imageId);
          if (imageRecord && imageRecord.bundle_id === id) {
            // Delete from Cloudinary
            const publicId = extractPublicIdFromUrl(imageRecord.img_url);
            if (publicId) {
              await deleteFromCloudinary(publicId);
            }
            
            // Delete from database
            await BundleImageModel.deleteImage(imageId, id);
          }
        } catch (error) {
          console.error(`❌ Failed to delete image ${imageId}:`, error);
          // Continue with other deletions
        }
      }
    }

    // ========================================
    // NEW: Upload new images if provided
    // ========================================
    let uploadedImages = [];
    if (files.length > 0) {
      console.log(`📤 Uploading ${files.length} new images`);
      
      try {
        // Get current max display_order
        const remainingImages = await getBundleImages(id);
        const maxOrder = remainingImages.length > 0 
          ? Math.max(...remainingImages.map(img => img.display_order)) 
          : -1;
        
        // Check if we need to set a new primary (if no primary exists)
        const hasPrimary = await BundleImageModel.hasPrimaryImage(id);
        
        uploadedImages = await uploadAndCreateImages(
          id, 
          files, 
          maxOrder + 1,
          !hasPrimary // Set first as primary only if no primary exists
        );
        
        console.log(`✅ Uploaded ${uploadedImages.length} new images`);
      } catch (imageError) {
        console.error('❌ Image upload error:', imageError);
        return res.status(500).json({
          success: false,
          message: 'Failed to upload new images',
          error: imageError.message
        });
      }
    }

    // ========================================
    // NEW: Update img_url with primary image (backward compatibility)
    // ========================================
    const allImages = await getBundleImages(id);
    if (allImages.length > 0) {
      const primaryImage = allImages.find(img => img.is_primary) || allImages[0];
      updateData.img_url = primaryImage.img_url;
    } else {
      updateData.img_url = null;
    }

    // Update bundle
    updateData.updated_at = new Date().toISOString();

    console.log('💾 Updating bundle with data:', {
      hasNewImages: uploadedImages.length > 0,
      deletedImages: imagesToDelete.length,
      finalImageCount: allImages.length
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

    res.status(200).json({
      success: true,
      message: 'Bundle updated successfully',
      data: attachImagesToBundle(updatedBundle, allImages)
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

// backend/src/controllers/bundleController.js - PART 6: deleteBundle & Others
// UPDATED: Now deletes all images from Bundle_images table

/**
 * Delete bundle (with cascading delete of items)
 * DELETE /api/bundles/admin/:id
 * UPDATED: Now deletes all images from Cloudinary and Bundle_images table
 */
const deleteBundle = async (req, res) => {
  try {
    const { id } = req.params;

    // Fetch bundle to verify it exists
    const { data: bundle, error: fetchError } = await supabase
      .from('Bundles')
      .select('img_url, title')
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

    console.log(`🗑️ Deleting bundle: ${bundle.title} (${id})`);

    // ========================================
    // NEW: Get and delete all images
    // ========================================
    const images = await getBundleImages(id);
    
    if (images.length > 0) {
      console.log(`📸 Found ${images.length} images to delete`);
      
      // Delete from Cloudinary
      await deleteImagesComplete(images);
      
      // Delete from database (will be cascaded, but we do it explicitly for clarity)
      await BundleImageModel.deleteAllByBundleId(id);
      
      console.log(`✅ Deleted ${images.length} images from Cloudinary and database`);
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

    // Legacy: Delete old img_url if it exists (backward compatibility)
    if (bundle.img_url) {
      const publicId = extractPublicIdFromUrl(bundle.img_url);
      if (publicId) {
        await deleteFromCloudinary(publicId).catch(err =>
          console.error('Failed to delete legacy bundle image:', err)
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
 * NO CHANGES - Works as before
 */
const toggleBundleStatus = async (req, res) => {
  try {
    const { id } = req.params;

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
 * UPDATED: Now copies all images from original bundle
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

    console.log(`📋 Duplicating bundle: ${originalBundle.title}`);

    // ========================================
    // NEW: Get original images
    // ========================================
    const originalImages = await getBundleImages(id);
    console.log(`📸 Found ${originalImages.length} images to duplicate`);

    // Create new bundle with "(Copy)" suffix
    const newBundleData = {
      title: `${originalBundle.title} (Copy)`,
      description: originalBundle.description,
      price: originalBundle.price,
      original_price: originalBundle.original_price,
      discount_percent: originalBundle.discount_percent,
      markup_percent: originalBundle.markup_percent,
      img_url: originalImages.length > 0 ? originalImages[0].img_url : originalBundle.img_url, // Reuse image URL
      stock_limit: originalBundle.stock_limit,
      tags: originalBundle.tags,
      primary_tag: originalBundle.primary_tag,
      is_active: false // Set to inactive by default
    };

    const { data: newBundle, error: createError } = await supabase
      .from('Bundles')
      .insert([newBundleData])
      .select()
      .single();

    if (createError) throw createError;

    console.log(`✅ Created duplicate bundle: ${newBundle.id}`);

    // ========================================
    // NEW: Duplicate images (reuse Cloudinary URLs)
    // ========================================
    if (originalImages.length > 0) {
      const duplicateImagesData = originalImages.map(img => ({
        img_url: img.img_url, // Reuse the same Cloudinary URL
        display_order: img.display_order,
        is_primary: img.is_primary
      }));

      await BundleImageModel.addImages(newBundle.id, duplicateImagesData);
      console.log(`✅ Duplicated ${originalImages.length} image references`);
    }

    // Duplicate bundle items
    const newItemsData = originalBundle.Bundle_items.map(item => ({
      bundle_id: newBundle.id,
      product_id: item.product_id,
      product_variant_id: item.product_variant_id,
      quantity: item.quantity
    }));

    await supabase.from('Bundle_items').insert(newItemsData);

    console.log(`✅ Bundle duplicated successfully: ${newBundle.id}`);

    // Get images for response
    const newBundleImages = await getBundleImages(newBundle.id);

    res.status(201).json({
      success: true,
      message: 'Bundle duplicated successfully',
      data: attachImagesToBundle(newBundle, newBundleImages)
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

/**
 * Check bundle stock availability
 * GET /api/bundles/:id/stock
 * NO CHANGES - Works as before
 */
const getBundleStock = async (req, res) => {
  try {
    const { id } = req.params;

    const { data: bundle, error: bundleError } = await supabase
      .from('Bundles')
      .select('stock_limit')
      .eq('id', id)
      .single();

    if (bundleError) throw bundleError;

    const stockLimit = bundle.stock_limit;
    const isOutOfStock = stockLimit === 0 || stockLimit === null;

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

// backend/src/controllers/bundleController.js - PART 7: NEW IMAGE FUNCTIONS

// ========================================
// NEW: IMAGE-SPECIFIC OPERATIONS
// ========================================

/**
 * Add images to existing bundle
 * POST /api/bundles/admin/:id/images
 */
const addBundleImages = async (req, res) => {
  try {
    const { id } = req.params;
    const files = req.files || [];

    if (files.length === 0) {
      return res.status(400).json({
        success: false,
        message: 'No images provided'
      });
    }

    // Verify bundle exists
    const { data: bundle, error: bundleError } = await supabase
      .from('Bundles')
      .select('id, title')
      .eq('id', id)
      .single();

    if (bundleError || !bundle) {
      return res.status(404).json({
        success: false,
        message: 'Bundle not found'
      });
    }

    // Check current image count
    const currentImages = await getBundleImages(id);
    const currentCount = currentImages.length;

    // Validate
    const validation = validateImageUpdate(currentCount, files.length, 0, { maxCount: 8 });
    if (!validation.valid) {
      return res.status(400).json({
        success: false,
        message: 'Cannot add images',
        errors: validation.errors
      });
    }

    // Validate image files
    const imageValidation = validateBundleImages(files);
    if (!imageValidation.valid) {
      return res.status(400).json({
        success: false,
        message: 'Image validation failed',
        errors: imageValidation.errors
      });
    }

    // Upload images
    const maxOrder = currentCount > 0 
      ? Math.max(...currentImages.map(img => img.display_order)) 
      : -1;
    
    const hasPrimary = await BundleImageModel.hasPrimaryImage(id);
    
    const uploadedImages = await uploadAndCreateImages(
      id, 
      files, 
      maxOrder + 1,
      !hasPrimary
    );

    // Update bundle img_url if this is the first image
    if (!hasPrimary && uploadedImages.length > 0) {
      await supabase
        .from('Bundles')
        .update({ img_url: uploadedImages[0].img_url })
        .eq('id', id);
    }

    console.log(`✅ Added ${uploadedImages.length} images to bundle ${id}`);

    res.status(200).json({
      success: true,
      message: `Added ${uploadedImages.length} images successfully`,
      data: uploadedImages
    });

  } catch (error) {
    console.error('❌ Add bundle images error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to add images',
      error: error.message
    });
  }
};

/**
 * Delete single image from bundle
 * DELETE /api/bundles/admin/:id/images/:imageId
 */
const deleteBundleImage = async (req, res) => {
  try {
    const { id, imageId } = req.params;

    // Verify bundle exists
    const { data: bundle, error: bundleError } = await supabase
      .from('Bundles')
      .select('id')
      .eq('id', id)
      .single();

    if (bundleError || !bundle) {
      return res.status(404).json({
        success: false,
        message: 'Bundle not found'
      });
    }

    // Check if image exists
    const imageRecord = await BundleImageModel.getImageById(imageId);
    if (!imageRecord || imageRecord.bundle_id !== id) {
      return res.status(404).json({
        success: false,
        message: 'Image not found'
      });
    }

    // Check if this is the only image
    const currentImages = await getBundleImages(id);
    if (currentImages.length === 1) {
      return res.status(400).json({
        success: false,
        message: 'Cannot delete the only image. Bundle must have at least one image.'
      });
    }

    const wasPrimary = imageRecord.is_primary;

    // Delete from Cloudinary
    const publicId = extractPublicIdFromUrl(imageRecord.img_url);
    if (publicId) {
      await deleteFromCloudinary(publicId);
    }

    // Delete from database
    await BundleImageModel.deleteImage(imageId, id);

    // If deleted image was primary, set another as primary
    if (wasPrimary) {
      const remainingImages = await getBundleImages(id);
      if (remainingImages.length > 0) {
        await BundleImageModel.setPrimaryImage(id, remainingImages[0].id);
        
        // Update bundle img_url
        await supabase
          .from('Bundles')
          .update({ img_url: remainingImages[0].img_url })
          .eq('id', id);
      }
    }

    console.log(`✅ Deleted image ${imageId} from bundle ${id}`);

    res.status(200).json({
      success: true,
      message: 'Image deleted successfully'
    });

  } catch (error) {
    console.error('❌ Delete bundle image error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to delete image',
      error: error.message
    });
  }
};

/**
 * Reorder bundle images
 * PATCH /api/bundles/admin/:id/images/reorder
 * Body: { order: [{ image_id, display_order }, ...] }
 */
const reorderBundleImages = async (req, res) => {
  try {
    const { id } = req.params;
    const { order } = req.body;

    if (!order || !Array.isArray(order) || order.length === 0) {
      return res.status(400).json({
        success: false,
        message: 'Order array is required'
      });
    }

    // Verify bundle exists
    const { data: bundle, error: bundleError } = await supabase
      .from('Bundles')
      .select('id')
      .eq('id', id)
      .single();

    if (bundleError || !bundle) {
      return res.status(404).json({
        success: false,
        message: 'Bundle not found'
      });
    }

    // Reorder images
    await BundleImageModel.reorderImages(id, order);

    console.log(`✅ Reordered ${order.length} images for bundle ${id}`);

    // Get updated images
    const updatedImages = await getBundleImages(id);

    res.status(200).json({
      success: true,
      message: 'Images reordered successfully',
      data: updatedImages
    });

  } catch (error) {
    console.error('❌ Reorder images error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to reorder images',
      error: error.message
    });
  }
};

/**
 * Set image as primary
 * PATCH /api/bundles/admin/:id/images/:imageId/primary
 */
const setPrimaryBundleImage = async (req, res) => {
  try {
    const { id, imageId } = req.params;

    // Verify bundle exists
    const { data: bundle, error: bundleError } = await supabase
      .from('Bundles')
      .select('id')
      .eq('id', id)
      .single();

    if (bundleError || !bundle) {
      return res.status(404).json({
        success: false,
        message: 'Bundle not found'
      });
    }

    // Set as primary
    const updatedImage = await BundleImageModel.setPrimaryImage(id, imageId);

    // Update bundle img_url for backward compatibility
    await supabase
      .from('Bundles')
      .update({ img_url: updatedImage.img_url })
      .eq('id', id);

    console.log(`✅ Set image ${imageId} as primary for bundle ${id}`);

    res.status(200).json({
      success: true,
      message: 'Primary image updated successfully',
      data: updatedImage
    });

  } catch (error) {
    if (error.message === 'IMAGE_NOT_FOUND') {
      return res.status(404).json({
        success: false,
        message: 'Image not found'
      });
    }

    console.error('❌ Set primary image error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to set primary image',
      error: error.message
    });
  }
};

// backend/src/controllers/bundleController.js - PART 8: EXPORTS

// ========================================
// EXPORTS
// ========================================

module.exports = {
  // Public routes (existing - now with images)
  getAllBundles,
  getBundleById,
  getBundleDetails,
  getBundleStock,
  
  // Admin routes (existing - updated for images)
  createBundle,
  updateBundle,
  deleteBundle,
  toggleBundleStatus,
  duplicateBundle,
  
  // NEW: Image-specific admin routes
  addBundleImages,
  deleteBundleImage,
  reorderBundleImages,
  setPrimaryBundleImage
};

// ========================================
// COMPLETE FILE STRUCTURE
// ========================================
/*
Part 1: Imports & Helper Functions
  - uploadAndCreateImages()
  - deleteImagesComplete()
  - getBundleImages()
  - attachImagesToBundle()

Part 2: getAllBundles() - UPDATED with images

Part 3: getBundleById() & getBundleDetails() - UPDATED with images

Part 4: createBundle() - UPDATED to handle multiple images

Part 5: updateBundle() - UPDATED to handle image additions/deletions

Part 6: deleteBundle() - UPDATED to delete all images
        toggleBundleStatus() - NO CHANGES
        duplicateBundle() - UPDATED to copy images
        getBundleStock() - NO CHANGES

Part 7: NEW Image Functions
  - addBundleImages()
  - deleteBundleImage()
  - reorderBundleImages()
  - setPrimaryBundleImage()

Part 8: Exports (this part)
*/