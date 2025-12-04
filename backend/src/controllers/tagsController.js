// backend/src/controllers/tagsController.js - BUNDLE TAGS CONTROLLER

const supabase = require('../config/supabaseClient');

// ========================================
// PUBLIC ROUTES (Customer-facing)
// ========================================

/**
 * Get all active tags with bundle counts
 * GET /api/tags
 * 
 * FEATURES:
 * - Returns all active tags
 * - Includes bundle count for each tag
 * - Sorted by display_order
 * - Can filter by active status
 */
const getAllTags = async (req, res) => {
  try {
    const { active = 'true', search = '' } = req.query;

    console.log('📌 Get all tags request:', { active, search });

    let query = supabase
      .from('Tags')
      .select('*');

    // Filter by active status
    if (active === 'true') {
      query = query.eq('is_active', true);
    }

    // Search filter
    if (search && search.trim()) {
      query = query.or(`name.ilike.%${search}%,label.ilike.%${search}%`);
    }

    // Sort by display order
    query = query.order('display_order', { ascending: true });

    const { data: tags, error } = await query;

    if (error) {
      console.error('❌ Query error:', error);
      throw error;
    }

    console.log(`✅ Returning ${tags?.length || 0} tags`);

    res.status(200).json({
      success: true,
      data: tags || [],
      count: tags?.length || 0
    });

  } catch (error) {
    console.error('❌ Get all tags error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch tags',
      error: error.message
    });
  }
};

/**
 * Get tags with bundle counts for filter UI - CONTEXT-AWARE VERSION
 * GET /api/tags/with-counts
 * 
 * NOW ACCEPTS QUERY PARAMS TO FILTER THE BASE SET:
 * - tags: comma-separated list of already-selected tags
 * - search: search term
 * - min_price, max_price: price range
 * - in_stock: stock filter
 * 
 * Returns counts based on the FILTERED set of bundles
 * Example: If tag A is selected, counts for tag B show bundles with BOTH A and B
 */
const getTagsWithCounts = async (req, res) => {
  try {
    const {
      tags = '',           // Currently selected tags
      search = '',
      min_price = '',
      max_price = '',
      in_stock = ''
    } = req.query;

    console.log('📊 Get tags with counts - CONTEXT-AWARE');
    console.log('   Current filters:', { tags, search, min_price, max_price, in_stock });

    // Start with base query for active bundles
    let query = supabase
      .from('Bundles')
      .select('tags')
      .eq('is_active', true)
      .not('tags', 'is', null);

    // ==========================================
    // APPLY CURRENT FILTERS TO GET BASE SET
    // ==========================================

    // If tags are already selected, filter by them (AND logic)
    if (tags && tags.trim()) {
      const selectedTags = tags
        .split(',')
        .map(t => t.trim().toLowerCase())
        .filter(t => t.length > 0);

      console.log('🏷️ Filtering base set by selected tags:', selectedTags);

      // Apply AND logic - bundles must have ALL selected tags
      selectedTags.forEach(tag => {
        const jsonArrayString = `["${tag}"]`;
        query = query.filter('tags', 'cs', jsonArrayString);
      });
    }

    // Apply search filter
    if (search && search.trim()) {
      query = query.ilike('title', `%${search.trim()}%`);
      console.log('🔍 Applying search filter:', search);
    }

    // Apply price filters
    if (min_price) {
      query = query.gte('price', parseInt(min_price));
      console.log('💰 Applying min price:', min_price);
    }
    if (max_price) {
      query = query.lte('price', parseInt(max_price));
      console.log('💰 Applying max price:', max_price);
    }

    // Apply stock filter
    if (in_stock === 'true') {
      query = query.not('stock_limit', 'is', null);
      query = query.gt('stock_limit', 0);
      console.log('📦 Applying stock filter');
    }

    // Execute query to get filtered bundles
    const { data: bundles, error } = await query;

    if (error) throw error;

    console.log(`📦 Found ${bundles?.length || 0} bundles matching current filters`);

    // ==========================================
    // COUNT TAG OCCURRENCES IN FILTERED SET
    // ==========================================

    const tagCounts = {};
    
    (bundles || []).forEach(bundle => {
      if (Array.isArray(bundle.tags)) {
        bundle.tags.forEach(tag => {
          if (tag && tag.trim()) {
            const normalizedTag = tag.toLowerCase().trim();
            tagCounts[normalizedTag] = (tagCounts[normalizedTag] || 0) + 1;
          }
        });
      }
    });

    // Convert to array format and sort by count (descending)
    const tagsWithCounts = Object.entries(tagCounts)
      .map(([name, count]) => ({
        name,
        label: name.charAt(0).toUpperCase() + name.slice(1),
        count
      }))
      .sort((a, b) => b.count - a.count);

    console.log(`✅ Returning ${tagsWithCounts.length} tags with dynamic counts`);
    console.log('📊 Top 5 tags:', tagsWithCounts.slice(0, 5).map(t => `${t.name}(${t.count})`).join(', '));

    res.status(200).json({
      success: true,
      data: tagsWithCounts,
      context: {
        appliedFilters: { tags, search, min_price, max_price, in_stock },
        bundlesInContext: bundles?.length || 0
      }
    });

  } catch (error) {
    console.error('❌ Get tags with counts error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch tags with counts',
      error: error.message
    });
  }
};

