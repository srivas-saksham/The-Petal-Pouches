// frontend/src/pages/admin/CustomersPage.jsx

import { useState, useEffect } from 'react';
import { Mail, Phone, ShoppingBag, DollarSign } from 'lucide-react';
import PageHeader from '../../components/admin/ui/PageHeader';
import SearchBar from '../../components/admin/ui/SearchBar';
import Button from '../../components/admin/ui/Button';
import StatusBadge from '../../components/admin/ui/StatusBadge';
import Pagination from '../../components/admin/ui/Pagination';
import { formatCurrency, formatDate, getRelativeTime, getInitials, getAvatarColor } from '../../utils/adminHelpers';
import { mockCustomers } from '../../utils/mockData';

export default function CustomersPage() {
  const [customers, setCustomers] = useState([]);
  const [filteredCustomers, setFilteredCustomers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [sortBy, setSortBy] = useState('recent'); // 'recent' | 'spending' | 'orders'

  // Pagination
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 20;

  useEffect(() => {
    // Simulate API call - replace with actual API
    setTimeout(() => {
      setCustomers(mockCustomers);
      setLoading(false);
    }, 1000);
  }, []);

  useEffect(() => {
    let filtered = [...customers];

    // Apply search
    if (searchTerm) {
      filtered = filtered.filter(customer =>
        customer.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        customer.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
        customer.phone.includes(searchTerm)
      );
    }

    // Apply sorting
    switch (sortBy) {
      case 'spending':
        filtered.sort((a, b) => b.total_spent - a.total_spent);
        break;
      case 'orders':
        filtered.sort((a, b) => b.total_orders - a.total_orders);
        break;
      case 'recent':
      default:
        filtered.sort((a, b) => new Date(b.last_order) - new Date(a.last_order));
        break;
    }

    setFilteredCustomers(filtered);
    setCurrentPage(1);
  }, [searchTerm, sortBy, customers]);

  // Stats
  const totalCustomers = customers.length;
  const totalSpent = customers.reduce((sum, c) => sum + c.total_spent, 0);
  const totalOrders = customers.reduce((sum, c) => sum + c.total_orders, 0);
  const avgOrderValue = totalOrders > 0 ? totalSpent / totalOrders : 0;

  // Pagination
  const totalItems = filteredCustomers.length;
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const paginatedCustomers = filteredCustomers.slice(startIndex, endIndex);

  const handleViewCustomer = (customerId) => {
    // TODO: Implement customer details view
    console.log('View customer:', customerId);
    alert(`Customer details view coming soon!\nCustomer ID: ${customerId}`);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <PageHeader
        title="Customers"
        description="Manage your customer database"
      />

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="card p-6">
          <div className="flex items-center justify-between mb-4">
            <div className="w-12 h-12 bg-blue-50 rounded-lg flex items-center justify-center">
              <ShoppingBag className="w-6 h-6 text-blue-600" />
            </div>
            <div className="text-3xl font-bold text-text-primary">
              {totalCustomers}
            </div>
          </div>
          <div className="text-sm font-medium text-text-secondary">
            Total Customers
          </div>
        </div>

        <div className="card p-6">
          <div className="flex items-center justify-between mb-4">
            <div className="w-12 h-12 bg-green-50 rounded-lg flex items-center justify-center">
              <DollarSign className="w-6 h-6 text-green-600" />
            </div>
            <div className="text-3xl font-bold text-text-primary">
              {formatCurrency(totalSpent, false)}
            </div>
          </div>
          <div className="text-sm font-medium text-text-secondary">
            Total Revenue
          </div>
        </div>

        <div className="card p-6">
          <div className="flex items-center justify-between mb-4">
            <div className="w-12 h-12 bg-purple-50 rounded-lg flex items-center justify-center">
              <ShoppingBag className="w-6 h-6 text-purple-600" />
            </div>
            <div className="text-3xl font-bold text-text-primary">
              {totalOrders}
            </div>
          </div>
          <div className="text-sm font-medium text-text-secondary">
            Total Orders
          </div>
        </div>

        <div className="card p-6">
          <div className="flex items-center justify-between mb-4">
            <div className="w-12 h-12 bg-yellow-50 rounded-lg flex items-center justify-center">
              <DollarSign className="w-6 h-6 text-yellow-600" />
            </div>
            <div className="text-3xl font-bold text-text-primary">
              {formatCurrency(avgOrderValue, false)}
            </div>
          </div>
          <div className="text-sm font-medium text-text-secondary">
            Avg Order Value
          </div>
        </div>
      </div>

      {/* Search & Sort */}
      <div className="card p-6">
        <div className="flex flex-col lg:flex-row gap-4">
          <div className="flex-1">
            <SearchBar
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Search by name, email, or phone..."
            />
          </div>
          <div className="flex gap-2">
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              className="form-input min-w-[200px]"
            >
              <option value="recent">Recent Orders</option>
              <option value="spending">Highest Spending</option>
              <option value="orders">Most Orders</option>
            </select>
          </div>
        </div>
      </div>

      {/* Customers Table */}
      {loading ? (
        <div className="text-center py-12">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-admin-pink mx-auto"></div>
          <p className="text-text-muted mt-4">Loading customers...</p>
        </div>
      ) : paginatedCustomers.length === 0 ? (
        <div className="card p-12 text-center">
          <div className="text-gray-400 mb-4">
            <svg className="w-16 h-16 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
            </svg>
          </div>
          <h3 className="text-lg font-semibold text-text-primary mb-2">No customers found</h3>
          <p className="text-text-secondary text-sm">
            {searchTerm 
              ? 'Try adjusting your search' 
              : 'Customers will appear here when they make purchases'}
          </p>
        </div>
      ) : (
        <>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {paginatedCustomers.map((customer) => (
              <div
                key={customer.id}
                className="card p-6 hover:shadow-hover transition-shadow cursor-pointer"
                onClick={() => handleViewCustomer(customer.id)}
              >
                <div className="flex items-start gap-4">
                  {/* Avatar */}
                  <div className={`w-16 h-16 ${getAvatarColor(customer.name)} rounded-full flex items-center justify-center flex-shrink-0`}>
                    <span className="text-white font-bold text-xl">
                      {getInitials(customer.name)}
                    </span>
                  </div>

                  {/* Customer Info */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between mb-2">
                      <div className="flex-1 min-w-0">
                        <h3 className="text-lg font-semibold text-text-primary truncate">
                          {customer.name}
                        </h3>
                        <div className="flex items-center gap-2 text-sm text-text-muted mt-1">
                          <Mail className="w-4 h-4 flex-shrink-0" />
                          <span className="truncate">{customer.email}</span>
                        </div>
                        <div className="flex items-center gap-2 text-sm text-text-muted mt-1">
                          <Phone className="w-4 h-4 flex-shrink-0" />
                          <span>{customer.phone}</span>
                        </div>
                      </div>
                      <StatusBadge status={customer.status} className="ml-2" />
                    </div>

                    {/* Stats */}
                    <div className="grid grid-cols-3 gap-4 mt-4 pt-4 border-t border-border">
                      <div>
                        <div className="text-xs text-text-muted">Orders</div>
                        <div className="text-lg font-semibold text-text-primary">
                          {customer.total_orders}
                        </div>
                      </div>
                      <div>
                        <div className="text-xs text-text-muted">Total Spent</div>
                        <div className="text-lg font-semibold text-admin-pink">
                          {formatCurrency(customer.total_spent, false)}
                        </div>
                      </div>
                      <div>
                        <div className="text-xs text-text-muted">Avg Order</div>
                        <div className="text-lg font-semibold text-text-primary">
                          {formatCurrency(customer.total_spent / customer.total_orders, false)}
                        </div>
                      </div>
                    </div>

                    {/* Last Order */}
                    <div className="mt-3 text-sm text-text-secondary">
                      Last order: {getRelativeTime(customer.last_order)}
                    </div>

                    {/* Member Since */}
                    <div className="mt-1 text-xs text-text-muted">
                      Customer since {formatDate(customer.created_at, 'short')}
                    </div>
                  </div>
                </div>
              </div>
            ))}
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