// frontend/src/services/statsService.js - COMPLETE VERSION WITH TOP BUNDLES

import { getProductStats, getProducts } from './productService';
import { getAdminOrderStats, getRevenuByPeriod } from './orderService';
import { getCategories } from './categoryService';
import bundleService from './bundleService';
import { apiRequest } from './api';
import adminCustomerService from './adminCustomerService';

const API_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000';

/**
 * Get bundle statistics with stock breakdown
 */
const getBundleStats = async () => {
  try {
    const result = await bundleService.getAllBundles({ limit: 10000 });
    
    if (!result || !result.data) {
      return {
        success: false,
        data: {
          total: 0,
          active: 0,
          inactive: 0,
          low_stock: 0,
          out_of_stock: 0,
        },
      };
    }

    // Handle both array and nested data structure
    const bundles = Array.isArray(result.data) 
      ? result.data 
      : result.data.data || [];
    
    // ✅ CALCULATE BUNDLE STOCK BREAKDOWN
    const stats = {
      total: bundles.length,
      active: bundles.filter(b => b.is_active).length,
      inactive: bundles.filter(b => !b.is_active).length,
      low_stock: bundles.filter(b => {
        const stock = b.stock_limit || 0;
        return stock > 0 && stock <= 3;
      }).length,
      out_of_stock: bundles.filter(b => {
        const stock = b.stock_limit || 0;
        return stock === 0;
      }).length,
    };

    console.log('📦 Bundle stats calculated:', stats);

    return {
      success: true,
      data: stats,
    };
  } catch (error) {
    console.error('Error getting bundle stats:', error);
    return {
      success: false,
      data: {
        total: 0,
        active: 0,
        inactive: 0,
        low_stock: 0,
        out_of_stock: 0,
      },
    };
  }
};

/**
 * Get complete dashboard statistics
 */
export const getDashboardStats = async () => {
  try {
    console.log('📊 [statsService] Fetching dashboard stats...');

    // Fetch all stats in parallel
    const [
      productStatsResult,
      bundleStatsResult,
      orderStatsResult,
      categoryResult,
      customerStatsResult,
    ] = await Promise.all([
      getProductStats(),
      getBundleStats(),
      getAdminOrderStats(),
      getCategories(),
      adminCustomerService.getCustomerStats(),
    ]);

    // Extract data with fallbacks
    const productStats = productStatsResult.success ? productStatsResult.data : {};
    const bundleStats = bundleStatsResult.success ? bundleStatsResult.data : {};
    
    // ✅ Extract order stats properly (backend returns { success: true, stats: {...} })
    const orderStatsData = orderStatsResult.success 
      ? (orderStatsResult.stats || orderStatsResult.data || {})
      : {};
    
    console.log('📊 [statsService] Raw order stats result:', {
      success: orderStatsResult.success,
      hasStats: !!orderStatsResult.stats,
      hasData: !!orderStatsResult.data,
      total_orders: orderStatsData.total_orders,
    });

    // Extract customer stats
    const customerStats = customerStatsResult.success ? customerStatsResult.data : { total: 0, active: 0 };
    
    // Handle categories data structure
    const categoriesData = categoryResult.success ? categoryResult.data : [];
    const categories = Array.isArray(categoriesData) 
      ? categoriesData 
      : categoriesData.data || [];

    // ✅ Build the stats object correctly
    const dashboardStats = {
      revenue: {
        current: orderStatsData.total_spent || 0,
        previous: 0,
        change: 0,
      },
      orders: {
        current: orderStatsData.total_orders || 0,
        previous: 0,
        change: 0,
      },
      products: {
        current: productStats.total || 0,
        previous: 0,
        change: 0,
      },
      customers: {
        current: customerStats.total || 0,
        previous: 0,
        change: 0,
      },
      // ✅ Pass through ALL orderBreakdown fields
      orderBreakdown: {
        total_orders: orderStatsData.total_orders || 0,
        pending: orderStatsData.pending || 0,
        confirmed: orderStatsData.confirmed || 0,
        processing: orderStatsData.processing || 0,
        shipped: orderStatsData.shipped || 0,
        in_transit: orderStatsData.in_transit || 0,
        out_for_delivery: orderStatsData.out_for_delivery || 0,
        delivered: orderStatsData.delivered || 0,
        cancelled: orderStatsData.cancelled || 0,
        failed: orderStatsData.failed || 0,
        rto_initiated: orderStatsData.rto_initiated || 0,
        rto_delivered: orderStatsData.rto_delivered || 0,
        paid: orderStatsData.paid || 0,
        unpaid: orderStatsData.unpaid || 0,
        refunded: orderStatsData.refunded || 0,
        cod: orderStatsData.cod || 0,
        online: orderStatsData.online || 0,
        surface: orderStatsData.surface || 0,
        express: orderStatsData.express || 0,
        avg_order_value: orderStatsData.avg_order_value || 0,
      },
      productBreakdown: productStats,
      // ✅ BUNDLE BREAKDOWN WITH STOCK INFO
      bundleBreakdown: bundleStats,
      categoryCount: categories.length,
    };

    console.log('📊 [statsService] Final dashboard stats:', {
      'orders.current': dashboardStats.orders.current,
      'orderBreakdown.total_orders': dashboardStats.orderBreakdown.total_orders,
      'bundleBreakdown.low_stock': dashboardStats.bundleBreakdown.low_stock,
      'bundleBreakdown.out_of_stock': dashboardStats.bundleBreakdown.out_of_stock,
    });

    return {
      success: true,
      data: dashboardStats,
    };
  } catch (error) {
    console.error('❌ [statsService] Error getting dashboard stats:', error);
    return {
      success: false,
      error: error.message,
      data: {
        revenue: { current: 0, previous: 0, change: 0 },
        orders: { current: 0, previous: 0, change: 0 },
        products: { current: 0, previous: 0, change: 0 },
        customers: { current: 0, previous: 0, change: 0 },
        productBreakdown: {},
        bundleBreakdown: {
          total: 0,
          active: 0,
          inactive: 0,
          low_stock: 0,
          out_of_stock: 0,
        },
        orderBreakdown: {
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
          avg_order_value: 0,
        },
        categoryCount: 0,
      },
    };
  }
};

