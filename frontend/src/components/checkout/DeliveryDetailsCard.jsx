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
 * ✅ TWO COLUMN LAYOUT: Address info | Delivery options
 * 
 * @param {Object} selectedAddress - Currently selected delivery address
 * @param {Function} onAddressSelect - Callback when address is selected
 * @param {Array} addresses - List of available addresses
 * @param {Function} onDeliveryUpdate - Callback when delivery data changes
 * @param {Function} onOpenAddressModal - Callback to open address modal
 * @param {Function} onDeliveryModeChange - Callback when delivery mode changes
 */
const DeliveryDetailsCard = ({ 
  selectedAddress, 
  onAddressSelect,
  addresses = [],
  onDeliveryUpdate,
  onOpenAddressModal,
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
    console.log('🔄 Mode changing to:', mode);

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
        return <Home size={14} className="text-tpppink" />;
      case 'work':
        return <Briefcase size={14} className="text-blue-600" />;
      default:
        return <MapPin size={14} className="text-slate-600" />;
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
    <div className="bg-white rounded-lg shadow overflow-visible">
      {/* Header */}
      <div className="bg-gradient-to-r from-tppslate to-tppslate/90 px-6 py-4 rounded-lg">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-bold text-white flex items-center gap-2">
            <Truck size={20} />
            Delivery Information
          </h2>
          
          {/* Free Shipping Badge - Compact with white text */}
          {selectedAddress && deliveryData && deliveryData.serviceable && (
            <div className="bg-green-600 rounded-md px-3 py-1.5 flex items-center gap-1.5">
              <Package size={14} className="text-white" />
              <span className="font-inter text-xs font-bold text-white whitespace-nowrap">FREE STANDARD SHIPPING</span>
            </div>
          )}
        </div>
      </div>

      {/* ==================== TWO COLUMN LAYOUT ==================== */}
      <div className="p-6 overflow-visible">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          
          {/* ==================== LEFT COLUMN: ADDRESS INFO ==================== */}
          <div className="space-y-4">
            {/* ADDRESS SELECTOR */}
            <div>
              <div className="flex items-center justify-between mb-3">
                <h3 className="text-[16px] font-bold text-slate-800 flex items-center gap-2">
                  Delivery Address
                </h3>

                <button
                  onClick={() => {
                    onOpenAddressModal();
                    setShowAddressList(false);
                  }}
                  className="flex items-center gap-1.5 px-3 py-1.5 bg-tpppink/10 hover:bg-tpppink text-tpppink hover:text-white rounded-md transition-colors"
                >
                  <Plus size={14} />
                  <span className="text-xs font-bold">Add Address</span>
                </button>
              </div>

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
                          <span className="text-sm font-bold text-slate-800">
                            {getAddressTypeName(selectedAddress.address_type)}
                          </span>
                          {selectedAddress.is_default && (
                            <span className="text-xs bg-green-500 text-white px-2 py-0.5 rounded-full font-semibold">
                              Default
                            </span>
                          )}
                        </div>
                        <p className="text-sm text-slate-700 font-medium">
                          {selectedAddress.line1}
                        </p>
                        <p className="text-sm text-slate-600">
                          {selectedAddress.line2 ? `${selectedAddress.line2}, ` : ''}
                          {selectedAddress.city}, {selectedAddress.state} {selectedAddress.zip_code}
                        </p>
                      </div>
                      <div className="ml-2 flex-shrink-0">
                        {showAddressList ? (
                          <ChevronUp size={18} className="text-slate-600" />
                        ) : (
                          <ChevronDown size={18} className="text-slate-600" />
                        )}
                      </div>
                    </div>
                  </button>
                ) : (
                  <button
                    onClick={() => setShowAddressList(!showAddressList)}
                    className="w-full p-3 border-2 border-dashed border-slate-300 rounded-lg text-left hover:border-tpppink transition-colors"
                  >
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-slate-600">Select delivery address</span>
                      {showAddressList ? (
                        <ChevronUp size={16} className="text-slate-600" />
                      ) : (
                        <ChevronDown size={16} className="text-slate-600" />
                      )}
                    </div>
                  </button>
                )}

                {/* Address Dropdown - Modal for 3+ addresses, Dropdown for 1-2 */}
                {showAddressList && addresses.length <= 2 && (
                  <div className="absolute top-full left-0 right-0 mt-2 bg-white border-2 border-slate-200 rounded-lg shadow-xl max-h-80 overflow-y-auto z-50">

                    {addresses.length === 0 ? (
                      <div className="p-4 text-center text-sm text-slate-500">
                        No saved addresses
                      </div>
                    ) : (
                      addresses.map((addr) => (
                        <button
                          key={addr.id}
                          onClick={() => handleAddressSelect(addr)}
                          className={`w-full p-3 border-b last:border-b-0 border-slate-100 text-left hover:bg-slate-50 transition-colors ${
                            selectedAddress?.id === addr.id ? 'bg-slate-50' : ''
                          }`}
                        >
                          <div className="flex items-start justify-between">
                            <div className="flex-1 min-w-0">
                              <div className="flex items-center gap-2 mb-1">
                                {getAddressIcon(addr.address_type)}
                                <span className="text-xs font-semibold text-slate-800">
                                  {getAddressTypeName(addr.address_type)}
                                </span>
                                {addr.is_default && (
                                  <span className="text-xs bg-green-500 text-white px-1.5 py-0.5 rounded-full font-semibold">
                                    Default
                                  </span>
                                )}
                              </div>
                              <p className="text-xs text-slate-700 font-medium truncate">
                                {addr.line1}
                              </p>
                              <p className="text-xs text-slate-500">
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

                {/* Address Modal - For 3+ addresses */}
                {showAddressList && addresses.length > 2 && (
                  <>
                    {/* Modal Backdrop */}
                    <div 
                      className="fixed inset-0 bg-black/50 z-50"
                      onClick={() => setShowAddressList(false)}
                    />
                    
                    {/* Modal Content */}
                    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
                      <div className="bg-white rounded-lg shadow-2xl w-full max-w-2xl max-h-[80vh] flex flex-col">
                        {/* Modal Header */}
                        <div className="bg-gradient-to-r from-tppslate to-tppslate/90 px-6 py-4 flex items-center justify-between rounded-t-lg">
                          <h3 className="text-lg font-bold text-white flex items-center gap-2">
                            <MapPin size={20} />
                            Select Delivery Address
                          </h3>
                          <button
                            onClick={() => setShowAddressList(false)}
                            className="text-white hover:bg-white/20 rounded-full p-1 transition-colors"
                          >
                            <ChevronUp size={20} />
                          </button>
                        </div>

                        {/* Add New Address Button */}
                        {onOpenAddressModal && (
                          <button
                            onClick={() => {
                              onOpenAddressModal();
                              setShowAddressList(false);
                            }}
                            className="m-4 mb-0 p-3 bg-tpppink/10 border-2 border-tpppink rounded-lg flex items-center justify-center gap-2 hover:bg-tpppink transition-colors text-tpppink hover:text-white font-semibold"
                          >
                            <Plus size={16} />
                            <span className="text-sm">Add New Address</span>
                          </button>
                        )}

                        {/* Modal Body - Scrollable */}
                        <div className="flex-1 overflow-y-auto p-4">
                          {addresses.length === 0 ? (
                            <div className="p-8 text-center text-sm text-slate-500">
                              No saved addresses
                            </div>
                          ) : (
                            <div className="space-y-3">
                              {addresses.map((addr) => (
                                <button
                                  key={addr.id}
                                  onClick={() => handleAddressSelect(addr)}
                                  className={`w-full p-4 border-2 rounded-lg text-left transition-all ${
                                    selectedAddress?.id === addr.id 
                                      ? 'bg-tpppink/5 border-tpppink' 
                                      : 'border-slate-200 hover:border-slate-300 hover:bg-slate-50'
                                  }`}
                                >
                                  <div className="flex items-start justify-between">
                                    <div className="flex-1 min-w-0">
                                      <div className="flex items-center gap-2 mb-2">
                                        {getAddressIcon(addr.address_type)}
                                        <span className="text-sm font-semibold text-slate-800">
                                          {getAddressTypeName(addr.address_type)}
                                        </span>
                                        {addr.is_default && (
                                          <span className="text-xs bg-green-500 text-white px-2 py-0.5 rounded-full font-semibold">
                                            Default
                                          </span>
                                        )}
                                      </div>
                                      <p className="text-sm text-slate-700 font-medium mb-1">
                                        {addr.line1}
                                      </p>
                                      <p className="text-sm text-slate-600">
                                        {addr.line2 ? `${addr.line2}, ` : ''}
                                        {addr.city}, {addr.state} {addr.zip_code}
                                      </p>
                                    </div>
                                    {selectedAddress?.id === addr.id && (
                                      <CheckCircle size={20} className="text-tpppink flex-shrink-0 ml-3" />
                                    )}
                                  </div>
                                </button>
                              ))}
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  </>
                )}
              </div>
            </div>

            {/* Show message if no address selected */}
            {!selectedAddress && (
              <div className="p-3 bg-amber-50 border border-amber-200 rounded-lg">
                <p className="text-sm text-amber-700">
                  Please select a delivery address to see delivery estimates
                </p>
              </div>
            )}

            {/* Loading delivery info */}
            {selectedAddress && !deliveryData && !verifying && (
              <div className="flex items-center gap-2 p-3 bg-slate-50 border border-slate-200 rounded-lg">
                <Loader size={14} className="text-slate-600 animate-spin flex-shrink-0" />
                <p className="text-xs text-slate-700">Loading delivery information...</p>
              </div>
            )}

            {/* Verification Status */}
            {selectedAddress && verifying && (
              <div className="flex items-center gap-2 p-3 bg-slate-50 border border-slate-200 rounded-lg">
                <Loader size={14} className="text-slate-600 animate-spin flex-shrink-0" />
                <p className="text-xs text-slate-700">Verifying delivery availability...</p>
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

            {/* Location Info - "Delivering to..." */}
            {selectedAddress && deliveryData && deliveryData.serviceable && deliveryData.city && deliveryData.state && !verifying && (
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

            {/* Delivery Features */}
            {selectedAddress && deliveryData && deliveryData.serviceable && deliveryData.features && (deliveryData.features.cod || deliveryData.features.prepaid) && (
              <div className="space-y-2">
                <p className="text-xs font-semibold text-slate-700 uppercase tracking-wide">
                  Available Payment Methods
                </p>
                <div className="flex flex-wrap gap-2">
                  {deliveryData.features.prepaid && (
                    <div className="flex items-center gap-1.5 px-3 py-1.5 bg-slate-50 border border-slate-200 rounded-md">
                      <CheckCircle size={12} className="text-tppslate" />
                      <span className="text-xs text-slate-700 font-medium">Prepaid</span>
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
          </div>

          {/* ==================== RIGHT COLUMN: DELIVERY OPTIONS ==================== */}
          <div>
            {/* Show delivery options only when serviceable */}
            {selectedAddress && deliveryData && deliveryData.serviceable && deliveryData.rawData?.deliveryOptions && (
              <div>
                <div className="flex items-center justify-between mb-3">
                  <h3 className="text-[16px] font-bold text-slate-800 flex items-center gap-2">
                    Choose Delivery Speed
                  </h3>
                  
                  {/* Current Selected Mode Display */}
                  <div className="flex items-center gap-2 bg-slate-100 px-3 py-1.5 rounded-md">
                    {selectedMode === 'express' ? (
                      <>
                        <Plane size={14} className="text-tpppink" />
                        <span className="text-xs font-bold text-slate-800">Express</span>
                      </>
                    ) : (
                      <>
                        <Truck size={14} className="text-tppslate" />
                        <span className="text-xs font-bold text-slate-800">Standard</span>
                      </>
                    )}
                  </div>
                </div>

                <div className="bg-slate-50 border border-slate-200 rounded-lg overflow-hidden">
                  <div className="divide-y divide-slate-200">
                    {/* Standard/Surface Delivery */}
                    {deliveryData.rawData.deliveryOptions.surface && (
                      <button
                        onClick={() => handleModeChange('surface')}
                        disabled={isChangingMode}
                        className={`w-full p-4 flex items-center justify-between text-left transition-all ${
                          selectedMode === 'surface'
                            ? 'bg-tpppink/5 border-l-4 border-tpppink'
                            : 'hover:bg-slate-100 border-l-4 border-transparent'
                        } ${isChangingMode ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}`}
                      >
                        <div className="flex items-center gap-3 flex-1">
                          <div className={`w-10 h-10 rounded-full flex items-center justify-center ${
                            selectedMode === 'surface' ? 'bg-tppslate/20' : 'bg-slate-200'
                          }`}>
                            <Truck size={18} className={selectedMode === 'surface' ? 'text-tppslate' : 'text-slate-500'} />
                          </div>
                          <div className="flex-1">
                            <div className="flex items-center gap-2 mb-1">
                              <p className="text-sm font-semibold text-slate-800">Standard Delivery</p>
                            </div>
                            <p className="text-xs text-slate-500">Regular shipping</p>
                          </div>
                        </div>
                        <div className="text-right flex items-center gap-3">
                          <div>
                            <p className="text-base font-bold text-tppslate">
                              {deliveryData.rawData.deliveryOptions.surface.estimatedDays}{' '}
                              {deliveryData.rawData.deliveryOptions.surface.estimatedDays === 1 ? 'day' : 'days'}
                            </p>
                            {deliveryData.rawData.deliveryOptions.surface.deliveryDate && (
                              <p className="text-xs text-slate-500">
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
                      <div 
                        className={`w-full transition-all ${
                          selectedMode === 'express'
                            ? 'bg-tpppink/5 border-l-4'
                            : 'hover:bg-slate-100 border-l-4 border-transparent'
                        }`}
                        style={selectedMode === 'express' ? {
                          borderLeftColor: 'var(--color-tpppink, #d95669)',
                          borderLeftWidth: '4px',
                          borderLeftStyle: 'solid'
                        } : {}}
                      >
                        <button
                          onClick={() => handleModeChange('express')}
                          disabled={isChangingMode}
                          className={`w-full p-4 flex items-center justify-between text-left ${
                            isChangingMode ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'
                          }`}
                        >
                          <div className="flex items-center gap-3 flex-1">
                            <div className={`w-10 h-10 rounded-full flex items-center justify-center ${
                              selectedMode === 'express' ? 'bg-tpppink/20' : 'bg-slate-200'
                            }`}>
                              <Plane size={18} className={selectedMode === 'express' ? 'text-tpppink' : 'text-slate-500'} />
                            </div>
                            <div className="flex-1">
                              <div className="flex items-center gap-2 mb-1">
                                <p className="text-sm font-semibold text-slate-800">Express Delivery</p>
                              </div>
                              <p className="text-xs text-slate-500">Priority shipping</p>
                            </div>
                          </div>
                          <div className="text-right flex items-center gap-3">
                            <div>
                              <p className="text-base font-bold text-tpppink">
                                {deliveryData.rawData.deliveryOptions.express.estimatedDays}{' '}
                                {deliveryData.rawData.deliveryOptions.express.estimatedDays === 1 ? 'day' : 'days'}
                              </p>
                              {deliveryData.rawData.deliveryOptions.express.deliveryDate && (
                                <p className="text-xs text-slate-500">
                                  by {new Date(deliveryData.rawData.deliveryOptions.express.deliveryDate).toLocaleDateString('en-IN', {
                                    day: 'numeric',
                                    month: 'short'
                                  })}
                                </p>
                              )}
                            </div>
                          </div>
                        </button>

                        {/* Extra Charges - OUTSIDE button but INSIDE border div */}
                        {deliveryData.rawData.deliveryOptions.express.extraCharge >= 0 && (
                          <div className="px-4 pb-4">
                            <div className="pt-3 border-t border-tpppink/20">
                              <div className="flex items-center gap-2">
                                <AlertCircle size={14} className="text-amber-600 flex-shrink-0" />
                                <p className="text-xs text-amber-700">
                                  <span className="font-semibold">Express delivery:</span>{' '}
                                  <span className="font-bold">{deliveryData.rawData.priceDifference.formatted}</span> extra charges apply
                                </p>
                              </div>
                            </div>
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                </div>
              </div>
            )}

            {/* Fallback if no delivery options */}
            {selectedAddress && deliveryData && deliveryData.serviceable && !deliveryData.rawData?.deliveryOptions && deliveryData.estimatedDays && (
              <div className="flex items-start gap-3 p-4 bg-slate-50 border border-slate-200 rounded-lg">
                <Calendar size={18} className="text-slate-600 flex-shrink-0 mt-0.5" />
                <div>
                  <p className="text-sm font-semibold text-slate-800 mb-1">
                    Estimated Delivery: {deliveryData.estimatedDays} days
                  </p>
                  {deliveryData.deliveryDate && (
                    <p className="text-sm text-slate-700">
                      Expected by: {new Date(deliveryData.deliveryDate).toLocaleDateString('en-IN', {
                        day: 'numeric',
                        month: 'short',
                        year: 'numeric'
                      })}
                    </p>
                  )}
                  <p className="text-xs text-slate-600 mt-1">
                    Mode: {deliveryData.mode || 'Standard'}
                  </p>
                </div>
              </div>
            )}
          </div>

        </div>
      </div>
    </div>
  );
};

export default DeliveryDetailsCard;