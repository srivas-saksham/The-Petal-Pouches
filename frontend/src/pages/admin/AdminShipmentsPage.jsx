import { useState, useEffect } from 'react';
import { 
  Package, Truck, Clock, CheckCircle, XCircle, Edit, 
  Search, RefreshCw, AlertCircle, Filter
} from 'lucide-react';
import shipmentService from '../../services/shipmentService';

const AdminShipmentsPage = () => {
  const [shipments, setShipments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState(null);
  const [selectedShipments, setSelectedShipments] = useState([]);
  const [filters, setFilters] = useState({
    status: 'pending_review',
    page: 1,
    limit: 20,
    search: ''
  });

  useEffect(() => {
    loadShipments();
    loadStats();
  }, [filters]);

  const loadShipments = async () => {
    setLoading(true);
    const result = await shipmentService.getAllShipments(filters);
    if (result.success) {
      setShipments(result.data);
    }
    setLoading(false);
  };

  const loadStats = async () => {
    const result = await shipmentService.getShipmentStats();
    if (result.success) {
      setStats(result.data);
    }
  };

  const handleApprove = async (shipmentId) => {
    if (!confirm('Approve and place this shipment with Delhivery?')) return;

    const result = await shipmentService.approveAndPlace(shipmentId);
    if (result.success) {
      alert('✅ ' + result.message);
      loadShipments();
      loadStats();
    } else {
      alert('❌ ' + result.error);
    }
  };

  const handleBulkApprove = async () => {
    if (selectedShipments.length === 0) return;
    
    if (!confirm(`Approve ${selectedShipments.length} shipments?`)) return;

    const result = await shipmentService.bulkApprove(selectedShipments);
    if (result.success) {
      alert('✅ ' + result.message);
      setSelectedShipments([]);
      loadShipments();
      loadStats();
    } else {
      alert('❌ ' + result.error);
    }
  };

  const toggleSelect = (id) => {
    setSelectedShipments(prev =>
      prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id]
    );
  };

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      
      {/* Header */}
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Shipment Management</h1>
        <p className="text-gray-600">Review, edit, and approve shipments</p>
      </div>

      {/* Stats */}
      {stats && (
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
          <StatCard
            icon={<Clock className="w-5 h-5" />}
            label="Pending Review"
            value={stats.pending_review || 0}
            color="yellow"
            onClick={() => setFilters({ ...filters, status: 'pending_review' })}
          />
          <StatCard
            icon={<CheckCircle className="w-5 h-5" />}
            label="Placed"
            value={stats.placed || 0}
            color="blue"
            onClick={() => setFilters({ ...filters, status: 'placed' })}
          />
          <StatCard
            icon={<Truck className="w-5 h-5" />}
            label="In Transit"
            value={stats.in_transit || 0}
            color="purple"
            onClick={() => setFilters({ ...filters, status: 'in_transit' })}
          />
          <StatCard
            icon={<Package className="w-5 h-5" />}
            label="Delivered"
            value={stats.delivered || 0}
            color="green"
            onClick={() => setFilters({ ...filters, status: 'delivered' })}
          />
        </div>
      )}

      {/* Filters */}
      <div className="bg-white rounded-lg shadow-sm p-4 mb-6">
        <div className="flex flex-wrap items-center gap-4">
          <div className="flex-1 min-w-[200px]">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
              <input
                type="text"
                placeholder="Search orders, AWB..."
                className="w-full pl-10 pr-4 py-2 border rounded-lg"
                value={filters.search}
                onChange={(e) => setFilters({ ...filters, search: e.target.value })}
              />
            </div>
          </div>

          <select
            className="px-4 py-2 border rounded-lg"
            value={filters.status}
            onChange={(e) => setFilters({ ...filters, status: e.target.value })}
          >
            <option value="">All Statuses</option>
            <option value="pending_review">Pending Review</option>
            <option value="approved">Approved</option>
            <option value="placed">Placed</option>
            <option value="in_transit">In Transit</option>
            <option value="delivered">Delivered</option>
          </select>

          {selectedShipments.length > 0 && (
            <button
              onClick={handleBulkApprove}
              className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 flex items-center gap-2"
            >
              <CheckCircle className="w-4 h-4" />
              Bulk Approve ({selectedShipments.length})
            </button>
          )}

          <button
            onClick={loadShipments}
            className="px-4 py-2 border rounded-lg hover:bg-gray-50 flex items-center gap-2"
          >
            <RefreshCw className="w-4 h-4" />
            Refresh
          </button>
        </div>
      </div>

      {/* Shipments List */}
      <div className="space-y-4">
        {loading ? (
          <div className="text-center py-12">
            <div className="animate-spin w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full mx-auto"></div>
            <p className="mt-4 text-gray-600">Loading shipments...</p>
          </div>
        ) : shipments.length === 0 ? (
          <div className="bg-white rounded-lg p-12 text-center">
            <Package className="w-16 h-16 text-gray-300 mx-auto mb-4" />
            <p className="text-gray-600">No shipments found</p>
          </div>
        ) : (
          shipments.map(shipment => (
            <ShipmentCard
              key={shipment.id}
              shipment={shipment}
              selected={selectedShipments.includes(shipment.id)}
              onToggleSelect={() => toggleSelect(shipment.id)}
              onApprove={() => handleApprove(shipment.id)}
            />
          ))
        )}
      </div>
    </div>
  );
};

