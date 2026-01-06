// backend/src/controllers/productController.js
const supabase = require('../config/supabaseClient');
const { uploadToCloudinary, deleteFromCloudinary } = require('../services/cloudinaryService');
const { extractPublicIdFromUrl } = require('../utils/cloudinaryHelpers');
const { calculateProductPricing } = require('../utils/productHelpers');

const ProductImageModel = require('../models/productImageModel');
const { uploadFilesToCloudinary, deleteMultipleFromCloudinary } = require('../services/cloudinaryService');

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

const uploadAndCreateProductImages = async (productId, files, startOrder = 0, firstIsPrimary = false) => {
  if (!files || files.length === 0) return [];

  const uploadResults = await uploadFilesToCloudinary(files, 'products');
  const imagesData = uploadResults.map((result, index) => ({
    img_url: result.url,
    display_order: startOrder + index,
    is_primary: firstIsPrimary && index === 0
  }));

  const images = await ProductImageModel.addImages(productId, imagesData);
  return images;
};

const getProductImages = async (productId) => {
  try {
    const images = await ProductImageModel.getImagesByProductId(productId);
    return images || [];
  } catch (error) {
    return [];
  }
};

const attachImagesToProduct = (product, images) => {
  const primaryImage = images.find(img => img.is_primary);
  return {
    ...product,
    images: images || [],
    img_url: primaryImage ? primaryImage.img_url : (product.img_url || null)
  };
};

/**
 * ✅ NEW: Get price range statistics for products
 * Used for filter range sliders
 */
const getPriceRange = async () => {
  try {
    const { data, error } = await supabase
      .from('Products')
      .select('price')
      .gt('stock', 0)
      .order('price', { ascending: true });

    if (error) throw error;

    if (!data || data.length === 0) {
      return { minPrice: 100, maxPrice: 50000 };
    }

    const prices = data.map(p => p.price).filter(p => p > 0);
    const minPrice = Math.floor(Math.min(...prices) / 100) * 100;
    const maxPrice = Math.ceil(Math.max(...prices) / 100) * 100;

    return { minPrice, maxPrice };
  } catch (error) {
    console.error('Error getting price range:', error);
    return { minPrice: 100, maxPrice: 50000 };
  }
};

/**
 * ✅ NEW: Get product statistics and aggregations
 * Useful for dashboard and analytics
 */
const getProductStats = async (req, res) => {
  try {
    // Total products count
    const { count: totalProducts, error: countError } = await supabase
      .from('Products')
      .select('id', { count: 'exact' });

    // In stock count
    const { count: inStockCount, error: inStockError } = await supabase
      .from('Products')
      .select('id', { count: 'exact' })
      .gt('stock', 0);

    // Out of stock count
    const { count: outOfStockCount, error: outOfStockError } = await supabase
      .from('Products')
      .select('id', { count: 'exact' })
      .eq('stock', 0);

    // Low stock count (<=10)
    const { count: lowStockCount, error: lowStockError } = await supabase
      .from('Products')
      .select('id', { count: 'exact' })
      .gt('stock', 0)
      .lte('stock', 10);

    // Get price range
    const priceRange = await getPriceRange();

    if (countError || inStockError || outOfStockError || lowStockError) {
      throw new Error('Failed to fetch statistics');
    }

    res.status(200).json({
      success: true,
      data: {
        totalProducts: totalProducts || 0,
        inStockProducts: inStockCount || 0,
        outOfStockProducts: outOfStockCount || 0,
        lowStockProducts: lowStockCount || 0,
        priceRange: {
          min: priceRange.minPrice,
          max: priceRange.maxPrice
        },
        stockPercentage: totalProducts > 0 
          ? Math.round((inStockCount / totalProducts) * 100)
          : 0
      }
    });
  } catch (error) {
    console.error('Get product stats error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch product statistics',
      error: error.message
    });
  }
};

