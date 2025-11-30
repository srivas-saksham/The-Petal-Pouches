// frontend/src/components/checkout/CheckoutForm.jsx

import React, { useState, useEffect } from 'react';
import { Plus, ChevronDown, ChevronUp, MapPin, Home, Briefcase, CheckCircle } from 'lucide-react';
import { getAddresses, createAddress } from '../../services/addressService';

/**
 * CheckoutForm Component - ENHANCED
 * Manages address selection and creation for shipping
 * ✨ Shows default address prominently
 * ✨ Enhanced UI with address type icons
 * ✨ Better visual hierarchy
 */
const CheckoutForm = ({ onAddressSelect, onNext }) => {
  const [addresses, setAddresses] = useState([]);
  const [selectedAddress, setSelectedAddress] = useState(null);
  const [showForm, setShowForm] = useState(false);
  const [loading, setLoading] = useState(true);
  const [formData, setFormData] = useState({
    line1: '',
    line2: '',
    city: '',
    state: '',
    zip_code: '',
    phone: '',
    landmark: '',
    address_type: 'home',
  });

  // Fetch existing addresses
  useEffect(() => {
    fetchAddresses();
  }, []);

  const fetchAddresses = async () => {
    try {
      const result = await getAddresses();
      if (result.success) {
        setAddresses(result.data);
        // ⭐ Auto-select default address if it exists
        const defaultAddr = result.data.find(a => a.is_default);
        if (defaultAddr) {
          setSelectedAddress(defaultAddr);
          onAddressSelect(defaultAddr);
          console.log('✅ Default address selected:', defaultAddr);
        }
      }
    } catch (error) {
      console.error('Failed to fetch addresses:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleAddAddress = async () => {
    try {
      const result = await createAddress(formData);
      if (result.success) {
        setAddresses([...addresses, result.data]);
        setSelectedAddress(result.data);
        onAddressSelect(result.data);
        setShowForm(false);
        setFormData({
          line1: '',
          line2: '',
          city: '',
          state: '',
          zip_code: '',
          phone: '',
          landmark: '',
          address_type: 'home',
        });
      }
    } catch (error) {
      console.error('Failed to add address:', error);
      alert('Failed to save address');
    }
  };

  // ⭐ Get icon based on address type
  const getAddressIcon = (type) => {
    switch (type?.toLowerCase()) {
      case 'home':
        return <Home size={18} />;
      case 'work':
        return <Briefcase size={18} />;
      default:
        return <MapPin size={18} />;
    }
  };

  // ⭐ Get formatted address type name
  const getAddressTypeName = (type) => {
    return type ? type.charAt(0).toUpperCase() + type.slice(1) : 'Address';
  };

  // ⭐ Separate default and other addresses
  const defaultAddress = addresses.find(a => a.is_default);
  const otherAddresses = addresses.filter(a => !a.is_default);

  return (
    <div className="bg-white rounded-lg shadow overflow-hidden">
      <div className="px-6 py-4 bg-gradient-to-r from-purple-600 to-purple-700">
        <h2 className="text-xl font-bold text-white flex items-center gap-2">
          <MapPin size={24} />
          Shipping Address
        </h2>
      </div>

      <div className="p-6 space-y-6">
        {/* ⭐ DEFAULT ADDRESS - PROMINENT DISPLAY */}
        {defaultAddress && (
          <div className="space-y-3">
            <h3 className="text-sm font-semibold text-gray-700 uppercase tracking-wide">
              Default Address
            </h3>
            
            <div
              onClick={() => {
                setSelectedAddress(defaultAddress);
                onAddressSelect(defaultAddress);
              }}
              className={`p-4 border-2 rounded-lg cursor-pointer transition-all group ${
                selectedAddress?.id === defaultAddress.id
                  ? 'border-purple-600 bg-purple-50 shadow-md'
                  : 'border-gray-300 hover:border-purple-400 hover:bg-purple-50/50'
              }`}
            >
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  {/* Address Type as Main Title */}
                  <div className="flex items-center gap-2 mb-1">
                    <div className="text-purple-600 group-hover:scale-110 transition-transform">
                      {getAddressIcon(defaultAddress.address_type)}
                    </div>
                    <h4 className="font-bold text-gray-900 text-base">
                      {getAddressTypeName(defaultAddress.address_type)}
                    </h4>
                    {defaultAddress.is_default && (
                      <CheckCircle size={16} className="text-green-600 flex-shrink-0" />
                    )}
                  </div>

                  {/* Line1 as Subtext */}
                  <p className="text-sm text-gray-600 mb-1 font-medium">
                    {defaultAddress.line1}
                  </p>

                  {/* Full Address Info */}
                  <p className="text-sm text-gray-600">
                    {defaultAddress.line2 && <span>{defaultAddress.line2}, </span>}
                    {defaultAddress.city}, {defaultAddress.state} {defaultAddress.zip_code}
                  </p>

                  {/* Landmark if exists */}
                  {defaultAddress.landmark && (
                    <p className="text-xs text-gray-500 mt-1">
                      📍 Near: {defaultAddress.landmark}
                    </p>
                  )}

                  {/* Phone if exists */}
                  {defaultAddress.phone && (
                    <p className="text-xs text-gray-500 mt-1">
                      📞 {defaultAddress.phone}
                    </p>
                  )}
                </div>

                {/* Selection Indicator */}
                {selectedAddress?.id === defaultAddress.id && (
                  <div className="ml-4 flex-shrink-0">
                    <div className="w-6 h-6 rounded-full border-2 border-purple-600 bg-purple-600 flex items-center justify-center">
                      <svg className="w-4 h-4 text-white" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                      </svg>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        {/* ⭐ OTHER ADDRESSES */}
        {otherAddresses.length > 0 && (
          <div className="space-y-3">
            <h3 className="text-sm font-semibold text-gray-700 uppercase tracking-wide">
              Other Addresses ({otherAddresses.length})
            </h3>

            <div className="space-y-2">
              {otherAddresses.map((address) => (
                <div
                  key={address.id}
                  onClick={() => {
                    setSelectedAddress(address);
                    onAddressSelect(address);
                  }}
                  className={`p-4 border-2 rounded-lg cursor-pointer transition-all group ${
                    selectedAddress?.id === address.id
                      ? 'border-purple-600 bg-purple-50'
                      : 'border-gray-200 hover:border-purple-300'
                  }`}
                >
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      {/* Address Type as Main Title */}
                      <div className="flex items-center gap-2 mb-1">
                        <div className="text-gray-600 group-hover:text-purple-600 transition-colors">
                          {getAddressIcon(address.address_type)}
                        </div>
                        <h4 className="font-semibold text-gray-900">
                          {getAddressTypeName(address.address_type)}
                        </h4>
                      </div>

                      {/* Line1 as Subtext */}
                      <p className="text-sm text-gray-600 font-medium">
                        {address.line1}
                      </p>

                      {/* Compact Address Info */}
                      <p className="text-xs text-gray-500">
                        {address.city}, {address.state} {address.zip_code}
                      </p>
                    </div>

                    {/* Selection Indicator */}
                    {selectedAddress?.id === address.id && (
                      <div className="ml-4 flex-shrink-0">
                        <div className="w-5 h-5 rounded-full border-2 border-purple-600 bg-purple-600 flex items-center justify-center">
                          <svg className="w-3 h-3 text-white" fill="currentColor" viewBox="0 0 20 20">
                            <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                          </svg>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Empty State */}
        {addresses.length === 0 && (
          <div className="text-center py-8">
            <MapPin size={40} className="mx-auto text-gray-300 mb-3" />
            <p className="text-gray-600 font-medium">No saved addresses</p>
            <p className="text-sm text-gray-500">Add an address to get started</p>
          </div>
        )}

        {/* ⭐ ADD NEW ADDRESS BUTTON */}
        <div className="pt-4 border-t">
          <button
            onClick={() => setShowForm(!showForm)}
            className="w-full flex items-center justify-between px-4 py-3 border-2 border-dashed border-purple-300 rounded-lg text-purple-600 hover:bg-purple-50 hover:border-purple-400 transition-all font-medium"
          >
            <div className="flex items-center gap-2">
              <Plus size={18} />
              Add New Address
            </div>
            {showForm ? <ChevronUp size={18} /> : <ChevronDown size={18} />}
          </button>

          {/* ⭐ ADD ADDRESS FORM */}
          {showForm && (
            <div className="mt-6 p-4 bg-gray-50 rounded-lg space-y-4 border border-gray-200">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Address Type
                </label>
                <select
                  value={formData.address_type}
                  onChange={(e) => setFormData({ ...formData, address_type: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                >
                  <option value="home">Home</option>
                  <option value="work">Work</option>
                  <option value="other">Other</option>
                </select>
              </div>

              <input
                type="text"
                placeholder="Street Address *"
                value={formData.line1}
                onChange={(e) => setFormData({ ...formData, line1: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                required
              />

              <input
                type="text"
                placeholder="Apartment, suite, etc. (optional)"
                value={formData.line2}
                onChange={(e) => setFormData({ ...formData, line2: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
              />

              <div className="grid grid-cols-2 gap-3">
                <input
                  type="text"
                  placeholder="City *"
                  value={formData.city}
                  onChange={(e) => setFormData({ ...formData, city: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                  required
                />

                <input
                  type="text"
                  placeholder="State *"
                  value={formData.state}
                  onChange={(e) => setFormData({ ...formData, state: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                  required
                />
              </div>

              <input
                type="text"
                placeholder="PIN Code *"
                value={formData.zip_code}
                onChange={(e) => setFormData({ ...formData, zip_code: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                required
              />

              <input
                type="tel"
                placeholder="Phone Number (optional)"
                value={formData.phone}
                onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
              />

              <input
                type="text"
                placeholder="Landmark (optional)"
                value={formData.landmark}
                onChange={(e) => setFormData({ ...formData, landmark: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
              />

              <div className="flex gap-3 pt-2">
                <button
                  onClick={handleAddAddress}
                  className="flex-1 px-4 py-2 bg-purple-600 text-white rounded-lg font-medium hover:bg-purple-700 transition-colors"
                >
                  Save Address
                </button>
                <button
                  onClick={() => setShowForm(false)}
                  className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg font-medium hover:bg-gray-100 transition-colors"
                >
                  Cancel
                </button>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* ⭐ CONTINUE BUTTON */}
      <div className="px-6 py-4 bg-gray-50 border-t">
        <button
          onClick={onNext}
          disabled={!selectedAddress}
          className="w-full px-4 py-3 bg-purple-600 text-white rounded-lg font-semibold hover:bg-purple-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
        >
          <CheckCircle size={20} />
          Continue with Selected Address
        </button>
      </div>
    </div>
  );
};

export default CheckoutForm;