const StatCard = ({ icon, label, value, color, onClick }) => {
  const colors = {
    yellow: 'bg-yellow-50 text-yellow-600 border-yellow-200',
    blue: 'bg-blue-50 text-blue-600 border-blue-200',
    purple: 'bg-purple-50 text-purple-600 border-purple-200',
    green: 'bg-green-50 text-green-600 border-green-200'
  };

  return (
    <div
      onClick={onClick}
      className={`${colors[color]} border-2 rounded-lg p-4 cursor-pointer hover:shadow-md transition`}
    >
      <div className="flex items-center gap-3">
        <div className="p-2 bg-white rounded-lg">{icon}</div>
        <div>
          <p className="text-2xl font-bold">{value}</p>
          <p className="text-sm font-medium opacity-75">{label}</p>
        </div>
      </div>
    </div>
  );
};

const ShipmentCard = ({ shipment, selected, onToggleSelect, onApprove }) => {
  const statusColors = {
    pending_review: 'bg-yellow-100 text-yellow-800',
    approved: 'bg-blue-100 text-blue-800',
    placed: 'bg-green-100 text-green-800',
    in_transit: 'bg-purple-100 text-purple-800',
    delivered: 'bg-gray-100 text-gray-800'
  };

  return (
    <div className="bg-white rounded-lg shadow-sm p-6 border-2 border-gray-100 hover:border-blue-200 transition">
      <div className="flex items-start gap-4">
        {shipment.status === 'pending_review' && (
          <input
            type="checkbox"
            checked={selected}
            onChange={onToggleSelect}
            className="mt-1 w-5 h-5 text-blue-600 rounded"
          />
        )}

        <div className="flex-1">
          <div className="flex items-center justify-between mb-3">
            <div>
              <h3 className="text-lg font-semibold text-gray-900">
                Order ID: {shipment.order_id?.slice(0, 8)}...
              </h3>
              <p className="text-sm text-gray-500">
                {shipment.Orders?.Users?.name} • {shipment.Orders?.Users?.email}
              </p>
            </div>
            <span className={`px-3 py-1 rounded-full text-xs font-medium ${statusColors[shipment.status]}`}>
              {shipment.status.replace('_', ' ').toUpperCase()}
            </span>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
            <div>
              <p className="text-xs text-gray-500">Destination</p>
              <p className="font-medium">{shipment.destination_city}, {shipment.destination_state}</p>
              <p className="text-sm text-gray-600">{shipment.destination_pincode}</p>
            </div>
            <div>
              <p className="text-xs text-gray-500">Weight</p>
              <p className="font-medium">{shipment.weight_grams}g</p>
            </div>
            <div>
              <p className="text-xs text-gray-500">Mode</p>
              <p className="font-medium">{shipment.shipping_mode}</p>
            </div>
            <div>
              <p className="text-xs text-gray-500">Estimated Cost</p>
              <p className="font-medium text-green-600">₹{shipment.estimated_cost}</p>
            </div>
          </div>

          {shipment.awb && (
            <div className="mb-4 p-3 bg-blue-50 rounded-lg">
              <p className="text-xs text-blue-600 mb-1">Tracking Number</p>
              <p className="font-mono font-bold text-blue-900">{shipment.awb}</p>
            </div>
          )}

          {shipment.status === 'pending_review' && (
            <div className="flex gap-2">
              <button
                onClick={onApprove}
                className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 flex items-center gap-2"
              >
                <CheckCircle className="w-4 h-4" />
                Approve & Place
              </button>
              <button className="px-4 py-2 border rounded-lg hover:bg-gray-50 flex items-center gap-2">
                <Edit className="w-4 h-4" />
                Edit Details
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default AdminShipmentsPage;