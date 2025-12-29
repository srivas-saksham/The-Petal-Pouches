// frontend/src/pages/admin/orders/AdminOrdersPage.jsx
/**
 * Admin Orders Management Page
 * Similar UI to user orders page with enhanced admin features
 * Layout: 70% Orders List | 30% Analytics Sidebar
 */

import { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom'; 
import { Package } from 'lucide-react';
import AdminOrdersFilters from '../../../components/admin/orders/AdminOrdersFilters';
import AdminOrdersList from '../../../components/admin/orders/AdminOrdersList';
import AdminOrdersAnalytics from '../../../components/admin/orders/AdminOrdersAnalytics';
import OrderDetailModal from '../../../components/admin/orders/OrderDetailModal';
import { useToast } from '../../../hooks/useToast';
import PageHeader from '../../../components/admin/ui/PageHeader';

const API_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000';

export default function AdminOrdersPage() {
  const [searchParams] = useSearchParams();
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  
  // ✅ Initialize filters from URL params
  const [filters, setFilters] = useState({
    search: searchParams.get('search') || '',
    status: searchParams.get('status') || 'all',
    payment_status: searchParams.get('payment_status') || '',
    payment_method: searchParams.get('payment_method') || '',
    delivery_mode: searchParams.get('delivery_mode') || '',
    from_date: searchParams.get('from_date') || '',
    to_date: searchParams.get('to_date') || ''
  });
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 20,
    total: 0,
    pages: 0
  });
  
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [showDetailModal, setShowDetailModal] = useState(false);
  
  const toast = useToast();

  // Fetch orders on mount and filter change
  useEffect(() => {
    fetchOrders();
  }, [filters, pagination.page]);

  const fetchOrders = async () => {
    setLoading(true);
    
    try {
      const params = new URLSearchParams({
        page: pagination.page,
        limit: pagination.limit,
        sort: 'created_at',
        order: 'desc'
      });

      // Add filters
      if (filters.search) params.append('search', filters.search);
      if (filters.status && filters.status !== 'all') params.append('status', filters.status);
      if (filters.payment_status) params.append('payment_status', filters.payment_status);
      if (filters.payment_method) params.append('payment_method', filters.payment_method);
      if (filters.delivery_mode) params.append('delivery_mode', filters.delivery_mode);
      if (filters.from_date) params.append('from_date', filters.from_date);
      if (filters.to_date) params.append('to_date', filters.to_date);

      // ✅ FIX: Get token from sessionStorage (not localStorage)
      const token = sessionStorage.getItem('admin_token');
      
      console.log('🔍 Admin Token Check:', {
        exists: !!token,
        preview: token ? token.substring(0, 30) + '...' : 'NO TOKEN',
        storage: 'sessionStorage'
      });
      
      if (!token) {
        console.error('❌ No admin token found - redirecting to login');
        toast.error('Session expired. Please login again.');
        // Redirect to admin login
        window.location.href = '/admin/login';
        return;
      }

      const response = await fetch(`${API_URL}/api/admin/orders?${params}`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      // Check for 401 Unauthorized
      if (response.status === 401) {
        console.error('❌ 401 Unauthorized - Token invalid or expired');
        sessionStorage.removeItem('admin_token');
        toast.error('Session expired. Please login again.');
        window.location.href = '/admin/login';
        return;
      }

      const result = await response.json();

      if (result.success) {
        setOrders(result.data || []);
        setPagination(prev => ({
          ...prev,
          total: result.metadata.totalCount,
          pages: result.metadata.totalPages
        }));
      } else {
        toast.error(result.message || 'Failed to load orders');
      }
    } catch (error) {
      console.error('Error fetching orders:', error);
      toast.error('Failed to load orders');
    } finally {
      setLoading(false);
    }
  };
  //Sync URL params to filters:
  useEffect(() => {
    const searchFromUrl = searchParams.get('search');
    if (searchFromUrl && searchFromUrl !== filters.search) {
      setFilters(prev => ({
        ...prev,
        search: searchFromUrl
      }));
    }
  }, [searchParams]);

  const handleFilterChange = (key, value) => {
    setFilters(prev => ({ ...prev, [key]: value }));
    setPagination(prev => ({ ...prev, page: 1 })); // Reset to page 1
  };

  const handleResetFilters = () => {
    setFilters({
      search: '',
      status: 'all',
      payment_status: '',
      payment_method: '',
      delivery_mode: '',
      from_date: '',
      to_date: ''
    });
    setPagination(prev => ({ ...prev, page: 1 }));
  };

  const handlePageChange = (newPage) => {
    setPagination(prev => ({ ...prev, page: newPage }));
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleViewOrder = (orderId) => {
    const order = orders.find(o => o.id === orderId);
    setSelectedOrder(order);
    setShowDetailModal(true);
  };

  const handleStatusUpdate = async (orderId, newStatus) => {
    try {
      // ✅ FIX: Get token from sessionStorage
      const token = sessionStorage.getItem('admin_token');
      const response = await fetch(`${API_URL}/api/admin/orders/${orderId}/status`, {
        method: 'PATCH',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ status: newStatus })
      });

      const result = await response.json();

      if (result.success) {
        toast.success(`Order status updated to ${newStatus}`);
        fetchOrders(); // Refresh orders
      } else {
        toast.error(result.message || 'Failed to update status');
      }
    } catch (error) {
      console.error('Error updating status:', error);
      toast.error('Failed to update order status');
    }
  };

  const hasActiveFilters = !!(
    filters.search ||
    filters.status !== 'all' ||
    filters.payment_status ||
    filters.payment_method ||
    filters.delivery_mode ||
    filters.from_date ||
    filters.to_date
  );

  return (
    <div className="min-h-screen">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <PageHeader
          title="Orders Management"
          description="Manage all customer orders and track deliveries"
        />
        {/* Filters */}
        <AdminOrdersFilters
          filters={filters}
          onFilterChange={handleFilterChange}
          onReset={handleResetFilters}
          hasActiveFilters={hasActiveFilters}
        />

        {/* 70-30 Split Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-10 gap-6 mt-6">
          {/* Main Content - 70% */}
          <div className="lg:col-span-7 space-y-4">
            <AdminOrdersList
              orders={orders}
              loading={loading}
              onViewOrder={handleViewOrder}
              onStatusUpdate={handleStatusUpdate}
              emptyMessage={hasActiveFilters ? "No orders match your filters" : "No orders yet"}
            />

            {/* Pagination */}
            {!loading && pagination.pages > 1 && (
              <div className="bg-white rounded-lg border border-tppslate/10 p-4">
                <div className="flex items-center justify-between">
                  <p className="text-sm text-tppslate/60">
                    Showing {((pagination.page - 1) * pagination.limit) + 1} to{' '}
                    {Math.min(pagination.page * pagination.limit, pagination.total)} of{' '}
                    {pagination.total} orders
                  </p>
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => handlePageChange(pagination.page - 1)}
                      disabled={pagination.page === 1}
                      className="px-3 py-1.5 text-sm border border-tppslate/20 rounded hover:bg-tppslate/5 disabled:opacity-30 disabled:cursor-not-allowed"
                    >
                      Previous
                    </button>
                    <span className="text-sm text-tppslate font-medium">
                      Page {pagination.page} of {pagination.pages}
                    </span>
                    <button
                      onClick={() => handlePageChange(pagination.page + 1)}
                      disabled={pagination.page === pagination.pages}
                      className="px-3 py-1.5 text-sm border border-tppslate/20 rounded hover:bg-tppslate/5 disabled:opacity-30 disabled:cursor-not-allowed"
                    >
                      Next
                    </button>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Analytics Sidebar - 30% */}
          <div className="lg:col-span-3">
            <AdminOrdersAnalytics orders={orders} filters={filters} />
          </div>
        </div>
      </div>

      {/* Order Detail Modal */}
      {showDetailModal && selectedOrder && (
        <OrderDetailModal
          order={selectedOrder}
          isOpen={showDetailModal}
          onClose={() => {
            setShowDetailModal(false);
            setSelectedOrder(null);
          }}
          onStatusUpdate={handleStatusUpdate}
        />
      )}
    </div>
  );
}