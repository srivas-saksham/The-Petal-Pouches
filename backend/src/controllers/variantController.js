// backend/src/controllers/variantController.js
const supabase = require('../config/supabaseClient');
const { uploadToCloudinary, deleteFromCloudinary } = require('../services/cloudinaryService');
const { extractPublicIdFromUrl } = require('../utils/cloudinaryHelpers');

// Helper function to unset other default variants for a product
const unsetOtherDefaultVariants = async (productId, excludeVariantId = null) => {
  try {
    let query = supabase
      .from('Product_variants')
      .update({ is_default: false })
      .eq('product_id', productId)
      .eq('is_default', true);
    
    if (excludeVariantId) {
      query = query.neq('id', excludeVariantId);
    }
    
    const { error } = await query;
    if (error) throw error;
    
    return { success: true };
  } catch (error) {
    console.error('Error unsetting default variants:', error);
    throw error;
  }
};

// 1. CREATE VARIANT
const createVariant = async (req, res) => {
  try {
    const { productId } = req.params;
    const { sku, attributes, price, stock, weight, is_default } = req.body;

    // Validate required fields
    if (!sku || !attributes || stock === undefined) {
      return res.status(400).json({
        success: false,
        message: 'SKU, attributes, and stock are required'
      });
    }

    // Check if product exists and has variants enabled
    const { data: product, error: productError } = await supabase
      .from('Products')
      .select('id, has_variants')
      .eq('id', productId)
      .single();

    if (productError || !product) {
      return res.status(404).json({
        success: false,
        message: 'Product not found'
      });
    }

    if (!product.has_variants) {
      return res.status(400).json({
        success: false,
        message: 'Product does not support variants. Set has_variants to true first.'
      });
    }

    // Check if SKU is unique
    const { data: existingSku } = await supabase
      .from('Product_variants')
      .select('id')
      .eq('sku', sku)
      .single();

    if (existingSku) {
      return res.status(409).json({
        success: false,
        message: 'SKU already exists'
      });
    }

    // Validate attributes is valid JSON
    let parsedAttributes;
    try {
      parsedAttributes = typeof attributes === 'string' 
        ? JSON.parse(attributes) 
        : attributes;
    } catch (error) {
      return res.status(400).json({
        success: false,
        message: 'Invalid attributes format. Must be valid JSON.'
      });
    }

    // If this variant is set as default, unset other defaults
    const shouldBeDefault = is_default === 'true' || is_default === true || false;
    
    if (shouldBeDefault) {
      await unsetOtherDefaultVariants(productId);
    }

    // Create variant data
    const variantData = {
      product_id: productId,
      sku,
      attributes: parsedAttributes,
      stock: parseInt(stock),
      is_default: shouldBeDefault
    };

    // Add optional fields
    if (price) variantData.price = parseInt(price);
    if (weight) variantData.weight = parseFloat(weight);

    // Insert variant
    const { data: variant, error } = await supabase
      .from('Product_variants')
      .insert([variantData])
      .select()
      .single();

    if (error) throw error;

    res.status(201).json({
      success: true,
      message: 'Variant created successfully',
      data: variant
    });
  } catch (error) {
    console.error('Create variant error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to create variant',
      error: error.message
    });
  }
};

// 2. GET ALL VARIANTS FOR A PRODUCT
const getVariantsByProductId = async (req, res) => {
  try {
    const { productId } = req.params;

    const { data: variants, error } = await supabase
      .from('Product_variants')
      .select('*')
      .eq('product_id', productId)
      .order('is_default', { ascending: false })
      .order('created_at', { ascending: true });

    if (error) throw error;

    res.status(200).json({
      success: true,
      count: variants.length,
      data: variants
    });
  } catch (error) {
    console.error('Get variants error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch variants',
      error: error.message
    });
  }
};

// 3. GET SINGLE VARIANT BY ID
const getVariantById = async (req, res) => {
  try {
    const { variantId } = req.params;

    const { data: variant, error } = await supabase
      .from('Product_variants')
      .select('*, Products(id, title, has_variants)')
      .eq('id', variantId)
      .single();

    if (error) {
      if (error.code === 'PGRST116') {
        return res.status(404).json({
          success: false,
          message: 'Variant not found'
        });
      }
      throw error;
    }

    res.status(200).json({
      success: true,
      data: variant
    });
  } catch (error) {
    console.error('Get variant error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch variant',
      error: error.message
    });
  }
};

