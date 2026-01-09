import { useState, useEffect } from 'react';
import { X, Package, Calendar, MapPin, CheckCircle, Loader } from 'lucide-react';
import shipmentService from '../../../services/shipmentService';

export default function BulkPickupModal({ isOpen, onClose, onSuccess }) {
  const [eligibleShipments, setEligibleShipments] = useState([]);
  const [selectedIds, setSelectedIds] = useState([]);
  const [pickupDate, setPickupDate] = useState('');
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (isOpen) {
      loadEligibleShipments();
      setPickupDate(getTomorrowDate());
    }
  }, [isOpen]);

  const getTomorrowDate = () => {
    const d = new Date();
    d.setDate(d.getDate() + 1);
    return d.toISOString().split('T')[0];
  };

  const loadEligibleShipments = async () => {
    setLoading(true);
    try {
      const result = await shipmentService.getEligibleForPickup();
      if (result.success) {
        setEligibleShipments(result.data);
      } else {
        setError(result.error);
      }
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const toggleSelect = (id) => {
    setSelectedIds(prev => 
      prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id]
    );
  };

  const selectAll = () => {
    setSelectedIds(eligibleShipments.map(s => s.id));
  };

  const handleSubmit = async () => {
    if (selectedIds.length === 0) {
      setError('Select at least one shipment');
      return;
    }

    setSubmitting(true);
    const result = await shipmentService.createBulkPickup({
      shipment_ids: selectedIds,
      pickup_date: pickupDate
    });

    setSubmitting(false);

    if (result.success) {
      onSuccess(result);
      onClose();
    } else {
      setError(result.error);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl shadow-2xl w-full max-w-3xl max-h-[90vh] overflow-hidden">
        
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b">
          <div className="flex items-center gap-3">
            <div className="bg-purple-100 p-2 rounded-lg">
              <Package className="w-5 h-5 text-purple-600" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-gray-900">Schedule Bulk Pickup</h2>
              <p className="text-sm text-gray-600">Select shipments to add to pickup request</p>
            </div>
          </div>
          <button onClick={onClose} className="p-2 hover:bg-gray-100 rounded-lg">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Pickup Date */}
        <div className="p-6 border-b bg-gray-50">
          <div className="flex items-center gap-4">
            <Calendar className="w-5 h-5 text-gray-600" />
            <div className="flex-1">
              <label className="block text-sm font-bold text-gray-700 mb-1">
                Pickup Date
              </label>
              <input
                type="date"
                value={pickupDate}
                onChange={(e) => setPickupDate(e.target.value)}
                min={getTomorrowDate()}
                className="px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
              />
            </div>
          </div>
        </div>

        {/* Shipments List */}
        <div className="p-6 max-h-[400px] overflow-y-auto">
          {loading ? (
            <div className="text-center py-12">
              <Loader className="w-8 h-8 text-purple-600 animate-spin mx-auto mb-3" />
              <p className="text-gray-600">Loading eligible shipments...</p>
            </div>
          ) : eligibleShipments.length === 0 ? (
            <div className="text-center py-12">
              <Package className="w-12 h-12 text-gray-300 mx-auto mb-3" />
              <p className="text-gray-600 font-medium">No eligible shipments</p>
              <p className="text-sm text-gray-500 mt-1">
                Shipments must be in "placed" status with AWB
              </p>
            </div>
          ) : (
            <>
              <div className="flex items-center justify-between mb-4">
                <p className="text-sm text-gray-600">
                  {selectedIds.length} of {eligibleShipments.length} selected
                </p>
                <button
                  onClick={selectAll}
                  className="text-sm text-purple-600 hover:text-purple-700 font-semibold"
                >
                  Select All
                </button>
              </div>

              <div className="space-y-2">
                {eligibleShipments.map(shipment => (
                  <label
                    key={shipment.id}
                    className="flex items-center gap-3 p-3 border border-gray-200 rounded-lg hover:bg-gray-50 cursor-pointer"
                  >
                    <input
                      type="checkbox"
                      checked={selectedIds.includes(shipment.id)}
                      onChange={() => toggleSelect(shipment.id)}
                      className="w-4 h-4 text-purple-600 rounded"
                    />
                    <div className="flex-1">
                      <div className="flex items-center gap-2">
                        <span className="font-mono text-sm font-bold text-gray-900">
                          {shipment.awb}
                        </span>
                        <span className="text-xs text-gray-500">
                          ({shipment.weight_grams}g)
                        </span>
                      </div>
                      <div className="text-xs text-gray-600 mt-0.5">
                        {shipment.Orders?.Users?.name} • {shipment.destination_city}
                      </div>
                    </div>
                    <CheckCircle className={`w-5 h-5 ${
                      selectedIds.includes(shipment.id) 
                        ? 'text-purple-600' 
                        : 'text-gray-300'
                    }`} />
                  </label>
                ))}
              </div>
            </>
          )}

          {error && (
            <div className="mt-4 p-3 bg-red-50 border border-red-200 rounded-lg text-sm text-red-700">
              {error}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between p-6 border-t bg-gray-50">
          <p className="text-sm text-gray-600">
            {selectedIds.length} shipment{selectedIds.length !== 1 ? 's' : ''} will be added to pickup
          </p>
          <div className="flex gap-3">
            <button
              onClick={onClose}
              disabled={submitting}
              className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 font-semibold text-gray-700"
            >
              Cancel
            </button>
            <button
              onClick={handleSubmit}
              disabled={submitting || selectedIds.length === 0}
              className="px-6 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 font-semibold disabled:opacity-50 flex items-center gap-2"
            >
              {submitting ? (
                <>
                  <Loader className="w-4 h-4 animate-spin" />
                  Scheduling...
                </>
              ) : (
                <>
                  <Package className="w-4 h-4" />
                  Schedule Pickup
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}