// frontend/src/components/checkout/DeliveryDetailsCard.jsx - WITH INTEGRATED DELIVERY SELECTION

import React, { useState, useEffect, useRef } from 'react';
import { Truck, Package, MapPin, Calendar, AlertCircle, CheckCircle, Loader, Plane, ChevronDown, ChevronUp, Home, Briefcase, Plus } from 'lucide-react';
import { getStoredDeliveryCheck, saveDeliveryData, getDeliveryData } from '../../utils/deliveryStorage';
import api from '../../services/api';

/**
 * DeliveryDetailsCard Component
 * Shows estimated delivery time and shipping method from localStorage
 * Performs silent background verification of delivery data
 * ✅ Address selector UI + localStorage persistence
 * ✅ No duplicate auto-selection (handled by parent)
 * ✅ Integrated delivery mode selection (Standard/Express)
 * 
 * @param {Object} selectedAddress - Currently selected delivery address
 * @param {Function} onAddressSelect - Callback when address is selected
 * @param {Array} addresses - List of available addresses
 * @param {Function} onDeliveryUpdate - Callback when delivery data changes
 * @param {Function} onStepChange - Callback to change checkout step
 * @param {Function} onDeliveryModeChange - Callback when delivery mode changes
 */
const DeliveryDetailsCard = ({ 
  selectedAddress, 
  onAddressSelect,
  addresses = [],
  onDeliveryUpdate,
  onStepChange,
  onDeliveryModeChange
}) => {
  const [deliveryData, setDeliveryData] = useState(null);
  const [verifying, setVerifying] = useState(false);
  const [verified, setVerified] = useState(false);
  const [hasChanges, setHasChanges] = useState(false);
  const [verificationError, setVerificationError] = useState(null);
  
  // Address dropdown state
  const [showAddressList, setShowAddressList] = useState(false);
  const addressListRef = useRef(null);

  // ✅ NEW: Delivery mode selection state
  const [selectedMode, setSelectedMode] = useState('surface'); // 'surface' or 'express'
  const [isChangingMode, setIsChangingMode] = useState(false);

  // Load delivery data from localStorage on mount
  useEffect(() => {
    const storedCheck = getStoredDeliveryCheck();
    if (storedCheck) {
      console.log('📦 [DeliveryDetailsCard] Loaded stored delivery data:', storedCheck);
      setDeliveryData(storedCheck);
    }

    // ✅ Load saved delivery mode
    const storedData = getDeliveryData();
    if (storedData?.selectedDeliveryMode) {
      setSelectedMode(storedData.selectedDeliveryMode);
      console.log('✅ [DeliveryDetailsCard] Restored delivery mode:', storedData.selectedDeliveryMode);
    }
  }, []);

  // Background verification when address is selected and changes
  useEffect(() => {
    if (!selectedAddress?.zip_code) {
      return;
    }

    const storedPinCode = deliveryData?.rawData?.pincode || deliveryData?.pinCode;
    
    // Verify if no data exists OR if PIN changed
    if (!deliveryData || (storedPinCode && storedPinCode !== selectedAddress.zip_code)) {
      console.log('🔄 [DeliveryDetailsCard] Verifying delivery for address:', selectedAddress.zip_code);
      verifyDeliveryInBackground(selectedAddress.zip_code, deliveryData);
    }
  }, [selectedAddress?.id, selectedAddress?.zip_code]);

  // ✅ NEW: Notify parent when mode changes
  useEffect(() => {
    if (!deliveryData?.rawData?.deliveryOptions) return;

    const options = deliveryData.rawData.deliveryOptions;
    const selectedOption = options[selectedMode];

    if (selectedOption && onDeliveryModeChange) {
      const extraCharge = selectedMode === 'express' && options.express?.extraCharge 
        ? options.express.extraCharge 
        : 0;

      onDeliveryModeChange({
        mode: selectedMode,
        estimatedDays: selectedOption.estimatedDays,
        deliveryDate: selectedOption.deliveryDate,
        extraCharge: extraCharge,
        option: selectedOption
      });
    }
  }, [selectedMode, deliveryData, onDeliveryModeChange]);

  /**
   * Silent background verification of delivery serviceability
   */
  const verifyDeliveryInBackground = async (pinCode, storedCheck) => {
    if (!pinCode || pinCode.length !== 6) return;

    setVerifying(true);
    setVerificationError(null);

    try {
      console.log('🔄 [DeliveryDetailsCard] Verifying delivery for PIN:', pinCode);
      
      const response = await api.get(`/api/delhivery/check/${pinCode}`);

      if (response.data.success) {
        const freshData = response.data;
        
        // Build new delivery data structure
        const newDeliveryData = {
          serviceable: freshData.serviceable,
          city: freshData.location?.city,
          state: freshData.location?.state,
          estimatedDays: freshData.bestOption?.estimatedDays || freshData.deliveryOptions?.surface?.estimatedDays,
          deliveryDate: freshData.bestOption?.expectedDeliveryDate || freshData.deliveryOptions?.surface?.deliveryDate,
          mode: freshData.bestOption?.mode || 'Surface',
          features: freshData.features || {},
          pinCode: pinCode,
          rawData: freshData
        };

        // Compare with stored data
        if (storedCheck) {
          const hasChanged = 
            freshData.serviceable !== storedCheck.serviceable ||
            freshData.deliveryOptions?.surface?.estimatedDays !== storedCheck.rawData?.deliveryOptions?.surface?.estimatedDays ||
            freshData.deliveryOptions?.express?.estimatedDays !== storedCheck.rawData?.deliveryOptions?.express?.estimatedDays;

          if (hasChanged) {
            console.log('⚠️ [DeliveryDetailsCard] Delivery info has changed!');
            setHasChanges(true);
          }
        }

        setDeliveryData(newDeliveryData);
        setVerified(true);

        // ✅ Save to localStorage
        const currentStoredData = getDeliveryData() || {};
        saveDeliveryData({
          ...currentStoredData,
          deliveryCheck: newDeliveryData,
          timestamp: Date.now()
        });

        // Notify parent component
        if (onDeliveryUpdate) {
          onDeliveryUpdate(newDeliveryData);
        }

        console.log('✅ [DeliveryDetailsCard] Verification complete:', newDeliveryData);
      } else {
        throw new Error(response.data.error || 'Verification failed');
      }
    } catch (error) {
      console.error('❌ [DeliveryDetailsCard] Verification error:', error);
      setVerificationError('Unable to verify delivery availability');
      // Don't clear existing data on error - show cached data
    } finally {
      setVerifying(false);
    }
  };

  // Handle address selection
  const handleAddressSelect = (address) => {
    if (onAddressSelect) {
      onAddressSelect(address);
    }
    setShowAddressList(false);

    // ✅ Save to localStorage
    const currentStoredData = getDeliveryData() || {};
    saveDeliveryData({
      ...currentStoredData,
      selectedAddressId: address.id,
      timestamp: Date.now()
    });
    console.log('💾 [DeliveryDetailsCard] Saved address selection to localStorage');
  };

  // ✅ NEW: Handle delivery mode change
  const handleModeChange = async (mode) => {
    if (isChangingMode || mode === selectedMode) return;

    try {
      setIsChangingMode(true);
      setSelectedMode(mode);

      // Save to localStorage
      const currentStoredData = getDeliveryData() || {};
      await saveDeliveryData({
        ...currentStoredData,
        selectedDeliveryMode: mode,
        timestamp: Date.now()
      });

      console.log('💾 [DeliveryDetailsCard] Saved delivery mode:', mode);
    } catch (error) {
      console.error('❌ [DeliveryDetailsCard] Error saving mode:', error);
    } finally {
      setIsChangingMode(false);
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

  return (
    <div className="bg-white rounded-lg shadow overflow-hidden">
      {/* Header */}
      <div className="bg-gradient-to-r from-tppslate to-tppslate/90 px-6 py-4">
        <h2 className="text-lg font-bold text-white flex items-center gap-2">
          <Truck size={20} />
          Delivery Information
        </h2>
      </div>

      <div className="p-6 space-y-4">
        {/* ==================== ADDRESS SELECTOR ==================== */}
        <div>
          <h3 className="text-sm font-bold text-gray-800 mb-3 flex items-center gap-2">
            <MapPin size={16} className="text-tpppink" />
            Delivery Address
          </h3>

          <div className="relative" ref={addressListRef}>
            {selectedAddress ? (
              <button
                onClick={() => setShowAddressList(!showAddressList)}
                className="w-full p-3 bg-tpppink/10 border-2 border-tpppink rounded-lg text-left hover:border-tpppink hover:bg-tpppink/20 transition-colors"
              >
                <div className="flex items-start justify-between">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      {getAddressIcon(selectedAddress.address_type)}
                      <span className="text-sm font-bold text-gray-800">
                        {getAddressTypeName(selectedAddress.address_type)}
                      </span>
                      {selectedAddress.is_default && (
                        <span className="text-xs bg-green-500 text-white px-2 py-0.5 rounded-full font-semibold">
                          Default
                        </span>
                      )}
                    </div>
                    <p className="text-sm text-gray-700 font-medium">
                      {selectedAddress.line1}
                    </p>
                    <p className="text-sm text-gray-600">
                      {selectedAddress.line2 ? `${selectedAddress.line2}, ` : ''}
                      {selectedAddress.city}, {selectedAddress.state} {selectedAddress.zip_code}
                    </p>
                  </div>
                  <div className="ml-2 flex-shrink-0">
                    {showAddressList ? (
                      <ChevronUp size={18} className="text-gray-600" />
                    ) : (
                      <ChevronDown size={18} className="text-gray-600" />
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
                {onStepChange && (
                  <button
                    onClick={() => {
                      onStepChange('shipping');
                      setShowAddressList(false);
                    }}
                    className="w-full p-3 bg-tpppink/10 border-b-2 border-gray-100 flex items-center gap-2 hover:bg-tpppink transition-colors text-tpppink hover:text-white font-semibold"
                  >
                    <Plus size={16} />
                    <span className="text-sm">Add New Address</span>
                  </button>
                )}

                {addresses.length === 0 ? (
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
                              <span className="text-xs bg-green-500 text-white px-1.5 py-0.5 rounded-full font-semibold">
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
        </div>

        {/* Show message if no address selected */}
        {!selectedAddress && (
          <div className="p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
            <p className="text-sm text-yellow-700">
              Please select a delivery address to see delivery estimates
            </p>
          </div>
        )}

        {/* Loading delivery info */}
        {selectedAddress && !deliveryData && !verifying && (
          <div className="flex items-center gap-2 p-3 bg-blue-50 border border-blue-200 rounded-lg">
            <Loader size={14} className="text-blue-600 animate-spin flex-shrink-0" />
            <p className="text-xs text-blue-700">Loading delivery information...</p>
          </div>
        )}

        {/* Verification Status */}
        {selectedAddress && verifying && (
          <div className="flex items-center gap-2 p-3 bg-blue-50 border border-blue-200 rounded-lg">
            <Loader size={14} className="text-blue-600 animate-spin flex-shrink-0" />
            <p className="text-xs text-blue-700">Verifying delivery availability...</p>
          </div>
        )}

        {selectedAddress && verificationError && (
          <div className="flex items-start gap-2 p-3 bg-amber-50 border border-amber-200 rounded-lg">
            <AlertCircle size={14} className="text-amber-600 flex-shrink-0 mt-0.5" />
            <p className="text-xs text-amber-700">{verificationError}</p>
          </div>
        )}

        {/* Not serviceable state */}
        {selectedAddress && deliveryData && !deliveryData.serviceable && (
          <div className="flex items-start gap-3 p-4 bg-red-50 border border-red-200 rounded-lg">
            <AlertCircle size={20} className="text-red-600 flex-shrink-0 mt-0.5" />
            <div>
              <p className="text-sm font-semibold text-red-800 mb-1">
                Cannot deliver to this address
              </p>
              <p className="text-sm text-red-700">
                {deliveryData.reason || 'This PIN code is not serviceable. Please select a different address.'}
              </p>
            </div>
          </div>
        )}

        {/* Serviceable - Show delivery info */}
        {selectedAddress && deliveryData && deliveryData.serviceable &&(
          <>
            {/* Location Info */}
            {deliveryData.city && deliveryData.state && !verifying &&(
              <div className="flex items-center gap-3 p-3 bg-green-50 border border-green-200 rounded-lg">
                <MapPin size={18} className="text-green-600 flex-shrink-0" />
                <div>
                  <p className="text-sm font-semibold text-green-800">
                    Delivering to {deliveryData.city}, {deliveryData.state}
                  </p>
                  <p className="text-xs text-green-600">PIN: {selectedAddress.zip_code}</p>
                </div>
              </div>
            )}

            {/* ✅ ENHANCED: Delivery Options with Selection */}
            {deliveryData.rawData?.deliveryOptions && (
              <div className="bg-gray-50 border border-gray-200 rounded-lg overflow-hidden">
                <div className="bg-gray-100 px-4 py-2 border-b border-gray-200 flex items-center justify-between">
                  <p className="text-sm font-semibold text-gray-700">Choose Delivery Speed</p>
                  <p className="text-sm font-semibold text-gray-700">
                    {selectedMode === 'express' ? 'Express' : 'Standard'}
                  </p>
                </div>

                <div className="divide-y divide-gray-100">
                  {/* Standard/Surface Delivery */}
                  {deliveryData.rawData.deliveryOptions.surface && (
                    <button
                      onClick={() => handleModeChange('surface')}
                      disabled={isChangingMode}
                      className={`w-full p-4 flex items-center justify-between text-left transition-all ${
                        selectedMode === 'surface'
                          ? 'bg-tpppink/5 border-l-4 border-tpppink'
                          : 'hover:bg-gray-50 border-l-4 border-transparent'
                      } ${isChangingMode ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}`}
                    >
                      <div className="flex items-center gap-3 flex-1">
                        <div className={`w-10 h-10 rounded-full flex items-center justify-center ${
                          selectedMode === 'surface' ? 'bg-tppslate/20' : 'bg-gray-100'
                        }`}>
                          <Truck size={18} className={selectedMode === 'surface' ? 'text-tppslate' : 'text-gray-400'} />
                        </div>
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-1">
                            <p className="text-sm font-semibold text-gray-800">Standard Delivery</p>
                          </div>
                          <p className="text-xs text-gray-500">Regular shipping</p>
                        </div>
                      </div>
                      <div className="text-right flex items-center gap-3">
                        <div>
                          <p className="text-base font-bold text-tppslate">
                            {deliveryData.rawData.deliveryOptions.surface.estimatedDays}{' '}
                            {deliveryData.rawData.deliveryOptions.surface.estimatedDays === 1 ? 'day' : 'days'}
                          </p>
                          {deliveryData.rawData.deliveryOptions.surface.deliveryDate && (
                            <p className="text-xs text-gray-500">
                              by {new Date(deliveryData.rawData.deliveryOptions.surface.deliveryDate).toLocaleDateString('en-IN', {
                                day: 'numeric',
                                month: 'short'
                              })}
                            </p>
                          )}
                        </div>
                      </div>
                    </button>
                  )}

                  {/* Express Delivery */}
                  {deliveryData.rawData.deliveryOptions.express && (
                    <button
                      onClick={() => handleModeChange('express')}
                      disabled={isChangingMode}
                      className={`w-full p-4 transition-all ${
                        selectedMode === 'express'
                          ? 'bg-tpppink/5 border-l-4 border-tpppink'
                          : 'hover:bg-gray-50 border-l-4 border-transparent'
                      } ${isChangingMode ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}`}
                    >
                      <div className="flex items-center justify-between mb-3">
                        <div className="flex items-center gap-3 flex-1">
                          <div className={`w-10 h-10 rounded-full flex items-center justify-center ${
                            selectedMode === 'express' ? 'bg-tpppink/20' : 'bg-gray-100'
                          }`}>
                            <Plane size={18} className={selectedMode === 'express' ? 'text-tpppink' : 'text-gray-400'} />
                          </div>
                          <div className="flex-1">
                            <div className="flex items-center gap-2 mb-1">
                              <p className="text-sm text-left font-semibold text-gray-800">Express Delivery</p>
                            </div>
                            <p className="text-xs text-left text-gray-500">Priority shipping</p>
                          </div>
                        </div>
                        <div className="text-right flex items-center gap-3">
                          <div>
                            <p className="text-base font-bold text-tpppink">
                              {deliveryData.rawData.deliveryOptions.express.estimatedDays}{' '}
                              {deliveryData.rawData.deliveryOptions.express.estimatedDays === 1 ? 'day' : 'days'}
                            </p>
                            {deliveryData.rawData.deliveryOptions.express.deliveryDate && (
                              <p className="text-xs text-gray-500">
                                by {new Date(deliveryData.rawData.deliveryOptions.express.deliveryDate).toLocaleDateString('en-IN', {
                                  day: 'numeric',
                                  month: 'short'
                                })}
                              </p>
                            )}
                          </div>
                        </div>
                      </div>

                      {/* Extra Charges in Express Option */}
                      {deliveryData.rawData.deliveryOptions.express.extraCharge && (
                        <div className="pt-3 border-t border-pink-100">
                          <div className="flex items-center gap-2">
                            <AlertCircle size={14} className="text-amber-600 flex-shrink-0" />
                            <p className="text-xs text-amber-700">
                              <span className="font-semibold">Express delivery:</span>{' '}
                              <span className="font-bold">{deliveryData.rawData.priceDifference.formatted}</span> extra charges apply
                            </p>
                          </div>
                        </div>
                      )}
                    </button>
                  )}
                </div>
              </div>
            )}

            {/* Fallback if no delivery options */}
            {!deliveryData.rawData?.deliveryOptions && deliveryData.estimatedDays && (
              <div className="flex items-start gap-3 p-4 bg-blue-50 border border-blue-200 rounded-lg">
                <Calendar size={18} className="text-blue-600 flex-shrink-0 mt-0.5" />
                <div>
                  <p className="text-sm font-semibold text-blue-800 mb-1">
                    Estimated Delivery: {deliveryData.estimatedDays} days
                  </p>
                  {deliveryData.deliveryDate && (
                    <p className="text-sm text-blue-700">
                      Expected by: {new Date(deliveryData.deliveryDate).toLocaleDateString('en-IN', {
                        day: 'numeric',
                        month: 'short',
                        year: 'numeric'
                      })}
                    </p>
                  )}
                  <p className="text-xs text-blue-600 mt-1">
                    Mode: {deliveryData.mode || 'Standard'}
                  </p>
                </div>
              </div>
            )}

            {/* Delivery Features */}
            {deliveryData.features && (deliveryData.features.cod || deliveryData.features.prepaid) && (
              <div className="pt-4 border-t space-y-2">
                <p className="text-xs font-semibold text-gray-700 uppercase tracking-wide">
                  Available Payment Methods
                </p>
                <div className="flex flex-wrap gap-2">
                  {deliveryData.features.prepaid && (
                    <div className="flex items-center gap-1.5 px-3 py-1.5 bg-blue-50 border border-blue-200 rounded-md">
                      <CheckCircle size={12} className="text-blue-600" />
                      <span className="text-xs text-blue-700 font-medium">Prepaid</span>
                    </div>
                  )}
                  {deliveryData.features.cod && (
                    <div className="flex items-center gap-1.5 px-3 py-1.5 bg-green-50 border border-green-200 rounded-md">
                      <CheckCircle size={12} className="text-green-600" />
                      <span className="text-xs text-green-700 font-medium">Cash on Delivery</span>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Free Shipping Badge */}
            <div className="bg-green-50 border border-green-200 rounded-lg p-3">
              <div className="flex items-center gap-2">
                <Package size={16} className="text-green-600" />
                <div>
                  <p className="text-sm font-bold text-green-700">FREE STANDARD SHIPPING</p>
                  <p className="text-xs text-green-600">On all prepaid orders</p>
                </div>
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default DeliveryDetailsCard;