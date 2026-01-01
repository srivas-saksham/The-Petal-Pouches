// frontend/src/services/statsService.js - COMPLETE FIXED VERSION

import { getProductStats, getProducts } from './productService';
import { getOrderStats, getRevenuByPeriod } from './orderService';
import { getCategories } from './categoryService';
import bundleService from './bundleService';
import { apiRequest } from './api';
import adminCustomerService from './adminCustomerService';

/**
 * Get bundle statistics (helper function since bundleService doesn't have getBundleStats)
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
        },
      };
    }

    // ✅ FIXED: Handle both array and nested data structure
    const bundles = Array.isArray(result.data) 
      ? result.data 
      : result.data.data || [];
    
    const stats = {
      total: bundles.length,
      active: bundles.filter(b => b.is_active).length,
      inactive: bundles.filter(b => !b.is_active).length,
    };

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
      },
    };
  }
};

/**
 * Get complete dashboard statistics - FIXED
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
      getOrderStats(),
      getCategories(),
      adminCustomerService.getCustomerStats(),
    ]);

    // Extract data with fallbacks
    const productStats = productStatsResult.success ? productStatsResult.data : {};
    const bundleStats = bundleStatsResult.success ? bundleStatsResult.data : {};
    
    // ✅ CRITICAL FIX: Extract order stats properly
    // The backend returns { success: true, stats: {...} }
    // We need to use the 'stats' field, not 'data'
    const orderStatsData = orderStatsResult.success 
      ? (orderStatsResult.stats || orderStatsResult.data || {})
      : {};
    
    console.log('📊 [statsService] Raw order stats result:', {
      success: orderStatsResult.success,
      hasStats: !!orderStatsResult.stats,
      hasData: !!orderStatsResult.data,
      total_orders: orderStatsData.total_orders,
      stats: orderStatsResult.stats,
      data: orderStatsResult.data
    });

    // ✅ FIX: Extract customer stats
    const customerStats = customerStatsResult.success ? customerStatsResult.data : { total: 0, active: 0 };
    
    // ✅ FIX: Handle categories data structure properly
    const categoriesData = categoryResult.success ? categoryResult.data : [];
    const categories = Array.isArray(categoriesData) 
      ? categoriesData 
      : categoriesData.data || [];

    // ✅ CRITICAL FIX: Build the stats object correctly
    const dashboardStats = {
      revenue: {
        current: orderStatsData.total_spent || 0,
        previous: 0,
        change: 0,
      },
      orders: {
        // ✅ FIX: Use total_orders from the stats
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
      // ✅ CRITICAL: Pass through ALL orderBreakdown fields
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
        // Payment stats
        paid: orderStatsData.paid || 0,
        unpaid: orderStatsData.unpaid || 0,
        refunded: orderStatsData.refunded || 0,
        // Payment methods
        cod: orderStatsData.cod || 0,
        online: orderStatsData.online || 0,
        // Delivery modes
        surface: orderStatsData.surface || 0,
        express: orderStatsData.express || 0,
        // Average
        avg_order_value: orderStatsData.avg_order_value || 0,
      },
      productBreakdown: productStats,
      bundleBreakdown: bundleStats,
      categoryCount: categories.length,
    };

    console.log('📊 [statsService] Final dashboard stats:', {
      'orders.current': dashboardStats.orders.current,
      'orderBreakdown.total_orders': dashboardStats.orderBreakdown.total_orders,
      'orderBreakdown.pending': dashboardStats.orderBreakdown.pending,
      'orderBreakdown.delivered': dashboardStats.orderBreakdown.delivered,
      'products.current': dashboardStats.products.current,
      'customers.current': dashboardStats.customers.current,
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
        bundleBreakdown: {},
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

    // ✅ FIXED: Handle both response formats properly
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

    // Sort by count descending
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
 * Get top performing products (by sales - would need order_items data)
 */
export const getTopProducts = async (limit = 5) => {
  try {
    // Note: This requires order_items tracking
    // For now, return products sorted by stock (lower stock = more sold)
    const result = await getProducts({ limit: 1000 });
    
    if (!result.success) {
      console.error('❌ Failed to get products for top products');
      return {
        success: false,
        data: [],
      };
    }

    // ✅ FIXED: Handle both response formats properly
    const productsData = result.data;
    const products = Array.isArray(productsData) 
      ? productsData 
      : productsData.data || [];

    console.log('📦 Top products - Total products fetched:', products.length);

    // Filter out products without images
    const productsWithImages = products.filter(p => p.img_url);

    // Mock sales data based on stock levels (lower stock = higher sales)
    const withSalesData = productsWithImages.map(product => ({
      ...product,
      sales: Math.max(0, 100 - (product.stock || 0)), // Mock calculation
      revenue: Math.max(0, 100 - (product.stock || 0)) * (product.price || 0),
    }));

    const topProducts = withSalesData
      .sort((a, b) => b.sales - a.sales)
      .slice(0, limit);

    console.log('✅ Top products selected:', topProducts.length);

    return {
      success: true,
      data: topProducts,
    };
  } catch (error) {
    console.error('❌ Error in getTopProducts:', error);
    return {
      success: false,
      data: [],
    };
  }
};

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

  // ✅ FIXED: Handle both response formats properly
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
  const result = await getOrderStats();
  
  if (!result.success) {
    return {
      success: false,
      data: [],
    };
  }

  // ✅ FIX: Extract stats properly from result
  const stats = result.stats || result.data || {};
  
  return {
    success: true,
    data: [
      { name: 'Pending', value: stats.pending || 0 },
      { name: 'Processing', value: stats.processing || 0 },
      { name: 'Shipped', value: stats.shipped || 0 },
      { name: 'Delivered', value: stats.delivered || 0 },
      { name: 'Cancelled', value: stats.cancelled || 0 },
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
      pending_orders: data.orderBreakdown.pending || 0,
      low_stock_products: data.productBreakdown.low_stock || 0,
      out_of_stock_products: data.productBreakdown.out_of_stock || 0,
      active_bundles: data.bundleBreakdown.active || 0,
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
  
  // Current month
  const currentStartDate = new Date(currentYear, currentMonth, 1).toISOString().split('T')[0];
  const currentEndDate = new Date(currentYear, currentMonth + 1, 0).toISOString().split('T')[0];
  
  // Previous month
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
  getTopProducts,
  getInventoryAlerts,
  getOrderStatusDistribution,
  getQuickSummary,
  getSalesTrends,
};