/**
 * Get single tag by name
 * GET /api/tags/:name
 */
const getTagByName = async (req, res) => {
  try {
    const { name } = req.params;

    const { data: tag, error } = await supabase
      .from('Tags')
      .select('*')
      .eq('name', name.toLowerCase())
      .eq('is_active', true)
      .single();

    if (error) {
      if (error.code === 'PGRST116') {
        return res.status(404).json({
          success: false,
          message: 'Tag not found'
        });
      }
      throw error;
    }

    res.status(200).json({
      success: true,
      data: tag
    });

  } catch (error) {
    console.error('❌ Get tag by name error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch tag',
      error: error.message
    });
  }
};

/**
 * Get popular tags (sorted by bundle count)
 * GET /api/tags/popular
 * Query params: limit (default: 10)
 */
const getPopularTags = async (req, res) => {
  try {
    const { limit = 10 } = req.query;

    console.log(`🔝 Get popular tags (limit: ${limit})`);

    // Fetch all active tags
    const { data: tags, error: tagsError } = await supabase
      .from('Tags')
      .select('*')
      .eq('is_active', true)
      .order('display_order', { ascending: true });

    if (tagsError) throw tagsError;

    // Count bundles for each tag
    const tagsWithCounts = await Promise.all(
      (tags || []).map(async (tag) => {
        const { count, error } = await supabase
          .from('Bundles')
          .select('*', { count: 'exact', head: true })
          .eq('is_active', true)
          .filter('tags', 'cs', `["${tag.name}"]`);

        if (error) return { ...tag, bundle_count: 0 };
        return { ...tag, bundle_count: count || 0 };
      })
    );

    // Sort by bundle count (descending) and take top N
    const popular = tagsWithCounts
      .sort((a, b) => b.bundle_count - a.bundle_count)
      .slice(0, parseInt(limit));

    console.log(`✅ Returning ${popular.length} popular tags`);

    res.status(200).json({
      success: true,
      data: popular
    });

  } catch (error) {
    console.error('❌ Get popular tags error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch popular tags',
      error: error.message
    });
  }
};

/**
 * Get tag statistics
 * GET /api/tags/stats
 */
const getTagStats = async (req, res) => {
  try {
    console.log('📊 Get tag statistics');

    // Get total tags
    const { count: totalTags, error: countError } = await supabase
      .from('Tags')
      .select('*', { count: 'exact', head: true });

    if (countError) throw countError;

    // Get active tags
    const { count: activeTags, error: activeError } = await supabase
      .from('Tags')
      .select('*', { count: 'exact', head: true })
      .eq('is_active', true);

    if (activeError) throw activeError;

    // Get bundles count
    const { count: totalBundles, error: bundlesError } = await supabase
      .from('Bundles')
      .select('*', { count: 'exact', head: true })
      .eq('is_active', true);

    if (bundlesError) throw bundlesError;

    res.status(200).json({
      success: true,
      data: {
        total_tags: totalTags || 0,
        active_tags: activeTags || 0,
        inactive_tags: (totalTags || 0) - (activeTags || 0),
        total_bundles: totalBundles || 0
      }
    });

  } catch (error) {
    console.error('❌ Get tag stats error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch tag statistics',
      error: error.message
    });
  }
};

// ========================================
// ADMIN ROUTES (Tag Management)
// ========================================

