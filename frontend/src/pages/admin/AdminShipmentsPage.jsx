// frontend/src/pages/admin/AdminShipmentsPage.jsx

import { useState, useEffect } from 'react';
import { 
  Package, Truck, Clock, CheckCircle, Search, RefreshCw, Filter, Plane
} from 'lucide-react';
import shipmentService from '../../services/shipmentService';
import AdminShipmentCard from '../../components/admin/shipments/AdminShipmentCard';
import { ShipmentCardSkeleton } from '../../components/admin/shipments/ShipmentCardSkeleton';
import { ShipmentsEmptyState } from '../../components/admin/shipments/ShipmentsEmptyState';
import { ShipmentsLoadingState } from '../../components/admin/shipments/ShipmentsLoadingState';
import { ShipmentsErrorState } from '../../components/admin/shipments/ShipmentsErrorState';

const AdminShipmentsPage = () => {
  const [shipments, setShipments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [stats, setStats] = useState(null);
  const [selectedShipments, setSelectedShipments] = useState([]);
  const [bulkApproving, setBulkApproving] = useState(false);
  
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

  const handleApprove = async (shipmentId) => {
    if (!confirm('Approve and place this shipment with Delhivery?\n\nThis will:\n• Send to courier\n• Generate AWB and labels\n• Lock editing')) {
      return;
    }

    const result = await shipmentService.approveAndPlace(shipmentId);
    
    if (result.success) {
      alert('✅ Shipment approved and placed successfully!');
      loadShipments();
      loadStats();
    } else {
      alert(`❌ Failed:\n${result.error}`);
    }
  };

  const handleSchedulePickup = async (shipmentId) => {
    if (!confirm('Schedule pickup for tomorrow at 10:00 AM?')) return;
    
    const result = await shipmentService.schedulePickup(shipmentId);
    
    if (result.success) {
      alert('✅ Pickup scheduled for tomorrow');
      loadShipments();
      loadStats();
    } else {
      alert(`❌ Failed: ${result.error}`);
    }
  };

  const handleEditPickup = async (shipmentId) => {
    const newDate = prompt('Enter new pickup date (YYYY-MM-DD):');
    if (!newDate) return;
    
    // Validate date format
    if (!/^\d{4}-\d{2}-\d{2}$/.test(newDate)) {
      alert('Invalid date format. Use YYYY-MM-DD');
      return;
    }
    
    const result = await shipmentService.schedulePickup(shipmentId, newDate);
    
    if (result.success) {
      alert(`✅ Pickup rescheduled to ${newDate}`);
      loadShipments();
      loadStats();
    } else {
      alert(`❌ Failed: ${result.error}`);
    }
  };

  const handleBulkApprove = async () => {
    if (selectedShipments.length === 0) {
      alert('Please select at least one shipment.');
      return;
    }
    
    if (!confirm(`Approve ${selectedShipments.length} shipment(s)?\n\nThis cannot be undone.`)) {
      return;
    }

    setBulkApproving(true);
    
    const result = await shipmentService.bulkApprove(selectedShipments);
    
    setBulkApproving(false);
    
    if (result.success) {
      const successCount = result.data.success?.length || 0;
      const failedCount = result.data.failed?.length || 0;
      
      alert(`✅ Bulk Approval Complete!\n\nSuccess: ${successCount}\nFailed: ${failedCount}`);
      
      setSelectedShipments([]);
      loadShipments();
      loadStats();
    } else {
      alert(`❌ Bulk approval failed:\n${result.error}`);
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

  const hasActiveFilters = filters.status !== 'pending_review' || filters.search !== '';

  // ==================== RENDER ====================

  return (
    <div className="min-h-screen p-6">
      
      {/* Header */}
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Shipment Management</h1>
        <p className="text-gray-600">Review, edit, and approve shipments for delivery</p>
      </div>

      {/* Stats Cards */}
      {stats && (
        <div className="grid grid-cols-1 md:grid-cols-5 gap-4 mb-6">
          <StatCard
            icon={<Clock className="w-5 h-5" />}
            label="Pending Review"
            value={stats.pending_review || 0}
            color="yellow"
            active={filters.status === 'pending_review'}
            onClick={() => setFilters({ ...filters, status: 'pending_review', page: 1 })}
          />
          <StatCard
            icon={<CheckCircle className="w-5 h-5" />}
            label="Placed"
            value={stats.placed || 0}
            color="blue"
            active={filters.status === 'placed'}
            onClick={() => setFilters({ ...filters, status: 'placed', page: 1 })}
          />
          <StatCard
            icon={<Truck className="w-5 h-5" />}
            label="In Transit"
            value={stats.in_transit || 0}
            color="purple"
            active={filters.status === 'in_transit'}
            onClick={() => setFilters({ ...filters, status: 'in_transit', page: 1 })}
          />
          <StatCard
            icon={<Package className="w-5 h-5" />}
            label="Delivered"
            value={stats.delivered || 0}
            color="green"
            active={filters.status === 'delivered'}
            onClick={() => setFilters({ ...filters, status: 'delivered', page: 1 })}
          />
          <StatCard
            icon={<Plane className="w-5 h-5" />}
            label="Express Orders"
            value={shipments.filter(s => s.shipping_mode === 'Express').length}
            color="pink"
            active={false}
          />
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
              onClick={handleBulkApprove}
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
              onApprove={handleApprove}
              onSchedulePickup={handleSchedulePickup}
              onEditPickup={handleEditPickup} 
              onEdit={(id) => alert(`Edit shipment: ${id}`)}
              onViewDetails={(id) => alert(`View details: ${id}`)}
            />
          ))
        )}
      </div>
    </div>
  );
};

// ==================== STAT CARD COMPONENT ====================

const StatCard = ({ icon, label, value, color, active, onClick }) => {
  const colors = {
    yellow: 'bg-yellow-50 text-yellow-600 border-yellow-200 hover:bg-yellow-100',
    blue: 'bg-blue-50 text-blue-600 border-blue-200 hover:bg-blue-100',
    purple: 'bg-purple-50 text-purple-600 border-purple-200 hover:bg-purple-100',
    green: 'bg-green-50 text-green-600 border-green-200 hover:bg-green-100',
    pink: 'bg-pink-50 text-pink-600 border-pink-200 hover:bg-pink-100'
  };

  return (
    <div
      onClick={onClick}
      className={`${colors[color]} ${active ? 'ring-2 ring-offset-2 ring-tpppink' : ''} border-2 rounded-lg p-4 cursor-pointer hover:shadow-md transition`}
    >
      <div className="flex items-center gap-3">
        <div className="p-2 bg-white rounded-lg shadow-sm">{icon}</div>
        <div>
          <p className="text-2xl font-bold">{value}</p>
          <p className="text-sm font-medium opacity-75">{label}</p>
        </div>
      </div>
    </div>
  );
};

export default AdminShipmentsPage;