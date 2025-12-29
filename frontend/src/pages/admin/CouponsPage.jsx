// frontend/src/pages/admin/CouponsPage.jsx
/**
 * Admin Coupons Page - Two-Column Layout
 * Manage all coupon codes - create, edit, delete, toggle status
 */

import { useState, useEffect } from 'react';
import { 
  Plus, Search, Filter, RefreshCw, Ticket, TrendingUp, 
  AlertCircle, Loader, X
} from 'lucide-react';
import PageHeader from '../../components/admin/ui/PageHeader';
import AdminCouponCard from '../../components/admin/coupons/AdminCouponCard';
import CouponFormModal from '../../components/admin/coupons/CouponFormModal';
import { useToast } from '../../hooks/useToast';
import {
  getAllCoupons,
  deleteCoupon,
  toggleCouponStatus
} from '../../services/adminCouponService';

export default function CouponsPage() {
  const [coupons, setCoupons] = useState([]);
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({
    total: 0,
    active: 0,
    inactive: 0,
    expired: 0,
    scheduled: 0
  });
  
  // Modal states
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [editingCoupon, setEditingCoupon] = useState(null);
  const [deletingCoupon, setDeletingCoupon] = useState(null);
  
  // Filters
  const [filters, setFilters] = useState({
    status: '',
    search: '',
    page: 1,
    limit: 20
  });

  const toast = useToast();

  useEffect(() => {
    fetchCoupons();
  }, [filters.status, filters.search, filters.page]);

  // ==================== DATA FETCHING ====================

  const fetchCoupons = async () => {
    setLoading(true);
    
    try {
      const result = await getAllCoupons({
        page: filters.page,
        limit: filters.limit,
        status: filters.status || null,
        search: filters.search || null
      });

      if (result.success) {
        setCoupons(result.data.coupons || []);
        
        // Calculate stats
        const total = result.data.total || 0;
        const active = result.data.coupons?.filter(c => 
          c.is_active && 
          new Date(c.end_date) >= new Date() &&
          new Date(c.start_date) <= new Date()
        ).length || 0;
        const inactive = result.data.coupons?.filter(c => !c.is_active).length || 0;
        const expired = result.data.coupons?.filter(c => 
          new Date(c.end_date) < new Date()
        ).length || 0;
        const scheduled = result.data.coupons?.filter(c => 
          new Date(c.start_date) > new Date()
        ).length || 0;

        setStats({ total, active, inactive, expired, scheduled });
      } else {
        toast.error(result.error || 'Failed to fetch coupons');
      }
    } catch (error) {
      console.error('Error fetching coupons:', error);
      toast.error('Failed to fetch coupons');
    } finally {
      setLoading(false);
    }
  };

  // ==================== HANDLERS ====================

  const handleCreateSuccess = (message) => {
    toast.success(message || 'Coupon created successfully!');
    setShowCreateModal(false);
    fetchCoupons();
  };

  const handleEditSuccess = (message) => {
    toast.success(message || 'Coupon updated successfully!');
    setEditingCoupon(null);
    fetchCoupons();
  };

  const handleEdit = (coupon) => {
    setEditingCoupon(coupon);
  };

  const handleToggleStatus = async (id) => {
    try {
      const result = await toggleCouponStatus(id);

      if (result.success) {
        toast.success(result.message || 'Status updated successfully!');
        fetchCoupons();
      } else {
        toast.error(result.error || 'Failed to update status');
      }
    } catch (error) {
      console.error('Error toggling status:', error);
      toast.error('Failed to update status');
    }
  };

  const handleDelete = (coupon) => {
    // Directly show modal without confirmation in card
    setDeletingCoupon(coupon);
  };

  const confirmDelete = async () => {
    if (!deletingCoupon) return;

    try {
      const result = await deleteCoupon(deletingCoupon.id);

      if (result.success) {
        toast.success('Coupon deleted successfully!');
        setDeletingCoupon(null);
        fetchCoupons();
      } else {
        toast.error(result.error || 'Failed to delete coupon');
      }
    } catch (error) {
      console.error('Error deleting coupon:', error);
      toast.error('Failed to delete coupon');
    }
  };

  const handleSearchChange = (e) => {
    setFilters({ ...filters, search: e.target.value, page: 1 });
  };

  const handleStatusFilter = (status) => {
    setFilters({ ...filters, status: status === filters.status ? '' : status, page: 1 });
  };

  const clearFilters = () => {
    setFilters({
      status: '',
      search: '',
      page: 1,
      limit: 20
    });
  };

  const hasActiveFilters = filters.status || filters.search;

  // ==================== RENDER ====================

  return (
    <div className="space-y-5">
      {/* Header */}
      <PageHeader
        title="Coupon Management"
        description="Create and manage discount coupons for your store"
        actions={
          <button
            onClick={() => setShowCreateModal(true)}
            className="flex items-center gap-2 px-4 py-2.5 bg-tpppink text-white rounded-lg hover:bg-tpppink/90 font-semibold transition-all shadow-sm hover:shadow-md"
          >
            <Plus className="w-4 h-4" />
            Create Coupon
          </button>
        }
      />

      {/* Stats Cards */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
        <StatCard
          label="Total"
          value={stats.total}
          icon={Ticket}
          color="blue"
          active={!filters.status}
          onClick={() => handleStatusFilter('')}
        />
        <StatCard
          label="Active"
          value={stats.active}
          icon={TrendingUp}
          color="green"
          active={filters.status === 'active'}
          onClick={() => handleStatusFilter('active')}
        />
        <StatCard
          label="Inactive"
          value={stats.inactive}
          icon={AlertCircle}
          color="gray"
          active={filters.status === 'inactive'}
          onClick={() => handleStatusFilter('inactive')}
        />
        <StatCard
          label="Expired"
          value={stats.expired}
          icon={AlertCircle}
          color="red"
          active={filters.status === 'expired'}
          onClick={() => handleStatusFilter('expired')}
        />
        <StatCard
          label="Scheduled"
          value={stats.scheduled}
          icon={AlertCircle}
          color="yellow"
          active={filters.status === 'scheduled'}
          onClick={() => handleStatusFilter('scheduled')}
        />
      </div>

      {/* Filters Bar */}
      <div className="bg-white rounded-xl shadow-sm p-4 border-2 border-slate-200">
        <div className="flex flex-wrap items-center gap-3">
          {/* Search */}
          <div className="flex-1 min-w-[200px]">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
              <input
                type="text"
                placeholder="Search by code or description..."
                className="w-full pl-10 pr-4 py-2.5 text-sm border-2 border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-tpppink/20 focus:border-tpppink transition-all"
                value={filters.search}
                onChange={handleSearchChange}
              />
            </div>
          </div>

          {/* Clear Filters */}
          {hasActiveFilters && (
            <button
              onClick={clearFilters}
              className="px-4 py-2.5 border-2 border-slate-200 rounded-lg hover:bg-slate-50 flex items-center gap-2 font-semibold text-slate-700 transition-all text-sm"
            >
              <X className="w-4 h-4" />
              Clear
            </button>
          )}

          {/* Refresh */}
          <button
            onClick={fetchCoupons}
            className="px-4 py-2.5 border-2 border-slate-200 rounded-lg hover:bg-slate-50 flex items-center gap-2 font-semibold text-slate-700 transition-all text-sm"
          >
            <RefreshCw className="w-4 h-4" />
            Refresh
          </button>
        </div>
      </div>

      {/* Coupons Grid - TWO COLUMNS */}
      {loading ? (
        <div className="flex items-center justify-center py-16">
          <Loader className="w-8 h-8 text-tpppink animate-spin" />
        </div>
      ) : coupons.length === 0 ? (
        <div className="bg-white rounded-xl border-2 border-slate-200 p-12 text-center">
          <Ticket className="w-16 h-16 text-slate-300 mx-auto mb-4" />
          <h3 className="text-lg font-bold text-slate-800 mb-2">
            {hasActiveFilters ? 'No coupons found' : 'No coupons yet'}
          </h3>
          <p className="text-slate-600 text-sm mb-6">
            {hasActiveFilters 
              ? 'Try adjusting your filters'
              : 'Create your first coupon to start offering discounts'
            }
          </p>
          {!hasActiveFilters && (
            <button
              onClick={() => setShowCreateModal(true)}
              className="px-6 py-3 bg-tpppink text-white rounded-lg hover:bg-tpppink/90 font-semibold transition-colors inline-flex items-center gap-2 shadow-sm hover:shadow-md"
            >
              <Plus className="w-5 h-5" />
              Create First Coupon
            </button>
          )}
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          {coupons.map(coupon => (
            <AdminCouponCard
              key={coupon.id}
              coupon={coupon}
              onEdit={handleEdit}
              onDelete={handleDelete}
              onToggle={handleToggleStatus}
            />
          ))}
        </div>
      )}

      {/* Create Modal */}
      {showCreateModal && (
        <CouponFormModal
          isOpen={showCreateModal}
          onClose={() => setShowCreateModal(false)}
          onSuccess={handleCreateSuccess}
        />
      )}

      {/* Edit Modal */}
      {editingCoupon && (
        <CouponFormModal
          isOpen={!!editingCoupon}
          coupon={editingCoupon}
          onClose={() => setEditingCoupon(null)}
          onSuccess={handleEditSuccess}
        />
      )}

      {/* Delete Confirmation Modal */}
      {deletingCoupon && (
        <DeleteConfirmModal
          coupon={deletingCoupon}
          onConfirm={confirmDelete}
          onCancel={() => setDeletingCoupon(null)}
        />
      )}
    </div>
  );
}

// ==================== STAT CARD COMPONENT ====================

const StatCard = ({ label, value, icon: Icon, color, active, onClick }) => {
  const colors = {
    blue: 'bg-blue-50 text-blue-700 border-blue-200 hover:border-blue-300',
    green: 'bg-green-50 text-green-700 border-green-200 hover:border-green-300',
    gray: 'bg-gray-50 text-gray-700 border-gray-200 hover:border-gray-300',
    red: 'bg-red-50 text-red-700 border-red-200 hover:border-red-300',
    yellow: 'bg-yellow-50 text-yellow-700 border-yellow-200 hover:border-yellow-300'
  };

  return (
    <button
      onClick={onClick}
      className={`
        ${colors[color]}
        ${active ? 'ring-2 ring-tpppink ring-offset-2 shadow-md' : 'shadow-sm'}
        border-2 rounded-lg p-3 transition-all duration-200 cursor-pointer
        hover:shadow-md text-left w-full
      `}
    >
      <div className="flex items-center justify-between mb-1.5">
        <Icon className="w-4 h-4" />
        <span className="text-2xl font-bold leading-none">{value}</span>
      </div>
      <div className="text-[10px] font-bold uppercase tracking-wider opacity-80">
        {label}
      </div>
    </button>
  );
};

// ==================== DELETE CONFIRMATION MODAL ====================

const DeleteConfirmModal = ({ coupon, onConfirm, onCancel }) => (
  <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
    <div className="bg-white rounded-xl shadow-2xl max-w-md w-full p-6 animate-scale-in">
      <div className="flex items-start gap-4 mb-6">
        <div className="w-12 h-12 rounded-full bg-red-100 flex items-center justify-center flex-shrink-0">
          <AlertCircle className="w-6 h-6 text-red-600" />
        </div>
        <div className="flex-1">
          <h3 className="text-lg font-bold text-slate-800 mb-2">Delete Coupon?</h3>
          <p className="text-sm text-slate-600 mb-3">
            Are you sure you want to delete <span className="font-bold text-slate-800 font-mono">"{coupon.code}"</span>?
          </p>
          <p className="text-xs text-red-600 font-medium bg-red-50 px-3 py-2 rounded-lg border border-red-200">
            This action cannot be undone. The coupon cannot be deleted if it has already been used.
          </p>
        </div>
      </div>
      <div className="flex gap-3 justify-end">
        <button
          onClick={onCancel}
          className="px-5 py-2.5 border-2 border-slate-200 rounded-lg hover:bg-slate-50 font-semibold text-slate-700 transition-all"
        >
          Cancel
        </button>
        <button
          onClick={onConfirm}
          className="px-5 py-2.5 bg-red-600 text-white rounded-lg hover:bg-red-700 font-semibold transition-all shadow-sm hover:shadow-md"
        >
          Delete Coupon
        </button>
      </div>
    </div>
  </div>
);