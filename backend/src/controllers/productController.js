const supabase = require('../config/supabaseClient');
const { uploadToCloudinary, deleteFromCloudinary } = require('../services/cloudinaryService');

/**
 * Create new product with image
 * POST /api/admin/products
 */
const createProduct = async (req, res) => {
  try {
    const { title, description, price, category_id, stock, sku } = req.body;
    
    // Check if image was uploaded
    if (!req.file) {
      return res.status(400).json({
        success: false,
        message: 'Product image is required'
      });
    }

    // Upload image to Cloudinary
    const cloudinaryResult = await uploadToCloudinary(req.file.buffer, 'products');

    // Prepare product data - only include category_id if it has a valid value
    const productData = {
      title,
      description,
      price: parseInt(price),
      stock: parseInt(stock),
      sku,
      img_url: cloudinaryResult.url,
      has_variants: false
    };

    // Only add category_id if it's not empty
    if (category_id && category_id.trim() !== '' && category_id.toUpperCase() !== 'NULL') {
      productData.category_id = category_id;
    }

    // Insert product into Supabase
    const { data, error } = await supabase
      .from('Products')
      .insert([productData])
      .select()
      .single();

    if (error) {
      // If database insert fails, delete uploaded image from Cloudinary
      await deleteFromCloudinary(cloudinaryResult.publicId);
      throw error;
    }

    res.status(201).json({
      success: true,
      message: 'Product created successfully',
      data: data
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

/**
 * Update product (including image)
 * PUT /api/admin/products/:id
 */
const updateProduct = async (req, res) => {
  try {
    const { id } = req.params;
    const { title, description, price, category_id, stock, sku } = req.body;

    let updateData = {
      title,
      description,
      price: parseInt(price),
      category_id,
      stock: parseInt(stock),
      sku
    };

    // If new image is uploaded
    if (req.file) {
      // Get old product to delete old image
      const { data: oldProduct } = await supabase
        .from('Products')
        .select('img_url')
        .eq('id', id)
        .single();

      // Upload new image
      const cloudinaryResult = await uploadToCloudinary(req.file.buffer, 'products');
      updateData.img_url = cloudinaryResult.url;

      // Delete old image from Cloudinary (optional)
      // Extract publicId from old URL and delete
    }

    // Update product in Supabase
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
      data: data
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

/**
 * Delete product
 * DELETE /api/admin/products/:id
 */
const deleteProduct = async (req, res) => {
  try {
    const { id } = req.params;

    // Get product to get image URL
    const { data: product } = await supabase
      .from('Products')
      .select('img_url')
      .eq('id', id)
      .single();

    // Delete from Supabase
    const { error } = await supabase
      .from('Products')
      .delete()
      .eq('id', id);

    if (error) throw error;

    // Delete image from Cloudinary (optional)
    // Extract publicId from URL and delete

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

/**
 * Get all products (for customers)
 * GET /api/products
 */
const getAllProducts = async (req, res) => {
  try {
    const { data, error } = await supabase
      .from('Products')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) throw error;

    res.status(200).json({
      success: true,
      data: data
    });

  } catch (error) {
    console.error('Get products error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch products',
      error: error.message
    });
  }
};

module.exports = {
  createProduct,
  updateProduct,
  deleteProduct,
  getAllProducts
};