const supabase = require('../config/supabaseClient');

/**
 * Create new category
 * POST /api/admin/categories
 */
const createCategory = async (req, res) => {
  try {
    const { name, description } = req.body;

    // Validate required fields
    if (!name || name.trim() === '') {
      return res.status(400).json({
        success: false,
        message: 'Category name is required'
      });
    }

    // Check if category name already exists (case-insensitive)
    const { data: existingCategory } = await supabase
      .from('Categories')
      .select('id')
      .ilike('name', name.trim())
      .single();

    if (existingCategory) {
      return res.status(409).json({
        success: false,
        message: 'Category with this name already exists'
      });
    }

    // Create category
    const { data, error } = await supabase
      .from('Categories')
      .insert([
        {
          name: name.trim(),
          description: description?.trim() || null
        }
      ])
      .select()
      .single();

    if (error) throw error;

    res.status(201).json({
      success: true,
      message: 'Category created successfully',
      data: data
    });

  } catch (error) {
    console.error('Create category error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to create category',
      error: error.message
    });
  }
};

/**
 * Get all categories
 * GET /api/categories
 */
const getAllCategories = async (req, res) => {
  try {
    const { data, error } = await supabase
      .from('Categories')
      .select('*')
      .order('name', { ascending: true });

    if (error) throw error;

    res.status(200).json({
      success: true,
      count: data.length,
      data: data
    });

  } catch (error) {
    console.error('Get categories error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch categories',
      error: error.message
    });
  }
};

/**
 * Get single category by ID
 * GET /api/categories/:id
 */
const getCategoryById = async (req, res) => {
  try {
    const { id } = req.params;

    const { data, error } = await supabase
      .from('Categories')
      .select('*')
      .eq('id', id)
      .single();

    if (error) {
      if (error.code === 'PGRST116') {
        return res.status(404).json({
          success: false,
          message: 'Category not found'
        });
      }
      throw error;
    }

    res.status(200).json({
      success: true,
      data: data
    });

  } catch (error) {
    console.error('Get category error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch category',
      error: error.message
    });
  }
};

/**
 * Update category
 * PUT /api/admin/categories/:id
 */
const updateCategory = async (req, res) => {
  try {
    const { id } = req.params;
    const { name, description } = req.body;

    // Check if at least one field is provided
    if (!name && !description) {
      return res.status(400).json({
        success: false,
        message: 'At least one field (name or description) is required'
      });
    }

    // Check if category exists
    const { data: existingCategory, error: fetchError } = await supabase
      .from('Categories')
      .select('id')
      .eq('id', id)
      .single();

    if (fetchError || !existingCategory) {
      return res.status(404).json({
        success: false,
        message: 'Category not found'
      });
    }

    // If updating name, check for duplicates
    if (name && name.trim() !== '') {
      const { data: duplicateCategory } = await supabase
        .from('Categories')
        .select('id')
        .ilike('name', name.trim())
        .neq('id', id)
        .single();

      if (duplicateCategory) {
        return res.status(409).json({
          success: false,
          message: 'Another category with this name already exists'
        });
      }
    }

    // Build update object
    const updateData = {};
    if (name && name.trim() !== '') updateData.name = name.trim();
    if (description !== undefined) updateData.description = description?.trim() || null;

    // Update category
    const { data, error } = await supabase
      .from('Categories')
      .update(updateData)
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;

    res.status(200).json({
      success: true,
      message: 'Category updated successfully',
      data: data
    });

  } catch (error) {
    console.error('Update category error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to update category',
      error: error.message
    });
  }
};

/**
 * Delete category
 * DELETE /api/admin/categories/:id
 */
const deleteCategory = async (req, res) => {
  try {
    const { id } = req.params;

    // Check if category exists
    const { data: category, error: fetchError } = await supabase
      .from('Categories')
      .select('id, name')
      .eq('id', id)
      .single();

    if (fetchError || !category) {
      return res.status(404).json({
        success: false,
        message: 'Category not found'
      });
    }

    // Check if any products are using this category
    const { data: products, error: productError } = await supabase
      .from('Products')
      .select('id')
      .eq('category_id', id)
      .limit(1);

    if (productError) throw productError;

    if (products && products.length > 0) {
      return res.status(400).json({
        success: false,
        message: 'Cannot delete category. Products are assigned to this category.',
        hint: 'Please reassign or delete the products first'
      });
    }

    // Delete category
    const { error } = await supabase
      .from('Categories')
      .delete()
      .eq('id', id);

    if (error) throw error;

    res.status(200).json({
      success: true,
      message: `Category "${category.name}" deleted successfully`
    });

  } catch (error) {
    console.error('Delete category error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to delete category',
      error: error.message
    });
  }
};

module.exports = {
  createCategory,
  getAllCategories,
  getCategoryById,
  updateCategory,
  deleteCategory
};