// backend/src/controllers/productController.js
const supabase = require('../config/supabaseClient');
const { uploadToCloudinary, deleteFromCloudinary } = require('../services/cloudinaryService');
const { extractPublicIdFromUrl } = require('../utils/cloudinaryHelpers');

// Helper function to delete all variants for a product
const deleteAllVariantsForProduct = async (productId) => {
  try {
    // Fetch all variants for this product
    const { data: variants, error: fetchError } = await supabase
      .from('Product_variants')
      .select('id, img_url')
      .eq('product_id', productId);

    if (fetchError) throw fetchError;

    if (variants && variants.length > 0) {
      console.log(`🗑️ Deleting ${variants.length} variants for product ${productId}`);

      // Delete images from Cloudinary
      for (const variant of variants) {
        if (variant.img_url) {
          try {
            const publicId = extractPublicIdFromUrl(variant.img_url);
            if (publicId) {
              await deleteFromCloudinary(publicId);
            }
          } catch (cloudinaryError) {
            console.error('Cloudinary delete error for variant:', cloudinaryError);
          }
        }
      }

      // Delete all variants from database
      const { error: deleteError } = await supabase
        .from('Product_variants')
        .delete()
        .eq('product_id', productId);

      if (deleteError) throw deleteError;

      console.log(`✅ Successfully deleted ${variants.length} variants`);
      return { success: true, deletedCount: variants.length };
    }

    return { success: true, deletedCount: 0 };
  } catch (error) {
    console.error('Error deleting variants:', error);
    throw error;
  }
};

// CREATE PRODUCT
const createProduct = async (req, res) => {
  try {
    const { title, description, price, category_id, stock, sku, has_variants } = req.body;

    if (!req.file) {
      return res.status(400).json({
        success: false,
        message: 'Product image is required'
      });
    }

    const cloudinaryResult = await uploadToCloudinary(req.file.buffer, 'products');

    const productData = {
      title,
      description,
      price: parseInt(price),
      stock: parseInt(stock),
      sku,
      img_url: cloudinaryResult.url,
      has_variants: has_variants === 'true' || has_variants === true || false
    };

    if (category_id && category_id.trim() !== '') {
      productData.category_id = category_id;
    }

    const { data, error } = await supabase
      .from('Products')
      .insert([productData])
      .select()
      .single();

    if (error) {
      await deleteFromCloudinary(cloudinaryResult.public_id);
      throw error;
    }

    res.status(201).json({
      success: true,
      message: 'Product created successfully',
      data
    });
  } catch (error) {
    console.error('Create product error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to create product',
      error: error.message
    });
  }
};

// GET PRODUCT BY ID (with variants if applicable)
const getProductById = async (req, res) => {
  try {
    const { id } = req.params;

    const { data: product, error } = await supabase
      .from('Products')
      .select(`
        *, 
        Categories (id, name, description)
      `)
      .eq('id', id)
      .single();

    if (error) {
      if (error.code === 'PGRST116') {
        return res.status(404).json({
          success: false,
          message: 'Product not found'
        });
      }
      throw error;
    }

    // If product has variants, fetch them
    if (product.has_variants) {
      const { data: variants, error: variantsError } = await supabase
        .from('Product_variants')
        .select('*')
        .eq('product_id', id)
        .order('is_default', { ascending: false })
        .order('created_at', { ascending: true });

      if (variantsError) {
        console.error('Error fetching variants:', variantsError);
        product.variants = [];
      } else {
        product.variants = variants;
      }
    }

    res.status(200).json({ 
      success: true, 
      data: product 
    });
  } catch (error) {
    console.error('Get product error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch product',
      error: error.message
    });
  }
};

