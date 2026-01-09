// frontend/src/pages/admin/AdminShipmentsPage.jsx

import { useState, useEffect } from 'react';
import { 
  Package, Truck, Clock, CheckCircle, Search, RefreshCw, Filter, Plane, XCircle, AlertTriangle, X
} from 'lucide-react';
import shipmentService from '../../services/shipmentService';
import AdminShipmentCard from '../../components/admin/shipments/AdminShipmentCard';
import { ShipmentCardSkeleton } from '../../components/admin/shipments/ShipmentCardSkeleton';
import { ShipmentsEmptyState } from '../../components/admin/shipments/ShipmentsEmptyState';
import { ShipmentsLoadingState } from '../../components/admin/shipments/ShipmentsLoadingState';
import { ShipmentsErrorState } from '../../components/admin/shipments/ShipmentsErrorState';
import PageHeader from '../../components/admin/ui/PageHeader';
import EditShipmentModal from '../../components/admin/shipments/EditShipmentModal';
import BulkPickupModal from '../../components/admin/shipments/BulkPickupModal';
import Button from '../../components/admin/ui/Button';

const AdminShipmentsPage = () => {
  const [shipments, setShipments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [stats, setStats] = useState(null);
  const [selectedShipments, setSelectedShipments] = useState([]);
  const [bulkApproving, setBulkApproving] = useState(false);
  
  // Modal states
  const [approveModal, setApproveModal] = useState(null);
  const [bulkApproveModal, setBulkApproveModal] = useState(false);
  const [notification, setNotification] = useState(null);
  const [editModal, setEditModal] = useState(null); // Stores shipment to edit
  const [editingShipment, setEditingShipment] = useState(null); // Full shipment data
  const [bulkPickupModal, setBulkPickupModal] = useState(false);

  const [filters, setFilters] = useState({
    status: 'pending_review',
    page: 1,
    limit: 20,
    search: ''
  });

  useEffect(() => {
    loadShipments();
    loadStats();
  }, [filters.status, filters.page, filters.search]);

  // Auto-dismiss notifications after 5 seconds
  useEffect(() => {
    if (notification) {
      const timer = setTimeout(() => {
        setNotification(null);
      }, 5000);
      return () => clearTimeout(timer);
    }
  }, [notification]);

  const showNotification = (message, type = 'success') => {
    setNotification({ message, type });
  };

  const loadShipments = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const result = await shipmentService.getAllShipments(filters);
      
      if (result.success) {
        setShipments(result.data);
      } else {
        setError(result.error);
      }
    } catch (err) {
      setError(err.message || 'Failed to load shipments');
    } finally {
      setLoading(false);
    }
  };

  const loadStats = async () => {
    try {
      const result = await shipmentService.getShipmentStats();
      if (result.success) {
        setStats(result.data);
      }
    } catch (err) {
      console.error('Failed to load stats:', err);
    }
  };

  const handleApproveConfirm = async () => {
    const shipmentId = approveModal;
    setApproveModal(null);

    const result = await shipmentService.approveAndPlace(shipmentId);
    
    if (result.success) {
      showNotification('✅ Shipment approved and placed successfully!', 'success');
      loadShipments();
      loadStats();
    } else {
      showNotification(`❌ Failed: ${result.error}`, 'error');
    }
  };

  const handleBulkApproveConfirm = async () => {
    setBulkApproveModal(false);
    setBulkApproving(true);
    
    const result = await shipmentService.bulkApprove(selectedShipments);
    
    setBulkApproving(false);
    
    if (result.success) {
      const successCount = result.data.success?.length || 0;
      const failedCount = result.data.failed?.length || 0;
      
      showNotification(
        `✅ Bulk Approval Complete! Success: ${successCount}, Failed: ${failedCount}`,
        successCount > 0 ? 'success' : 'error'
      );
      
      setSelectedShipments([]);
      loadShipments();
      loadStats();
    } else {
      showNotification(`❌ Bulk approval failed: ${result.error}`, 'error');
    }
  };

  const toggleSelect = (id) => {
    setSelectedShipments(prev =>
      prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id]
    );
  };

  const clearFilters = () => {
    setFilters({
      status: '',
      page: 1,
      limit: 20,
      search: ''
    });
  };

  /**
   * Handle edit button click
   * Fetches full shipment data and opens edit modal
   */
  const handleEdit = async (shipmentId) => {
    try {
      console.log('📝 Opening edit modal for shipment:', shipmentId);
      
      // Fetch full shipment details
      const result = await shipmentService.getShipmentById(shipmentId);
      
      if (result.success) {
        setEditingShipment(result.data);
        setEditModal(shipmentId);
      } else {
        showNotification(`❌ Failed to load shipment: ${result.error}`, 'error');
      }
    } catch (error) {
      showNotification(`❌ Error: ${error.message}`, 'error');
    }
  };

  /**
   * Handle edit success
   * Reloads shipments and shows success message
   */
  const handleEditSuccess = (result) => {
    showNotification(
      `✅ Shipment updated successfully!\nFields changed: ${result.changes?.fields_changed?.join(', ')}`,
      'success'
    );
    
    // Reload shipments
    loadShipments();
    loadStats();
  };

  /**
   * Close edit modal
   */
  const handleEditClose = () => {
    setEditModal(null);
    setEditingShipment(null);
  };

  const hasActiveFilters = filters.status !== 'pending_review' || filters.search !== '';

  // ==================== RENDER ====================

  return (
    <div className="min-h-screen">
      
      {/* Notification Toast */}
      {notification && (
        <div className="fixed top-4 right-4 z-50 animate-slide-in-right">
          <div className={`flex items-start gap-3 p-4 rounded-lg shadow-lg border-2 min-w-[320px] max-w-md ${
            notification.type === 'success' 
              ? 'bg-green-50 border-green-500 text-green-900' 
              : 'bg-red-50 border-red-500 text-red-900'
          }`}>
            {notification.type === 'success' ? (
              <CheckCircle className="w-5 h-5 flex-shrink-0 mt-0.5" />
            ) : (
              <XCircle className="w-5 h-5 flex-shrink-0 mt-0.5" />
            )}
            <div className="flex-1">
              <p className="text-sm font-semibold whitespace-pre-line">{notification.message}</p>
            </div>
            <button
              onClick={() => setNotification(null)}
              className="text-gray-500 hover:text-gray-700"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}

      {/* Approve Modal */}
      {approveModal && (
        <ConfirmModal
          title="Approve & Place Shipment"
          message="This will send the shipment to the courier, generate AWB and labels, and lock editing. Continue?"
          icon={CheckCircle}
          iconColor="text-green-600"
          confirmText="Approve & Place"
          confirmClass="bg-green-600 hover:bg-green-700"
          onConfirm={handleApproveConfirm}
          onCancel={() => setApproveModal(null)}
        />
      )}

      {/* Bulk Approve Modal */}
      {bulkApproveModal && (
        <ConfirmModal
          title="Bulk Approve Shipments"
          message={`Approve ${selectedShipments.length} shipment(s)? This cannot be undone.`}
          icon={CheckCircle}
          iconColor="text-green-600"
          confirmText={`Approve ${selectedShipments.length} Shipments`}
          confirmClass="bg-green-600 hover:bg-green-700"
          onConfirm={handleBulkApproveConfirm}
          onCancel={() => setBulkApproveModal(false)}
        />
      )}
      
      {/* Header */}
      <div className='flex items-center justify-between gap-2'>
        <PageHeader
          title="Shipment Management"
          description="Review, edit, and approve shipments for delivery"
        />

        <Button
          onClick={() => setBulkPickupModal(true)}
          className="px-4 py-2 flex items-center gap-2 font-semibold"
        >
          <Package className="w-4 h-4" />
          Schedule Bulk Pickup
        </Button>
      </div>

      {/* Stats Cards - Compact Single Line */}
      {stats && (
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-3 mb-6">
          <div className="flex items-center justify-between gap-2 flex-wrap">
            <StatCard
              label="All"
              value={stats.total || 0}
              color="yellow"
              active={filters.status === ''}
              onClick={() => setFilters({ ...filters, status: '', page: 1 })}
            />
            <StatCard
              label="Pending Review"
              value={stats.pending_review || 0}
              color="yellow"
              active={filters.status === 'pending_review'}
              onClick={() => setFilters({ ...filters, status: 'pending_review', page: 1 })}
            />
            <StatCard
              label="Approved"
              value={stats.approved || 0}
              color="blue"
              active={filters.status === 'approved'}
              onClick={() => setFilters({ ...filters, status: 'approved', page: 1 })}
            />
            <StatCard
              label="Placed"
              value={stats.placed || 0}
              color="green"
              active={filters.status === 'placed'}
              onClick={() => setFilters({ ...filters, status: 'placed', page: 1 })}
            />
            <StatCard
              label="Pending Pickup"
              value={stats.pending_pickup || 0}
              color="purple"
              active={filters.status === 'pending_pickup'}
              onClick={() => setFilters({ ...filters, status: 'pending_pickup', page: 1 })}
            />
            <StatCard
              label="Picked Up"
              value={stats.picked_up || 0}
              color="indigo"
              active={filters.status === 'picked_up'}
              onClick={() => setFilters({ ...filters, status: 'picked_up', page: 1 })}
            />
            <StatCard
              label="In Transit"
              value={stats.in_transit || 0}
              color="blue"
              active={filters.status === 'in_transit'}
              onClick={() => setFilters({ ...filters, status: 'in_transit', page: 1 })}
            />
            <StatCard
              label="Out for Delivery"
              value={stats.out_for_delivery || 0}
              color="teal"
              active={filters.status === 'out_for_delivery'}
              onClick={() => setFilters({ ...filters, status: 'out_for_delivery', page: 1 })}
            />
            <StatCard
              label="Delivered"
              value={stats.delivered || 0}
              color="green"
              active={filters.status === 'delivered'}
              onClick={() => setFilters({ ...filters, status: 'delivered', page: 1 })}
            />
            <StatCard
              label="Failed"
              value={stats.failed || 0}
              color="red"
              active={filters.status === 'failed'}
              onClick={() => setFilters({ ...filters, status: 'failed', page: 1 })}
            />
            <StatCard
              label="Cancelled"
              value={stats.cancelled || 0}
              color="gray"
              active={filters.status === 'cancelled'}
              onClick={() => setFilters({ ...filters, status: 'cancelled', page: 1 })}
            />
          </div>
        </div>
      )}

      {/* Filters Bar */}
      <div className="bg-white rounded-lg shadow-sm p-4 mb-6 border border-gray-200">
        <div className="flex flex-wrap items-center gap-4">
          <div className="flex-1 min-w-[200px]">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
              <input
                type="text"
                placeholder="Search by order ID, AWB, customer..."
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-tpppink focus:border-transparent"
                value={filters.search}
                onChange={(e) => setFilters({ ...filters, search: e.target.value, page: 1 })}
              />
            </div>
          </div>

          <select
            className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-tpppink"
            value={filters.status}
            onChange={(e) => setFilters({ ...filters, status: e.target.value, page: 1 })}
          >
            <option value="">All Statuses</option>
            <option value="pending_review">Pending Review</option>
            <option value="approved">Approved</option>
            <option value="placed">Placed</option>
            <option value="picked_up">Picked Up</option>
            <option value="in_transit">In Transit</option>
            <option value="delivered">Delivered</option>
            <option value="failed">Failed</option>
            <option value="cancelled">Cancelled</option>
          </select>

          {selectedShipments.length > 0 && (
            <button
              onClick={() => {
                if (selectedShipments.length === 0) {
                  showNotification('Please select at least one shipment.', 'error');
                  return;
                }
                setBulkApproveModal(true);
              }}
              disabled={bulkApproving}
              className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2 font-semibold"
            >
              <CheckCircle className="w-4 h-4" />
              {bulkApproving ? 'Approving...' : `Bulk Approve (${selectedShipments.length})`}
            </button>
          )}

          {hasActiveFilters && (
            <button
              onClick={clearFilters}
              className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 flex items-center gap-2 font-semibold text-gray-700"
            >
              <Filter className="w-4 h-4" />
              Clear Filters
            </button>
          )}

          <button
            onClick={loadShipments}
            className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 flex items-center gap-2 font-semibold text-gray-700"
          >
            <RefreshCw className="w-4 h-4" />
            Refresh
          </button>
        </div>
      </div>

      {/* Shipments List */}
      <div className="space-y-4">
        {error ? (
          <ShipmentsErrorState error={error} onRetry={loadShipments} />
        ) : loading ? (
          <>
            <ShipmentCardSkeleton />
            <ShipmentCardSkeleton />
            <ShipmentCardSkeleton />
          </>
        ) : shipments.length === 0 ? (
          <ShipmentsEmptyState
            hasFilters={hasActiveFilters}
            onClearFilters={clearFilters}
            onRefresh={loadShipments}
          />
        ) : (
          shipments.map(shipment => (
            <AdminShipmentCard
              key={shipment.id}
              shipment={shipment}
              selected={selectedShipments.includes(shipment.id)}
              onToggleSelect={() => toggleSelect(shipment.id)}
              onApprove={(id) => setApproveModal(id)}
              onSchedulePickup={(id) => setPickupModal(id)}
              onEditPickup={(id) => setEditPickupModal(id)}
              onEdit={handleEdit}
              onViewDetails={(id) => showNotification(`View details: ${id}`, 'success')}
            />
          ))
        )}
      </div>
      {/* Edit Shipment Modal */}
      {editModal && editingShipment && (
        <EditShipmentModal
          shipment={editingShipment}
          isOpen={!!editModal}
          onClose={handleEditClose}
          onSuccess={handleEditSuccess}
        />
      )}


      {/* Bulk Pickup Modal */}
      <BulkPickupModal
        isOpen={bulkPickupModal}
        onClose={() => setBulkPickupModal(false)}
        onSuccess={(result) => {
          showNotification(
            `✅ Pickup scheduled for ${result.data.shipment_count} shipments`,
            'success'
          );
          loadShipments();
          loadStats();
        }}
      />

    </div>
  );
};

