// frontend/src/components/admin/shipments/EditShipmentForm.jsx
import { useState, useEffect } from 'react';
import { User, Phone, MapPin, Package, Weight, Ruler, FileText, DollarSign } from 'lucide-react';

/**
 * Shipment Edit Form Component
 * Form fields for editing shipment details
 */
export default function EditShipmentForm({ 
  shipment, 
  editData, 
  onFieldChange, 
  errors = {},
  disabled = false 
}) {
  
  const [localData, setLocalData] = useState(editData || {});

  useEffect(() => {
    setLocalData(editData || {});
  }, [editData]);

  const handleChange = (field, value) => {
    setLocalData(prev => ({ ...prev, [field]: value }));
    onFieldChange(field, value);
  };

  // Parse address if it's JSON
  const getAddress = () => {
    const addr = shipment?.Orders?.shipping_address;
    if (!addr) return null;
    if (typeof addr === 'object') return addr;
    try {
      return JSON.parse(addr);
    } catch {
      return null;
    }
  };

  const address = getAddress();
  const customer = shipment?.Orders?.Users;

  return (
    <div className="space-y-6">
      
      {/* Customer Information Section */}
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
        <div className="flex items-center gap-2 mb-3">
          <User className="w-4 h-4 text-blue-600" />
          <h3 className="text-sm font-bold text-blue-900 uppercase tracking-wide">
            Customer Information
          </h3>
        </div>

        {/* Name */}
        <div className="mb-3">
          <label className="block text-xs font-semibold text-gray-700 mb-1">
            Customer Name
          </label>
          <input
            type="text"
            value={localData.name !== undefined ? localData.name : (customer?.name || '')}
            onChange={(e) => handleChange('name', e.target.value)}
            disabled={disabled}
            className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 ${
              errors.name ? 'border-red-500' : 'border-gray-300'
            } ${disabled ? 'bg-gray-100 cursor-not-allowed' : 'bg-white'}`}
            placeholder="Enter customer name"
          />
          {errors.name && (
            <p className="text-xs text-red-600 mt-1">{errors.name}</p>
          )}
        </div>

        {/* Phone */}
        <div className="mb-3">
          <label className="block text-xs font-semibold text-gray-700 mb-1">
            Phone Number
          </label>
          <div className="relative">
            <Phone className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input
              type="tel"
              value={localData.phone !== undefined ? localData.phone : (customer?.phone || '')}
              onChange={(e) => handleChange('phone', e.target.value)}
              disabled={disabled}
              className={`w-full pl-10 pr-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                errors.phone ? 'border-red-500' : 'border-gray-300'
              } ${disabled ? 'bg-gray-100 cursor-not-allowed' : 'bg-white'}`}
              placeholder="10-digit phone number"
              maxLength="10"
            />
          </div>
          {errors.phone && (
            <p className="text-xs text-red-600 mt-1">{errors.phone}</p>
          )}
        </div>

        {/* Address */}
        <div>
          <label className="block text-xs font-semibold text-gray-700 mb-1">
            Delivery Address
          </label>
          <div className="relative">
            <MapPin className="absolute left-3 top-3 w-4 h-4 text-gray-400" />
            <textarea
              value={localData.add !== undefined ? localData.add : (
                address ? `${address.line1}${address.line2 ? ', ' + address.line2 : ''}, ${address.city}, ${address.state} - ${address.zip_code}` : ''
              )}
              onChange={(e) => handleChange('add', e.target.value)}
              disabled={disabled}
              rows="3"
              className={`w-full pl-10 pr-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                errors.add ? 'border-red-500' : 'border-gray-300'
              } ${disabled ? 'bg-gray-100 cursor-not-allowed' : 'bg-white'}`}
              placeholder="Enter full delivery address"
            />
          </div>
          {errors.add && (
            <p className="text-xs text-red-600 mt-1">{errors.add}</p>
          )}
        </div>
      </div>

      {/* Package Details Section */}
      <div className="bg-purple-50 border border-purple-200 rounded-lg p-4">
        <div className="flex items-center gap-2 mb-3">
          <Package className="w-4 h-4 text-purple-600" />
          <h3 className="text-sm font-bold text-purple-900 uppercase tracking-wide">
            Package Details
          </h3>
        </div>

        {/* Weight */}
        <div className="mb-3">
          <label className="block text-xs font-semibold text-gray-700 mb-1">
            Weight (grams)
          </label>
          <div className="relative">
            <Weight className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input
              type="number"
              value={localData.weight !== undefined ? localData.weight : (shipment?.weight_grams || '')}
              onChange={(e) => handleChange('weight', e.target.value)}
              disabled={disabled}
              min="1"
              max="50000"
              className={`w-full pl-10 pr-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 ${
                errors.weight ? 'border-red-500' : 'border-gray-300'
              } ${disabled ? 'bg-gray-100 cursor-not-allowed' : 'bg-white'}`}
              placeholder="Enter weight in grams"
            />
          </div>
          <p className="text-xs text-gray-500 mt-1">
            Current: {shipment?.weight_grams || 0}g ({(shipment?.weight_grams / 1000 || 0).toFixed(2)}kg)
          </p>
          {errors.weight && (
            <p className="text-xs text-red-600 mt-1">{errors.weight}</p>
          )}
        </div>

        {/* Dimensions */}
        <div className="grid grid-cols-3 gap-2 mb-3">
          {/* Length */}
          <div>
            <label className="block text-xs font-semibold text-gray-700 mb-1">
              Length (cm)
            </label>
            <input
              type="number"
              value={localData.shipment_length !== undefined ? localData.shipment_length : (shipment?.dimensions_cm?.length || '')}
              onChange={(e) => handleChange('shipment_length', e.target.value)}
              disabled={disabled}
              min="1"
              max="200"
              className={`w-full px-2 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 text-sm ${
                errors.shipment_length ? 'border-red-500' : 'border-gray-300'
              } ${disabled ? 'bg-gray-100 cursor-not-allowed' : 'bg-white'}`}
              placeholder="L"
            />
          </div>

          {/* Width */}
          <div>
            <label className="block text-xs font-semibold text-gray-700 mb-1">
              Width (cm)
            </label>
            <input
              type="number"
              value={localData.shipment_width !== undefined ? localData.shipment_width : (shipment?.dimensions_cm?.width || '')}
              onChange={(e) => handleChange('shipment_width', e.target.value)}
              disabled={disabled}
              min="1"
              max="200"
              className={`w-full px-2 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 text-sm ${
                errors.shipment_width ? 'border-red-500' : 'border-gray-300'
              } ${disabled ? 'bg-gray-100 cursor-not-allowed' : 'bg-white'}`}
              placeholder="W"
            />
          </div>

          {/* Height */}
          <div>
            <label className="block text-xs font-semibold text-gray-700 mb-1">
              Height (cm)
            </label>
            <input
              type="number"
              value={localData.shipment_height !== undefined ? localData.shipment_height : (shipment?.dimensions_cm?.height || '')}
              onChange={(e) => handleChange('shipment_height', e.target.value)}
              disabled={disabled}
              min="1"
              max="200"
              className={`w-full px-2 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 text-sm ${
                errors.shipment_height ? 'border-red-500' : 'border-gray-300'
              } ${disabled ? 'bg-gray-100 cursor-not-allowed' : 'bg-white'}`}
              placeholder="H"
            />
          </div>
        </div>
        <p className="text-xs text-gray-500">
          Current: {shipment?.dimensions_cm?.length || 30} × {shipment?.dimensions_cm?.width || 25} × {shipment?.dimensions_cm?.height || 10} cm
        </p>

        {/* Product Description */}
        <div className="mt-3">
          <label className="block text-xs font-semibold text-gray-700 mb-1">
            Product Description
          </label>
          <div className="relative">
            <FileText className="absolute left-3 top-3 w-4 h-4 text-gray-400" />
            <textarea
              value={localData.products_desc !== undefined ? localData.products_desc : ''}
              onChange={(e) => handleChange('products_desc', e.target.value)}
              disabled={disabled}
              rows="2"
              className={`w-full pl-10 pr-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 ${
                errors.products_desc ? 'border-red-500' : 'border-gray-300'
              } ${disabled ? 'bg-gray-100 cursor-not-allowed' : 'bg-white'}`}
              placeholder="Brief description of contents"
            />
          </div>
          {errors.products_desc && (
            <p className="text-xs text-red-600 mt-1">{errors.products_desc}</p>
          )}
        </div>
      </div>

      {/* Admin Notes Section */}
      <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
        <div className="flex items-center gap-2 mb-3">
          <FileText className="w-4 h-4 text-gray-600" />
          <h3 className="text-sm font-bold text-gray-900 uppercase tracking-wide">
            Admin Notes (Optional)
          </h3>
        </div>

        <textarea
          value={localData.admin_notes !== undefined ? localData.admin_notes : ''}
          onChange={(e) => handleChange('admin_notes', e.target.value)}
          disabled={disabled}
          rows="2"
          className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-gray-500 ${
            disabled ? 'bg-gray-100 cursor-not-allowed' : 'bg-white'
          } border-gray-300`}
          placeholder="Add internal notes about this edit (not visible to customer)"
        />
        <p className="text-xs text-gray-500 mt-1">
          This note will be saved in the edit history for audit purposes
        </p>
      </div>

    </div>
  );
}