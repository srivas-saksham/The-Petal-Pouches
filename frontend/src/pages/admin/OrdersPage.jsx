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
import { ORDER_FILTERS } from '../../utils/constants';
import { formatCurrency, formatDate, downloadCSV } from '../../utils/adminHelpers';
import { mockOrders } from '../../utils/mockData';

export default function OrdersPage() {
  const [orders, setOrders] = useState([]);
  const [filteredOrders, setFilteredOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filters, setFilters] = useState({
    status: '',
    payment: '',
  });

  // Pagination
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 20;

  useEffect(() => {
    // Simulate API call - replace with actual API
    setTimeout(() => {
      setOrders(mockOrders);
      setLoading(false);
    }, 1000);
  }, []);

  useEffect(() => {
    let filtered = [...orders];

    // Apply search
    if (searchTerm) {
      filtered = filtered.filter(order =>
        order.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
        order.customer_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        order.customer_email.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    // Apply status filter
    if (filters.status) {
      filtered = filtered.filter(order => order.status === filters.status);
    }

    // Apply payment filter
    if (filters.payment) {
      filtered = filtered.filter(order => order.payment_status === filters.payment);
    }

    setFilteredOrders(filtered);
    setCurrentPage(1);
  }, [searchTerm, filters, orders]);

  const handleFilterChange = (key, value) => {
    setFilters(prev => ({ ...prev, [key]: value }));
  };

  const handleClearFilters = () => {
    setFilters({
      status: '',
      payment: '',
    });
  };

  const handleExportCSV = () => {
    const exportData = filteredOrders.map(order => ({
      'Order ID': order.id,
      'Customer': order.customer_name,
      'Email': order.customer_email,
      'Phone': order.customer_phone,
      'Total': order.total,
      'Status': order.status,
      'Payment Status': order.payment_status,
      'Items': order.items,
      'Date': formatDate(order.created_at, 'full'),
      'Shipping Address': order.shipping_address,
    }));
    
    downloadCSV(exportData, `orders-${new Date().toISOString().split('T')[0]}.csv`);
  };

  const handleViewOrder = (orderId) => {
    // TODO: Implement order details view
    console.log('View order:', orderId);
    alert(`Order details view coming soon!\nOrder ID: ${orderId}`);
  };

  const handleUpdateStatus = (orderId, newStatus) => {
    // TODO: Implement status update
    console.log('Update order status:', orderId, newStatus);
    alert(`Status update coming soon!\nOrder: ${orderId}\nNew Status: ${newStatus}`);
  };

  // Pagination
  const totalItems = filteredOrders.length;
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const paginatedOrders = filteredOrders.slice(startIndex, endIndex);

  const filterConfig = [
    {
      key: 'status',
      label: 'Order Status',
      type: 'select',
      options: ORDER_FILTERS.status,
    },
    {
      key: 'payment',
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

      {/* Search & Filters */}
      <div className="card p-6">
        <div className="flex flex-col lg:flex-row gap-4">
          <div className="flex-1">
            <SearchBar
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
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
        <div className="text-center py-12">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-admin-pink mx-auto"></div>
          <p className="text-text-muted mt-4">Loading orders...</p>
        </div>
      ) : paginatedOrders.length === 0 ? (
        <div className="card p-12 text-center">
          <div className="text-gray-400 mb-4">
            <svg className="w-16 h-16 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
            </svg>
          </div>
          <h3 className="text-lg font-semibold text-text-primary mb-2">No orders found</h3>
          <p className="text-text-secondary text-sm">
            {searchTerm || filters.status || filters.payment 
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
                {paginatedOrders.map((order) => (
                  <tr key={order.id} className="hover:bg-surface transition-colors">
                    <td>
                      <span className="font-semibold text-admin-pink">
                        {order.id}
                      </span>
                    </td>
                    <td>
                      <div>
                        <div className="font-medium text-text-primary">
                          {order.customer_name}
                        </div>
                        <div className="text-sm text-text-muted">
                          {order.customer_email}
                        </div>
                        <div className="text-sm text-text-muted">
                          {order.customer_phone}
                        </div>
                      </div>
                    </td>
                    <td className="text-right">
                      <span className="font-semibold text-text-primary text-lg">
                        {formatCurrency(order.total)}
                      </span>
                    </td>
                    <td className="text-center">
                      <span className="px-2 py-1 bg-admin-grey text-admin-slate rounded text-sm font-semibold">
                        {order.items}
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
                              disabled: order.status === 'processing',
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
          {totalItems > itemsPerPage && (
            <Pagination
              currentPage={currentPage}
              totalItems={totalItems}
              itemsPerPage={itemsPerPage}
              onPageChange={setCurrentPage}
            />
          )}
        </>
      )}
    </div>
  );
}