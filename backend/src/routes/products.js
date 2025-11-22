// backend/src/routes/products.js
const express = require('express');
const router = express.Router();
const { 
  getAllProducts, 
  getProductById 
} = require('../controllers/productController');
const supabase = require('../config/supabaseClient'); // Import supabase client

// Public product routes (no multer needed - just reading data)
router.get('/', getAllProducts);

// Duplicate product route - place BEFORE the /:id route to avoid conflicts
router.post('/admin/:id/duplicate', async (req, res) => {
  try {
    const { id } = req.params;
    
    // Get original product from Supabase
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
      stock: original.stock,
      sku: `${original.sku}-COPY-${Date.now()}`,
      category_id: original.category_id,
      img_url: original.img_url, // Copy the same image URL
      has_variants: false, // Don't duplicate variants
    };

    // Insert duplicate into Supabase
    const { data: duplicate, error: createError } = await supabase
      .from('Products')
      .insert([duplicateData])
      .select()
      .single();

    if (createError) {
      throw createError;
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

router.get('/:id', getProductById);

module.exports = router;