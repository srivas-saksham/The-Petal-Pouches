// backend/src/controllers/shopController.js
// Unified Shop Controller - Handles both Products and Bundles

const supabase = require('../config/supabaseClient');

const ShopController = {

  /**
   * Get all shop items (products + bundles)
   * GET /api/shop/items
   * Query params: page, limit, type (all|products|bundles), sort, search, min_price, max_price, in_stock, tags
   */
  getAllItems: async (req, res) => {
    try {
      const {
        page = 1,
        limit = 20,
        type = 'all', // all | products | bundles
        sort = 'created_at',
        order = 'desc',
        search = '',
        min_price = '',
        max_price = '',
        in_stock = '',
        tags = ''
      } = req.query;

      console.log('📥 Get shop items request:', { type, page, limit, sort, search, tags });

      const pageNum = parseInt(page);
      const limitNum = parseInt(limit);
      const from = (pageNum - 1) * limitNum;
      const to = from + limitNum - 1;

      let allItems = [];
      let totalCount = 0;

      // Fetch Products with Product_images
      if (type === 'all' || type === 'products') {
        let productQuery = supabase
          .from('Products')
          .select(`
            *,
            Product_images (
              id,
              img_url,
              is_primary,
              display_order
            )
          `, { count: 'exact' })
          .eq('is_sellable', true);

        // Filters
        if (search && search.trim()) {
          productQuery = productQuery.ilike('title', `%${search.trim()}%`);
        }

        if (min_price) {
          productQuery = productQuery.gte('price', parseInt(min_price));
        }

        if (max_price) {
          productQuery = productQuery.lte('price', parseInt(max_price));
        }

        if (in_stock === 'true') {
          productQuery = productQuery.gt('stock', 0);
        }

        // 🆕 NEW: Add tag filtering for products
        if (tags && tags.trim()) {
          const tagArray = tags.split(',').map(t => t.trim().toLowerCase()).filter(t => t.length > 0);
          console.log(`🏷️ Filtering products by tags:`, tagArray);
          
          tagArray.forEach(tag => {
            productQuery = productQuery.filter('tags', 'cs', `["${tag}"]`);
          });
        }

        // Sorting
        const ascending = order === 'asc';
        productQuery = productQuery.order(sort, { ascending });

        const { data: products, error: productError, count: productCount } = await productQuery;

        if (productError) throw productError;

        allItems = allItems.concat(
          (products || []).map(p => {
            // Find primary image for backward compatibility
            const primaryImage = p.Product_images?.find(img => img.is_primary);
            
            return {
              ...p,
              img_url: primaryImage ? primaryImage.img_url : p.img_url, // Keep backward compatibility
              item_type: 'product',
              stock_limit: p.stock,
              original_price: p.price,
              discount_percent: 0,
              savings: 0
            };
          })
        );

        totalCount += productCount || 0;
      }

      // Fetch Bundles
      if (type === 'all' || type === 'bundles') {
        let bundleQuery = supabase
          .from('Bundles')
          .select(`
            *,
            Bundle_items (
              id,
              quantity,
              product_id,
              Products (
                id,
                title,
                price,
                img_url
              )
            )
          `, { count: 'exact' })
          .eq('is_active', true);

        // Filters
        if (search && search.trim()) {
          bundleQuery = bundleQuery.ilike('title', `%${search.trim()}%`);
        }

        if (min_price) {
          bundleQuery = bundleQuery.gte('price', parseInt(min_price));
        }

        if (max_price) {
          bundleQuery = bundleQuery.lte('price', parseInt(max_price));
        }

        if (in_stock === 'true') {
          bundleQuery = bundleQuery.not('stock_limit', 'is', null);
          bundleQuery = bundleQuery.gt('stock_limit', 0);
        }

        // Tag filtering
        if (tags && tags.trim()) {
          const tagArray = tags.split(',').map(t => t.trim().toLowerCase()).filter(t => t.length > 0);
          tagArray.forEach(tag => {
            bundleQuery = bundleQuery.filter('tags', 'cs', `["${tag}"]`);
          });
        }

        // Sorting
        const ascending = order === 'asc';
        bundleQuery = bundleQuery.order(sort, { ascending });

        const { data: bundles, error: bundleError, count: bundleCount } = await bundleQuery;

        if (bundleError) throw bundleError;

        // 🆕 NEW: Fetch Bundle_images for each bundle
        const bundlesWithImages = await Promise.all(
          (bundles || []).map(async (bundle) => {
            // Fetch images for this bundle
            const { data: images } = await supabase
              .from('Bundle_images')
              .select('*')
              .eq('bundle_id', bundle.id)
              .order('display_order', { ascending: true });

            // Find primary image for backward compatibility
            const primaryImage = images?.find(img => img.is_primary);

            return {
              ...bundle,
              Bundle_images: images || [], // Add images array
              img_url: primaryImage ? primaryImage.img_url : bundle.img_url, // Keep backward compatibility
              item_type: 'bundle',
              product_count: bundle.Bundle_items?.length || 0,
              savings: bundle.original_price ? bundle.original_price - bundle.price : 0
            };
          })
        );

        allItems = allItems.concat(bundlesWithImages);
        totalCount += bundleCount || 0;
      }

      // Sort combined results
      allItems.sort((a, b) => {
        if (sort === 'price') {
          return order === 'asc' ? a.price - b.price : b.price - a.price;
        }
        if (sort === 'created_at') {
          return order === 'asc'
            ? new Date(a.created_at) - new Date(b.created_at)
            : new Date(b.created_at) - new Date(a.created_at);
        }
        return 0;
      });

      // Pagination
      const paginatedItems = allItems.slice(from, to + 1);
      const totalPages = Math.ceil(totalCount / limitNum);

      res.status(200).json({
        success: true,
        data: paginatedItems,
        metadata: {
          totalCount,
          totalPages,
          currentPage: pageNum,
          limit: limitNum,
          hasMore: pageNum < totalPages,
          type
        }
      });

    } catch (error) {
      console.error('❌ Get shop items error:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to fetch shop items',
        error: error.message
      });
    }
  },

  /**
   * Get single item by ID and type
   * GET /api/shop/:type/:id
   * Params: type (product|bundle), id (UUID)
   */
  getItemById: async (req, res) => {
    try {
      const { type, id } = req.params;

      if (!['product', 'bundle'].includes(type)) {
        return res.status(400).json({
          success: false,
          message: 'Invalid item type. Must be "product" or "bundle"'
        });
      }

      if (type === 'product') {
        const { data, error } = await supabase
          .from('Products')
          .select(`
            *,
            Product_images (
              id,
              img_url,
              is_primary,
              display_order
            )
          `)
          .eq('id', id)
          .single();

        if (error) throw error;
        
        // 🔒 NEW: SECURITY - Prevent access to bundle-only products
        if (data.is_sellable === false) {
          return res.status(403).json({
            success: false,
            message: 'This product is only available as part of a bundle'
          });
        }

        res.status(200).json({
          success: true,
          data: {
            ...data,
            item_type: 'product'
          }
        });
      } else {
        const { data, error } = await supabase
          .from('Bundles')
          .select(`
            *,
            Bundle_items (
              id,
              quantity,
              product_id,
              Products (
                id,
                title,
                description,
                price,
                img_url
              )
            )
          `)
          .eq('id', id)
          .single();

        if (error) throw error;

        res.status(200).json({
          success: true,
          data: {
            ...data,
            item_type: 'bundle',
            product_count: data.Bundle_items?.length || 0
          }
        });
      }

    } catch (error) {
      console.error('❌ Get item error:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to fetch item',
        error: error.message
      });
    }
  }

};

module.exports = ShopController;