/**
 * Get statistics for a specific date range
 */
export const getStatsForDateRange = async (startDate, endDate) => {
  try {
    const revenueResult = await getRevenuByPeriod(startDate, endDate);
    
    return {
      success: true,
      data: revenueResult.data,
    };
  } catch (error) {
    console.error('Error getting stats for date range:', error);
    return {
      success: false,
      error: error.message,
      data: null,
    };
  }
};

/**
 * Get monthly revenue data (last 6 months)
 */
export const getMonthlyRevenue = async () => {
  const monthlyData = [];
  const currentDate = new Date();
  
  for (let i = 5; i >= 0; i--) {
    const date = new Date(currentDate.getFullYear(), currentDate.getMonth() - i, 1);
    const startDate = new Date(date.getFullYear(), date.getMonth(), 1).toISOString().split('T')[0];
    const endDate = new Date(date.getFullYear(), date.getMonth() + 1, 0).toISOString().split('T')[0];
    
    const result = await getRevenuByPeriod(startDate, endDate);
    
    monthlyData.push({
      month: date.toLocaleString('default', { month: 'short' }),
      revenue: result.success ? result.data.total_revenue : 0,
      orders: result.success ? result.data.order_count : 0,
    });
  }
  
  return {
    success: true,
    data: monthlyData,
  };
};

/**
 * Get category distribution (products per category)
 */
export const getCategoryDistribution = async () => {
  try {
    const [categoryResult, productResult] = await Promise.all([
      getCategories(),
      getProducts({ limit: 10000 }),
    ]);

    if (!categoryResult.success || !productResult.success) {
      return {
        success: false,
        data: [],
      };
    }

    const categoriesData = categoryResult.data;
    const categories = Array.isArray(categoriesData) 
      ? categoriesData 
      : categoriesData.data || [];

    const productsData = productResult.data;
    const products = Array.isArray(productsData) 
      ? productsData 
      : productsData.data || [];

    console.log('📊 Category distribution - Categories:', categories.length, 'Products:', products.length);

    const distribution = categories.map(cat => {
      const count = products.filter(p => p.category_id === cat.id).length;
      return {
        name: cat.name,
        value: count,
        count: count,
        percentage: products.length > 0 
          ? Math.round((count / products.length) * 100) 
          : 0,
      };
    });

    distribution.sort((a, b) => b.count - a.count);

    return {
      success: true,
      data: distribution,
    };
  } catch (error) {
    console.error('Error getting category distribution:', error);
    return {
      success: false,
      error: error.message,
      data: [],
    };
  }
};

