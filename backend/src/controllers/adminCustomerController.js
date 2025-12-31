// backend/src/controllers/adminCustomerController.js
/**
 * Admin Customer Controller - Complete Implementation
 * Handles all customer-related admin operations with proper calculations
 * Uses Supabase client
 */

const supabase = require('../config/supabaseClient');

const AdminCustomerController = {

  /**
   * GET /api/admin/customers/stats
   * Returns overview statistics for dashboard
   */
  async getCustomerStats(req, res) {
    try {
      console.log('📊 [Admin] Fetching customer stats...');

      // Get all users
      const { data: users, error } = await supabase
        .from('Users')
        .select('id, is_active, created_at');

      if (error) throw error;

      // Calculate stats
      const now = new Date();
      const thirtyDaysAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);

      const stats = {
        total: users.length,
        active: users.filter(u => u.is_active === true).length,
        inactive: users.filter(u => u.is_active === false).length,
        new_this_month: users.filter(u => new Date(u.created_at) >= thirtyDaysAgo).length
      };

      console.log('✅ Stats calculated:', stats);

      res.json({
        success: true,
        data: stats
      });
    } catch (error) {
      console.error('❌ Error fetching customer stats:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to fetch customer statistics',
        error: error.message
      });
    }
  },

  /**
   * GET /api/admin/customers
   * Returns paginated list of customers with aggregated order data
   */
  async getAllCustomers(req, res) {
    try {
      const {
        status = 'all',
        search = '',
        sort = 'created_at',
        order = 'desc',
        page = 1,
        limit = 20
      } = req.query;

      console.log('👥 [Admin] Get customers:', { page, limit, status, search, sort });

      const offset = (parseInt(page) - 1) * parseInt(limit);

      // ===== STEP 1: BUILD BASE QUERY =====
      let usersQuery = supabase
        .from('Users')
        .select('*', { count: 'exact' });

      // ===== STEP 2: APPLY FILTERS =====
      if (status === 'active') {
        usersQuery = usersQuery.eq('is_active', true);
      } else if (status === 'inactive') {
        usersQuery = usersQuery.eq('is_active', false);
      }

      // Search filter
      if (search && search.trim()) {
        const searchTerm = search.trim();
        const isUUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(searchTerm);
        const isPartialUUID = /^[0-9a-f]{8}/i.test(searchTerm);

        if (isUUID) {
          usersQuery = usersQuery.eq('id', searchTerm);
        } else if (isPartialUUID) {
          // Get all users and filter in memory for partial UUID
          const { data: allUsers } = await supabase.from('Users').select('id');
          const matchingIds = allUsers
            ?.filter(u => u.id.toLowerCase().startsWith(searchTerm.toLowerCase()))
            .map(u => u.id) || [];
          
          if (matchingIds.length === 0) {
            return res.json({
              success: true,
              data: [],
              metadata: { totalCount: 0, totalPages: 0, page: parseInt(page), limit: parseInt(limit) }
            });
          }
          usersQuery = usersQuery.in('id', matchingIds);
        } else {
          // Text search - name, email, phone
          usersQuery = usersQuery.or(`name.ilike.%${searchTerm}%,email.ilike.%${searchTerm}%,phone.ilike.%${searchTerm}%`);
        }
      }

      // ===== STEP 3: SORTING =====
      const sortMapping = {
        'created_at': { column: 'created_at', ascending: order === 'asc' },
        'created_at_asc': { column: 'created_at', ascending: true },
        'name_asc': { column: 'name', ascending: true },
        'name_desc': { column: 'name', ascending: false },
        'last_login': { column: 'last_login', ascending: false }
      };

      const sortConfig = sortMapping[sort] || { column: 'created_at', ascending: false };
      usersQuery = usersQuery.order(sortConfig.column, { ascending: sortConfig.ascending, nullsFirst: false });

      // ===== STEP 4: PAGINATION =====
      usersQuery = usersQuery.range(offset, offset + parseInt(limit) - 1);

      // ===== STEP 5: EXECUTE QUERY =====
      const { data: users, error: usersError, count } = await usersQuery;

      if (usersError) throw usersError;

      if (!users || users.length === 0) {
        return res.json({
          success: true,
          data: [],
          metadata: { totalCount: 0, totalPages: 0, page: parseInt(page), limit: parseInt(limit) }
        });
      }

      console.log(`✅ Found ${users.length} users (total: ${count})`);

      // ===== STEP 6: GET ORDER STATS FOR EACH USER =====
      const userIds = users.map(u => u.id);

      const { data: orders, error: ordersError } = await supabase
        .from('Orders')
        .select('user_id, id, status, final_total, created_at')
        .in('user_id', userIds);

      if (ordersError) throw ordersError;

      // ===== STEP 7: AGGREGATE ORDER DATA =====
      const ordersByUser = {};
      (orders || []).forEach(order => {
        if (!ordersByUser[order.user_id]) {
          ordersByUser[order.user_id] = {
            total_orders: 0,
            completed_orders: 0,
            cancelled_orders: 0,
            total_spent: 0,
            first_order_date: null,
            last_order_date: null
          };
        }

        const userOrders = ordersByUser[order.user_id];
        userOrders.total_orders++;

        // Count completed orders
        if (['delivered', 'confirmed', 'processing', 'shipped'].includes(order.status)) {
          userOrders.completed_orders++;
          userOrders.total_spent += order.final_total || 0;
        }

        // Count cancelled
        if (order.status === 'cancelled') {
          userOrders.cancelled_orders++;
        }

        // Track dates
        const orderDate = new Date(order.created_at);
        if (!userOrders.first_order_date || orderDate < new Date(userOrders.first_order_date)) {
          userOrders.first_order_date = order.created_at;
        }
        if (!userOrders.last_order_date || orderDate > new Date(userOrders.last_order_date)) {
          userOrders.last_order_date = order.created_at;
        }
      });

      // ===== STEP 8: FORMAT RESPONSE =====
      const formattedUsers = users.map(user => {
        const orderStats = ordersByUser[user.id] || {
          total_orders: 0,
          completed_orders: 0,
          cancelled_orders: 0,
          total_spent: 0,
          first_order_date: null,
          last_order_date: null
        };

        return {
          id: user.id,
          name: user.name,
          email: user.email,
          phone: user.phone,
          is_active: user.is_active,
          email_verified: user.email_verified,
          created_at: user.created_at,
          last_login: user.last_login,
          total_orders: orderStats.total_orders,
          completed_orders: orderStats.completed_orders,
          cancelled_orders: orderStats.cancelled_orders,
          total_spent: orderStats.total_spent,
          first_order_date: orderStats.first_order_date,
          last_order_date: orderStats.last_order_date
        };
      });

      // ===== STEP 9: RETURN RESPONSE =====
      return res.json({
        success: true,
        data: formattedUsers,
        metadata: {
          totalCount: count,
          totalPages: Math.ceil(count / parseInt(limit)),
          page: parseInt(page),
          limit: parseInt(limit)
        }
      });

    } catch (error) {
      console.error('❌ Error fetching customers:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to fetch customers',
        error: error.message
      });
    }
  },

  /**
   * GET /api/admin/customers/:id
   * Returns detailed customer information with complete order history
   */
  async getCustomerById(req, res) {
    try {
      const { id } = req.params;

      console.log('👤 [Admin] Get customer details:', id);

      // ===== STEP 1: GET CUSTOMER =====
      const { data: customer, error: customerError } = await supabase
        .from('Users')
        .select('*')
        .eq('id', id)
        .single();

      if (customerError || !customer) {
        return res.status(404).json({
          success: false,
          message: 'Customer not found'
        });
      }

      // ===== STEP 2: GET ALL ORDERS =====
      const { data: orders, error: ordersError } = await supabase
        .from('Orders')
        .select('*')
        .eq('user_id', id)
        .order('created_at', { ascending: false });

      if (ordersError) throw ordersError;

      // ===== STEP 3: GET ORDER ITEMS FOR ALL ORDERS =====
      const orderIds = (orders || []).map(o => o.id);
      let orderItems = [];

      if (orderIds.length > 0) {
        const { data: items, error: itemsError } = await supabase
          .from('Order_items')
          .select(`
            *,
            Bundles(id, title, img_url, price)
          `)
          .in('order_id', orderIds);

        if (itemsError) throw itemsError;
        orderItems = items || [];
      }

      // ===== STEP 4: GET PAYMENTS =====
      let payments = [];
      if (orderIds.length > 0) {
        const { data: paymentsData, error: paymentsError } = await supabase
          .from('Payments')
          .select('*')
          .eq('user_id', id);

        if (paymentsError) throw paymentsError;
        payments = paymentsData || [];
      }

      // ===== STEP 5: CALCULATE COMPREHENSIVE STATS =====
      const now = new Date();
      const completedStatuses = ['delivered', 'confirmed', 'processing', 'shipped'];
      
      const completedOrders = orders?.filter(o => completedStatuses.includes(o.status)) || [];
      const cancelledOrders = orders?.filter(o => o.status === 'cancelled') || [];

      const total_spent = completedOrders.reduce((sum, o) => sum + (o.final_total || 0), 0);
      const avg_order_value = completedOrders.length > 0 ? total_spent / completedOrders.length : 0;

      // Days since registration
      const registrationDate = new Date(customer.created_at);
      const days_since_registration = Math.floor((now - registrationDate) / (1000 * 60 * 60 * 24));

      // Last order date
      const lastOrder = orders && orders.length > 0 ? orders[0] : null;
      const last_order_date = lastOrder?.created_at || null;
      const days_since_last_order = last_order_date 
        ? Math.floor((now - new Date(last_order_date)) / (1000 * 60 * 60 * 24))
        : null;

      const is_inactive_90_days = days_since_last_order !== null && days_since_last_order > 90;

      // Preferred payment method
      const paymentMethods = completedOrders.map(o => o.payment_method).filter(Boolean);
      const preferred_payment_method = paymentMethods.length > 0
        ? paymentMethods.sort((a, b) => 
            paymentMethods.filter(v => v === a).length - paymentMethods.filter(v => v === b).length
          ).pop()
        : 'N/A';

      // Common delivery location
      const locations = completedOrders
        .map(o => o.shipping_address?.city && o.shipping_address?.state 
          ? `${o.shipping_address.city}, ${o.shipping_address.state}` 
          : null)
        .filter(Boolean);
      
      const avg_delivery_location = locations.length > 0
        ? locations.sort((a, b) => 
            locations.filter(v => v === a).length - locations.filter(v => v === b).length
          ).pop()
        : 'N/A';

      // Payment failure rate
      const failedPayments = payments.filter(p => p.is_success === false).length;
      const payment_failure_rate = payments.length > 0
        ? ((failedPayments / payments.length) * 100).toFixed(2)
        : 0;

      // Favorite bundles (top 3)
      const bundleCounts = {};
      orderItems.forEach(item => {
        const bundleTitle = item.bundle_title || item.Bundles?.title || 'Unknown';
        bundleCounts[bundleTitle] = (bundleCounts[bundleTitle] || 0) + 1;
      });

      const favorite_bundles = Object.entries(bundleCounts)
        .sort((a, b) => b[1] - a[1])
        .slice(0, 3)
        .map(([bundle_title, count]) => ({ bundle_title, count }));

      // First and last order dates
      const first_order_date = orders && orders.length > 0 
        ? orders[orders.length - 1].created_at 
        : null;

      // ===== STEP 6: FORMAT ORDERS WITH ITEMS =====
      const ordersWithItems = (orders || []).map(order => {
        const items = orderItems
          .filter(item => item.order_id === order.id)
          .map(item => ({
            id: item.id,
            bundle_id: item.bundle_id,
            bundle_title: item.bundle_title || item.Bundles?.title || 'Unknown Bundle',
            quantity: item.quantity,
            price: item.price
          }));

        return {
          ...order,
          Order_items: items
        };
      });

      // ===== STEP 7: RETURN RESPONSE =====
      res.json({
        success: true,
        data: {
          customer: {
            id: customer.id,
            name: customer.name,
            email: customer.email,
            phone: customer.phone,
            is_active: customer.is_active,
            email_verified: customer.email_verified,
            created_at: customer.created_at,
            updated_at: customer.updated_at,
            last_login: customer.last_login
          },
          stats: {
            total_orders: orders?.length || 0,
            completed_orders: completedOrders.length,
            cancelled_orders: cancelledOrders.length,
            total_spent: parseFloat(total_spent.toFixed(2)),
            clv: parseFloat(total_spent.toFixed(2)),
            avg_order_value: parseFloat(avg_order_value.toFixed(2)),
            first_order_date,
            last_order_date,
            days_since_registration,
            days_since_last_order,
            is_inactive_90_days,
            preferred_payment_method,
            avg_delivery_location,
            payment_failure_rate: parseFloat(payment_failure_rate),
            favorite_bundles
          },
          orders: ordersWithItems
        }
      });

    } catch (error) {
      console.error('❌ Error fetching customer details:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to fetch customer details',
        error: error.message
      });
    }
  },

  /**
   * PUT /api/admin/customers/:id/status
   * Toggle customer active/inactive status
   */
  async toggleCustomerStatus(req, res) {
    try {
      const { id } = req.params;

      // Get current status
      const { data: user, error: fetchError } = await supabase
        .from('Users')
        .select('is_active')
        .eq('id', id)
        .single();

      if (fetchError || !user) {
        return res.status(404).json({
          success: false,
          message: 'Customer not found'
        });
      }

      // Toggle status
      const { data: updatedUser, error: updateError } = await supabase
        .from('Users')
        .update({
          is_active: !user.is_active,
          updated_at: new Date().toISOString()
        })
        .eq('id', id)
        .select('id, name, email, is_active')
        .single();

      if (updateError) throw updateError;

      console.log(`✅ Customer ${id} status updated to: ${updatedUser.is_active ? 'active' : 'inactive'}`);

      res.json({
        success: true,
        message: `Customer ${updatedUser.is_active ? 'activated' : 'deactivated'} successfully`,
        data: updatedUser
      });

    } catch (error) {
      console.error('❌ Error toggling customer status:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to update customer status',
        error: error.message
      });
    }
  }
};

module.exports = AdminCustomerController;