/**
 * Create new tag
 * POST /api/tags/admin
 * Body: { name, label, icon, color, description, display_order }
 */
const createTag = async (req, res) => {
  try {
    const { name, label, icon = '•', color = '#FF69B4', description, display_order = 0 } = req.body;

    // Validate required fields
    if (!name || !name.trim()) {
      return res.status(400).json({
        success: false,
        message: 'Tag name is required'
      });
    }

    if (!label || !label.trim()) {
      return res.status(400).json({
        success: false,
        message: 'Tag label is required'
      });
    }

    // Check if tag already exists
    const { data: existingTag, error: checkError } = await supabase
      .from('Tags')
      .select('id')
      .eq('name', name.toLowerCase())
      .single();

    if (existingTag) {
      return res.status(400).json({
        success: false,
        message: 'Tag already exists'
      });
    }

    // Create new tag
    const { data: tag, error } = await supabase
      .from('Tags')
      .insert([{
        name: name.toLowerCase().trim(),
        label: label.trim(),
        icon,
        color,
        description: description?.trim() || null,
        display_order: parseInt(display_order),
        is_active: true
      }])
      .select()
      .single();

    if (error) throw error;

    console.log(`✅ Tag created: ${tag.name}`);

    res.status(201).json({
      success: true,
      message: 'Tag created successfully',
      data: tag
    });

  } catch (error) {
    console.error('❌ Create tag error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to create tag',
      error: error.message
    });
  }
};

/**
 * Update tag
 * PUT /api/tags/admin/:id
 * Body: { label, icon, color, description, display_order, is_active }
 */
const updateTag = async (req, res) => {
  try {
    const { id } = req.params;
    const updateData = {};

    // Only update provided fields
    if (req.body.label) updateData.label = req.body.label.trim();
    if (req.body.icon) updateData.icon = req.body.icon;
    if (req.body.color) updateData.color = req.body.color;
    if (req.body.description !== undefined) updateData.description = req.body.description?.trim() || null;
    if (req.body.display_order !== undefined) updateData.display_order = parseInt(req.body.display_order);
    if (req.body.is_active !== undefined) updateData.is_active = req.body.is_active;

    const { data: tag, error } = await supabase
      .from('Tags')
      .update(updateData)
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;

    console.log(`✅ Tag updated: ${tag.name}`);

    res.status(200).json({
      success: true,
      message: 'Tag updated successfully',
      data: tag
    });

  } catch (error) {
    console.error('❌ Update tag error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to update tag',
      error: error.message
    });
  }
};

/**
 * Delete tag
 * DELETE /api/tags/admin/:id
 * 
 * This will remove the tag from the Tags table
 * but won't remove it from existing bundle tags (JSONB arrays)
 * You may want to handle that separately
 */
const deleteTag = async (req, res) => {
  try {
    const { id } = req.params;

    // Get tag info before deletion
    const { data: tag, error: getError } = await supabase
      .from('Tags')
      .select('name')
      .eq('id', id)
      .single();

    if (getError) throw getError;

    // Delete the tag
    const { error: deleteError } = await supabase
      .from('Tags')
      .delete()
      .eq('id', id);

    if (deleteError) throw deleteError;

    console.log(`✅ Tag deleted: ${tag.name}`);

    res.status(200).json({
      success: true,
      message: 'Tag deleted successfully'
    });

  } catch (error) {
    console.error('❌ Delete tag error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to delete tag',
      error: error.message
    });
  }
};

// ========================================
// BUNDLE TAG OPERATIONS
// ========================================

/**
 * Update bundle tags
 * POST /api/bundles/admin/:bundleId/tags
 * Body: { tags: ["birthday", "anniversary"] }
 */