// UPDATE PRODUCT (with variant cascade logic)
const updateProduct = async (req, res) => {
  try {
    const { id } = req.params;
    const { title, description, price, stock, category_id, sku, has_variants } = req.body;

    // Fetch existing product to check current state
    const { data: existingProduct, error: fetchError } = await supabase
      .from('Products')
      .select('img_url, has_variants')
      .eq('id', id)
      .single();

    if (fetchError || !existingProduct) {
      return res.status(404).json({
        success: false,
        message: 'Product not found'
      });
    }

    const updateData = {};

    if (title) updateData.title = title;
    if (description !== undefined) updateData.description = description;
    if (price) updateData.price = parseInt(price);
    if (stock !== undefined) updateData.stock = parseInt(stock);
    if (sku) updateData.sku = sku;

    // CRITICAL: Handle has_variants change
    const newHasVariants = has_variants === 'true' || has_variants === true;
    
    // If changing from true to false, delete all variants
    if (existingProduct.has_variants && !newHasVariants) {
      console.log('⚠️ has_variants changed from true to false - deleting all variants');
      
      try {
        const result = await deleteAllVariantsForProduct(id);
        console.log(`✅ Deleted ${result.deletedCount} variants for product ${id}`);
      } catch (variantDeleteError) {
        console.error('Failed to delete variants:', variantDeleteError);
        return res.status(500).json({
          success: false,
          message: 'Failed to delete existing variants. Update aborted.',
          error: variantDeleteError.message
        });
      }
    }

    updateData.has_variants = newHasVariants;

    // Handle category
    if (category_id && category_id.trim() !== '') {
      updateData.category_id = category_id;
    } else if (category_id === null || category_id === '') {
      updateData.category_id = null;
    }

    // Handle image upload
    if (req.file) {
      try {
        const cloudinaryResult = await uploadToCloudinary(req.file.buffer, 'products');
        updateData.img_url = cloudinaryResult.url;

        if (existingProduct.img_url) {
          const oldPublicId = extractPublicIdFromUrl(existingProduct.img_url);
          if (oldPublicId) {
            await deleteFromCloudinary(oldPublicId);
          }
        }
      } catch (uploadError) {
        return res.status(500).json({
          success: false,
          message: 'Failed to upload new image',
          error: uploadError.message
        });
      }
    }

    // Update product
    const { data, error } = await supabase
      .from('Products')
      .update(updateData)
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;

    res.status(200).json({
      success: true,
      message: 'Product updated successfully',
      data,
      variantsDeleted: existingProduct.has_variants && !newHasVariants
    });
  } catch (error) {
    console.error('Update product error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to update product',
      error: error.message
    });
  }
};

// DELETE PRODUCT (with cascade variant deletion)
const deleteProduct = async (req, res) => {
  try {
    const { id } = req.params;

    // Fetch product details
    const { data: product, error: fetchError } = await supabase
      .from('Products')
      .select('img_url, has_variants')
      .eq('id', id)
      .single();

    if (fetchError) {
      if (fetchError.code === 'PGRST116') {
        return res.status(404).json({
          success: false,
          message: 'Product not found'
        });
      }
      throw fetchError;
    }

    // If product has variants, delete them first
    if (product.has_variants) {
      console.log('⚠️ Product has variants - deleting all variants first');
      
      try {
        const result = await deleteAllVariantsForProduct(id);
        console.log(`✅ Deleted ${result.deletedCount} variants before deleting product`);
      } catch (variantDeleteError) {
        console.error('Failed to delete variants:', variantDeleteError);
        return res.status(500).json({
          success: false,
          message: 'Failed to delete product variants. Deletion aborted.',
          error: variantDeleteError.message
        });
      }
    }

    // Delete product from database
    const { error: deleteError } = await supabase
      .from('Products')
      .delete()
      .eq('id', id);

    if (deleteError) throw deleteError;

    // Delete product main image from Cloudinary
    if (product.img_url) {
      try {
        const publicId = extractPublicIdFromUrl(product.img_url);
        if (publicId) {
          await deleteFromCloudinary(publicId);
        }
      } catch (cloudinaryError) {
        console.error('Cloudinary delete error:', cloudinaryError);
      }
    }

    res.status(200).json({
      success: true,
      message: 'Product and all associated variants deleted successfully'
    });
  } catch (error) {
    console.error('Delete product error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to delete product',
      error: error.message
    });
  }
};

// GET ALL PRODUCTS
const getAllProducts = async (req, res) => {
  try {
    const {
      category_id,
      min_price,
      max_price,
      search,
      sort = 'created_at',
      page = 1,
      limit = 20,
      in_stock
    } = req.query;

    let query = supabase
      .from('Products')
      .select('*, Categories(id, name)', { count: 'exact' });

    if (category_id) query = query.eq('category_id', category_id);
    if (min_price) query = query.gte('price', parseInt(min_price));
    if (max_price) query = query.lte('price', parseInt(max_price));
    if (search) query = query.ilike('title', `%${search}%`);
    if (in_stock === 'true') query = query.gt('stock', 0);

    switch (sort) {
      case 'price_asc':
        query = query.order('price', { ascending: true });
        break;
      case 'price_desc':
        query = query.order('price', { ascending: false });
        break;
      default:
        query = query.order('created_at', { ascending: false });
    }

    const pageNum = parseInt(page);
    const limitNum = parseInt(limit);
    const from = (pageNum - 1) * limitNum;
    const to = from + limitNum - 1;

    query = query.range(from, to);

    const { data, error, count } = await query;

    if (error) throw error;

    const totalPages = Math.ceil(count / limitNum);

    res.status(200).json({
      success: true,
      data,
      metadata: {
        totalCount: count,
        totalPages,
        currentPage: pageNum,
        limit: limitNum,
        hasMore: pageNum < totalPages
      }
    });
  } catch (error) {
    console.error('Get all products error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch products',
      error: error.message
    });
  }
};

module.exports = {
  createProduct,
  getProductById,
  updateProduct,
  deleteProduct,
  getAllProducts
};