// 4. UPDATE VARIANT
const updateVariant = async (req, res) => {
  try {
    const { variantId } = req.params;
    const { sku, attributes, price, stock, weight, is_default } = req.body;

    // Check if variant exists
    const { data: existingVariant, error: fetchError } = await supabase
      .from('Product_variants')
      .select('product_id')
      .eq('id', variantId)
      .single();

    if (fetchError || !existingVariant) {
      return res.status(404).json({
        success: false,
        message: 'Variant not found'
      });
    }

    // Build update object
    const updateData = {};

    if (sku && sku !== existingVariant.sku) {
      // Check if new SKU is unique
      const { data: skuExists } = await supabase
        .from('Product_variants')
        .select('id')
        .eq('sku', sku)
        .neq('id', variantId)
        .single();

      if (skuExists) {
        return res.status(409).json({
          success: false,
          message: 'SKU already exists'
        });
      }
      updateData.sku = sku;
    }

    if (attributes) {
      let parsedAttributes;
      try {
        parsedAttributes = typeof attributes === 'string' 
          ? JSON.parse(attributes) 
          : attributes;
        updateData.attributes = parsedAttributes;
      } catch (error) {
        return res.status(400).json({
          success: false,
          message: 'Invalid attributes format'
        });
      }
    }

    if (price !== undefined) updateData.price = price ? parseInt(price) : null;
    if (stock !== undefined) updateData.stock = parseInt(stock);
    if (weight !== undefined) updateData.weight = weight ? parseFloat(weight) : null;
    
    // Handle is_default flag
    if (is_default !== undefined) {
      const shouldBeDefault = is_default === 'true' || is_default === true;
      updateData.is_default = shouldBeDefault;
      
      // If setting this as default, unset others
      if (shouldBeDefault) {
        await unsetOtherDefaultVariants(existingVariant.product_id, variantId);
      }
    }

    // Update variant
    const { data: variant, error } = await supabase
      .from('Product_variants')
      .update(updateData)
      .eq('id', variantId)
      .select()
      .single();

    if (error) throw error;

    res.status(200).json({
      success: true,
      message: 'Variant updated successfully',
      data: variant
    });
  } catch (error) {
    console.error('Update variant error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to update variant',
      error: error.message
    });
  }
};

// 5. DELETE VARIANT
const deleteVariant = async (req, res) => {
  try {
    const { variantId } = req.params;

    // Check if variant exists
    const { data: variant, error: fetchError } = await supabase
      .from('Product_variants')
      .select('*, Products(id)')
      .eq('id', variantId)
      .single();

    if (fetchError || !variant) {
      return res.status(404).json({
        success: false,
        message: 'Variant not found'
      });
    }

    // Check if this is the last variant for the product
    const { data: allVariants } = await supabase
      .from('Product_variants')
      .select('id')
      .eq('product_id', variant.product_id);

    if (allVariants && allVariants.length === 1) {
      return res.status(400).json({
        success: false,
        message: 'Cannot delete the last variant. Product must have at least one variant.'
      });
    }

    // Delete variant image from Cloudinary if exists
    if (variant.img_url) {
      try {
        const publicId = extractPublicIdFromUrl(variant.img_url);
        if (publicId) {
          await deleteFromCloudinary(publicId);
        }
      } catch (cloudinaryError) {
        console.error('Cloudinary delete error:', cloudinaryError);
        // Continue with deletion even if Cloudinary fails
      }
    }

    // Delete variant
    const { error: deleteError } = await supabase
      .from('Product_variants')
      .delete()
      .eq('id', variantId);

    if (deleteError) throw deleteError;

    res.status(200).json({
      success: true,
      message: 'Variant deleted successfully'
    });
  } catch (error) {
    console.error('Delete variant error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to delete variant',
      error: error.message
    });
  }
};

// 6. UPDATE VARIANT STOCK ONLY
const updateVariantStock = async (req, res) => {
  try {
    const { variantId } = req.params;
    const { stock } = req.body;

    if (stock === undefined || stock === null) {
      return res.status(400).json({
        success: false,
        message: 'Stock value is required'
      });
    }

    const { data: variant, error } = await supabase
      .from('Product_variants')
      .update({ stock: parseInt(stock) })
      .eq('id', variantId)
      .select()
      .single();

    if (error) {
      if (error.code === 'PGRST116') {
        return res.status(404).json({
          success: false,
          message: 'Variant not found'
        });
      }
      throw error;
    }

    res.status(200).json({
      success: true,
      message: 'Stock updated successfully',
      data: variant
    });
  } catch (error) {
    console.error('Update stock error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to update stock',
      error: error.message
    });
  }
};

// 7. UPLOAD VARIANT IMAGE
const uploadVariantImage = async (req, res) => {
  try {
    const { variantId } = req.params;

    if (!req.file) {
      return res.status(400).json({
        success: false,
        message: 'Image file is required'
      });
    }

    // Check if variant exists
    const { data: existingVariant, error: fetchError } = await supabase
      .from('Product_variants')
      .select('img_url')
      .eq('id', variantId)
      .single();

    if (fetchError || !existingVariant) {
      return res.status(404).json({
        success: false,
        message: 'Variant not found'
      });
    }

    // Upload new image to Cloudinary
    const cloudinaryResult = await uploadToCloudinary(
      req.file.buffer, 
      'products/variants'
    );

    // Update variant with new image URL
    const { data: variant, error } = await supabase
      .from('Product_variants')
      .update({ img_url: cloudinaryResult.url })
      .eq('id', variantId)
      .select()
      .single();

    if (error) throw error;

    // Delete old image if exists
    if (existingVariant.img_url) {
      try {
        const oldPublicId = extractPublicIdFromUrl(existingVariant.img_url);
        if (oldPublicId) {
          await deleteFromCloudinary(oldPublicId);
        }
      } catch (cloudinaryError) {
        console.error('Old image deletion error:', cloudinaryError);
      }
    }

    res.status(200).json({
      success: true,
      message: 'Variant image uploaded successfully',
      data: variant
    });
  } catch (error) {
    console.error('Upload variant image error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to upload variant image',
      error: error.message
    });
  }
};

module.exports = {
  createVariant,
  getVariantsByProductId,
  getVariantById,
  updateVariant,
  deleteVariant,
  updateVariantStock,
  uploadVariantImage
};