/**
 * ✅ UPDATED: Get top bundles by actual sales (from Order_items)
 * Previously returned products, now returns actual best-selling bundles
 */
export const getTopProducts = async (limit = 5) => {
  try {
    const token = sessionStorage.getItem('admin_token');
    
    console.log('📊 Fetching top bundles from Order_items...');

    // Step 1: Get all orders with items
    const ordersResponse = await fetch(`${API_URL}/api/admin/orders?limit=10000`, {
      headers: { 'Authorization': `Bearer ${token}` }
    });
    const ordersResult = await ordersResponse.json();
    const orders = ordersResult?.data || [];

    console.log(`📦 Found ${orders.length} orders`);

    // Step 2: Extract all items and aggregate by bundle_id
    const bundleStats = {};

    orders.forEach(order => {
      const items = order.items_preview || [];
      
      items.forEach(item => {
        const bundleId = item.bundle_id;
        if (!bundleId) return;

        if (!bundleStats[bundleId]) {
          bundleStats[bundleId] = {
            id: bundleId,
            title: item.bundle_title || 'Unknown Bundle',
            img_url: item.bundle_img || null,
            total_quantity: 0,
            total_revenue: 0,
            order_count: 0
          };
        }

        bundleStats[bundleId].total_quantity += item.quantity || 0;
        bundleStats[bundleId].total_revenue += (item.price || 0) * (item.quantity || 0);
        bundleStats[bundleId].order_count += 1;
      });
    });

    console.log(`📊 Aggregated ${Object.keys(bundleStats).length} unique bundles`);

    // Step 3: Sort by total quantity sold
    const topBundles = Object.values(bundleStats)
      .sort((a, b) => b.total_quantity - a.total_quantity)
      .slice(0, limit)
      .map(bundle => ({
        id: bundle.id,
        title: bundle.title,
        img_url: bundle.img_url,
        sales: bundle.total_quantity,
        revenue: Math.round(bundle.total_revenue)
      }));

    console.log('✅ Top bundles:', topBundles);

    return {
      success: true,
      data: topBundles
    };

  } catch (error) {
    console.error('❌ Error fetching top bundles:', error);
    return {
      success: false,
      data: []
    };
  }
};

/**
 * ✅ Alias for backward compatibility
 */
export const getTopBundles = getTopProducts;

/**
 * Get inventory alerts (low stock + out of stock)
 */
export const getInventoryAlerts = async () => {
  const result = await getProducts({ limit: 10000 });
  
  if (!result.success) {
    return {
      success: false,
      data: {
        low_stock: [],
        out_of_stock: [],
      },
    };
  }

  const productsData = result.data;
  const products = Array.isArray(productsData) 
    ? productsData 
    : productsData.data || [];
  
  const lowStock = products.filter(p => p.stock > 0 && p.stock <= 10);
  const outOfStock = products.filter(p => p.stock === 0);

  return {
    success: true,
    data: {
      low_stock: lowStock,
      out_of_stock: outOfStock,
      low_stock_count: lowStock.length,
      out_of_stock_count: outOfStock.length,
    },
  };
};

/**
 * Get order status distribution
 */
