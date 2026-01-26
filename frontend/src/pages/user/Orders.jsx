// frontend/src/pages/user/Orders.jsx - REDESIGNED WITH STATS FILTER

import { useState, useEffect } from 'react';
import { useUserAuth } from '../../context/UserAuthContext';
import { useToast } from '../../hooks/useToast';
import { getOrders, getOrderStats, reorderItems } from '../../services/orderService';
import { addBundleToCart } from '../../services/bundleService';

// Components
import OrdersLayout from '../../components/user/orders/OrdersLayout';
import OrdersStats from '../../components/user/orders/OrdersStats';
import OrdersFilters from '../../components/user/orders/OrdersFilters';
import OrdersList from '../../components/user/orders/OrdersList';
import OrdersPagination from '../../components/user/orders/OrdersPagination';
import BuyAgainSidebar from '../../components/user/orders/BuyAgainSidebar';
import SEO from '../../components/seo/SEO';

const Orders = () => {
  const [orders, setOrders] = useState([]);
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [statsLoading, setStatsLoading] = useState(true);
  const [filters, setFilters] = useState({
    search: '',
    status: 'all',
    payment_status: '',
    from_date: '',
    to_date: ''
  });
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 10,
    total: 0,
    pages: 0
  });

  const { token } = useUserAuth();
  const toast = useToast();

  // Load stats on mount
  useEffect(() => {
    if (token) {
      loadStats();
    }
  }, [token]);

  // Load orders when filters or pagination change
  useEffect(() => {
    if (token) {
      loadOrders();
    }
  }, [token, filters.status, filters.payment_status, filters.from_date, filters.to_date, pagination.page]);

  const loadStats = async () => {
    try {
      setStatsLoading(true);
      const response = await getOrderStats();
      console.log('📊 Stats response:', response);
      
      if (response.success && response.stats) {
        // Now response.data contains the stats
        setStats(response.stats);
        console.log('📊 Stats set:', response.stats);
      }
    } catch (error) {
      console.error('Error loading stats:', error);
    } finally {
      setStatsLoading(false);
    }
  };

  const loadOrders = async () => {
    setLoading(true);
    try {
      const params = {
        page: pagination.page,
        limit: pagination.limit
      };

      if (filters.status !== 'all') {
        params.status = filters.status;
      }

      if (filters.payment_status) {
        params.payment_status = filters.payment_status;
      }

      if (filters.from_date) {
        params.from_date = filters.from_date;
      }

      if (filters.to_date) {
        params.to_date = filters.to_date;
      }

      const response = await getOrders(params);

      if (response.success) {
        setOrders(response.data || []);
        
        if (response.pagination) {
          setPagination(response.pagination);
        }
      } else {
        toast.error('Failed to load orders');
      }
    } catch (error) {
      console.error('Error loading orders:', error);
      toast.error('Failed to load orders');
    } finally {
      setLoading(false);
    }
  };

  const handleFilterChange = (key, value) => {
    setFilters(prev => ({ ...prev, [key]: value }));
    // Reset to page 1 when filters change
    if (key !== 'search') {
      setPagination(prev => ({ ...prev, page: 1 }));
    }
  };

  // Handle stats card click to filter by status
  const handleStatsFilterClick = (status) => {
    if (filters.status === status) {
      // If already filtered by this status, clear filter
      handleFilterChange('status', 'all');
    } else {
      // Apply filter
      handleFilterChange('status', status);
    }
    // Scroll to top
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleResetFilters = () => {
    setFilters({
      search: '',
      status: 'all',
      payment_status: '',
      from_date: '',
      to_date: ''
    });
    setPagination(prev => ({ ...prev, page: 1 }));
  };

  const handlePageChange = (newPage) => {
    setPagination(prev => ({ ...prev, page: newPage }));
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleReorder = (bundleId) => {
    // Just show success toast - the actual adding is handled by BuyAgainSidebar
    toast.success('Bundle added to cart');
  };

  // Filter orders by search term (client-side)
  const filteredOrders = orders.filter(order => {
    if (!filters.search) return true;
    const orderId = order.id?.substring(0, 8).toUpperCase() || '';
    return orderId.includes(filters.search.toUpperCase());
  });

  return (
    <>
    <SEO
      title="My Orders"
      description="Track and manage all your Rizara Luxe orders"
      canonical="https://www.rizara.in/user/orders"
      noindex={true}
    />

    <OrdersLayout
      sidebar={<BuyAgainSidebar onReorder={handleReorder} />}
    >
      {/* Quick Stats - Now clickable */}
      <OrdersStats 
        stats={stats} 
        loading={statsLoading}
        activeFilter={filters.status}
        onFilterClick={handleStatsFilterClick}
      />

      {/* Filters */}
      <OrdersFilters
        filters={filters}
        onFilterChange={handleFilterChange}
        onReset={handleResetFilters}
      />

      {/* Orders List */}
      <OrdersList
        orders={filteredOrders}
        loading={loading}
        onReorder={handleReorder}
        emptyMessage={filters.search ? 'No orders found' : 'No orders yet'}
        emptyIcon={filters.search ? 'Search' : 'Package'}
      />

      {/* Pagination */}
      {!loading && filteredOrders.length > 0 && (
        <OrdersPagination
          pagination={pagination}
          onPageChange={handlePageChange}
        />
      )}
    </OrdersLayout>
    </>
  );
};

export default Orders;