// ==================== MODAL COMPONENTS ====================

const ConfirmModal = ({ 
  title, 
  message, 
  icon: Icon, 
  iconColor, 
  confirmText, 
  confirmClass, 
  onConfirm, 
  onCancel 
}) => (
  <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
    <div className="bg-white rounded-xl shadow-2xl max-w-md w-full p-6 animate-scale-in">
      <div className="flex items-start gap-4 mb-6">
        <div className={`${iconColor} bg-current/10 rounded-full p-3`}>
          <Icon className={`w-6 h-6 ${iconColor}`} />
        </div>
        <div className="flex-1">
          <h3 className="text-lg font-bold text-gray-900 mb-2">{title}</h3>
          <p className="text-gray-600 text-sm leading-relaxed whitespace-pre-line">{message}</p>
        </div>
      </div>
      <div className="flex gap-3 justify-end">
        <button
          onClick={onCancel}
          className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 font-semibold text-gray-700 transition-colors"
        >
          Cancel
        </button>
        <button
          onClick={onConfirm}
          className={`px-4 py-2 text-white rounded-lg font-semibold transition-colors ${confirmClass}`}
        >
          {confirmText}
        </button>
      </div>
    </div>
  </div>
);

const EditPickupModal = ({ onConfirm, onCancel }) => {
  const [date, setDate] = useState('');
  const [error, setError] = useState('');

  const handleConfirm = () => {
    if (!date) {
      setError('Please enter a date');
      return;
    }
    if (!/^\d{4}-\d{2}-\d{2}$/.test(date)) {
      setError('Invalid date format. Use YYYY-MM-DD');
      return;
    }
    onConfirm(date);
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl shadow-2xl max-w-md w-full p-6 animate-scale-in">
        <div className="flex items-start gap-4 mb-6">
          <div className="text-amber-600 bg-amber-100 rounded-full p-3">
            <Clock className="w-6 h-6" />
          </div>
          <div className="flex-1">
            <h3 className="text-lg font-bold text-gray-900 mb-2">Edit Pickup Date</h3>
            <p className="text-gray-600 text-sm mb-4">Enter new pickup date</p>
            <input
              type="date"
              value={date}
              onChange={(e) => {
                setDate(e.target.value);
                setError('');
              }}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-500"
              min={new Date().toISOString().split('T')[0]}
            />
            {error && (
              <p className="text-red-600 text-sm mt-2">{error}</p>
            )}
          </div>
        </div>
        <div className="flex gap-3 justify-end">
          <button
            onClick={onCancel}
            className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 font-semibold text-gray-700 transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={handleConfirm}
            className="px-4 py-2 bg-amber-600 hover:bg-amber-700 text-white rounded-lg font-semibold transition-colors"
          >
            Reschedule Pickup
          </button>
        </div>
      </div>
    </div>
  );
};