const updateBundleTags = async (req, res) => {
  try {
    const { bundleId } = req.params;
    const { tags = [] } = req.body;

    if (!Array.isArray(tags)) {
      return res.status(400).json({
        success: false,
        message: 'Tags must be an array'
      });
    }

    // Validate tags exist
    if (tags.length > 0) {
      const { data: validTags, error: checkError } = await supabase
        .from('Tags')
        .select('name')
        .in('name', tags.map(t => t.toLowerCase()));

      if (checkError) throw checkError;

      const validTagNames = validTags.map(t => t.name);
      const invalidTags = tags.filter(t => !validTagNames.includes(t.toLowerCase()));

      if (invalidTags.length > 0) {
        return res.status(400).json({
          success: false,
          message: `Invalid tags: ${invalidTags.join(', ')}`
        });
      }
    }

    // Set primary tag (first tag or null)
    const primaryTag = tags.length > 0 ? tags[0].toLowerCase() : null;

    // Update bundle
    const { data: bundle, error } = await supabase
      .from('Bundles')
      .update({
        tags: tags.map(t => t.toLowerCase()),
        primary_tag: primaryTag,
        updated_at: new Date().toISOString()
      })
      .eq('id', bundleId)
      .select()
      .single();

    if (error) throw error;

    console.log(`✅ Bundle tags updated: ${bundleId}`, tags);

    res.status(200).json({
      success: true,
      message: 'Bundle tags updated successfully',
      data: bundle
    });

  } catch (error) {
    console.error('❌ Update bundle tags error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to update bundle tags',
      error: error.message
    });
  }
};

/**
 * Add single tag to bundle
 * POST /api/bundles/admin/:bundleId/tags/add
 * Body: { tag: "birthday" }
 */
const addTagToBundle = async (req, res) => {
  try {
    const { bundleId } = req.params;
    const { tag } = req.body;

    if (!tag || !tag.trim()) {
      return res.status(400).json({
        success: false,
        message: 'Tag is required'
      });
    }

    // Validate tag exists
    const { data: validTag, error: checkError } = await supabase
      .from('Tags')
      .select('name')
      .eq('name', tag.toLowerCase())
      .single();

    if (checkError || !validTag) {
      return res.status(400).json({
        success: false,
        message: `Tag "${tag}" does not exist`
      });
    }

    // Get current bundle tags
    const { data: bundle, error: getError } = await supabase
      .from('Bundles')
      .select('tags')
      .eq('id', bundleId)
      .single();

    if (getError) throw getError;

    const currentTags = bundle.tags || [];
    const tagName = tag.toLowerCase();

    // Add tag if not already present
    if (!currentTags.includes(tagName)) {
      currentTags.push(tagName);
    }

    // Update bundle
    const { data: updatedBundle, error: updateError } = await supabase
      .from('Bundles')
      .update({
        tags: currentTags,
        primary_tag: currentTags[0] || null,
        updated_at: new Date().toISOString()
      })
      .eq('id', bundleId)
      .select()
      .single();

    if (updateError) throw updateError;

    console.log(`✅ Tag added to bundle: ${bundleId}, tag: ${tagName}`);

    res.status(200).json({
      success: true,
      message: 'Tag added successfully',
      data: updatedBundle
    });

  } catch (error) {
    console.error('❌ Add tag to bundle error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to add tag',
      error: error.message
    });
  }
};

/**
 * Remove tag from bundle
 * DELETE /api/bundles/admin/:bundleId/tags/:tagName
 */
const removeTagFromBundle = async (req, res) => {
  try {
    const { bundleId, tagName } = req.params;

    // Get current bundle tags
    const { data: bundle, error: getError } = await supabase
      .from('Bundles')
      .select('tags')
      .eq('id', bundleId)
      .single();

    if (getError) throw getError;

    const currentTags = bundle.tags || [];
    const tagToRemove = tagName.toLowerCase();

    // Remove tag
    const updatedTags = currentTags.filter(t => t !== tagToRemove);

    // Update bundle
    const { data: updatedBundle, error: updateError } = await supabase
      .from('Bundles')
      .update({
        tags: updatedTags,
        primary_tag: updatedTags.length > 0 ? updatedTags[0] : null,
        updated_at: new Date().toISOString()
      })
      .eq('id', bundleId)
      .select()
      .single();

    if (updateError) throw updateError;

    console.log(`✅ Tag removed from bundle: ${bundleId}, tag: ${tagToRemove}`);

    res.status(200).json({
      success: true,
      message: 'Tag removed successfully',
      data: updatedBundle
    });

  } catch (error) {
    console.error('❌ Remove tag from bundle error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to remove tag',
      error: error.message
    });
  }
};

// ========================================
// EXPORTS
// ========================================

module.exports = {
  // Public routes
  getAllTags,
  getTagsWithCounts,
  getTagByName,
  getPopularTags,
  getTagStats,

  // Admin routes
  createTag,
  updateTag,
  deleteTag,

  // Bundle tag operations
  updateBundleTags,
  addTagToBundle,
  removeTagFromBundle
};