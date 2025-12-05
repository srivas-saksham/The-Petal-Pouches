import React, { useState, useEffect, useRef } from 'react';
import { Truck, MapPin, Calendar, ChevronDown, ChevronUp, Plus, Home, Briefcase, X, CheckCircle } from 'lucide-react';
import { useUserAuth } from '../../../context/UserAuthContext';
import { getAddresses, createAddress } from '../../../services/addressService';

/**
 * DeliverySection - Delivery info with address selection
 * Shows default address for logged-in users or PIN code input for guests
 */
const DeliverySection = () => {
  const { isAuthenticated, user } = useUserAuth();
  
  // Address state
  const [addresses, setAddresses] = useState([]);
  const [selectedAddress, setSelectedAddress] = useState(null);
  const [showAddressList, setShowAddressList] = useState(false);
  const [loading, setLoading] = useState(false);
  
  // New address modal state
  const [showNewAddressModal, setShowNewAddressModal] = useState(false);
  const [savingAddress, setSavingAddress] = useState(false);
  
  // PIN code state (for guests)
  const [pinCode, setPinCode] = useState('');
  const [pinChecked, setPinChecked] = useState(false);
  
  // Refs
  const addressListRef = useRef(null);
  const modalRef = useRef(null);
  
  // New address form data
  const [newAddressForm, setNewAddressForm] = useState({
    line1: '',
    line2: '',
    city: '',
    state: '',
    zip_code: '',
    phone: '',
    landmark: '',
    address_type: 'home',
  });

  // Calculate estimated delivery (5-7 days from now)
  const getDeliveryDate = () => {
    const today = new Date();
    const minDate = new Date(today);
    minDate.setDate(today.getDate() + 5);
    const maxDate = new Date(today);
    maxDate.setDate(today.getDate() + 7);

    const options = { month: 'short', day: 'numeric' };
    return `${minDate.toLocaleDateString('en-US', options)} - ${maxDate.toLocaleDateString('en-US', options)}`;
  };

  // Fetch addresses on mount if authenticated
  useEffect(() => {
    if (isAuthenticated) {
      fetchAddresses();
    }
  }, [isAuthenticated]);

  const fetchAddresses = async () => {
    setLoading(true);
    try {
      const result = await getAddresses();
      if (result.success && result.data) {
        setAddresses(result.data);
        // Auto-select default address
        const defaultAddr = result.data.find(a => a.is_default);
        if (defaultAddr) {
          setSelectedAddress(defaultAddr);
        } else if (result.data.length > 0) {
          setSelectedAddress(result.data[0]);
        }
      }
    } catch (error) {
      console.error('Failed to fetch addresses:', error);
    } finally {
      setLoading(false);
    }
  };

  // Handle address selection
  const handleAddressSelect = (address) => {
    setSelectedAddress(address);
    setShowAddressList(false);
  };

  // Handle PIN code check
  const handlePinCheck = () => {
    if (pinCode && pinCode.length === 6) {
      setPinChecked(true);
      // TODO: Verify PIN code with backend
      console.log('Checking delivery for PIN:', pinCode);
    } else {
      alert('Please enter a valid 6-digit PIN code');
    }
  };

  // Get address icon
  const getAddressIcon = (type) => {
    switch (type?.toLowerCase()) {
      case 'home':
        return <Home size={14} className="text-purple-600" />;
      case 'work':
        return <Briefcase size={14} className="text-blue-600" />;
      default:
        return <MapPin size={14} className="text-gray-600" />;
    }
  };

  // Get formatted address type
  const getAddressTypeName = (type) => {
    return type ? type.charAt(0).toUpperCase() + type.slice(1) : 'Address';
  };

  // Handle new address form submission
  const handleSaveNewAddress = async () => {
    // Validate required fields
    if (!newAddressForm.line1 || !newAddressForm.city || !newAddressForm.state || !newAddressForm.zip_code) {
      alert('Please fill in all required fields');
      return;
    }

    setSavingAddress(true);
    try {
      const result = await createAddress({
        ...newAddressForm,
        country: 'India',
      });

      if (result.success) {
        // Add new address to list
        setAddresses([...addresses, result.data]);
        setSelectedAddress(result.data);
        setShowNewAddressModal(false);
        // Reset form
        setNewAddressForm({
          line1: '',
          line2: '',
          city: '',
          state: '',
          zip_code: '',
          phone: '',
          landmark: '',
          address_type: 'home',
        });
      } else {
        alert(result.error || 'Failed to save address');
      }
    } catch (error) {
      console.error('Error saving address:', error);
      alert('Failed to save address');
    } finally {
      setSavingAddress(false);
    }
  };

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (addressListRef.current && !addressListRef.current.contains(event.target)) {
        setShowAddressList(false);
      }
    };

    if (showAddressList) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [showAddressList]);

  // Close modal when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (modalRef.current && !modalRef.current.contains(event.target)) {
        setShowNewAddressModal(false);
      }
    };

    if (showNewAddressModal) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [showNewAddressModal]);

  return (
    <div className="p-4 space-y-3 ">
      <h3 className="text-sm font-bold text-gray-800 uppercase tracking-wide flex items-center gap-1.5">
        <Truck size={14} className="text-pink-600" />
        Delivery
      </h3>

      {/* Estimated Delivery */}
      <div className="flex items-start gap-2 text-sm">
        <Calendar size={14} className="text-gray-400 mt-0.5 flex-shrink-0" />
        <div>
          <p className="text-xs text-gray-500 font-medium">Estimated Delivery</p>
          <p className="text-sm font-bold text-gray-800">{getDeliveryDate()}</p>
        </div>
      </div>

      {/* Address Selection (Authenticated) or PIN Code (Guest) */}
      {isAuthenticated ? (
        <div className="relative" ref={addressListRef}>
          {/* Selected Address Display */}
          {selectedAddress ? (
            <button
              onClick={() => setShowAddressList(!showAddressList)}
              className="w-full p-3 bg-white border-2 border-tpppink/20 rounded-lg text-left hover:border-tpppink transition-colors"
            >
              <div className="flex items-start justify-between">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    {getAddressIcon(selectedAddress.address_type)}
                    <span className="text-xs font-bold text-gray-800">
                      {getAddressTypeName(selectedAddress.address_type)}
                    </span>
                    {selectedAddress.is_default && (
                      <span className="text-xs bg-tpppink text-white px-1.5 py-0.5 rounded-full font-semibold">
                        Default
                      </span>
                    )}
                  </div>
                  <p className="text-xs text-gray-700 font-medium truncate">
                    {selectedAddress.line1}
                  </p>
                  <p className="text-xs text-gray-500">
                    {selectedAddress.city}, {selectedAddress.state} {selectedAddress.zip_code}
                  </p>
                </div>
                <div className="ml-2 flex-shrink-0">
                  {showAddressList ? (
                    <ChevronUp size={16} className="text-gray-600" />
                  ) : (
                    <ChevronDown size={16} className="text-gray-600" />
                  )}
                </div>
              </div>
            </button>
          ) : (
            <button
              onClick={() => setShowAddressList(!showAddressList)}
              className="w-full p-3 border-2 border-dashed border-gray-300 rounded-lg text-left hover:border-tpppink transition-colors"
            >
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600">Select delivery address</span>
                {showAddressList ? (
                  <ChevronUp size={16} className="text-gray-600" />
                ) : (
                  <ChevronDown size={16} className="text-gray-600" />
                )}
              </div>
            </button>
          )}

          {/* Floating Address List */}
          {showAddressList && (
            <div className="absolute top-full left-0 right-0 mt-2 bg-white border-2 border-gray-200 rounded-lg shadow-xl max-h-80 overflow-y-auto z-50">
              {/* New Address Button */}
              <button
                onClick={() => {
                  setShowNewAddressModal(true);
                  setShowAddressList(false);
                }}
                className="w-full p-3 bg-tpppink/10 border-b-2 border-gray-100 flex items-center gap-2 hover:bg-tpppink transition-colors text-tpppink hover:text-white font-semibold"
              >
                <Plus size={16} />
                <span className="text-sm">New Address</span>
              </button>

              {/* Address List */}
              {loading ? (
                <div className="p-4 text-center text-sm text-gray-500">
                  Loading addresses...
                </div>
              ) : addresses.length === 0 ? (
                <div className="p-4 text-center text-sm text-gray-500">
                  No saved addresses
                </div>
              ) : (
                addresses.map((addr) => (
                  <button
                    key={addr.id}
                    onClick={() => handleAddressSelect(addr)}
                    className={`w-full p-3 border-b last:border-b-0 text-left hover:bg-tppslate/20 transition-colors ${
                      selectedAddress?.id === addr.id ? 'bg-tppslate/10' : ''
                    }`}
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1">
                          {getAddressIcon(addr.address_type)}
                          <span className="text-xs font-semibold text-gray-800">
                            {getAddressTypeName(addr.address_type)}
                          </span>
                          {addr.is_default && (
                            <span className="text-xs bg-tpppink text-white px-1.5 py-0.5 rounded-full font-semibold">
                              Default
                            </span>
                          )}
                        </div>
                        <p className="text-xs text-gray-700 font-medium truncate">
                          {addr.line1}
                        </p>
                        <p className="text-xs text-gray-500">
                          {addr.city}, {addr.state} {addr.zip_code}
                        </p>
                      </div>
                      {selectedAddress?.id === addr.id && (
                        <CheckCircle size={16} className="text-tpppink flex-shrink-0 ml-2" />
                      )}
                    </div>
                  </button>
                ))
              )}
            </div>
          )}
        </div>
      ) : (
        /* PIN Code Input for Guests */
        <div className="space-y-2">
          <label className="text-xs font-semibold text-gray-700 flex items-center gap-1">
            <MapPin size={12} />
            Check Delivery Availability
          </label>
          <div className="flex gap-2">
            <input
              type="text"
              placeholder="Enter PIN Code"
              value={pinCode}
              onChange={(e) => {
                const value = e.target.value.replace(/\D/g, '');
                if (value.length <= 6) {
                  setPinCode(value);
                  setPinChecked(false);
                }
              }}
              maxLength={6}
              className="flex-1 px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-tpppink focus:border-transparent"
            />
            <button
              onClick={handlePinCheck}
              disabled={pinCode.length !== 6}
              className="px-4 py-2 bg-tpppink text-white rounded-lg font-medium hover:bg-tppslate transition-colors disabled:opacity-50 disabled:cursor-not-allowed text-sm"
            >
              Check
            </button>
          </div>
          {pinChecked && (
            <div className="flex items-start gap-2 p-2 bg-green-50 border border-green-200 rounded-lg">
              <CheckCircle size={14} className="text-green-600 mt-0.5 flex-shrink-0" />
              <p className="text-xs text-green-700">
                Delivery available for PIN {pinCode}
              </p>
            </div>
          )}
        </div>
      )}

      {/* Free Shipping Badge */}
      <div className="bg-green-50 border border-green-200 rounded-lg p-2.5 flex items-center gap-2">
        <Truck size={16} className="text-green-600 flex-shrink-0" />
        <div>
          <p className="text-xs font-bold text-green-700">FREE SHIPPING</p>
          <p className="text-xs text-green-600">On all orders</p>
        </div>
      </div>

      {/* Location Info */}
      <div className="flex items-start gap-2 text-xs text-gray-500">
        <MapPin size={12} className="mt-0.5 flex-shrink-0" />
        <p>Ships to all locations in India</p>
      </div>

      {/* New Address Modal */}
      {showNewAddressModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div ref={modalRef} className="bg-white rounded-lg shadow-2xl max-w-md w-full max-h-[90vh] overflow-y-auto">
            {/* Modal Header */}
            <div className="sticky top-0 bg-tpppink px-6 py-4 flex items-center justify-between">
              <h3 className="text-lg font-bold text-white flex items-center gap-2">
                <Plus size={20} />
                Add New Address
              </h3>
              <button
                onClick={() => setShowNewAddressModal(false)}
                className="text-white hover:bg-white hover:bg-opacity-20 rounded-full p-1 transition-colors"
              >
                <X size={20} />
              </button>
            </div>

            {/* Modal Body */}
            <div className="p-6 space-y-4">
              {/* Address Type */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Address Type
                </label>
                <select
                  value={newAddressForm.address_type}
                  onChange={(e) => setNewAddressForm({ ...newAddressForm, address_type: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-tpppink focus:border-transparent"
                >
                  <option value="home">Home</option>
                  <option value="work">Work</option>
                  <option value="other">Other</option>
                </select>
              </div>

              {/* Address Line 1 */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Street Address *
                </label>
                <input
                  type="text"
                  placeholder="House No., Building Name"
                  value={newAddressForm.line1}
                  onChange={(e) => setNewAddressForm({ ...newAddressForm, line1: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-tpppink focus:border-transparent"
                />
              </div>

              {/* Address Line 2 */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Apartment, Suite, etc. (optional)
                </label>
                <input
                  type="text"
                  placeholder="Apartment, floor, etc."
                  value={newAddressForm.line2}
                  onChange={(e) => setNewAddressForm({ ...newAddressForm, line2: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-tpppink focus:border-transparent"
                />
              </div>

              {/* City & State */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    City *
                  </label>
                  <input
                    type="text"
                    placeholder="City"
                    value={newAddressForm.city}
                    onChange={(e) => setNewAddressForm({ ...newAddressForm, city: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-tpppink  focus:border-transparent"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    State *
                  </label>
                  <input
                    type="text"
                    placeholder="State"
                    value={newAddressForm.state}
                    onChange={(e) => setNewAddressForm({ ...newAddressForm, state: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-tpppink  focus:border-transparent"
                  />
                </div>
              </div>

              {/* PIN Code */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  PIN Code *
                </label>
                <input
                  type="text"
                  placeholder="6-digit PIN code"
                  value={newAddressForm.zip_code}
                  onChange={(e) => {
                    const value = e.target.value.replace(/\D/g, '');
                    if (value.length <= 6) {
                      setNewAddressForm({ ...newAddressForm, zip_code: value });
                    }
                  }}
                  maxLength={6}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-tpppink  focus:border-transparent"
                />
              </div>

              {/* Phone */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Phone Number (optional)
                </label>
                <input
                  type="tel"
                  placeholder="10-digit phone number"
                  value={newAddressForm.phone}
                  onChange={(e) => {
                    const value = e.target.value.replace(/\D/g, '');
                    if (value.length <= 10) {
                      setNewAddressForm({ ...newAddressForm, phone: value });
                    }
                  }}
                  maxLength={10}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-tpppink  focus:border-transparent"
                />
              </div>

              {/* Landmark */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Landmark (optional)
                </label>
                <input
                  type="text"
                  placeholder="e.g., Near City Hospital"
                  value={newAddressForm.landmark}
                  onChange={(e) => setNewAddressForm({ ...newAddressForm, landmark: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-tpppink  focus:border-transparent"
                />
              </div>
            </div>

            {/* Modal Footer */}
            <div className="px-6 py-4 bg-gray-50 border-t flex gap-3">
              <button
                onClick={() => setShowNewAddressModal(false)}
                className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg font-medium hover:bg-gray-300 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleSaveNewAddress}
                disabled={savingAddress}
                className="flex-1 px-4 py-2 bg-tpppink text-white rounded-lg font-medium hover:bg-tpppink/90 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {savingAddress ? 'Saving...' : 'Save Address'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default DeliverySection;