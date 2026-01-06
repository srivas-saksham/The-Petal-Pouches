// backend/src/controllers/adminOrderController.js
/**
 * Admin Orders Controller - FIXED ORDER STATS
 * Enhanced orders management with advanced search and filtering
 */

const supabase = require('../config/supabaseClient');

const AdminOrderController = {

  /**
   * Get all orders with advanced filters (ADMIN)
   * GET /api/admin/orders
   */
  async getAllOrders(req, res) {
    try {
      const {
        page = 1,
        limit = 20,
        status,
        payment_status,
        payment_method,
        from_date,
        to_date,
        search,
        sort = 'created_at',
        order = 'desc',
        delivery_mode
      } = req.query;

      console.log('📦 [Admin] Get orders:', { 
        page, limit, status, payment_status, search, delivery_mode 
      });

      const offset = (parseInt(page) - 1) * parseInt(limit);

      // ===== STEP 1: BUILD BASE QUERY =====
      let ordersQuery = supabase
        .from('Orders')
        .select(`
          id,
          user_id,
          status,
          subtotal,
          express_charge,
          discount,
          final_total,
          shipping_address,
          delivery_metadata,
          payment_status,
          payment_method,
          payment_id,
          created_at,
          placed_at,
          delivered_at,
          updated_at,
          bundle_type,
          gift_wrap,
          gift_message,
          notes,
          Users!inner(
            id,
            name,
            email,
            phone
          )
        `, { count: 'exact' });

      // ===== STEP 2: APPLY FILTERS =====
      if (status) {
        ordersQuery = ordersQuery.eq('status', status);
      }

      if (payment_status) {
        ordersQuery = ordersQuery.eq('payment_status', payment_status);
      }

      if (payment_method) {
        ordersQuery = ordersQuery.eq('payment_method', payment_method);
      }

      // Delivery mode filter (from JSONB)
      if (delivery_mode) {
        ordersQuery = ordersQuery.contains('delivery_metadata', { mode: delivery_mode });
      }

      // Date range
      if (from_date) {
        ordersQuery = ordersQuery.gte('created_at', from_date);
      }
      if (to_date) {
        ordersQuery = ordersQuery.lte('created_at', to_date);
      }

      // ===== STEP 3: SEARCH LOGIC (FIXED FOR SUPABASE) =====
      let orderIds = null;

      if (search && search.trim()) {
        const searchTerm = search.trim();
        console.log('🔍 Searching for:', searchTerm);

        // Check if it looks like a UUID (order_id or user_id)
        const isUUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(searchTerm);
        const isPartialUUID = /^[0-9a-f]{8}/i.test(searchTerm);
        
        if (isUUID) {
          // Full UUID - try exact match for order_id or user_id
          console.log('   → Exact UUID search');
          ordersQuery = ordersQuery.or(`id.eq.${searchTerm},user_id.eq.${searchTerm}`);
        } else if (isPartialUUID) {
          // Partial UUID - search using textSearch or contains
          console.log('   → Partial UUID search');
          
          // Get all orders and filter in memory (Supabase limitation for UUID LIKE)
          const { data: allOrders, error: allError } = await supabase
            .from('Orders')
            .select('id, user_id');
          
          if (!allError && allOrders) {
            const matchingIds = allOrders
              .filter(o => 
                o.id.toLowerCase().startsWith(searchTerm.toLowerCase()) ||
                o.user_id.toLowerCase().startsWith(searchTerm.toLowerCase())
              )
              .map(o => o.id);
            
            if (matchingIds.length === 0) {
              return res.status(200).json({
                success: true,
                data: [],
                metadata: {
                  totalCount: 0,
                  totalPages: 0,
                  currentPage: parseInt(page),
                  limit: parseInt(limit)
                }
              });
            }
            
            orderIds = matchingIds;
            console.log(`   → Found ${matchingIds.length} orders by partial UUID`);
          }
        } else {
          // Text search - user name, email, or bundle title
          console.log('   → Text search (user/bundle)');
          
          // Search for orders by user
          const { data: userOrders, error: userError } = await supabase
            .from('Orders')
            .select('id, Users!inner(name, email)')
            .or(`Users.name.ilike.%${searchTerm}%,Users.email.ilike.%${searchTerm}%`);

          let userOrderIds = userOrders?.map(o => o.id) || [];

          // Search for orders containing bundles with matching title
          const { data: bundleOrders, error: bundleError } = await supabase
            .from('Order_items')
            .select(`
              order_id,
              Bundles!inner(title)
            `)
            .ilike('Bundles.title', `%${searchTerm}%`);

          let bundleOrderIds = bundleOrders?.map(item => item.order_id) || [];

          // Combine both search results (unique order IDs)
          orderIds = [...new Set([...userOrderIds, ...bundleOrderIds])];

          console.log(`   → Found ${userOrderIds.length} orders by USER`);
          console.log(`   → Found ${bundleOrderIds.length} orders by BUNDLE`);
          console.log(`   → Total unique orders: ${orderIds.length}`);

          if (orderIds.length === 0) {
            return res.status(200).json({
              success: true,
              data: [],
              metadata: {
                totalCount: 0,
                totalPages: 0,
                currentPage: parseInt(page),
                limit: parseInt(limit)
              }
            });
          }
        }

        // Filter by found order IDs if we have them
        if (orderIds && orderIds.length > 0) {
          ordersQuery = ordersQuery.in('id', orderIds);
        }
      }

      // ===== STEP 4: SORTING =====
      const validSorts = ['created_at', 'final_total', 'status', 'placed_at'];
      const sortField = validSorts.includes(sort) ? sort : 'created_at';
      const ascending = order === 'asc';

      ordersQuery = ordersQuery.order(sortField, { ascending });

      // ===== STEP 5: PAGINATION =====
      ordersQuery = ordersQuery.range(offset, offset + parseInt(limit) - 1);

      // ===== STEP 6: EXECUTE QUERY =====
      const { data: orders, error: ordersError, count } = await ordersQuery;

      if (ordersError) {
        console.error('❌ Orders query error:', ordersError);
        throw ordersError;
      }

      console.log(`✅ Found ${orders?.length || 0} orders (total: ${count})`);

      if (!orders || orders.length === 0) {
        return res.status(200).json({
          success: true,
          data: [],
          metadata: {
            totalCount: 0,
            totalPages: 0,
            currentPage: parseInt(page),
            limit: parseInt(limit)
          }
        });
      }

      // ===== STEP 7: GET ORDER ITEMS (BUNDLES + PRODUCTS) - MANUAL JOIN =====
      const orderIdsToFetch = orders.map(o => o.id);

      // Fetch order items first
      const { data: orderItemsRaw, error: itemsError } = await supabase
        .from('Order_items')
        .select('*')
        .in('order_id', orderIdsToFetch);

      if (itemsError) {
        console.error('❌ Items query error:', itemsError);
        throw itemsError;
      }

      // Get unique bundle_ids and product_ids
      const bundleIds = [...new Set(orderItemsRaw.filter(i => i.bundle_id).map(i => i.bundle_id))];
      const productIds = [...new Set(orderItemsRaw.filter(i => i.product_id).map(i => i.product_id))];

      // Fetch bundles
      let bundlesData = {};
      if (bundleIds.length > 0) {
        const { data: bundles } = await supabase
          .from('Bundles')
          .select('id, title, img_url, price')
          .in('id', bundleIds);
        
        (bundles || []).forEach(b => {
          bundlesData[b.id] = b;
        });
      }

      // Fetch products
      let productsData = {};
      if (productIds.length > 0) {
        const { data: products } = await supabase
          .from('Products')
          .select('id, title, img_url, price')
          .in('id', productIds);
        
        (products || []).forEach(p => {
          productsData[p.id] = p;
        });
      }

      // ===== STEP 8: GROUP ITEMS BY ORDER WITH MERGED DATA =====
      const itemsByOrder = {};
      orderItemsRaw.forEach(item => {
        if (!itemsByOrder[item.order_id]) {
          itemsByOrder[item.order_id] = [];
        }
        
        const bundle = item.bundle_id ? bundlesData[item.bundle_id] : null;
        const product = item.product_id ? productsData[item.product_id] : null;
        
        itemsByOrder[item.order_id].push({
          bundle_id: item.bundle_id || null,
          product_id: item.product_id || null,
          bundle_title: item.bundle_title || product?.title || bundle?.title || 'Unknown Item',
          bundle_img: product?.img_url || bundle?.img_url || null,
          bundle_price: product?.price || bundle?.price || item.price,
          quantity: item.quantity,
          price: item.price,
          bundle_origin: item.bundle_origin || (product ? 'product' : 'brand-bundle')
        });
      });

      // ===== STEP 9: FORMAT RESPONSE =====
      const formattedOrders = orders.map(order => ({
        id: order.id,
        user_id: order.user_id,
        customer_name: order.Users.name,
        customer_email: order.Users.email,
        customer_phone: order.Users.phone,
        status: order.status,
        payment_status: order.payment_status,
        payment_method: order.payment_method,
        payment_id: order.payment_id,
        subtotal: order.subtotal,
        express_charge: order.express_charge,
        discount: order.discount,
        final_total: order.final_total,
        shipping_address: order.shipping_address,
        delivery_metadata: order.delivery_metadata || {},
        bundle_type: order.bundle_type,
        gift_wrap: order.gift_wrap,
        gift_message: order.gift_message,
        notes: order.notes,
        created_at: order.created_at,
        placed_at: order.placed_at,
        delivered_at: order.delivered_at,
        updated_at: order.updated_at,
        item_count: itemsByOrder[order.id]?.length || 0,
        items_preview: itemsByOrder[order.id] || []
      }));

      // ===== STEP 10: RETURN RESPONSE =====
      return res.status(200).json({
        success: true,
        data: formattedOrders,
        metadata: {
          totalCount: count,
          totalPages: Math.ceil(count / parseInt(limit)),
          currentPage: parseInt(page),
          limit: parseInt(limit),
          hasMore: count > (offset + formattedOrders.length)
        }
      });

    } catch (error) {
      console.error('❌ [Admin] Get orders error:', error);
      return res.status(500).json({
        success: false,
        message: 'Failed to fetch orders',
        error: process.env.NODE_ENV === 'development' ? error.message : undefined
      });
    }
  },

  /**
   * Get single order details (ADMIN)
   * GET /api/admin/orders/:id
   */
  async getOrderById(req, res) {
    try {
      const { id } = req.params;

      // Get order with user details
      const { data: order, error: orderError } = await supabase
        .from('Orders')
        .select(`
          *,
          Users!inner(
            id,
            name,
            email,
            phone
          )
        `)
        .eq('id', id)
        .single();

      if (orderError || !order) {
        return res.status(404).json({
          success: false,
          message: 'Order not found'
        });
      }

      // Get order items (bundles)
      const { data: items, error: itemsError } = await supabase
        .from('Order_items')
        .select(`
          *,
          Bundles(
            id,
            title,
            description,
            img_url,
            price
          )
        `)
        .eq('order_id', id);

      if (itemsError) throw itemsError;

      // Format items
      const formattedItems = (items || []).map(item => ({
        id: item.id,
        bundle_id: item.bundle_id,
        bundle_title: item.bundle_title || item.Bundles?.title,
        bundle_description: item.Bundles?.description,
        bundle_img: item.Bundles?.img_url,
        bundle_price: item.Bundles?.price,
        quantity: item.quantity,
        price: item.price,
        bundle_origin: item.bundle_origin
      }));

      // Format response
      const formattedOrder = {
        ...order,
        customer_name: order.Users.name,
        customer_email: order.Users.email,
        customer_phone: order.Users.phone,
        items: formattedItems,
        items_preview: formattedItems,
        item_count: formattedItems.length
      };

      return res.status(200).json({
        success: true,
        data: formattedOrder
      });

    } catch (error) {
      console.error('❌ [Admin] Get order by ID error:', error);
      return res.status(500).json({
        success: false,
        message: 'Failed to fetch order details'
      });
    }
  },

  /**
   * Update order status (ADMIN)
   * PATCH /api/admin/orders/:id/status
   */
  async updateOrderStatus(req, res) {
    try {
      const { id } = req.params;
      const { status } = req.body;

      const validStatuses = ['pending', 'confirmed', 'processing', 'shipped', 'delivered', 'cancelled'];
      
      if (!validStatuses.includes(status)) {
        return res.status(400).json({
          success: false,
          message: 'Invalid status'
        });
      }

      const { data: order, error } = await supabase
        .from('Orders')
        .update({
          status,
          updated_at: new Date().toISOString(),
          // Set delivered_at if status is delivered
          ...(status === 'delivered' && { delivered_at: new Date().toISOString() })
        })
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;

      console.log(`✅ Order ${id} status updated to: ${status}`);

      return res.status(200).json({
        success: true,
        message: `Order status updated to ${status}`,
        data: order
      });

    } catch (error) {
      console.error('❌ Update order status error:', error);
      return res.status(500).json({
        success: false,
        message: 'Failed to update order status'
      });
    }
  },

  /**
   * Get order statistics (ADMIN) - FIXED
   * GET /api/admin/orders/stats
   */
  async getOrderStats(req, res) {
    try {
      console.log('📊 [Backend] Fetching order stats...');

      // ✅ FIX: Get ALL orders without any filters
      const { data: orders, error } = await supabase
        .from('Orders')
        .select('*');

      if (error) {
        console.error('❌ Error fetching orders:', error);
        throw error;
      }

      console.log(`📊 [Backend] Total orders found: ${orders?.length || 0}`);

      // ✅ FIX: Calculate stats with correct field names
      const stats = {
        // ✅ CRITICAL: Use total_orders (not "total")
        total_orders: orders?.length || 0,
        
        // Status breakdown
        pending: orders?.filter(o => o.status === 'pending').length || 0,
        confirmed: orders?.filter(o => o.status === 'confirmed').length || 0,
        processing: orders?.filter(o => o.status === 'processing').length || 0,
        shipped: orders?.filter(o => o.status === 'shipped').length || 0,
        in_transit: orders?.filter(o => o.status === 'in_transit').length || 0,
        out_for_delivery: orders?.filter(o => o.status === 'out_for_delivery').length || 0,
        delivered: orders?.filter(o => o.status === 'delivered').length || 0,
        cancelled: orders?.filter(o => o.status === 'cancelled').length || 0,
        failed: orders?.filter(o => o.status === 'failed').length || 0,
        rto_initiated: orders?.filter(o => o.status === 'rto_initiated').length || 0,
        rto_delivered: orders?.filter(o => o.status === 'rto_delivered').length || 0,
        
        // Payment status breakdown
        paid: orders?.filter(o => o.payment_status === 'paid').length || 0,
        unpaid: orders?.filter(o => o.payment_status === 'unpaid').length || 0,
        refunded: orders?.filter(o => o.payment_status === 'refunded').length || 0,
        
        // Payment method breakdown
        cod: orders?.filter(o => o.payment_method === 'cod').length || 0,
        online: orders?.filter(o => o.payment_method === 'online' || o.payment_method === 'razorpay').length || 0,
        
        // Revenue (exclude cancelled orders)
        total_spent: orders
          ?.filter(o => o.status !== 'cancelled')
          .reduce((sum, o) => sum + (parseFloat(o.final_total) || 0), 0) || 0,
        
        // Delivery mode breakdown
        surface: orders?.filter(o => {
          try {
            const metadata = typeof o.delivery_metadata === 'string' 
              ? JSON.parse(o.delivery_metadata) 
              : o.delivery_metadata;
            return metadata?.mode === 'surface';
          } catch {
            return false;
          }
        }).length || 0,
        
        express: orders?.filter(o => {
          try {
            const metadata = typeof o.delivery_metadata === 'string' 
              ? JSON.parse(o.delivery_metadata) 
              : o.delivery_metadata;
            return metadata?.mode === 'express';
          } catch {
            return false;
          }
        }).length || 0,
        
        // Average order value
        avg_order_value: orders?.length > 0 
          ? Math.round(orders.reduce((sum, o) => sum + (parseFloat(o.final_total) || 0), 0) / orders.length)
          : 0,
      };

      console.log('📊 [Backend] Stats calculated:', {
        total_orders: stats.total_orders,
        confirmed: stats.confirmed,
        pending: stats.pending,
        delivered: stats.delivered,
        cancelled: stats.cancelled
      });

      return res.status(200).json({
        success: true,
        stats  // ✅ Return as "stats" field
      });

    } catch (error) {
      console.error('❌ Get order stats error:', error);
      return res.status(500).json({
        success: false,
        message: 'Failed to fetch order statistics',
        stats: {
          total_orders: 0,
          pending: 0,
          confirmed: 0,
          processing: 0,
          shipped: 0,
          in_transit: 0,
          out_for_delivery: 0,
          delivered: 0,
          cancelled: 0,
          failed: 0,
          rto_initiated: 0,
          rto_delivered: 0,
          paid: 0,
          unpaid: 0,
          refunded: 0,
          cod: 0,
          online: 0,
          surface: 0,
          express: 0,
          total_spent: 0,
          avg_order_value: 0
        }
      });
    }
  }

};

module.exports = AdminOrderController;