// frontend/src/pages/admin/OrdersPage.jsx

import { useState, useEffect } from 'react';
import { Eye, Download, Package } from 'lucide-react';
import PageHeader from '../../components/admin/ui/PageHeader';
import SearchBar from '../../components/admin/ui/SearchBar';
import Button from '../../components/admin/ui/Button';
import StatusBadge from '../../components/admin/ui/StatusBadge';
import FilterButton from '../../components/admin/ui/FilterButton';
import Pagination from '../../components/admin/ui/Pagination';
import ActionMenu from '../../components/admin/ui/ActionMenu';
import { SkeletonTable } from '../../components/admin/ui/LoadingSkeleton';
import { ORDER_FILTERS } from '../../utils/constants';
import { formatCurrency, formatDate, downloadCSV } from '../../utils/adminHelpers';

// Import services
import {
  getOrders,
  getOrderStats,
  updateOrderStatus,
  searchOrders,
  exportOrdersToCSV,
} from '../../services/orderService';

export default function OrdersPage() {
  const [orders, setOrders] = useState([]);
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [statsLoading, setStatsLoading] = useState(true);
  const [message, setMessage] = useState({ type: '', text: '' });
  const [searchTerm, setSearchTerm] = useState('');
  const [filters, setFilters] = useState({
    status: '',
    payment_status: '',
  });

  // Pagination
  const [currentPage, setCurrentPage] = useState(1);
  const [metadata, setMetadata] = useState(null);
  const itemsPerPage = 20;

  useEffect(() => {
    fetchStats();
  }, []);

  useEffect(() => {
    fetchOrders();
  }, [currentPage, filters, searchTerm]);

  const fetchStats = async () => {
    setStatsLoading(true);
    const result = await getOrderStats();
    if (result.success) {
      setStats(result.data);
    }
    setStatsLoading(false);
  };

  const fetchOrders = async () => {
    setLoading(true);
    
    const params = {
      page: currentPage,
      limit: itemsPerPage,
      ...filters,
    };

    if (searchTerm) {
      params.search = searchTerm;
    }

    // Remove empty filters
    Object.keys(params).forEach(key => {
      if (params[key] === '' || params[key] === null || params[key] === undefined) {
        delete params[key];
      }
    });

    const result = await getOrders(params);
    
    if (result.success) {
      setOrders(result.data.data || []);
      setMetadata(result.data.metadata || null);
    } else {
      setMessage({ type: 'error', text: result.error || 'Failed to load orders' });
    }
    
    setLoading(false);
  };

  const handleSearch = (e) => {
    setSearchTerm(e.target.value);
    setCurrentPage(1);
  };

  const handleFilterChange = (key, value) => {
    setFilters(prev => ({ ...prev, [key]: value }));
    setCurrentPage(1);
  };

  const handleClearFilters = () => {
    setFilters({
      status: '',
      payment_status: '',
    });
    setSearchTerm('');
    setCurrentPage(1);
  };

  const handleExportCSV = async () => {
    setMessage({ type: '', text: '' });
    
    const result = await exportOrdersToCSV(filters);
    
    if (result.success && result.data.length > 0) {
      downloadCSV(result.data, `orders-${new Date().toISOString().split('T')[0]}.csv`);
      setMessage({ type: 'success', text: 'Orders exported successfully' });
    } else {
      setMessage({ type: 'error', text: 'No orders to export' });
    }
    
    setTimeout(() => setMessage({ type: '', text: '' }), 3000);
  };

  const handleViewOrder = (orderId) => {
    // TODO: Implement order details modal/page
    console.log('View order:', orderId);
    alert(`Order details view coming soon!\nOrder ID: ${orderId}`);
  };

  const handleUpdateStatus = async (orderId, newStatus) => {
    const result = await updateOrderStatus(orderId, newStatus);
    
    if (result.success) {
      setMessage({ type: 'success', text: `Order status updated to ${newStatus}` });
      fetchOrders();
      fetchStats();
    } else {
      setMessage({ type: 'error', text: result.error || 'Failed to update status' });
    }
    
    setTimeout(() => setMessage({ type: '', text: '' }), 3000);
  };

  const filterConfig = [
    {
      key: 'status',
      label: 'Order Status',
      type: 'select',
      options: ORDER_FILTERS.status,
    },
    {
      key: 'payment_status',
      label: 'Payment Status',
      type: 'select',
      options: ORDER_FILTERS.payment,
    },
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <PageHeader
        title="Orders"
        description="Manage customer orders and fulfillment"
        actions={
          <div className="flex gap-3">
            <Button
              variant="outline"
              icon={<Download className="w-5 h-5" />}
              onClick={handleExportCSV}
            >
              Export CSV
            </Button>
          </div>
        }
      />

      {/* Messages */}
      {message.text && (
        <div className={`
          p-4 rounded-lg border animate-slide-in
          ${message.type === 'success' 
            ? 'bg-green-50 border-green-200 text-green-800' 
            : 'bg-red-50 border-red-200 text-red-800'
          }
        `}>
          {message.text}
        </div>
      )}

      {/* Stats Cards */}
      {!statsLoading && stats && (
        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
          <div className="card p-4">
            <div className="text-xs text-text-muted mb-1">Total Orders</div>
            <div className="text-2xl font-bold text-text-primary">{stats.total}</div>
          </div>
          <div className="card p-4">
            <div className="text-xs text-text-muted mb-1">Pending</div>
            <div className="text-2xl font-bold text-yellow-600">{stats.pending}</div>
          </div>
          <div className="card p-4">
            <div className="text-xs text-text-muted mb-1">Processing</div>
            <div className="text-2xl font-bold text-blue-600">{stats.processing}</div>
          </div>
          <div className="card p-4">
            <div className="text-xs text-text-muted mb-1">Shipped</div>
            <div className="text-2xl font-bold text-purple-600">{stats.shipped}</div>
          </div>
          <div className="card p-4">
            <div className="text-xs text-text-muted mb-1">Delivered</div>
            <div className="text-2xl font-bold text-green-600">{stats.delivered}</div>
          </div>
          <div className="card p-4">
            <div className="text-xs text-text-muted mb-1">Revenue</div>
            <div className="text-2xl font-bold text-admin-pink">{formatCurrency(stats.total_revenue, false)}</div>
          </div>
        </div>
      )}

      {/* Search & Filters */}
      <div className="card p-6">
        <div className="flex flex-col lg:flex-row gap-4">
          <div className="flex-1">
            <SearchBar
              value={searchTerm}
              onChange={handleSearch}
              placeholder="Search by order ID, customer name, email..."
            />
          </div>
          <FilterButton
            filters={filterConfig}
            activeFilters={filters}
            onFilterChange={handleFilterChange}
            onClearFilters={handleClearFilters}
          />
        </div>
      </div>

      {/* Orders Table */}
      {loading ? (
        <SkeletonTable rows={10} columns={8} />
      ) : orders.length === 0 ? (
        <div className="card p-12 text-center">
          <div className="text-gray-400 mb-4">
            <svg className="w-16 h-16 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
            </svg>
          </div>
          <h3 className="text-lg font-semibold text-text-primary mb-2">No orders found</h3>
          <p className="text-text-secondary text-sm">
            {searchTerm || filters.status || filters.payment_status 
              ? 'Try adjusting your filters' 
              : 'Orders will appear here when customers make purchases'}
          </p>
        </div>
      ) : (
        <>
          <div className="table-wrapper">
            <table className="admin-table">
              <thead>
                <tr>
                  <th>Order ID</th>
                  <th>Customer</th>
                  <th className="text-right">Total</th>
                  <th className="text-center">Items</th>
                  <th>Order Status</th>
                  <th>Payment</th>
                  <th>Date</th>
                  <th className="text-right">Actions</th>
                </tr>
              </thead>
              <tbody>
                {orders.map((order) => (
                  <tr key={order.id} className="hover:bg-surface transition-colors">
                    <td>
                      <span className="font-semibold text-admin-pink">
                        {order.id.substring(0, 8)}...
                      </span>
                    </td>
                    <td>
                      <div>
                        <div className="font-medium text-text-primary">
                          {order.customer_name || 'Guest'}
                        </div>
                        <div className="text-sm text-text-muted">
                          {order.customer_email || 'N/A'}
                        </div>
                        <div className="text-sm text-text-muted">
                          {order.customer_phone || 'N/A'}
                        </div>
                      </div>
                    </td>
                    <td className="text-right">
                      <span className="font-semibold text-text-primary text-lg">
                        {formatCurrency(order.final_total || order.total)}
                      </span>
                    </td>
                    <td className="text-center">
                      <span className="px-2 py-1 bg-admin-grey text-admin-slate rounded text-sm font-semibold">
                        {order.order_items?.length || order.items || 0}
                      </span>
                    </td>
                    <td>
                      <StatusBadge status={order.status} />
                    </td>
                    <td>
                      <StatusBadge status={order.payment_status} />
                    </td>
                    <td>
                      <div className="text-sm">
                        <div className="text-text-primary">
                          {formatDate(order.created_at, 'short')}
                        </div>
                        <div className="text-text-muted">
                          {formatDate(order.created_at, 'time')}
                        </div>
                      </div>
                    </td>
                    <td>
                      <div className="flex justify-end">
                        <ActionMenu
                          actions={[
                            {
                              label: 'View Details',
                              icon: <Eye className="w-4 h-4" />,
                              onClick: () => handleViewOrder(order.id),
                            },
                            { divider: true },
                            {
                              label: 'Mark as Processing',
                              icon: <Package className="w-4 h-4" />,
                              onClick: () => handleUpdateStatus(order.id, 'processing'),
                              disabled: order.status === 'processing' || order.status === 'shipped' || order.status === 'delivered',
                            },
                            {
                              label: 'Mark as Shipped',
                              icon: <Package className="w-4 h-4" />,
                              onClick: () => handleUpdateStatus(order.id, 'shipped'),
                              disabled: order.status === 'shipped' || order.status === 'delivered',
                            },
                            {
                              label: 'Mark as Delivered',
                              icon: <Package className="w-4 h-4" />,
                              onClick: () => handleUpdateStatus(order.id, 'delivered'),
                              disabled: order.status === 'delivered',
                            },
                          ]}
                        />
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Pagination */}
          {metadata && metadata.totalPages > 1 && (
            <Pagination
              currentPage={currentPage}
              totalItems={metadata.totalCount}
              itemsPerPage={itemsPerPage}
              onPageChange={setCurrentPage}
            />
          )}
        </>
      )}
    </div>
  );
}