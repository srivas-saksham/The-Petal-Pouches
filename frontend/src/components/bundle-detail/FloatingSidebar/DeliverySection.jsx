import React, { useState, useEffect, useRef } from 'react';
import { Truck, MapPin, Calendar, ChevronDown, ChevronUp, Plus, Home, Briefcase, X, CheckCircle, Loader, AlertCircle, Package, Plane } from 'lucide-react';
import { useUserAuth } from '../../../context/UserAuthContext';
import { getAddresses, createAddress } from '../../../services/addressService';
import api from '../../../services/api';
// ✅ NEW IMPORT
import { saveDeliveryData, getDeliveryData, getStoredAddressId, getStoredPinCode } from '../../../utils/deliveryStorage';

/**
 * DeliverySection - Delivery info with Delhivery PIN check and TAT
 * Shows default address for logged-in users or PIN code input for guests
 * Integrates with Delhivery API for serviceability and delivery estimates
 * ✅ NOW WITH: localStorage persistence for seamless checkout flow
 */
const DeliverySection = ({ bundleWeight = 1000, isRecalculating = false }) => {
  const { isAuthenticated, user } = useUserAuth();
  
  // Address state
  const [addresses, setAddresses] = useState([]);
  const [selectedAddress, setSelectedAddress] = useState(null);
  const [showAddressList, setShowAddressList] = useState(false);
  const [loading, setLoading] = useState(false);
  
  // New address modal state
  const [showNewAddressModal, setShowNewAddressModal] = useState(false);
  const [savingAddress, setSavingAddress] = useState(false);
  
  // PIN code state (for guests and checking)
  const [pinCode, setPinCode] = useState('');
  const [checkingPin, setCheckingPin] = useState(false);
  const [pinCheckResult, setPinCheckResult] = useState(null);
  const [pinError, setPinError] = useState(null);

  const [lastCheckedWeight, setLastCheckedWeight] = useState(null);
  
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

  // ==================== ✅ NEW: LOAD FROM LOCALSTORAGE ON MOUNT ====================
  
  useEffect(() => {
    const loadStoredData = () => {
      const storedData = getDeliveryData();
      if (!storedData) return;

      console.log('📦 [DeliverySection] Loading stored delivery data:', storedData);

      // For guests: restore PIN code
      if (!isAuthenticated && storedData.guestPinCode) {
        setPinCode(storedData.guestPinCode);
        console.log('👤 [Guest] Restored PIN:', storedData.guestPinCode);
      }

      // Restore delivery check result
      if (storedData.deliveryCheck) {
        setPinCheckResult(storedData.deliveryCheck);
        console.log('✅ [DeliverySection] Restored delivery check result');
      }
    };

    loadStoredData();
  }, [isAuthenticated]);

  // ==================== DELHIVERY PIN CHECK ====================
  
  /**
   * Check PIN serviceability and TAT with Delhivery API
   * ✅ NOW SAVES: Result to localStorage
   */
  const checkPinDelivery = async (pin) => {
    if (!pin || pin.length !== 6) {
      setPinError('Please enter a valid 6-digit PIN code');
      return;
    }

    setCheckingPin(true);
    setPinError(null);
    setPinCheckResult(null);

    try {
      console.log('🔍 Checking Delhivery serviceability for PIN:', pin);
      console.log(`📦 Using weight: ${bundleWeight}g (${bundleWeight/1000}kg)`); // ✅ CHANGED
      
      // Call combined delivery check endpoint
      const response = await api.get(`/api/delhivery/check/${pin}`, {
        params: {
          weight: bundleWeight // ✅ CHANGED - Use dynamic weight
        }
      });
      
      console.log('📦 Delhivery response:', response.data);

      if (response.data.success) {
        const data = response.data;
        
        console.log('✅ Full Delhivery response:', JSON.stringify(data, null, 2));
        
        if (data.serviceable) {
          // PIN is serviceable - get TAT
          const deliveryOptions = data.deliveryOptions || {};
          const bestOption = data.bestOption || deliveryOptions.surface || deliveryOptions.express;
          
          console.log('📦 Best option:', bestOption);
          console.log('📦 Delivery options:', deliveryOptions);
          
          // Try multiple paths to get TAT data
          let estimatedDays = null;
          let deliveryDate = null;
          let mode = 'Surface';
          
          if (bestOption) {
            estimatedDays = bestOption.estimatedDays || bestOption.tat;
            deliveryDate = bestOption.expectedDeliveryDate || bestOption.expected_delivery_date;
            mode = bestOption.mode || 'Surface';
          } else if (deliveryOptions.surface) {
            estimatedDays = deliveryOptions.surface.estimatedDays || deliveryOptions.surface.tat;
            deliveryDate = deliveryOptions.surface.deliveryDate || deliveryOptions.surface.expected_delivery_date;
            mode = 'Surface';
          } else if (deliveryOptions.express) {
            estimatedDays = deliveryOptions.express.estimatedDays || deliveryOptions.express.tat;
            deliveryDate = deliveryOptions.express.deliveryDate || deliveryOptions.express.expected_delivery_date;
            mode = 'Express';
          }
          
          console.log('🎯 Final TAT data:', { estimatedDays, deliveryDate, mode });
          
          const result = {
            serviceable: true,
            city: data.location?.city,
            state: data.location?.state,
            estimatedDays: estimatedDays,
            deliveryDate: deliveryDate,
            mode: mode,
            features: data.features || {},
            rawData: data // Keep raw data for debugging
          };
          
          console.log('💾 Setting pin check result:', result);
          setPinCheckResult(result);

          // ✅ NEW: Save to localStorage
          const deliveryData = {
            deliveryCheck: result,
            guestPinCode: !isAuthenticated ? pin : undefined,
            timestamp: Date.now()
          };
          saveDeliveryData(deliveryData);
          console.log('💾 [DeliverySection] Saved delivery check to localStorage');
        } else {
          // PIN is not serviceable
          setPinCheckResult({
            serviceable: false,
            reason: data.reason || 'Delivery not available for this PIN code'
          });
        }
      } else {
        setPinError(response.data.error || 'Failed to check delivery availability');
      }
    } catch (error) {
      console.error('❌ Delhivery check error:', error);
      setPinError(error.response?.data?.message || 'Failed to check delivery availability');
    } finally {
      setCheckingPin(false);
    }
  };

  /**
   * Auto-check PIN when address is selected (for logged-in users)
   * ✅ NOW SAVES: Selected address to localStorage
   */
  useEffect(() => {
    if (selectedAddress && selectedAddress.zip_code) {
      const pin = selectedAddress.zip_code;
      if (pin.length === 6 && pin !== pinCode) {
        setPinCode(pin);
        checkPinDelivery(pin);

        // ✅ NEW: Save selected address to localStorage
        saveDeliveryData({
          selectedAddressId: selectedAddress.id,
          deliveryCheck: pinCheckResult
        });
        console.log('💾 [DeliverySection] Saved selected address to localStorage');
      }
    }
  }, [selectedAddress, bundleWeight]);

  useEffect(() => {
    // Only re-check if:
    // 1. We have a valid PIN code already checked
    // 2. Weight actually changed
    // 3. Weight is different from last checked weight
    if (pinCode && pinCode.length === 6 && pinCheckResult && bundleWeight !== lastCheckedWeight) {
      console.log(`🔄 [DeliverySection] Weight changed: ${lastCheckedWeight}g → ${bundleWeight}g`);
      console.log(`   Rechecking delivery costs...`);
      
      // Update last checked weight
      setLastCheckedWeight(bundleWeight);
      
      // Re-run delivery check with new weight
      checkPinDelivery(pinCode);
    }
  }, [bundleWeight]);

  // ==================== ADDRESS MANAGEMENT ====================

  // Fetch addresses on mount if authenticated
  // ✅ ENHANCED: Try to restore previously selected address
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
        
        // ✅ ENHANCED: Try to restore previously selected address
        const storedAddressId = getStoredAddressId();
        let addressToSelect = null;

        if (storedAddressId) {
          addressToSelect = result.data.find(a => a.id === storedAddressId);
          if (addressToSelect) {
            console.log('✅ [DeliverySection] Restored previously selected address:', addressToSelect);
          }
        }

        // Fallback to default address
        if (!addressToSelect) {
          const defaultAddr = result.data.find(a => a.is_default);
          if (defaultAddr) {
            addressToSelect = defaultAddr;
          } else if (result.data.length > 0) {
            addressToSelect = result.data[0];
          }
        }

        if (addressToSelect) {
          setSelectedAddress(addressToSelect);
        }
      }
    } catch (error) {
      console.error('Failed to fetch addresses:', error);
    } finally {
      setLoading(false);
    }
  };

  // Handle address selection
  // ✅ ENHANCED: Save to localStorage
  const handleAddressSelect = (address) => {
    setSelectedAddress(address);
    setShowAddressList(false);

    // ✅ NEW: Save to localStorage
    saveDeliveryData({
      selectedAddressId: address.id
    });
    console.log('💾 [DeliverySection] Saved address selection to localStorage');
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
        setAddresses([...addresses, result.data]);
        setSelectedAddress(result.data);
        setShowNewAddressModal(false);
        
        // ✅ NEW: Save to localStorage
        saveDeliveryData({
          selectedAddressId: result.data.id
        });
        
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
    <div className="p-4 space-y-3">
      <h3 className="text-sm font-bold text-gray-800 uppercase tracking-wide flex items-center gap-1.5">
        Delivery
        <Truck size={16} className="text-tpppink -translate-y-0.5" />
      </h3>

      {/* ==================== ADDRESS OR PIN INPUT ==================== */}
      
      {isAuthenticated ? (
        /* Logged-in users: Address selector */
        <div className="relative" ref={addressListRef}>
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

          {/* Address Dropdown */}
          {showAddressList && (
            <div className="absolute top-full left-0 right-0 mt-2 bg-white border-2 border-gray-200 rounded-lg shadow-xl max-h-80 overflow-y-auto z-50">
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
        /* Guest users: PIN input with check button */
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
                  setPinCheckResult(null);
                  setPinError(null);
                }
              }}
              onKeyDown={(e) => e.key === 'Enter' && checkPinDelivery(pinCode)}
              maxLength={6}
              className="flex-1 px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-tpppink focus:border-transparent"
            />
            <button
              onClick={() => checkPinDelivery(pinCode)}
              disabled={pinCode.length !== 6 || checkingPin}
              className="px-4 py-2 bg-tpppink text-white rounded-lg font-medium hover:bg-tppslate transition-colors disabled:opacity-50 disabled:cursor-not-allowed text-sm flex items-center gap-2"
            >
              {checkingPin ? (
                <>
                  <Loader size={14} className="animate-spin" />
                </>
              ) : (
                'Check'
              )}
            </button>
          </div>
        </div>
      )}

      {/* ==================== PIN CHECK RESULT WITH COST COMPARISON ==================== */}

      {checkingPin && (
        <div className="flex items-center gap-2 p-3 bg-blue-50 border border-blue-200 rounded-lg">
          <Loader size={16} className="text-blue-600 animate-spin flex-shrink-0" />
          <div className="text-xs text-blue-700">
            <p className="font-semibold">Checking delivery availability...</p>
          </div>
        </div>
      )}

      {pinError && (
        <div className="flex items-start gap-2 p-3 bg-red-50 border border-red-200 rounded-lg">
          <AlertCircle size={16} className="text-red-600 flex-shrink-0 mt-0.5" />
          <div className="text-xs text-red-700">
            <p className="font-semibold">Error</p>
            <p>{pinError}</p>
          </div>
        </div>
      )}

      {pinCheckResult && !checkingPin && (
        <div>
          {pinCheckResult.serviceable ? (
            /* Serviceable - Show delivery info with cost comparison */
            <div className="space-y-3">
              {/* Location Badge */}
              <div className="flex items-center gap-2 p-2 bg-green-50 border border-green-200 rounded-lg">
                <CheckCircle size={14} className="text-green-600 flex-shrink-0" />
                <div className="flex-1">
                  <p className="text-xs font-semibold text-green-700">
                    Delivery Available
                  </p>
                  {pinCheckResult.city && pinCheckResult.state && (
                    <p className="text-xs text-green-600">
                      {pinCheckResult.city}, {pinCheckResult.state}
                    </p>
                  )}
                </div>
              </div>

              {/* Delivery Options with Price Comparison */}
              {(pinCheckResult.rawData?.deliveryOptions?.express || pinCheckResult.rawData?.deliveryOptions?.surface) ? (
                <div className="bg-white border border-gray-200 rounded-lg overflow-hidden">
                  <div className="bg-gray-50 px-3 py-2 border-b border-gray-200">
                    <p className="text-xs font-semibold text-gray-700">Estimated Delivery</p>
                  </div>
                  
                  <div className="divide-y divide-gray-100">
                    {/* Standard/Surface Option - FREE */}
                    {pinCheckResult.rawData?.deliveryOptions?.surface && (
                      <div className="p-3 flex items-center justify-between hover:bg-gray-50 transition-colors">
                        <div className="flex items-center gap-2">
                          <div className="w-8 h-8 bg-tppslate/10 rounded-full flex items-center justify-center">
                            <Truck size={14} className="text-tppslate" />
                          </div>
                          <div>
                            <div className="flex items-center gap-1.5">
                              <p className="text-sm font-semibold text-gray-800">Standard</p>
                            </div>
                            <p className="text-xs text-gray-500">Regular delivery</p>
                          </div>
                        </div>
                        <div className="text-right">
                          <p className="text-sm font-bold text-tppslate">
                            {pinCheckResult.rawData.deliveryOptions.surface.estimatedDays} {pinCheckResult.rawData.deliveryOptions.surface.estimatedDays === 1 ? 'day' : 'days'}
                          </p>
                          {pinCheckResult.rawData.deliveryOptions.surface.deliveryDate && (
                            <p className="text-xs text-gray-500">
                              by {new Date(pinCheckResult.rawData.deliveryOptions.surface.deliveryDate).toLocaleDateString('en-IN', { 
                                day: 'numeric',
                                month: 'short'
                              })}
                            </p>
                          )}
                        </div>
                      </div>
                    )}

                    {/* Express Option - Shows Extra Charge Only */}
                    {pinCheckResult.rawData?.deliveryOptions?.express && (
                      <div className="p-3 bg-pink-50/50 hover:bg-pink-50 transition-colors">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-2">
                            <div className="w-8 h-8 bg-tpppink/20 rounded-full flex items-center justify-center">
                              <Plane size={16} className="text-tpppink" />
                            </div>
                            <div>
                              <div className="flex items-center gap-1.5">
                                <p className="text-sm font-semibold text-gray-800">Express</p>
                              </div>
                              <p className="text-xs text-gray-500">Priority delivery</p>
                            </div>
                          </div>
                          <div className="text-right">
                            <p className="text-sm font-bold text-tpppink">
                              {pinCheckResult.rawData.deliveryOptions.express.estimatedDays} {pinCheckResult.rawData.deliveryOptions.express.estimatedDays === 1 ? 'day' : 'days'}
                            </p>
                            {pinCheckResult.rawData.deliveryOptions.express.deliveryDate && (
                              <p className="text-xs text-gray-500">
                                by {new Date(pinCheckResult.rawData.deliveryOptions.express.deliveryDate).toLocaleDateString('en-IN', { 
                                  day: 'numeric',
                                  month: 'short'
                                })}
                              </p>
                            )}
                          </div>
                        </div>
                        
                        {/* Price Difference Badge - Extra Charges */}
                        {pinCheckResult.rawData.deliveryOptions.express.extraCharge >= 0 && (
                          <div className="mt-2 pt-2 border-t border-pink-100">
                            <div className="flex items-center justify-between text-xs">
                              <span className="text-gray-600">Express charges:</span>
                              <div className="flex items-center gap-1">
                                <span className="font-semibold text-tpppink">
                                  {pinCheckResult.rawData.deliveryOptions.express.extraChargeFormatted}
                                </span>
                              </div>
                            </div>
                          </div>
                        )}
                      </div>
                    )}
                  </div>

                  {/* Price Comparison Summary - Simplified */}
                  {pinCheckResult.rawData?.priceDifference&& (
                    <div className="font-inter bg-yellow-50 border-t border-yellow-100 px-3 py-2">
                      <div className="flex items-center gap-1.5">
                        <div className="relative">
                          <AlertCircle 
                            size={12} 
                            className="alert-icon text-yellow-600 flex-shrink-0 cursor-help" 
                            onMouseEnter={(e) => {
                              const rect = e.currentTarget.getBoundingClientRect();
                              const tooltip = e.currentTarget.nextElementSibling;
                              tooltip.style.left = `${rect.right - 256}px`; // 256px = w-64
                              tooltip.style.top = `${rect.top - 8}px`;
                              tooltip.classList.remove('hidden');
                            }}
                            onMouseLeave={(e) => {
                              const tooltip = e.currentTarget.nextElementSibling;
                              tooltip.classList.add('hidden');
                            }}
                          />
                          {/* Tooltip - using fixed positioning to escape all parent constraints */}
                          <div className="tooltip fixed hidden w-64 p-2.5 bg-tppslate/100 text-white text-xs rounded-lg shadow-xl z-[99999] -translate-y-full pointer-events-none">
                            <p className="leading-relaxed">
                              <b>Delivery charges</b> and <b>express fees</b> are determined and applied directly by our logistics partner, <b>Delhivery</b>, based on <b>shipment weight and destination</b>.
                            </p>
                            {/* Tooltip arrow - pointing down from bottom right */}
                            <div className="absolute top-full right-3 -mt-1 border-4 border-transparent border-t-gray-900"></div>
                          </div>
                        </div>
                        <p className="text-xs text-yellow-700">
                          <span className="font-semibold">Express delivery:</span>{' '}
                          <span className="font-bold">{pinCheckResult.rawData.priceDifference.formatted}</span> extra charges apply
                        </p>
                      </div>
                    </div>
                  )}
                </div>
              ) : (
                /* Fallback when TAT is not available */
                <div className="p-3 bg-blue-50 border border-blue-200 rounded-lg">
                  <div className="flex items-start gap-2">
                    <Calendar size={14} className="text-blue-600 flex-shrink-0 mt-0.5" />
                    <div className="text-xs text-blue-700">
                      <p className="font-semibold mb-1">Delivery Available</p>
                      <p className="text-blue-600">Standard delivery: 5-7 business days</p>
                    </div>
                  </div>
                </div>
              )}

              {/* Delivery Features */}
              {pinCheckResult.features && (pinCheckResult.features.cod || pinCheckResult.features.prepaid) && (
                <div className="flex flex-wrap gap-2">
                  {pinCheckResult.features.cod && (
                    <div className="flex items-center gap-1 px-2 py-1 bg-green-50 border border-green-200 rounded text-xs text-green-700 font-medium">
                      <CheckCircle size={10} />
                      <span>COD Currently Not Available</span>
                    </div>
                  )}
                  {pinCheckResult.features.prepaid && (
                    <div className="flex items-center gap-1 px-2 py-1 bg-blue-50 border border-blue-200 rounded text-xs text-blue-700 font-medium">
                      <CheckCircle size={10} />
                      <span>Prepaid</span>
                    </div>
                  )}
                </div>
              )}
            </div>
          ) : (
            /* Not Serviceable */
            <div className="flex items-start gap-2 p-3 bg-red-50 border border-red-200 rounded-lg">
              <AlertCircle size={16} className="text-red-600 flex-shrink-0 mt-0.5" />
              <div className="text-xs text-red-700">
                <p className="font-semibold">Delivery Not Available</p>
                <p>{pinCheckResult.reason || 'This PIN code is not serviceable'}</p>
              </div>
            </div>
          )}
        </div>
      )}

      {/* ==================== FREE SHIPPING BADGE ==================== */}
      
      {(!pinCheckResult || pinCheckResult.serviceable) && (
        <div className="bg-green-50 border border-green-200 rounded-lg p-2.5 flex items-center gap-2">
          <div>
            <p className="text-xs font-bold text-green-700">FREE STANDARD SHIPPING</p>
            <p className="text-xs text-green-600">On all PREPAID orders</p>
          </div>
        </div>
      )}

      {/* New Address Modal (unchanged) */}
      {showNewAddressModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div ref={modalRef} className="bg-white rounded-lg shadow-2xl max-w-md w-full max-h-[90vh] overflow-y-auto">
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

            <div className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Address Type</label>
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

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Street Address *</label>
                <input
                  type="text"
                  placeholder="House No., Building Name"
                  value={newAddressForm.line1}
                  onChange={(e) => setNewAddressForm({ ...newAddressForm, line1: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-tpppink focus:border-transparent"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Apartment, Suite, etc. (optional)</label>
                <input
                  type="text"
                  placeholder="Apartment, floor, etc."
                  value={newAddressForm.line2}
                  onChange={(e) => setNewAddressForm({ ...newAddressForm, line2: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-tpppink focus:border-transparent"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">City *</label>
                  <input
                    type="text"
                    placeholder="City"
                    value={newAddressForm.city}
                    onChange={(e) => setNewAddressForm({ ...newAddressForm, city: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-tpppink focus:border-transparent"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">State *</label>
                  <input
                    type="text"
                    placeholder="State"
                    value={newAddressForm.state}
                    onChange={(e) => setNewAddressForm({ ...newAddressForm, state: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-tpppink focus:border-transparent"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">PIN Code *</label>
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
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-tpppink focus:border-transparent"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Phone Number (optional)</label>
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
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-tpppink focus:border-transparent"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Landmark (optional)</label>
                <input
                  type="text"
                  placeholder="e.g., Near City Hospital"
                  value={newAddressForm.landmark}
                  onChange={(e) => setNewAddressForm({ ...newAddressForm, landmark: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-tpppink focus:border-transparent"
                />
              </div>
            </div>

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