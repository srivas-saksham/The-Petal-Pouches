// backend/src/controllers/productController.js
const supabase = require('../config/supabaseClient');
const { uploadToCloudinary, deleteFromCloudinary } = require('../services/cloudinaryService');
const { extractPublicIdFromUrl } = require('../utils/cloudinaryHelpers');

// Task 2.1: Get Product by ID
const getProductById = async (req, res) => {
  try {
    const { id } = req.params;

    const { data, error } = await supabase
      .from('Products')
      .select(`
        *,
        Categories (
          id,
          name,
          description
        )
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

    res.status(200).json({
      success: true,
      data
    });
  } catch (error) {
    console.error('Get product by ID error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch product',
      error: error.message
    });
  }
};

// Task 2.2: Update Product (with optional image)
const updateProduct = async (req, res) => {
  try {
    const { id } = req.params;
    const { title, description, price, stock, category_id, sku } = req.body;

    // Check if product exists
    const { data: existingProduct, error: fetchError } = await supabase
      .from('Products')
      .select('img_url')
      .eq('id', id)
      .single();

    if (fetchError || !existingProduct) {
      return res.status(404).json({
        success: false,
        message: 'Product not found'
      });
    }

    // Prepare update data
    const updateData = {};
    if (title) updateData.title = title;
    if (description !== undefined) updateData.description = description;
    if (price) updateData.price = parseInt(price);
    if (stock !== undefined) updateData.stock = parseInt(stock);
    if (sku) updateData.sku = sku;
    
    // Handle category_id
    if (category_id && category_id.trim() !== '' && category_id.toUpperCase() !== 'NULL') {
      updateData.category_id = category_id;
    } else if (category_id === null || category_id === '' || category_id.toUpperCase() === 'NULL') {
      updateData.category_id = null;
    }

    // Handle new image upload
    if (req.file) {
      try {
        // Upload new image
        const cloudinaryResult = await uploadToCloudinary(req.file.buffer, 'products');
        updateData.img_url = cloudinaryResult.url;

        // Delete old image from Cloudinary
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
      data
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

// Task 2.3: Delete Product
const deleteProduct = async (req, res) => {
  try {
    const { id } = req.params;

    // Fetch product to get image URL
    const { data: product, error: fetchError } = await supabase
      .from('Products')
      .select('img_url')
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

    // Delete from database
    const { error: deleteError } = await supabase
      .from('Products')
      .delete()
      .eq('id', id);

    if (deleteError) throw deleteError;

    // Delete image from Cloudinary
    if (product.img_url) {
      try {
        const publicId = extractPublicIdFromUrl(product.img_url);
        if (publicId) {
          await deleteFromCloudinary(publicId);
        }
      } catch (cloudinaryError) {
        console.error('Cloudinary delete error:', cloudinaryError);
        // Don't fail the request if Cloudinary delete fails
      }
    }

    res.status(200).json({
      success: true,
      message: 'Product deleted successfully'
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

// Task 2.4: Get All Products with Advanced Filtering
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

    // Build query
    let query = supabase
      .from('Products')
      .select('*, Categories(id, name)', { count: 'exact' });

    // Category filter
    if (category_id) {
      query = query.eq('category_id', category_id);
    }

    // Price range filter
    if (min_price) {
      query = query.gte('price', parseInt(min_price));
    }
    if (max_price) {
      query = query.lte('price', parseInt(max_price));
    }

    // Search by title
    if (search) {
      query = query.ilike('title', `%${search}%`);
    }

    // Stock filter
    if (in_stock === 'true') {
      query = query.gt('stock', 0);
    }

    // Sorting
    switch (sort) {
      case 'price_asc':
        query = query.order('price', { ascending: true });
        break;
      case 'price_desc':
        query = query.order('price', { ascending: false });
        break;
      case 'created_at':
      default:
        query = query.order('created_at', { ascending: false });
        break;
    }

    // Pagination
    const pageNum = parseInt(page);
    const limitNum = parseInt(limit);
    const from = (pageNum - 1) * limitNum;
    const to = from + limitNum - 1;

    query = query.range(from, to);

    // Execute query
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

// Create Product (already implemented)
const createProduct = async (req, res) => {
  try {
    const { title, description, price, category_id, stock, sku } = req.body;

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
      has_variants: false
    };

    if (category_id && category_id.trim() !== '' && category_id.toUpperCase() !== 'NULL') {
      productData.category_id = category_id;
    }

    const { data, error } = await supabase
      .from('Products')
      .insert([productData])
      .select()
      .single();

    if (error) {
      await deleteFromCloudinary(cloudinaryResult.publicId);
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

module.exports = {
  createProduct,
  getProductById,
  updateProduct,
  deleteProduct,
  getAllProducts
};