// ==================== STAT CARD COMPONENT ====================

const StatCard = ({ label, value, color, active, onClick }) => {
  const colors = {
    yellow: 'bg-yellow-50 text-yellow-700 border-yellow-300 hover:bg-yellow-100',
    blue: 'bg-blue-50 text-blue-700 border-blue-300 hover:bg-blue-100',
    purple: 'bg-purple-50 text-purple-700 border-purple-300 hover:bg-purple-100',
    indigo: 'bg-indigo-50 text-indigo-700 border-indigo-300 hover:bg-indigo-100',
    teal: 'bg-teal-50 text-teal-700 border-teal-300 hover:bg-teal-100',
    green: 'bg-green-50 text-green-700 border-green-300 hover:bg-green-100',
    red: 'bg-red-50 text-red-700 border-red-300 hover:bg-red-100',
    gray: 'bg-gray-50 text-gray-700 border-gray-300 hover:bg-gray-100'
  };

  return (
    <button
      onClick={onClick}
      className={`
        ${colors[color]} 
        ${active ? 'ring-2 ring-tpppink ring-offset-1 font-bold' : 'font-medium'} 
        border rounded-lg px-3 py-1.5 
        transition-all duration-150
        hover:shadow-sm
        flex items-center gap-2
        text-sm whitespace-nowrap
      `}
    >
      <span className="text-xs opacity-75">{label}:</span>
      <span className="text-lg font-bold">{value}</span>
    </button>
  );
};

export default AdminShipmentsPage;