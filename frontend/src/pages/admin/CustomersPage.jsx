// frontend/src/pages/admin/CustomersPage.jsx

import { useState, useEffect } from 'react';
import { Mail, Phone, ShoppingBag, DollarSign } from 'lucide-react';
import PageHeader from '../../components/admin/ui/PageHeader';
import SearchBar from '../../components/admin/ui/SearchBar';
import Pagination from '../../components/admin/ui/Pagination';
import { SkeletonTable } from '../../components/admin/ui/LoadingSkeleton';
import { formatCurrency, formatDate } from '../../utils/adminHelpers';

// Import services
import { getOrders, getTopCustomers } from '../../services/orderService';

export default function CustomersPage() {
  const [customers, setCustomers] = useState([]);
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [statsLoading, setStatsLoading] = useState(true);
  const [message, setMessage] = useState({ type: '', text: '' });
  const [searchTerm, setSearchTerm] = useState('');
  const [filteredCustomers, setFilteredCustomers] = useState([]);

  // Pagination
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 20;

  useEffect(() => {
    fetchCustomers();
  }, []);

  useEffect(() => {
    if (searchTerm) {
      const filtered = customers.filter(c =>
        c.customer_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        c.customer_email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        c.customer_phone?.includes(searchTerm)
      );
      setFilteredCustomers(filtered);
      setCurrentPage(1);
    } else {
      setFilteredCustomers(customers);
    }
  }, [searchTerm, customers]);

  const fetchCustomers = async () => {
    setLoading(true);
    setStatsLoading(true);

    try {
      // Get all orders to extract unique customers
      const result = await getOrders({ limit: 10000 });

      if (result.success) {
        const orders = result.data.data || [];
        const customerMap = {};

        // Aggregate customer data from orders
        orders.forEach(order => {
          const email = order.customer_email || order.user_id || 'unknown';
          
          if (!customerMap[email]) {
            customerMap[email] = {
              id: email,
              customer_name: order.customer_name || 'Guest',
              customer_email: order.customer_email || '',
              customer_phone: order.customer_phone || '',
              total_orders: 0,
              total_spent: 0,
              first_order: order.created_at,
              last_order: order.created_at,
              orders: [],
            };
          }

          customerMap[email].total_orders += 1;
          customerMap[email].total_spent += order.final_total || order.total || 0;
          customerMap[email].orders.push(order);

          // Track first and last order dates
          if (new Date(order.created_at) < new Date(customerMap[email].first_order)) {
            customerMap[email].first_order = order.created_at;
          }
          if (new Date(order.created_at) > new Date(customerMap[email].last_order)) {
            customerMap[email].last_order = order.created_at;
          }
        });

        const customerList = Object.values(customerMap)
          .sort((a, b) => b.total_spent - a.total_spent);

        setCustomers(customerList);
        setFilteredCustomers(customerList);

        // Calculate stats
        const totalCustomers = customerList.length;
        const totalRevenue = customerList.reduce((sum, c) => sum + c.total_spent, 0);
        const avgOrderValue = totalRevenue / (orders.length || 1);
        const repeatCustomers = customerList.filter(c => c.total_orders > 1).length;

        setStats({
          total: totalCustomers,
          total_revenue: totalRevenue,
          avg_order_value: avgOrderValue,
          repeat_customers: repeatCustomers,
          repeat_rate: totalCustomers > 0 
            ? Math.round((repeatCustomers / totalCustomers) * 100) 
            : 0,
        });
      } else {
        setMessage({ type: 'error', text: result.error || 'Failed to load customers' });
      }
    } catch (err) {
      setMessage({ type: 'error', text: 'Failed to load customer data' });
    }

    setLoading(false);
    setStatsLoading(false);
  };

  const handleSearch = (e) => {
    setSearchTerm(e.target.value);
  };

  // Pagination logic
  const totalPages = Math.ceil(filteredCustomers.length / itemsPerPage);
  const paginatedCustomers = filteredCustomers.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  return (
    <div className="space-y-6">
      {/* Header */}
      <PageHeader
        title="Customers"
        description="View and manage your customer base"
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
        <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
          <div className="card p-4">
            <div className="text-xs text-text-muted mb-1">Total Customers</div>
            <div className="text-2xl font-bold text-admin-pink">{stats.total}</div>
          </div>
          <div className="card p-4">
            <div className="text-xs text-text-muted mb-1">Total Revenue</div>
            <div className="text-2xl font-bold text-green-600">
              {formatCurrency(stats.total_revenue, false)}
            </div>
          </div>
          <div className="card p-4">
            <div className="text-xs text-text-muted mb-1">Avg Order Value</div>
            <div className="text-2xl font-bold text-blue-600">
              {formatCurrency(stats.avg_order_value, false)}
            </div>
          </div>
          <div className="card p-4">
            <div className="text-xs text-text-muted mb-1">Repeat Customers</div>
            <div className="text-2xl font-bold text-purple-600">{stats.repeat_customers}</div>
          </div>
          <div className="card p-4">
            <div className="text-xs text-text-muted mb-1">Repeat Rate</div>
            <div className="text-2xl font-bold text-text-primary">{stats.repeat_rate}%</div>
          </div>
        </div>
      )}

      {/* Search */}
      <div className="card p-6">
        <SearchBar
          value={searchTerm}
          onChange={handleSearch}
          placeholder="Search by name, email, or phone..."
        />
      </div>

      {/* Customers Table */}
      {loading ? (
        <SkeletonTable rows={10} columns={6} />
      ) : filteredCustomers.length === 0 ? (
        <div className="card p-12 text-center">
          <div className="text-gray-400 mb-4">
            <svg className="w-16 h-16 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
            </svg>
          </div>
          <h3 className="text-lg font-semibold text-text-primary mb-2">
            {searchTerm ? 'No customers found' : 'No customers yet'}
          </h3>
          <p className="text-text-secondary text-sm">
            {searchTerm 
              ? 'Try adjusting your search' 
              : 'Customers will appear here when orders are placed'}
          </p>
        </div>
      ) : (
        <>
          <div className="table-wrapper">
            <table className="admin-table">
              <thead>
                <tr>
                  <th>Customer</th>
                  <th>Contact</th>
                  <th className="text-center">Orders</th>
                  <th className="text-right">Total Spent</th>
                  <th>First Order</th>
                  <th>Last Order</th>
                </tr>
              </thead>
              <tbody>
                {paginatedCustomers.map((customer, idx) => (
                  <tr key={customer.id} className="hover:bg-surface transition-colors">
                    <td>
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full bg-admin-pink text-white flex items-center justify-center font-bold">
                          {customer.customer_name?.charAt(0)?.toUpperCase() || '?'}
                        </div>
                        <div>
                          <div className="font-medium text-text-primary">
                            {customer.customer_name || 'Guest'}
                          </div>
                          <div className="text-xs text-text-muted">
                            ID: {customer.id.substring(0, 8)}...
                          </div>
                        </div>
                      </div>
                    </td>
                    <td>
                      <div className="space-y-1">
                        {customer.customer_email && (
                          <div className="flex items-center gap-2 text-sm text-text-secondary">
                            <Mail className="w-3 h-3" />
                            {customer.customer_email}
                          </div>
                        )}
                        {customer.customer_phone && (
                          <div className="flex items-center gap-2 text-sm text-text-secondary">
                            <Phone className="w-3 h-3" />
                            {customer.customer_phone}
                          </div>
                        )}
                      </div>
                    </td>
                    <td className="text-center">
                      <div className="inline-flex items-center gap-1 px-3 py-1 bg-admin-grey rounded-full">
                        <ShoppingBag className="w-4 h-4 text-admin-slate" />
                        <span className="font-semibold text-admin-slate">
                          {customer.total_orders}
                        </span>
                      </div>
                    </td>
                    <td className="text-right">
                      <div className="flex items-center justify-end gap-1">
                        <DollarSign className="w-4 h-4 text-green-600" />
                        <span className="font-bold text-text-primary text-lg">
                          {formatCurrency(customer.total_spent, false)}
                        </span>
                      </div>
                    </td>
                    <td>
                      <div className="text-sm text-text-secondary">
                        {formatDate(customer.first_order, 'short')}
                      </div>
                    </td>
                    <td>
                      <div className="text-sm text-text-secondary">
                        {formatDate(customer.last_order, 'short')}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Pagination */}
          {totalPages > 1 && (
            <Pagination
              currentPage={currentPage}
              totalItems={filteredCustomers.length}
              itemsPerPage={itemsPerPage}
              onPageChange={setCurrentPage}
            />
          )}
        </>
      )}
    </div>
  );
}