export const getOrderStatusDistribution = async () => {
  const result = await getAdminOrderStats();
  
  if (!result.success) {
    return {
      success: false,
      data: [],
    };
  }

  const stats = result.stats || result.data || {};
  
  return {
    success: true,
    data: [
      { name: 'Pending', value: stats.pending || 0 },
      { name: 'Confirmed', value: stats.confirmed || 0 },
      { name: 'Processing', value: stats.processing || 0 },
      { name: 'Shipped', value: stats.shipped || 0 },
      { name: 'In Transit', value: stats.in_transit || 0 },
      { name: 'Out for Delivery', value: stats.out_for_delivery || 0 },
      { name: 'Delivered', value: stats.delivered || 0 },
      { name: 'Cancelled', value: stats.cancelled || 0 },
      { name: 'Failed', value: stats.failed || 0 },
      { name: 'RTO Initiated', value: stats.rto_initiated || 0 },
      { name: 'RTO Delivered', value: stats.rto_delivered || 0 },
    ].filter(item => item.value > 0),
  };
};

/**
 * Get quick summary for dashboard cards
 */
export const getQuickSummary = async () => {
  const dashboardStats = await getDashboardStats();
  
  if (!dashboardStats.success) {
    return {
      success: false,
      data: null,
    };
  }

  const data = dashboardStats.data;

  return {
    success: true,
    data: {
      total_revenue: data.revenue.current,
      total_orders: data.orders.current,
      total_products: data.products.current,
      total_customers: data.customers.current,
      pending_orders: data.orderBreakdown.pending || 0,
      confirmed_orders: data.orderBreakdown.confirmed || 0,
      processing_orders: data.orderBreakdown.processing || 0,
      shipped_orders: data.orderBreakdown.shipped || 0,
      in_transit_orders: data.orderBreakdown.in_transit || 0,
      out_for_delivery_orders: data.orderBreakdown.out_for_delivery || 0,
      delivered_orders: data.orderBreakdown.delivered || 0,
      cancelled_orders: data.orderBreakdown.cancelled || 0,
      low_stock_products: data.productBreakdown.low_stock || 0,
      out_of_stock_products: data.productBreakdown.out_of_stock || 0,
      active_bundles: data.bundleBreakdown.active || 0,
      inactive_bundles: data.bundleBreakdown.inactive || 0,
      low_stock_bundles: data.bundleBreakdown.low_stock || 0,
      out_of_stock_bundles: data.bundleBreakdown.out_of_stock || 0,
      total_categories: data.categoryCount || 0,
    },
  };
};

/**
 * Get sales trends (comparing current vs previous period)
 */
export const getSalesTrends = async () => {
  const currentDate = new Date();
  const currentMonth = currentDate.getMonth();
  const currentYear = currentDate.getFullYear();
  
  const currentStartDate = new Date(currentYear, currentMonth, 1).toISOString().split('T')[0];
  const currentEndDate = new Date(currentYear, currentMonth + 1, 0).toISOString().split('T')[0];
  
  const prevStartDate = new Date(currentYear, currentMonth - 1, 1).toISOString().split('T')[0];
  const prevEndDate = new Date(currentYear, currentMonth, 0).toISOString().split('T')[0];
  
  const [currentResult, previousResult] = await Promise.all([
    getRevenuByPeriod(currentStartDate, currentEndDate),
    getRevenuByPeriod(prevStartDate, prevEndDate),
  ]);

  const current = currentResult.success ? currentResult.data : {};
  const previous = previousResult.success ? previousResult.data : {};

  const revenueChange = previous.total_revenue > 0
    ? Math.round(((current.total_revenue - previous.total_revenue) / previous.total_revenue) * 100)
    : 0;

  const ordersChange = previous.order_count > 0
    ? Math.round(((current.order_count - previous.order_count) / previous.order_count) * 100)
    : 0;

  return {
    success: true,
    data: {
      current: {
        revenue: current.total_revenue || 0,
        orders: current.order_count || 0,
        avg_order_value: current.avg_order_value || 0,
      },
      previous: {
        revenue: previous.total_revenue || 0,
        orders: previous.order_count || 0,
        avg_order_value: previous.avg_order_value || 0,
      },
      changes: {
        revenue: revenueChange,
        orders: ordersChange,
      },
    },
  };
};

export default {
  getDashboardStats,
  getStatsForDateRange,
  getMonthlyRevenue,
  getCategoryDistribution,
  getTopProducts, // ✅ Now returns top bundles
  getTopBundles,  // ✅ Alias
  getInventoryAlerts,
  getOrderStatusDistribution,
  getQuickSummary,
  getSalesTrends,
};