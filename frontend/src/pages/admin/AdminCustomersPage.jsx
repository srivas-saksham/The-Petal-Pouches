// frontend/src/pages/admin/AdminCustomersPage.jsx
/**
 * Admin Customers Page - Refactored with Components
 * Two-column card layout with right sidebar details
 */

import { useState, useEffect } from 'react';
import AdminCustomersStats from '../../components/admin/customers/AdminCustomersStats';
import AdminCustomersFilters from '../../components/admin/customers/AdminCustomersFilters';
import AdminCustomersList from '../../components/admin/customers/AdminCustomersList';
import CustomerDetailsSidebar from '../../components/admin/customers/CustomerDetailsSidebar';
import PageHeader from '../../components/admin/ui/PageHeader';
import adminCustomerService from '../../services/adminCustomerService';
import { useToast } from '../../hooks/useToast';

export default function AdminCustomersPage() {
  const [customers, setCustomers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState(null);
  const [selectedCustomer, setSelectedCustomer] = useState(null);
  const [customerDetails, setCustomerDetails] = useState(null);
  const [loadingDetails, setLoadingDetails] = useState(false);
  
  const [filters, setFilters] = useState({
    status: 'all',
    page: 1,
    limit: 20,
    search: '',
    sort: 'created_at',
    order: 'desc'
  });

  const [pagination, setPagination] = useState({
    page: 1,
    limit: 20,
    total: 0,
    pages: 0
  });

  const toast = useToast();

  // ==================== LOAD DATA ====================

  useEffect(() => {
    loadCustomers();
    loadStats();
  }, [filters.status, filters.page, filters.search, filters.sort, filters.order]);

  const loadCustomers = async () => {
    try {
      setLoading(true);
      const result = await adminCustomerService.getAllCustomers(filters);
      
      if (result.success) {
        setCustomers(result.data);
        if (result.metadata) {
          setPagination(prev => ({
            ...prev,
            total: result.metadata.totalCount || 0,
            pages: result.metadata.totalPages || 0
          }));
        }
      } else {
        toast.error(result.error || 'Failed to load customers');
      }
    } catch (err) {
      console.error('Error loading customers:', err);
      toast.error('Failed to load customers');
    } finally {
      setLoading(false);
    }
  };

  const loadStats = async () => {
    try {
      const result = await adminCustomerService.getCustomerStats();
      if (result.success) {
        setStats(result.data);
      }
    } catch (err) {
      console.error('Failed to load stats:', err);
    }
  };

  const loadCustomerDetails = async (customerId) => {
    try {
      setLoadingDetails(true);
      const result = await adminCustomerService.getCustomerById(customerId);
      if (result.success) {
        setCustomerDetails(result.data);
      } else {
        toast.error('Failed to load customer details');
      }
    } catch (err) {
      console.error('Failed to load customer details:', err);
      toast.error('Failed to load customer details');
    } finally {
      setLoadingDetails(false);
    }
  };

  // ==================== HANDLERS ====================

  const handleFilterChange = (key, value) => {
    setFilters(prev => ({ ...prev, [key]: value, page: 1 }));
    setPagination(prev => ({ ...prev, page: 1 }));
  };

  const handleResetFilters = () => {
    setFilters({
      status: 'all',
      page: 1,
      limit: 20,
      search: '',
      sort: 'created_at',
      order: 'desc'
    });
    setPagination(prev => ({ ...prev, page: 1 }));
  };

  const handleRefresh = () => {
    loadCustomers();
    loadStats();
  };

  const handleViewDetails = (customer) => {
    setSelectedCustomer(customer);
    loadCustomerDetails(customer.id);
  };

  const handleCloseSidebar = () => {
    setSelectedCustomer(null);
    setCustomerDetails(null);
  };

  const handlePageChange = (newPage) => {
    setFilters(prev => ({ ...prev, page: newPage }));
    setPagination(prev => ({ ...prev, page: newPage }));
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const hasActiveFilters = filters.status !== 'all' || filters.search !== '';

  // ==================== RENDER ====================

  return (
    <div className="min-h-screen">
      <div className="max-w-7xl mx-auto">
        
        {/* Page Header */}
        <PageHeader
          title="Customer Management"
          description="View and manage customer accounts and order history"
        />

        {/* Stats Cards */}
        <AdminCustomersStats
          stats={stats}
          filters={filters}
          onFilterChange={handleFilterChange}
        />

        {/* Filters */}
        <AdminCustomersFilters
          filters={filters}
          onFilterChange={handleFilterChange}
          onReset={handleResetFilters}
          onRefresh={handleRefresh}
          hasActiveFilters={hasActiveFilters}
        />

        {/* Customers List - Two Column Grid */}
        <div className="mt-6">
          <AdminCustomersList
            customers={customers}
            loading={loading}
            onViewDetails={handleViewDetails}
            emptyMessage={hasActiveFilters ? "No customers match your filters" : "No customers yet"}
          />
        </div>

        {/* Pagination */}
        {!loading && pagination.pages > 1 && (
          <div className="bg-white rounded-lg border border-tppslate/10 p-4 mt-6">
            <div className="flex items-center justify-between">
              <p className="text-sm text-tppslate/60">
                Showing {((pagination.page - 1) * pagination.limit) + 1} to{' '}
                {Math.min(pagination.page * pagination.limit, pagination.total)} of{' '}
                {pagination.total} customers
              </p>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => handlePageChange(pagination.page - 1)}
                  disabled={pagination.page === 1}
                  className="px-3 py-1.5 text-sm border border-tppslate/20 rounded hover:bg-tppslate/5 disabled:opacity-30 disabled:cursor-not-allowed font-medium"
                >
                  Previous
                </button>
                <span className="text-sm text-tppslate font-medium">
                  Page {pagination.page} of {pagination.pages}
                </span>
                <button
                  onClick={() => handlePageChange(pagination.page + 1)}
                  disabled={pagination.page === pagination.pages}
                  className="px-3 py-1.5 text-sm border border-tppslate/20 rounded hover:bg-tppslate/5 disabled:opacity-30 disabled:cursor-not-allowed font-medium"
                >
                  Next
                </button>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Customer Details Sidebar */}
      {selectedCustomer && (
        <CustomerDetailsSidebar
          customer={selectedCustomer}
          details={customerDetails}
          loading={loadingDetails}
          onClose={handleCloseSidebar}
        />
      )}
    </div>
  );
}