// CREATE PRODUCT
const createProduct = async (req, res) => {
  try {
    const { title, description, price, category_id, stock, sku, has_variants, cost_price } = req.body;

    // ✅ CHANGED: Support both 'images' array and 'image' single file
    const files = req.files || (req.file ? [req.file] : []);

    if (files.length === 0) {
      return res.status(400).json({
        success: false,
        message: 'Product image is required'
      });
    }

    // Create product first without image
    const productData = {
      title,
      description,
      price: parseInt(price),
      stock: parseInt(stock),
      sku,
      img_url: null, // ✅ CHANGED: Set null initially
      has_variants: has_variants === 'true' || has_variants === true || false
    };

    if (cost_price) {
      const pricingMetrics = calculateProductPricing(cost_price, price);
      productData.cost_price = parseInt(cost_price);
      productData.margin_percent = pricingMetrics.margin_percent;
      productData.markup_percent = pricingMetrics.markup_percent;
    }

    if (category_id && category_id.trim() !== '') {
      productData.category_id = category_id;
    }

    const { data: product, error: insertError } = await supabase
      .from('Products')
      .insert([productData])
      .select()
      .single();

    if (insertError) throw insertError;

    // ✅ NEW: Upload multiple images
    let uploadedImages = [];
    if (files.length > 0) {
      try {
        uploadedImages = await uploadAndCreateProductImages(product.id, files, 0, true);
        
        // Set primary image URL in Products table
        if (uploadedImages.length > 0) {
          const primaryImage = uploadedImages.find(img => img.is_primary) || uploadedImages[0];
          await supabase
            .from('Products')
            .update({ img_url: primaryImage.img_url })
            .eq('id', product.id);
          
          product.img_url = primaryImage.img_url;
        }
      } catch (imageError) {
        // Rollback: Delete product if image upload fails
        await supabase.from('Products').delete().eq('id', product.id);
        throw imageError;
      }
    }

    // ✅ CHANGED: Return with images array
    res.status(201).json({
      success: true,
      message: 'Product created successfully',
      data: attachImagesToProduct(product, uploadedImages)
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

    // Fetch variants if product has them
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

    // ✅ NEW: Fetch and attach images
    const images = await getProductImages(id);

    res.status(200).json({ 
      success: true, 
      data: attachImagesToProduct(product, images)
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
    const { title, description, price, stock, category_id, sku, has_variants, cost_price } = req.body;

    // Fetch existing product
    const { data: existingProduct, error: fetchError } = await supabase
      .from('Products')
      .select('img_url, has_variants, cost_price, price')
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

    // Handle cost_price and margins
    if (cost_price !== undefined) {
      const newCostPrice = parseInt(cost_price) || 0;
      const currentPrice = price ? parseInt(price) : existingProduct.price;
      
      const pricingMetrics = calculateProductPricing(newCostPrice, currentPrice);
      updateData.cost_price = newCostPrice;
      updateData.margin_percent = pricingMetrics.margin_percent;
      updateData.markup_percent = pricingMetrics.markup_percent;
    } else if (price && existingProduct.cost_price) {
      const pricingMetrics = calculateProductPricing(existingProduct.cost_price, price);
      updateData.margin_percent = pricingMetrics.margin_percent;
      updateData.markup_percent = pricingMetrics.markup_percent;
    }

    // Handle has_variants change
    const newHasVariants = has_variants === 'true' || has_variants === true;
    
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

    // ✅ NEW: Handle multiple images
    const files = req.files || (req.file ? [req.file] : []);
    let imagesToDelete = [];

    if (req.body.delete_image_ids) {
      imagesToDelete = typeof req.body.delete_image_ids === 'string' 
        ? JSON.parse(req.body.delete_image_ids) 
        : req.body.delete_image_ids;
    }

    // ✅ NEW: Delete marked images
    if (imagesToDelete.length > 0) {
      for (const imageId of imagesToDelete) {
        try {
          const imageRecord = await ProductImageModel.getImageById(imageId);
          if (imageRecord && imageRecord.product_id === id) {
            const publicId = extractPublicIdFromUrl(imageRecord.img_url);
            if (publicId) await deleteFromCloudinary(publicId);
            await ProductImageModel.deleteImage(imageId, id);
          }
        } catch (error) {
          console.error(`Failed to delete image ${imageId}:`, error);
        }
      }
    }

    // ✅ NEW: Upload new images
    let uploadedImages = [];
    if (files.length > 0) {
      const remainingImages = await getProductImages(id);
      const maxOrder = remainingImages.length > 0 
        ? Math.max(...remainingImages.map(img => img.display_order)) 
        : -1;
      
      const hasPrimary = await ProductImageModel.hasPrimaryImage(id);
      uploadedImages = await uploadAndCreateProductImages(id, files, maxOrder + 1, !hasPrimary);
    }

    // ✅ NEW: Update img_url to primary image
    const allImages = await getProductImages(id);
    if (allImages.length > 0) {
      const primaryImage = allImages.find(img => img.is_primary) || allImages[0];
      updateData.img_url = primaryImage.img_url;
    } else {
      updateData.img_url = null;
    }

    // ✅ LEGACY: Handle old single image upload (backward compatibility)
    if (req.file && !req.files) {
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

    // ✅ NEW: Fetch and attach images
    const finalImages = await getProductImages(id);

    res.status(200).json({
      success: true,
      message: 'Product updated successfully',
      data: attachImagesToProduct(data, finalImages),
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

    // Delete variants if product has them
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

    // ✅ NEW: Delete all product images
    const images = await getProductImages(id);
    if (images.length > 0) {
      const publicIds = images.map(img => extractPublicIdFromUrl(img.img_url)).filter(id => id);
      if (publicIds.length > 0) {
        await deleteMultipleFromCloudinary(publicIds);
      }
      await ProductImageModel.deleteAllByProductId(id);
    }

    // Delete product from database (cascade will handle Product_images)
    const { error: deleteError } = await supabase
      .from('Products')
      .delete()
      .eq('id', id);

    if (deleteError) throw deleteError;

    // ✅ LEGACY: Delete old img_url from Cloudinary (if exists)
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
      message: 'Product and all associated data deleted successfully'
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

// GET ALL PRODUCTS - ✅ ENHANCED WITH ALL FILTERS AND SORTING
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
      in_stock,
      has_variants,
      stock_level
    } = req.query;

    let query = supabase
      .from('Products')
      .select('*, Categories(id, name)', { count: 'exact' });

    // Apply filters (keeping all existing logic)
    if (category_id) {
      query = query.eq('category_id', category_id);
    }

    if (min_price) {
      query = query.gte('price', parseInt(min_price));
    }
    if (max_price) {
      query = query.lte('price', parseInt(max_price));
    }

    if (search) {
      query = query.or(`title.ilike.%${search}%,description.ilike.%${search}%,sku.ilike.%${search}%`);
    }

    if (stock_level) {
      switch (stock_level) {
        case 'in_stock':
          query = query.gt('stock', 0);
          break;
        case 'low_stock':
          query = query.gt('stock', 0).lte('stock', 10);
          break;
        case 'out_of_stock':
          query = query.eq('stock', 0);
          break;
      }
    } else if (in_stock !== undefined) {
      if (in_stock === 'true') {
        query = query.gt('stock', 0);
      } else if (in_stock === 'false') {
        query = query.eq('stock', 0);
      }
    }

    if (has_variants !== undefined) {
      const hasVariantsBool = has_variants === 'true';
      query = query.eq('has_variants', hasVariantsBool);
    }

    // Apply sorting (keeping all existing logic)
    switch (sort) {
      case 'title_asc':
        query = query.order('title', { ascending: true });
        break;
      case 'title_desc':
        query = query.order('title', { ascending: false });
        break;
      case 'price_asc':
        query = query.order('price', { ascending: true });
        break;
      case 'price_desc':
        query = query.order('price', { ascending: false });
        break;
      case 'stock_asc':
        query = query.order('stock', { ascending: true });
        break;
      case 'stock_desc':
        query = query.order('stock', { ascending: false });
        break;
      case 'created_at_asc':
        query = query.order('created_at', { ascending: true });
        break;
      case 'created_at':
      case 'created_at_desc':
      default:
        query = query.order('created_at', { ascending: false });
    }

    // Pagination
    const pageNum = parseInt(page);
    const limitNum = parseInt(limit);
    const from = (pageNum - 1) * limitNum;
    const to = from + limitNum - 1;

    query = query.range(from, to);

    const { data: products, error, count } = await query;

    if (error) throw error;

    // ✅ NEW: Fetch images for all products
    const productsWithImages = await Promise.all(
      (products || []).map(async (product) => {
        const images = await getProductImages(product.id);
        return attachImagesToProduct(product, images);
      })
    );

    const totalPages = Math.ceil(count / limitNum);

    res.status(200).json({
      success: true,
      data: productsWithImages,
      metadata: {
        total: count,
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

// ✅ NEW: Get inventory analytics
const getInventoryAnalytics = async (req, res) => {
  try {
    const { data: products, error } = await supabase
      .from('Products')
      .select('id, title, price, cost_price, margin_percent, stock, category_id, Categories(name)');

    if (error) throw error;

    // Calculate comprehensive metrics
    const totalInvestment = products.reduce((sum, p) => 
      sum + ((p.cost_price || 0) * (p.stock || 0)), 0
    );

    const potentialRevenue = products.reduce((sum, p) => 
      sum + ((p.price || 0) * (p.stock || 0)), 0
    );

    const totalProfit = potentialRevenue - totalInvestment;

    const productsWithMargin = products.filter(p => p.margin_percent != null);
    const avgMargin = productsWithMargin.length > 0
      ? productsWithMargin.reduce((sum, p) => sum + (p.margin_percent || 0), 0) / productsWithMargin.length
      : 0;

    const lowStockProducts = products.filter(p => p.stock > 0 && p.stock <= 10);
    const outOfStockProducts = products.filter(p => p.stock === 0);

    // Category-wise breakdown
    const categoryMap = {};
    products.forEach(p => {
      const catName = p.Categories?.name || 'Uncategorized';
      if (!categoryMap[catName]) {
        categoryMap[catName] = {
          investment: 0,
          revenue: 0,
          profit: 0,
          count: 0
        };
      }
      categoryMap[catName].investment += (p.cost_price || 0) * (p.stock || 0);
      categoryMap[catName].revenue += (p.price || 0) * (p.stock || 0);
      categoryMap[catName].profit += ((p.price || 0) - (p.cost_price || 0)) * (p.stock || 0);
      categoryMap[catName].count++;
    });

    const categoryStats = Object.entries(categoryMap)
      .map(([name, data]) => ({
        category: name,
        ...data,
        margin: data.revenue > 0 ? ((data.profit / data.revenue) * 100).toFixed(1) : 0
      }))
      .sort((a, b) => b.profit - a.profit);

    res.status(200).json({
      success: true,
      data: {
        overview: {
          totalInvestment,
          potentialRevenue,
          totalProfit,
          profitMargin: potentialRevenue > 0 
            ? ((totalProfit / potentialRevenue) * 100).toFixed(2)
            : 0,
          avgMargin: avgMargin.toFixed(1),
          totalProducts: products.length,
          lowStockCount: lowStockProducts.length,
          outOfStockCount: outOfStockProducts.length
        },
        categoryStats,
        topProfitable: products
          .map(p => ({
            id: p.id,
            title: p.title,
            profit: ((p.price || 0) - (p.cost_price || 0)) * (p.stock || 0),
            margin: p.margin_percent
          }))
          .sort((a, b) => b.profit - a.profit)
          .slice(0, 5)
      }
    });
  } catch (error) {
    console.error('Get inventory analytics error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch analytics',
      error: error.message
    });
  }
};

/**
 * Add images to existing product
 */
const addProductImages = async (req, res) => {
  try {
    const { id } = req.params;
    const files = req.files || [];

    if (files.length === 0) {
      return res.status(400).json({ 
        success: false, 
        message: 'No images provided' 
      });
    }

    // Verify product exists
    const { data: product, error } = await supabase
      .from('Products')
      .select('id')
      .eq('id', id)
      .single();

    if (error || !product) {
      return res.status(404).json({ 
        success: false, 
        message: 'Product not found' 
      });
    }

    // Get current images
    const currentImages = await getProductImages(id);
    const maxOrder = currentImages.length > 0 
      ? Math.max(...currentImages.map(img => img.display_order)) 
      : -1;
    
    const hasPrimary = await ProductImageModel.hasPrimaryImage(id);
    const uploadedImages = await uploadAndCreateProductImages(id, files, maxOrder + 1, !hasPrimary);

    // Update product img_url if this is the first image
    if (!hasPrimary && uploadedImages.length > 0) {
      await supabase
        .from('Products')
        .update({ img_url: uploadedImages[0].img_url })
        .eq('id', id);
    }

    res.status(200).json({
      success: true,
      message: `Added ${uploadedImages.length} images successfully`,
      data: uploadedImages
    });
  } catch (error) {
    console.error('Add product images error:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Failed to add images', 
      error: error.message 
    });
  }
};

/**
 * Delete single product image
 */
const deleteProductImage = async (req, res) => {
  try {
    const { id, imageId } = req.params;

    // Verify image exists and belongs to this product
    const imageRecord = await ProductImageModel.getImageById(imageId);
    if (!imageRecord || imageRecord.product_id !== id) {
      return res.status(404).json({ 
        success: false, 
        message: 'Image not found' 
      });
    }

    const wasPrimary = imageRecord.is_primary;

    // Delete from Cloudinary
    const publicId = extractPublicIdFromUrl(imageRecord.img_url);
    if (publicId) await deleteFromCloudinary(publicId);

    // Delete from database
    await ProductImageModel.deleteImage(imageId, id);

    // If deleted image was primary, set another as primary
    if (wasPrimary) {
      const remainingImages = await getProductImages(id);
      if (remainingImages.length > 0) {
        await ProductImageModel.setPrimaryImage(id, remainingImages[0].id);
        await supabase
          .from('Products')
          .update({ img_url: remainingImages[0].img_url })
          .eq('id', id);
      } else {
        // No images left
        await supabase
          .from('Products')
          .update({ img_url: null })
          .eq('id', id);
      }
    }

    res.status(200).json({ 
      success: true, 
      message: 'Image deleted successfully' 
    });
  } catch (error) {
    console.error('Delete product image error:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Failed to delete image', 
      error: error.message 
    });
  }
};

/**
 * Set image as primary
 */
const setPrimaryProductImage = async (req, res) => {
  try {
    const { id, imageId } = req.params;

    const updatedImage = await ProductImageModel.setPrimaryImage(id, imageId);

    // Update product img_url
    await supabase
      .from('Products')
      .update({ img_url: updatedImage.img_url })
      .eq('id', id);

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
    console.error('Set primary image error:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Failed to set primary image', 
      error: error.message 
    });
  }
};

// ✅ UPDATE MODULE.EXPORTS
module.exports = {
  createProduct,
  getProductById,
  updateProduct,
  deleteProduct,
  getAllProducts,
  getProductStats,
  getPriceRange,
  getInventoryAnalytics,
  addProductImages,        // ✅ NEW
  deleteProductImage,      // ✅ NEW
  setPrimaryProductImage   // ✅ NEW
};